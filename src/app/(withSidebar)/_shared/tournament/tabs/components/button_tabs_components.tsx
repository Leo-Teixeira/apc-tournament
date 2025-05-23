"use client";

import { ButtonComponents } from "@/app/components/button";
import { TournamentLevel } from "@/app/types";

type ButtonTabsProps = {
  tournamentStatus: string;
  tabsId: string;
  levels: TournamentLevel[];
  onAddLevel?: () => void;
  onResetLevel?: () => void;
  onGenerateLevel?: () => void;
  onAddTable?: () => void;
  onModify?: () => void;
  onGenerateTables?: () => void;
  onAddPlayer?: () => void;
  onEditStack?: () => void;
};

export const ButtonTabsComponents: React.FC<ButtonTabsProps> = ({
  tournamentStatus,
  tabsId,
  levels,
  onAddLevel,
  onGenerateLevel,
  onAddPlayer,
  onEditStack,
  onGenerateTables,
  onModify,
  onResetLevel,
  onAddTable
}) => {
  switch (tabsId) {
    case "0":
      return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {tournamentStatus === "start" && (
            <ButtonComponents
              text="Modifier le tournoi"
              onClick={onModify}
              buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          )}
        </div>
      );

    case "1":
      return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <ButtonComponents
            text="Ajouter un niveau"
            onClick={onAddLevel}
            buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
          {tournamentStatus === "start" && levels.length == 0 && (
            <ButtonComponents
              text="Générer les niveaux"
              onClick={onGenerateLevel}
              buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          )}
          {tournamentStatus === "start" && levels.length > 0 && (
            <ButtonComponents
              text="Réinitialiser les niveaux"
              onClick={onResetLevel}
              buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          )}
        </div>
      );

    case "2":
      return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {tournamentStatus !== "in_coming" && (
            <ButtonComponents
              text="Ajouter un joueur"
              onClick={onAddPlayer}
              buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          )}
        </div>
      );

    case "3":
      return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {tournamentStatus !== "in_coming" && (
            <ButtonComponents
              text="Générer les tables"
              onClick={onGenerateTables}
              buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          )}
          <ButtonComponents
            text="Ajouter une table"
            onClick={onAddTable}
            buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
        </div>
      );

    case "4":
      return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {tournamentStatus !== "finish" && (
            <ButtonComponents
              text="Modifier le stack"
              onClick={onEditStack}
              buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          )}
        </div>
      );

    default:
      return <></>;
  }
};
