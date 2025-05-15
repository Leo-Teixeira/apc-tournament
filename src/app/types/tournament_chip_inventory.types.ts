import { Chip } from "./chip.types";
import { Tournament } from "./tournament.types";

export type TournamentChipInventory = {
  tournament_id: number;
  chip_id: number;
  chip_player_quantity: number;
  tournament?: Tournament;
  chip?: Chip;
};