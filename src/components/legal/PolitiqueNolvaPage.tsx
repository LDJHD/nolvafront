"use client";
import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";

const steps = [
  {
    title: "Vous réservez ou achetez",
    text: "Choisissez un prestataire ou un billet d'événement sur NOLVA.",
    icon: "fi-rr-calendar",
  },
  {
    title: "Vous payez en toute sécurité",
    text: "Le montant est encaissé via FedaPay et bloqué par NOLVA (séquestre).",
    icon: "fi-rr-shield-check",
  },
  {
    title: "Service ou événement réalisé",
    text: "Le prestataire effectue la prestation ou vous assistez à l'événement.",
    icon: "fi-rr-star",
  },
  {
    title: "Paiement validé",
    text: "Après votre confirmation (ou délai automatique), le bénéficiaire est payé.",
    icon: "fi-rr-check",
  },
];

const PolitiqueNolvaPage = () => {
  const pdfUrl = "/politiques/politique-nolva.pdf";

  return (
    <section className="padding-tb-40">
      <Container>
        <div className="section-title-2 text-center mb-4">
          <h2 className="gi-title">
            Paiement 100% sécurisé<span></span>
          </h2>
          <p>Avec NOLVA, votre argent est protégé jusqu&apos;à la bonne exécution du service.</p>
        </div>

        <Row className="mb-4">
          {steps.map((s, i) => (
            <Col md={3} sm={6} key={i} className="mb-3">
              <div className="gi-vendor-dashboard-card p-4 text-center h-100">
                <div style={{ fontSize: "32px", color: "#E31E24", marginBottom: "12px" }}>
                  <i className={`fi ${s.icon}`}></i>
                </div>
                <span className="badge bg-secondary mb-2">Étape {i + 1}</span>
                <h6>{s.title}</h6>
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>{s.text}</p>
              </div>
            </Col>
          ))}
        </Row>

        <Row>
          <Col lg={6} className="mb-3">
            <div className="gi-vendor-dashboard-card p-4 h-100">
              <h5>Protection client</h5>
              <ul style={{ color: "#4b5966" }}>
                <li>Prestataire absent → remboursement selon analyse NOLVA</li>
                <li>Problème sur la prestation → assistance &amp; litige</li>
                <li>Événement annulé → remboursement garanti</li>
              </ul>
            </div>
          </Col>
          <Col lg={6} className="mb-3">
            <div className="gi-vendor-dashboard-card p-4 h-100">
              <h5>Validation &amp; délais</h5>
              <p style={{ color: "#4b5966" }}>
                Après la prestation, confirmez que le service est terminé pour libérer le paiement.
                Sans réponse sous <strong>24 h</strong>, validation automatique. Pour les billets,
                libération organisateur <strong>48 h</strong> après l&apos;événement.
              </p>
              <p style={{ color: "#4b5966", marginBottom: 0 }}>
                En cas de problème : ouvrez un litige depuis votre espace client — l&apos;équipe
                NOLVA tranche (remboursement, libération ou partage).
              </p>
            </div>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <a href={pdfUrl} download className="gi-btn-1" style={{ textDecoration: "none" }}>
            Télécharger la politique NOLVA (PDF)
          </a>
          <Link href="/confidentialite" className="gi-btn-2 ms-2">
            Politique de confidentialité
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default PolitiqueNolvaPage;
