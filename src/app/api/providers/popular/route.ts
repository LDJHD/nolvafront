import { NextRequest, NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/apiConfig";

const API_URL = getServerApiUrl();

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/providers/popular`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("[providers/popular] Backend returned", res.status);
      return NextResponse.json([], { status: 200 });
    }

    const raw = await res.json();
    // Le backend peut retourner un tableau direct ou un objet pagine {data: [...]}
    const data = Array.isArray(raw) ? raw : raw.data || [];
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[providers/popular] Error:", err.message);
    return NextResponse.json([]);
  }
}

export { GET as POST };
