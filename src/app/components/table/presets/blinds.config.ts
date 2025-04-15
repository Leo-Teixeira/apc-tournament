import { Column } from "../generic_table";

type BlindRow = {
  id: string;
  level: string;
  small: string;
  big: string;
  ante: string;
  duration: string;
  time: string;
};

export const blindsColumns: Column<BlindRow>[] = [
  { name: "Niveau", uid: "level" },
  { name: "Petite blinde", uid: "small" },
  { name: "Grosse blinde", uid: "big" },
  { name: "Ante", uid: "ante" },
  { name: "Durée", uid: "duration" },
  { name: "Heure", uid: "time" }
];
