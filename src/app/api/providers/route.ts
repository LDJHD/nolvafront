import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = searchParams.toString();
    const url = `${API_URL}/providers${params ? "?" + params : ""}`;

    const token = req.headers.get("authorization") || "";
    const res = await fetch(url, {
      headers: { Authorization: token, "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Impossible de joindre le serveur" }, { status: 503 });
  }
}

export { GET as POST };
