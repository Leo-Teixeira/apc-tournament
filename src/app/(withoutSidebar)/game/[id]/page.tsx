"use client";

import { ChipLegend } from "@/app/components/chipLegend";
import InfoItem from "@/app/components/infoItem";
import {
  Chip,
  Registration,
  Tournament,
  TournamentLevel,
  TournamentRanking
} from "@/app/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Game() {
  const { id } = useParams();

  const [tournament, setTournament] = useState<Tournament>();
  const [levels, setLevels] = useState<TournamentLevel[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [classement, setClassement] = useState<TournamentRanking[]>([]);
  const [registration, setRegistration] = useState<Registration[]>([]);
  const [now, setNow] = useState(new Date());
  const [durationTotal, setDurationTotal] = useState("--:--:--");
  const [isLoading, setIsLoading] = useState(true);

  const [currentLevel, setCurrentLevel] = useState<TournamentLevel | null>(
    null
  );
  const [nextLevel, setNextLevel] = useState<TournamentLevel | null>(null);
  const [nextPause, setNextPause] = useState<TournamentLevel | null>(null);

  const parseTime = (str: string) => {
    const [hour, minute] = str.split("h").map(Number);
    const time = new Date();
    time.setHours(hour, minute, 0, 0);
    return time;
  };

  const getDurationSince = (startISO: string) => {
    const startDate = new Date(startISO);
    const localStart = new Date(
      startDate.getTime() + startDate.getTimezoneOffset() * 60000
    );

    const diff = now.getTime() - localStart.getTime();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const getTimeLeft = (endTime: string) => {
    const end = parseTime(endTime);
    const diff = end.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getTimeUntilNextPause = () => {
    if (!nextPause) return "-";
    const diff = parseTime(nextPause.level_start).getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getAverageStack = () => {
    const totalChips = classement.length * 10000;
    const remainingPlayers = classement.length;
    return Math.round(totalChips / remainingPlayers).toString();
  };

  const getRemainingPlayers = () => classement.length.toString();

  useEffect(() => {
    const interval = setInterval(() => {
      const newNow = new Date();
      setNow(newNow);

      if (tournament) {
        console.log(
          "Durée totale calculée :",
          getDurationSince(tournament.tournament_start_date)
        );
      }

      const cl = levels.find((level) => {
        const start = parseTime(level.level_start);
        const end = parseTime(level.level_end);
        return newNow >= start && newNow < end;
      });

      const nl = levels.find((level) => parseTime(level.level_start) > newNow);
      const np = levels.find(
        (level) => parseTime(level.level_start) > newNow && level.level_pause
      );

      setCurrentLevel(cl ?? null);
      setNextLevel(nl ?? null);
      setNextPause(np ?? null);
    }, 1000);

    return () => clearInterval(interval);
  }, [levels, tournament]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          tournamentRes,
          registrationRes,
          classementRes,
          levelRes,
          chipRes
        ] = await Promise.all([
          fetch(`/api/tournament/${id}`),
          fetch(`/api/registrations/${id}`),
          fetch(`/api/tournament/${id}/classement`),
          fetch(`/api/tournament/${id}/level`),
          fetch(`/api/tournament/${id}/chip`)
        ]);

        const chipData = await chipRes.json();
        setChips(chipData.chips);
        setLevels(await levelRes.json());
        const tournamentData = await tournamentRes.json();
        setTournament(tournamentData);
        setRegistration(await registrationRes.json());
        setClassement(await classementRes.json());
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (
    isLoading ||
    tournament == null ||
    tournament == undefined ||
    !Array.isArray(chips)
  ) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black text-white text-3xl font-satoshiBold">
        Chargement en cours...
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/images/background_dashboard.svg')` }}>
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-8">
        <div className="text-center text-white">
          <h1 className="text-7xl font-satoshiBold text-primary_brand-50">
            {tournament.tournament_name}
          </h1>
          <p className="font-satoshi text-5xl text-primary_brand-50">
            {`${now.getDate().toString().padStart(2, "0")}/${(
              now.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}/${now.getFullYear()} ${now
              .getHours()
              .toString()
              .padStart(2, "0")}:${now
              .getMinutes()
              .toString()
              .padStart(2, "0")}`}
          </p>
        </div>

        <div className="flex justify-between">
          <div className="space-y-4">
            <InfoItem
              label="Niveau"
              value={currentLevel?.level_number.toString() ?? "-"}
            />
            <InfoItem
              label="Durée totale"
              value={
                tournament
                  ? getDurationSince(tournament.tournament_start_date)
                  : "--:--:--"
              }
            />

            <InfoItem label="Pause" value={getTimeUntilNextPause()} />
          </div>

          <div className="text-center text-primary_brand-50">
            <div className="text-xl12 font-satoshiBold">
              {currentLevel ? getTimeLeft(currentLevel.level_end) : "--:--"}
            </div>
            <div className="text-xl7 font-satoshiBold">
              {currentLevel && !currentLevel.level_pause
                ? `${currentLevel.level_small_blinde}/${currentLevel.level_big_blinde}`
                : nextLevel
                ? `${nextLevel.level_small_blinde}/${nextLevel.level_big_blinde}`
                : "-/-"}
            </div>
            <div className="text-xl6 font-satoshiBold">
              {nextLevel
                ? `${nextLevel.level_small_blinde}/${nextLevel.level_big_blinde}`
                : "-/-"}
            </div>
          </div>

          <div className="space-y-4 text-right">
            <InfoItem label="Stack moyen" value={getAverageStack()} />
            <InfoItem label="Ante" value="-" />
            <InfoItem
              label="Joueurs"
              value={`${getRemainingPlayers()}/${registration.length}`}
            />
          </div>
        </div>

        <ChipLegend chips={chips} />
      </div>
    </div>
  );
}
