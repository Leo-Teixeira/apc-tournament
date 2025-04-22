import { Populated } from "./helper";
import { QuarterRanking } from "./quarter_ranking.types";
import { Registration } from "./registration.types";
import { TableAssignement } from "./table_assignement.types";
import { TournamentChipInventory } from "./tournament_chip_inventory.types";
import { TournamentLevel } from "./tournament_level.types";
import { TournamentRanking } from "./tournament_ranking.types";
import { TournamentTable } from "./tournament_table.types";

export type TournamentChipInventoryPopulated = Populated<
  TournamentChipInventory,
  "tournament_id" | "chip_id"
>;
export type TournamentLevelPopulated = Populated<
  TournamentLevel,
  "tournament_id"
>;
export type TournamentRankingPopulated = Populated<
  TournamentRanking,
  "registration_id" | "tournament_id"
>;
export type TournamentTablePopulated = Populated<
  TournamentTable,
  "tournament_id"
>;
export type QuarterRankingPopulated = Populated<
  QuarterRanking,
  "tournament_id"
>;
export type RegistrationPopulated = Populated<Registration, "tournament_id">;
export type TableAssignementPopulated = Populated<
  TableAssignement,
  "registration_id" | "table_id"
>;
