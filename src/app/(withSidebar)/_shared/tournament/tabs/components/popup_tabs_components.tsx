import { GenericModal } from "@/app/components/popup";
import { Tournament, TournamentLevel, TournamentRanking } from "@/app/types";
import { NiveauFormBody } from "./popup/add_level_popup";
import { TournamentFormBody } from "./popup/modif_tournament_popup";
import { PlayerFormBody } from "./popup/add_player_popup";
import { useMemo, useState } from "react";
import { formatDate } from "@/app/utils/date";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";

interface ModalManagerProps {
  selectedTab: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  selectedTab,
  isOpen,
  onClose
}) => {
  const [tournamentFormData, setTournamentFormData] = useState<
    Partial<Tournament>
  >({});
  const [levelFormData, setLevelFormData] = useState<Partial<TournamentLevel>>(
    {}
  );
  const [playerFormData, setPlayerFormData] = useState<{
    pseudo: string;
    firstName: string;
    lastName: string;
  }>({
    pseudo: "",
    firstName: "",
    lastName: ""
  });
  const { tournament, levels, assignements, loadTournamentData } =
    useTournamentContext();

  const lastLevel = useMemo(() => {
    return levels && levels.length > 0
      ? levels.reduce((max, curr) =>
          curr.level_number > max.level_number ? curr : max
        )
      : undefined;
  }, [levels]);

  if (!tournament) return null;

  const handleCreateTournament = async () => {
    try {
      const res = await fetch(`/api/tournament/${tournament.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tournamentFormData)
      });

      if (!res.ok) throw new Error("Erreur serveur");

      onClose();
    } catch (error) {
      console.error("Erreur modification tournoi :", error);
      alert("Une erreur est survenue.");
    }
  };

  const handleCreatePlayer = async () => {
    try {
      const res = await fetch(`/api/tournament/${tournament.id}/player`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(playerFormData)
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || "Erreur serveur");
      }

      await loadTournamentData();
      onClose();
    } catch (error) {
      console.error("Erreur ajout joueur :", error);
      alert("Une erreur est survenue : " + error);
    }
  };

  const handleCreateNiveau = async () => {
    try {
      const res = await fetch(`/api/tournament/${tournament.id}/level`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...levelFormData,
          tournament_id: tournament.id
        })
      });

      if (!res.ok) throw new Error("Erreur serveur");
      onClose();
    } catch (error) {
      console.error("Erreur création niveau :", error);
      alert("Une erreur est survenue.");
    }
  };

  if (selectedTab === "1") {
    return (
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Ajouter un niveau"
        confirmLabel="Ajouter le niveau"
        onConfirm={handleCreateNiveau}>
        <NiveauFormBody
          isModify={false}
          tournamentStart={formatDate(tournament.tournament_start_date)}
          level={lastLevel}
          onUpdate={(updated) =>
            setLevelFormData((prev) => ({ ...prev, ...updated }))
          }
        />
      </GenericModal>
    );
  }

  if (selectedTab === "0") {
    return (
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Modifier tournoi"
        confirmLabel="Modifier le tournoi"
        onConfirm={handleCreateTournament}>
        <TournamentFormBody
          tournament={tournament}
          onUpdate={(updatedFields) => {
            setTournamentFormData((prev) => ({ ...prev, ...updatedFields }));
          }}
        />
      </GenericModal>
    );
  }
  if (selectedTab === "2") {
    return (
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Ajouter un joueur"
        confirmLabel="Ajouter le joueur"
        onConfirm={handleCreatePlayer}>
        <PlayerFormBody
          onUpdate={(data) =>
            setPlayerFormData((prev) => ({ ...prev, ...data }))
          }
        />
      </GenericModal>
    );
  }
  if (selectedTab === "3") {
    return (
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Générer les tables"
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          try {
            const res = await fetch(`/api/tournament/${tournament.id}/table`, {
              method: "POST"
            });

            if (!res.ok) {
              throw new Error(
                "Erreur serveur lors de la génération des tables."
              );
            }

            await loadTournamentData(); // si tu veux rafraîchir le contexte
            onClose();
          } catch (error) {
            console.error("Erreur lors de la génération des tables :", error);
            alert("Une erreur est survenue lors de la génération des tables.");
          }
        }}>
        <p>Es-tu sûr de vouloir générer les tables pour ce tournoi ?</p>
      </GenericModal>
    );
  }

  return null;
};
