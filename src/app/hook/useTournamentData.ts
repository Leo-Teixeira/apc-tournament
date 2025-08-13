// hooks/useTournamentData.ts
import { useQuery } from "@tanstack/react-query";
import {
  Tournament,
  TournamentLevel,
  TournamentRanking,
  Registration,
  TableAssignment,
  Stack,
} from "@/app/types";

type TournamentData = {
  tournament: Tournament;
  registrations: Registration[];
  classement: TournamentRanking[];
  levels: TournamentLevel[];
  assignements: TableAssignment[];
  stacks: Stack[];
};

export const useTournamentData = (tournamentId: string) => {
  const fullQuery = useQuery<TournamentData>({
    queryKey: ["tournament-data", tournamentId],
    queryFn: async (): Promise<TournamentData> => {
      const res = await fetch(`/api/tournament/${tournamentId}/details`);
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des données");
      }
      const data = await res.json();

      return {
        tournament: data.tournament,
        registrations: data.registrations,
        classement: data.classement,
        levels: data.tournament.tournament_level || [],
        assignements:
          data.tournament.registration?.flatMap(
            (r: Registration) => r.table_assignment
          ) || [],
        stacks: data.stacks,
      };
    },
  });

  // Pour ne charger que le status du tournoi, si besoin
  const statusQuery = useQuery<{ tournament: Tournament }>({
    queryKey: ["tournament-status", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournament/${tournamentId}/details`);
      if (!res.ok) throw new Error("Erreur chargement status tournoi");
      const data = await res.json();
      return { tournament: data.tournament };
    },
    enabled: false, // que sur action
  });

  return {
    data: fullQuery.data,
    isLoading: fullQuery.isLoading,
    isError: fullQuery.isError,
    error: fullQuery.error,
    refetch: fullQuery.refetch,
    refetchStatusOnly: statusQuery.refetch,
  };
};
