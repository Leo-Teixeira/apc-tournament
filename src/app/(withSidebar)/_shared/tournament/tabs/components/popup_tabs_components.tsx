import { GenericModal } from "@/app/components/popup";
import { Tournament, TournamentLevel, TournamentRanking } from "@/app/types";
import { NiveauFormBody } from "./popup/add_level_popup";
import { TournamentFormBody } from "./popup/modif_tournament_popup";
import { PlayerFormBody } from "./popup/add_player_popup";
import { useState } from "react";
import { formatDate } from "@/app/utils/date";

interface ModalManagerProps {
  selectedTab: string;
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  classement: TournamentRanking[];
  level?: TournamentLevel;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  selectedTab,
  isOpen,
  onClose,
  tournament,
  classement,
  level
}) => {
  const [tournamentFormData, setTournamentFormData] = useState<
    Partial<Tournament>
  >({});
  const [levelFormData, setLevelFormData] = useState<Partial<TournamentLevel>>(
    {}
  );

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
          level={level}
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
        onConfirm={handleCreateTournament}>
        <PlayerFormBody />
      </GenericModal>
    );
  }

  return null;
};
