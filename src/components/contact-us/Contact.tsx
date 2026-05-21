"use client";
import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import {
  FaEnvelope,
  FaMobileAlt,
  FaGlobeAmericas,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Contact = () => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
  };
  return (
    <>
      <section className="gi-contact padding-tb-40">
        <div className="container">
          <div className="section-title-2">
            <h2 className="gi-title">
              Nous <span>Contacter</span>
            </h2>
            <p>
              Une question ? Un besoin ? N&apos;hesitez pas a nous ecrire,
              notre equipe vous repondra dans les plus brefs delais.
            </p>
          </div>
          <Row className="gi-contact-detail m-tb-minus-12">
            <Col sm={6} lg={4} className="p-tp-12">
              <div className="gi-box">
                <div className="detail">
                  <div className="icon">
                    <i className="fa fa-envelope" aria-hidden="true">
                      <FaEnvelope />
                    </i>
                  </div>
                  <div className="info">
                    <h3 className="title">Email & Site Web</h3>
                    <p>
                      <i className="fa fa-envelope" aria-hidden="true">
                        <FaEnvelope />
                      </i>{" "}
                      &nbsp; contact@nolva.bj
                    </p>
                    <p>
                      <i className="fa fa-globe" aria-hidden="true">
                        <FaGlobeAmericas />
                      </i>{" "}
                      &nbsp; www.nolva.bj
                    </p>
                  </div>
                </div>
                <div className="space"></div>
              </div>
            </Col>

            <Col sm={6} lg={4} className="p-tp-12">
              <div className="gi-box">
                <div className="detail">
                  <div className="icon">
                    <i className="fa fa-mobile" aria-hidden="true">
                      <FaMobileAlt />
                    </i>
                  </div>
                  <div className="info">
                    <h3 className="title">Telephone</h3>
                    <p>
                      <i className="fa fa-mobile" aria-hidden="true">
                        <FaMobileAlt />
                      </i>{" "}
                      &nbsp; (+229) 90 00 00 00
                    </p>
                    <p>
                      <i className="fa fa-mobile" aria-hidden="true">
                        <FaMobileAlt />
                      </i>{" "}
                      &nbsp; WhatsApp: (+229) 90 00 00 00
                    </p>
                  </div>
                </div>
                <div className="space"></div>
              </div>
            </Col>

            <Col sm={6} lg={4} className="p-tp-12 m-auto">
              <div className="gi-box">
                <div className="detail">
                  <div className="icon">
                    <i className="fa fa-map-marker" aria-hidden="true">
                      <FaMapMarkerAlt />
                    </i>
                  </div>
                  <div className="info">
                    <h3 className="title">Adresse</h3>
                    <p>
                      <i className="fa fa-map-marker" aria-hidden="true">
                        <FaMapMarkerAlt />
                      </i>{" "}
                      &nbsp; Cotonou, Benin
                    </p>
                  </div>
                </div>
                <div className="space"></div>
              </div>
            </Col>
          </Row>
          <Row className="p-t-80">
            <Col md={6}>
              <iframe src="//maps.google.com/maps?q=6.3654,2.4183&z=13&output=embed"></iframe>
            </Col>
            <Col md={6}>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="form-group">
                  <Form.Control
                    type="text"
                    className="form-control"
                    id="fname"
                    placeholder="Nom complet"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer votre nom.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="form-group">
                  <Form.Control
                    type="email"
                    className="form-control"
                    id="umail"
                    placeholder="Email"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer un email valide.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="form-group">
                  <Form.Control
                    type="text"
                    className="form-control"
                    id="phone"
                    placeholder="Telephone (+229...)"
                    pattern="^\d{8,15}$"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer un numero valide.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="form-group">
                  <textarea
                    className="form-control"
                    id="exampleFormControlTextarea1"
                    rows={3}
                    placeholder="Votre message..."
                    required
                  ></textarea>
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer votre message.
                  </Form.Control.Feedback>
                </Form.Group>
                <button type="submit" className="gi-btn-2">
                  Envoyer
                </button>
              </Form>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default Contact;
