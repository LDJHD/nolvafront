"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { eventsApi } from "@/lib/api";
import { normalizeList } from "@/lib/nolvaData";
import { useEventTypes, getTypeLabel } from "@/lib/useCatalog";
import Link from "next/link";
import { Col, Row } from "react-bootstrap";

const cities = ["", "Cotonou", "Calavi", "Porto-Novo", "Parakou", "Abomey", "Ouidah"];

const EventsList = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { types: eventTypesCatalog } = useEventTypes();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params: any = {};
        if (cityFilter) params.city = cityFilter;
        if (typeFilter) params.type = typeFilter;
        const res = await eventsApi.list(params);
        setEvents(normalizeList(res.data));
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [cityFilter, typeFilter]);

  return (
    <section className="padding-tb-40">
      <div className="container">
        <div className="nolva-providers-filters" style={{ marginBottom: "30px", flexWrap: "wrap" }}>
          <h5 style={{ margin: 0, marginRight: "15px" }}>Evenements a venir</h5>
          {isAuthenticated ? (
            <>
              <Link href="/evenements/publier" className="gi-btn-1" style={{ marginLeft: "auto" }}>
                <i className="fi fi-rr-rocket"></i> Publier un événement
              </Link>
              <Link href="/evenements/creer" className="gi-btn-2">
                <i className="fi fi-rr-plus-small"></i> Créer (validation)
              </Link>
            </>
          ) : (
            <Link href="/login" className="gi-btn-2" style={{ marginLeft: "auto" }}>
              Se connecter pour créer un événement
            </Link>
          )}
          <select
            className="nolva-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tous les types</option>
            {eventTypesCatalog.map((t) => (
              <option key={t.slug} value={t.slug}>{t.label}</option>
            ))}
          </select>
          <select
            className="nolva-filter-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">Toutes les villes</option>
            {cities.filter(Boolean).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#999" }}>Chargement des evenements...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="nolva-empty-state">
            <i className="fi fi-rr-calendar"></i>
            <h5>Aucun evenement pour le moment</h5>
            <p>Les prochains evenements seront affiches ici.</p>
          </div>
        ) : (
          <Row>
            {events.map((event: any, index: number) => {
              const dateStr = event.eventDate || event.event_date;
              const price = Number(event.ticketPrice ?? event.ticket_price ?? 0);

              return (
                <Col lg={4} md={6} className="mb-4" key={event.id || index}>
                  <div className="nolva-event-card" style={{ height: "100%" }}>
                    <div className="nolva-event-image">
                      {event.image || event.cover_image ? (
                        <img src={event.image || event.cover_image} alt={event.title} />
                      ) : (
                        <div className="nolva-event-placeholder">
                          <i className="fi fi-rr-calendar-star"></i>
                        </div>
                      )}
                      <div className="nolva-event-date-badge">
                        <span className="day">
                          {dateStr ? new Date(dateStr).getDate() : "--"}
                        </span>
                        <span className="month">
                          {dateStr
                            ? new Date(dateStr).toLocaleDateString("fr-FR", { month: "short" })
                            : ""}
                        </span>
                      </div>
                      {price > 0 ? (
                        <span className="nolva-event-price-tag">
                          {price.toLocaleString()} FCFA
                        </span>
                      ) : (
                        <span className="nolva-event-price-tag free">Gratuit</span>
                      )}
                    </div>
                    <div className="nolva-event-content">
                      <h5 className="nolva-event-title">{event.title}</h5>
                      {(event.eventType || event.event_type) && (
                        <span className="nolva-event-type-badge" style={{ fontSize: "12px", color: "#888" }}>
                          {getTypeLabel(eventTypesCatalog, event.eventType || event.event_type)}
                        </span>
                      )}
                      <div className="nolva-event-meta">
                        <span>
                          <i className="fi fi-rr-marker"></i>
                          {event.location || event.city || "Benin"}
                        </span>
                        <span>
                          <i className="fi fi-rr-clock"></i>
                          {dateStr
                            ? new Date(dateStr).toLocaleDateString("fr-FR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Date a confirmer"}
                        </span>
                      </div>
                      {event.description && (
                        <p className="nolva-event-desc">
                          {event.description.length > 100
                            ? event.description.substring(0, 100) + "..."
                            : event.description}
                        </p>
                      )}
                      <div className="nolva-event-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "var(--nolva-red)", fontSize: "16px" }}>
                          {price > 0 ? `${price.toLocaleString()} FCFA` : "Gratuit"}
                        </span>
                        <Link href={`/evenements/${event.id}`} className="nolva-event-btn">
                          Voir details <i className="fi fi-rr-arrow-small-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </section>
  );
};

export default EventsList;
