import { BlindRow } from "@/app/components/table/table.types";
import { TournamentLevel } from "@/app/types";

export const mapTournamentLevelsToRow = (
  levels: TournamentLevel[]
): BlindRow[] => {
  return levels
    .sort((a, b) => a.level_number - b.level_number)
    .map((level) => {
      const [startHours, startMinutes] = level.level_start
        .split("h")
        .map(Number);
      const [endHours, endMinutes] = level.level_end.split("h").map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      const duration =
        endTotalMinutes >= startTotalMinutes
          ? endTotalMinutes - startTotalMinutes
          : 24 * 60 - startTotalMinutes + endTotalMinutes;

      return {
        id: level.id,
        level: level.level_number,
        small: level.level_pause ? "" : level.level_small_blinde.toString(),
        big: level.level_pause ? "" : level.level_big_blinde.toString(),
        ante: "-",
        pause: level.level_pause,
        duration: `${duration.toString()}"`,
        time: level.level_start,
        action: ""
      };
    });
};
