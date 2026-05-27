import { NextRequest, NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/apiConfig";

const API_URL = getServerApiUrl();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/events/${id}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Evenement introuvable" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 503 }
    );
  }
}

export { GET as POST };
