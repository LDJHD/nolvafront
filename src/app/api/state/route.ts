import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

type State = {
  country_code: string;
  [key: string]: unknown;
};

let statesCache: State[] | null = null;

const getStates = async () => {
  if (!statesCache) {
    const file = await readFile(
      path.join(process.cwd(), "src", "utility", "json", "states.json"),
      "utf8"
    );
    statesCache = JSON.parse(file);
  }
  return statesCache ?? [];
};

export async function POST(req: NextRequest) {

   
  const data  = await req.json()

  const { country_code } = data;
  const states = await getStates();

  const returnData = states.filter((state) => state.country_code == country_code );

  
  return NextResponse.json(returnData);
}
