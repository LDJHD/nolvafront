"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Col, Row } from "react-bootstrap";
import Spinner from "@/components/button/Spinner";
import { eventsApi, providersApi } from "@/lib/api";
import { normalizeList } from "@/lib/nolvaData";
import { useEventTypes, useProviderTypes, getTypeLabel } from "@/lib/useCatalog";
import { getProviderTypeLabel } from "@/lib/providerUtils";
import { lowestOfferPrice, providerExperienceYears, toBooleanFlag } from "@/lib/providerDisplay";

const GlobalSearchResults = () => {
  const searchParams = useSearchParams();
  const query = (searchParams.get("search") || "").trim();
  const { types: providerTypesCatalog } = useProviderTypes();
  const { types: eventTypesCatalog } = useEventTypes();
  const [providers, setProviders] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      if (!query) {
        setProviders([]);
        setEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [providerRes, eventRes] = await Promise.all([
          providersApi.list({ search: query, limit: 12 }),
          eventsApi.list({ search: query, limit: 12 }),
        ]);
        setProviders(normalizeList(providerRes.data));
        setEvents(normalizeList(eventRes.data));
      } catch {
        setError("Impossible de charger les resultats de recherche.");
        setProviders([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    void loadResults();
  }, [query]);

  if (!query) {
    return (
      <section className="padding-tb-40">
        <div className="container text-center">
          <p className="text-muted">Entrez une recherche pour trouver des prestataires ou des evenements.</p>
          <Link href="/" className="gi-btn-2">Retour a l&apos;accueil</Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="padding-tb-40">
        <div className="text-center py-5">
          <Spinner />
        </div>
      </section>
    );
  }

  const hasResults = providers.length > 0 || events.length > 0;

  return (
    <section className="padding-tb-40">
      <div className="container">
        <div className="section-title-2 text-center mb-4">
          <h2 className="gi-title">
            Resultats pour <span>{query}</span>
          </h2>
          <p>
            {providers.length} prestataire{providers.length > 1 ? "s" : ""} et{" "}
            {events.length} evenement{events.length > 1 ? "s" : ""} trouve{providers.length + events.length > 1 ? "s" : ""}.
          </p>
        </div>

        {error ? (
          <div className="nolva-empty-state">
            <i className="fi fi-rr-search"></i>
            <h5>Recherche indisponible</h5>
            <p>{error}</p>
          </div>
        ) : !hasResults ? (
          <div className="nolva-empty-state">
            <i className="fi fi-rr-search"></i>
            <h5>Aucun resultat trouve</h5>
            <p>Aucun prestataire ni evenement ne correspond a votre recherche.</p>
          </div>
        ) : (
          <>
            {providers.length > 0 && (
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Prestataires</h4>
                  <Link href={`/prestataires?search=${encodeURIComponent(query)}`} className="gi-btn-2">
                    Voir tous les prestataires
                  </Link>
                </div>
                <Row>
                  {providers.map((provider: any, index: number) => {
                    const name = provider.business_name || provider.businessName || "Prestataire";
                    const verified = toBooleanFlag(provider.is_verified ?? provider.isVerified);
                    const available = toBooleanFlag(provider.is_available ?? provider.isAvailable);
                    const expYears = providerExperienceYears(provider);
                    const fromPrice = lowestOfferPrice(provider.offers || []);
                    const photo =
                      provider.profile_photo ||
                      provider.profilePhoto ||
                      provider.user?.avatar ||
                      provider.user?.Avatar;

                    return (
                      <Col xl={4} lg={4} md={6} sm={12} className="mb-4" key={provider.id || index}>
                        <div className="nolva-provider-card">
                          <div className="nolva-provider-header">
                            <div className="nolva-provider-avatar">
                              {photo ? (
                                <img src={photo} alt={name} />
                              ) : (
                                <span className="nolva-provider-initials">
                                  {name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="nolva-provider-badges">
                              {verified && (
                                <span className="nolva-badge-verified">
                                  <i className="fi fi-rr-shield-check"></i> Verifie
                                </span>
                              )}
                              <span className={`nolva-status ${available ? "available" : "busy"}`}>
                                {available ? "Disponible" : "Occupe"}
                              </span>
                            </div>
                          </div>
                          <div className="nolva-provider-body">
                            <h5 className="nolva-provider-name">{name}</h5>
                            <p className="nolva-provider-type">
                              <i className="fi fi-rr-briefcase"></i>{" "}
                              {getProviderTypeLabel(provider, providerTypesCatalog)}
                            </p>
                            <p className="nolva-provider-city">
                              <i className="fi fi-rr-marker"></i> {provider.city}
                            </p>
                            {provider.description && (
                              <p className="nolva-provider-desc">{provider.description.slice(0, 90)}...</p>
                            )}
                            {fromPrice > 0 && (
                              <p className="nolva-provider-price">
                                A partir de <strong>{fromPrice.toLocaleString("fr-FR")} FCFA</strong>
                              </p>
                            )}
                          </div>
                          <div className="nolva-provider-footer">
                            {expYears > 0 && (
                              <span className="nolva-experience">
                                <i className="fi fi-rr-star"></i> {expYears} ans d&apos;exp.
                              </span>
                            )}
                            <Link href={`/prestataires/${provider.id}`} className="gi-btn-1">
                              Voir le profil
                            </Link>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Evenements</h4>
                  <Link href={`/evenements?search=${encodeURIComponent(query)}`} className="gi-btn-2">
                    Voir tous les evenements
                  </Link>
                </div>
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
                              <span className="day">{dateStr ? new Date(dateStr).getDate() : "--"}</span>
                              <span className="month">
                                {dateStr ? new Date(dateStr).toLocaleDateString("fr-FR", { month: "short" }) : ""}
                              </span>
                            </div>
                            <span className={`nolva-event-price-tag ${price > 0 ? "" : "free"}`}>
                              {price > 0 ? `${price.toLocaleString()} FCFA` : "Gratuit"}
                            </span>
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
                                Decouvrir <i className="fi fi-rr-arrow-small-right"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default GlobalSearchResults;
