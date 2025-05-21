import { prisma } from "@/lib/prisma";

export async function reequilibrateTables(tournamentId: number) {
  const tables = await prisma.tournament_table.findMany({
    where: { tournament_id: BigInt(tournamentId) },
    include: {
      table_assignment: {
        where: { eliminated: false },
        include: { registration: true }
      }
    }
  });

  let changed = false;

  let tablesWithPlayers = tables.map((table) => ({
    id: table.id,
    tableNumber: table.table_number,
    capacity: table.table_capacity,
    players: table.table_assignment
  }));

  const underfilledPlayers = tablesWithPlayers
    .filter((t) => t.players.length < 4)
    .flatMap((t) => t.players);

  tablesWithPlayers = tablesWithPlayers.filter((t) => t.players.length >= 4);

  for (const player of underfilledPlayers) {
    const targetTable = tablesWithPlayers.find(
      (t) => t.players.length < t.capacity
    );
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

  while (true) {
    const min = tablesWithPlayers[0];
    const max = tablesWithPlayers[tablesWithPlayers.length - 1];

    const moreThanOneTable = tablesWithPlayers.length > 1;
    const tooUnbalanced = max.players.length - min.players.length > 1;

    if (!moreThanOneTable) break;

    if (tooUnbalanced) {
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
      tablesWithPlayers.sort((a, b) => a.players.length - b.players.length);
    } else {
      break;
    }
  }

  const allTables = await prisma.tournament_table.findMany({
    where: { tournament_id: BigInt(tournamentId) },
    include: {
      table_assignment: { where: { eliminated: false } }
    }
  });

  const toDelete = allTables.filter((t) => t.table_assignment.length === 0);
  for (const empty of toDelete) {
    await prisma.tournament_table.delete({ where: { id: empty.id } });
    console.log(`🗑️ Table supprimée : ${empty.table_number}`);
  }

  return changed;
}
