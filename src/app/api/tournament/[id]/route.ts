import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tournamentMocks } from "@/mock";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const isMock = process.env.MOCK === "true";

  if (isMock) {
    return NextResponse.json({ ...tournamentMocks, id });
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        tournament_level: true,
        tournament_chip_inventory: true,
        tournament_ranking: true,
        tournament_table: true,
        registration: {
          include: {
            wp_users: true,
            table_assignment: true,
            tournament_ranking: true
          }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBigInt(tournament));
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
