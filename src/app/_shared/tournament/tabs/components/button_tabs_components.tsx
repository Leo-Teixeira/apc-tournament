import { ButtonComponents } from "@/app/components/button";

type ButtonTabsProps = {
  tabsId: string;
};

export const ButtonTabsComponents: React.FC<ButtonTabsProps> = ({ tabsId }) => {
  console.log(tabsId);
  switch (tabsId) {
    case "0":
      return (
        <ButtonComponents
          text="Modifier le tournoi"
          onClick={() => {}}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
      );
    case "1":
      return (
        <div className="flex flex-row justify-between gap-3">
          <ButtonComponents
            text="Ajouter un niveau"
            onClick={() => {}}
            buttonClassName="bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
          <ButtonComponents
            text="Réinitialiser les niveaux"
            onClick={() => {}}
            buttonClassName="bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
        </div>
      );
    case "2":
      return (
        <ButtonComponents
          text="Ajouter un joueur"
          onClick={() => {}}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
      );
    case "3":
      return (
        <ButtonComponents
          text="Ajouter une table"
          onClick={() => {}}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
      );
    case "4":
      return (
        <ButtonComponents
          text="Modifier le stack"
          onClick={() => {}}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
      );
    default:
      return <></>;
  }
};
