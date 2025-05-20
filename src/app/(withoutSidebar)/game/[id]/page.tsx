"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChipLegend } from "@/app/components/chipLegend";
import InfoItem from "@/app/components/infoItem";
import { LoadingComponent } from "@/app/error/loading/page";
import { formatDate } from "@/app/utils/date";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { TournamentLevel } from "@/app/types";

export default function Game() {
  const { tournament, levels, registration, assignements, loadTournamentData } =
    useTournamentContext();

  const [now, setNow] = useState(new Date());
  const [currentLevel, setCurrentLevel] = useState<TournamentLevel | null>(
    null
  );
  const [nextLevel, setNextLevel] = useState<TournamentLevel | null>(null);
  const [nextPause, setNextPause] = useState<TournamentLevel | null>(null);

  const parseTime = (iso: string) => {
    const date = new Date(iso);
    const time = new Date();
    time.setHours(date.getHours(), date.getMinutes(), 0, 0);
    return time;
  };

  const getDurationSince = (startISO: string) => {
    const start = new Date(startISO);
    if (isNaN(start.getTime())) return "--:--:--";
    const diff = now.getTime() - start.getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const getTimeLeft = (endTime: string) => {
    const diff = parseTime(endTime).getTime() - now.getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
      m % 60
    ).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getTimeUntilNextPause = () => {
    if (!nextPause) return "-";
    const diff = parseTime(nextPause.level_start).getTime() - now.getTime();
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
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

  const getRemainingPlayers = () => getConfirmedPlayers().length.toString();
  const getRemainingAlivePlayers = () => getAlivePlayers().length.toString();

  useEffect(() => {
    loadTournamentData();
  }, [loadTournamentData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nowDate = new Date();
      setNow(nowDate);

      const cl = levels.find((level) => {
        const start = new Date(level.level_start);
        const end = new Date(level.level_end);
        return nowDate >= start && nowDate < end;
      });

      const nl = levels.find((level) => new Date(level.level_start) > nowDate);
      const np = levels.find(
        (level) => new Date(level.level_start) > nowDate && level.level_pause
      );

      setCurrentLevel(cl ?? null);
      setNextLevel(nl ?? null);
      setNextPause(np ?? null);
    }, 1000);

    return () => clearInterval(interval);
  }, [levels]);

  if (!tournament || !Array.isArray(levels)) return <LoadingComponent />;

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
                  ? getDurationSince(String(tournament.tournament_start_date))
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
              value={`${getRemainingAlivePlayers()}/${getRemainingPlayers()}`}
            />
          </div>
        </div>

        <ChipLegend chips={[]} />
      </div>
    </div>
  );
}
