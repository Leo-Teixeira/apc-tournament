import { ButtonComponents } from "@/app/components/button";
import { STRINGS } from "@/app/constants/string";
import { Card } from "@heroui/react";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type BackgroundProps = {
  tournamentStatus: string;
  onChangeClick?: () => void;
  onShowClick?: () => void;
};

export const BackgroundComponent: React.FC<BackgroundProps> = ({
  tournamentStatus,
  onChangeClick,
  onShowClick
}) => {
  return (
    <div>
      {tournamentStatus != "finish" ? (
        <Card className="bg-red-400 rounded-xl p-5 bg-background_card">
          <div className="flex flex-col gap-5">
            <img
              className="w-full h-full rounded-lg "
              src="/images/wallpaper.svg"
              alt="background"
            />
            <div className="flex flex-row gap-5 justify-center ">
              <ButtonComponents
                text="Changer de fond"
                onClick={() => {}}
                buttonClassName="bg-white/20 hover:bg-primary_brand-300"
                textClassName="text-primary_brand-50"
              />
              <ButtonComponents
                text="Afficher"
                onClick={() => {}}
                buttonClassName="bg-primary_background hover:bg-primary_hover_background"
                textClassName="text-primary_brand-50"
                icon={
                  <HugeiconsIcon
                    icon={LinkSquare02Icon}
                    size={20}
                    className="shrink-0"
                    color="white"
                  />
                }
              />
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 justify-center">
          <img
            className="rounded-lg"
            src="/images/background_finish_image.svg"
            alt="background svg"
          />
          <p className="text-center text-primary_brand-300 font-satoshiBold text-l leading-7">
            Les cartes ont parlé, les jetons sont rangés… Découvrez le
            classement final et félicitez les champions !
          </p>
        </div>
      )}
    </div>
  );
};
