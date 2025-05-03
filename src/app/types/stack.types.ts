import { Chip } from "./chip.types";

export interface Stack {
  id: string;
  name: string;
  chips: string[] | Chip[];
}
