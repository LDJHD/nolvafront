import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/providers/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Prestataire introuvable" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 503 });
  }
}

export { GET as POST };
