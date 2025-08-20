import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

function parseTimeToDateObject(time: string): Date {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const now = new Date();
  now.setHours(hours);
  now.setMinutes(minutes);
  now.setSeconds(seconds || 0);
  now.setMilliseconds(0);
  return now;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      wordpress_post_id,
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

    const trimesterNumberMatch = tournament_trimestry.match(/^T(\d)$/);
    if (!trimesterNumberMatch) {
      return NextResponse.json({ error: "Invalid trimester format" }, { status: 400 });
    }
    const trimesterNumber = parseInt(trimesterNumberMatch[1], 10);

    const currentSeason = await prisma.season.findFirst({
      where: {
        status: 'in_progress',
      }
    });

    if (!currentSeason) {
      return NextResponse.json({ error: "Current season not found" }, { status: 400 });
    }

    const trimester = await prisma.trimester.findFirst({
      where: {
        number: trimesterNumber,
        season_id: currentSeason.id,
      }
    });

    if (!trimester) {
      return NextResponse.json({ error: "Trimester not found for current season" }, { status: 400 });
    }

    const createdTournament = await prisma.tournament.create({
      data: {
        wordpress_post_id,
        tournament_name,
        tournament_description,
        tournament_start_date: new Date(tournament_start_date),
        tournament_open_date: new Date(tournament_open_date),
        estimate_duration: parseTimeToDateObject(estimate_duration),
        tournament_trimestry: trimester.id,
        tournament_category,
        tournament_status,
        tournament_stack
      }
    });

    return NextResponse.json(serializeBigInt(createdTournament));

  } catch (err) {
    console.error("Error creating tournament from WordPress:", err);
    return NextResponse.json({ error: "Failed to sync tournament" }, { status: 500 });
  }
}

