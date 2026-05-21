"use client";
import { Fade } from "react-awesome-reveal";
import { Col, Row } from "react-bootstrap";
import ScrollButton from "../../button/ScrollButton";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ProviderTypeLinks from "@/components/catalog/ProviderTypeLinks";

function Footer() {
  const [dropdownState, setDropdownState] = useState(null);

  const toggleDropdown = (dropdown: any) => {
    setDropdownState((menu) => (menu === dropdown ? null : dropdown));
  };

  return (
    <>
      <footer className="gi-footer m-t-40">
        <div className="footer-container">
          <div className="footer-top padding-tb-80">
            <div className="container">
              <Row className="m-minus-991">
                <Col sm={12} lg={3}>
                  <Fade
                    duration={400}
                    triggerOnce
                    direction="up"
                    className="gi-footer-cat"
                  >
                    <div className="gi-footer-widget gi-footer-company">
                      <img
                        src={
                          process.env.NEXT_PUBLIC_URL +
                          "/assets/img/logo/nolva-logo.png"
                        }
                        className="gi-footer-logo"
                        alt="NOLVA"
                      />
                      <p className="gi-footer-detail">
                        NOLVA est la plateforme de référence pour trouver les
                        meilleurs prestataires événementiels au Bénin.
                        DJ, photographes, animateurs et plus encore.
                      </p>
                      <div className="gi-footer-social" style={{ marginTop: "15px" }}>
                        <ul className="align-itegi-center" style={{ display: "flex", gap: "10px", listStyle: "none", padding: 0 }}>
                          <li className="gi-footer-link">
                            <a href="#"><i className="gicon gi-facebook" aria-hidden="true"></i></a>
                          </li>
                          <li className="gi-footer-link">
                            <a href="#"><i className="gicon gi-instagram" aria-hidden="true"></i></a>
                          </li>
                          <li className="gi-footer-link">
                            <a href="#"><i className="gicon gi-twitter" aria-hidden="true"></i></a>
                          </li>
                          <li className="gi-footer-link">
                            <a href="#"><i className="gicon gi-linkedin" aria-hidden="true"></i></a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Fade>
                </Col>
                <Col sm={12} lg={2} className="gi-footer-info">
                  <>
                    <div className="gi-footer-widget">
                      <h4
                        onClick={() => toggleDropdown("category")}
                        className="gi-footer-heading"
                      >
                        Prestataires
                        <div className="gi-heading-res">
                          <i className="fi-rr-angle-small-down" aria-hidden="true"></i>
                        </div>
                      </h4>
                      <motion.div
                        className="gi-footer-links gi-footer-dropdown"
                        initial={{ height: 0, opacity: 0, translateY: -20 }}
                        animate={{
                          height: dropdownState === "category" ? "auto" : 0,
                          opacity: dropdownState === "category" ? 1 : 0,
                          translateY: dropdownState === "category" ? 0 : -20,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                          overflow: "hidden",
                          display: "block",
                          paddingBottom: dropdownState === "category" ? "20px" : "0px",
                        }}
                      >
                        <ul className="align-itegi-center">
                          <ProviderTypeLinks variant="footer" />
                        </ul>
                      </motion.div>
                    </div>
                  </>
                </Col>
                <Col sm={12} lg={2} className="gi-footer-account">
                  <>
                    <div className="gi-footer-widget">
                      <h4
                        onClick={() => toggleDropdown("company")}
                        className="gi-footer-heading"
                      >
                        NOLVA
                        <div className="gi-heading-res">
                          <i className="fi-rr-angle-small-down" aria-hidden="true"></i>
                        </div>
                      </h4>
                      <motion.div
                        className="gi-footer-links gi-footer-dropdown"
                        initial={{ height: 0, opacity: 0, translateY: -20 }}
                        animate={{
                          height: dropdownState === "company" ? "auto" : 0,
                          opacity: dropdownState === "company" ? 1 : 0,
                          translateY: dropdownState === "company" ? 0 : -20,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                          overflow: "hidden",
                          display: "block",
                          paddingBottom: dropdownState === "company" ? "20px" : "0px",
                        }}
                      >
                        <ul className="align-itegi-center">
                          <li className="gi-footer-link">
                            <Link href="/about-us">À propos</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/evenements">Événements</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/faq">Comment ça marche</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/terms-condition">CGU</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/privacy-policy">Confidentialité</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/contact-us">Contact</Link>
                          </li>
                        </ul>
                      </motion.div>
                    </div>
                  </>
                </Col>
                <Col sm={12} lg={2} className="gi-footer-service">
                  <>
                    <div className="gi-footer-widget">
                      <h4
                        onClick={() => toggleDropdown("account")}
                        className="gi-footer-heading"
                      >
                        Mon Compte
                        <div className="gi-heading-res">
                          <i className="fi-rr-angle-small-down" aria-hidden="true"></i>
                        </div>
                      </h4>
                      <motion.div
                        className="gi-footer-links gi-footer-dropdown"
                        initial={{ height: 0, opacity: 0, translateY: -20 }}
                        animate={{
                          height: dropdownState === "account" ? "auto" : 0,
                          opacity: dropdownState === "account" ? 1 : 0,
                          translateY: dropdownState === "account" ? 0 : -20,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                          overflow: "hidden",
                          display: "block",
                          paddingBottom: dropdownState === "account" ? "20px" : "0px",
                        }}
                      >
                        <ul className="align-itegi-center">
                          <li className="gi-footer-link">
                            <Link href="/login">Connexion</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/register">Inscription</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/user-dashboard">Mes Réservations</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/vendor-dashboard">Espace Prestataire</Link>
                          </li>
                          <li className="gi-footer-link">
                            <Link href="/demande-devis">Demande de devis</Link>
                          </li>
                        </ul>
                      </motion.div>
                    </div>
                  </>
                </Col>
                <Col sm={12} lg={3} className="gi-footer-cont-social">
                  <>
                    <div className="gi-footer-contact">
                      <div className="gi-footer-widget">
                        <h4
                          onClick={() => toggleDropdown("contact")}
                          className="gi-footer-heading"
                        >
                          Contact
                          <div className="gi-heading-res">
                            <i className="fi-rr-angle-small-down" aria-hidden="true"></i>
                          </div>
                        </h4>
                        <motion.div
                          className="gi-footer-links gi-footer-dropdown"
                          initial={{ height: 0, opacity: 0, translateY: -20 }}
                          animate={{
                            height: dropdownState === "contact" ? "auto" : 0,
                            opacity: dropdownState === "contact" ? 1 : 0,
                            translateY: dropdownState === "contact" ? 0 : -20,
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{
                            overflow: "hidden",
                            display: "block",
                            paddingBottom: dropdownState === "contact" ? "20px" : "0px",
                          }}
                        >
                          <ul className="align-itegi-center">
                            <li className="gi-footer-link gi-foo-location">
                              <span>
                                <i className="fi fi-rr-marker location svg_img foo_svg"></i>
                              </span>
                              <p>
                                Cotonou, Bénin
                              </p>
                            </li>
                            <li className="gi-footer-link gi-foo-call">
                              <span>
                                <i className="fi fi-brands-whatsapp svg_img foo_svg"></i>
                              </span>
                              <a href="tel:+22990000000">+229 90 00 00 00</a>
                            </li>
                            <li className="gi-footer-link gi-foo-mail">
                              <span>
                                <i className="fi fi-rr-envelope"></i>
                              </span>
                              <a href="mailto:contact@nolva.bj">
                                contact@nolva.bj
                              </a>
                            </li>
                          </ul>
                        </motion.div>
                      </div>
                    </div>
                  </>
                </Col>
              </Row>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="container">
              <div className="row">
                <div className="gi-bottom-info">
                  <div className="footer-copy">
                    <div className="footer-bottom-copy">
                      <div className="gi-copy">
                        Copyright © 2024{" "}
                        <Link className="site-name" href="/">
                          NOLVA
                        </Link>
                        {" "}— Tous droits réservés. Plateforme événementielle au Bénin.
                      </div>
                    </div>
                  </div>
                  <div className="footer-bottom-right">
                    <div className="footer-bottom-payment d-flex justify-content-center">
                      <div className="payment-link">
                        <span style={{ color: "#999", fontSize: "14px" }}>
                          Paiement sécurisé par FedaPay
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ScrollButton />
    </>
  );
}

export default Footer;
