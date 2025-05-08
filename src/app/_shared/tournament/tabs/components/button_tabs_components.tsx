import { ButtonComponents } from "@/app/components/button";

type ButtonTabsProps = {
  tabsId: string;
  onClick: () => void;
};

export const ButtonTabsComponents: React.FC<ButtonTabsProps> = ({
  tabsId,
  onClick
}) => {
  switch (tabsId) {
    case "0":
      return (
        <ButtonComponents
          text="Modifier le tournoi"
          onClick={onClick}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
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
          <ButtonComponents
            text="Réinitialiser les niveaux"
            onClick={onClick}
            buttonClassName="bg-white/20 hover:bg-primary_brand-300"
            textClassName="text-primary_brand-50"
          />
        </div>
      );
    case "2":
      return (
        <ButtonComponents
          text="Ajouter un joueur"
          onClick={onClick}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
      );
    case "3":
      return (
        <ButtonComponents
          text="Ajouter une table"
          onClick={onClick}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
      );
    case "4":
      return (
        <ButtonComponents
          text="Modifier le stack"
          onClick={onClick}
          buttonClassName="bg-white/20 hover:bg-primary_brand-300"
          textClassName="text-primary_brand-50"
        />
      );
    default:
      return <></>;
  }
};
