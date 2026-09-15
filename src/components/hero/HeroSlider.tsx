"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProviderTypes } from "@/lib/useCatalog";

const beninCities = [
  { value: "", label: "Toutes les villes" },
  { value: "cotonou", label: "Cotonou" },
  { value: "calavi", label: "Calavi" },
  { value: "porto-novo", label: "Porto-Novo" },
  { value: "parakou", label: "Parakou" },
  { value: "abomey", label: "Abomey" },
];

function HeroSlider() {
  const router = useRouter();
  const { types: providerTypes } = useProviderTypes();
  const [searchScope, setSearchScope] = useState("prestataires");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (selectedCity) params.set("city", selectedCity);
    router.push(`/${searchScope}${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <section className="nolva-hero">
      <div className="nolva-hero-overlay">
        <div className="container">
          <div className="nolva-hero-content">
            <p className="nolva-hero-tagline text-red-500">TOUT L’ÉVÉNEMENTIEL, UNE SEULE PLATEFORME.</p>
            <h1 className="nolva-hero-title">
              Votre événement, de l’idée au jour J.<br /><br />
              Prestataires, événements et<br />
              <span>assistance intelligente réunis sur NOLVA</span>
            </h1>
            {/* <p className="nolva-hero-subtitle">
              Animation, Gastronomie, Décoration, Logistique et bien plus encore.<br />
              Des prestataires vérifiés, un paiement sécurisé.
            </p> */}

            <form onSubmit={handleSearch} className="nolva-search-bar">
              <div className="nolva-search-field nolva-search-scope">
                <i className="fi fi-rr-apps"></i>
                <select
                  value={searchScope}
                  onChange={(e) => setSearchScope(e.target.value)}
                  className="nolva-search-select"
                  aria-label="Type de recherche"
                >
                  <option value="prestataires">Prestataires</option>
                  <option value="evenements">Événements</option>
                </select>
              </div>
              <div className="nolva-search-divider"></div>
              <div className="nolva-search-field">
                <i className="fi fi-rr-search"></i>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="nolva-search-select"
                >
                  <option value="">Tous les types</option>
                  {providerTypes.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="nolva-search-divider"></div>
              <div className="nolva-search-field">
                <i className="fi fi-rr-marker"></i>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="nolva-search-select"
                >
                  {beninCities.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="nolva-search-btn">
                <i className="fi fi-rr-search"></i>
                Rechercher
              </button>
            </form>

            <div className="nolva-hero-stats">
              <div className="nolva-stat">
                <strong>TROUVEZ</strong>
                <span>Prestataires & lieux</span>
              </div>
              <div className="nolva-stat-divider"></div>
              <div className="nolva-stat">
                <strong>DÉCOUVREZ</strong>
                <span>Événements & billets</span>
              </div>
              <div className="nolva-stat-divider"></div>
              <div className="nolva-stat">
                <strong>ORGANISEZ</strong>
                <span>Avec l’assistance intelligente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
