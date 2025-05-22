import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    console.log("🎯 Tournament ID reçu :", tournamentId);

    if (isNaN(tournamentId)) {
      console.error("⛔ ID de tournoi invalide :", params.id);
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existingTables = await prisma.tournament_table.findMany({
      where: {
        tournament_id: BigInt(tournamentId)
      },
      select: { id: true }
    });

    if (existingTables.length > 0) {
      const tableIds = existingTables.map((t) => t.id);
      console.log("🧹 Suppression des anciennes tables :", tableIds);

      await prisma.$transaction([
        prisma.table_assignment.deleteMany({
          where: { table_id: { in: tableIds } }
        }),
        prisma.tournament_table.deleteMany({
          where: { id: { in: tableIds } }
        })
      ]);

      console.log("✅ Anciennes affectations et tables supprimées");
    }

    const registrations = await prisma.registration.findMany({
      where: {
        tournament_id: BigInt(tournamentId),
        statut: "Confirmed"
      }
    });

    const shuffled = registrations.sort(() => Math.random() - 0.5);
    const totalPlayers = shuffled.length;
    const maxPerTable = 9;

    const numberOfTables = Math.ceil(totalPlayers / maxPerTable);
    const baseCapacity = Math.floor(totalPlayers / numberOfTables);
    const extraPlayers = totalPlayers % numberOfTables;

    const tableCapacities = Array(numberOfTables)
      .fill(baseCapacity)
      .map((cap, index) => (index < extraPlayers ? cap + 1 : cap));

    console.log("🪑 Capacités calculées :", tableCapacities);

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
        tables.push(table);
      }

      let currentIndex = 0;

      for (let i = 0; i < numberOfTables; i++) {
        const table = tables[i];
        const players = shuffled.slice(
          currentIndex,
          currentIndex + tableCapacities[i]
        );

        for (let j = 0; j < players.length; j++) {
          await tx.table_assignment.create({
            data: {
              registration_id: players[j].id,
              table_id: table.id,
              table_seat_number: j + 1
            }
          });
        }

        currentIndex += tableCapacities[i];
      }

      return tables;
    });

    console.log("🏁 Création terminée :", createdTables.length, "tables");

    return NextResponse.json(
      serializeBigInt({
        message: "Tables and assignments created",
        createdTables
      })
    );
  } catch (error) {
    console.error("❌ Erreur lors de la génération des tables :", error);
    return NextResponse.json(
      { error: "Failed to generate tables" },
      { status: 500 }
    );
  }
}
