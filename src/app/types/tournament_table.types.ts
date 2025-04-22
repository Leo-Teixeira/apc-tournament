import { Tournament } from "./tournament.types";

export interface TournamentTable {
  id: string;
  tournament_id: string | Tournament;
  table_number: number;
  table_capacity: number;
}
