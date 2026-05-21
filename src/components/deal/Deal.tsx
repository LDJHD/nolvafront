"use client";
import { Col, Row } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ItemCard from "../product-item/ItemCard";
import { Fade } from "react-awesome-reveal";
import { useEffect, useState } from "react";
import { getAllTypesComptes, TypeCompte } from '@/services/typecompteservices';
import Spinner from "../button/Spinner";
import DealendTimer from "../dealend-timer/DealendTimer";
import { showErrorToast } from "../toast-popup/Toastify";

const Deal = ({
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const [types, setTypes] = useState<TypeCompte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTypes = async () => {
      try {
        const data = await getAllTypesComptes();
        if (isMounted) {
          setTypes(data);
          onSuccess();
        }
      } catch (err) {
        if (isMounted) {
          setError("Erreur lors du chargement des types de compte");
          showErrorToast("Erreur lors du chargement des types de compte");
          onError();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) return <div>Failed to load products</div>;
  if (loading) return <Spinner />;

  // const getData = () => {
  //   if (hasPaginate) return types;
  //   else return types.map(type => ({
  //     id: type.id,
  //     title: type.libelle,
  //     newPrice: type.prix || 0,
  //     waight: type.duree || "1 mois",
  //     image: type.image ? `${process.env.BACKEND_URL}/${type.image}` : "/assets/images/subscription.jpg",
  //     imageTwo: type.image ? `${process.env.BACKEND_URL}/${type.image}` : "/assets/images/subscription.jpg",
  //     date: type.created_at || new Date().toISOString(),
  //     status: type.statut || "",
  //     rating: 5,
  //     oldPrice: type.prix_ancien || 0,
  //     location: "Online",
  //     brand: type.nom,
  //     sku: type.id,
  //     category: "Subscription",
  //     quantity: 1,
  //     description: type.description || "",
  //     features: type.caracteristiques || []
  //   }));
  // };

  const getData = () => {
    if (hasPaginate) return types;
    else return types.map(type => {
      const imagePath = type.image
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${type.image}`
        : "/assets/images/subscription.jpg";
  
      return {
        id: type.id,
        title: type.nom,
        newPrice: type.prix || 0,
        waight: type.duree || "1 mois",
        image: imagePath,
        imageTwo: imagePath,
        date: type.created_at || new Date().toISOString(),
        status: type.statut || "",
        rating: 5,
        oldPrice: type.prix_ancien || 0,
        location: "Online",
        brand: type.nom,
        sku: type.id,
        category: type.plateforme,
        nombre_ecran: type.nombreEcran,
        quantity: 1,
        description: type.description || "",
        features: type.caracteristiques || []
      };
    });
  };

  
  return (
    <>
      <section
        className="gi-deal-section padding-tb-40 wow fadeInUp"
        data-wow-duration="2s"
      >
        <div className="container">
          <Row className="overflow-hidden m-b-minus-24px">
            <Col lg={12} className="gi-deal-section col-lg-12">
              <div className="gi-products">
                <div
                  className="section-title"
                  data-aos="fade-up"
                  data-aos-duration="2000"
                  data-aos-delay="200"
                >
                  <Fade triggerOnce direction="up" duration={2000} delay={200}>
                    <div className="section-detail">
                      <h2 className="gi-title">
                        Nos <span>abonnements</span>
                      </h2>
                      <p>Choisissez l&apos;abonnement qui vous convient le mieux</p>
                    </div>
                  </Fade>
                  <DealendTimer />
                </div>
                <Fade
                  triggerOnce
                  direction="up"
                  duration={2000}
                  delay={200}
                  className="gi-deal-block m-minus-lr-12"
                >
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: {
                            slidesPerView: 1,
                          },
                          320: {
                            slidesPerView: 1,
                          },
                          425: {
                            slidesPerView: 2,
                          },
                          640: {
                            slidesPerView: 2,
                          },
                          768: {
                            slidesPerView: 3,
                          },
                          1024: {
                            slidesPerView: 3,
                          },
                          1200: {
                            slidesPerView: 5,
                          },
                          1440: {
                            slidesPerView: 5,
                          },
                        }}
                        className="slick-track"
                      >
                        {getData()?.map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </Fade>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default Deal;
