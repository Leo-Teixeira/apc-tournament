import { TournamentRow } from "@/app/components/table/table.types";
import { Registration, Tournament } from "@/app/types";
import { toISODateOnly } from "@/app/utils/date";

const formatDate = (value: string | Date): string => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", {
    timeZone: "UTC"
  });
};

export const mapTournamentsToRow = (
  tournaments: Tournament[],
  registrations: Registration[]
): TournamentRow[] => {
  return tournaments.map((tournament) => {
    const players = registrations.filter(
      (r) => r.tournament_id === tournament.id
    ).length;

    return {
      id: String(tournament.id),
      name: tournament.tournament_name,
      players,
      trimestry: parseInt(
        tournament.tournament_trimestry.replace("T", "") || "0"
      ),
      tournament_date: toISODateOnly(tournament.tournament_start_date),
      open_tournament_date: toISODateOnly(tournament.tournament_open_date),
      status: tournament.tournament_status,
      action: ""
    };
  });
};

export const mapTournamentToRow = (
  tournament: Tournament,
  registrations: Registration[]
): TournamentRow => {
  const players = registrations.filter(
    (r) => r.tournament_id === tournament.id
  ).length;

  const openDate = new Date(
    new Date(tournament.tournament_start_date).getTime() -
      1000 * 60 * 60 * 24 * 14
  );

  return {
    id: String(tournament.id),
    name: tournament.tournament_name,
    players,
    trimestry: parseInt(
      tournament.tournament_trimestry.replace("T", "") || "0"
    ),
    tournament_date: toISODateOnly(tournament.tournament_start_date),
    open_tournament_date: toISODateOnly(openDate),
    status: tournament.tournament_status,
    action: ""
  };
};
