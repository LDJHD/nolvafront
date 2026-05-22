"use client";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import { normalizeList } from "@/lib/nolvaData";
import Spinner from "../button/Spinner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProviderTypes } from "@/lib/useCatalog";
import { getProviderTypeLabel } from "@/lib/providerUtils";
import { lowestOfferPrice, providerExperienceYears, toBooleanFlag } from "@/lib/providerDisplay";

const beninCities = [
  { value: "", label: "Toutes les villes" },
  { value: "Cotonou", label: "Cotonou" },
  { value: "Calavi", label: "Calavi" },
  { value: "Porto-Novo", label: "Porto-Novo" },
  { value: "Parakou", label: "Parakou" },
  { value: "Abomey", label: "Abomey" },
  { value: "Bohicon", label: "Bohicon" },
  { value: "Natitingou", label: "Natitingou" },
  { value: "Ouidah", label: "Ouidah" },
];

const VendorList = () => {
  const { types: providerTypesCatalog } = useProviderTypes();
  const searchParams = useSearchParams();
  const [type, setType] = useState(searchParams.get("type") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    const t = searchParams.get("type") || "";
    const c = searchParams.get("city") || "";
    const s = searchParams.get("search") || "";
    setType(t);
    setCity(c);
    setSearch(s);
    setFilters({ type: t, city: c, search: s });
  }, [searchParams]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.city) params.set("city", filters.city);
    if (filters.search) params.set("search", filters.search);
    return params.toString() ? "?" + params.toString() : "";
  };

  const { data, error } = useSWR(`/api/providers${buildQuery()}`, fetcher);

  const applyFilters = () => {
    setFilters({ type, city, search });
  };

  const resetFilters = () => {
    setType("");
    setCity("");
    setSearch("");
    setFilters({ type: "", city: "", search: "" });
  };

  if (error) return <div className="container py-4"><p>Impossible de charger les prestataires.</p></div>;
  if (!data) return <div className="text-center py-5"><Spinner /></div>;

  const providers = normalizeList(data);

  return (
    <section className="padding-tb-40">
      <div className="container">

        {/* Filtres */}
        <div className="nolva-filters mb-4">
          <div className="row align-items-end g-3">
            <div className="col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Type de prestataire</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-select nolva-filter-select"
              >
                <option value="">Tous les types</option>
                {providerTypesCatalog.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Recherche</label>
              <input
                type="search"
                className="form-control"
                placeholder="Nom, spécialité, ville…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Ville</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-select nolva-filter-select"
              >
                {beninCities.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 col-lg-3 d-flex gap-2">
              <button onClick={applyFilters} className="gi-btn-1 flex-fill">
                <i className="fi fi-rr-search"></i> Filtrer
              </button>
              <button onClick={resetFilters} className="gi-btn-2">
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {providers.length === 0 ? (
          <div className="text-center py-5">
            <i className="fi fi-rr-search" style={{ fontSize: "48px", color: "var(--nolva-red)", opacity: 0.4 }}></i>
            <p className="mt-3">Aucun prestataire trouvé pour ces critères.</p>
            <button onClick={resetFilters} className="gi-btn-2 mt-2">Réinitialiser les filtres</button>
          </div>
        ) : (
          <>
            <p className="text-muted mb-3">
              <strong>{providers.length}</strong> prestataire{providers.length > 1 ? "s" : ""} trouvé
              {providers.length > 1 ? "s" : ""}
              {filters.search ? (
                <> pour « <em>{filters.search}</em> »</>
              ) : null}
            </p>
            <div className="row">
              {providers.map((provider: any, index: number) => {
                const name = provider.business_name || provider.businessName || "Prestataire";
                const verified = toBooleanFlag(provider.is_verified ?? provider.isVerified);
                const available = toBooleanFlag(provider.is_available ?? provider.isAvailable);
                const expYears = providerExperienceYears(provider);
                const offers = provider.offers || [];
                const fromPrice = lowestOfferPrice(offers);
                const photo =
                  provider.profile_photo ||
                  provider.profilePhoto ||
                  provider.user?.avatar ||
                  provider.user?.Avatar;

                return (
                  <div key={provider.id || index} className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4">
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
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default VendorList;
