import { InputComponents } from "@/app/components/form/input";
import { NumberInputComponents } from "@/app/components/form/number_input";
import { RadioGroupComponents } from "@/app/components/form/radio_group";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { Checkbox } from "@heroui/react";
import { useState } from "react";

export const NiveauFormBody = () => {
  const [isPause, setIsPause] = useState(false);
  const [afterLevel, setAfterLevel] = useState("");
  const [duration, setDuration] = useState<any>(null);
  const [smallBlind, setSmallBlind] = useState<number>(0);
  const [bigBlind, setBigBlind] = useState<number>(10);
  const [ante, setAnte] = useState<number>(0);
  const [chipRace, setChipRace] = useState(false);

  return (
    <div className="flex flex-col gap-4 text-white">
      <RadioGroupComponents
        label="Pause"
        value={String(isPause)}
        onChange={(e) => {
          e.target.value == "true" ? setIsPause(true) : setIsPause(false);
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
            type="time"
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
            onChange={(e) => setSmallBlind(e.target.value)}
          />
          <NumberInputComponents
            type="number"
            label="Grosse blinde"
            value={bigBlind}
            onChange={(e) => setSmallBlind(e.target.value)}
          />
          <NumberInputComponents
            type="number"
            label="Ante"
            value={ante}
            onChange={(e) => setSmallBlind(e.target.value)}
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
