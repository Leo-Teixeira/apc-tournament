import { Registration } from "@/app/types";
import { registrationMocks } from "@/mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; category: string } }
) {
  const { category, id } = await params;

  let registrationCategory: Registration[] = [];

  switch (category) {
    case "apt":
      registrationCategory = registrationMocks.filter(
        (registration) =>
          registration.tournament_id.tournament_category == "APT"
      );
      break;
    case "ag":
      registrationCategory = registrationMocks.filter(
        (registration) => registration.tournament_id.tournament_category == "AG"
      );
      break;
    case "sit_and_go":
      registrationCategory = registrationMocks.filter(
        (registration) =>
          registration.tournament_id.tournament_category == "Sit&Go"
      );
      break;
    case "superfinale":
      registrationCategory = registrationMocks.filter(
        (registration) =>
          registration.tournament_id.tournament_category == "Superfinale"
      );
      break;
    case "solipoker":
      registrationCategory = registrationMocks.filter(
        (registration) =>
          registration.tournament_id.tournament_category == "Solipoker"
      );
      break;
    default:
      registrationCategory = [];
  }

  const result = registrationCategory.filter((tournament) => tournament.id == id);
  return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
}
