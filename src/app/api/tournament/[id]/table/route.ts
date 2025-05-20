import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = BigInt(params.id);

    const tables = await prisma.tournament_table.findMany({
      where: {
        tournament_id: tournamentId
      },
      orderBy: {
        table_number: "asc"
      }
    });

    return NextResponse.json(serializeBigInt(tables));
  } catch (error) {
    console.error("❌ Error fetching tables:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
