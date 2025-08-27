"use client";

import { useEffect, useState } from "react";
import { DatePickerComponents } from "@/app/components/form/date_picker";
import { InputComponents } from "@/app/components/form/input";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { Tournament } from "@/app/types";
import { parseLocalDateTime, toDateTimeLocalString, toLocalISOString } from "@/app/utils/date";
import LoadingComponent from "@/app/error/loading/page";
import { Trimester } from "@/app/types/trimester.types";

export type TournamentFormBodyProps = {
  tournament?: Tournament;
  trimestry: Trimester[]; // le tableau de trimestres avec id et number
  onUpdate: (data: Partial<Tournament>) => void;
};

export const TournamentFormBody: React.FC<TournamentFormBodyProps> = ({
  tournament,
  trimestry,
  onUpdate
}) => {
  const [quarter, setQuarter] = useState<"T1" | "T2" | "T3">("T1");
  const [tournamentName, setTournamentName] = useState("");
  const [date, setDate] = useState<string>("");
  const [openDate, setOpenDate] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");

  // Trier une copie du tableau des trimestres pour ne pas muter la prop
  const sortedTrimestry = [...trimestry].sort((a, b) => a.number - b.number);

  useEffect(() => {
    if (tournament) {
      const startDateRaw = tournament.tournament_start_date.toString().slice(0, 16);
      const openDateRaw = tournament.tournament_open_date.toString().slice(0, 16);
  
      const startDate = parseLocalDateTime(startDateRaw);
      const openDate = parseLocalDateTime(openDateRaw);
  
      const dateStr = toDateTimeLocalString(startDate);
      const openStr = toDateTimeLocalString(openDate);
  
      const durationStr = tournament.estimate_duration
        ? new Date(tournament.estimate_duration).toISOString().slice(11, 16)
        : "";
  
      setTournamentName(tournament.tournament_name);
      setDate(dateStr);
      setOpenDate(openStr);
      setEstimatedDuration(durationStr);
  
      const trimesterObj = trimestry.find(
        (t) => t.id === tournament.tournament_trimestry
      );
      const trimestryKey = trimesterObj ? (`T${trimesterObj.number}` as "T1" | "T2" | "T3") : "T1";
  
      setQuarter(trimestryKey);
    }
  }, [tournament, trimestry]);
  
  

  if (!tournament) return <LoadingComponent />;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <InputComponents
        label="Nom du tournoi"
        type="text"
        value={tournamentName}
        onChange={(e) => {
          setTournamentName(e.target.value);
          onUpdate({ id: tournament.id, tournament_name: e.target.value });
        }}
      />
      <div className="flex flex-col sm:flex-row justify-between gap-2 bg-neutral-800 rounded-lg p-2">
        {sortedTrimestry.map((t) => {
          const label = `T${t.number}` as "T1" | "T2" | "T3";
          return (
            <button
              key={t.id}
              className={`w-full text-primary_brand-50 px-4 py-2 font-satoshiRegular text-l rounded-lg transition-colors ${
                quarter === label ? "bg-primary_background font-bold" : ""
              }`}
              onClick={() => {
                setQuarter(label);
                onUpdate({ id: tournament.id, tournament_trimestry: t.id });
              }}
            >
              {`Trimestre ${t.number}`}
            </button>
          );
        })}
      </div>
      <DatePickerComponents
        label="Date du tournoi"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          onUpdate({ id: tournament.id, tournament_start_date: new Date(e.target.value) });
        }}
      />
      <DatePickerComponents
        label="Date d'ouverture des inscriptions"
        value={openDate}
        onChange={(e) => {
          setOpenDate(e.target.value);
          onUpdate({ id: tournament.id, tournament_open_date: new Date(e.target.value) });
        }}
      />
      <TimeInputComponents
        label="Durée totale estimée"
        value={estimatedDuration}
        onChange={(e) => {
          setEstimatedDuration(e.target.value);
          onUpdate({
            id: tournament.id,
            estimate_duration: new Date(`1970-01-01T${e.target.value}:00`),
          });
        }}
      />
    </div>
  );
};

