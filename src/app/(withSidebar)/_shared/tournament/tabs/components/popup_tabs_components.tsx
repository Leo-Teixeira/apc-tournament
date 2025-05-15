import { GenericModal } from "@/app/components/popup";
import { Tournament, TournamentRanking } from "@/app/types";
import { NiveauFormBody } from "./popup/add_level_popup";
import { TournamentFormBody } from "./popup/modif_tournament_popup";
import { PlayerFormBody } from "./popup/add_player_popup";

interface ModalManagerProps {
  selectedTab: string;
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  classement: TournamentRanking[];
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  selectedTab,
  isOpen,
  onClose,
  tournament,
  classement
}) => {
  const handleCreateTournament = () => {
    console.log("Créer / Modifier tournoi");
    onClose();
  };

  const handleCreateNiveau = () => {
    console.log("Créer niveau");
    onClose();
  };

  if (selectedTab === "1") {
    return (
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Ajouter un niveau"
        confirmLabel="Ajouter le niveau"
        onConfirm={handleCreateNiveau}>
        <NiveauFormBody />
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
        <TournamentFormBody tournament={tournament} />
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
