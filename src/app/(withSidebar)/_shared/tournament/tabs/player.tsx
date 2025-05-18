import { GenericTable } from "@/app/components/table/generic_table";
import { ActionDefinition, SeatRow } from "@/app/components/table/table.types";
import { mapFlatAssignementsToSeatRows } from "@/app/lib/adapter/tournament_table.adapter";
import { Registration, TableAssignment } from "@/app/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { seatsColumns } from "@/app/components/table/presets/seats.config";
import { SearchBarComponents } from "@/app/components/form/search_bar";
import { GenericModal } from "@/app/components/popup";
import { EliminatePlayerFormBody } from "./components/popup/eliminate_player_popup";
import { LoadingComponent } from "@/app/error/loading/page";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";

export const PlayerTabs = () => {
  const [flatRows, setFlatRows] = useState<SeatRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<TableAssignment | null>(
    null
  );
  const [killerOptions, setKillerOptions] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelKillModal, setIsCancelKillModal] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { tournament, assignements, loadTournamentData } =
    useTournamentContext();

  useEffect(() => {
    if (!tournament?.id) return;
    setFlatRows(mapFlatAssignementsToSeatRows(assignements));
    setIsLoading(false);
  }, [tournament?.id, assignements]);

  const getConditionalActions = (item: SeatRow) => {
    console.log(item.eliminated);
    const actions: ActionDefinition<SeatRow>[] =
      item.eliminated == false
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
            },
            {
              tooltip: "Supprimer",
              icon: (
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={20}
                  strokeWidth={1.5}
                />
              ),
              onClick: () => {},
              color: "danger"
            }
          ]
        : [
            {
              tooltip: "Annuler élimination",
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
                setIsCancelKillModal(true);
              }
            }
          ];
    return actions;
  };

  const handleConfirmElimination = async (killerId: number) => {
    if (!selectedPlayer) return;

    try {
      const res = await fetch(
        `/api/tournament/${tournament?.id}/player/elimination/${selectedPlayer.registration_id}`,
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

  return (
    <div className="items-center">
      {isLoading ? (
        <LoadingComponent />
      ) : flatRows.length > 0 ? (
        <div className="flex flex-col gap-6 justify-center px-64">
          <SearchBarComponents
            label="Pseudo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <GenericTable<SeatRow>
            columns={seatsColumns}
            items={flatRows.filter((row) =>
              row.avatarName?.toLowerCase().startsWith(search.toLowerCase())
            )}
            width={false}
            ariaLabel=""
            showActions
            actions={getConditionalActions}
            enableSorting={false}
          />
        </div>
      ) : (
        <div className="text-center text-white mt-10">
          Aucun joueur n’est assigné à une table pour ce tournoi.
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
      <GenericModal
        isOpen={isCancelKillModal}
        onClose={() => {
          setIsCancelKillModal(false);
        }}
        title="Annuler l'élimination"
        confirmLabel="Annuler"
        cancelLabel="Retour"
        onConfirm={async () => {
          if (!selectedPlayer || !tournament) return;

          try {
            const res = await fetch(
              `/api/tournament/${tournament?.id}/player/elimination/${selectedPlayer.registration_id}/cancel`,
              {
                method: "PUT"
              }
            );
            if (!res.ok) throw new Error("Erreur serveur");
            await loadTournamentData();
            setSelectedPlayer(null);
            setIsCancelKillModal(false);
          } catch (error) {
            console.error("Erreur annulation élimination:", error);
            alert("Une erreur est survenue lors de l’annulation.");
          }
        }}>
        <p>
          Es-tu sûr de vouloir annuler l'élimination de{" "}
          <b>{selectedPlayer?.registration?.wp_users?.pseudo_winamax}</b> ?
        </p>
      </GenericModal>
    </div>
  );
};
