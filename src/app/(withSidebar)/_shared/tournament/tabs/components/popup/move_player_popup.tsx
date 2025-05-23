import { Radio, RadioGroup } from "@heroui/react";
import { useEffect, useState } from "react";
import { TableAssignment, TournamentTable } from "@/app/types";
import { useAvailableTables } from "@/app/hook/useAvailableTables";

interface MovePlayerModalBodyProps {
  selectedPlayer: TableAssignment;
  moveOptions: TableAssignment[];
  tournamentId: number;
  onSelectTarget: (value: string) => void;
  onSelectMode: (mode: "swap" | "move") => void;
  selectedMode: "swap" | "move";
  selectedTarget: string;
}

export const MovePlayerModalBody = ({
  selectedPlayer,
  moveOptions,
  tournamentId,
  onSelectTarget,
  onSelectMode,
  selectedMode,
  selectedTarget
}: MovePlayerModalBodyProps) => {
  const { data: availableTables, isLoading: isLoadingTables } =
    useAvailableTables(
      tournamentId,
      selectedPlayer?.table_id,
      selectedMode === "move"
    );

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <RadioGroup
        label="Type de déplacement"
        value={selectedMode}
        className="flex flex-col gap-2"
        onChange={(e) => onSelectMode(e.target.value as "swap" | "move")}>
        <Radio value="swap">Échanger de place avec un joueur</Radio>
        <Radio value="move">Changer de table</Radio>
      </RadioGroup>

      {selectedMode === "swap" && (
        <select
          className="w-full border bg-neutral-800 text-white rounded-lg px-4 py-2"
          value={selectedTarget}
          onChange={(e) => onSelectTarget(e.target.value)}>
          <option value="" disabled>
            Sélectionner un joueur...
          </option>
          {moveOptions
            .filter((a) => !a.eliminated && a.id !== selectedPlayer.id)
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.registration?.wp_users?.pseudo_winamax} – Table{" "}
                {a.tournament_table?.table_number} – Siège {a.table_seat_number}
              </option>
            ))}
        </select>
      )}

      {selectedMode === "move" && (
        <select
          className="w-full border bg-neutral-800 text-white rounded-lg px-4 py-2"
          value={selectedTarget}
          onChange={(e) => onSelectTarget(e.target.value)}>
          <option value="" disabled>
            Choisir une nouvelle table...
          </option>
          {availableTables.map((table: TournamentTable) => (
            <option key={table.id} value={table.id}>
              Table {table.table_number}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
