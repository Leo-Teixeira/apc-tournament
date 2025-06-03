import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tournament_name,
      tournament_description,
      tournament_start_date,
      tournament_end_date,
      tournament_open_date,
      tournament_trimestry,
      tournament_category,
      tournament_status = "in_coming",
      tournament_stack = 1
    } = body;

    const estimate_duration = new Date(
      new Date(tournament_end_date).getTime() -
        new Date(tournament_start_date).getTime()
    );

    const createdTournament = await prisma.tournament.create({
      data: {
        tournament_name,
        tournament_description,
        tournament_start_date: new Date(tournament_start_date),
        tournament_open_date: new Date(tournament_open_date),
        tournament_trimestry,
        tournament_category,
        tournament_status,
        tournament_stack,
        estimate_duration
      }
    });

    return NextResponse.json(serializeBigInt(createdTournament));
  } catch (err) {
    console.error("Error creating tournament from WordPress:", err);
    return NextResponse.json(
      { error: "Failed to sync tournament" },
      { status: 500 }
    );
  }
}
