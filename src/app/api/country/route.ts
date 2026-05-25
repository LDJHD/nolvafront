import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

let countriesCache: any[] | null = null;

const getCountries = async () => {
  if (!countriesCache) {
    const file = await readFile(
      path.join(process.cwd(), "src", "utility", "json", "countries.json"),
      "utf8"
    );
    countriesCache = JSON.parse(file);
  }
  return countriesCache ?? [];
};

export async function POST(req: NextRequest) {
  return NextResponse.json(await getCountries());
}
