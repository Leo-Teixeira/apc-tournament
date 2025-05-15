import { QuarterRanking } from "./quarter_ranking.types";
import { Registration } from "./registration.types";
import { TournamentChipInventory } from "./tournament_chip_inventory.types";
import { TournamentLevel } from "./tournament_level.types";
import { TournamentRanking } from "./tournament_ranking.types";
import { TournamentTable } from "./tournament_table.types";

export type Tournament = {
  id: number;
  tournament_name: string;
  tournament_description: string;
  tournament_start_date: Date;
  tournament_open_date: Date;
  estimate_duration: Date;
  tournament_trimestry: "T1" | "T2" | "T3";
  tournament_category: "APT" | "AG" | "Sit&Go" | "Superfinale" | "Solipoker";
  tournament_status: "in_coming" | "finish" | "start";
  quarter_ranking?: QuarterRanking[];
  registration?: Registration[];
  tournament_chip_inventory?: TournamentChipInventory[];
  tournament_level?: TournamentLevel[];
  tournament_ranking?: TournamentRanking[];
  tournament_table?: TournamentTable[];
};
