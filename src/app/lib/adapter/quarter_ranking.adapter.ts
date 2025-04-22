import { StandingRow } from "@/app/components/table/table.types";
import { QuarterRanking, Tournament } from "@/app/types";

type TrimestryKey = "T1" | "T2" | "T3";

export const mapQuarterRankingByTrimestry = (
  rankings: QuarterRanking[],
  category: string
): Record<TrimestryKey, StandingRow[]> => {
  const result: Record<TrimestryKey, StandingRow[]> = {
    T1: [],
    T2: [],
    T3: []
  };

  rankings.forEach((ranking) => {
    const tournament = ranking.tournament_id as Tournament;

    if (tournament.tournament_category === category) {
      const trimestry = tournament.tournament_trimestry as TrimestryKey;

      if (!result[trimestry]) return;

      const existingUser = result[trimestry].find(
        (rank) => rank.id === ranking.user_id
      );

      if (existingUser) {
        // Si l'utilisateur existe déjà, on met à jour son score
        existingUser.points += ranking.aggregated_score;
      } else {
        // Sinon, on l'ajoute
        result[trimestry].push({
          id: ranking.user_id,
          place: 0, // La place sera recalculée après
          name: `Joueur ${ranking.user_id}`,
          points: ranking.aggregated_score
        });
      }
    }
  });

  // Recalcul des places après agrégation
  (Object.keys(result) as TrimestryKey[]).forEach((trimestry) => {
    result[trimestry]
      .sort((a, b) => b.points - a.points) // Tri décroissant
      .forEach((row, index) => {
        row.place = index + 1;
      });
  });

  return result;
};
