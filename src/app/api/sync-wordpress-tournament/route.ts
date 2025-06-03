import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

function parseTimeToDate(time: string): Date {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const base = new Date(0);
  base.setUTCHours(hours);
  base.setUTCMinutes(minutes);
  base.setUTCSeconds(seconds || 0);
  return base;
}

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

    const createdTournament = await prisma.tournament.create({
      data: {
        tournament_name,
        tournament_description,
        tournament_start_date: new Date(tournament_start_date),
        tournament_open_date: new Date(tournament_open_date),
        estimate_duration: parseTimeToDate(estimate_duration),
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
