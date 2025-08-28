import { StandingRow } from "@/app/components/table/table.types";
import {
  Registration,
  Season,
  Tournament,
  TournamentRanking,
} from "@/app/types";
import { Trimester } from "@/app/types/trimester.types";
import { WPUser } from "@/app/types/user.types";

type TrimestryKey = "T1" | "T2" | "T3";

export const mapQuarterRankingByTrimestry = (
  category: string,
  trimesters: Trimester[],
  tournaments: Tournament[],
  registrations: Registration[],
  seasons: Season[],
  rankings: TournamentRanking[]
): Record<TrimestryKey, StandingRow[]> => {
  // Initialiser un objet résultat avec 3 clés pour chaque trimestre
  const result: Record<TrimestryKey, StandingRow[]> = {
    T1: [],
    T2: [],
    T3: [],
  };

  rankings.forEach((ranking, index) => {

    // Vérifier la présence du tournoi lié au ranking
    if (!ranking.tournament) {
      return;
    }

    // Vérifier la présence de l'utilisateur lié à la registration
    if (!ranking.registration?.wp_users) {
      return;
    }

    // Filtrer par catégorie, insensible à la casse
    if (ranking.tournament.tournament_category.toUpperCase() !== category.toUpperCase()) {
      return;
    }

    // Récupérer le trimestre correspondant au tournoi
    const trimesterObj = trimesters.find(
      (trimester) => trimester.id === ranking.tournament?.tournament_trimestry
    );

    if (!trimesterObj) {
      return;
    }

    // Construire la clé trimestre (ex: T1, T2, T3)
    const trimestryKey = `T${trimesterObj.number}` as TrimestryKey;
    if (!(trimestryKey in result)) {
      return;
    }

    // Récupérer l'ID et le pseudo du joueur
    const userId = ranking.registration.id;
    const userName = ranking.registration.wp_users.pseudo_winamax || `Joueur ${userId}`;

    // Chercher si le joueur est déjà dans le tableau du trimestre
    const existingUser = result[trimestryKey].find((user) => user.name === userName);
    if (existingUser) {
      // Additionner les points si déjà existant
      existingUser.points += ranking.ranking_score ?? 0;
    } else {
      // Ajouter un nouvel utilisateur si pas trouvé
      result[trimestryKey].push({
        id: String(userId),
        place: 0, // place sera calculée plus tard
        name: userName,
        points: ranking.ranking_score ?? 0,
      });
    }
  });

  // Trier les joueurs par points décroissants et attribuer les places
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
