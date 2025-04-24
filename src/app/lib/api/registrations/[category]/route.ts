import { NextRequest, NextResponse } from "next/server";
import { registrationMocks } from "@/mock";

export async function GET(
  req: NextRequest,
  { params }: { params: { category: string; id: string } }
) {
  const { category, id } = params;

  switch (category) {
    case "apt":
      return NextResponse.json(
        registrationMocks.filter(
          (tournament) => tournament.tournament_id.tournament_category == "APT"
        )
      );
    case "ag":
      return NextResponse.json(
        registrationMocks.filter(
          (tournament) => tournament.tournament_id.tournament_category == "AG"
        )
      );
    case "sit_and_go":
      return NextResponse.json(
        registrationMocks.filter(
          (tournament) =>
            tournament.tournament_id.tournament_category == "Sit&Go"
        )
      );
    case "superfinale":
      return NextResponse.json(
        registrationMocks.filter(
          (tournament) =>
            tournament.tournament_id.tournament_category == "Superfinale"
        )
      );
    case "solipoker":
      return NextResponse.json(
        registrationMocks.filter(
          (tournament) =>
            tournament.tournament_id.tournament_category == "Solipoker"
        )
      );
    default:
      return NextResponse.json(registrationMocks);
  }
}
