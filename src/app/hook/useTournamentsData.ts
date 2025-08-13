// hooks/useTournamentDataByCategory.ts
import { useQuery } from "@tanstack/react-query";
import { mapTournamentsToRow } from "@/app/lib/adapter/tournament.adapter";
import { mapQuarterRankingByTrimestry } from "@/app/lib/adapter/quarter_ranking.adapter";
import { Tournament } from "@/app/types";
import { StandingRow, TournamentRow } from "../components/table/table.types";

type TrimestryKey = "T1" | "T2" | "T3";

type TournamentDataByCategory = {
  tournaments: Tournament[];
  tournamentRows: TournamentRow[];
  quarterRankingRows: Record<TrimestryKey, StandingRow[]>;
};

export const useTournamentDataByCategory = (category: string) => {
  const query = useQuery<TournamentDataByCategory>({
    queryKey: ["tournament-details", category],
    queryFn: async (): Promise<TournamentDataByCategory> => {
      const res = await fetch(`/api/tournaments/${category}/details`);
      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();

      // Attention : data.tournamentss doit être data.tournaments ?
      // Sinon corrige l’API ou le mapping ici :
      return {
        tournaments: data.tournamentss, // ou data.tournaments selon ton backend
        tournamentRows: mapTournamentsToRow(
          data.tournamentss,
          data.registrations
        ),
        quarterRankingRows: mapQuarterRankingByTrimestry(
          data.quarterRanking,
          category
        ),
      };
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
