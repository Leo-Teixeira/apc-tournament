import { GenericTable } from "@/app/components/table/generic_table";
import { ActionDefinition, SeatRow } from "@/app/components/table/table.types";
import { mapFlatAssignementsToSeatRows } from "@/app/lib/adapter/tournament_table.adapter";
import { Registration, Tournament } from "@/app/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { seatsColumns } from "@/app/components/table/presets/seats.config";
import { SearchBarComponents } from "@/app/components/form/search_bar";
import { GenericModal } from "@/app/components/popup";
import { EliminatePlayerFormBody } from "./components/popup/eliminate_player_popup";

export const PlayerTabs: React.FC<{ tournament: Tournament }> = ({
  tournament
}) => {
  const [flatRows, setFlatRows] = useState<SeatRow[]>([]);
  const [assignements, setAssignements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<SeatRow | null>(null);
  const [sameTablePlayers, setSameTablePlayers] = useState<SeatRow[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchAssignements = async () => {
      try {
        const res = await fetch(`/api/tournament/${tournament.id}/table`);
        const data = await res.json();
        setAssignements(data);
        setFlatRows(mapFlatAssignementsToSeatRows(data));
      } catch (err) {
        console.error("Erreur chargement assignements :", err);
      }
    };

    fetchAssignements();
  }, [tournament.id]);

  const getConditionalActions = (item: SeatRow) => {
    const actions: ActionDefinition<SeatRow>[] = [
      {
        tooltip: "Éliminer",
        icon: <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />,
        onClick: () => {
          setSelectedPlayer(item);

          const assignment = assignements.find((a) => a.id === item.id);
          if (!assignment?.table?.table_number) return;

          const playersSameTable = assignements
            .filter(
              (a) => a.table?.table_number === assignment.table.table_number
            )
            .map((a) => ({
              id: a.id,
              avatarName: a.registration?.user_id ?? "Inconnu",
              seat: `Table ${a.table?.table_number}, siège ${a.table_seat_number}`,
              action: ""
            }));

          // setSameTablePlayers(playersSameTable);
          onOpen();
        }
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
      {flatRows.length > 0 ? (
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
            ariaLabel=""
            showActions
            actions={getConditionalActions}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          Chargement en cours...
        </div>
      )}

      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Éliminer un joueur"
        confirmLabel="Confirmer l'élimination"
        onConfirm={() => {}}>
        <EliminatePlayerFormBody
          eliminatePlayer={selectedPlayer?.avatarName ?? ""}
          allPlayerTable={assignements
            .filter(
              (a) =>
                a.table &&
                selectedPlayer &&
                `Table ${a.table.table_number}` ===
                  selectedPlayer.seat.split(",")[0]
            )
            .map((a) => a.registration)
            .filter((r): r is Registration => !!r && typeof r === "object")
            .filter((r) => {
              const pseudo = r.wp_users?.pseudo_winamax ?? "";
              return pseudo !== selectedPlayer?.avatarName;
            })}
        />
      </GenericModal>
    </div>
  );
};
