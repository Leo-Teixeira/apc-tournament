import { Column } from "../table.types";


type StandingRow = {
  id: string;
  place: number;
  name: string;
  points: number | "-";
};

export const standingsColumns: Column<StandingRow>[] = [
  { name: "Place", uid: "place", align: "start" },
  { name: "Pseudo", uid: "name", align: "start" },
  { name: "Points", uid: "points", align: "center" }
];
