import { Stack } from "./stack.types";
import { TournamentChipInventory } from "./tournament_chip_inventory.types";

export type Chip = {
  id: number;
  value: number;
  chip_image: string;
  stack?: Stack[];
  tournament_chip_inventory?: TournamentChipInventory[];
};