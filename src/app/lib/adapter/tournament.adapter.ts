import { TournamentRow } from "@/app/components/table/table.types";
import { Registration, Tournament } from "@/app/types";

export const mapTournamentToRow = (
  tournaments: Tournament[],
  registrations: Registration[]
): TournamentRow[] => {
  return tournaments.map((tournament) => {
    const players = registrations.filter(
      (r) =>
        typeof r.tournament_id !== "string" &&
        r.tournament_id.id === tournament.id
    ).length;

    return {
      id: tournament.id,
      name: tournament.tournament_name,
      players: players,
      trimestry: parseInt(tournament.tournament_trimestry.replace("T", "")),
      tournament_date: tournament.tournament_start_date,
      open_tournament_date: new Date(
        new Date(tournament.tournament_start_date).getTime() -
          1000 * 60 * 60 * 24 * 14
      )
        .toISOString()
        .slice(0, 10),
      status: tournament.tournament_status,
      action: ""
    };
  });
};
