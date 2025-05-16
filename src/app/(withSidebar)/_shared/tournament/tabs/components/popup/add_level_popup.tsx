import { InputComponents } from "@/app/components/form/input";
import { NumberInputComponents } from "@/app/components/form/number_input";
import { RadioGroupComponents } from "@/app/components/form/radio_group";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { TournamentLevel } from "@/app/types";
import { Checkbox } from "@heroui/react";
import { useEffect, useState } from "react";

export type NiveauFormBodyProps = {
  isModify: boolean;
  level?: TournamentLevel;
  tournamentStart: string;
  onUpdate: (data: Partial<TournamentLevel>) => void;
};

export const NiveauFormBody: React.FC<NiveauFormBodyProps> = ({
  isModify,
  level,
  tournamentStart,
  onUpdate
}) => {
  const [isPause, setIsPause] = useState(false);
  const [afterLevel, setAfterLevel] = useState("");
  const [duration, setDuration] = useState("00:00");
  const [smallBlind, setSmallBlind] = useState<number>(0);
  const [bigBlind, setBigBlind] = useState<number>(0);
  const [ante, setAnte] = useState<number>(0);
  const [chipRace, setChipRace] = useState(false);

  useEffect(() => {
    if (level) {
      if (isModify) {
        setIsPause(level.level_pause);
        setDuration(
          level.level_start && level.level_end
            ? computeDuration(level.level_start, level.level_end)
            : ""
        );
        setSmallBlind(level.level_small_blinde);
        setBigBlind(level.level_big_blinde);
        setAnte(level.level_ante ?? 0);
        setChipRace(level.level_chip_race);
      }
      setAfterLevel(String(level.level_number));
    }
  }, [level, isModify]);

  useEffect(() => {
    const baseStart = level?.level_end || tournamentStart;
    const startDate = new Date(baseStart);
    const [durH, durM] = duration.split(":").map(Number);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + durH);
    endDate.setMinutes(startDate.getMinutes() + durM);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      onUpdate({
        level_number: parseInt(afterLevel) + 1,
        level_start: startDate.toISOString(),
        level_end: endDate.toISOString(),
        level_pause: isPause,
        level_small_blinde: smallBlind,
        level_big_blinde: bigBlind,
        level_ante: ante,
        level_chip_race: chipRace
      });
    }
  }, [
    afterLevel,
    duration,
    isPause,
    smallBlind,
    bigBlind,
    ante,
    chipRace,
    tournamentStart,
    onUpdate
  ]);

  return (
    <div className="flex flex-col gap-4 text-white">
      <RadioGroupComponents
        label="Pause"
        value={String(isPause)}
        onChange={(e) => {
          const v = e.target.value === "true";
          setIsPause(v);
        }}
      />

      <div className="flex gap-4">
        <div className="w-full">
          <InputComponents
            type="text"
            label="Après le niveau"
            value={afterLevel}
            onChange={(e) => setAfterLevel(e.target.value)}
          />
        </div>
        <div className="w-full">
          <TimeInputComponents
            label="Durée"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      {!isPause && (
        <div className="flex gap-4">
          <NumberInputComponents
            type="number"
            label="Petite blinde"
            value={smallBlind}
            onChange={(value) => setSmallBlind(Number(value))}
          />

          <NumberInputComponents
            type="number"
            label="Grosse blinde"
            value={bigBlind}
            onChange={(value) => setBigBlind(Number(value))}
          />
          <NumberInputComponents
            type="number"
            label="Ante"
            value={ante}
            onChange={(value) => setAnte(Number(value))}
          />
        </div>
      )}

      <Checkbox
        isSelected={chipRace}
        onValueChange={() => setChipRace(!chipRace)}>
        Chip race
      </Checkbox>
    </div>
  );
};

function computeDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const totalMin = Math.floor(diffMs / 60000);
  const h = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const m = String(totalMin % 60).padStart(2, "0");
  return `${h}:${m}`;
}
