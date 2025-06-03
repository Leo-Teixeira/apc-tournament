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
      tournament_open_date,
      tournament_trimestry,
      tournament_category,
      estimate_duration,
      tournament_status = "in_coming",
      tournament_stack = 1
    } = body;

    // On s'assure que estimate_duration est bien une string de type HH:MM:SS
    const isValidDuration =
      typeof estimate_duration === "string" &&
      /^\d{2}:\d{2}:\d{2}$/.test(estimate_duration);
    if (!isValidDuration) {
      return NextResponse.json(
        { error: "estimate_duration must be a string in HH:MM:SS format" },
        { status: 400 }
      );
    }

    const createdTournament = await prisma.tournament.create({
      data: {
        tournament_name,
        tournament_description,
        tournament_start_date: new Date(tournament_start_date),
        tournament_open_date: new Date(tournament_open_date),
        estimate_duration,
        tournament_trimestry,
        tournament_category,
        tournament_status,
        tournament_stack
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
