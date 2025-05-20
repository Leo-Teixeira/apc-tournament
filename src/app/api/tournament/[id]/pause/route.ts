import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tournamentId = BigInt(params.id);
  try {
    const { pause } = await req.json();

    if (typeof pause !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { tournament_pause: pause }
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (err) {
    console.error("❌ Error updating pause state:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
