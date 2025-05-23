"use client";

import { Chip, Tab, Tabs } from "@heroui/react";
import { GeneralTabs } from "./general";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { GenericModal } from "@/app/components/popup";
import {
  AddTableForm,
  AddTableFormHandle
} from "./components/popup/add_table_popup";
import { useTogglePause } from "@/app/hook/useTogglePause";
import { useLaunchTournament } from "@/app/hook/useLaunchTournament";
import { useAddTableAssignment } from "@/app/hook/useAddTableAssignment";
import { useResetLevels } from "@/app/hook/useResetLevels";
import { useGenerateLevels } from "@/app/hook/useGenerateLevel";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { tournament, levels, registration, classement, stacks } =
    useTournamentContext();
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("0");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isReinitialiseLevelModalOpen, setIsReinitialiseLevelModalOpen] =
    useState(false);
  const [isGenerateLevelModalOpen, setIsGenerateLevelModalOpen] =
    useState(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const formRef = useRef<AddTableFormHandle>(null);

  const togglePauseMutation = useTogglePause(String(id));
  const launchTournamentMutation = useLaunchTournament(String(id));
  const addTableMutation = useAddTableAssignment();
  const resetLevelsMutation = useResetLevels();
  const generateLevelsMutation = useGenerateLevels();

  const nextTableNumber =
    (tournament?.tournament_table?.length ?? 0) > 0
      ? Math.max(
          ...(tournament!.tournament_table ?? []).map((t) => t.table_number)
        ) + 1
      : 1;

  useEffect(() => {
    if (tournament?.tournament_status === "finish") {
      setSelectedTab("0");
      setIsDisabled(true);
    }
  }, [tournament]);

  const togglePause = async (pause: boolean) => {
    try {
      await togglePauseMutation.mutateAsync(pause);
    } catch (err) {
      console.error("❌ Erreur mise en pause / reprise :", err);
      alert("Une erreur est survenue");
    }
  };

  const isLaunchable =
    (tournament?.tournament_table?.length ?? 0) > 0 &&
    levels.length > 0 &&
    (tournament?.stack?.stack_chip?.length ?? 0) > 0;

  const tabs = useMemo(() => {
    if (!tournament || !registration || !classement) return [];
    return [
      { id: "0", label: "Général", content: <GeneralTabs /> },
      { id: "1", label: "Niveaux", content: <NiveauxTabs /> },
      { id: "2", label: "Joueurs", content: <PlayerTabs /> },
      { id: "3", label: "Tables", content: <TableTabs /> },
      { id: "4", label: "Jetons", content: <ChipTabs /> }
    ];
  }, [tournament, registration, classement, levels]);

  if (!tournament || !registration || !classement) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <h1 className="font-satoshiBlack text-l sm:text-xl4">
            {tournament.tournament_name}
          </h1>
          <Chip
            className={`font-satoshiRegular text-xs sm:text-s ${
              tournament.tournament_status === "finish"
                ? "bg-red-950"
                : tournament.tournament_status === "start"
                ? "bg-purple-950"
                : tournament.tournament_pause
                ? "bg-danger-500"
                : "bg-green-950"
            }`}>
            {tournament.tournament_pause
              ? "En pause"
              : STRINGS.status[tournament.tournament_status]}
          </Chip>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
          {tournament.tournament_status === "start" && (
            <ButtonComponents
              text="Lancer le tournoi"
              onClick={() => setIsLaunchModalOpen(true)}
              buttonClassName="bg-primary_background hover:bg-primary_hover_background"
              textClassName="text-primary_brand-50"
            />
          )}

          {tournament.tournament_status === "in_coming" && (
            <>
              <ButtonComponents
                text={
                  tournament.tournament_pause
                    ? "Reprendre le tournoi"
                    : "Mettre en pause le tournoi"
                }
                onClick={() => setIsPauseModalOpen(true)}
                buttonClassName="bg-primary_background hover:bg-primary_hover_background"
                textClassName="text-primary_brand-50"
              />
              <ButtonComponents
                text="Voir l'affichage"
                onClick={() => window.open(`/game/${id}`)}
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
            </>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs
            isDisabled={isDisabled}
            className="flex flex-wrap items-center gap-2"
            size="lg"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(String(key))}
            aria-label="Dynamic tabs"
            items={tabs}>
            {(item) => (
              <Tab
                key={item.id}
                title={item.label}
                className="text-neutral-50 text-center !font-satoshiRegular !text-xs sm:!text-l"
              />
            )}
          </Tabs>
          {tournament.tournament_status !== "finish" && (
            <ButtonTabsComponents
              tournamentStatus={tournament.tournament_status}
              tabsId={selectedTab}
              levels={levels}
              onModify={onOpen}
              onAddLevel={onOpen}
              onResetLevel={() => setIsReinitialiseLevelModalOpen(true)}
              onAddPlayer={onOpen}
              onGenerateTables={onOpen}
              onGenerateLevel={() => setIsGenerateLevelModalOpen(true)}
              onEditStack={onOpen}
              onAddTable={() => setIsAddTableModalOpen(true)}
            />
          )}
        </div>

        <div>{tabs.find((tab) => tab.id === selectedTab)?.content}</div>
      </div>

      <ModalManager
        selectedTab={selectedTab}
        isOpen={isOpen}
        onClose={onClose}
      />

      <GenericModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        title="Lancer le tournoi"
        confirmLabel="Lancer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          try {
            if (!isLaunchable) {
              alert(
                "Impossible de lancer le tournoi sans tables, niveaux et jetons."
              );
              return;
            }

            await launchTournamentMutation.mutateAsync();
            setIsLaunchModalOpen(false);
            window.open(`/game/${id}`);
          } catch (err) {
            console.error("❌ Erreur lancement tournoi :", err);
            alert("Erreur lors du lancement du tournoi");
          }
        }}>
        <p>
          Es-tu sûr de vouloir lancer le tournoi ?
          <br />
          Il doit contenir au moins une table, un niveau et un jeton.
        </p>
      </GenericModal>

      <GenericModal
        isOpen={isGenerateLevelModalOpen}
        onClose={() => setIsGenerateLevelModalOpen(false)}
        title="Générer les niveaux"
        confirmLabel="Générer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          try {
            if (!tournament) throw new Error("Tournoi non disponible");

            await generateLevelsMutation.mutateAsync(tournament.id);

            setIsGenerateLevelModalOpen(false);
            window.location.reload(); // ou refetch ton contexte React Query
          } catch (err) {
            console.error("❌ Erreur génération niveaux :", err);
            alert("Erreur lors de la génération des niveaux");
          }
        }}>
        <p>Es-tu sûr de vouloir générer les niveaux automatiquement ?</p>
      </GenericModal>

      <GenericModal
        isOpen={isReinitialiseLevelModalOpen}
        onClose={() => setIsReinitialiseLevelModalOpen(false)}
        title="Réinitialiser les niveaux"
        confirmLabel="Réinitialiser"
        cancelLabel="Annuler"
        onConfirm={async () => {
          try {
            if (!tournament) throw new Error("Tournoi non disponible");
            await resetLevelsMutation.mutateAsync(tournament.id);
            setIsReinitialiseLevelModalOpen(false);
          } catch (err) {
            console.error("❌ Erreur réinitialisation niveau :", err);
            alert("Erreur lors de la réinitialisation des niveaux");
          }
        }}>
        <p>
          Es-tu sûr de vouloir réinitialiser les niveaux ? Attention ils seront
          tous perdus.
        </p>
      </GenericModal>

      <GenericModal
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        title="Ajouter une table"
        confirmLabel="Ajouter"
        cancelLabel="Annuler"
        onConfirm={async () => {
          try {
            const values = formRef.current?.getValues();
            if (!values) throw new Error("Valeurs du formulaire indisponibles");
            if (!tournament) throw new Error("Tournoi non disponible");
            await addTableMutation.mutateAsync({
              tournamentId: tournament.id,
              data: values
            });
            setIsAddTableModalOpen(false);
          } catch (err) {
            console.error("Erreur ajout table :", err);
            alert("Erreur lors de l'ajout de la table");
          }
        }}>
        <AddTableForm ref={formRef} initialNumber={nextTableNumber} />
      </GenericModal>

      <GenericModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title={
          tournament.tournament_pause
            ? "Reprendre le tournoi"
            : "Mettre en pause le tournoi"
        }
        confirmLabel={
          tournament.tournament_pause ? "Reprendre" : "Mettre en pause"
        }
        cancelLabel="Annuler"
        onConfirm={async () => {
          try {
            await togglePause(!tournament.tournament_pause);
            setIsPauseModalOpen(false);
          } catch (err) {
            console.error("❌ Erreur changement pause :", err);
            alert("Erreur lors de la mise à jour de l'état du tournoi");
          }
        }}>
        <p>
          Es-tu sûr de vouloir{" "}
          {tournament.tournament_pause ? "reprendre" : "mettre en pause"} le
          tournoi ?
        </p>
      </GenericModal>
    </div>
  );
}
