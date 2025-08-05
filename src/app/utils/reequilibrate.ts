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
        include: { registration: true }
      }
    }
  });

  let changed = false;

  // Extraire tous les joueurs (non éliminés)
  const allRemainingPlayers = tables.flatMap(t => t.table_assignment);

  // ------------- FUSION EN TABLE UNIQUE LORSQU'IL RESTE 8 JOUEURS ----------- //
  if (allRemainingPlayers.length === 8) {
    // Trouver (ou créer) la table n°1
    const mainTable = tables.find(t => t.table_number === 1) || tables[0];

    // Vider les autres tables sauf mainTable
    for (const player of allRemainingPlayers) {
      await prisma.table_assignment.update({
        where: { id: player.id },
        data: {
          table_id: mainTable.id,
          table_seat_number: undefined // les redistribuer proprement ensuite
        }
      });
    }
    // Réattribuer des numéros de siège 1 à 8 à tous les joueurs de la mainTable
    const newAssignments = allRemainingPlayers.map((p, i) =>
      prisma.table_assignment.update({
        where: { id: p.id },
        data: { table_seat_number: i + 1 }
      })
    );
    await Promise.all(newAssignments);

    // Supprimer toutes les autres tables vides
    const allTables = await prisma.tournament_table.findMany({
      where: { tournament_id: BigInt(tournamentId) },
      include: { table_assignment: { where: { eliminated: false } } }
    });
    const toDelete = allTables.filter(t => t.id !== mainTable.id);
    for (const empty of toDelete) {
      await prisma.tournament_table.delete({ where: { id: empty.id } });
      console.log(`🗑️ Table supprimée : ${empty.table_number}`);
    }

    return true;
  }

  // ------------- RÉ-ÉQUILIBRAGE CLASSIQUE ----------- //
  let tablesWithPlayers = tables.map(table => ({
    id: table.id,
    tableNumber: table.table_number,
    capacity: table.table_capacity,
    players: table.table_assignment
  }));

  //  Pour ne jamais laisser une table < 4 joueurs
  const underfilledPlayers = tablesWithPlayers
    .filter(t => t.players.length < 4)
    .flatMap(t => t.players);

  tablesWithPlayers = tablesWithPlayers.filter(t => t.players.length >= 4);

  for (const player of underfilledPlayers) {
    const targetTable = tablesWithPlayers.find(t => {
      const limit =
        isAPT && tablesWithPlayers.length > 1 ? aptMaxDefault : t.capacity;
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
    }
  }

  tablesWithPlayers.sort((a, b) => a.players.length - b.players.length);

  // Tant qu'écart max/min > 1, déplacer un joueur de la plus grosse à la plus petite table
  while (tablesWithPlayers.length > 1) {
    const min = tablesWithPlayers[0];
    const max = tablesWithPlayers[tablesWithPlayers.length - 1];

    if (max.players.length - min.players.length > 1) {
      // On déplace UN joueur de max vers min (pas besoin de tester maxAllowed ici)
      const movedPlayer = max.players.pop();
      if (!movedPlayer) break;

      await prisma.table_assignment.update({
        where: { id: movedPlayer.id },
        data: {
          table_id: min.id,
          table_seat_number: min.players.length + 1
        }
      });

      min.players.push({ ...movedPlayer, table_id: min.id });
      changed = true;

      // On retrie APRÈS déplacement, l’ordre a changé !
      tablesWithPlayers.sort((a, b) => a.players.length - b.players.length);

      // → on continue la boucle pour rééquilibrer à fond
      continue;
    }

    // Si l’écart n’est plus > 1, tout est équilibré
    break;
  }


  // Supprimer les tables vides après rééquilibrage
  const allTables = await prisma.tournament_table.findMany({
    where: { tournament_id: BigInt(tournamentId) },
    include: {
      table_assignment: { where: { eliminated: false, registration: { statut: "Confirmed" } } }
    }
  });
  const toDelete = allTables.filter(t => t.table_assignment.length === 0);
  for (const empty of toDelete) {
    await prisma.tournament_table.delete({ where: { id: empty.id } });
    console.log(`🗑️ Table supprimée : ${empty.table_number}`);
  }

  return changed;
}
