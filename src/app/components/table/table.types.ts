// components/Table/table.types.ts

export type Column<T> = {
  name: string;
  uid: keyof T;
  align?: "start" | "center" | "end";
  render?: (value: T[keyof T], item: T) => React.ReactNode;
};

export type GenericTableProps<T extends { id: string | number }> = {
  columns: Column<T>[];
  items: T[];
  ariaLabel: string;
  enableDrag?: boolean;
  onReorder?: (newItems: T[]) => void;
};

export type SeatRow = {
  id: string;
  name: string;
  seat: string;
  eliminated: boolean;
};

export type StandingRow = {
  id: string;
  place: number;
  name: string;
  points: number;
};

export type BlindRow = {
  id: string;
  level: string;
  small: string;
  big: string;
  ante: string;
  duration: string;
  time: string;
};

export type TournamentRow = {
  id: string;
  name: string;
  players: number;
  trimestry: number;
  tournament_date: string;
  open_tournament_date: string;
  status: string;
  action: string;
};
