import {
  Tournament,
  TournamentTable,
  Registration,
  TableAssignment
} from "@/app/types";
import { SeatRow } from "@/app/components/table/table.types";
import { WPUser } from "@/app/types/user.types";

export const mapFlatAssignementsToSeatRows = (
  assignements: TableAssignment[]
): SeatRow[] => {
  return assignements
    .map((a) => {
      const registration = a.registration;
      const user = registration?.wp_users;
      const table = a.tournament_table;

      return {
        id: a.id,
        avatarName: user?.pseudo_winamax ?? "Inconnu",
        avatar: user?.photo_url ?? "",
        seat: table
          ? `Table ${table.table_number}, siège ${a.table_seat_number}`
          : "Table inconnue",
        action: "",
        eliminated: a.eliminated
      };
    })
    .sort((a, b) => {
      if (a.eliminated === b.eliminated) return 0;
      return a.eliminated ? 1 : -1;
    });
};

export const mapAssignementsGroupedByTable = (
  assignements: TableAssignment[]
) => {
  const groups: Record<string, SeatRow[]> = {};

  assignements.forEach((a) => {
    const registration = a.registration;
    const user = registration?.wp_users;
    const table = a.tournament_table;

    const tableNumber = table?.table_number;
    if (!tableNumber) return;

    const seatRow: SeatRow = {
      id: a.id,
      avatarName: user?.pseudo_winamax ?? "Inconnu",
      avatar: user?.photo_url ?? "",
      seat: `Siège ${a.table_seat_number}`,
      action: "",
      eliminated: a.eliminated
    };

    if (!groups[tableNumber]) groups[tableNumber] = [];
    groups[tableNumber].push(seatRow);
  });

  // Trier chaque groupe par numéro de siège
  Object.keys(groups).forEach((tableNumber) => {
    groups[tableNumber].sort(
      (a, b) => (parseInt(a.seat) ?? 0) - (parseInt(b.seat) ?? 0)
    );
  });

  return groups;
};
