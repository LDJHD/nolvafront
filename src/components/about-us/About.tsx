import React from "react";
import { Col, Row } from "react-bootstrap";

const About = () => {
  return (
    <section className="gi-about padding-tb-40">
      <div className="container">
        <Row>
          <Col xl={6} md={12}>
            <div className="gi-about-img">
              <img src="/assets/img/common/about.png" className="v-img" alt="NOLVA" />
              <img src="/assets/img/common/about-2.png" className="h-img" alt="Evenement" />
              <img src="/assets/img/common/about-3.png" className="h-img" alt="Prestataire" />
            </div>
          </Col>
          <Col xl={6} md={12}>
            <div className="gi-about-detail">
              <div className="section-title">
                <h2>
                  À propos de <span>NOLVA</span>
                </h2>
                <p>
                  NOLVA connecte les organisateurs, les prestataires et les
                  participants autour d&apos;expériences événementielles fiables au Bénin.
                </p>
              </div>
              <p>
                La plateforme permet de trouver des prestataires vérifiés,
                publier des événements, vendre des tickets, demander des devis
                et suivre chaque étape depuis un espace sécurisé.
              </p>
              <p>
                Comment ça marche : vous décrivez votre besoin, NOLVA vous
                oriente vers les bons prestataires ou événements, puis les
                paiements et réservations sont suivis dans votre compte.
              </p>
              <p>
                Nos CGU et notre politique de confidentialité encadrent
                l&apos;utilisation de la plateforme, la protection des données, les
                paiements et les responsabilités de chaque utilisateur.
              </p>
              <p>
                Contact : 0195676714 (appel et WhatsApp). Adresse :
                Abomey-Calavi, Togou.
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default About;
