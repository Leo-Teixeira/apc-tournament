import { GenericTable } from "@/app/components/table/generic_table";
import { standingsColumns } from "@/app/components/table/presets/standings.config";
import { tournamentColumns } from "@/app/components/table/presets/tournament.config";
import { StandingRow, TournamentRow } from "@/app/components/table/table.types";
import {
  mapClassementTournament,
  mapQuarterRankingByTrimestry
} from "@/app/lib/adapter/quarter_ranking.adapter";
import { mapTournamentToRow } from "@/app/lib/adapter/tournament.adapter";
import { Registration, Tournament, TournamentRanking } from "@/app/types";
import { Card } from "@heroui/react";
import { useEffect, useState } from "react";

type ClassementProps = {
  tournament_status: string;
  classement: TournamentRanking[];
};

export const ClassementComponent: React.FC<ClassementProps> = ({
  tournament_status,
  classement
}) => {
  const [classementRow, setClassementRow] = useState<StandingRow[]>([]);
  useEffect(() => {
    setClassementRow(mapClassementTournament(classement));
  }, [classement]);
  return (
    <div className="w-full h-full overflow-hidden">
      {tournament_status === "finish" || classementRow.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <div className="min-w-full">
            <GenericTable<StandingRow>
              items={classementRow}
              columns={standingsColumns}
              ariaLabel="Classement"
            />
          </div>
        </div>
      ) : (
        <Card className="flex flex-col justify-start h-full bg-background_card p-6 gap-3">
          <img
            className="rounded-lg"
            src="/images/classement_image.svg"
            alt="classement svg"
          />
          <p className="text-center text-primary_brand-300 font-satoshiBold text-l leading-7">
            Revenez après le tournoi pour voir qui a dominé les cartes !
          </p>
        </Card>
      )}
    </div>
  );
};
