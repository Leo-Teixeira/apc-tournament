import { GenericTable } from "@/app/components/table/generic_table";
import { seatsColumns } from "@/app/components/table/presets/seats.config";
import { ActionDefinition, SeatRow } from "@/app/components/table/table.types";
import { LoadingComponent } from "@/app/error/loading/page";
import { mapAssignementsGroupedByTable } from "@/app/lib/adapter/tournament_table.adapter";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { Tournament } from "@/app/types";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

export const TableTabs = () => {
  const [groupedRows, setGroupedRows] = useState<Record<string, SeatRow[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { tournament, assignements, loadTournamentData } =
    useTournamentContext();

  useEffect(() => {
    const fetchAssignements = async () => {
      if (!tournament?.id) return;
      const assignementsData = mapAssignementsGroupedByTable(assignements);
      setGroupedRows(assignementsData);
      setIsLoading(false);
    };

    fetchAssignements();
  }, [tournament?.id, assignements]);

  const getConditionalActions = (item: SeatRow) => {
    const actions: ActionDefinition<SeatRow>[] = [
      {
        tooltip: "Éliminer",
        icon: <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />,
        onClick: () => {}
      }
    ];
    return actions;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">Chargement…</div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <LoadingComponent />
      ) : Object.keys(groupedRows).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(groupedRows).map(([tableNumber, rows]) => (
            <div key={tableNumber} className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">TABLE {tableNumber}</h2>
              <GenericTable<SeatRow>
                columns={seatsColumns}
                items={rows}
                ariaLabel={`Table ${tableNumber}`}
                showActions={true}
                actions={getConditionalActions}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-white mt-10">
          Aucun joueur assigné à une table pour ce tournoi.
        </div>
      )}
    </div>
  );
};
