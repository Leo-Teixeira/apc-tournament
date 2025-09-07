import { prisma } from "@/lib/prisma";

// 🔎 Fonction utilitaire pour trouver le prochain siège disponible dans une table
function findNextAvailableSeat(players: { table_seat_number: number | null }[], startSeat: number = 1): number {
  const occupied = new Set(players.map(p => p.table_seat_number).filter((n): n is number => n !== null));
  let seat = startSeat;
  while (occupied.has(seat)) {
    seat++;
  }
  return seat;
}

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

    // Déplacer tous les joueurs dans la même table
    for (const player of allRemainingPlayers) {
      const fromTableId = player.table_id;
      const fromTableNumber = player.tournament_table?.table_number;

      await prisma.table_assignment.update({
        where: { id: player.id },
        data: { table_id: mainTable.id, table_seat_number: undefined } // reset pour réassigner ensuite correctement
      });

      moves.push({
        playerName: player.registration?.wp_users?.display_name ?? "??",
        registrationId: Number(player.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        toTableId: Number(mainTable.id),
        toTableNumber: mainTable.table_number
      });
    }

    // Réattribuer les sièges sans doublon
    const updatedAssignments: Promise<any>[] = [];
    const tempPlayers: any[] = [];

    for (const player of allRemainingPlayers) {
      const nextSeat = findNextAvailableSeat(tempPlayers);
      tempPlayers.push({ ...player, table_seat_number: nextSeat });

      updatedAssignments.push(
        prisma.table_assignment.update({
          where: { id: player.id },
          data: { table_seat_number: nextSeat }
        })
      );
    }
    await Promise.all(updatedAssignments);

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

  // Récupérer les joueurs des tables trop petites (< 4)
  const underfilledPlayers = tablesWithPlayers
    .filter(t => t.players.length < 4)
    .flatMap(t => t.players);

  tablesWithPlayers = tablesWithPlayers.filter(t => t.players.length >= 4);

  // Déplacer les joueurs des petites tables
  for (const player of underfilledPlayers) {
    const fromTableId = player.table_id;
    const fromTableNumber = player.tournament_table?.table_number;
    const targetTable = tablesWithPlayers.find(t => {
      const limit = isAPT && tablesWithPlayers.length > 1 ? aptMaxDefault : t.capacity;
      return t.players.length < limit;
    });

    if (targetTable) {
      const nextSeat = findNextAvailableSeat(targetTable.players);

      await prisma.table_assignment.update({
        where: { id: player.id },
        data: {
          table_id: targetTable.id,
          table_seat_number: nextSeat
        }
      });

      targetTable.players.push({ ...player, table_id: targetTable.id, table_seat_number: nextSeat });
      changed = true;

      moves.push({
        playerName: player.registration?.wp_users?.display_name ?? "??",
        registrationId: Number(player.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        toTableId: Number(targetTable.id),
        toTableNumber: targetTable.tableNumber
      });
    }
  }

  // Rééquilibrage max -> min
  tablesWithPlayers.sort((a, b) => a.players.length - b.players.length);

  while (tablesWithPlayers.length > 1) {
    const min = tablesWithPlayers[0];
    const max = tablesWithPlayers[tablesWithPlayers.length - 1];

    if (max.players.length - min.players.length > 1) {
      const movedPlayer = max.players.pop();
      if (!movedPlayer) break;

      const fromTableId = max.id;
      const fromTableNumber = max.tableNumber;
      const nextSeat = findNextAvailableSeat(min.players);

      await prisma.table_assignment.update({
        where: { id: movedPlayer.id },
        data: {
          table_id: min.id,
          table_seat_number: nextSeat
        }
      });

      min.players.push({ ...movedPlayer, table_id: min.id, table_seat_number: nextSeat });
      changed = true;

      moves.push({
        playerName: movedPlayer.registration?.wp_users?.display_name ?? "??",
        registrationId: Number(movedPlayer.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        toTableId: Number(min.id),
        toTableNumber: min.tableNumber
      });

      // Resort pour continuer
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
