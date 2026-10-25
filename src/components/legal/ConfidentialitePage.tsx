"use client";
import Link from "next/link";
import { Container } from "react-bootstrap";

const sections = [
  {
    title: "1. Responsable du traitement",
    body: "NOLVA, plateforme événementielle au Bénin, est responsable du traitement des données personnelles collectées sur son site et ses services. Pour toute question relative à vos données, écrivez à contact@nolva.org.",
  },
  {
    title: "2. Données que nous collectons",
    body: "Nous collectons uniquement les informations nécessaires au fonctionnement du service : identité (prénom, nom), coordonnées (email, téléphone, ville), informations de profil (photo, description, spécialités pour les prestataires), historique des réservations, demandes de devis et billets, ainsi que les données techniques de connexion.",
  },
  {
    title: "3. Pourquoi nous utilisons vos données",
    body: "Vos données servent à créer et sécuriser votre compte, mettre en relation participants et prestataires, gérer les réservations et les paiements, envoyer les confirmations et notifications utiles, assurer le support client et améliorer la qualité de la plateforme. Nous ne vendons jamais vos données personnelles.",
  },
  {
    title: "4. Base légale",
    body: "Le traitement repose sur l'exécution du contrat qui vous lie à NOLVA, sur votre consentement lorsque celui-ci est requis, sur nos obligations légales (notamment comptables et de lutte contre la fraude) et sur notre intérêt légitime à sécuriser et améliorer le service.",
  },
  {
    title: "5. Paiements et prestataires partenaires",
    body: "Les paiements sont traités par notre partenaire de paiement sécurisé FedaPay. NOLVA ne stocke pas vos données bancaires complètes. Les prestataires reçoivent uniquement les informations nécessaires pour répondre à votre demande ou réaliser la prestation réservée.",
  },
  {
    title: "6. Durée de conservation",
    body: "Les données de compte sont conservées tant que votre compte est actif, puis archivées pendant la durée légale applicable. Les documents liés aux paiements et aux réservations sont conservés conformément aux obligations comptables et fiscales.",
  },
  {
    title: "7. Sécurité",
    body: "Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre l'accès non autorisé, la perte ou la modification : connexions sécurisées, contrôle d'accès, sauvegardes et supervision des services.",
  },
  {
    title: "8. Vos droits",
    body: "Vous pouvez demander l'accès à vos données, leur rectification, leur suppression, la limitation de leur traitement ou vous opposer à certains usages. Vous pouvez également retirer votre consentement à tout moment. Ces demandes sont traitées dans les meilleurs délais via contact@nolva.org.",
  },
  {
    title: "9. Cookies et mesure d'audience",
    body: "NOLVA utilise uniquement les cookies et stockages nécessaires au fonctionnement du site (session, préférences, sécurité). Aucun cookie publicitaire n'est déposé sans votre accord.",
  },
  {
    title: "10. Mise à jour de cette politique",
    body: "Cette politique peut être mise à jour pour refléter l'évolution de nos services ou de la réglementation. La version en vigueur est toujours disponible sur cette page. Dernière mise à jour : 2026.",
  },
];

const ConfidentialitePage = () => {
  const pdfUrl = "/politiques/politique-confidentialite.pdf";

  return (
    <section className="padding-tb-40">
      <Container>
        <div className="gi-vendor-dashboard-card p-4">
          <h2 className="gi-title mb-3">Politique de confidentialité</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>
            NOLVA s&apos;engage à protéger vos données personnelles. Cette politique décrit
            quelles informations nous collectons, comment nous les utilisons (création de compte,
            réservations, paiements via FedaPay) et vos droits d&apos;accès et de suppression.
          </p>

          <div className="nolva-legal-sections">
            {sections.map((section) => (
              <article key={section.title} className="nolva-legal-section">
                <h5>{section.title}</h5>
                <p>{section.body}</p>
              </article>
            ))}
          </div>

          <div className="nolva-legal-actions">
            <a
              href={pdfUrl}
              download
              className="nolva-btn-secondary"
            >
              Télécharger le PDF complet
            </a>
            <Link href="/terms-condition" className="nolva-btn-secondary">
              Conditions Générales d&apos;Utilisation
            </Link>
            <Link href="/contact-us" className="nolva-btn-secondary">
              Contacter NOLVA
            </Link>
          </div>

          <p className="mt-3" style={{ fontSize: "13px", color: "#64748b" }}>
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
