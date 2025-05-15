import { GenericModal } from "@/app/components/popup";
import { GenericTable } from "@/app/components/table/generic_table";
import { blindsColumns } from "@/app/components/table/presets/blinds.config";
import { ActionDefinition, BlindRow } from "@/app/components/table/table.types";
import { LoadingComponent } from "@/app/error/loading/page";
import { mapTournamentLevelsToRow } from "@/app/lib/adapter/tournament_level.adapter";
import { Tournament, TournamentLevel } from "@/app/types";
import { useDisclosure } from "@heroui/react";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

type NiveauxProps = {
  tournament: Tournament;
};

export const NiveauxTabs: React.FC<NiveauxProps> = ({ tournament }) => {
  const [levelsRow, setLevelsRow] = useState<BlindRow[]>();
  const [isLoading, setIsLoading] = useState(true);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isPause, setIsPause] = useState(false);
  const [afterLevel, setAfterLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [smallBlind, setSmallBlind] = useState("");
  const [bigBlind, setBigBlind] = useState("");
  const [ante, setAnte] = useState("");
  const [chipRace, setChipRace] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tournament/${tournament.id}/level`);

        if (res.status === 404) {
          window.location.href = "/not-found";
          return;
        }

        if (res.status >= 500) {
          window.location.href = "/500";
          return;
        }

        const levels: TournamentLevel[] = await res.json();
        const rows = mapTournamentLevelsToRow(levels);
        setLevelsRow(rows);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        window.location.href = "/500";
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tournament.id]);

  const handleCreateNiveau = () => {
    console.log("réussi");
    onClose();
  };

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

      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Ajouter un niveau"
        confirmLabel="Ajouter le niveau"
        onConfirm={handleCreateNiveau}>
        <div className="flex flex-col gap-4 text-white">
          <div className="flex gap-4">
            <p className="font-satoshiBold text-l">Pause</p>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pause"
                checked={isPause}
                onChange={() => setIsPause(true)}
              />
              Oui
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pause"
                checked={!isPause}
                onChange={() => setIsPause(false)}
              />
              Non
            </label>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Après le niveau"
              className="bg-neutral-800 px-4 py-2 rounded-lg w-full"
              value={afterLevel}
              onChange={(e) => setAfterLevel(e.target.value)}
            />
            <input
              type="time"
              placeholder="Durée"
              className="bg-neutral-800 px-4 py-2 rounded-lg w-full"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {!isPause && (
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Petite blinde"
                className="bg-neutral-800 px-4 py-2 rounded-lg w-full"
                value={smallBlind}
                onChange={(e) => setSmallBlind(e.target.value)}
              />
              <input
                type="number"
                placeholder="Grosse blinde"
                className="bg-neutral-800 px-4 py-2 rounded-lg w-full"
                value={bigBlind}
                onChange={(e) => setBigBlind(e.target.value)}
              />
              <input
                type="number"
                placeholder="Ante"
                className="bg-neutral-800 px-4 py-2 rounded-lg w-full"
                value={ante}
                onChange={(e) => setAnte(e.target.value)}
              />
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chipRace}
              onChange={() => setChipRace(!chipRace)}
            />
            Chip race
          </label>
        </div>
      </GenericModal>
    </div>
  );
};
