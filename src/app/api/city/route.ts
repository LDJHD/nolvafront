import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

let citiesCache: any[] | null = null;

const getCities = async () => {
  if (!citiesCache) {
    const file = await readFile(
      path.join(process.cwd(), "src", "utility", "json", "cities.json"),
      "utf8"
    );
    citiesCache = JSON.parse(file);
  }
  return citiesCache ?? [];
};

export async function POST(req: NextRequest) {
  const data = await req.json();

  const { country_code, states_code } = data;
  const cities = await getCities();

  if (Array.isArray(cities)) {
    const returnData = cities.filter(
      (city: any) =>
        city.country_code == country_code && city.state_code == states_code
    );

    return NextResponse.json(returnData);
  }
  return NextResponse.json([]);
}
