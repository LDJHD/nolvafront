"use client";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { reservationsApi, quoteRequestsApi, eventsApi } from "@/lib/api";
import ReservationPaymentActions from "./ReservationPaymentActions";
import { downloadPaymentProof } from "@/lib/downloadPaymentProof";
import Link from "next/link";
import VendorSidebar from "../vendor-sidebar/VendorSidebar";
import { Col, Form, Modal, Row } from "react-bootstrap";
import { emptyTicketRow, type TicketDraft } from "@/lib/eventPublishGuide";
import { useEventTypes } from "@/lib/useCatalog";

const UserDashboard = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("reservations");
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    event_type: "",
    title: "",
    description: "",
    event_date: "",
    city: "",
    location: "",
    image: "",
    expected_participants: "",
    is_free: true,
  });
  const [editTickets, setEditTickets] = useState<TicketDraft[]>([emptyTicketRow()]);
  const [savingEvent, setSavingEvent] = useState(false);
  const [scanEvent, setScanEvent] = useState<any | null>(null);
  const [scanQrCode, setScanQrCode] = useState("");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);
  const [registrationsEvent, setRegistrationsEvent] = useState<any | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const scanVideoRef = useRef<HTMLVideoElement | null>(null);
  const scanStreamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const { types: eventTypes, loading: eventTypesLoading } = useEventTypes();

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [resRes, qRes, tRes, eRes] = await Promise.allSettled([
        reservationsApi.myReservations({ limit: 20 }),
        quoteRequestsApi.myRequests({ limit: 20 }),
        eventsApi.myTickets({ limit: 20 }),
        eventsApi.myEvents({ limit: 20 }),
      ]);
      if (resRes.status === "fulfilled") {
        const d = resRes.value.data;
        setReservations(Array.isArray(d) ? d : d?.data || []);
      }
      if (qRes.status === "fulfilled") {
        const d = qRes.value.data;
        setQuoteRequests(Array.isArray(d) ? d : d?.data || []);
      }
      if (tRes.status === "fulfilled") {
        const d = tRes.value.data;
        setTickets(Array.isArray(d) ? d : d?.data || []);
      }
      if (eRes.status === "fulfilled") {
        const d = eRes.value.data;
        setMyEvents(Array.isArray(d) ? d : d?.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    return () => stopQrCamera();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <p>Connectez-vous pour accéder à votre espace. <Link href="/login">Se connecter</Link></p>
      </div>
    );
  }

  const statusLabel = (status: string) => {
    const map: any = {
      pending: "En attente",
      confirmed: "Confirmée",
      completed: "Terminée",
      cancelled: "Annulée",
      accepted: "Acceptée",
      rejected: "Refusée",
    };
    return map[status] || status;
  };

  const paymentLabel = (status: string) => {
    const map: any = {
      pending: "En attente",
      unpaid: "Non payé",
      deposit_paid: "Acompte payé",
      fully_paid: "Payé (séquestre)",
      paid: "Payé",
      refunded: "Remboursé",
    };
    return map[status] || status;
  };

  const eventDateValue = (event: any) => event.eventDate || event.event_date;
  const isApprovedValue = (event: any) => Boolean(event.isApproved ?? event.is_approved);

  const eventValidationLabel = (event: any) => {
    if (event.status === "cancelled") return "Annule";
    return isApprovedValue(event) ? "Valide par l'admin" : "En attente admin";
  };

  const formatLocalDateForApi = (local: string) => {
    if (!local || !local.includes("T")) return local;
    const [date, time] = local.split("T");
    return `${date} ${time.length === 5 ? `${time}:00` : time}`;
  };

  const eventShareUrl = (event: any) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/evenements/${event.shareSlug || event.share_slug || event.id}`;
  };

  const copyEventLink = async (event: any) => {
    const url = eventShareUrl(event);
    if (!url) return;
    await navigator.clipboard.writeText(url);
    alert("Lien de l'evenement copie.");
  };

  const toDateTimeLocalValue = (value: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.includes(" ") ? value.replace(" ", "T").slice(0, 16) : value;
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const fileToEventImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const max = 1200;
          let w = img.width;
          let h = img.height;
          if (w > max) {
            h = (h * max) / w;
            w = max;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = String(reader.result || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const openEditEvent = (event: any) => {
    if (isApprovedValue(event)) {
      alert("Cet evenement est deja valide par l'admin.");
      return;
    }
    const tickets = event.ticketTypes || event.ticket_types || [];
    setEditingEvent(event);
    setEditForm({
      event_type: event.eventType || event.event_type || "",
      title: event.title || "",
      description: event.description || "",
      event_date: eventDateValue(event) ? toDateTimeLocalValue(eventDateValue(event)) : "",
      city: event.city || "",
      location: event.location || "",
      image: event.image || event.cover_image || "",
      expected_participants: event.expectedParticipants ?? event.expected_participants ?? "",
      is_free: tickets.length === 0 && Number(event.ticketPrice || event.ticket_price || 0) === 0,
    });
    setEditTickets(
      tickets.length > 0
        ? tickets.map((ticket: any) => ({
            label: ticket.label || "",
            price: String(ticket.price ?? ""),
            quantity: String(ticket.quantity ?? ""),
          }))
        : [{ label: "Standard", price: String(event.ticketPrice || event.ticket_price || 0), quantity: String(event.ticketCount || event.ticket_count || 0) }]
    );
  };

  const updateEditTicket = (index: number, field: keyof TicketDraft, value: string) => {
    setEditTickets((prev) => prev.map((ticket, i) => (i === index ? { ...ticket, [field]: value } : ticket)));
  };

  const submitEditEvent = async () => {
    if (!editingEvent) return;
    if (!editForm.title.trim() || !editForm.event_type || !editForm.event_date || !editForm.city.trim()) {
      alert("Completez le type, le titre, la date et la ville.");
      return;
    }
    const ticketTypes = editForm.is_free
      ? []
      : editTickets
          .filter((ticket) => ticket.label.trim())
          .map((ticket) => ({
            label: ticket.label.trim(),
            price: Number(ticket.price) || 0,
            quantity: Number(ticket.quantity) || 0,
          }));
    if (!editForm.is_free && ticketTypes.length === 0) {
      alert("Ajoutez au moins un type de billet.");
      return;
    }
    setSavingEvent(true);
    try {
      await eventsApi.updateMine(editingEvent.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        event_type: editForm.event_type,
        event_date: formatLocalDateForApi(editForm.event_date),
        city: editForm.city.trim(),
        location: editForm.location.trim() || undefined,
        image: editForm.image || undefined,
        ticket_types: ticketTypes,
        ticket_price: editForm.is_free ? 0 : undefined,
        ticket_count: editForm.is_free ? 0 : undefined,
        expected_participants: editForm.is_free
          ? Number(editForm.expected_participants) || 0
          : undefined,
      });
      setEditingEvent(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Impossible de modifier cet evenement.");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleEditEventImageChange = async (file?: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image trop volumineuse (max 3 Mo).");
      return;
    }
    try {
      const image = await fileToEventImage(file);
      setEditForm((prev) => ({ ...prev, image }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Impossible de modifier la photo.");
    }
  };

  const handleRescheduleEvent = async (event: any) => {
    const current = eventDateValue(event)
      ? new Date(eventDateValue(event)).toISOString().slice(0, 16)
      : "";
    const nextDate = window.prompt("Nouvelle date et heure (format AAAA-MM-JJTHH:mm)", current);
    if (!nextDate) return;
    try {
      await eventsApi.rescheduleMine(event.id, { event_date: formatLocalDateForApi(nextDate) });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Impossible de reporter cet evenement.");
    }
  };

  const handleCancelEvent = async (event: any) => {
    if (!window.confirm("Annuler cet evenement ?")) return;
    const reason = window.prompt("Motif d'annulation (optionnel)") || undefined;
    try {
      await eventsApi.cancelMine(event.id, { reason });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Impossible d'annuler cet evenement.");
    }
  };

  const untreatedCount = reservations.filter((r: any) => r.status === "pending").length;

  const downloadTicket = (ticket: any) => {
    const qrCode = ticket.qrCode || ticket.qr_code;
    const ticketCode = ticket.ticketCode || `NOLVA-TICKET-${String(ticket.id).padStart(6, "0")}`;
    downloadPaymentProof({
      title: "Ticket NOLVA",
      subtitle: ticket.event?.title || "Billet evenement",
      fileName: ticketCode,
      qrCode,
      fields: [
        { label: "Ticket unique", value: ticketCode },
        { label: "Numero de transaction", value: ticket.transactionReference || ticket.transaction_reference },
        { label: "Evenement", value: ticket.event?.title },
        { label: "Type", value: ticket.type },
        { label: "Montant", value: ticket.amount ? `${Number(ticket.amount).toLocaleString("fr-FR")} FCFA` : null },
        { label: "Date evenement", value: ticket.event?.event_date ? new Date(ticket.event.event_date).toLocaleDateString("fr-FR") : null },
        { label: "Lieu", value: ticket.event?.location },
        { label: "QR code unique", value: qrCode },
        { label: "Statut", value: ticket.status },
      ],
    });
  };

  const downloadReservationProof = (reservation: any) => {
    const transaction = reservation.payment_transaction || reservation.paymentTransaction;
    downloadPaymentProof({
      title: "Justificatif de prestation NOLVA",
      subtitle: reservation.provider?.businessName || reservation.provider?.business_name || "Prestation",
      fileName: transaction?.proofCode || transaction?.proof_code || `prestation-${reservation.id}`,
      qrCode: transaction?.proofQrCode || transaction?.proof_qr_code,
      fields: [
        { label: "Justificatif unique", value: transaction?.proofCode || transaction?.proof_code },
        { label: "Numero de transaction", value: transaction?.reference },
        { label: "Prestataire", value: reservation.provider?.businessName || reservation.provider?.business_name },
        { label: "Montant", value: (reservation.total_amount ?? reservation.totalAmount) ? `${Number(reservation.total_amount ?? reservation.totalAmount).toLocaleString("fr-FR")} FCFA` : null },
        { label: "Paiement", value: paymentLabel(reservation.payment_status || reservation.paymentStatus) },
        { label: "Statut", value: statusLabel(reservation.status) },
        { label: "QR code unique", value: transaction?.proofQrCode || transaction?.proof_qr_code },
      ],
    });
  };

  const escapeCell = (value: unknown) =>
    String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const downloadEventSales = async (event: any) => {
    try {
      const res = await eventsApi.ticketSales(event.id);
      const sales = res.data?.sales || [];
      const htmlRows = sales
        .map((sale: any) => {
          const client = `${sale.client?.firstName || ""} ${sale.client?.lastName || ""}`.trim();
          return `<tr>
            <td>${escapeCell(sale.ticketCode)}</td>
            <td>${sale.qrCode ? `<img alt="QR" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(sale.qrCode)}" width="90" height="90"><br><code>${escapeCell(sale.qrCode)}</code>` : ""}</td>
            <td>${escapeCell(sale.transactionReference)}</td>
            <td>${escapeCell(client)}</td>
            <td>${escapeCell(sale.type)}</td>
            <td>${escapeCell(sale.amount ? `${Number(sale.amount).toLocaleString("fr-FR")} FCFA` : "")}</td>
            <td>${escapeCell(sale.status)}</td>
          </tr>`;
        })
        .join("");
      const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Ventes ${escapeCell(event.title)}</title><body><h1>Historique tickets - ${escapeCell(event.title)}</h1><table border="1" cellpadding="8" cellspacing="0"><thead><tr><th>Ticket</th><th>QR code</th><th>Transaction</th><th>Client</th><th>Type</th><th>Montant</th><th>Statut</th></tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ventes-tickets-${event.id}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Impossible de telecharger l'historique des tickets.");
    }
  };

  const stopQrCamera = () => {
    if (scanLoopRef.current) {
      window.clearInterval(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    scanStreamRef.current?.getTracks().forEach((track) => track.stop());
    scanStreamRef.current = null;
    setScanning(false);
  };

  const validateQrCode = async (qrCode: string) => {
    if (!scanEvent || !qrCode.trim()) return;
    stopQrCamera();
    try {
      const res = await eventsApi.scanTicket(scanEvent.id, { qr_code: qrCode.trim() });
      setScanResult({ ok: true, ...res.data });
      setScanQrCode("");
    } catch (err: any) {
      setScanResult({
        ok: false,
        message: err.response?.data?.message || "Ticket non valide pour cet evenement.",
        ticket: err.response?.data?.ticket,
      });
    }
  };

  const openScanTicket = (event: any) => {
    setScanEvent(event);
    setScanQrCode("");
    setScanResult(null);
  };

  const isFreeEventValue = (event: any) => {
    const t = event.ticketTypes || event.ticket_types || [];
    return t.length > 0
      ? t.every((x: any) => Number(x.price ?? x.ticket_price ?? 0) <= 0)
      : Number(event.ticketPrice ?? event.ticket_price ?? 0) <= 0;
  };

  const openRegistrations = async (event: any) => {
    setRegistrationsEvent(event);
    setRegistrations([]);
    setRegistrationsLoading(true);
    try {
      const res = await eventsApi.eventRegistrations(event.id);
      setRegistrations(res.data?.registrations || []);
    } catch {
      setRegistrations([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const closeScanTicket = () => {
    stopQrCamera();
    setScanEvent(null);
    setScanQrCode("");
    setScanResult(null);
  };

  const startQrCamera = async () => {
    if (!scanEvent || scanning) return;
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    if (!BarcodeDetectorCtor) {
      setScanResult({ ok: false, message: "Votre navigateur ne permet pas le scan automatique. Saisissez le code QR manuellement." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      scanStreamRef.current = stream;
      setScanning(true);
      if (scanVideoRef.current) {
        scanVideoRef.current.srcObject = stream;
        await scanVideoRef.current.play();
      }
      const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
      scanLoopRef.current = window.setInterval(async () => {
        if (!scanVideoRef.current) return;
        try {
          const codes = await detector.detect(scanVideoRef.current);
          const value = codes?.[0]?.rawValue;
          if (value) {
            await validateQrCode(value);
          }
        } catch {
          // Le scan continue jusqu'a detection ou arret manuel.
        }
      }, 700);
    } catch {
      stopQrCamera();
      setScanResult({ ok: false, message: "Camera indisponible. Saisissez le code QR manuellement." });
    }
  };

  return (
    <>
    <section className="gi-vendor-dashboard padding-tb-40">
      <div className="container">
        <Row className="mb-minus-24px">
          <Col lg={3} md={12} className="mb-24">
            <div className="gi-sidebar-wrap gi-border-box gi-sticky-sidebar">
              <div className="gi-vendor-block-items">
                <div style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                  <div className="nolva-provider-avatar" style={{ width: "70px", height: "70px", fontSize: "28px", margin: "0 auto 10px" }}>
                    <span className="nolva-provider-initials">
                      {(user?.firstName || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h6 style={{ margin: 0 }}>{user?.firstName} {user?.lastName}</h6>
                  <small style={{ color: "#999" }}>{user?.email}</small>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("reservations"); }}
                      style={{ display: "block", padding: "12px 20px", background: activeTab === "reservations" ? "var(--nolva-red-glow)" : "transparent", color: activeTab === "reservations" ? "var(--nolva-primary)" : "#333", fontWeight: activeTab === "reservations" ? 600 : 400, borderLeft: activeTab === "reservations" ? "3px solid var(--nolva-primary)" : "3px solid transparent" }}
                    >
                      Mes Réservations
                      {untreatedCount > 0 && <span className="nolva-sidebar-alert">{untreatedCount}</span>}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("quotes"); }}
                      style={{ display: "block", padding: "12px 20px", background: activeTab === "quotes" ? "var(--nolva-red-glow)" : "transparent", color: activeTab === "quotes" ? "var(--nolva-primary)" : "#333", fontWeight: activeTab === "quotes" ? 600 : 400, borderLeft: activeTab === "quotes" ? "3px solid var(--nolva-primary)" : "3px solid transparent" }}
                    >
                      Mes Demandes de devis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("tickets"); }}
                      style={{ display: "block", padding: "12px 20px", background: activeTab === "tickets" ? "var(--nolva-red-glow)" : "transparent", color: activeTab === "tickets" ? "var(--nolva-primary)" : "#333", fontWeight: activeTab === "tickets" ? 600 : 400, borderLeft: activeTab === "tickets" ? "3px solid var(--nolva-primary)" : "3px solid transparent" }}
                    >
                      Mes Billets
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("events"); }}
                      style={{ display: "block", padding: "12px 20px", background: activeTab === "events" ? "var(--nolva-red-glow)" : "transparent", color: activeTab === "events" ? "var(--nolva-primary)" : "#333", fontWeight: activeTab === "events" ? 600 : 400, borderLeft: activeTab === "events" ? "3px solid var(--nolva-primary)" : "3px solid transparent" }}
                    >
                      Mes Evenements
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/user-profile"
                      style={{ display: "block", padding: "12px 20px", color: "#333" }}
                    >
                      Mon Profil
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Col>

          <Col lg={9} md={12} className="mb-24">
            {/* Résumé */}
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <div className="gi-vendor-dashboard-sort-card">
                  <h5>Réservations</h5>
                  <h3 style={{ color: "var(--nolva-red, var(--nolva-primary))" }}>{loading ? "..." : reservations.length}</h3>
                </div>
              </Col>
              <Col md={4} className="mb-3">
                <div className="gi-vendor-dashboard-sort-card">
                  <h5>Demandes de devis</h5>
                  <h3>{loading ? "..." : quoteRequests.length}</h3>
                </div>
              </Col>
              <Col md={4} className="mb-3">
                <div className="gi-vendor-dashboard-sort-card">
                  <h5>Billets</h5>
                  <h3>{loading ? "..." : tickets.length}</h3>
                </div>
              </Col>
              <Col md={4} className="mb-3">
                <div className="gi-vendor-dashboard-sort-card">
                  <h5>Evenements crees</h5>
                  <h3>{loading ? "..." : myEvents.length}</h3>
                </div>
              </Col>
            </Row>

            {/* Contenu selon tab */}
            {activeTab === "reservations" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Mes Réservations</h5>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : reservations.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucune réservation pour le moment.</p>
                        <Link href="/prestataires" className="gi-btn-1">Trouver un prestataire</Link>
                      </div>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Prestataire</th>
                            <th>Montant</th>
                            <th>Acompte</th>
                            <th>Paiement</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map((r: any, i: number) => (
                            <tr key={i}>
                              <td>{r.provider?.businessName || r.service_provider?.business_name || "Prestataire"}</td>
                              <td>{(r.total_amount ?? r.totalAmount)?.toLocaleString()} FCFA</td>
                              <td>{(r.deposit_amount ?? r.depositAmount)?.toLocaleString()} FCFA</td>
                              <td>
                                <span className="nolva-status-badge">{paymentLabel(r.payment_status || r.paymentStatus)}</span>
                              </td>
                              <td>
                                {r.status === "pending" && <i className="fi fi-rr-exclamation text-danger me-1" title="Réservation non traitée"></i>}
                                <span className="nolva-status-badge">{statusLabel(r.status)}</span>
                              </td>
                              <td>
                                <ReservationPaymentActions reservation={r} onUpdated={fetchData} />
                                {((r.payment_transaction || r.paymentTransaction)?.proofCode ||
                                  (r.payment_transaction || r.paymentTransaction)?.proof_code) && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm mt-1"
                                    onClick={() => downloadReservationProof(r)}
                                  >
                                    Telecharger
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quotes" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Mes Demandes de devis</h5>
                  <div className="gi-header-btn">
                    <Link className="gi-btn-2" href="/demande-devis">Nouvelle demande</Link>
                  </div>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : quoteRequests.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucune demande de devis.</p>
                        <Link href="/demande-devis" className="gi-btn-1">Faire une demande</Link>
                      </div>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Événement</th>
                            <th>Date</th>
                            <th>Budget</th>
                            <th>Ville</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteRequests.map((q: any) => (
                            <tr key={q.id}>
                              <td>{q.eventType || q.event_type}</td>
                              <td>{q.eventDate || q.event_date ? new Date(q.eventDate || q.event_date).toLocaleDateString("fr-FR") : "-"}</td>
                              <td>{(q.proposedPrice ?? q.proposed_price ?? q.budget) ? `${Number(q.proposedPrice ?? q.proposed_price ?? q.budget).toLocaleString()} FCFA` : "-"}</td>
                              <td>{q.location || "-"}</td>
                              <td>
                                <span className="nolva-status-badge">{statusLabel(q.status)}</span>
                                <Link href={`/devis/${q.id}`} className="d-block small mt-1">Voir / discuter</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Mes Billets</h5>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : tickets.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucun billet acheté.</p>
                        <Link href="/evenements" className="gi-btn-1">Voir les événements</Link>
                      </div>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Événement</th>
                            <th>Date</th>
                            <th>Lieu</th>
                            <th>Quantité</th>
                            <th>Code QR</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tickets.map((t: any, i: number) => (
                            <tr key={i}>
                              <td>{t.event?.title || "Événement"}</td>
                              <td>{t.event?.event_date ? new Date(t.event.event_date).toLocaleDateString("fr-FR") : "-"}</td>
                              <td>{t.event?.location || "-"}</td>
                              <td>{t.quantity || 1}</td>
                              <td>
                                {t.qr_code || t.qrCode ? (
                                  <span style={{ fontFamily: "monospace", fontSize: "12px", background: "#f5f5f5", padding: "3px 8px", borderRadius: "4px" }}>
                                    {t.qr_code || t.qrCode}
                                  </span>
                                ) : "-"}
                              </td>
                              <td>
                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => downloadTicket(t)}>
                                  Telecharger
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "events" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Mes Evenements</h5>
                  <div className="gi-header-btn">
                    <Link className="gi-btn-2" href="/evenements/creer">Publier un evenement</Link>
                  </div>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : myEvents.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucun evenement cree pour le moment.</p>
                        <Link href="/evenements/creer" className="gi-btn-1">Publier un evenement</Link>
                      </div>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Evenement</th>
                            <th>Date</th>
                            <th>Ville</th>
                            <th>Validation</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myEvents.map((event: any) => (
                            <tr key={event.id}>
                              <td>
                                <strong>{event.title}</strong>
                                {event.rejectionReason || event.rejection_reason ? (
                                  <span className="d-block small text-danger">
                                    Motif : {event.rejectionReason || event.rejection_reason}
                                  </span>
                                ) : null}
                              </td>
                              <td>{eventDateValue(event) ? new Date(eventDateValue(event)).toLocaleDateString("fr-FR") : "-"}</td>
                              <td>{event.city || "-"}</td>
                              <td>
                                <span className="nolva-status-badge">{eventValidationLabel(event)}</span>
                              </td>
                              <td>
                                <span className="nolva-status-badge">{statusLabel(event.status)}</span>
                              </td>
                              <td>
                                <div className="d-flex gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => void copyEventLink(event)}
                                  >
                                    Copier lien
                                  </button>
                                  {isApprovedValue(event) && event.status !== "cancelled" && (
                                    <Link href={`/evenements/${event.id}`} className="btn btn-outline-secondary btn-sm">
                                      Voir
                                    </Link>
                                  )}
                                  {event.status !== "completed" && event.status !== "cancelled" && (
                                    <>
                                      <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => void handleRescheduleEvent(event)}
                                      >
                                        Reporter
                                      </button>
                                      {!isApprovedValue(event) && (
                                        <>
                                          <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => openEditEvent(event)}
                                          >
                                            Modifier
                                          </button>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => void handleCancelEvent(event)}
                                      >
                                        Annuler
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => void downloadEventSales(event)}
                                  >
                                    Telecharger ventes
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => openScanTicket(event)}
                                  >
                                    Scanner QR
                                  </button>
                                  {isFreeEventValue(event) && event.status !== "cancelled" && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() => void openRegistrations(event)}
                                    >
                                      Voir les inscrits
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </section>

    <Modal show={Boolean(editingEvent)} onHide={() => setEditingEvent(null)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifier l&apos;evenement</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Type d&apos;evenement *</Form.Label>
            <Form.Select
              value={editForm.event_type}
              onChange={(e) => setEditForm({ ...editForm, event_type: e.target.value })}
              disabled={eventTypesLoading}
            >
              <option value="">Choisir un type</option>
              {eventTypes.map((type) => (
                <option key={type.slug} value={type.slug}>{type.label}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>Titre *</Form.Label>
            <Form.Control value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          </Col>
          <Col md={12}>
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={5} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </Col>
          <Col md={6}>
            <Form.Label>Date et heure *</Form.Label>
            <Form.Control type="datetime-local" value={editForm.event_date} onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })} />
          </Col>
          <Col md={6}>
            <Form.Label>Ville *</Form.Label>
            <Form.Control value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
          </Col>
          <Col md={12}>
            <Form.Label>Lieu</Form.Label>
            <Form.Control value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
          </Col>
          <Col md={12}>
            <Form.Label>Photo de l&apos;evenement</Form.Label>
            <div className="d-flex flex-wrap align-items-center gap-3">
              {editForm.image ? (
                <img src={editForm.image} alt="Photo actuelle" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }} />
              ) : (
                <div style={{ width: 120, height: 80, border: "1px dashed #ccc", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>
                  Aucune photo
                </div>
              )}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => void handleEditEventImageChange((e.currentTarget as HTMLInputElement).files?.[0])}
                style={{ maxWidth: 360 }}
              />
            </div>
          </Col>
          <Col md={12}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
              <h6 className="mb-0">Billets</h6>
              <Form.Check
                type="switch"
                id="edit-free-event"
                label="Evenement gratuit"
                checked={editForm.is_free}
                onChange={(e) => setEditForm({ ...editForm, is_free: e.target.checked })}
              />
            </div>
          </Col>
          {editForm.is_free && (
            <Col md={12}>
              <Form.Label>Nombre de participants attendus</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={editForm.expected_participants}
                onChange={(e) =>
                  setEditForm({ ...editForm, expected_participants: e.target.value })
                }
                placeholder="Ex : 150"
              />
              <Form.Text className="text-muted">
                Sera affiche sur la fiche publique (« X participants attendus »).
              </Form.Text>
            </Col>
          )}
          {!editForm.is_free && (
            <Col md={12}>
              {editTickets.map((ticket, index) => (
                <Row className="g-2 mb-2 align-items-end" key={index}>
                  <Col md={4}>
                    <Form.Label>Libelle</Form.Label>
                    <Form.Control value={ticket.label} onChange={(e) => updateEditTicket(index, "label", e.target.value)} />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Prix (FCFA)</Form.Label>
                    <Form.Control type="number" min={0} value={ticket.price} onChange={(e) => updateEditTicket(index, "price", e.target.value)} />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Places</Form.Label>
                    <Form.Control type="number" min={0} value={ticket.quantity} onChange={(e) => updateEditTicket(index, "quantity", e.target.value)} />
                  </Col>
                  <Col md={2}>
                    <button type="button" className="btn btn-outline-danger btn-sm w-100" disabled={editTickets.length <= 1} onClick={() => setEditTickets((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index))}>
                      Retirer
                    </button>
                  </Col>
                </Row>
              ))}
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditTickets((prev) => [...prev, emptyTicketRow()])}>
                + Ajouter un type de billet
              </button>
            </Col>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingEvent(null)}>Annuler</button>
        <button type="button" className="gi-btn-1" onClick={() => void submitEditEvent()} disabled={savingEvent}>
          {savingEvent ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </Modal.Footer>
    </Modal>

    <Modal show={Boolean(scanEvent)} onHide={closeScanTicket} centered>
      <Modal.Header closeButton>
        <Modal.Title>Scanner un ticket</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="small text-muted mb-3">{scanEvent?.title}</p>
        <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden", background: "#111" }}>
          <video ref={scanVideoRef} playsInline muted style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: scanning ? "block" : "none" }} />
          {!scanning && <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Camera en attente</div>}
        </div>
        <div className="d-flex gap-2 mt-3">
          <button type="button" className="gi-btn-1" onClick={() => void startQrCamera()} disabled={scanning}>Scanner avec la camera</button>
          {scanning && <button type="button" className="btn btn-outline-secondary" onClick={stopQrCamera}>Arreter</button>}
        </div>
        <Form.Label className="mt-3">Code QR manuel</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control value={scanQrCode} onChange={(e) => setScanQrCode(e.target.value)} placeholder="Coller ou saisir le code QR" />
          <button type="button" className="btn btn-outline-success" onClick={() => void validateQrCode(scanQrCode)}>Valider</button>
        </div>
        {scanResult && (
          <div className={`alert mt-3 ${scanResult.ok ? "alert-success" : "alert-danger"}`}>
            <strong>{scanResult.ok ? "Ticket valide" : "Validation refusee"}</strong>
            <div>{scanResult.message}</div>
            {scanResult.ticket && (
              <div className="small mt-2">
                <div>Ticket : {scanResult.ticket.ticketCode}</div>
                {scanResult.ticket.client && <div>Client : {scanResult.ticket.client.firstName} {scanResult.ticket.client.lastName}</div>}
                {scanResult.ticket.scannedAt && <div>Valide le : {new Date(scanResult.ticket.scannedAt).toLocaleString("fr-FR")}</div>}
              </div>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>

    <Modal show={Boolean(registrationsEvent)} onHide={() => setRegistrationsEvent(null)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Inscrits à l&apos;événement gratuit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="small text-muted mb-3">{registrationsEvent?.title}</p>
        {registrationsLoading ? (
          <p>Chargement...</p>
        ) : registrations.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#999" }}>
            Aucune inscription pour le moment.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table gi-vender-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Numéro</th>
                  <th>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r: any, index: number) => (
                  <tr key={r.id}>
                    <td>{index + 1}</td>
                    <td>{r.lastName || r.last_name || "—"}</td>
                    <td>{r.firstName || r.first_name || "—"}</td>
                    <td>{r.phone || "—"}</td>
                    <td>
                      {r.createdAt || r.created_at
                        ? new Date(r.createdAt || r.created_at).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setRegistrationsEvent(null)}>
          Fermer
        </button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default UserDashboard;
