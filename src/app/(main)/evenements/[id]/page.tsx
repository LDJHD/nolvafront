"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import Spinner from "@/components/button/Spinner";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { paymentsApi } from "@/lib/api";
import { toast } from "react-toastify";

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ticketType, setTicketType] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleBuyTicket = async () => {
    if (!event) return;
    setBuying(true);
    try {
      const res = await paymentsApi.buyTicket({
        event_id: event.id,
        type: ticketType,
        quantity,
      });
      const data = res.data;
      if (data.paymentUrl) {
        // Redirection vers FedaPay
        window.location.href = data.paymentUrl;
      } else if (data.ticket) {
        // Ticket gratuit ou sandbox confirmé directement
        toast.success(data.message || "Billet obtenu !");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'achat");
    } finally {
      setBuying(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setEvent(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );

  if (error || !event)
    return (
      <div className="container py-5 text-center">
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>
          <i className="fi fi-rr-calendar-exclamation"></i>
        </div>
        <h4>Evenement introuvable</h4>
        <p style={{ color: "#999", marginBottom: "20px" }}>
          Cet evenement n&apos;existe pas ou a ete supprime.
        </p>
        <Link href="/evenements" className="gi-btn-1">
          Voir tous les evenements
        </Link>
      </div>
    );

  const availableTickets = event.availableTickets ?? null;
  const eventDate = event.eventDate || event.event_date;
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date a confirmer";

  const formattedTime = eventDate
    ? new Date(eventDate).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <>
      <Breadcrumb title={event.title || "Evenement"} />

      {/* Hero evenement */}
      <section className="nolva-event-hero">
        <div className="container">
          <div className="row align-items-center g-4">
            {/* Image ou placeholder */}
            <div className="col-lg-6">
              <div className="nolva-event-hero-image">
                {event.image || event.cover_image ? (
                  <img
                    src={event.image || event.cover_image}
                    alt={event.title}
                  />
                ) : (
                  <div className="nolva-event-hero-placeholder">
                    <i className="fi fi-rr-calendar-star"></i>
                    <span>{event.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Infos */}
            <div className="col-lg-6">
              <div className="nolva-event-hero-info">
                <span className="nolva-event-status-badge">
                  {event.status === "upcoming"
                    ? "A venir"
                    : event.status === "ongoing"
                      ? "En cours"
                      : event.status}
                </span>
                <h1 className="nolva-event-hero-title">{event.title}</h1>

                <div className="nolva-event-hero-meta">
                  <div className="nolva-event-meta-item">
                    <i className="fi fi-rr-calendar"></i>
                    <div>
                      <strong>Date</strong>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  {formattedTime && (
                    <div className="nolva-event-meta-item">
                      <i className="fi fi-rr-clock"></i>
                      <div>
                        <strong>Heure</strong>
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  )}
                  <div className="nolva-event-meta-item">
                    <i className="fi fi-rr-marker"></i>
                    <div>
                      <strong>Lieu</strong>
                      <span>
                        {event.location || event.city || "Benin"}
                      </span>
                    </div>
                  </div>
                  {event.organizer && (
                    <div className="nolva-event-meta-item">
                      <i className="fi fi-rr-user"></i>
                      <div>
                        <strong>Organisateur</strong>
                        <span>
                          {event.organizer.first_name ||
                            event.organizer.firstName}{" "}
                          {event.organizer.last_name ||
                            event.organizer.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prix et billets */}
                <div className="nolva-event-ticket-box">
                  <div className="nolva-event-price-display">
                    <span className="label">Prix du billet</span>
                    <span className="price">
                      {event.ticketPrice || event.ticket_price
                        ? `${Number(event.ticketPrice || event.ticket_price).toLocaleString()} FCFA`
                        : "Gratuit"}
                    </span>
                  </div>
                  {availableTickets !== null && (
                    <div className="nolva-event-tickets-left">
                      <div className="progress-bar-wrapper">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(100, ((event.ticketsSold || event.tickets_sold || 0) / (event.ticketCount || event.ticket_count || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span>
                        {availableTickets > 0
                          ? `${availableTickets} places restantes`
                          : "Complet"}
                      </span>
                    </div>
                  )}
                  {availableTickets !== 0 && isAuthenticated ? (
                    <>
                      <div className="mt-3 mb-2">
                        <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Type de billet</label>
                        <select
                          className="form-select mb-2"
                          value={ticketType}
                          onChange={(e) => setTicketType(e.target.value)}
                          style={{ borderRadius: "8px", fontSize: "14px" }}
                        >
                          <option value="standard">Standard</option>
                          <option value="vip">VIP</option>
                          <option value="couple">Couple</option>
                          <option value="solo">Solo</option>
                        </select>
                        <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Quantité</label>
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          max={20}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                          style={{ borderRadius: "8px", fontSize: "14px" }}
                        />
                      </div>
                      {event.ticketPrice || event.ticket_price ? (
                        <p style={{ fontSize: "13px", fontWeight: 600, margin: "8px 0" }}>
                          Total :{" "}
                          {(
                            Number(event.ticketPrice || event.ticket_price) * quantity
                          ).toLocaleString()}{" "}
                          FCFA
                        </p>
                      ) : null}
                      <p style={{ fontSize: "12px", color: "var(--nolva-gray)", margin: "8px 0" }}>
                        <i className="fi fi-rr-shield-check" style={{ color: "#059669" }}></i>{" "}
                        Paiement sécurisé via NOLVA (FedaPay).{" "}
                        <Link href="/politique-nolva" style={{ fontSize: "12px" }}>
                          En savoir plus
                        </Link>
                      </p>
                      <button
                        className="gi-btn-1 w-100"
                        onClick={handleBuyTicket}
                        disabled={buying}
                      >
                        {buying ? (
                          <><Spinner /> Traitement...</>
                        ) : (
                          <><i className="fi fi-rr-ticket"></i> Acheter un billet</>
                        )}
                      </button>
                    </>
                  ) : !isAuthenticated ? (
                    <Link href="/login" className="gi-btn-1 w-100 mt-3 d-block text-center">
                      Connexion pour acheter
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {event.description && (
        <section className="padding-tb-40">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <div className="gi-vendor-dashboard-card">
                  <div className="gi-vendor-card-header">
                    <h5>A propos de cet evenement</h5>
                  </div>
                  <div className="gi-vendor-card-body">
                    <p
                      style={{
                        color: "#4b5966",
                        lineHeight: "1.8",
                        fontSize: "15px",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="gi-vendor-dashboard-card">
                  <div className="gi-vendor-card-header">
                    <h5>Informations pratiques</h5>
                  </div>
                  <div className="gi-vendor-card-body">
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <li className="mb-3">
                        <i
                          className="fi fi-rr-calendar me-2"
                          style={{ color: "var(--nolva-red)" }}
                        ></i>
                        <strong>Date :</strong> {formattedDate}
                      </li>
                      {formattedTime && (
                        <li className="mb-3">
                          <i
                            className="fi fi-rr-clock me-2"
                            style={{ color: "var(--nolva-red)" }}
                          ></i>
                          <strong>Heure :</strong> {formattedTime}
                        </li>
                      )}
                      <li className="mb-3">
                        <i
                          className="fi fi-rr-marker me-2"
                          style={{ color: "var(--nolva-red)" }}
                        ></i>
                        <strong>Lieu :</strong>{" "}
                        {event.location || "Non precise"}
                      </li>
                      <li className="mb-3">
                        <i
                          className="fi fi-rr-map me-2"
                          style={{ color: "var(--nolva-red)" }}
                        ></i>
                        <strong>Ville :</strong>{" "}
                        {event.city || "Non precisee"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default EventDetailPage;
