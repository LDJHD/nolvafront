"use client";
import { Row } from "react-bootstrap";
import { Fade } from "react-awesome-reveal";

const NOLVA_SERVICES = [
  {
    icon: "fi fi-rr-shield-check",
    name: "Prestataires vérifiés",
    title: "Profils actifs et évalués par la communauté NOLVA.",
  },
  {
    icon: "fi fi-rr-credit-card",
    name: "Paiement sécurisé",
    title: "FedaPay et séquestre jusqu'à validation du service.",
  },
  {
    icon: "fi fi-rr-document",
    name: "Devis en ligne",
    title: "Demandez un devis personnalisé en quelques clics.",
  },
  {
    icon: "fi fi-rr-calendar-star",
    name: "Événements",
    title: "Découvrez et publiez des événements au Bénin.",
  },
];

const NolvaServices = () => {
  return (
    <section className="gi-service-section padding-tb-40">
      <div className="container">
        <Row className="m-tb-minus-12">
          {NOLVA_SERVICES.map((item, index) => (
            <Fade
              triggerOnce
              direction="up"
              delay={200 + index * 100}
              key={item.name}
              className="gi-ser-content gi-ser-content-2 col-sm-6 col-md-6 col-lg-3 p-tp-12"
            >
              <div className="gi-ser-inner">
                <div className="gi-service-image">
                  <i className={item.icon}></i>
                </div>
                <div className="gi-service-desc">
                  <h3>{item.name}</h3>
                  <p>{item.title}</p>
                </div>
              </div>
            </Fade>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default NolvaServices;
