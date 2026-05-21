import { NextRequest, NextResponse } from "next/server";

const nolvaServices = [
  {
    id: 1,
    icon: "fi fi-rr-shield-check",
    name: "Paiement securise",
    title: "Le prestataire est paye apres validation de la prestation."
  },
  {
    id: 2,
    icon: "fi fi-rr-star",
    name: "Prestataires selectionnes",
    title: "Tous nos prestataires sont verifies et evalues par NOLVA."
  },
  {
    id: 3,
    icon: "fi fi-rr-handshake",
    name: "Litiges geres par NOLVA",
    title: "En cas de probleme, notre equipe intervient pour vous proteger."
  },
  {
    id: 4,
    icon: "fi fi-rr-search",
    name: "Recherche gratuite",
    title: "Recherchez et contactez des prestataires sans creer de compte."
  },
];

export async function POST(req: NextRequest) {
  return NextResponse.json(nolvaServices);
}
