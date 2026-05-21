"use client";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import Spinner from "@/components/button/Spinner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { providersApi } from "@/lib/api";
import { useProviderTypes } from "@/lib/useCatalog";
import { getProviderTypeLabel } from "@/lib/providerUtils";
import PortfolioGallery from "@/components/common/PortfolioGallery";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Parse un champ qui peut etre un array ou un JSON string
const safeParseArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  return [];
};

const ProviderProfilePage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { types: providerTypeCatalog } = useProviderTypes();

  useEffect(() => {
    if (!id) return;
    providersApi.show(id as string)
      .then((res) => setProvider(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner /></div>;
  if (error || !provider) return (
    <div className="container py-5 text-center">
      <p>Prestataire introuvable.</p>
      <Link href="/prestataires" className="gi-btn-1">Retour aux prestataires</Link>
    </div>
  );

  // Support camelCase (backend) et snake_case
  const businessName = provider.businessName || provider.business_name || "Prestataire";
  const isVerified = provider.isVerified ?? provider.is_verified;
  const isAvailable = provider.isAvailable ?? provider.is_available;
  const experienceYears = provider.experienceYears || provider.experience_years;
  const travelPossible = provider.travelPossible ?? provider.travel_possible;
  const profilePhoto = provider.profilePhoto || provider.profile_photo;
  const ratingAvg = Number(provider.ratingAvg ?? provider.rating_avg ?? 0);
  const ratingCount = Number(provider.ratingCount ?? provider.rating_count ?? 0);
  const eventTypes = safeParseArray(provider.eventTypes || provider.event_types);

  return (
    <>
      <Breadcrumb title={businessName} />

      {/* Header profil */}
      <section className="nolva-profile-header padding-tb-40">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-auto">
              <div className="nolva-provider-avatar" style={{ width: "100px", height: "100px", fontSize: "40px" }}>
                {provider.user?.avatar || profilePhoto ? (
                  <img src={provider.user?.avatar || profilePhoto} alt={businessName} />
                ) : (
                  <span className="nolva-provider-initials">
                    {businessName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="col">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="mb-0">{businessName}</h2>
                {isVerified && (
                  <span className="nolva-badge-verified" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>
                    <i className="fi fi-rr-shield-check"></i> Verifie
                  </span>
                )}
              </div>
              <p className="text-muted mb-2">
                <i className="fi fi-rr-briefcase me-1"></i>{" "}
                {getProviderTypeLabel(provider, providerTypeCatalog)}
                &nbsp;&bull;&nbsp;
                <i className="fi fi-rr-marker me-1"></i> {provider.city}
                {ratingCount > 0 && (
                  <>
                    &nbsp;&bull;&nbsp;
                    <i className="fi fi-rr-star me-1"></i> {ratingAvg.toFixed(1)} ({ratingCount} avis)
                  </>
                )}
                {experienceYears && (
                  <>&nbsp;&bull;&nbsp;<i className="fi fi-rr-star me-1"></i> {experienceYears} ans d&apos;experience</>
                )}
              </p>
              <span className={`nolva-status ${isAvailable ? "available" : "busy"}`}>
                {isAvailable ? "Disponible" : "Actuellement indisponible"}
              </span>
            </div>
            <div className="col-auto">
              {isAuthenticated ? (
                <Link href={`/demande-devis/prestataire/${provider.id}`} className="gi-btn-1">
                  <i className="fi fi-rr-paper-plane"></i> Demander un devis
                </Link>
              ) : (
                <Link href="/login" className="gi-btn-1">
                  Connexion pour contacter
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="padding-tb-40">
        <div className="container">
          <div className="row g-4">

            {/* Colonne gauche */}
            <div className="col-lg-8">

              {/* Description */}
              {provider.description && (
                <div className="gi-vendor-dashboard-card mb-4">
                  <div className="gi-vendor-card-header">
                    <h5>A propos</h5>
                  </div>
                  <div className="gi-vendor-card-body">
                    <p style={{ color: "#4b5966", lineHeight: "1.7" }}>{provider.description}</p>
                  </div>
                </div>
              )}

              {/* Offres */}
              {provider.offers && provider.offers.length > 0 && (
                <div className="gi-vendor-dashboard-card mb-4">
                  <div className="gi-vendor-card-header">
                    <h5>Offres et tarifs</h5>
                  </div>
                  <div className="gi-vendor-card-body">
                    <div className="row g-3">
                      {provider.offers.map((offer: any, i: number) => {
                        const priceMin = offer.priceMin || offer.price_min;
                        const priceMax = offer.priceMax || offer.price_max;
                        const included = safeParseArray(offer.included);

                        return (
                          <div key={i} className="col-md-6">
                            <div className="nolva-offer-card">
                              <h6 style={{ fontWeight: 800 }}>{offer.name}</h6>
                              <p className="offer-price">
                                {Number(priceMin)?.toLocaleString()} - {Number(priceMax)?.toLocaleString()} FCFA
                              </p>
                              {offer.duration && <p className="text-muted" style={{ fontSize: "13px" }}>Duree : {offer.duration}</p>}
                              {included.length > 0 && (
                                <ul style={{ fontSize: "13px", color: "#4b5966", paddingLeft: "16px" }}>
                                  {included.map((item: string, j: number) => (
                                    <li key={j}>{item}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {provider.photos && provider.photos.length > 0 && (
                <PortfolioGallery photos={provider.photos} />
              )}
            </div>

            {/* Colonne droite */}
            <div className="col-lg-4">

              {/* Infos */}
              <div className="gi-vendor-dashboard-card mb-4">
                <div className="gi-vendor-card-header">
                  <h5>Informations</h5>
                </div>
                <div className="gi-vendor-card-body">
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {provider.specialty && (
                      <li className="mb-2"><i className="fi fi-rr-star me-2" style={{ color: "var(--nolva-red)" }}></i> Specialite : {provider.specialty}</li>
                    )}
                    {provider.city && (
                      <li className="mb-2"><i className="fi fi-rr-marker me-2" style={{ color: "var(--nolva-red)" }}></i> Ville : {provider.city}</li>
                    )}
                    {travelPossible && (
                      <li className="mb-2"><i className="fi fi-rr-plane me-2" style={{ color: "var(--nolva-red)" }}></i> Deplacement possible</li>
                    )}
                    {eventTypes.length > 0 && (
                      <li className="mb-2">
                        <i className="fi fi-rr-calendar me-2" style={{ color: "var(--nolva-red)" }}></i>
                        Types d&apos;evenements : {eventTypes.join(", ")}
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Réseaux sociaux */}
              {(provider.instagram || provider.facebook || provider.tiktok) && (
                <div className="gi-vendor-dashboard-card">
                  <div className="gi-vendor-card-header">
                    <h5>Reseaux sociaux</h5>
                  </div>
                  <div className="gi-vendor-card-body">
                    {provider.instagram && (
                      <a href={`https://instagram.com/${provider.instagram}`} target="_blank" rel="noopener noreferrer"
                        className="d-block mb-2 text-decoration-none" style={{ color: "var(--nolva-red)" }}>
                        <i className="fi fi-brands-instagram me-2"></i> @{provider.instagram}
                      </a>
                    )}
                    {provider.facebook && (
                      <a href={`https://facebook.com/${provider.facebook}`} target="_blank" rel="noopener noreferrer"
                        className="d-block mb-2 text-decoration-none" style={{ color: "var(--nolva-red)" }}>
                        <i className="fi fi-brands-facebook me-2"></i> {provider.facebook}
                      </a>
                    )}
                    {provider.tiktok && (
                      <a href={`https://tiktok.com/@${provider.tiktok}`} target="_blank" rel="noopener noreferrer"
                        className="d-block text-decoration-none" style={{ color: "var(--nolva-red)" }}>
                        <i className="fi fi-brands-tik-tok me-2"></i> @{provider.tiktok}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProviderProfilePage;
