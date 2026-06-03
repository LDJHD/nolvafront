"use client";
import { downloadNolvaCguContract } from "@/lib/nolvaCguContract";

type Props = {
  actorLabel?: "client" | "prestataire";
  className?: string;
  label?: string;
};

const NolvaContractDownloadButton = ({
  actorLabel = "client",
  className = "gi-btn-2",
  label = "Télécharger le contrat NOLVA",
}: Props) => (
  <button
    type="button"
    className={className}
    onClick={() => downloadNolvaCguContract(`contrat-cgu-nolva-${actorLabel}.txt`)}
  >
    {label}
  </button>
);

export default NolvaContractDownloadButton;
