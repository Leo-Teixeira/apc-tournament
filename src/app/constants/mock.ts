import {
  SeatRow,
  StandingRow,
  TournamentRow
} from "../components/table/table.types";

export const tournamentMocks: TournamentRow[] = [
  {
    id: "1",
    name: "Tournoi d'ouverture",
    players: 34,
    trimestry: 1,
    tournament_date: "2025-01-15",
    open_tournament_date: "2025-01-01",
    status: "Clôturé",
    action: ""
  },
  {
    id: "2",
    name: "Tournoi de février",
    players: 34,
    trimestry: 1,
    tournament_date: "2025-02-10",
    open_tournament_date: "2025-01-25",
    status: "Clôturé",
    action: ""
  },
  {
    id: "3",
    name: "Tournoi de mars",
    players: 34,
    trimestry: 1,
    tournament_date: "2025-03-12",
    open_tournament_date: "2025-02-20",
    status: "Clôturé",
    action: ""
  },
  {
    id: "4",
    name: "Tournoi d'avril",
    players: 34,
    trimestry: 1,
    tournament_date: "2025-04-18",
    open_tournament_date: "2025-04-01",
    status: "Ouvert",
    action: ""
  },
  {
    id: "5",
    name: "Tournoi de printemps",
    players: 34,
    trimestry: 1,
    tournament_date: "2025-05-08",
    open_tournament_date: "2025-04-20",
    status: "À venir",
    action: ""
  },
  {
    id: "6",
    name: "Tournoi du 14 juin",
    players: 8,
    trimestry: 1,
    tournament_date: "2025-06-14",
    open_tournament_date: "2025-05-30",
    status: "À venir",
    action: ""
  },
  {
    id: "7",
    name: "Tournoi d'été",
    players: 54,
    trimestry: 2,
    tournament_date: "2025-07-20",
    open_tournament_date: "2025-07-01",
    status: "À venir",
    action: ""
  },
  {
    id: "8",
    name: "Tournoi du 15 août",
    players: 94,
    trimestry: 1,
    tournament_date: "2025-08-15",
    open_tournament_date: "2025-07-25",
    status: "À venir",
    action: ""
  },
  {
    id: "9",
    name: "Tournoi de rentrée",
    players: 334,
    trimestry: 3,
    tournament_date: "2025-09-10",
    open_tournament_date: "2025-08-30",
    status: "À venir",
    action: ""
  },
  {
    id: "10",
    name: "Tournoi d'octobre",
    players: 34,
    trimestry: 3,
    tournament_date: "2025-10-05",
    open_tournament_date: "2025-09-15",
    status: "À venir",
    action: ""
  }
];

export const standingsMock: StandingRow[] = [
  { id: "1", place: 1, name: "Léo", points: 74 },
  { id: "2", place: 2, name: "Léo", points: 74 },
  { id: "3", place: 3, name: "Léo", points: 74 },
  { id: "4", place: 4, name: "Léo", points: 74 },
  { id: "5", place: 5, name: "Léo", points: 74 },
  { id: "6", place: 6, name: "Léo", points: 74 },
  { id: "7", place: 7, name: "Léo", points: 74 },
  { id: "8", place: 8, name: "Léo", points: 74 }
];
