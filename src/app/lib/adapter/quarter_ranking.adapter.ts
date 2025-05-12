import { StandingRow } from "@/app/components/table/table.types";
import {
  QuarterRanking,
  Registration,
  Tournament,
  TournamentRanking
} from "@/app/types";
import { WPUser } from "@/app/types/user.types";

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
    if (ranking.tournament || ranking.wp_users) {
      if (ranking.tournament?.tournament_category === category) {
        const trimestry = ranking.tournament
          .tournament_trimestry as TrimestryKey;

        if (!result[trimestry]) return;

        const existingUser = result[trimestry].find(
          (rank) => Number(rank.id) === ranking.wp_users?.ID
        );

        if (existingUser) {
          // Si l'utilisateur existe déjà, on met à jour son score
          existingUser.points += ranking.aggregated_score;
        } else {
          // Sinon, on l'ajoute
          result[trimestry].push({
            id: String(ranking.wp_users?.ID),
            place: 0, // La place sera recalculée après
            name: `Joueur ${ranking.wp_users?.pseudo_winamax}`,
            points: ranking.aggregated_score
          });
        }
      }
    } else {
      return [];
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

export const mapClassementTournament = (
  classement: TournamentRanking[]
): StandingRow[] => {
  console.log(classement);
  return classement
    .flatMap((classe) => {
      if (!classe.registration || !classe.registration.wp_users)
        return undefined;
      return {
        id: String(classe.id),
        place: classe.ranking_position,
        name: classe.registration.wp_users.pseudo_winamax,
        points: classe.ranking_score
      };
    })
    .filter((row): row is StandingRow => row !== undefined);
};
