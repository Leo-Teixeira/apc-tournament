// context/TournamentContext.tsx
import { createContext, useContext, useCallback, useState } from "react";
import {
  Tournament,
  TournamentLevel,
  TournamentRanking,
  Registration,
  TournamentTable,
  TableAssignment,
  Stack,
  StackChip
} from "@/app/types";

type TournamentContextType = {
  tournament?: Tournament;
  levels: TournamentLevel[];
  registration: Registration[];
  classement: TournamentRanking[];
  assignements: TableAssignment[];
  stacks: Stack[];
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
  const [assignements, setAssignements] = useState<TableAssignment[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);

  const loadTournamentData = useCallback(async () => {
    const [resDetails, resLevels, resTable, resStack] = await Promise.all([
      fetch(`/api/tournament/${tournamentId}/details`),
      fetch(`/api/tournament/${tournamentId}/level`),
      fetch(`/api/tournament/${tournamentId}/table`),
      fetch(`/api/stack`)
    ]);

    const data = await resDetails.json();
    const levelData = await resLevels.json();
    const tableData = await resTable.json();
    const stackData = await resStack.json();

    setTournament(data.tournament);
    setLevels(levelData);
    setRegistration(data.registrations);
    setClassement(data.classement);
    setAssignements(tableData);
    setStacks(stackData);
  }, [tournamentId]);

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        levels,
        registration,
        classement,
        assignements,
        stacks,
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
