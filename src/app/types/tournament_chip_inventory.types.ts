import { Chip } from "./chip.types";
import { Tournament } from "./tournament.types";

export interface TournamentChipInventory {
  tournament_id: string | Tournament;
  chip_id: string | Chip;
  chip_player_quantity: number;
}
