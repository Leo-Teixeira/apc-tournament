import { ButtonComponents } from "@/app/components/button";
import { TournamentLevel } from "@/app/types";

type ButtonTabsProps = {
  tournamentStatus: string;
  tabsId: string;
  levels: TournamentLevel[];
  onAddLevel?: () => void;
  onResetLevel?: () => void;
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
  onAddPlayer,
  onEditStack,
  onGenerateTables,
  onModify,
  onResetLevel,
  onAddTable
}) => {
  console.log("levels pour les boutons", levels);
  switch (tabsId) {
    case "0":
      return (
        <div>
          {tournamentStatus === "start" ? (
            <ButtonComponents
              text="Modifier le tournoi"
              onClick={onModify}
              buttonClassName="bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          ) : (
            <></>
          )}
        </div>
      );
    case "1":
      return (
        <div className="flex flex-row justify-between gap-3">
          <ButtonComponents
            text="Ajouter un niveau"
            onClick={onAddLevel}
            buttonClassName="bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
          {tournamentStatus === "start" && levels.length > 0 && (
            <ButtonComponents
              text="Réinitialiser les niveaux"
              onClick={onResetLevel}
              buttonClassName="bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          )}
        </div>
      );
    case "2":
      return (
        <div>
          {tournamentStatus !== "in_coming" ? (
            <ButtonComponents
              text="Ajouter un joueur"
              onClick={onAddPlayer}
              buttonClassName="bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          ) : (
            <></>
          )}
        </div>
      );
    case "3":
      return (
        <div className="flex flex-row justify-between gap-3">
          {tournamentStatus !== "in_coming" ? (
            <ButtonComponents
              text="Générer les tables"
              onClick={onGenerateTables}
              buttonClassName="bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          ) : (
            <></>
          )}{" "}
          <ButtonComponents
            text="Ajouter une table"
            onClick={onAddTable}
            buttonClassName="bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
        </div>
      );
    case "4":
      return (
        <div>
          {tournamentStatus !== "finish" ? (
            <ButtonComponents
              text="Modifier le stack"
              onClick={onEditStack}
              buttonClassName="bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          ) : (
            <></>
          )}{" "}
        </div>
      );
    default:
      return <></>;
  }
};
