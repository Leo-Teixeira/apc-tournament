import { GenericTable } from "@/app/components/table/generic_table";
import { blindsColumns } from "@/app/components/table/presets/blinds.config";
import { BlindRow } from "@/app/components/table/table.types";
import { mapTournamentLevelsToRow } from "@/app/lib/adapter/tournament_level.adapter";
import { Tournament, TournamentLevel } from "@/app/types";
import { useEffect, useState } from "react";

type NiveauxProps = {
  tournament: Tournament;
};

export const NiveauxTabs: React.FC<NiveauxProps> = ({ tournament }) => {
  const [levelsRow, setLevelsRow] = useState<BlindRow[]>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelRes] = await Promise.all([
          fetch(`/api/tournaments/apt/${tournament.id}/level`)
        ]);
        const levels = await levelRes.json();
        const levelsRow = mapTournamentLevelsToRow(levels);
        setLevelsRow(levelsRow);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tournament.id]);

  return (
    <div className="items-center px-32">
      {levelsRow && levelsRow?.length > 0 ? (
        <GenericTable<BlindRow>
          columns={blindsColumns}
          items={levelsRow}
          ariaLabel={""}
          showActions={true}
        />
      ) : (
        <div className="flex justify-center items-center h-full">
          Chargement en cours...
        </div>
      )}
    </div>
  );
};
