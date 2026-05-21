"use client";
import Link from "next/link";
import { Container } from "react-bootstrap";

const ConfidentialitePage = () => {
  const pdfUrl = "/politiques/politique-confidentialite.pdf";

  return (
    <section className="padding-tb-40">
      <Container>
        <div className="gi-vendor-dashboard-card p-4">
          <h2 className="gi-title mb-3">Politique de confidentialité</h2>
          <p style={{ color: "#4b5966", lineHeight: 1.8 }}>
            NOLVA s&apos;engage à protéger vos données personnelles. Cette politique décrit
            quelles informations nous collectons, comment nous les utilisons (création de compte,
            réservations, paiements via FedaPay) et vos droits d&apos;accès et de suppression.
          </p>
          <ul style={{ color: "#4b5966", lineHeight: 1.8 }}>
            <li>Données collectées : identité, contact, localisation, historique d&apos;événements</li>
            <li>Finalités : gestion de compte, paiements sécurisés, support client</li>
            <li>Partenaires : prestataires de paiement (FedaPay), hébergement sécurisé</li>
            <li>Contact : support@nolva.com — Cotonou, Bénin</li>
          </ul>
          <p className="mt-4">
            <a
              href={pdfUrl}
              download
              className="gi-btn-1"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              Télécharger le PDF complet
            </a>
            <Link href="/politique-nolva" className="gi-btn-2 ms-2" style={{ display: "inline-block" }}>
              Paiement sécurisé &amp; fonctionnement
            </Link>
          </p>
          <p className="mt-3" style={{ fontSize: "13px", color: "#999" }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Ouvrir le document dans un nouvel onglet
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
};

export default ConfidentialitePage;
