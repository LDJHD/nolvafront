import { NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/apiConfig";

const API_URL = getServerApiUrl();

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/catalog/event-types`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json([]);
  }
}
