import { GenericModal } from "@/app/components/popup";
import { GenericTable } from "@/app/components/table/generic_table";
import { blindsColumns } from "@/app/components/table/presets/blinds.config";
import { ActionDefinition, BlindRow } from "@/app/components/table/table.types";
import { LoadingComponent } from "@/app/error/loading/page";
import { mapTournamentLevelsToRow } from "@/app/lib/adapter/tournament_level.adapter";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { useDisclosure } from "@heroui/react";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

export const NiveauxTabs: React.FC = () => {
  const { levels, tournament, loadTournamentData } = useTournamentContext();

  const [levelsRow, setLevelsRow] = useState<BlindRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelToDelete, setLevelToDelete] = useState<BlindRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    const rows = mapTournamentLevelsToRow(levels);
    setLevelsRow(rows);
    setIsLoading(false);
  }, [levels]);

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
        onClick: async () => {
          setLevelToDelete(item);
          setIsDeleteModalOpen(true);
        },
        color: "danger"
      }
    ];
    return actions;
  };

  return (
    <div>
      <div className="items-center">
        {isLoading ? (
          <LoadingComponent />
        ) : levelsRow && levelsRow.length > 0 ? (
          <GenericTable<BlindRow>
            columns={blindsColumns}
            items={levelsRow}
            ariaLabel=""
            showActions={true}
            actions={getConditionalActions}
          />
        ) : (
          <div className="text-center text-white mt-10">
            Aucun niveau défini pour ce tournoi.
          </div>
        )}
      </div>
      <GenericModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLevelToDelete(null);
        }}
        title="Supprimer le niveau"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (!levelToDelete || !tournament) return;

          try {
            const res = await fetch(`/api/level/${levelToDelete.id}`, {
              method: "DELETE"
            });

            if (!res.ok) throw new Error("Erreur serveur");

            await loadTournamentData();
            setIsDeleteModalOpen(false);
            setLevelToDelete(null);
          } catch (error) {
            console.error("Erreur suppression niveau :", error);
            alert("Une erreur est survenue.");
          }
        }}>
        <p>
          Es-tu sûr de vouloir supprimer le niveau <b>{levelToDelete?.level}</b>{" "}
          ?
        </p>
      </GenericModal>
    </div>
  );
};
