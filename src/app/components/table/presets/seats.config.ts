import { Column } from "../generic_table";
import { SeatRow } from "../table.types";

export const seatsColumns: Column<SeatRow>[] = [
  { name: "Nom", uid: "name", align: "start" },
  { name: "Siège", uid: "seat", align: "start" },
  { name: "", uid: "eliminated", align: "center" }
];
