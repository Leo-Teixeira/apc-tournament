import { DatePickerComponents } from "@/app/components/form/date_picker";
import { InputComponents } from "@/app/components/form/input";
import { NumberInputComponents } from "@/app/components/form/number_input";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { DateValue, NumberInput } from "@heroui/react";
import { useState } from "react";

export const TournamentFormBody = () => {
  const [tournamentName, setTournamentName] = useState("");
  const [date, setDate] = useState<DateValue | null>(null);
  const [openDate, setOpenDate] = useState<DateValue | null>(null);
  const [quarter, setQuarter] = useState<"T1" | "T2" | "T3">("T1");
  const [stackStart, setStackStart] = useState<number>(0);
  const [estimatedDuration, setEstimatedDuration] = useState<any>(null);

  return (
    <div className="flex flex-col gap-6">
      <InputComponents
        label="Nom du tournoi"
        type="text"
        value={tournamentName}
        onChange={(e) => setTournamentName(e.target.value)}
      />
      <DatePickerComponents
        label="Date du tournoi"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <DatePickerComponents
        label="Date d'ouverture"
        type="datetime-local"
        value={openDate}
        onChange={(e) => setDate(e.target.value)}
      />
      <div className="flex justify-between bg-neutral-800 rounded-lg">
        {["T1", "T2", "T3"].map((label) => (
          <button
            key={label}
            className={` text-primary_brand-50 px-4 py-2 font-satoshiMedium text-l rounded-lg transition-colors ${
              quarter === label ? "bg-primary_background font-bold" : ""
            }`}
            onClick={() => setQuarter(label as "T1" | "T2" | "T3")}>
            {label === "T1"
              ? "Trimestre 1"
              : label === "T2"
              ? "Trimestre 2"
              : "Trimestre 3"}
          </button>
        ))}
      </div>
      <NumberInputComponents
        label="Tapis de départ"
        type="text"
        value={stackStart}
        onChange={(e) => setStackStart(e.target.value)}
      />
      <TimeInputComponents
        label="Durée totale estimée"
        type="text"
        value={estimatedDuration}
        onChange={(e) => setEstimatedDuration(e.target.value)}
      />
    </div>
  );
};
