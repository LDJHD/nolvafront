"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { reservationsApi, quoteRequestsApi, eventsApi } from "@/lib/api";
import ReservationPaymentActions from "./ReservationPaymentActions";
import { downloadPaymentProof } from "@/lib/downloadPaymentProof";
import Link from "next/link";
import VendorSidebar from "../vendor-sidebar/VendorSidebar";
import { Col, Row } from "react-bootstrap";

const UserDashboard = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("reservations");
  const [loading, setLoading] = useState(true);

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
            <td>${escapeCell(sale.client?.email)}</td>
            <td>${escapeCell(sale.type)}</td>
            <td>${escapeCell(sale.amount ? `${Number(sale.amount).toLocaleString("fr-FR")} FCFA` : "")}</td>
            <td>${escapeCell(sale.status)}</td>
          </tr>`;
        })
        .join("");
      const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Ventes ${escapeCell(event.title)}</title><body><h1>Historique tickets - ${escapeCell(event.title)}</h1><table border="1" cellpadding="8" cellspacing="0"><thead><tr><th>Ticket</th><th>QR code</th><th>Transaction</th><th>Client</th><th>Email</th><th>Type</th><th>Montant</th><th>Statut</th></tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
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

  return (
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
                    <Link className="gi-btn-2" href="/evenements/creer">Nouvel evenement</Link>
                  </div>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : myEvents.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucun evenement cree pour le moment.</p>
                        <Link href="/evenements/creer" className="gi-btn-1">Creer un evenement</Link>
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
  );
};

export default UserDashboard;
