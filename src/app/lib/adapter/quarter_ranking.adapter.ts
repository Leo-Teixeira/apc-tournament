import { StandingRow } from "@/app/components/table/table.types";
import {
  QuarterRanking,
  Registration,
  Tournament,
  TournamentRanking,
} from "@/app/types";
import { Trimester } from "@/app/types/trimester.types";
import { WPUser } from "@/app/types/user.types";

type TrimestryKey = "T1" | "T2" | "T3";

export const mapQuarterRankingByTrimestry = (
  rankings: QuarterRanking[],
  category: string,
  trimesters: Trimester[]
): Record<TrimestryKey, StandingRow[]> => {
  const result: Record<TrimestryKey, StandingRow[]> = {
    T1: [],
    T2: [],
    T3: [],
  };

  rankings.forEach((ranking) => {
    if (
      ranking.tournament &&
      ranking.wp_users &&
      ranking.tournament.tournament_category === category
    ) {
      // Trouver le trimestre lié au tournoi
      const trimesterObj = trimesters.find(
        (trimester) => trimester.id === ranking.tournament?.tournament_trimestry
      );

      // On prend le numéro du trimestre pour créer la clé TrimestryKey (ex: "T1", "T2", "T3")
      // Si trimesterObj absent, on abandonne ce ranking
      if (!trimesterObj) return;

      const trimestryKey = `T${trimesterObj.number}` as TrimestryKey;

      // Vérifier que la clé existe dans le résultat
      if (!(trimestryKey in result)) return;

      // Chercher si l'utilisateur existe déjà dans ce trimestre
      const existingUser = result[trimestryKey].find(
        (rank) => Number(rank.id) === ranking.wp_users?.ID
      );

      if (existingUser) {
        // Ajouter les points si déjà présent
        existingUser.points += ranking.aggregated_score;
      } else {
        // Sinon ajout du nouveau joueur
        result[trimestryKey].push({
          id: String(ranking.wp_users.ID),
          place: 0, // sera recalculé
          name: `Joueur ${ranking.wp_users.pseudo_winamax}`,
          points: ranking.aggregated_score,
        });
      }
    }
  });

  // Recalcul des places après agrégation et tri décroissant par points
  (Object.keys(result) as TrimestryKey[]).forEach((key) => {
    result[key]
      .sort((a, b) => b.points - a.points)
      .forEach((row, index) => {
        row.place = index + 1;
      });
  });

  return result;
};

export const mapClassementTournament = (
  classement: TournamentRanking[]
): StandingRow[] => {
  return classement
    .flatMap((classe) => {
      if (!classe.registration || !classe.registration.wp_users) return [];
      return {
        id: String(classe.id),
        place: classe.ranking_position,
        name: classe.registration.wp_users.pseudo_winamax,
        points: classe.ranking_score,
      };
    })
    .filter((row): row is StandingRow => row !== undefined);
};
