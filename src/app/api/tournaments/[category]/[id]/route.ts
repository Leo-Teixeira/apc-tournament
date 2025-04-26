import { Tournament } from "@/app/types";
import { tournamentMocks } from "@/mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; category: string } }
) {
  const { category, id } = await params;

  let tournamentCategory: Tournament[] = [];

  switch (category) {
    case "apt":
      tournamentCategory = tournamentMocks.filter(
        (tournament) => tournament.tournament_category == "APT"
      );
      break;
    case "ag":
      tournamentCategory = tournamentMocks.filter(
        (tournament) => tournament.tournament_category == "AG"
      );
      break;
    case "sit_and_go":
      tournamentCategory = tournamentMocks.filter(
        (tournament) => tournament.tournament_category == "Sit&Go"
      );
      break;
    case "superfinale":
      tournamentCategory = tournamentMocks.filter(
        (tournament) => tournament.tournament_category == "Superfinale"
      );
      break;
    case "solipoker":
      tournamentCategory = tournamentMocks.filter(
        (tournament) => tournament.tournament_category == "Solipoker"
      );
      break;
    default:
      tournamentCategory = [];
  }

  const result = tournamentCategory.find((tournament) => tournament.id == id);
  return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
}
