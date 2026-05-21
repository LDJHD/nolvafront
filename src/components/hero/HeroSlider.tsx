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
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (selectedCity) params.set("city", selectedCity);
    router.push(`/prestataires${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <section className="nolva-hero">
      <div className="nolva-hero-overlay">
        <div className="container">
          <div className="nolva-hero-content">
            <p className="nolva-hero-tagline">Bénin • Événements • Excellence</p>
            <h1 className="nolva-hero-title">
              Trouvez le prestataire idéal<br />
              <span>pour votre événement</span>
            </h1>
            <p className="nolva-hero-subtitle">
              Animation, Gastronomie, Décoration, Logistique et bien plus encore.<br />
              Des prestataires vérifiés, un paiement sécurisé.
            </p>

            <form onSubmit={handleSearch} className="nolva-search-bar">
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
                <strong>500+</strong>
                <span>Prestataires</span>
              </div>
              <div className="nolva-stat-divider"></div>
              <div className="nolva-stat">
                <strong>1000+</strong>
                <span>Événements réalisés</span>
              </div>
              <div className="nolva-stat-divider"></div>
              <div className="nolva-stat">
                <strong>98%</strong>
                <span>Clients satisfaits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
