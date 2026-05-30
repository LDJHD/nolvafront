import { NextRequest, NextResponse } from "next/server";

const nolvaCategories = [
  { id: 1, num: "1", name: "DJs", icon: "fi fi-rr-music", slug: "dj", image: "/assets/img/categories/dj.png" },
  { id: 2, num: "2", name: "Photographes", icon: "fi fi-rr-camera", slug: "photographe", image: "/assets/img/categories/photo.png" },
  { id: 3, num: "3", name: "Hotesses", icon: "fi fi-rr-users", slug: "hotesse", image: "/assets/img/categories/hotesse.png" },
  { id: 4, num: "4", name: "Animateurs", icon: "fi fi-rr-smile", slug: "animateur", image: "/assets/img/categories/animateur.png" },
  { id: 5, num: "5", name: "Espace / Salle des fêtes", icon: "fi fi-rr-home-location", slug: "salle", image: "/assets/img/categories/securite.png" },
  { id: 6, num: "6", name: "Artistes", icon: "fi fi-rr-music-note", slug: "artiste", image: "/assets/img/categories/artiste.png" },
  { id: 7, num: "7", name: "Organisateurs", icon: "fi fi-rr-calendar", slug: "organisateur", image: "/assets/img/categories/organisateur.png" },
  { id: 8, num: "8", name: "Loc. Materiel", icon: "fi fi-rr-settings", slug: "location_materiel", image: "/assets/img/categories/materiel.png" },
];

export async function POST(req: NextRequest) {
  return NextResponse.json(nolvaCategories);
}
