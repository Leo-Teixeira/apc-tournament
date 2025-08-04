"use client";

import { useState } from "react";
import { GenericTable } from "../../components/table/generic_table";
import { STRINGS } from "../../constants/string";
import { standingsColumns } from "../../components/table/presets/standings.config";
import {
  ActionDefinition,
  StandingRow,
  TournamentRow
} from "../../components/table/table.types";
import { tournamentColumns } from "../../components/table/presets/tournament.config";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  ViewIcon
} from "@hugeicons/core-free-icons";
import { GenericModal } from "@/app/components/popup";
import { TournamentFormBody } from "../_shared/tournament/tabs/components/popup/modif_tournament_popup";
import { Tournament } from "@/app/types";
import { useUpdateTournament } from "@/app/hook/useUpdateTournament";
import { useDeleteTournament } from "@/app/hook/useDeleteTournament";
import { useTournamentDataByCategory } from "@/app/hook/useTournamentsData";
import TabBar from "../../components/tabBar";
import { TournamentMobileCards } from "../../components/tournament-mobile-cards";

export default function SitAndGoHome() {
  type TrimestryKey = "T1" | "T2" | "T3";

  const { data, isLoading } = useTournamentDataByCategory("SitAndGo");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [tournamentFormData, setTournamentFormData] = useState<
    Partial<Tournament>
  >({});
  const [tournamentToDelete, setTournamentToDelete] =
    useState<TournamentRow | null>(null);
  const [itemSelected, setItemSelected] = useState<TournamentRow | null>(null);

  const updateTournamentMutation = useUpdateTournament();
  const deleteTournamentMutation = useDeleteTournament();

  const tournamentRows = data?.tournamentRows ?? [];
  const tournaments = data?.tournaments ?? [];
  const quarterRankingRows = data?.quarterRankingRows ?? {
    T1: [],
    T2: [],
    T3: []
  };

  const getConditionalActions = (item: TournamentRow) => {
    const actions: ActionDefinition<TournamentRow>[] = [
      {
        tooltip: "Voir",
        icon: <HugeiconsIcon icon={ViewIcon} size={20} strokeWidth={1.5} />,
        onClick: () => window.open(`/sitandgo/${item.id}`, "_self")
      }
    ];

    if (item.status !== "finish") {
      actions.push({
        tooltip: "Éditer",
        icon: (
          <HugeiconsIcon icon={PencilEdit02Icon} size={20} strokeWidth={1.5} />
        ),
        onClick: () => {
          setItemSelected(item);
          setIsDeleteModalOpen(false);
          setIsModifyModalOpen(true);
        }
      });

      actions.push({
        tooltip: "Supprimer",
        icon: <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={1.5} />,
        onClick: () => {
          setItemSelected(item);
          setTournamentToDelete(item);
          setIsDeleteModalOpen(true);
        },
        color: "danger"
      });
    }

    return actions;
  };

  const handleViewTournament = (id: string) => {
    window.open(`/sitandgo/${id}`, "_self");
  };

  // Affichage pendant chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-white text-xl font-semibold">Chargement...</p>
      </div>
    );
  }

  // Affichage si aucune donnée
  if (!tournamentRows || tournamentRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh] px-4">
        <p className="text-white text-xl font-semibold text-center">
          Aucun tournoi disponible pour le moment.
        </p>
      </div>
    );
  }

  // Rendu normal
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* TabBar mobile en haut, sert de titre/navigation */}
      <div className="block md:hidden mb-2">
        <TabBar />
      </div>

      {/* Version mobile avec cartes */}
      <div className="block md:hidden">
        <TournamentMobileCards
          tournaments={tournamentRows}
          onViewTournament={handleViewTournament}
        />
      </div>

      {/* Version desktop avec tableau */}
      <div className="hidden md:flex flex-col gap-3">
        <h2 className="font-satoshiMedium text-l sm:text-xl3p2 leading-8 sm:leading-10">
          Tournois
        </h2>
        <div className="w-full overflow-x-auto">
          <GenericTable<TournamentRow>
            items={tournamentRows}
            columns={tournamentColumns}
            ariaLabel="Liste des sièges"
            showActions={true}
            actions={getConditionalActions}
            enableRowClick
            getDetailUrl={(id) => `/sitandgo/${id}`}
          />
        </div>
      </div>

      {/* Section classement - cachée en mobile pour l'instant */}
      <div className="hidden md:flex flex-col gap-3">
        <h2 className="font-satoshiMedium text-l sm:text-xl3p2 leading-8 sm:leading-10">
          Classement
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {(Object.keys(quarterRankingRows) as TrimestryKey[]).map((trimestry) => (
            <div
              key={trimestry}
              className="flex-1 flex flex-col gap-2 overflow-x-auto"
            >
              <h2 className="font-satoshiRegular text-m sm:text-xl2p9 leading-8 sm:leading-10">
                {STRINGS.apt.trimestry[trimestry]}
              </h2>
              <GenericTable<StandingRow>
                items={quarterRankingRows[trimestry]}
                columns={standingsColumns}
                ariaLabel={`Classement ${trimestry}`}
                showActions={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <GenericModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTournamentToDelete(null);
          setItemSelected(null);
        }}
        title="Supprimer le tournoi"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (!tournamentToDelete) return;

          try {
            await deleteTournamentMutation.mutateAsync(tournamentToDelete.id);
            setIsDeleteModalOpen(false);
            setTournamentToDelete(null);
            setItemSelected(null);
          } catch (error) {
            console.error("Erreur suppression tournoi :", error);
            alert("Une erreur est survenue.");
          }
        }}
      >
        <p>
          Es-tu sûr de vouloir supprimer le tournoi{" "}
          <b>{tournamentToDelete?.name}</b> ?
        </p>
      </GenericModal>

      <GenericModal
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        title="Modifier tournoi"
        confirmLabel="Modifier le tournoi"
        onConfirm={async () => {
          if (!itemSelected) return;

          try {
            await updateTournamentMutation.mutateAsync({
              id: Number(itemSelected.id),
              data: tournamentFormData
            });

            setIsModifyModalOpen(false);
          } catch (error) {
            console.error("Erreur modification tournoi :", error);
            alert("Une erreur est survenue.");
          }
        }}
      >
        <TournamentFormBody
          tournament={tournaments.find(
            (t) => t.id == Number(itemSelected?.id)
          )}
          onUpdate={(updatedFields) => {
            setTournamentFormData((prev) => ({ ...prev, ...updatedFields }));
          }}
        />
      </GenericModal>
    </div>
  );
}
