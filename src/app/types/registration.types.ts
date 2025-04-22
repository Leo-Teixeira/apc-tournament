import { Tournament } from "./tournament.types";

export interface Registration {
  id: string;
  user_id: string;
  tournament_id: string | Tournament;
  inscription_date: string;
  statut: string;
}
