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

export async function reequilibrateTables(tournamentId: number) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: BigInt(tournamentId) },
    select: { tournament_category: true },
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

  // Déplacer les joueurs des tables à supprimer vers des tables viables
  for (const player of underfilledPlayers) {
    const fromTableId = player.table_id;
    const fromTableNumber = player.tournament_table?.table_number;
    const fromTableSeat = player.table_seat_number ?? null;

    // Trouver une table cible qui N'EST PAS dans la liste de suppression
    const targetTable = tablesWithPlayers.find((t) => {
      const limit =
        isAPT && tablesWithPlayers.length > 1 ? aptMaxDefault : t.capacity;
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

  return { changed, moves };
}
