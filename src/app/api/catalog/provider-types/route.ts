import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/catalog/provider-types`, {
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
