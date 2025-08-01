// hooks/useTournamentData.ts
import { useQuery } from "@tanstack/react-query";
import {
  Tournament,
  TournamentLevel,
  TournamentRanking,
  Registration,
  TableAssignment,
  Stack
} from "@/app/types";

export const useTournamentData = (tournamentId: string) => {
  const fullQuery = useQuery({
    queryKey: ["tournament-data", tournamentId],
    queryFn: async (): Promise<{
      tournament: Tournament;
      registrations: Registration[];
      classement: TournamentRanking[];
      levels: TournamentLevel[];
      assignements: TableAssignment[];
      stacks: Stack[];
    }> => {
      // Une seule requête optimisée au lieu de 4
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
        assignements: data.tournament.registration?.flatMap((r: Registration) => r.table_assignment) || [],
        stacks: data.stacks
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 2000,
    structuralSharing: true,
  });

  const statusQuery = useQuery({
    queryKey: ["tournament-status", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournament/${tournamentId}/details`);
      if (!res.ok) throw new Error("Erreur chargement status tournoi");
      const data = await res.json();
      return { tournament: data.tournament };
    },
    enabled: false,
    staleTime: 1000 * 60 * 2, // 2 minutes pour le status
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  return {
    data: fullQuery.data,
    isLoading: fullQuery.isLoading,
    isError: fullQuery.isError,
    error: fullQuery.error,
    refetch: fullQuery.refetch,
    refetchStatusOnly: statusQuery.refetch
  };
};
