import { NextRequest, NextResponse } from "next/server";
import { tournamentChipInventoryMocks } from "@/mock/tournament_chip_inventory.mock";
import { chipMocks } from "@/mock/chip.mock";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const isMock = process.env.MOCK === "true";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const tournamentId = parseInt(id);
  if (isNaN(tournamentId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  if (isMock) {
    const chips = tournamentChipInventoryMocks
      .filter((entry) =>
        typeof entry.tournament_id === "string"
          ? entry.tournament_id === params.id
          : entry.tournament_id.id === params.id
      )
      .map((entry) => {
        const chip = chipMocks.find((c) => c.id === entry.chip_id.id);

        return {
          image: chip?.chip_image ?? "",
          value: chip?.value ?? 0,
          player_quantity: entry.chip_player_quantity
        };
      });

    return NextResponse.json(serializeBigInt(chips));
  }

  try {
    const chips = await prisma.tournament_chip_inventory.findMany({
      where: { tournament_id: BigInt(id) },
      include: {
        chip: {
          include: {
            stack: true,
            tournament_chip_inventory: true
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(chips));
  } catch (error) {
    console.error("Error fetching chips:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
