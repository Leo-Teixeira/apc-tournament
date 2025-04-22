import { Registration } from "./registration.types";
import { Tournament } from "./tournament.types";

export interface TournamentRanking {
  id: string;
  registration_id: string | Registration;
  tournament_id: string | Tournament;
  ranking_position: number;
  ranking_score: number;
}
