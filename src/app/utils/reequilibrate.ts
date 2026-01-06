import { prisma } from "@/lib/prisma";

// 🔎 Fonction utilitaire pour trouver le prochain siège disponible dans une table
function findNextAvailableSeat(
  players: { table_seat_number: number | null }[],
  startSeat: number = 1
): number {
  const occupied = new Set(
    players
      .map((p) => p.table_seat_number)
      .filter((n): n is number => n !== null)
  );
  let seat = startSeat;
  while (occupied.has(seat)) {
    seat++;
  }
  return seat;
}

// 🎲 Random player sorting for rebalancing
// Fisher-Yates shuffle algorithm for true randomness
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 🎯 Helper function to determine max capacity based on category and table count
function getMaxCapacityForCategory(
  category: string,
  remainingTableCount: number
): number {
  if (category === "APT") {
    // APT: max 8 for multi-table, max 9 for single table
    return remainingTableCount === 1 ? 9 : 8;
  } else if (category === "SITANDGO") {
    return 9;
  } else {
    // Default for other categories
    return 8;
  }
}

// 🔍 Check if a set of tables can be closed without exceeding max capacity
// Returns the list of tables that can be safely closed
function findClosableTables(
  tables: Array<{
    id: bigint;
    tableNumber: number;
    capacity: number;
    players: any[];
  }>,
  maxCapacity: number
): Array<{
  id: bigint;
  tableNumber: number;
  capacity: number;
  players: any[];
}> {
  if (tables.length <= 1) {
    return [];
  }

  // Table sorting by number DESC for closure
  // Start with highest table number (last table), work down to table 1
  // This matches physical room layout (high tables at back, easier to close)
  const sorted = [...tables].sort((a, b) => {
    // First sort by player count (ascending) to find weakest tables
    const playerDiff = a.players.length - b.players.length;
    if (playerDiff !== 0) {
      return playerDiff;
    }
    // If same player count, prioritize higher table numbers
    return b.tableNumber - a.tableNumber;
  });

  const closableTables: typeof tables = [];

  let remainingTables = [...sorted];

  for (const candidate of sorted) {
    // Calculate what would happen if we close this table
    const tablesAfterClosure = remainingTables.filter(
      (t) => t.id !== candidate.id
    );

    if (tablesAfterClosure.length === 0) {
      // Can't close all tables
      break;
    }

    // Calculate total players after closing this table
    const totalPlayers =
      tablesAfterClosure.reduce((sum, t) => sum + t.players.length, 0) +
      candidate.players.length;

    const avgPlayersPerTable = totalPlayers / tablesAfterClosure.length;

    // Check if redistribution would keep all tables within max capacity
    // We need to ensure that even in the worst case (uneven distribution),
    // no table exceeds max capacity
    const maxPlayersAfterRedistribution = Math.ceil(avgPlayersPerTable);

    if (maxPlayersAfterRedistribution <= maxCapacity) {
      // This table can be safely closed
      closableTables.push(candidate);
      remainingTables = tablesAfterClosure;
    }
  }

  return closableTables;
}

