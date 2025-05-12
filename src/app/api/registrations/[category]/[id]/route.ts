import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registrationMocks } from "@/mock";
import { Tournament, Registration } from "@/app/types";
import { tournament_tournament_category } from "@/generated/prisma";

const MOCK_MODE = process.env.MOCK === "true";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; category: string } }
) {
  const { category, id } = await params;

  if (MOCK_MODE) {
    let registrationCategory: Registration[] = [];

    switch (category) {
      case "apt":
        registrationCategory = registrationMocks.filter(
          (r) => r.tournament_id.tournament_category === "APT"
        );
        break;
      case "ag":
        registrationCategory = registrationMocks.filter(
          (r) => r.tournament_id.tournament_category === "AG"
        );
        break;
      case "sit_and_go":
        registrationCategory = registrationMocks.filter(
          (r) => r.tournament_id.tournament_category === "Sit&Go"
        );
        break;
      case "superfinale":
        registrationCategory = registrationMocks.filter(
          (r) => r.tournament_id.tournament_category === "Superfinale"
        );
        break;
      case "solipoker":
        registrationCategory = registrationMocks.filter(
          (r) => r.tournament_id.tournament_category === "Solipoker"
        );
        break;
      default:
        registrationCategory = [];
    }

    const result = registrationCategory.filter((r) => {
      const tournament = r.tournament_id as Tournament;
      return tournament.id === id;
    });

    return NextResponse.json(result);
  }

  try {
    const categoryMap: Record<string, tournament_tournament_category> = {
      apt: tournament_tournament_category.APT,
      ag: tournament_tournament_category.AG,
      sit_and_go: tournament_tournament_category.SitAndGo,
      superfinale: tournament_tournament_category.Superfinale,
      solipoker: tournament_tournament_category.Solipoker
    };

    const registrations = await prisma.registration.findMany({
      where: {
        tournament_id: parseInt(id),
        tournament: {
          tournament_category: categoryMap[category]
        }
      },
      include: {
        tournament: true
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
