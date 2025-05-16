"use client";

import { Chip, Tab, Tabs } from "@heroui/react";
import { GeneralTabs } from "./general";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { STRINGS } from "@/app/constants/string";
import { useParams } from "next/navigation";
import { ButtonComponents } from "@/app/components/button";
import { NiveauxTabs } from "./niveaux";
import { ButtonTabsComponents } from "./components/button_tabs_components";
import { PlayerTabs } from "./player";
import { TableTabs } from "./table";
import { ChipTabs } from "./chip";
import { useDisclosure } from "@heroui/react";
import { ModalManager } from "./components/popup_tabs_components";
import { LoadingComponent } from "@/app/error/loading/page";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { tournament, levels, registration, classement, loadTournamentData } =
    useTournamentContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("0");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    loadTournamentData().finally(() => setIsLoading(false));
  }, [loadTournamentData]);

  useEffect(() => {
    if (tournament?.tournament_status === "finish") {
      setIsDisabled(true);
    }
  }, [tournament]);

  const lastLevel = useMemo(() => {
    return levels && levels.length > 0
      ? levels.reduce((max, curr) =>
          curr.level_number > max.level_number ? curr : max
        )
      : undefined;
  }, [levels]);

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
        content: <NiveauxTabs />
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
  }, [tournament, registration, classement, levels]);

  if (isLoading || !tournament || !registration || !classement) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-3">
          <h1 className="font-satoshiBlack text-xl4">
            {tournament.tournament_name}
          </h1>
          <Chip
            className={`font-satoshiRegular text-s ${
              tournament.tournament_status === "finish"
                ? "bg-red-950"
                : tournament.tournament_status === "in_coming"
                ? "bg-purple-950"
                : "bg-green-950"
            }`}>
            {STRINGS.status[tournament.tournament_status]}
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
            onClick={() => window.open(`/game/${id}`, "_self")}
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
            isDisabled={isDisabled}
            className="flex items-center gap-2"
            size="lg"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(String(key))}
            aria-label="Dynamic tabs"
            items={tabs}>
            {(item) => (
              <Tab
                key={item.id}
                title={item.label}
                className="text-neutral-50 text-center !font-satoshiRegular !text-l"
              />
            )}
          </Tabs>
          {tournament.tournament_status !== "finish" && (
            <ButtonTabsComponents
              tournamentStatus={tournament.tournament_status}
              tabsId={selectedTab}
              onClick={onOpen}
            />
          )}
        </div>

        <div>{tabs.find((tab) => tab.id === selectedTab)?.content}</div>
      </div>

      <ModalManager
        selectedTab={selectedTab}
        isOpen={isOpen}
        onClose={async () => {
          await loadTournamentData();
          onClose();
        }}
        tournament={tournament}
        classement={classement}
        level={lastLevel}
      />
    </div>
  );
}
