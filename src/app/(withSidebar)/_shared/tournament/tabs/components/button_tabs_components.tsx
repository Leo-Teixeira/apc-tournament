import { ButtonComponents } from "@/app/components/button";

type ButtonTabsProps = {
  tournamentStatus: string;
  tabsId: string;
  onClick: () => void;
};

export const ButtonTabsComponents: React.FC<ButtonTabsProps> = ({
  tournamentStatus,
  tabsId,
  onClick
}) => {
  switch (tabsId) {
    case "0":
      return (
        <div>
          {tournamentStatus !== "in_coming" ? (
            <ButtonComponents
              text="Modifier le tournoi"
              onClick={onClick}
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
            onClick={onClick}
            buttonClassName="bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
          {tournamentStatus == "start" ? (
            <ButtonComponents
              text="Réinitialiser les niveaux"
              onClick={onClick}
              buttonClassName="bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          ) : (
            <></>
          )}
        </div>
      );
    case "2":
      return (
        <div>
          {tournamentStatus !== "in_coming" ? (
            <ButtonComponents
              text="Ajouter un joueur"
              onClick={onClick}
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
        <div>
          {tournamentStatus !== "in_coming" ? (
            <ButtonComponents
              text="Ajouter une table"
              onClick={onClick}
              buttonClassName="bg-white/20 hover:bg-primary_brand-300"
              textClassName="text-primary_brand-50"
            />
          ) : (
            <></>
          )}{" "}
        </div>
      );
    case "4":
      return (
        <div>
          {tournamentStatus !== "in_coming" ? (
            <ButtonComponents
              text="Modifier le stack"
              onClick={onClick}
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
