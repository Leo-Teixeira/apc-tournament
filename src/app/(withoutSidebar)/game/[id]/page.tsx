"use client";

import { useEffect, useState } from "react";
import { ChipLegend } from "@/app/components/chipLegend";
import InfoItem from "@/app/components/infoItem";
import { LoadingComponent } from "@/app/error/loading/page";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { Chip, TournamentLevel } from "@/app/types";
import { toLocalDate } from "@/app/utils/date";

export default function Game() {
  const {
    tournament,
    levels,
    registration,
    assignements,
    loadTournamentData,
    loadTournamentOnly
  } = useTournamentContext();

  const [now, setNow] = useState(new Date());
  const [frozenNow, setFrozenNow] = useState<Date | null>(null);
  const [currentLevel, setCurrentLevel] = useState<TournamentLevel | null>(
    null
  );
  const [nextLevel, setNextLevel] = useState<TournamentLevel | null>(null);
  const [nextPause, setNextPause] = useState<TournamentLevel | null>(null);

  const isPaused = tournament?.tournament_pause === true;
  const getNow = () => (isPaused && frozenNow ? frozenNow : now);

  const chips = (tournament?.stack?.stack_chip ?? [])
    .map((sc) => sc?.chip)
    .filter((chip): chip is Chip => chip !== undefined);

  const getDurationSince = (startISO: string) => {
    const start = toLocalDate(startISO);
    const diff = getNow().getTime() - start.getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const getTimeLeft = (end: string | Date) => {
    const endDate = typeof end === "string" ? toLocalDate(end) : end;
    const diff = endDate.getTime() - getNow().getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
      m % 60
    ).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getTimeUntilNextPause = () => {
    if (!nextPause) return "-";
    const pauseStart = toLocalDate(nextPause.level_start).getTime();
    const diff = pauseStart - getNow().getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
      m % 60
    ).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getConfirmedPlayers = () =>
    registration.filter((r) => r.statut === "Confirmed");

  const getAlivePlayers = () => assignements.filter((r) => !r.eliminated);

  const getAverageStack = () => {
    const players = getConfirmedPlayers().length;
    const totalChips = players * 10000;
    return players === 0 ? "0" : Math.round(totalChips / players).toString();
  };

  // 🔄 Horloge chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔁 Polling status (pause/active) chaque 5s
  useEffect(() => {
    const interval = setInterval(() => {
      loadTournamentOnly();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadTournamentOnly]);

  // 🔁 Polling complet chaque 60s
  useEffect(() => {
    const interval = setInterval(() => {
      loadTournamentData();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadTournamentData]);

  useEffect(() => {
    loadTournamentData();
  }, []);

  // ⏸️ Gèle le temps si le tournoi est en pause
  useEffect(() => {
    if (isPaused && !frozenNow) {
      setFrozenNow(new Date());
    }
    if (!isPaused && frozenNow) {
      setFrozenNow(null);
    }
  }, [isPaused, frozenNow]);

  // 🎯 Recalcule les niveaux à chaque tick
  useEffect(() => {
    const refDate = getNow();

    const cl = levels.find((level) => {
      const start = toLocalDate(level.level_start);
      const end = toLocalDate(level.level_end);
      return refDate >= start && refDate < end;
    });

    const nl = levels.find((level) => new Date(level.level_start) > refDate);
    const np = levels.find(
      (level) => new Date(level.level_start) > refDate && level.level_pause
    );

    setCurrentLevel(cl ?? null);
    setNextLevel(nl ?? null);
    setNextPause(np ?? null);
  }, [levels, now, frozenNow, isPaused]);

  if (!tournament || !Array.isArray(levels)) return <LoadingComponent />;

  const nowTime = getNow();

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
            {`${nowTime.getDate().toString().padStart(2, "0")}/${(
              nowTime.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}/${nowTime.getFullYear()} ${nowTime
              .getHours()
              .toString()
              .padStart(2, "0")}:${nowTime
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
                  ? getDurationSince(String(tournament.tournament_start_date))
                  : "--:--:--"
              }
            />
            <InfoItem label="Pause" value={getTimeUntilNextPause()} />
          </div>

          <div className="text-center text-primary_brand-50">
            <div className="text-xl12 font-satoshiBold">
              {currentLevel
                ? getTimeLeft(toLocalDate(currentLevel.level_end))
                : "--:--"}
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
              value={`${getAlivePlayers().length}/${
                getConfirmedPlayers().length
              }`}
            />
          </div>
        </div>

        <ChipLegend chips={chips ?? []} />
      </div>
    </div>
  );
}
