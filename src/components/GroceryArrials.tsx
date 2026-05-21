// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ProductContentType, ProductData } from '../types';
import { produitcompteservice } from '../services/produitcompteservice';
import { TypeCompte } from '../services/typecompteservices';
import { Fade } from 'react-awesome-reveal';
import { Tabs, TabList, Tab, TabPanel } from '@mui/material';
import { Row, Col } from 'react-grid-system';
import Swiper from 'swiper';
import SwiperSlide from 'swiper/react';
import ItemCard from './ItemCard';

const GroceryArrials: React.FC<ProductContentType> = ({ data, onSuccess, onError, hasPaginate }) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await produitcompteservice.getAll();
        const transformedData = response.map((item: TypeCompte) => ({
          id: item.id,
          title: item.nom,
          newPrice: item.prix,
          waight: item.nombre_ecran,
          image: item.image,
          imageTwo: item.image,
          date: new Date().toISOString(),
          status: item.statut,
          rating: 5,
          oldPrice: item.prix_ancien,
          location: '',
          brand: '',
          sku: item.id,
          category: item.nom_categorie,
          nombre_ecran: item.nombre_ecran,
          quantity: 1,
          description: item.description,
          features: item.caracteristiques,
          nom_categorie: item.nom_categorie,
          nom_famille: item.nom_famille
        }));
        setProducts(transformedData);
        if (onSuccess) onSuccess(transformedData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onSuccess, onError]);

  const filteredData = (category: string) => {
    if (category === "Tous") return data;
    return data.filter(item => item.nom_famille === category);
  };

  const handleProductClick = (index: number) => {
    setSelectedIndex(index);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="gi-grocery-section padding-tb-40">
      <div className="container">
        <div className="section-title">
          <Fade triggerOnce direction="up" duration={2000} delay={200}>
            <div className="section-detail">
              <h2 className="gi-title">
                Nos <span>abonnements</span>
              </h2>
              <p>Choisissez l&apos;abonnement qui vous convient le mieux</p>
            </div>
          </Fade>
        </div>
        <Tabs selectedIndex={selectedIndex} onSelect={handleProductClick}>
          <TabList className="gi-tab-list">
            <Tab>Abonnement Digital</Tab>
            <Tab>Poissonnerie</Tab>
            <Tab>Tous</Tab>
            <Tab>Appartement</Tab>
            <Tab>Restauration</Tab>
            <Tab>Prêt à porter</Tab>
            <Tab>Divers</Tab>
            <Tab>Accessoires</Tab>
            <Tab>Aliment</Tab>
            <Tab>Super marché</Tab>
          </TabList>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Abonnement Digital").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Poissonnerie").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("All").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Snack & Spices").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Fruits").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Vegetables").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Bread & Juice").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Frozen").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>

          <TabPanel>
            <Row className="overflow-hidden m-b-minus-24px">
              <Col lg={12} className="gi-deal-section col-lg-12">
                <div className="gi-products">
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider">
                    <div className="slick-list draggable">
                      <Swiper
                        loop={true}
                        autoplay={{ delay: 1000 }}
                        slidesPerView={5}
                        breakpoints={{
                          0: { slidesPerView: 1 },
                          320: { slidesPerView: 1 },
                          425: { slidesPerView: 2 },
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                          1024: { slidesPerView: 3 },
                          1200: { slidesPerView: 5 },
                          1440: { slidesPerView: 5 },
                        }}
                        className="slick-track"
                      >
                        {filteredData("Organic").map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default GroceryArrials; 