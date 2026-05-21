"use client";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import { normalizeList } from "@/lib/nolvaData";
import Spinner from "../button/Spinner";
import Link from "next/link";
import { useProviderTypes } from "@/lib/useCatalog";
import { getProviderTypeLabel } from "@/lib/providerUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ProviderCard = ({
  provider,
  typeCatalog,
}: {
  provider: any;
  typeCatalog: { slug: string; label: string }[];
}) => {
  const name = provider.business_name || provider.businessName || "Prestataire";
  const verified = provider.is_verified ?? provider.isVerified;
  const available = provider.is_available ?? provider.isAvailable;
  const firstName = provider.first_name || provider.user?.first_name || provider.user?.firstName || "";
  const lastName = provider.last_name || provider.user?.last_name || provider.user?.lastName || "";
  const displayName = name || `${firstName} ${lastName}`.trim() || "?";
  const offers = provider.offers || [];
  const ratingAvg = Number(provider.rating_avg ?? provider.ratingAvg ?? 0);
  const ratingCount = Number(provider.rating_count ?? provider.ratingCount ?? 0);
  const photo =
    provider.profile_photo ||
    provider.profilePhoto ||
    provider.user?.avatar ||
    provider.user?.Avatar;

  return (
    <div className="nolva-provider-card">
      <div className="nolva-provider-header">
        <div className="nolva-provider-avatar">
          {photo ? (
            <img src={photo} alt={displayName} />
          ) : (
            <span className="nolva-provider-initials">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {verified && (
          <span className="nolva-badge-verified">
            <i className="fi fi-rr-shield-check"></i> Verifie
          </span>
        )}
      </div>
      <div className="nolva-provider-body">
        <h5 className="nolva-provider-name">{displayName}</h5>
        <p className="nolva-provider-type">
          <i className="fi fi-rr-briefcase"></i> {getProviderTypeLabel(provider, typeCatalog)}
        </p>
        {ratingCount > 0 && (
          <p className="nolva-provider-rating" style={{ fontSize: "13px", color: "#E31E24", margin: "4px 0" }}>
            <i className="fi fi-rr-star"></i> {ratingAvg.toFixed(1)} ({ratingCount} avis)
          </p>
        )}
        <p className="nolva-provider-city">
          <i className="fi fi-rr-marker"></i> {provider.city}
        </p>
        {offers.length > 0 && (
          <p className="nolva-provider-price">
            A partir de <strong>{(offers[0].price_min || offers[0].priceMin)?.toLocaleString()} FCFA</strong>
          </p>
        )}
      </div>
      <div className="nolva-provider-footer">
        <span className={`nolva-status ${available ? "available" : "busy"}`}>
          <i className={`fi fi-rr-${available ? "check" : "clock"}`}></i>
          {available ? "Disponible" : "Occupe"}
        </span>
        <Link href={`/prestataires/${provider.id}`} className="gi-btn-1">
          Voir le profil
        </Link>
      </div>
    </div>
  );
};

const PopularProviders = () => {
  const { types: typeCatalog } = useProviderTypes();
  const { data, error } = useSWR("/api/providers/popular", fetcher);

  if (error) return null;
  if (!data) return <div className="text-center py-4"><Spinner /></div>;

  const providers = normalizeList(data);

  if (providers.length === 0) return null;

  return (
    <section className="padding-tb-40">
      <div className="container">
        <div className="section-title-2 text-center mb-4">
          <h2 className="gi-title">
            Prestataires <span>populaires</span>
          </h2>
          <p>Les prestataires les mieux notes au Benin</p>
        </div>

        {/* Desktop: Grid classique */}
        <div className="row d-none d-md-flex">
          {providers.map((provider: any, index: number) => (
            <div key={provider.id || index} className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4">
              <ProviderCard provider={provider} typeCatalog={typeCatalog} />
            </div>
          ))}
        </div>

        {/* Mobile: Carousel Swiper avec boutons prev/next */}
        <div className="d-md-none nolva-mobile-carousel">
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={1.15}
            centeredSlides={false}
            navigation={{
              prevEl: ".nolva-providers-prev",
              nextEl: ".nolva-providers-next",
            }}
            breakpoints={{
              400: { slidesPerView: 1.3 },
              500: { slidesPerView: 1.6 },
            }}
          >
            {providers.map((provider: any, index: number) => (
              <SwiperSlide key={provider.id || index}>
                <ProviderCard provider={provider} typeCatalog={typeCatalog} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nolva-carousel-nav">
            <button className="nolva-carousel-btn nolva-providers-prev" aria-label="Précédent">
              <i className="fi fi-rr-angle-left"></i>
            </button>
            <button className="nolva-carousel-btn nolva-providers-next" aria-label="Suivant">
              <i className="fi fi-rr-angle-right"></i>
            </button>
          </div>
        </div>

        <div className="text-center mt-3">
          <Link href="/prestataires" className="gi-btn-2">
            Voir tous les prestataires <i className="fi fi-rr-angle-double-small-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularProviders;