export async function reequilibrateTables(tournamentId: number) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: BigInt(tournamentId) },
    select: { tournament_category: true },
  });

  const aptMaxLastTable = 9;

  // Inclure uniquement les joueurs non éliminés & Confirmed
  const tables = await prisma.tournament_table.findMany({
    where: { tournament_id: BigInt(tournamentId) },
    include: {
      table_assignment: {
        where: {
          eliminated: false,
          registration: { statut: "Confirmed" },
        },
        include: {
          registration: {
            include: {
              wp_users: true,
            },
          },
          tournament_table: true,
        },
      },
    },
  });

  let changed = false;
  const moves: {
    playerName: string;
    registrationId: number;
    fromTableId: number;
    fromTableNumber?: number;
    fromTableSeat?: number;
    toTableId: number;
    toTableNumber?: number;
    toTableSeat?: number;
  }[] = [];

  const allRemainingPlayers = tables.flatMap((t) => t.table_assignment);

  // ----- NEW: Enhanced table closure logic ---------
  // Try to close multiple weak tables if redistribution is viable
  const candidateTables = tables.map((table) => ({
    id: table.id,
    tableNumber: table.table_number,
    capacity: table.table_capacity,
    players: table.table_assignment,
  }));

  // Only attempt closure if we have at least 2 tables
  if (candidateTables.length > 1) {
    // Determine max capacity for the current situation
    const maxCapacity = getMaxCapacityForCategory(
      tournament?.tournament_category || "APT",
      candidateTables.length
    );

    // Find all tables that can be safely closed
    const closableTables = findClosableTables(candidateTables, maxCapacity);

    if (closableTables.length > 0) {
      // Get all players from tables to be closed
      const playersFromClosedTables = closableTables.flatMap((t) => t.players);

      // Random player sorting for rebalancing
      // Shuffle players to ensure random order during redistribution
      const playersToRedistribute = shuffleArray(playersFromClosedTables);

      // Get remaining tables (not being closed)
      const remainingTables = candidateTables.filter(
        (t) => !closableTables.some((ct) => ct.id === t.id)
      );

      // Sort remaining tables by player count (ascending) - fill emptiest first
      remainingTables.sort((a, b) => a.players.length - b.players.length);

      // Redistribute players to remaining tables, prioritizing emptiest tables
      for (const player of playersToRedistribute) {
        const fromTableId = player.table_id;
        const fromTableNumber = player.tournament_table?.table_number;
        const fromTableSeat = player.table_seat_number ?? null;

        // Find the table with the fewest players that hasn't reached max capacity
        const targetTable = remainingTables.find(
          (t) => t.players.length < maxCapacity
        );

        if (!targetTable) {
          // This shouldn't happen if our closure detection logic is correct
          console.error("No available table for redistribution - logic error");
          break;
        }

        const nextSeat = findNextAvailableSeat(targetTable.players);

        await prisma.table_assignment.update({
          where: { id: player.id },
          data: {
            table_id: targetTable.id,
            table_seat_number: nextSeat,
          },
        });

        // Update local state
        targetTable.players.push({
          ...player,
          table_id: targetTable.id,
          table_seat_number: nextSeat,
        });

        // Re-sort after adding a player to maintain emptiest-first order
        remainingTables.sort((a, b) => a.players.length - b.players.length);

        changed = true;

        moves.push({
          playerName: player.registration?.wp_users?.display_name ?? "??",
          registrationId: Number(player.registration_id),
          fromTableId: Number(fromTableId),
          fromTableNumber,
          fromTableSeat,
          toTableId: Number(targetTable.id),
          toTableNumber: targetTable.tableNumber,
          toTableSeat: nextSeat,
        });
      }

      // Delete the closed tables
      for (const closedTable of closableTables) {
        await prisma.tournament_table.delete({ where: { id: closedTable.id } });
      }

      // Sequential renumbering after closure
      // Renumber remaining tables continuously: 1, 2, 3, 4... (no gaps)
      const allTablesAfterClosure = await prisma.tournament_table.findMany({
        where: { tournament_id: BigInt(tournamentId) },
        orderBy: { table_number: "asc" },
      });

      // Renumber sequentially starting from 1
      for (let i = 0; i < allTablesAfterClosure.length; i++) {
        const newTableNumber = i + 1;
        const table = allTablesAfterClosure[i];

        if (table.table_number !== newTableNumber) {
          await prisma.tournament_table.update({
            where: { id: table.id },
            data: { table_number: newTableNumber },
          });
        }
      }

      // Return early - we've made significant changes
      return { changed: true, moves };
    }
  }

  // ----- Fusion en table unique ---------
  if (allRemainingPlayers.length === aptMaxLastTable) {
    const mainTable = tables.find((t) => t.table_number === 1) || tables[0];

    // Séparer les joueurs : ceux déjà sur la table principale vs ceux à déplacer
    const playersToMove = allRemainingPlayers.filter(
      (p) => p.table_id !== mainTable.id
    );

    // Déplacer uniquement les joueurs qui ne sont PAS déjà sur la table principale
    for (const player of playersToMove) {
      const fromTableId = player.table_id;
      const fromTableNumber = player.tournament_table?.table_number;
      const fromTableSeat = player.table_seat_number ?? null;

      await prisma.table_assignment.update({
        where: { id: player.id },
        data: { table_id: mainTable.id, table_seat_number: undefined },
      });

      moves.push({
        playerName: player.registration?.wp_users?.display_name ?? "??",
        registrationId: Number(player.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        fromTableSeat,
        toTableId: Number(mainTable.id),
        toTableNumber: mainTable.table_number,
        // toTableSeat sera défini ensuite
      });
    }

    // Réattribuer les sièges pour TOUS les joueurs sur la table principale
    // (incluant ceux qui y étaient déjà et ceux qui viennent d'arriver)
    const updatedAssignments: Promise<any>[] = [];
    const tempPlayers: any[] = [];

    for (const player of allRemainingPlayers) {
      const nextSeat = findNextAvailableSeat(tempPlayers);
      tempPlayers.push({ ...player, table_seat_number: nextSeat });

      updatedAssignments.push(
        prisma.table_assignment.update({
          where: { id: player.id },
          data: { table_seat_number: nextSeat },
        })
      );

      // Met à jour la bonne entrée dans moves pour finaliser toTableSeat
      // (seulement pour les joueurs qui ont été déplacés)
      const move = moves.find(
        (m) => m.registrationId === Number(player.registration_id)
      );
      if (move) {
        move.toTableSeat = nextSeat;
      }
    }
    await Promise.all(updatedAssignments);

    // Supprimer les tables vides (toutes sauf la table principale)
    const allTables = await prisma.tournament_table.findMany({
      where: { tournament_id: BigInt(tournamentId) },
      include: { table_assignment: { where: { eliminated: false } } },
    });
    const toDelete = allTables.filter((t) => t.id !== mainTable.id);
    for (const empty of toDelete) {
      await prisma.tournament_table.delete({ where: { id: empty.id } });
    }

    // Sequential renumbering after closure
    // Ensure final table is numbered as table 1
    if (mainTable.table_number !== 1) {
      await prisma.tournament_table.update({
        where: { id: mainTable.id },
        data: { table_number: 1 },
      });
    }

    return { changed: playersToMove.length > 0, moves };
  }

  // ----- Rééquilibrage classique ---------
  let tablesWithPlayers = tables.map((table) => ({
    id: table.id,
    tableNumber: table.table_number,
    capacity: table.table_capacity,
    players: table.table_assignment,
  }));

  // Identifier les tables qui seront supprimées (< 4 joueurs)
  const tablesToDelete = tablesWithPlayers.filter((t) => t.players.length < 4);
  const tablesToDeleteIds = new Set(tablesToDelete.map((t) => t.id));

  // Récupérer les joueurs des tables à supprimer
  const underfilledPlayers = tablesToDelete.flatMap((t) => t.players);

  // Garder seulement les tables viables (>= 4 joueurs) pour placer les joueurs déplacés
  tablesWithPlayers = tablesWithPlayers.filter((t) => t.players.length >= 4);

  // Random player sorting for rebalancing
  // Shuffle players from underfilled tables for random redistribution order
  const shuffledUnderfilledPlayers = shuffleArray(underfilledPlayers);

  // Déplacer les joueurs des tables à supprimer vers des tables viables
  for (const player of shuffledUnderfilledPlayers) {
    const fromTableId = player.table_id;
    const fromTableNumber = player.tournament_table?.table_number;
    const fromTableSeat = player.table_seat_number ?? null;

    // Trouver une table cible qui N'EST PAS dans la liste de suppression
    const limit = getMaxCapacityForCategory(
      tournament?.tournament_category || "APT",
      tablesWithPlayers.length
    );
    const targetTable = tablesWithPlayers.find((t) => {
      return t.players.length < limit && !tablesToDeleteIds.has(t.id);
    });

    if (targetTable) {
      const nextSeat = findNextAvailableSeat(targetTable.players);

      await prisma.table_assignment.update({
        where: { id: player.id },
        data: {
          table_id: targetTable.id,
          table_seat_number: nextSeat,
        },
      });

      targetTable.players.push({
        ...player,
        table_id: targetTable.id,
        table_seat_number: nextSeat,
      });
      changed = true;

      moves.push({
        playerName: player.registration?.wp_users?.display_name ?? "??",
        registrationId: Number(player.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        fromTableSeat,
        toTableId: Number(targetTable.id),
        toTableNumber: targetTable.tableNumber,
        toTableSeat: nextSeat,
      });
    }
  }

  // Rééquilibrage max -> min
  tablesWithPlayers.sort((a, b) => a.players.length - b.players.length);

  while (tablesWithPlayers.length > 1) {
    const min = tablesWithPlayers[0];
    const max = tablesWithPlayers[tablesWithPlayers.length - 1];

    if (max.players.length - min.players.length > 1) {
      const randomIndex = Math.floor(Math.random() * max.players.length);
      const [movedPlayer] = max.players.splice(randomIndex, 1);
      if (!movedPlayer) break;

      const fromTableId = max.id;
      const fromTableNumber = max.tableNumber;
      const fromTableSeat = movedPlayer.table_seat_number ?? null;
      const nextSeat = findNextAvailableSeat(min.players);

      await prisma.table_assignment.update({
        where: { id: movedPlayer.id },
        data: {
          table_id: min.id,
          table_seat_number: nextSeat,
        },
      });

      min.players.push({
        ...movedPlayer,
        table_id: min.id,
        table_seat_number: nextSeat,
      });
      changed = true;

      moves.push({
        playerName: movedPlayer.registration?.wp_users?.display_name ?? "??",
        registrationId: Number(movedPlayer.registration_id),
        fromTableId: Number(fromTableId),
        fromTableNumber,
        fromTableSeat,
        toTableId: Number(min.id),
        toTableNumber: min.tableNumber,
        toTableSeat: nextSeat,
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
      table_assignment: {
        where: { eliminated: false, registration: { statut: "Confirmed" } },
      },
    },
  });
  const toDelete = allTables.filter((t) => t.table_assignment.length === 0);
  for (const empty of toDelete) {
    await prisma.tournament_table.delete({ where: { id: empty.id } });
  }

  // Sequential renumbering after closure
  // Renumber remaining tables continuously: 1, 2, 3, 4... (no gaps)
  if (toDelete.length > 0) {
    const remainingTablesAfterDeletion = await prisma.tournament_table.findMany(
      {
        where: { tournament_id: BigInt(tournamentId) },
        orderBy: { table_number: "asc" },
      }
    );

    // Renumber sequentially starting from 1
    for (let i = 0; i < remainingTablesAfterDeletion.length; i++) {
      const newTableNumber = i + 1;
      const table = remainingTablesAfterDeletion[i];

      if (table.table_number !== newTableNumber) {
        await prisma.tournament_table.update({
          where: { id: table.id },
          data: { table_number: newTableNumber },
        });
      }
    }
  }

  return { changed, moves };
}
