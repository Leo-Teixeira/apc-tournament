import { GenericTable } from "@/app/components/table/generic_table";
import { blindsColumns } from "@/app/components/table/presets/blinds.config";
import { ActionDefinition, BlindRow } from "@/app/components/table/table.types";
import { mapTournamentLevelsToRow } from "@/app/lib/adapter/tournament_level.adapter";
import { Tournament, TournamentLevel } from "@/app/types";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
          fetch(`/api/tournament/${tournament.id}/level`)
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

  const getConditionalActions = (item: BlindRow) => {
    const actions: ActionDefinition<BlindRow>[] = [
      {
        tooltip: "Éditer",
        icon: (
          <HugeiconsIcon icon={PencilEdit02Icon} size={20} strokeWidth={1.5} />
        ),
        onClick: () => {}
      },
      {
        tooltip: "Supprimer",
        icon: <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={1.5} />,
        onClick: () => {},
        color: "danger"
      }
    ];
    return actions;
  };

  return (
    <div className="items-center">
      {levelsRow && levelsRow?.length > 0 ? (
        <GenericTable<BlindRow>
          columns={blindsColumns}
          items={levelsRow}
          ariaLabel={""}
          showActions={true}
          actions={getConditionalActions}
        />
      ) : (
        <div className="flex justify-center items-center h-full">
          Chargement en cours...
        </div>
      )}
    </div>
  );
};
