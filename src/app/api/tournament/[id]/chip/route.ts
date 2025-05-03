import { tournamentChipInventoryMocks } from "@/mock/tournament_chip_inventory.mock";
import { chipMocks } from "@/mock/chip.mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const chips = tournamentChipInventoryMocks
    .filter((entry) =>
      typeof entry.tournament_id === "string"
        ? entry.tournament_id === id
        : entry.tournament_id.id === id
    )
    .map((entry) => {
      const chip = chipMocks.find((c) => c.id === entry.chip_id.id);

      return {
        image: chip?.chip_image ?? "",
        value: chip?.value ?? 0,
        player_quantity: entry.chip_player_quantity
      };
    });

  return NextResponse.json({ chips });
}
