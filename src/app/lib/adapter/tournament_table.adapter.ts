import {
  TableAssignement,
  Tournament,
  TournamentTable,
  Registration
} from "@/app/types";
import { SeatRow } from "@/app/components/table/table.types";

export const mapFlatAssignementsToSeatRows = (
  assignements: any[]
): SeatRow[] => {
  return assignements.map((a) => ({
    id: a.id,
    avatarName: a.registration?.user_id ?? "Inconnu",
    seat: `Table ${a.table?.table_number}, siège ${a.table_seat_number}`,
    action: ""
    // eliminated: false
  }));
};

export const mapAssignementsGroupedByTable = (assignements: any[]) => {
  const groups: Record<string, SeatRow[]> = {};

  assignements.forEach((a) => {
    const tableNumber = a.table?.table_number;
    if (!tableNumber) return;

    const seatRow: SeatRow = {
      id: a.id,
      avatarName: a.registration?.user_id ?? "Inconnu",
      seat: `Siège ${a.table_seat_number}`,
      action: ""
      //   eliminated: false
    };

    if (!groups[tableNumber]) groups[tableNumber] = [];
    groups[tableNumber].push(seatRow);
  });

  return groups;
};
