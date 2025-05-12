import { BlindRow } from "@/app/components/table/table.types";
import { TournamentLevel } from "@/app/types";

export const mapTournamentLevelsToRow = (
  levels: TournamentLevel[]
): BlindRow[] => {
  return levels
    .sort((a, b) => a.level_number - b.level_number)
    .map((level) => {
      const start = new Date(level.level_start);
      const end = new Date(level.level_end);

      const durationMinutes = Math.round(
        (end.getTime() - start.getTime()) / 60000
      );

      return {
        id: level.id,
        level: level.level_number,
        small: level.level_pause ? "" : level.level_small_blinde.toString(),
        big: level.level_pause ? "" : level.level_big_blinde.toString(),
        ante: "-",
        pause: level.level_pause,
        duration: `${durationMinutes}"`,
        time: start.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC"
        }),
        action: ""
      };
    });
};
