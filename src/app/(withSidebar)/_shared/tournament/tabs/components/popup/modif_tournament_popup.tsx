"use client";

import { useEffect, useState } from "react";
import { DatePickerComponents } from "@/app/components/form/date_picker";
import { InputComponents } from "@/app/components/form/input";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { Tournament } from "@/app/types";
import { toDateTimeLocalString } from "@/app/utils/date";
import LoadingComponent from "@/app/error/loading/page";

export type TournamentFormBodyProps = {
  tournament?: Tournament;
  onUpdate: (data: Partial<Tournament>) => void;
};

export const TournamentFormBody: React.FC<TournamentFormBodyProps> = ({
  tournament,
  onUpdate
}) => {
  const [tournamentName, setTournamentName] = useState("");
  const [quarter, setQuarter] = useState<"T1" | "T2" | "T3">("T1");
  const [date, setDate] = useState<string>("");
  const [openDate, setOpenDate] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");

  useEffect(() => {
    if (tournament) {
      const dateStr = toDateTimeLocalString(
        new Date(tournament.tournament_start_date)
      );
      const openStr = toDateTimeLocalString(
        new Date(tournament.tournament_open_date)
      );
      const durationStr = tournament.estimate_duration
        ? new Date(tournament.estimate_duration).toISOString().slice(11, 16)
        : "";

      setTournamentName(tournament.tournament_name);
      setDate(dateStr);
      setOpenDate(openStr);
      // setQuarter(tournament.tournament_trimestry);
      setEstimatedDuration(durationStr);

      onUpdate({
        tournament_name: tournament.tournament_name,
        tournament_start_date: new Date(dateStr),
        tournament_open_date: new Date(openStr),
        tournament_trimestry: tournament.tournament_trimestry,
        estimate_duration: new Date(`1970-01-01T${durationStr}:00`)
      });
    }
  }, [tournament]);

  if (!tournament) return <LoadingComponent />;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <InputComponents
        label="Nom du tournoi"
        type="text"
        value={tournamentName}
        onChange={(e) => {
          setTournamentName(e.target.value);
          onUpdate({ tournament_name: e.target.value });
        }}
      />
      <div className="flex flex-col sm:flex-row justify-between gap-2 bg-neutral-800 rounded-lg p-2">
        {["T1", "T2", "T3"].map((label) => (
          <button
            key={label}
            className={`w-full text-primary_brand-50 px-4 py-2 font-satoshiRegular text-l rounded-lg transition-colors ${
              quarter === label ? "bg-primary_background font-bold" : ""
            }`}
            onClick={() => {
              setQuarter(label as "T1" | "T2" | "T3");
              // onUpdate("T1");
            }}>
            {label === "T1"
              ? "Trimestre 1"
              : label === "T2"
              ? "Trimestre 2"
              : "Trimestre 3"}
          </button>
        ))}
      </div>
      <DatePickerComponents
        label="Date du tournoi"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          onUpdate({ tournament_start_date: new Date(e.target.value) });
        }}
      />
      <DatePickerComponents
        label="Date d'ouverture des inscriptions"
        value={openDate}
        onChange={(e) => {
          setOpenDate(e.target.value);
          onUpdate({ tournament_open_date: new Date(e.target.value) });
        }}
      />
      <TimeInputComponents
        label="Durée totale estimée"
        value={estimatedDuration}
        onChange={(e) => {
          setEstimatedDuration(e.target.value);
          onUpdate({
            estimate_duration: new Date(`1970-01-01T${e.target.value}:00`)
          });
        }}
      />
    </div>
  );
};
