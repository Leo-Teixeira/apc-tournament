import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { extractParamsFromPath } from "@/app/utils/api-params";

function findNextAvailableSeat(assignments: { table_seat_number: number | null }[]) {
  const seats = assignments
    .map(a => a.table_seat_number)
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);
  let seat = 1;
  for (const s of seats) {
    if (s === seat) seat++;
    else break;
  }
  return seat;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(req: NextRequest) {
  const { tournament } = extractParamsFromPath(req, ["tournament"]);

  if (!tournament) {
    return NextResponse.json({ error: "Missing tournament ID" }, { status: 400 });
  }

  try {
    const tournamentId = parseInt(tournament, 10);
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
    }

    const body = await req.json();
    const { pseudo, firstName, lastName } = body;
    if (!pseudo) {
      return NextResponse.json({ error: "Missing pseudo" }, { status: 400 });
    }

    // Transaction regroupée pour sécurité et cohérence
    const result = await prisma.$transaction(async (tx) => {
      // Vérifie si déjà inscrit
      const existingRegistration = await tx.registration.findFirst({
        where: {
          tournament_id: BigInt(tournamentId),
          wp_users: { pseudo_winamax: pseudo }
        }
      });
      if (existingRegistration) {
        return { error: "Player already registered", status: 409 };
      }

      // Récupérer ou créer utilisateur
      let user = await tx.wp_users.findFirst({ where: { pseudo_winamax: pseudo } });
      if (!user) {
        user = await tx.wp_users.create({
          data: {
            user_login: pseudo,
            user_pass: "",
            user_nicename: `${firstName} ${lastName}`,
            user_email: `${pseudo}@external.com`,
            display_name: `${firstName} ${lastName}`,
            pseudo_winamax: pseudo,
            user_registered: new Date(),
            photo_url: ""
          }
        });
        await tx.wp_usermeta.create({
          data: {
            user_id: user.ID,
            meta_key: "wp_capabilities",
            meta_value: 'a:1:{s:16:"um_custom_role_1";b:1;}'
          }
        });
      }

      // Inscription au tournoi
      const registration = await tx.registration.create({
        data: {
          user_id: user.ID,
          tournament_id: BigInt(tournamentId),
          statut: "Confirmed",
          inscription_date: new Date()
        }
      });

      // Récupérer tables et assignments avec sélections ciblées
      const tables = await tx.tournament_table.findMany({
        where: { tournament_id: BigInt(tournamentId) },
        include: { table_assignment: { select: { table_seat_number: true } } }
      });

      if (tables.length === 0) {
        return { message: "Player registered but no tables exist yet" };
      }

      // Filtrer les tables avec le moins d'assignations
      const minCount = Math.min(...tables.map(t => t.table_assignment.length));
      const candidateTables = tables.filter(t => t.table_assignment.length === minCount);

      // Choisir aléatoirement une table parmi celles avec le moins de joueurs
      const shuffledTables = shuffleArray(candidateTables);
      const targetTable = shuffledTables[0];

      // Trouver prochain siège libre
      const seatNumber = findNextAvailableSeat(targetTable.table_assignment);

      // Créer assignment joueur-table
      await tx.table_assignment.create({
        data: {
          registration_id: registration.id,
          table_id: targetTable.id,
          table_seat_number: seatNumber,
          eliminated: false,
          user_kill_id: null
        }
      });

      return { message: "Player registered and assigned to the least filled table" };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(serializeBigInt(result));
  } catch (error) {
    console.error("Error registering player:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
