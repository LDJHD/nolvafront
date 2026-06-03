"use client";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import {
  downloadNolvaCguContract,
  NOLVA_CGU_TEXT,
} from "@/lib/nolvaCguContract";

const highlights = [
  {
    title: "Acces a la plateforme",
    text: "NOLVA met en relation les organisateurs, les clients et les prestataires de l'ecosysteme evenementiel.",
    icon: "fi-rr-apps",
  },
  {
    title: "Comptes et profils",
    text: "Chaque utilisateur s'engage a fournir des informations exactes et a proteger ses identifiants.",
    icon: "fi-rr-user",
  },
  {
    title: "Reservations et paiements",
    text: "Les prestations, billets, acomptes et commissions sont encadres au moment de chaque transaction.",
    icon: "fi-rr-credit-card",
  },
  {
    title: "Responsabilites",
    text: "Les contenus, evenements et engagements publies restent sous la responsabilite de leurs auteurs.",
    icon: "fi-rr-shield-check",
  },
];

const sections = [
  {
    title: "1. Presentation de NOLVA",
    items: [
      "NOLVA est une plateforme numerique dediee a l'ecosysteme evenementiel.",
      "Elle permet la mise en relation avec des prestataires, la decouverte et la publication d'evenements, la reservation de prestations et la consultation d'annuaires professionnels.",
      "L'utilisation de NOLVA implique l'acceptation pleine et entiere des presentes Conditions Generales d'Utilisation.",
    ],
  },
  {
    title: "2. Definitions",
    items: [
      "Plateforme : site web et applications NOLVA.",
      "Utilisateur : toute personne utilisant la plateforme.",
      "Client : utilisateur recherchant ou reservant une prestation.",
      "Prestataire : professionnel proposant ses services sur NOLVA.",
      "Evenement : activite publiee ou organisee via la plateforme.",
      "Compte : espace personnel cree par l'utilisateur.",
    ],
  },
  {
    title: "3. Conditions d'acces",
    items: [
      "L'acces a NOLVA est ouvert a toute personne disposant de la capacite juridique necessaire.",
      "L'utilisateur garantit l'exactitude des informations fournies, une utilisation legale de la plateforme et le respect des presentes CGU.",
      "NOLVA peut refuser ou suspendre l'acces en cas de non-respect des regles.",
    ],
  },
  {
    title: "4. Creation de compte",
    items: [
      "Pour acceder a certaines fonctionnalites, l'utilisateur doit creer un compte.",
      "Il s'engage a fournir des informations exactes, a les maintenir a jour et a preserver la confidentialite de ses identifiants.",
      "Toute activite realisee depuis un compte est reputee effectuee sous la responsabilite de son titulaire.",
    ],
  },
  {
    title: "5. Comptes prestataires et organisateurs",
    items: [
      "Les prestataires doivent fournir des informations exactes sur leur identite, leur activite, leurs coordonnees, leurs competences et leurs tarifs lorsque requis.",
      "Les organisateurs s'engagent a fournir des informations exactes concernant leurs evenements et a utiliser la plateforme de maniere loyale.",
      "NOLVA peut demander tout document necessaire a la verification d'un profil.",
    ],
  },
  {
    title: "6. Publication de contenus",
    items: [
      "Les utilisateurs peuvent publier des descriptions, photographies, videos, avis et evenements.",
      "L'utilisateur garantit disposer de tous les droits necessaires sur les contenus publies.",
      "Les contenus illegaux, frauduleux, diffamatoires, injurieux, haineux, trompeurs ou portant atteinte aux droits de tiers sont interdits.",
    ],
  },
  {
    title: "7. Avis, evenements et assistance",
    items: [
      "Les avis doivent etre honnetes, respectueux et fondes sur une experience reelle.",
      "Les organisateurs sont responsables du contenu publie, de la legalite de l'evenement et des autorisations administratives necessaires.",
      "Les outils d'assistance intelligente fournissent des informations indicatives et ne remplacent pas un conseil professionnel.",
    ],
  },
  {
    title: "8. Reservations, transactions et commissions",
    items: [
      "Les reservations via NOLVA peuvent donner lieu a des acomptes, paiements et commissions.",
      "Les modalites applicables sont precisees lors de chaque transaction.",
      "NOLVA peut percevoir des frais ou commissions sur les transactions realisees via la plateforme.",
    ],
  },
  {
    title: "9. Propriete intellectuelle",
    items: [
      "Le nom NOLVA, le logo, les interfaces, les textes, les fonctionnalites et les bases de donnees sont proteges.",
      "Toute reproduction non autorisee est interdite.",
    ],
  },
  {
    title: "10. Disponibilite et responsabilite",
    items: [
      "NOLVA s'efforce d'assurer une disponibilite continue, sans garantir l'absence d'interruption, d'erreur ou de panne technique.",
      "NOLVA agit comme intermediaire technologique et ne peut etre tenue responsable des litiges entre utilisateurs, retards, annulations ou pertes financieres liees aux prestations.",
      "Chaque utilisateur demeure responsable de ses actes et engagements.",
    ],
  },
  {
    title: "11. Suspension, donnees et droit applicable",
    items: [
      "NOLVA peut suspendre ou supprimer un compte en cas de fraude, usurpation d'identite, utilisation abusive ou non-respect des CGU.",
      "Les donnees personnelles sont utilisees pour la gestion des comptes, reservations, paiements, support et amelioration de la plateforme.",
      "Les presentes CGU sont regies par le droit beninois. En cas de litige, les juridictions competentes du Benin seront seules competentes.",
    ],
  },
  {
    title: "12. Contact",
    items: [
      "Pour toute question relative aux presentes CGU, contactez NOLVA via la page Contact.",
      "En creant un compte, en publiant un contenu ou en utilisant les services de NOLVA, l'utilisateur reconnait avoir lu, compris et accepte les presentes CGU.",
    ],
  },
];

