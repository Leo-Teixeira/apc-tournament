import { Tournament } from "./tournament.types";
import { WPUser } from "./user.types";

export type QuarterRanking = {
  id: number;
  user_id: number;
  tournament_id: number;
  trimestry_ranking: "T1" | "T2" | "T3";
  aggregated_score: number;
  position: number;
  wp_users?: WPUser;
  tournament?: Tournament;
};
