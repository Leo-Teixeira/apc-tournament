import { Tournament } from "./tournament.types";
import { User } from "./user.types";

export interface QuarterRanking {
  id: string;
  user_id: string | User;
  tournament_id: string | Tournament;
  trimestry_ranking: string;
  aggregated_score: number;
  position: number;
}
