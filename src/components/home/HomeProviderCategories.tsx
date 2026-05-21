"use client";
import { Col, Row } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import CategoryItem from "../product-item/CategoryItem";
import Spinner from "../button/Spinner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useProviderTypes } from "@/lib/useCatalog";

const ICONS: Record<string, string> = {
  dj: "fi-rr-music-alt",
  photographe: "fi-rr-camera",
  hotesse: "fi-rr-user",
  animateur: "fi-rr-microphone",
  securite: "fi-rr-shield-check",
  artiste: "fi-rr-star",
  organisateur: "fi-rr-calendar",
  location_materiel: "fi-rr-box",
  comedien: "fi-rr-laugh",
  traiteur: "fi-rr-restaurant",
  decorateur: "fi-rr-flower",
  videaste: "fi-rr-video-camera",
  autre: "fi-rr-briefcase",
};

const HomeProviderCategories = ({ className = "padding-tb-40" }) => {
  const { direction } = useSelector((state: RootState) => state.theme);
  const { types, loading } = useProviderTypes();

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner />
      </div>
    );
  }

  if (types.length === 0) return null;

  const items = types.map((t, index) => ({
    slug: t.slug,
    name: t.label,
    icon: `fi ${ICONS[t.slug] || "fi-rr-briefcase"}`,
    num: (index % 6) + 1,
  }));

  return (
    <section className={`gi-category body-bg ${className}`}>
      <div className="container">
        <div className="section-title-2 text-center mb-4">
          <h2 className="gi-title">
            Types de <span>prestataires</span>
          </h2>
          <p>Trouvez le professionnel adapté à votre événement</p>
        </div>
        <Row className="m-b-minus-15px">
          <Col xl={12}>
            <Swiper
              dir={direction === "RTL" ? "rtl" : "ltr"}
              loop={items.length > 5}
              autoplay={{ delay: 3000 }}
              slidesPerView={5}
              spaceBetween={20}
              breakpoints={{
                0: { slidesPerView: 1 },
                425: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1200: { slidesPerView: 5 },
                1440: { slidesPerView: 6 },
              }}
              className={`gi-category-block owl-carousel ${direction === "RTL" ? "rtl" : "ltr"}`}
            >
              {items.map((item, index) => (
                <SwiperSlide key={item.slug} className={`gi-cat-box gi-cat-box-${item.num}`}>
                  <CategoryItem data={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeProviderCategories;
