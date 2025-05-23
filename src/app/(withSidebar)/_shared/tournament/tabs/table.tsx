"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@heroui/react";
import { Cancel01Icon, CoinsSwapIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { GenericModal } from "@/app/components/popup";
import { GenericTable } from "@/app/components/table/generic_table";
import { seatsColumns } from "@/app/components/table/presets/seats.config";
import { ActionDefinition, SeatRow } from "@/app/components/table/table.types";
import { LoadingComponent } from "@/app/error/loading/page";
import { mapAssignementsGroupedByTable } from "@/app/lib/adapter/tournament_table.adapter";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { Registration, TableAssignment } from "@/app/types";
import { EliminatePlayerFormBody } from "./components/popup/eliminate_player_popup";
import { MovePlayerModalBody } from "./components/popup/move_player_popup";
import { useMovePlayer } from "@/app/hook/useMovePlayer";
import { useEliminatePlayer } from "@/app/hook/useEliminatePlayer";
import { useFinishTournament } from "@/app/hook/useUpdateTournament";
import { useAvailableTables } from "@/app/hook/useAvailableTables";

export const TableTabs = () => {
  const [groupedRows, setGroupedRows] = useState<Record<string, SeatRow[]>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<TableAssignment | null>(
    null
  );
  const [seatNumber, setSeatNumber] = useState<number>(1);

  const [killerOptions, setKillerOptions] = useState<Registration[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { tournament, assignements } = useTournamentContext();

  const movePlayerMutation = useMovePlayer();
  const eliminatePlayerMutation = useEliminatePlayer();
  const finishTournamentMutation = useFinishTournament();

  const [selectedPlayerToMove, setSelectedPlayerToMove] =
    useState<TableAssignment | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveOptions, setMoveOptions] = useState<TableAssignment[]>([]);
  const [moveMode, setMoveMode] = useState<"swap" | "move">("swap");
  const [selectedSwapTargetId, setSelectedSwapTargetId] = useState<
    number | null
  >(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  const { data: availableTables, isLoading: isLoadingTables } =
    useAvailableTables(
      tournament?.id,
      selectedPlayerToMove?.table_id,
      moveMode === "move"
    );

  useEffect(() => {
    if (tournament?.id) {
      setGroupedRows(mapAssignementsGroupedByTable(assignements));
    }
  }, [tournament?.id, assignements]);

  const handleConfirmElimination = async (killerId: number) => {
    if (!selectedPlayer || !tournament) return;

    try {
      await eliminatePlayerMutation.mutateAsync({
        tournamentId: tournament.id,
        registrationId: selectedPlayer.registration_id,
        killerId
      });

      const remainingAlive = assignements.filter((a) => !a.eliminated);
      if (
        remainingAlive.length === 1 &&
        tournament.tournament_status !== "finish"
      ) {
        await finishTournamentMutation.mutateAsync(tournament.id);
        console.log("✅ Tournoi terminé automatiquement");
      }

      onClose();
    } catch (error) {
      console.error("Erreur élimination joueur:", error);
      alert("Une erreur est survenue lors de l'élimination du joueur.");
    }
  };

  const getConditionalActions = (
    item: SeatRow
  ): ActionDefinition<SeatRow>[] => {
    const actions: ActionDefinition<SeatRow>[] = [];

    if (tournament && tournament.tournament_status !== "start") {
      actions.push({
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
      });
    }

    actions.push({
      tooltip: "Changer de place",
      icon: <HugeiconsIcon icon={CoinsSwapIcon} size={20} strokeWidth={1.5} />,
      onClick: () => {
        const assignment = assignements.find((a) => a.id === item.id);
        if (!assignment) return;

        setSelectedPlayerToMove(assignment);

        const otherPlayers = assignements.filter(
          (a) =>
            !a.eliminated &&
            a.id !== assignment.id &&
            a.registration &&
            a.tournament_table
        );

        setMoveOptions(otherPlayers);
        setIsMoveModalOpen(true);
      }
    });

    return actions;
  };

  if (!tournament) return <LoadingComponent />;

  return (
    <div className="flex flex-col gap-6">
      {Object.keys(groupedRows).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(groupedRows).map(([tableNumber, rows]) => (
            <div key={tableNumber} className="flex flex-col gap-2">
              <h2 className="text-center sm:text-left text-base sm:text-xl font-bold">
                TABLE {tableNumber}
              </h2>
              <div className="w-full overflow-x-auto">
                <GenericTable<SeatRow>
                  columns={seatsColumns}
                  items={rows}
                  ariaLabel={`Table ${tableNumber}`}
                  showActions
                  actions={getConditionalActions}
                  enableSorting={false}
                />
              </div>
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
          const killerId = killerOptions[0]?.id;
          if (killerId) handleConfirmElimination(killerId);
        }}>
        <EliminatePlayerFormBody
          eliminatePlayer={
            selectedPlayer?.registration?.wp_users?.pseudo_winamax ?? ""
          }
          allPlayerTable={killerOptions}
        />
      </GenericModal>

      <GenericModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setSelectedSwapTargetId(null);
          setSelectedTableId(null);
          setMoveMode("swap");
        }}
        title="Changer de place"
        confirmLabel="Confirmer"
        onConfirm={async () => {
          if (!selectedPlayerToMove || !tournament?.id) return;

          const targetId =
            moveMode === "swap" ? selectedSwapTargetId : selectedTableId;

          if (!targetId) {
            alert("Aucune cible sélectionnée");
            return;
          }

          try {
            const payload: any = {
              tournamentId: tournament.id,
              playerId: selectedPlayerToMove.id,
              mode: moveMode,
              targetId
            };

            if (moveMode === "move") {
              payload.seatNumber = seatNumber;
            }

            await movePlayerMutation.mutateAsync(payload);

            setIsMoveModalOpen(false);
            setSelectedSwapTargetId(null);
            setSelectedTableId(null);
            setMoveMode("swap");
          } catch (err) {
            console.error("❌ Erreur lors du déplacement :", err);
            alert("Une erreur est survenue lors du déplacement.");
          }
        }}>
        <MovePlayerModalBody
          selectedPlayer={selectedPlayerToMove!}
          moveOptions={
            moveMode === "swap" ? moveOptions : availableTables ?? []
          }
          tournamentId={tournament.id}
          onSelectTarget={(value: string) => {
            if (moveMode === "swap") {
              setSelectedSwapTargetId(parseInt(value));
            } else {
              setSelectedTableId(parseInt(value));
            }
          }}
          onSelectMode={(mode) => setMoveMode(mode)}
          selectedMode={moveMode}
          selectedTarget={
            moveMode === "swap"
              ? selectedSwapTargetId?.toString() ?? ""
              : selectedTableId?.toString() ?? ""
          }
          onSeatNumberChange={setSeatNumber}
        />
      </GenericModal>
    </div>
  );
};
