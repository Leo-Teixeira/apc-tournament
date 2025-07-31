"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ChipLegend } from "@/app/components/chipLegend";
import InfoItem from "@/app/components/infoItem";
import { Chip, TournamentLevel } from "@/app/types";
import { toLocalDate } from "@/app/utils/date";
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

  const isPaused = tournament?.tournament_pause === true;
  
  // Optimisation : Mémoisation des valeurs calculées
  const getNow = useCallback(() => (isPaused && frozenNow ? frozenNow : now), [isPaused, frozenNow, now]);

  const chips = useMemo(() => 
    (tournament?.stack?.stack_chip ?? [])
      .map((sc) => sc?.chip)
      .filter((chip): chip is Chip => chip !== undefined),
    [tournament?.stack?.stack_chip]
  );

  const getDurationSince = useCallback((startISO: string) => {
    const start = toLocalDate(startISO);
    const diff = getNow().getTime() - start.getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [getNow]);

  const getTimeLeft = useCallback((end: string | Date) => {
    const endDate = typeof end === "string" ? toLocalDate(end) : end;
    const diff = endDate.getTime() - getNow().getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [getNow]);

  const getTimeUntilNextPause = useCallback(() => {
    if (!nextPause) return "-";
    const pauseStart = toLocalDate(nextPause.level_start).getTime();
    const diff = pauseStart - getNow().getTime();
    const total = Math.max(0, Math.floor(diff / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [nextPause, getNow]);

  // Optimisation : Mémoisation des calculs coûteux
  const confirmedPlayers = useMemo(() => 
    registration.filter((r) => r.statut === "Confirmed"),
    [registration]
  );

  const alivePlayers = useMemo(() => 
    assignements.filter((r) => !r.eliminated),
    [assignements]
  );

  const averageStack = useMemo(() => {
    const players = confirmedPlayers.length;
    const totalChips = players * 10000;
    return players === 0 ? "0" : Math.round(totalChips / players).toString();
  }, [confirmedPlayers]);

  // Optimisation : Un seul timer pour la mise à jour du temps
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Optimisation : Timer pour le status seulement si nécessaire
  useEffect(() => {
    if (tournament?.tournament_status !== "start") return;
    
    const interval = setInterval(() => {
      refetchStatusOnly();
    }, 10000); // Réduit de 5s à 10s
    return () => clearInterval(interval);
  }, [refetchStatusOnly, tournament?.tournament_status]);

  // Optimisation : Timer pour le refetch complet moins fréquent
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 120000); // Réduit de 60s à 120s
    return () => clearInterval(interval);
  }, [refetch]);

  // Optimisation : Refetch initial seulement si nécessaire
  useEffect(() => {
    if (!data) {
      refetch();
    }
  }, [refetch, data]);

  // Optimisation : Gestion de la pause
  useEffect(() => {
    if (isPaused && !frozenNow) {
      setFrozenNow(new Date());
    }
    if (!isPaused && frozenNow) {
      setFrozenNow(null);
    }
  }, [isPaused, frozenNow]);

  // Optimisation : Calcul des niveaux avec useMemo
  const levelCalculations = useMemo(() => {
    const refDate = getNow();
    
    const cl = levels.find((level) => {
      const start = toLocalDate(level.level_start);
      const end = toLocalDate(level.level_end);
      return refDate >= start && refDate < end;
    });

    let next: TournamentLevel | undefined = undefined;
    if (cl) {
      const currentIndex = levels.findIndex((lvl) => lvl.id === cl.id);
      next = levels.slice(currentIndex + 1).find((lvl) => !lvl.level_pause);
    }

    const np = levels.find(
      (level) => new Date(level.level_start) > refDate && level.level_pause
    );

    return {
      currentLevel: cl ?? null,
      nextLevel: next ?? null,
      nextPause: np ?? null
    };
  }, [levels, getNow]);

  // Mise à jour des états avec les calculs optimisés
  useEffect(() => {
    setCurrentLevel(levelCalculations.currentLevel);
    setNextLevel(levelCalculations.nextLevel);
    setNextPause(levelCalculations.nextPause);
  }, [levelCalculations]);

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
              value={getDurationSince(tournament.tournament_start_date)}
            />
            <InfoItem
              label="Temps restant"
              value={
                currentLevel
                  ? getTimeLeft(currentLevel.level_end)
                  : "-"
              }
            />
            <InfoItem
              label="Prochain niveau"
              value={
                nextLevel
                  ? `${nextLevel.level_number} (${getTimeLeft(nextLevel.level_start)})`
                  : "-"
              }
            />
            <InfoItem
              label="Prochaine pause"
              value={getTimeUntilNextPause()}
            />
          </div>

          <div className="space-y-4">
            <InfoItem
              label="Joueurs confirmés"
              value={confirmedPlayers.length.toString()}
            />
            <InfoItem
              label="Joueurs en vie"
              value={alivePlayers.length.toString()}
            />
            <InfoItem
              label="Stack moyen"
              value={averageStack}
            />
            <InfoItem
              label="Petite blinde"
              value={currentLevel?.level_small_blinde.toString() ?? "-"}
            />
            <InfoItem
              label="Grosse blinde"
              value={currentLevel?.level_big_blinde.toString() ?? "-"}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <ChipLegend chips={chips} />
        </div>
      </div>
    </div>
  );
}
