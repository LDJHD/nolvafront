"use client";
import { Col, Row } from "react-bootstrap";
import ProductAll from "../product-item/ProductItem";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Fade } from "react-awesome-reveal";
import Spinner from "../button/Spinner";
import { useState, useEffect } from "react";
import { getAllproduit, Produit } from "@/services/produitcompteservice";
import { toBackendAssetUrl } from "@/lib/apiConfig";
import { showErrorToast } from "../toast-popup/Toastify";

interface GroceryArrialsProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  hasPaginate?: boolean;
}

const GroceryArrials = ({
  onSuccess = () => {},
  onError = () => {},
  hasPaginate = false,
}: GroceryArrialsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProduits = async () => {
      try {
        const data = await getAllproduit();
        if (isMounted) {
          setProduits(data);
          onSuccess(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Erreur lors du chargement des produits");
          showErrorToast("Erreur lors du chargement des produits");
          onError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduits();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProductClick = (index: number) => {
    setSelectedIndex(index);
  };

  const getData = () => {
    if (hasPaginate) return produits;
    else return produits.map(produit => {
      const imagePath = produit.image
        ? toBackendAssetUrl(produit.image)
        : "/assets/img/product-images/6_2.jpg";
  
      return {
        id: produit.id,
        title: produit.nom,
        newPrice: produit.prix || 0,
        waight: "",
        image: imagePath,
        imageTwo: imagePath,
        date: produit.created_at || new Date().toISOString(),
        status: "",
        rating: 5,
        oldPrice: 0,
        location: "Online",
        brand: produit.nom,
        sku: produit.id,
        category: produit.nom_categorie,
        famille: produit.nom_famille,
        nombre_ecran: "",
        quantity: 1,
        description: produit.description || "",
        features: [],
        nom_categorie: produit.nom_categorie
      };
    });
  };

  if (error) return <div>Failed to load products</div>;
  if (loading) return <Spinner />;

  const filteredData = (category: string) => {
    if (category === "Tous") return getData();
    return getData().filter(item => item.nom_categorie === category);
  };

  return (
    <>
      <section
        className="gi-product-tab gi-products padding-tb-40 wow fadeInUp"
        data-wow-duration="2s"
      >
        <div className="container">
          <Tabs
            selectedIndex={selectedIndex}
            onSelect={(selectedIndex) => setSelectedIndex(selectedIndex)}
          >
            <div className="gi-tab-title">
              <div className="gi-main-title">
                <div className="section-title">
                  <div className="section-detail">
                    <h2 className="gi-title">
                      New <span>Arrivannls</span>
                    </h2>
                    <p>Shop online for new arrivals travail boip and get free shipping!</p>
                  </div>
                </div>
              </div>
              <TabList className="gi-pro-tab">
                <ul className="gi-pro-tab-nav nav">
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"all"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 0 ? "active" : ""
                      }`}
                      onClick={() => handleProductClick(0)}
                      data-bs-toggle="tab"
                    >
                      Tous
                    </a>
                  </Tab>
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"appartement"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 1 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                      onClick={() => handleProductClick(1)}
                    >
                      Appartement
                    </a>
                  </Tab>
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"restauration"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 2 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                      onClick={() => handleProductClick(2)}
                    >
                      Restauration
                    </a>
                  </Tab>
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"pret"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 3 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                      onClick={() => handleProductClick(3)}
                    >
                      Prêt à porter
                    </a>
                  </Tab>
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"divers"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 4 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                      onClick={() => handleProductClick(4)}
                    >
                      Divers
                    </a>
                  </Tab>
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"accessoires"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 5 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                      onClick={() => handleProductClick(5)}
                    >
                      Accessoires
                    </a>
                  </Tab>
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"aliment"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 6 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                      onClick={() => handleProductClick(6)}
                    >
                      Aliment
                    </a>
                  </Tab>
                  <Tab
                    style={{ outline: "none" }}
                    className="nav-item gi-header-rtl-arrival"
                    key={"supermarche"}
                  >
                    <a
                      className={`nav-link ${
                        selectedIndex == 7 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                      onClick={() => handleProductClick(7)}
                    >
                      Super marché
                    </a>
                  </Tab>
                </ul>
              </TabList>
            </div>
            <Row className="m-b-minus-24px">
              <Col lg={12}>
                <div className="tab-content">
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 0 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={getData()}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                   <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 1 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Abonnement Digital")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 1 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Appartement")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 2 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Restauration")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 3 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Prêt à porter")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 4 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Divers")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 5 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Accessoires")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 6 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Alimentation")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                  <TabPanel>
                    <Fade
                      triggerOnce
                      duration={400}
                      className={`tab-pane fade ${
                        selectedIndex === 7 ? "show active product-block" : ""
                      }`}
                    >
                      <Row>
                        <ProductAll 
                          data={filteredData("Super marché")}
                          onSuccess={onSuccess}
                          onError={onError}
                          hasPaginate={hasPaginate}
                        />
                      </Row>
                    </Fade>
                  </TabPanel>
                </div>
              </Col>
            </Row>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default GroceryArrials;
