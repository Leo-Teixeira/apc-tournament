"use client";

import { useEffect, useState, useRef } from "react";
import { ChipLegend } from "@/app/components/chipLegend";
import InfoItem from "@/app/components/infoItem";
import { Chip, TournamentLevel } from "@/app/types";
import { toLocalDate, toLocalISOString, formatHourFR, getDurationInMinutes } from "@/app/utils/date";
import { useParams } from "next/navigation";
import { useTournamentData } from "@/app/hook/useTournamentData";
import LoadingComponent from "@/app/error/loading/page";

export default function Game() {
  const { id } = useParams();
  const tournamentId = String(id);
  const { data, refetch, refetchStatusOnly } = useTournamentData(tournamentId);

  const tournament = data?.tournament;
  const levels = data?.levels ?? [];
  const registration = data?.registrations ?? [];
  const assignements = data?.assignements ?? [];

  const [now, setNow] = useState(new Date());
  const [frozenNow, setFrozenNow] = useState<Date | null>(null);
  const [currentLevel, setCurrentLevel] = useState<TournamentLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<TournamentLevel | null>(null);
  const [nextPause, setNextPause] = useState<TournamentLevel | null>(null);

  const [bgIndex, setBgIndex] = useState(0);
  const previousLevelId = useRef<number | null>(null);

  const isPaused = tournament?.tournament_pause === true;
  const getNow = () => (isPaused && frozenNow ? frozenNow : now);

  let chips = (tournament?.stack?.stack_chip ?? [])
    .map((sc) => sc?.chip)
    .filter((chip): chip is Chip => chip !== undefined);

  const chipRaceCount = levels.filter((level) => {
    const levelEnd = toLocalDate(level.level_end);
    return levelEnd <= getNow() && Number(level.level_chip_race) === 1;
  }).length;

  for (let i = 0; i < chipRaceCount; i++) {
    if (chips.length > 0) {
      const minValue = Math.min(...chips.map(c => c.value));
      chips = chips.filter(c => c.value !== minValue);
    }
  }

  const getDurationSince = (startISO: string) => {
    const start = new Date(toLocalISOString(new Date(startISO)));
    const diffSeconds = Math.max(0, Math.floor((getNow().getTime() - start.getTime()) / 1000));
    const h = Math.floor(diffSeconds / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    const s = diffSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  
  const getTimeLeft = (end: string | Date) => {
    const endDate = typeof end === "string" ? new Date(toLocalISOString(new Date(end))) : end;
    const diffSeconds = Math.max(0, Math.floor((endDate.getTime() - getNow().getTime()) / 1000));
    const m = Math.floor(diffSeconds / 60);
    const s = diffSeconds % 60;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getTimeUntilNextPause = () => {
    if (currentLevel?.level_pause) {
      console.log("⏸ [DEBUG] On est actuellement en pause, pas de timer affiché.");
      return "-";
    }
  
    if (!nextPause) return "Aucune autre pause";
  
    const pauseStart = toLocalDate(nextPause.level_start).getTime();
    const diff = pauseStart - getNow().getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
  
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getConfirmedPlayers = () => registration.filter((r) => r.statut === "Confirmed");
  const getAlivePlayers = () => assignements.filter((r) => !r.eliminated);

  const getAverageStackAlive = () => {
    const alivePlayersCount = getAlivePlayers().length;
    const confirmedPlayersCount = getConfirmedPlayers().length;
  
    if (alivePlayersCount === 0) return "0";
  
    const stackTotalPerPlayer = tournament?.stack?.stack_total_player ?? 0;
    const totalChipsInitial = stackTotalPerPlayer * confirmedPlayersCount;
    const averageStack = totalChipsInitial / alivePlayersCount;
  
    return Math.round(averageStack).toString();
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => refetchStatusOnly(), 5000);
    return () => clearInterval(interval);
  }, [refetchStatusOnly]);

  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    if (isPaused && !frozenNow) setFrozenNow(new Date());
    if (!isPaused && frozenNow) setFrozenNow(null);
  }, [isPaused, frozenNow]);

  useEffect(() => {
    const refDate = getNow();

    // Trouver currentLevel en convertissant les dates en locales via toLocalISOString
    const cl = levels.find((level) => {
      const start = new Date(toLocalISOString(new Date(level.level_start)));
      const end = new Date(toLocalISOString(new Date(level.level_end)));
      return refDate >= start && refDate < end;
    });

    let next: TournamentLevel | undefined = undefined;
    if (currentLevel) {
      const currentIndex = levels.findIndex((lvl) => lvl.id === currentLevel.id);
      next = levels.slice(currentIndex + 1).find((lvl) => !lvl.level_pause);
    }

    // Trouver la prochaine pause avec les dates locales
    const np = levels
      .filter((level) => level.level_pause)
      .find((pauseLevel) => toLocalDate(pauseLevel.level_start) > refDate);

    setNextPause(np ?? null);

    if (cl && cl.id !== previousLevelId.current) {
      previousLevelId.current = cl.id;
      setBgIndex((prev) => (prev === 0 ? 1 : 0));
    }

    setCurrentLevel(cl ?? null);
    setNextLevel(next ?? null);
    setNextPause(np ?? null);
  }, [levels, now, frozenNow, isPaused]);

  if (!tournament || !Array.isArray(levels)) return <LoadingComponent />;

  const nowTime = getNow();

  const backgroundUrl =
    bgIndex === 0
      ? tournament.tournament_background_1 || "/images/background_dashboard.svg"
      : tournament.tournament_background_2 || "/images/background_dashboard.svg";

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-8">
        <div className="text-center text-white">
          <h1 className="text-7xl font-satoshiBold text-primary_brand-50">
            {tournament.tournament_name}
          </h1>
          <p className="font-satoshi text-5xl text-primary_brand-50">
            {`${nowTime.getDate().toString().padStart(2, "0")}/${(nowTime.getMonth() + 1).toString().padStart(2, "0")}/${nowTime.getFullYear()} ${formatHourFR(nowTime)}`}
          </p>
        </div>

        <div className="flex justify-between">
          <div className="space-y-4">
            <InfoItem label="Niveau" value={currentLevel?.level_number.toString() ?? "-"} />
            <InfoItem
              label="Durée totale"
              value={
                tournament
                  ? getDurationSince(String(tournament.tournament_start_date))
                  : "--:--:--"
              }
            />
            <InfoItem label="Pause" value={getTimeUntilNextPause()} />
          </div>

          <div className="text-center text-primary_brand-50">
            <div className="text-xl12 font-satoshiBold">
              {currentLevel ? getTimeLeft(toLocalDate(currentLevel.level_end)) : "--:--"}
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
            <InfoItem label="Stack moyen" value={getAverageStackAlive()} />
            <InfoItem label="Ante" value="-" />
            <InfoItem
              label="Joueurs"
              value={`${getAlivePlayers().length}/${getConfirmedPlayers().length}`}
            />
          </div>
        </div>

        <ChipLegend chips={chips ?? []} />
      </div>
    </div>
  );
}
