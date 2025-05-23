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
      const [resDetails, resLevels, resTable, resStack] = await Promise.all([
        fetch(`/api/tournament/${tournamentId}/details`),
        fetch(`/api/tournament/${tournamentId}/level`),
        fetch(`/api/tournament/${tournamentId}/table_assignement`),
        fetch(`/api/stack`)
      ]);

      if (!resDetails.ok || !resLevels.ok || !resTable.ok || !resStack.ok) {
        throw new Error("Erreur lors du chargement des données");
      }

      const detailData = await resDetails.json();
      const levelData = await resLevels.json();
      const tableData = await resTable.json();
      const stackData = await resStack.json();

      return {
        tournament: detailData.tournament,
        registrations: detailData.registrations,
        classement: detailData.classement,
        levels: levelData,
        assignements: tableData,
        stacks: stackData
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const statusQuery = useQuery({
    queryKey: ["tournament-status", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournament/${tournamentId}/details`);
      if (!res.ok) throw new Error("Erreur chargement status tournoi");
      const data = await res.json();
      return { tournament: data.tournament };
    },
    enabled: false
  });

  return {
    data: fullQuery.data,
    refetch: fullQuery.refetch,
    refetchStatusOnly: statusQuery.refetch
  };
};
