import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/events?page=1&limit=10`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("[events/upcoming] Backend returned", res.status);
      return NextResponse.json([], { status: 200 });
    }

    const raw = await res.json();
    // Le backend paginates: retourne { meta: {...}, data: [...] }
    const data = Array.isArray(raw) ? raw : raw.data || [];
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[events/upcoming] Error:", err.message);
    return NextResponse.json([]);
  }
}

export { GET as POST };
