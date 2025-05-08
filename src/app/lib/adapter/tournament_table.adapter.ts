import {
  TableAssignement,
  Tournament,
  TournamentTable,
  Registration
} from "@/app/types";
import { SeatRow } from "@/app/components/table/table.types";
import { User } from "@/app/types/user.types";

export const mapFlatAssignementsToSeatRows = (
  assignements: TableAssignement[]
): SeatRow[] => {
  return assignements.map((a) => {
    const registration = a.registration_id as Registration;
    const user =
      typeof registration?.user_id === "object"
        ? registration.user_id
        : undefined;
    const table = typeof a.table_id === "object" ? a.table_id : undefined;

    return {
      id: a.id,
      avatarName: user?.pseudo_winamax ?? "Inconnu",
      avatar: user?.photo_url ?? "",
      seat: table
        ? `Table ${table.table_number}, siège ${a.table_seat_number}`
        : "Table inconnue",
      action: ""
    };
  });
};

export const mapAssignementsGroupedByTable = (assignements: any[]) => {
  const groups: Record<string, SeatRow[]> = {};

  assignements.forEach((a) => {
    const table =
      typeof a.table_id === "object"
        ? (a.table_id as TournamentTable)
        : undefined;
    const registration =
      typeof a.registration_id === "object"
        ? (a.registration_id as Registration)
        : undefined;
    const user =
      typeof registration?.user_id === "object"
        ? (registration.user_id as User)
        : undefined;

    const tableNumber = table?.table_number;
    if (!tableNumber) return;

    const seatRow: SeatRow = {
      id: a.id,
      avatarName: user?.pseudo_winamax ?? "Inconnu",
      avatar: user?.photo_url ?? "",
      seat: `Siège ${a.table_seat_number}`,
      action: ""
      // eliminated: false
    };

    if (!groups[tableNumber]) groups[tableNumber] = [];
    groups[tableNumber].push(seatRow);
  });

  return groups;
};
