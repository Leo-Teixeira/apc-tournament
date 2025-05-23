import { InputComponents } from "@/app/components/form/input";
import { NumberInputComponents } from "@/app/components/form/number_input";
import { RadioGroupComponents } from "@/app/components/form/radio_group";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { TournamentLevel } from "@/app/types";
import { Checkbox } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

export type NiveauFormBodyProps = {
  isModify: boolean;
  level?: TournamentLevel;
  tournamentStart: Date;
  onUpdate: (
    data: Partial<TournamentLevel> & { duration_minutes: number }
  ) => void;
};

export const NiveauFormBody: React.FC<NiveauFormBodyProps> = ({
  isModify,
  level,
  tournamentStart,
  onUpdate
}) => {
  const initialStart = useMemo(
    () => new Date(level?.level_start ?? tournamentStart),
    [level, tournamentStart]
  );

  const [isPause, setIsPause] = useState(() => level?.level_pause ?? false);
  const [afterLevel, setAfterLevel] = useState(() =>
    String(level?.level_number ?? 0)
  );
  const [duration, setDuration] = useState(() =>
    level?.level_start && level?.level_end
      ? computeDuration(level.level_start, level.level_end)
      : "00:00"
  );
  const [smallBlind, setSmallBlind] = useState(
    () => level?.level_small_blinde ?? 0
  );
  const [bigBlind, setBigBlind] = useState(() => level?.level_big_blinde ?? 0);
  const [ante, setAnte] = useState(() => level?.level_ante ?? 0);
  const [chipRace, setChipRace] = useState(
    () => level?.level_chip_race ?? false
  );

  useEffect(() => {
    const [durH, durM] = duration.split(":").map(Number);
    const durationMinutes = durH * 60 + durM;

    if (!isNaN(durationMinutes)) {
      onUpdate({
        level_number: parseInt(afterLevel) + 1,
        level_start: initialStart.toISOString(),
        duration_minutes: durationMinutes,
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
    initialStart,
    onUpdate
  ]);

  return (
    <div className="flex flex-col gap-6 text-primary_brand-50">
      <RadioGroupComponents
        label="Pause"
        value={String(isPause)}
        onChange={(e) => setIsPause(e.target.value === "true")}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <InputComponents
          disabled={isModify}
          type="text"
          label="Après le niveau"
          value={afterLevel}
          onChange={(e) => setAfterLevel(e.target.value)}
        />
        <TimeInputComponents
          label="Durée"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      {!isPause && (
        <div className="flex flex-col md:flex-row gap-4">
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
      {isPause && (
        <div className="mt-2">
          <Checkbox
            isSelected={chipRace}
            onValueChange={() => setChipRace(!chipRace)}>
            Chip race
          </Checkbox>
        </div>
      )}
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
