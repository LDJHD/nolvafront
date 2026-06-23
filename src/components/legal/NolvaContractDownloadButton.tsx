"use client";
import Link from "next/link";

type Props = {
  actorLabel?: "client" | "prestataire";
  className?: string;
  label?: string;
};

const NolvaContractDownloadButton = ({
  className = "gi-btn-2",
  label = "LIRE LE CONTRAT NOLVA",
}: Props) => (
  <Link href="/terms-condition" target="_blank" className={className} style={{ textDecoration: "none" }}>
    {label}
  </Link>
);

export default NolvaContractDownloadButton;
