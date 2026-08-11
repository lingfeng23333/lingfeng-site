import { NextResponse } from "next/server";
import { getRandomQuote } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getRandomQuote());
}
