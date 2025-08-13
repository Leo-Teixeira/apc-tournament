import { prisma } from "@/lib/prisma";

export async function reequilibrateTables(tournamentId: number) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: BigInt(tournamentId) },
    select: { tournament_category: true }
  });

  const isAPT = tournament?.tournament_category === "APT";
  const aptMaxDefault = 8;
  const aptMaxLastTable = 9;

  // Inclure uniquement les joueurs non éliminés & Confirmed
  const tables = await prisma.tournament_table.findMany({
    where: { tournament_id: BigInt(tournamentId) },
    include: {
      table_assignment: {
        where: {
          eliminated: false,
          registration: { statut: "Confirmed" }
        },
        include: { 
          registration: {
            include: {
              wp_users: true
            }
          },
          tournament_table: true
        }
      }
    }
  });

  let changed = false;
  const moves: {
    playerName: string;
    registrationId: number;
    fromTableId: number;
    fromTableNumber?: number;
    toTableId: number;
    toTableNumber?: number;
  }[] = [];

  const allRemainingPlayers = tables.flatMap(t => t.table_assignment);

  // ----- Fusion en table unique ---------
  if (allRemainingPlayers.length === aptMaxLastTable) {
    const mainTable = tables.find(t => t.table_number === 1) || tables[0];

    for (const player of allRemainingPlayers) {
      const fromTableId = player.table_id;
      const fromTableNumber = player.tournament_table?.table_number;

      await prisma.table_assignment.update({
        where: { id: player.id },
        data: { table_id: mainTable.id, table_seat_number: undefined }
      });

      moves.push({
        playerName: player.registration?.wp_users?.pseudo_winamax ?? "??",
        registrationId: Number(player.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        toTableId: Number(mainTable.id),
        toTableNumber: mainTable.table_number
      });
    }

    // Réattribuer les sièges
    const newAssignments = allRemainingPlayers.map((p, i) =>
      prisma.table_assignment.update({
        where: { id: p.id },
        data: { table_seat_number: i + 1 }
      })
    );
    await Promise.all(newAssignments);

    // Supprimer les tables vides
    const allTables = await prisma.tournament_table.findMany({
      where: { tournament_id: BigInt(tournamentId) },
      include: { table_assignment: { where: { eliminated: false } } }
    });
    const toDelete = allTables.filter(t => t.id !== mainTable.id);
    for (const empty of toDelete) {
      await prisma.tournament_table.delete({ where: { id: empty.id } });
    }

    return { changed: true, moves };
  }

  // ----- Rééquilibrage classique ---------
  let tablesWithPlayers = tables.map(table => ({
    id: table.id,
    tableNumber: table.table_number,
    capacity: table.table_capacity,
    players: table.table_assignment
  }));

  const underfilledPlayers = tablesWithPlayers
    .filter(t => t.players.length < 4)
    .flatMap(t => t.players);

  tablesWithPlayers = tablesWithPlayers.filter(t => t.players.length >= 4);

  for (const player of underfilledPlayers) {
    const fromTableId = player.table_id;
    const fromTableNumber = player.tournament_table?.table_number;
    const targetTable = tablesWithPlayers.find(t => {
      const limit = isAPT && tablesWithPlayers.length > 1 ? aptMaxDefault : t.capacity;
      return t.players.length < limit;
    });

    if (targetTable) {
      await prisma.table_assignment.update({
        where: { id: player.id },
        data: {
          table_id: targetTable.id,
          table_seat_number: targetTable.players.length + 1
        }
      });

      targetTable.players.push({ ...player, table_id: targetTable.id });
      changed = true;

      moves.push({
        playerName: player.registration?.wp_users?.pseudo_winamax ?? "??",
        registrationId: Number(player.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        toTableId: Number(targetTable.id),
        toTableNumber: targetTable.tableNumber
      });
    }
  }

  tablesWithPlayers.sort((a, b) => a.players.length - b.players.length);

  // Déplacements max -> min
  while (tablesWithPlayers.length > 1) {
    const min = tablesWithPlayers[0];
    const max = tablesWithPlayers[tablesWithPlayers.length - 1];

    if (max.players.length - min.players.length > 1) {
      const movedPlayer = max.players.pop();
      if (!movedPlayer) break;

      const fromTableId = max.id;
      const fromTableNumber = max.tableNumber;

      await prisma.table_assignment.update({
        where: { id: movedPlayer.id },
        data: {
          table_id: min.id,
          table_seat_number: min.players.length + 1
        }
      });

      min.players.push({ ...movedPlayer, table_id: min.id });
      changed = true;

      moves.push({
        playerName: movedPlayer.registration?.wp_users?.pseudo_winamax ?? "??",
        registrationId: Number(movedPlayer.registration_id),
        fromTableId: Number(fromTableId), // ✅ conversion
        fromTableNumber,
        toTableId: Number(min.id), // ✅ conversion
        toTableNumber: min.tableNumber
      });
      

      tablesWithPlayers.sort((a, b) => a.players.length - b.players.length);
      continue;
    }
    break;
  }

  // Supprimer tables vides
  const allTables = await prisma.tournament_table.findMany({
    where: { tournament_id: BigInt(tournamentId) },
    include: {
      table_assignment: { where: { eliminated: false, registration: { statut: "Confirmed" } } }
    }
  });
  const toDelete = allTables.filter(t => t.table_assignment.length === 0);
  for (const empty of toDelete) {
    await prisma.tournament_table.delete({ where: { id: empty.id } });
  }

  return { changed, moves };
}
