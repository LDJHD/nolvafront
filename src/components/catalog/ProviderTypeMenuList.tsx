"use client";
import Link from "next/link";
import { useProviderTypes } from "@/lib/useCatalog";

const ICONS: Record<string, string> = {
  dj: "fi-rr-music-alt",
  photographe: "fi-rr-camera",
  hotesse: "fi-rr-user",
  animateur: "fi-rr-microphone",
  securite: "fi-rr-shield-check",
  artiste: "fi-rr-star",
  organisateur: "fi-rr-calendar",
  location_materiel: "fi-rr-box",
  comedien: "fi-rr-laugh",
  traiteur: "fi-rr-restaurant",
  decorateur: "fi-rr-flower",
  videaste: "fi-rr-video-camera",
};

export default function ProviderTypeMenuList() {
  const { types } = useProviderTypes();

  return (
    <>
      {types.slice(0, 10).map((type, index) => (
        <li key={type.slug} style={{ padding: "8px 20px" }}>
          <Link
            href={`/prestataires?type=${type.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <i className={`fi ${ICONS[type.slug] || "fi-rr-briefcase"}`}></i>
            {type.label}
          </Link>
        </li>
      ))}
    </>
  );
}
