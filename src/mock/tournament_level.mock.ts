import { tournamentMocks } from "./tournament.mock";

export const tournamentLevelMocks = [
  {
    id: "1",
    tournament_id: tournamentMocks[0],
    level_number: 1,
    level_start: "20h00",
    level_end: "20h40",
    level_small_blinde: 50,
    level_big_blinde: 100,
    level_pause: false,
    level_chip_race: true
  },
  {
    id: "2",
    tournament_id: tournamentMocks[0],
    level_number: 2,
    level_start: "20h40",
    level_end: "21h20",
    level_small_blinde: 100,
    level_big_blinde: 200,
    level_pause: true,
    level_chip_race: false
  },
  {
    id: "3",
    tournament_id: tournamentMocks[0],
    level_number: 3,
    level_start: "21h20",
    level_end: "22h00",
    level_small_blinde: 150,
    level_big_blinde: 300,
    level_pause: false,
    level_chip_race: false
  },
  {
    id: "4",
    tournament_id: tournamentMocks[0],
    level_number: 4,
    level_start: "22h00",
    level_end: "22h40",
    level_small_blinde: 200,
    level_big_blinde: 400,
    level_pause: true,
    level_chip_race: true
  },
  {
    id: "5",
    tournament_id: tournamentMocks[0],
    level_number: 5,
    level_start: "22h40",
    level_end: "23h20",
    level_small_blinde: 250,
    level_big_blinde: 500,
    level_pause: false,
    level_chip_race: false
  },
  {
    id: "6",
    tournament_id: tournamentMocks[0],
    level_number: 6,
    level_start: "23h20",
    level_end: "00h00",
    level_small_blinde: 300,
    level_big_blinde: 600,
    level_pause: true,
    level_chip_race: false
  },
  {
    id: "7",
    tournament_id: tournamentMocks[0],
    level_number: 7,
    level_start: "00h00",
    level_end: "00h40",
    level_small_blinde: 350,
    level_big_blinde: 700,
    level_pause: false,
    level_chip_race: true
  },
  {
    id: "8",
    tournament_id: tournamentMocks[0],
    level_number: 8,
    level_start: "00h40",
    level_end: "01h20",
    level_small_blinde: 400,
    level_big_blinde: 800,
    level_pause: true,
    level_chip_race: false
  },
  {
    id: "9",
    tournament_id: tournamentMocks[0],
    level_number: 9,
    level_start: "01h20",
    level_end: "02h00",
    level_small_blinde: 450,
    level_big_blinde: 900,
    level_pause: false,
    level_chip_race: false
  },
  {
    id: "10",
    tournament_id: tournamentMocks[0],
    level_number: 10,
    level_start: "02h00",
    level_end: "02h40",
    level_small_blinde: 500,
    level_big_blinde: 1000,
    level_pause: true,
    level_chip_race: true
  }
];
