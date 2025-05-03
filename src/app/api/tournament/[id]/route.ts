import { Tournament } from "@/app/types";
import { tournamentMocks } from "@/mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const result = tournamentMocks.find((tournament) => tournament.id == id);
  return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
}
