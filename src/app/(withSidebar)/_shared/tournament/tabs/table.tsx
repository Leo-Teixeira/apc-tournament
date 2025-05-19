import { GenericModal } from "@/app/components/popup";
import { GenericTable } from "@/app/components/table/generic_table";
import { seatsColumns } from "@/app/components/table/presets/seats.config";
import { ActionDefinition, SeatRow } from "@/app/components/table/table.types";
import { LoadingComponent } from "@/app/error/loading/page";
import { mapAssignementsGroupedByTable } from "@/app/lib/adapter/tournament_table.adapter";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { Registration, TableAssignment, Tournament } from "@/app/types";
import { useDisclosure } from "@heroui/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { EliminatePlayerFormBody } from "./components/popup/eliminate_player_popup";

export const TableTabs = () => {
  const [groupedRows, setGroupedRows] = useState<Record<string, SeatRow[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<TableAssignment | null>(
    null
  );
  const [killerOptions, setKillerOptions] = useState<Registration[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const handleConfirmElimination = async (killerId: number) => {
    if (!selectedPlayer) return;

    try {
      const res = await fetch(
        `/api/tournament/${tournament?.id}/player/${selectedPlayer.registration_id}/elimination`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_kill_id: killerId })
        }
      );

      if (!res.ok) throw new Error("Erreur serveur");
      await loadTournamentData();
      onClose();
    } catch (error) {
      console.error("Erreur élimination joueur:", error);
      alert("Une erreur est survenue lors de l'élimination du joueur.");
    }
  };

  const getConditionalActions = (item: SeatRow) => {
    const actions: ActionDefinition<SeatRow>[] = [
      {
        tooltip: "Éliminer",
        icon: <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />,
        onClick: () => {
          const assignment = assignements.find((a) => a.id === item.id);
          if (!assignment?.tournament_table?.table_number) return;

          setSelectedPlayer(assignment);

          const killers = assignements
            .filter(
              (a) =>
                !a.eliminated &&
                a.registration &&
                a.tournament_table?.table_number ===
                  assignment.tournament_table?.table_number &&
                a.registration_id !== assignment.registration_id
            )
            .map((a) => a.registration)
            .filter((r): r is Registration => !!r);

          setKillerOptions(killers);
          onOpen();
        }
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
                actions={
                  tournament?.tournament_status === "in_coming"
                    ? getConditionalActions
                    : undefined
                }
                enableSorting={false}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-white mt-10">
          Aucun joueur assigné à une table pour ce tournoi.
        </div>
      )}
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Éliminer un joueur"
        confirmLabel="Confirmer l'élimination"
        onConfirm={() => {
          const killerId = killerOptions[0]?.user_id;
          if (killerId) handleConfirmElimination(killerId);
        }}>
        <EliminatePlayerFormBody
          eliminatePlayer={
            selectedPlayer?.registration?.wp_users?.pseudo_winamax ?? ""
          }
          allPlayerTable={killerOptions}
        />
      </GenericModal>
    </div>
  );
};
