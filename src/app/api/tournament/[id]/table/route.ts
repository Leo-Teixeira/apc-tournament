import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const assignements = await prisma.table_assignment.findMany({
      where: {
        tournament_table: {
          tournament_id: BigInt(tournamentId)
        }
      },
      include: {
        registration: {
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                photo_url: true,
                display_name: true,
                user_status: true,
                user_url: true,
                user_email: true,
                user_nicename: true,
                user_login: true
              }
            }
          }
        },
        tournament_table: {
          select: {
            id: true,
            table_number: true,
            table_capacity: true
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(assignements));
  } catch (error) {
    console.error("Error fetching table assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    console.log("Tournament ID reçu :", tournamentId);

    if (isNaN(tournamentId)) {
      console.error("ID de tournoi invalide :", params.id);
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const registrations = await prisma.registration.findMany({
      where: {
        tournament_id: BigInt(tournamentId),
        statut: "Confirmed"
      }
    });

    console.log("Nombre d'inscriptions confirmées :", registrations.length);

    const shuffled = registrations.sort(() => Math.random() - 0.5);
    const totalPlayers = shuffled.length;
    const maxPerTable = 9;

    const numberOfTables = Math.ceil(totalPlayers / maxPerTable);
    const baseCapacity = Math.floor(totalPlayers / numberOfTables);
    const extraPlayers = totalPlayers % numberOfTables;

    const tableCapacities = Array(numberOfTables)
      .fill(baseCapacity)
      .map((cap, index) => (index < extraPlayers ? cap + 1 : cap));

    console.log("Capacités calculées :", tableCapacities);

    const createdTables = await prisma.$transaction(async (tx) => {
      const tables = [];

      for (let i = 0; i < numberOfTables; i++) {
        const table = await tx.tournament_table.create({
          data: {
            tournament_id: BigInt(tournamentId),
            table_number: i + 1,
            table_capacity: tableCapacities[i]
          }
        });
        console.log(`Table ${table.table_number} créée avec ID ${table.id}`);
        tables.push(table);
      }

      let currentIndex = 0;

      for (let i = 0; i < numberOfTables; i++) {
        const table = tables[i];
        const tablePlayers = shuffled.slice(
          currentIndex,
          currentIndex + tableCapacities[i]
        );

        console.log(
          `→ Affectation de ${tablePlayers.length} joueurs à la table ${table.table_number}`
        );

        for (let j = 0; j < tablePlayers.length; j++) {
          await tx.table_assignment.create({
            data: {
              registration_id: tablePlayers[j].id,
              table_id: table.id,
              table_seat_number: j + 1
            }
          });

          console.log(`   - Joueur ID ${tablePlayers[j].id} → place ${j + 1}`);
        }

        currentIndex += tableCapacities[i];
      }

      return tables;
    });

    console.log("Création terminée :", createdTables.length, "tables");

    return NextResponse.json(
      serializeBigInt({
        message: "Tables and assignments created",
        createdTables
      })
    );
  } catch (error) {
    console.error("Erreur lors de la génération des tables :", error);
    return NextResponse.json(
      { error: "Failed to generate tables" },
      { status: 500 }
    );
  }
}
