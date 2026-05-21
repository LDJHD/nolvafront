"use client";
import Link from "next/link";
import { useProviderTypes } from "@/lib/useCatalog";

const ICONS: Record<string, string> = {
  dj: "fi-rr-music-alt",
  photographe: "fi-rr-camera",
  animateur: "fi-rr-microphone",
  hotesse: "fi-rr-user",
  securite: "fi-rr-shield-check",
  artiste: "fi-rr-guitar",
  organisateur: "fi-rr-calendar",
  location_materiel: "fi-rr-box",
};

type Props = {
  variant?: "menu" | "footer";
};

export default function ProviderTypeLinks({ variant = "menu" }: Props) {
  const { types } = useProviderTypes();

  if (variant === "footer") {
    return (
      <>
        {types.slice(0, 8).map((type) => (
          <li key={type.slug} className="gi-footer-link">
            <Link href={`/prestataires?type=${type.slug}`}>{type.label}</Link>
          </li>
        ))}
      </>
    );
  }

  return (
    <>
      {types.slice(0, 8).map((type, index) => (
        <li key={type.slug} className={index === types.length - 1 ? "last" : ""}>
          <Link href={`/prestataires?type=${type.slug}`}>
            <i className={`fi ${ICONS[type.slug] || "fi-rr-briefcase"}`}></i>
            {type.label}
          </Link>
        </li>
      ))}
    </>
  );
}
