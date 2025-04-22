import { StandingRow } from "@/app/components/table/table.types";
import { QuarterRanking, Tournament } from "@/app/types";

type TrimestryKey = "T1" | "T2" | "T3";

export const mapQuarterRankingByTrimestry = (
  rankings: QuarterRanking[]
): Record<TrimestryKey, StandingRow[]> => {
  const result: Record<TrimestryKey, StandingRow[]> = {
    T1: [],
    T2: [],
    T3: []
  };

  rankings.forEach((ranking) => {
    const tournament = ranking.tournament_id as Tournament;
    const trimestry = tournament.tournament_trimestry as TrimestryKey;

    if (!result[trimestry]) return;

    result[trimestry].push({
      id: ranking.user_id,
      place: ranking.position,
      name: `Joueur ${ranking.user_id}`,
      points: ranking.aggregated_score
    });
  });

  return result;
};
