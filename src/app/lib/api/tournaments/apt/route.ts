import { NextRequest, NextResponse } from "next/server";
import { tournamentMocks } from "@/mock";

export function GET() {
  return NextResponse.json(tournamentMocks);
}
