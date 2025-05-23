"use client";

import { useEffect, useState } from "react";
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

  const [selectedPlayerToMove, setSelectedPlayerToMove] =
    useState<TableAssignment | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveOptions, setMoveOptions] = useState<TableAssignment[]>([]);
  const [moveMode, setMoveMode] = useState<"swap" | "move">("swap");
  const [selectedSwapTargetId, setSelectedSwapTargetId] = useState<
    number | null
  >(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [availableTables, setAvailableTables] = useState<
    { id: number; table_number: number }[]
  >([]);

  useEffect(() => {
    if (!tournament?.id) return;
    const assignementsData = mapAssignementsGroupedByTable(assignements);
    setGroupedRows(assignementsData);
    setIsLoading(false);
  }, [tournament?.id, assignements]);

  useEffect(() => {
    if (moveMode === "move" && tournament?.id) {
      fetch(`/api/tournament/${tournament.id}/tables`)
        .then((res) => res.json())
        .then((tables) => {
          const filtered = tables.filter(
            (t: any) => t.id !== selectedPlayerToMove?.table_id
          );
          setAvailableTables(filtered);
        })
        .catch((err) => {
          console.error("Erreur chargement tables :", err);
        });
    }
  }, [moveMode, selectedPlayerToMove, tournament?.id]);

  const handleConfirmElimination = async (killerId: number) => {
    if (!selectedPlayer || !tournament?.id) return;

    try {
      const res = await fetch(
        `/api/tournament/${tournament.id}/player/${selectedPlayer.registration_id}/elimination`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_kill_id: killerId })
        }
      );

      if (!res.ok) throw new Error("Erreur serveur");

      await loadTournamentData();

      const remainingAlive = assignements.filter((a) => !a.eliminated);
      if (
        remainingAlive.length === 1 &&
        tournament.tournament_status !== "finish"
      ) {
        const finishRes = await fetch(
          `/api/tournament/${tournament.id}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "finish" })
          }
        );

        if (!finishRes.ok) {
          console.error("⚠️ Impossible de terminer le tournoi automatiquement");
        } else {
          console.log("✅ Tournoi terminé automatiquement");
          await loadTournamentData();
        }
      }

      onClose();
    } catch (error) {
      console.error("Erreur élimination joueur:", error);
      alert("Une erreur est survenue lors de l'élimination du joueur.");
    }
  };

  const getConditionalActions = (
    item: SeatRow
  ): ActionDefinition<SeatRow>[] => [
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
    },
    {
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
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">Chargement…</div>
    );
  }

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
                  actions={
                    tournament?.tournament_status === "in_coming"
                      ? getConditionalActions
                      : undefined
                  }
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

          const body = {
            playerId: selectedPlayerToMove.id,
            mode: moveMode,
            targetId:
              moveMode === "swap" ? selectedSwapTargetId : selectedTableId
          };

          try {
            const res = await fetch(
              `/api/tournament/${tournament.id}/table/move`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
              }
            );

            if (!res.ok) throw new Error("Erreur lors du déplacement");

            await loadTournamentData();
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
          moveOptions={moveOptions}
          tournamentId={tournament?.id ?? 0}
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
        />
      </GenericModal>
    </div>
  );
};
