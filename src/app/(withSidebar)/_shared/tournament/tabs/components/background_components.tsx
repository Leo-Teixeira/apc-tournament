"use client";

import { ButtonComponents } from "@/app/components/button";
import { STRINGS } from "@/app/constants/string";
import { Tournament } from "@/app/types";
import { Card } from "@heroui/react";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type BackgroundProps = {
  tournament: Tournament;
  onChangeClick?: () => void;
  onShowClick?: () => void;
};

export const BackgroundComponent: React.FC<BackgroundProps> = ({
  tournament,
  onChangeClick,
  onShowClick
}) => {
  return (
    <div className="w-full">
      {tournament.tournament_status !== "finish" ? (
        <Card className="bg-background_card rounded-xl p-5">
          <div className="flex flex-col gap-5">
            <img
              className="w-full max-w-full rounded-lg object-cover"
              src="/images/wallpaper.svg"
              alt="background"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ButtonComponents
                text="Changer de fond"
                onClick={onChangeClick}
                buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
                textClassName="text-primary_brand-50"
              />
              {tournament.tournament_status === "in_coming" && (
                <ButtonComponents
                  text="Afficher"
                  onClick={() => {
                    window.open(`/game/${tournament.id}`);
                  }}
                  buttonClassName="w-full sm:w-auto bg-primary_background hover:bg-primary_hover_background"
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
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-6 py-6 px-2 text-center">
          <img
            className="rounded-lg w-full max-w-xl object-contain"
            src="/images/background_finish_image.svg"
            alt="background svg"
          />
          <p className="text-primary_brand-300 font-satoshiBold text-base sm:text-l leading-7 px-2">
            Les cartes ont parlé, les jetons sont rangés… Découvrez le
            classement final et félicitez les champions !
          </p>
        </div>
      )}
    </div>
  );
};
