"use client";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import { NOLVA_CGU_EFFECTIVE_DATE, NOLVA_CGU_VERSION } from "@/lib/nolvaCguContract";

type Props = {
  show: boolean;
  actorLabel: "client" | "prestataire";
  actionLabel: string;
  loading?: boolean;
  onAccept: () => void;
  onClose: () => void;
};

const NolvaContractModal = ({
  show,
  actorLabel,
  actionLabel,
  loading,
  onAccept,
  onClose,
}: Props) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <div>
          <Modal.Title>Contrat NOLVA a lire et accepter</Modal.Title>
          <p className="mb-0 small text-muted">
            {NOLVA_CGU_VERSION} - {NOLVA_CGU_EFFECTIVE_DATE}
          </p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-warning small mb-3">
          En tant que {actorLabel}, vous devez lire les Conditions Generales
          d&apos;Utilisation avant de continuer.
        </div>
        <p className="mb-0">
          Veuillez consulter le contrat avant de continuer :{" "}
          <Link href="/documents/contrat-de-prestation.pdf" target="_blank" download className="fw-semibold">
            LIRE LE CONTRAT NOLVA
          </Link>
        </p>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-column flex-sm-row gap-2 justify-content-between">
        <Link
          href="/documents/contrat-de-prestation.pdf"
          target="_blank"
          download
          className="gi-btn-2"
          style={{ textDecoration: "none" }}
        >
          LIRE LE CONTRAT NOLVA
        </Link>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button type="button" className="gi-btn-1" onClick={onAccept} disabled={loading}>
            {loading ? "Traitement..." : actionLabel}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default NolvaContractModal;
