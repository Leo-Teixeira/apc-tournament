// lib/adapter/season.adapter.ts
import { SeasonRow } from "@/app/components/table/table.types";
import { Season } from "@/app/types/season.types";
import { toISODateOnly } from "@/app/utils/date";

export function mapSeasonsToRows(seasons: Season[]): SeasonRow[] {
  return seasons.map((season) => ({
    id: String(season.id),
    name: season.name,
    start_date: new Date(season.start_date).getTime(),
    end_date: new Date(season.end_date).getTime(),
    status: season.status,
    action: "",
    trimester: season.trimester
      ? season.trimester.map((t) => ({
          name: `T${t.number}`,
          start_date: new Date(t.start_date).getTime(),
          end_date: new Date(t.end_date).getTime(),
        }))
      : [],
  }));
}


