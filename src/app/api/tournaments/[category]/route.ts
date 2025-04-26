import { NextRequest, NextResponse } from "next/server";
import { tournamentMocks } from "@/mock";

export async function GET(
  _: NextRequest,
  { params }: { params: { category: string; } }
) {
  const { category } = await params;

  switch (category) {
    case "apt":
      return NextResponse.json(
        tournamentMocks.filter(
          (tournament) => tournament.tournament_category == "APT"
        )
      );
    case "ag":
      return NextResponse.json(
        tournamentMocks.filter(
          (tournament) => tournament.tournament_category == "AG"
        )
      );
    case "sit_and_go":
      return NextResponse.json(
        tournamentMocks.filter(
          (tournament) => tournament.tournament_category == "Sit&Go"
        )
      );
    case "superfinale":
      return NextResponse.json(
        tournamentMocks.filter(
          (tournament) => tournament.tournament_category == "Superfinale"
        )
      );
    case "solipoker":
      return NextResponse.json(
        tournamentMocks.filter(
          (tournament) => tournament.tournament_category == "Solipoker"
        )
      );
    default:
      return NextResponse.json(tournamentMocks);
  }
}
