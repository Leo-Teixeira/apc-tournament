import {
  Briefcase09Icon,
  Cards01Icon,
  Cards02Icon,
  ChampionIcon,
  HealtcareIcon,
  RankingIcon,
  SidebarLeft01Icon
} from "@hugeicons/core-free-icons";

export const STRINGS = {
  common: {
    tournament_title: "Tournoi",
    classement_title: "Classement"
  },
  tournament_table_header: {
    name: "Nom",
    number_player: "Participants",
    trimestry: "Trimestre",
    tournament_date: "Date du tournoi",
    start_date: "Date d'ouverture",
    status: "Statut"
  },
  sidebar: {
    menu_item: [
      {
        label: "Championnat APT",
        icon: Cards01Icon,
        href: "/apt"
      },
      {
        label: "Championnat Sit&Go",
        icon: Cards02Icon,
        href: "/sitgo"
      },
      { label: "Super finale", icon: RankingIcon, href: "/super_finale" },
      { label: "Tournoi de l'AG", icon: ChampionIcon, href: "/ag" },
      { label: "SoliPoker", icon: HealtcareIcon, href: "/solipoker" },
      { label: "Mallettes", icon: Briefcase09Icon, href: "/malette" }
    ]
  },
  apt: {
    title: "Championnat APT",
    trimestry: {
      T1: "Trimestre 1",
      T2: "Trimestre 2",
      T3: "Trimestre 3"
    }
  },
  home: {
    title: "Bienvenue sur le Dashboard Poker",
    description: "Choisissez un championnat pour démarrer"
  },
  tabs: {
    general: "Général",
    niveaux: "Niveaux",
    joueurs: "Joueurs",
    tables: "Tables",
    jetons: "Jetons"
  },
  status: {
    finish: "Terminé",
    in_coming: "En cours",
    start: "À venir"
  }
};
