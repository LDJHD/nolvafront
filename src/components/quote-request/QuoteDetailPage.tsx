"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { Form } from "react-bootstrap";
import { quoteRequestsApi } from "@/lib/api";
import { useEventTypes, getTypeLabel } from "@/lib/useCatalog";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import ReservationPaymentActions from "../user-dashboard/ReservationPaymentActions";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  negotiating: "Discussion en cours",
  accepted: "Devis validé — à payer",
  paid: "Payé",
  declined: "Refusé",
  cancelled: "Annulé",
  completed: "Terminé",
};

const QuoteDetailPage = () => {
  const { id } = useParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const isProvider = user?.role === "provider";
  const { types: eventTypes } = useEventTypes();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = isProvider
        ? await quoteRequestsApi.providerShow(id as string)
        : await quoteRequestsApi.show(id as string);
      setQuote(res.data);
      const price = res.data?.agreedPrice ?? res.data?.agreed_price ?? res.data?.proposedPrice ?? res.data?.proposed_price;
      if (price) setAgreedPrice(String(price));
    } catch {
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [id, isProvider]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      if (isProvider) {
        await quoteRequestsApi.providerPostMessage(id as string, messageText.trim());
      } else {
        await quoteRequestsApi.postMessage(id as string, messageText.trim());
      }
      setMessageText("");
      showSuccessToast("Message envoyé");
      void load();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    } finally {
      setSending(false);
    }
  };

  const acceptQuote = async () => {
    try {
      const res = await quoteRequestsApi.updateStatus(Number(id), {
        status: "accepted",
        agreed_price: agreedPrice ? Number(agreedPrice) : undefined,
      });
      showSuccessToast(res.data?.message || "Devis validé");
      void load();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    }
  };

  const declineQuote = async () => {
    if (!confirm("Refuser cette demande ?")) return;
    try {
      await quoteRequestsApi.updateStatus(Number(id), { status: "declined" });
      showSuccessToast("Demande refusée");
      void load();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    }
  };

  if (loading) return <div className="container py-5 text-center">Chargement...</div>;
  if (!quote) {
    return (
      <div className="container py-5 text-center">
        <p>Demande introuvable.</p>
        <Link href={isProvider ? "/vendor-dashboard" : "/user-dashboard"} className="gi-btn-1">Retour</Link>
      </div>
    );
  }

  const messages = quote.messages || [];
  const reservation = quote.reservation;
  const resPayment = reservation?.paymentStatus || reservation?.payment_status;
  const eventDate = quote.eventDate || quote.event_date;
  const proposedPrice = quote.proposedPrice ?? quote.proposed_price;
  const canProviderAct = isProvider && ["pending", "negotiating"].includes(quote.status);
  const canClientPay = !isProvider && quote.status === "accepted" && reservation && resPayment === "unpaid";

  return (
    <section className="padding-tb-40">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="gi-vendor-dashboard-card p-4">
              <h5>Détails de la demande</h5>
              <p className="mb-1"><strong>Statut :</strong> {statusLabels[quote.status] || quote.status}</p>
              <p className="mb-1"><strong>Événement :</strong> {getTypeLabel(eventTypes, quote.eventType || quote.event_type)}</p>
              <p className="mb-1"><strong>Date :</strong> {eventDate ? new Date(eventDate).toLocaleDateString("fr-FR") : "—"}</p>
              <p className="mb-1"><strong>Horaires :</strong> {(quote.startTime || quote.start_time) || "—"} — {(quote.endTime || quote.end_time) || "—"}</p>
              <p className="mb-1"><strong>Prix proposé :</strong> {proposedPrice ? `${Number(proposedPrice).toLocaleString()} FCFA` : "—"}</p>
              {(quote.agreedPrice || quote.agreed_price) && (
                <p className="mb-1"><strong>Prix convenu :</strong> {Number(quote.agreedPrice || quote.agreed_price).toLocaleString()} FCFA</p>
              )}
              <p className="mb-0 mt-3"><strong>Description initiale :</strong></p>
              <p className="text-muted">{quote.message}</p>

              {canProviderAct && (
                <div className="mt-3 border-top pt-3">
                  <label className="fw-semibold">Prix convenu (FCFA)</label>
                  <Form.Control
                    type="number"
                    className="mb-2"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                  />
                  <button type="button" className="gi-btn-1 w-100 mb-2" onClick={acceptQuote}>
                    Valider le devis
                  </button>
                  <button type="button" className="btn btn-outline-danger w-100" onClick={declineQuote}>
                    Refuser
                  </button>
                </div>
              )}

              {canClientPay && reservation && (
                <div className="mt-3 border-top pt-3">
                  <div className="alert alert-info small">
                    Le prestataire a validé votre devis. Payez sur NOLVA (FedaPay) pour confirmer la prestation.
                  </div>
                  <ReservationPaymentActions reservation={reservation} onUpdated={load} />
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="gi-vendor-dashboard-card p-4">
              <h5>Discussion sur la plateforme</h5>
              <div style={{ maxHeight: 360, overflowY: "auto", marginBottom: 16 }}>
                {messages.length === 0 ? (
                  <p className="text-muted">Aucun message.</p>
                ) : (
                  messages.map((m: any) => (
                    <div
                      key={m.id}
                      className={`mb-2 p-2 rounded ${m.isSystem || m.is_system ? "bg-light border" : ""}`}
                      style={{
                        marginLeft: m.senderRole === "provider" || m.sender_role === "provider" ? 24 : 0,
                        marginRight: m.senderRole === "client" || m.sender_role === "client" ? 24 : 0,
                      }}
                    >
                      <small className="text-muted d-block">
                        {m.isSystem || m.is_system
                          ? "NOLVA"
                          : `${m.sender?.firstName || m.sender?.first_name || ""} ${m.sender?.lastName || m.sender?.last_name || ""}`.trim() || m.senderRole || m.sender_role}
                      </small>
                      <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                    </div>
                  ))
                )}
              </div>
              {!["declined", "cancelled", "completed"].includes(quote.status) && (
                <div className="d-flex gap-2">
                  <Form.Control
                    placeholder="Votre message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  />
                  <button type="button" className="gi-btn-1" disabled={sending} onClick={sendMessage}>
                    Envoyer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteDetailPage;