const CguPage = () => {
  return (
    <section className="padding-tb-40">
      <Container>
        <div className="section-title-2 text-center mb-4">
          <h2 className="gi-title">
            Conditions generales <span>d&apos;utilisation</span>
          </h2>
          <p>Version 1.0 - NOLVA, plateforme evenementielle au Benin.</p>
        </div>

        <Row className="mb-4">
          {highlights.map((item) => (
            <Col lg={3} sm={6} className="mb-3" key={item.title}>
              <div className="gi-vendor-dashboard-card p-4 h-100">
                <div style={{ fontSize: "30px", color: "var(--nolva-primary)", marginBottom: "12px" }}>
                  <i className={`fi ${item.icon}`}></i>
                </div>
                <h6 style={{ marginBottom: "8px" }}>{item.title}</h6>
                <p style={{ color: "#4b5966", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                  {item.text}
                </p>
              </div>
            </Col>
          ))}
        </Row>

        <Row>
          <Col lg={8} className="mb-3">
            <div className="gi-vendor-dashboard-card p-4">
              <div
                style={{
                  color: "#4b5966",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {NOLVA_CGU_TEXT}
              </div>
            </div>
          </Col>

          <Col lg={4} className="mb-3">
            <div className="gi-vendor-dashboard-card p-4" style={{ position: "sticky", top: "100px" }}>
              <h5>Infos utiles</h5>
              <p style={{ color: "#4b5966", lineHeight: 1.8 }}>
                Retrouvez les pages qui expliquent le fonctionnement, la protection des donnees
                et les regles d&apos;utilisation de NOLVA.
              </p>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="gi-btn-1"
                  onClick={() => downloadNolvaCguContract()}
                >
                  Télécharger les CGU
                </button>
                <Link href="/politique-nolva" className="gi-btn-2" style={{ textAlign: "center" }}>
                  Comment fonctionne NOLVA
                </Link>
                <Link href="/confidentialite" className="gi-btn-2" style={{ textAlign: "center" }}>
                  Politique de confidentialite
                </Link>
                <Link href="/contact-us" className="gi-btn-2" style={{ textAlign: "center" }}>
                  Contacter NOLVA
                </Link>
              </div>
              <p style={{ color: "#999", fontSize: "13px", lineHeight: 1.7, marginTop: "18px", marginBottom: 0 }}>
                Date d&apos;entree en vigueur : a completer par l&apos;administration NOLVA.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CguPage;
