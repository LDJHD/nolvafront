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
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleBuyTicket = async () => {
    if (!event) return;
    setBuying(true);
    try {
      const ticketTypes = event.ticket_types || event.ticketTypes || [];
      const payload: {
        event_id: number;
        quantity: number;
        ticket_type_id?: number;
        type?: string;
      } = { event_id: event.id, quantity };
      if (ticketTypes.length > 0) {
        if (!selectedTicketTypeId) {
          toast.error("Choisissez un type de billet");
          setBuying(false);
          return;
        }
        payload.ticket_type_id = selectedTicketTypeId;
      } else {
        payload.type = "standard";
      }
      const res = await paymentsApi.buyTicket(payload);
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
      .then((data) => {
        setEvent(data);
        const types = data.ticket_types || data.ticketTypes || [];
        if (types.length > 0) setSelectedTicketTypeId(types[0].id);
      })
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

  const ticketTypes: {
    id: number;
    label: string;
    price: number;
    available?: number;
    quantity?: number;
    sold?: number;
  }[] = event.ticket_types || event.ticketTypes || [];

  const selectedType = ticketTypes.find((t) => t.id === selectedTicketTypeId);
  const unitPrice = selectedType
    ? Number(selectedType.price)
    : Number(event.ticketPrice || event.ticket_price || 0);
  const isFreeTicket = unitPrice <= 0;

  const availableTickets =
    ticketTypes.length > 0
      ? selectedType
        ? selectedType.available === 999999
          ? 999
          : (selectedType.available ?? 0)
        : null
      : event.availableTickets ?? null;
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
                    <span className="label">
                      {ticketTypes.length > 1 ? "Tarifs" : "Prix du billet"}
                    </span>
                    <span className="price">
                      {ticketTypes.length > 0 ? (
                        ticketTypes.length === 1 ? (
                          Number(ticketTypes[0].price) > 0 ? (
                            `${Number(ticketTypes[0].price).toLocaleString("fr-FR")} FCFA`
                          ) : (
                            "Gratuit"
                          )
                        ) : (
                          <span style={{ fontSize: "14px" }}>
                            {ticketTypes
                              .map(
                                (t) =>
                                  Number(t.price) > 0
                                    ? `${t.label} : ${Number(t.price).toLocaleString("fr-FR")} FCFA`
                                    : `${t.label} : Gratuit`
                              )
                              .join(" · ")}
                          </span>
                        )
                      ) : event.ticketPrice || event.ticket_price ? (
                        `${Number(event.ticketPrice || event.ticket_price).toLocaleString("fr-FR")} FCFA`
                      ) : (
                        "Gratuit"
                      )}
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
                        {ticketTypes.length > 0 ? (
                          <>
                            <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>
                              Type de billet *
                            </label>
                            <select
                              className="form-select mb-2"
                              value={selectedTicketTypeId ?? ""}
                              onChange={(e) =>
                                setSelectedTicketTypeId(Number(e.target.value) || null)
                              }
                              style={{ borderRadius: "8px", fontSize: "14px" }}
                            >
                              {ticketTypes.map((t) => (
                                <option key={t.id} value={t.id} disabled={(t.available ?? 0) === 0}>
                                  {t.label} — {Number(t.price).toLocaleString("fr-FR")} FCFA
                                  {(t.available ?? 0) > 0 && t.available !== 999999
                                    ? ` (${t.available} restants)`
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : null}
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
                      {unitPrice > 0 ? (
                        <p style={{ fontSize: "13px", fontWeight: 600, margin: "8px 0" }}>
                          Total : {(unitPrice * quantity).toLocaleString("fr-FR")} FCFA
                          {selectedType?.label ? ` (${selectedType.label})` : ""}
                        </p>
                      ) : null}
                      {!isFreeTicket ? (
                        <p style={{ fontSize: "12px", color: "var(--nolva-gray)", margin: "8px 0" }}>
                          <i className="fi fi-rr-shield-check" style={{ color: "#059669" }}></i>{" "}
                          Paiement securise via NOLVA (FedaPay).{" "}
                          <Link href="/politique-nolva" style={{ fontSize: "12px" }}>
                            En savoir plus
                          </Link>
                        </p>
                      ) : null}
                      <button
                        className="gi-btn-1 nolva-btn-reserve w-100"
                        onClick={handleBuyTicket}
                        disabled={buying}
                      >
                        {buying ? (
                          <><Spinner /> Traitement...</>
                        ) : (
                          <><i className="fi fi-rr-ticket"></i> {isFreeTicket ? "Obtenir un billet gratuit" : "Acheter un billet"}</>
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
