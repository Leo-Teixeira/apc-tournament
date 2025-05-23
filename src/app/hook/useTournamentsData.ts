import { useQuery } from "@tanstack/react-query";
import { mapTournamentsToRow } from "@/app/lib/adapter/tournament.adapter";
import { mapQuarterRankingByTrimestry } from "@/app/lib/adapter/quarter_ranking.adapter";
import { Tournament } from "@/app/types";
import { StandingRow, TournamentRow } from "../components/table/table.types";

type TrimestryKey = "T1" | "T2" | "T3";

export const useTournamentDataByCategory = (category: string) => {
  return useQuery({
    queryKey: ["tournament-details", category],
    queryFn: async (): Promise<{
      tournaments: Tournament[];
      tournamentRows: TournamentRow[];
      quarterRankingRows: Record<TrimestryKey, StandingRow[]>;
    }> => {
      const res = await fetch(`/api/tournaments/${category}/details`);
      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();

      return {
        tournaments: data.tournaments,
        tournamentRows: mapTournamentsToRow(
          data.tournaments,
          data.registrations
        ),
        quarterRankingRows: mapQuarterRankingByTrimestry(
          data.quarterRanking,
          category
        )
      };
    }
  });
};
