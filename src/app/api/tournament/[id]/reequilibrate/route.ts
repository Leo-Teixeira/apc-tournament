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

  const tablesWithCounts = tables.map((table) => ({
    id: table.id,
    tableNumber: table.table_number,
    capacity: table.table_capacity,
    players: table.table_assignment
  }));

  tablesWithCounts.sort((a, b) => a.players.length - b.players.length);

  let changed = false;

  while (true) {
    const min = tablesWithCounts[0];
    const max = tablesWithCounts[tablesWithCounts.length - 1];

    if (
      max.players.length - min.players.length <= 1 &&
      tablesWithCounts.every((t) => t.players.length >= 4)
    ) {
      break;
    }

    if (max.players.length - min.players.length > 1) {
      const movedPlayer = max.players.pop();
      if (!movedPlayer) break;

      const newSeatNumber = min.players.length + 1;

      await prisma.table_assignment.update({
        where: { id: movedPlayer.id },
        data: {
          table_id: min.id,
          table_seat_number: newSeatNumber
        }
      });

      min.players.push({ ...movedPlayer, table_id: min.id });
      changed = true;
      tablesWithCounts.sort((a, b) => a.players.length - b.players.length);
    } else {
      break;
    }
  }

  const toDelete = tablesWithCounts.filter((t) => t.players.length === 0);
  for (const empty of toDelete) {
    await prisma.tournament_table.delete({ where: { id: empty.id } });
  }

  return changed;
}
