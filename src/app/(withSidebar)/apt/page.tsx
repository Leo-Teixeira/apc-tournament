"use client";

import { useEffect, useState } from "react";
import { GenericTable } from "../../components/table/generic_table";
import { STRINGS } from "../../constants/string";
import { standingsColumns } from "../../components/table/presets/standings.config";
import {
  ActionDefinition,
  StandingRow,
  TournamentRow
} from "../../components/table/table.types";
import { tournamentColumns } from "../../components/table/presets/tournament.config";
import { mapTournamentsToRow } from "@/app/lib/adapter/tournament.adapter";
import { mapQuarterRankingByTrimestry } from "../../lib/adapter/quarter_ranking.adapter";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  ViewIcon
} from "@hugeicons/core-free-icons";
import { GenericModal } from "@/app/components/popup";
import { TournamentFormBody } from "../_shared/tournament/tabs/components/popup/modif_tournament_popup";
import { Tournament } from "@/app/types";

export default function APTHome() {
  type TrimestryKey = "T1" | "T2" | "T3";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [tournamentFormData, setTournamentFormData] = useState<
    Partial<Tournament>
  >({});

  const [tournamentToDelete, setTournamentToDelete] =
    useState<TournamentRow | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const [tournamentRows, setTournamentRows] = useState<TournamentRow[]>([]);
  const [quarterRankingRows, setQuarterRankingRows] = useState<
    Record<TrimestryKey, StandingRow[]>
  >({ T1: [], T2: [], T3: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [itemSelected, setItemSelected] = useState<TournamentRow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/tournaments/apt/details");
        const data = await res.json();

        const tournaments = data.tournaments;
        const registrations = data.registrations;
        const quarterRanking = data.quarterRanking;

        const rows = mapTournamentsToRow(tournaments, registrations);
        const quarterRankingRows = mapQuarterRankingByTrimestry(
          quarterRanking,
          "APT"
        );

        setTournaments(tournaments);
        setTournamentRows(rows);
        setQuarterRankingRows(quarterRankingRows);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getConditionalActions = (item: TournamentRow) => {
    const actions: ActionDefinition<TournamentRow>[] = [
      {
        tooltip: "Voir",
        icon: <HugeiconsIcon icon={ViewIcon} size={20} strokeWidth={1.5} />,
        onClick: () => window.open(`/apt/${item.id}`, "_self")
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="font-satoshiBold text-2xl sm:text-4xl">Championnat APT</h1>

      <div className="flex flex-col gap-3">
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
            getDetailUrl={(id) => `/apt/${id}`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-satoshiMedium text-l sm:text-xl3p2 leading-8 sm:leading-10">
          Classement
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {(Object.keys(quarterRankingRows) as TrimestryKey[]).map(
            (trimestry) => (
              <div
                key={trimestry}
                className="flex-1 flex flex-col gap-2 overflow-x-auto">
                <h2 className="font-satoshiRegular text-m sm:text-xl2p9 leading-8 sm:leading-10">
                  {trimestry == "T1"
                    ? STRINGS.apt.trimestry.T1
                    : trimestry == "T2"
                    ? STRINGS.apt.trimestry.T2
                    : STRINGS.apt.trimestry.T3}
                </h2>
                <GenericTable<StandingRow>
                  items={quarterRankingRows[trimestry]}
                  columns={standingsColumns}
                  ariaLabel={`Classement ${trimestry}`}
                  showActions={false}
                />
              </div>
            )
          )}
        </div>
      </div>

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
            const res = await fetch(
              `/api/tournament/${tournamentToDelete.id}`,
              {
                method: "DELETE"
              }
            );

            if (!res.ok) throw new Error("Erreur serveur");

            setTournamentRows((prev) =>
              prev.filter((t) => t.id !== tournamentToDelete.id)
            );

            setIsDeleteModalOpen(false);
            setTournamentToDelete(null);
            setItemSelected(null);
          } catch (error) {
            console.error("Erreur suppression tournoi :", error);
            alert("Une erreur est survenue.");
          }
        }}>
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
            const res = await fetch(`/api/tournament/${itemSelected.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(tournamentFormData)
            });

            if (!res.ok) throw new Error("Erreur serveur");

            setTournamentRows((prev) =>
              prev.filter((t) => t.id !== itemSelected.id)
            );

            setIsModifyModalOpen(false);
            setItemSelected(null);
          } catch (error) {
            console.error("Erreur modification tournoi :", error);
            alert("Une erreur est survenue.");
          }
        }}>
        <TournamentFormBody
          tournament={tournaments.find((t) => t.id == Number(itemSelected?.id))}
          onUpdate={(updatedFields) => {
            setTournamentFormData((prev) => ({ ...prev, ...updatedFields }));
          }}
        />
      </GenericModal>
    </div>
  );
}
