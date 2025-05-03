"use client";

import { Chip, Tab, Table, Tabs } from "@heroui/react";
import { GeneralTabs } from "./general";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { Registration, Tournament, TournamentRanking } from "@/app/types";
import { STRINGS } from "@/app/constants/string";
import { useParams } from "next/navigation";
import { ButtonComponents } from "@/app/components/button";
import { NiveauxTabs } from "./niveaux";
import { ButtonTabsComponents } from "./components/button_tabs_components";
import { PlayerTabs } from "./player";
import { TableTabs } from "./table";
import { ChipTabs } from "./chip";

export default function TournamentDetailPage() {
  const { id } = useParams();

  const [tournament, setTournament] = useState<Tournament>();
  const [classement, setClassement] = useState<TournamentRanking[]>();
  const [registration, setRegistration] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("0");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentRes, registrationRes, classementRes] =
          await Promise.all([
            fetch(`/api/tournament/${id}`),
            fetch(`/api/registrations/${id}`),
            fetch(`/api/tournament/${id}/classement`)
          ]);
        setTournament(await tournamentRes.json());
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

  const tabs = useMemo(() => {
    if (!tournament || !registration || !classement) return [];
    return [
      {
        id: "0",
        label: "Général",
        content: (
          <GeneralTabs
            tournament={tournament}
            registrations={registration}
            classement={classement}
          />
        )
      },
      {
        id: "1",
        label: "Niveaux",
        content: <NiveauxTabs tournament={tournament} />
      },
      {
        id: "2",
        label: "Joueurs",
        content: <PlayerTabs tournament={tournament} />
      },
      {
        id: "3",
        label: "Tables",
        content: <TableTabs tournament={tournament} />
      },
      {
        id: "4",
        label: "Jetons",
        content: <ChipTabs tournament={tournament} classement={classement} />
      }
    ];
  }, [tournament, registration, classement]);

  if (isLoading || !tournament || !registration || !classement) {
    return (
      <div className="flex justify-center items-center h-full">
        Chargement en cours...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-3">
          <h1 className="font-satoshiBlack text-xl4">
            {tournament.tournament_name}
          </h1>
          <Chip
            className={`font-satoshiMedium text-s ${
              tournament.tournament_status === "finish"
                ? "bg-red-950"
                : tournament.tournament_status === "in_coming"
                ? "bg-purple-950"
                : "bg-green-950"
            }`}>
            {tournament.tournament_status === "finish"
              ? STRINGS.status.finish
              : tournament.tournament_status === "in_coming"
              ? STRINGS.status.in_coming
              : STRINGS.status.start}
          </Chip>
        </div>

        <div className="flex flex-row gap-3">
          <ButtonComponents
            text="Lancer le tournoi"
            onClick={() => {}}
            buttonClassName="bg-primary_background hover:bg-primary_hover_background"
            textClassName="text-primary_brand-50"
          />
          <ButtonComponents
            text="Voir l'affichage"
            onClick={() => {}}
            buttonClassName="bg-primary_background hover:bg-primary_hover_background"
            textClassName="text-primary_brand-50"
            icon={
              <HugeiconsIcon
                icon={LinkSquare02Icon}
                size={20}
                className="shrink-0"
                color="white"
              />
            }
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-row justify-between items-center">
          <Tabs
            className="flex p-1 items-center gap-2"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(String(key))}
            aria-label="Dynamic tabs"
            items={tabs}>
            {(item) => (
              <Tab
                key={item.id}
                title={item.label}
                className="text-neutral-50 text-center font-satoshiMedium text-l"
              />
            )}
          </Tabs>

          <ButtonTabsComponents tabsId={selectedTab} />
        </div>

        <div>{tabs.find((tab) => tab.id === selectedTab)?.content}</div>
      </div>
    </div>
  );
}
