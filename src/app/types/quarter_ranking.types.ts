import { Tournament } from "./tournament.types";

export interface QuarterRanking {
  id: string;
  user_id: string;
  tournament_id: string | Tournament;
  trimestry_ranking: string;
  aggregated_score: number;
  position: number;
}
