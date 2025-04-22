import { NextRequest, NextResponse } from "next/server";
import { registrationMocks, tournamentMocks } from "@/mock";

export function GET() {
  return NextResponse.json(registrationMocks);
}
