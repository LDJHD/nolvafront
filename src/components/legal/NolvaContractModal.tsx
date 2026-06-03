"use client";
import { Modal } from "react-bootstrap";
import {
  downloadNolvaCguContract,
  NOLVA_CGU_EFFECTIVE_DATE,
  NOLVA_CGU_TEXT,
  NOLVA_CGU_VERSION,
} from "@/lib/nolvaCguContract";

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
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <div>
          <Modal.Title>Contrat NOLVA à lire et accepter</Modal.Title>
          <p className="mb-0 small text-muted">
            {NOLVA_CGU_VERSION} - {NOLVA_CGU_EFFECTIVE_DATE}
          </p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-warning small mb-3">
          En tant que {actorLabel}, vous devez lire les Conditions Générales
          d’Utilisation avant de continuer.
        </div>
        <div
          style={{
            maxHeight: "52vh",
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: "8px",
            padding: "18px",
            background: "#fff",
            color: "#4b5966",
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
          }}
        >
          {NOLVA_CGU_TEXT}
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-column flex-sm-row gap-2 justify-content-between">
        <button
          type="button"
          className="gi-btn-2"
          onClick={() => downloadNolvaCguContract(`contrat-cgu-nolva-${actorLabel}.txt`)}
        >
          Télécharger le contrat
        </button>
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
