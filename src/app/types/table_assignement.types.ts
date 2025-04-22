import { Registration } from "./registration.types";
import { TournamentTable } from "./tournament_table.types";

export interface TableAssignement {
  id: string;
  registration_id: string | Registration;
  table_id: string | TournamentTable;
  table_seat_number: number;
}
