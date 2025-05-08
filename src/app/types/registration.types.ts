import { Tournament } from "./tournament.types";
import { User } from "./user.types";

export interface Registration {
  id: string;
  user_id: string | User;
  tournament_id: string | Tournament;
  inscription_date: string;
  statut: string;
}
