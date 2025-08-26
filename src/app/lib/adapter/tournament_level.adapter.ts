import { BlindRow } from "@/app/components/table/table.types";
import { TournamentLevel } from "@/app/types";
import { formatHourFR, getDurationInMinutes, toLocalISOString } from "@/app/utils/date";

export const mapTournamentLevelsToRow = (
  levels: TournamentLevel[]
): BlindRow[] => {
  return levels
    .filter(level => level.level_start && level.level_end)
    .sort((a, b) => a.level_number - b.level_number)
    .map(level => {
      // On créé les dates en UTC avec toLocalISOString qui ajuste la timezone locale
      const start = new Date(toLocalISOString(new Date(level.level_start)));
      const end = new Date(toLocalISOString(new Date(level.level_end)));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

      // Durée en minutes grâce à ta fonction utilitaire
      const durationMinutes = getDurationInMinutes(start, end);

      return {
        id: level.id,
        level: level.level_pause ? "Pause" : level.level_number,
        small: level.level_pause ? "" : level.level_small_blinde.toString(),
        big: level.level_pause ? "" : level.level_big_blinde.toString(),
        ante: "-",
        pause: level.level_pause,
        duration: `${durationMinutes}"`,
        // Affichage de l'heure locale format FR
        time: formatHourFR(start),
        action: ""
      };
    })
    .filter((row): row is BlindRow => row !== null);
};
