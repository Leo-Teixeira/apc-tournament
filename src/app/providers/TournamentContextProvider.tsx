// context/TournamentContext.tsx
import { createContext, useContext, useCallback, useState } from "react";
import {
  Tournament,
  TournamentLevel,
  TournamentRanking,
  Registration
} from "@/app/types";

type TournamentContextType = {
  tournament?: Tournament;
  levels: TournamentLevel[];
  registration: Registration[];
  classement: TournamentRanking[];
  loadTournamentData: () => Promise<void>;
};

const TournamentContext = createContext<TournamentContextType | null>(null);

type TournamentProviderProps = {
  tournamentId: string;
  children: React.ReactNode;
};

export const TournamentProvider = ({
  tournamentId,
  children
}: TournamentProviderProps) => {
  const [tournament, setTournament] = useState<Tournament>();
  const [levels, setLevels] = useState<TournamentLevel[]>([]);
  const [registration, setRegistration] = useState<Registration[]>([]);
  const [classement, setClassement] = useState<TournamentRanking[]>([]);

  const loadTournamentData = useCallback(async () => {
    const [resDetails, resLevels] = await Promise.all([
      fetch(`/api/tournament/${tournamentId}/details`),
      fetch(`/api/tournament/${tournamentId}/level`)
    ]);

    const data = await resDetails.json();
    const levelData = await resLevels.json();

    setTournament(data.tournament);
    setLevels(levelData);
    setRegistration(data.registrations);
    setClassement(data.classement);
  }, [tournamentId]);

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        levels,
        registration,
        classement,
        loadTournamentData
      }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournamentContext = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error(
      "useTournamentContext must be used within a TournamentProvider"
    );
  }
  return context;
};
