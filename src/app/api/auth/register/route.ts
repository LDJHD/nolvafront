import { NextRequest, NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/apiConfig";

const API_URL = getServerApiUrl();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Erreur de connexion au serveur." }, { status: 503 });
  }
}
