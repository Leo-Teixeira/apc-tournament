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
    } = body;
    
    let tournament_stack = body.tournament_stack;
    

    // Validation ou récupération du stack valide
    if (!tournament_stack) {
      // Récupérer le premier stack
      const firstStack = await prisma.stack.findFirst({
        orderBy: { id: "asc" },
      });
      if (!firstStack) {
        return NextResponse.json({ error: "No stack found" }, { status: 400 });
      }
      tournament_stack = firstStack.id;
    } else {
      // Vérifier que le stack existe
      const stackExists = await prisma.stack.findUnique({
        where: { id: tournament_stack }
      });
      if (!stackExists) {
        // Si l'id stack envoyé n'existe pas, récupérer le premier stack
        const firstStack = await prisma.stack.findFirst({
          orderBy: { id: "asc" }
        });
        if (!firstStack) {
          return NextResponse.json({ error: "No stack found" }, { status: 400 });
        }
        tournament_stack = firstStack.id;
      }
    }

    // Le reste de ton code (trimester, season, etc.) reste inchangé

    // ... [Validation trimester, season et création tournoi]

    const trimmedNumberMatch = tournament_trimestry.match(/^T(\d)$/);
    if (!trimmedNumberMatch) {
      return NextResponse.json({ error: "Invalid trimester format" }, { status: 400 });
    }
    const trimesterNumber = parseInt(trimmedNumberMatch[1], 10);

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


