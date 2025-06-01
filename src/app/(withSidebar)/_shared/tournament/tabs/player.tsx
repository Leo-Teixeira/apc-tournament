"use client";

import { useEffect, useState } from "react";
import { useDisclosure } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Delete02Icon,
  Eraser01Icon
} from "@hugeicons/core-free-icons";

import { GenericTable } from "@/app/components/table/generic_table";
import { seatsColumns } from "@/app/components/table/presets/seats.config";
import { ActionDefinition, SeatRow } from "@/app/components/table/table.types";
import { SearchBarComponents } from "@/app/components/form/search_bar";
import { GenericModal } from "@/app/components/popup";
import { EliminatePlayerFormBody } from "./components/popup/eliminate_player_popup";
import { mapFlatAssignementsToSeatRows } from "@/app/lib/adapter/tournament_table.adapter";
import { Registration, TableAssignment } from "@/app/types";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { useCancelTournamentPlayer } from "@/app/hook/useCancelTournamentPlayer";
import { useCancelPlayerElimination } from "@/app/hook/useCancelPlayerElimination";
import { useFinishTournament } from "@/app/hook/useUpdateTournament";
import { useEliminatePlayer } from "@/app/hook/useEliminatePlayer";
import LoadingComponent from "@/app/error/loading/page";

export const PlayerTabs = () => {
  const [flatRows, setFlatRows] = useState<SeatRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<TableAssignment | null>(
    null
  );
  const [killerOptions, setKillerOptions] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelKillModal, setIsCancelKillModal] = useState(false);
  const [isCancelStatusModal, setIsCancelStatusModal] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { tournament, assignements, registration } = useTournamentContext();

  const cancelPlayerMutation = useCancelTournamentPlayer();
  const cancelEliminationMutation = useCancelPlayerElimination();
  const eliminatePlayerMutation = useEliminatePlayer();
  const finishTournamentMutation = useFinishTournament();

  useEffect(() => {
    if (!tournament?.id) return;
    setFlatRows(mapFlatAssignementsToSeatRows(assignements, registration));
    setIsLoading(false);
  }, [tournament?.id, assignements, registration]);

  const getConditionalActions = (
    item: SeatRow
  ): ActionDefinition<SeatRow>[] => {
    if (tournament?.tournament_status !== "start") {
      return item.eliminated === false
        ? [
            {
              tooltip: "Éliminer",
              icon: (
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={20}
                  strokeWidth={1.5}
                />
              ),
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
          ]
        : [
            {
              tooltip: "Annuler élimination",
              icon: (
                <HugeiconsIcon
                  icon={Eraser01Icon}
                  size={20}
                  strokeWidth={1.5}
                />
              ),
              onClick: () => {
                const assignment = assignements.find((a) => a.id === item.id);
                if (!assignment?.tournament_table?.table_number) return;
                setSelectedPlayer(assignment);
                setIsCancelKillModal(true);
              }
            }
          ];
    }

    return [
      {
        tooltip: "Supprimer",
        icon: <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={1.5} />,
        onClick: () => {
          let assignment = assignements.find((a) => a.id === item.id);

          // Fallback si le joueur vient du mapping par registration uniquement
          if (!assignment) {
            const fallbackReg = registration.find(
              (r) => r.wp_users?.pseudo_winamax === item.avatarName
            );

            if (fallbackReg) {
              assignment = {
                id: -1,
                tournament_id: tournament.id,
                registration_id: fallbackReg.id,
                eliminated: false,
                table_seat_number: 0,
                tournament_table: null,
                registration: fallbackReg
              } as unknown as TableAssignment;
            }
          }

          if (assignment) {
            setSelectedPlayer(assignment);
            setIsCancelStatusModal(true);
          }
        },
        color: "danger"
      }
    ];
  };

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

  return (
    <div className="flex flex-col gap-6">
      {isLoading && <LoadingComponent />}
      <>
        <div className="px-1 sm:px-0">
          <SearchBarComponents
            label="Pseudo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full overflow-x-auto">
          <GenericTable<SeatRow>
            columns={seatsColumns}
            items={flatRows.filter((row) =>
              row.avatarName?.toLowerCase().startsWith(search.toLowerCase())
            )}
            width={false}
            ariaLabel="Joueurs"
            showActions
            enableRowClick
            getDetailUrl={() => ""}
            actions={getConditionalActions}
            enableSorting={false}
          />
        </div>
      </>

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
        isOpen={isCancelKillModal}
        onClose={() => setIsCancelKillModal(false)}
        title="Annuler l'élimination"
        confirmLabel="Annuler"
        cancelLabel="Retour"
        onConfirm={async () => {
          if (!selectedPlayer || !tournament) return;

          try {
            await cancelEliminationMutation.mutateAsync({
              tournamentId: tournament.id,
              registrationId: selectedPlayer.registration_id
            });

            setSelectedPlayer(null);
            setIsCancelKillModal(false);
          } catch (error) {
            console.error("Erreur annulation élimination:", error);
            alert("Une erreur est survenue lors de l’annulation.");
          }
        }}>
        <p>
          Es-tu sûr de vouloir annuler l&apos;élimination de{" "}
          <b>{selectedPlayer?.registration?.wp_users?.pseudo_winamax}</b> ?
        </p>
      </GenericModal>

      <GenericModal
        isOpen={isCancelStatusModal}
        onClose={() => setIsCancelStatusModal(false)}
        title="Supprimer le joueur du tournoi"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (!selectedPlayer || !tournament) return;

          try {
            await cancelPlayerMutation.mutateAsync({
              tournamentId: tournament.id,
              registrationId: selectedPlayer.registration_id
            });

            setSelectedPlayer(null);
            setIsCancelStatusModal(false);
          } catch (error) {
            console.error("Erreur suppression joueur:", error);
            alert("Une erreur est survenue lors de la suppression.");
          }
        }}>
        <p>
          Es-tu sûr de vouloir supprimer l&apos;invitation du joueur{" "}
          <b>{selectedPlayer?.registration?.wp_users?.pseudo_winamax}</b> ?
        </p>
      </GenericModal>
    </div>
  );
};
