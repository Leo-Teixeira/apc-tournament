import { NextRequest, NextResponse } from "next/server";
import { registrationMocks } from "@/mock";
import { prisma } from "@/lib/prisma";
import { tournament_tournament_category } from "@/generated/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const isMock = process.env.MOCK === "true";

const categoryMap: Record<string, tournament_tournament_category> = {
  apt: tournament_tournament_category.APT,
  ag: tournament_tournament_category.AG,
  sit_and_go: tournament_tournament_category.SitAndGo,
  superfinale: tournament_tournament_category.Superfinale,
  solipoker: tournament_tournament_category.Solipoker
};

export async function GET(
  _: NextRequest,
  { params }: { params: { category: string } }
) {
  const { category } = params;

  if (isMock) {
    const normalizedCategory = categoryMap[category];
    const result = normalizedCategory
      ? registrationMocks.filter(
          (r) => r.tournament_id.tournament_category === normalizedCategory
        )
      : [];

    return NextResponse.json(result);
  }

  const mappedCategory = categoryMap[category];
  if (!mappedCategory) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    const registrations = await prisma.registration.findMany({
      include: { tournament: true },
      where: {
        tournament: {
          tournament_category: mappedCategory
        }
      }
    });

    return NextResponse.json(serializeBigInt(registrations));
  } catch (error) {
    console.error("Error fetching registrations by category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
