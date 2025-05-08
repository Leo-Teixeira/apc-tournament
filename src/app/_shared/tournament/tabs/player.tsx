import { GenericTable } from "@/app/components/table/generic_table";
import { blindsColumns } from "@/app/components/table/presets/blinds.config";
import {
  ActionDefinition,
  BlindRow,
  SeatRow
} from "@/app/components/table/table.types";
import { mapTournamentLevelsToRow } from "@/app/lib/adapter/tournament_level.adapter";
import {
  TableAssignement,
  Tournament,
  TournamentLevel,
  TournamentTable
} from "@/app/types";
import { Input } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Delete02Icon,
  Search01Icon
} from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { seatsColumns } from "@/app/components/table/presets/seats.config";
import { mapFlatAssignementsToSeatRows } from "@/app/lib/adapter/tournament_table.adapter";
import { SearchBarComponents } from "@/app/components/form/search_bar";

type PlayerProps = {
  tournament: Tournament;
};

export const PlayerTabs: React.FC<PlayerProps> = ({ tournament }) => {
  const [flatRows, setFlatRows] = useState<SeatRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const fetchAssignements = async () => {
      try {
        const res = await fetch(`/api/tournament/${tournament.id}/table`);
        const enrichedAssignements = await res.json();

        setFlatRows(mapFlatAssignementsToSeatRows(enrichedAssignements));
      } catch (err) {
        console.error("Erreur chargement assignements :", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignements();
  }, [tournament.id]);

  const getConditionalActions = (item: SeatRow) => {
    const actions: ActionDefinition<SeatRow>[] = [
      {
        tooltip: "Éliminer",
        icon: <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />,
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
      {flatRows && flatRows?.length > 0 ? (
        <div className="flex flex-col gap-6 justify-center px-64">
          <SearchBarComponents
            label="Pseudo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <GenericTable<SeatRow>
            columns={seatsColumns}
            items={flatRows}
            width={false}
            ariaLabel={""}
            showActions={true}
            actions={getConditionalActions}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          Chargement en cours...
        </div>
      )}
    </div>
  );
};
