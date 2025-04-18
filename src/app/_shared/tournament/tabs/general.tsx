import { Button, Card, Divider } from "@heroui/react";
import background from "/images/background_dashboard.svg";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function General() {
  return (
    <div className="flex flex-row gap-6">
      <div className="flex flex-col gap-5 w-3/4">
        <div className="flex flex-row gap-6">
          <Card
            className="bg-red-400 rounded-xl px-5 py-3 bg-background_card w-3/4"
            fullWidth={true}>
            <div className="flex flex-col gap-3">
              <p className="text-body1 font-satoshi font-bold">
                Début du tournoi
              </p>
              <Divider />
              <div className="flex flex-row justify-between">
                <div className="flex flex-col text-right gap-2">
                  <p className="text-body1 font-satoshi font-bold text-left">
                    Date
                  </p>
                  <p className="text-h1 font-satoshi font-black text-right">
                    17/01/2025
                  </p>
                </div>
                <Divider orientation="vertical" />
                <div className="flex flex-col gap-2">
                  <p className="text-body1 font-satoshi font-bold">Heure</p>
                  <p className="text-h1 font-satoshi font-black">20:00</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-red-400 rounded-xl px-5 py-3 bg-background_card p-5 w-1/4">
            <div className="flex flex-col justify-between">
              <p className="text-body1 font-satoshi font-bold">Durée estimée</p>
              <p className="text-h1 font-satoshi font-black text-right">3H</p>
            </div>
          </Card>
        </div>
        <div className="flex flex-row gap-6">
          <Card
            className="bg-red-400 rounded-xl px-5 py-3 bg-background_card w-3/4"
            fullWidth={true}>
            <div className="flex flex-col gap-3">
              <p className="text-body1 font-satoshi font-bold">
                Ouverture des inscriptions
              </p>
              <Divider />
              <div className="flex flex-row justify-between">
                <div className="flex flex-col text-right gap-2">
                  <p className="text-body1 font-satoshi font-bold text-left">
                    Date
                  </p>
                  <p className="text-h1 font-satoshi font-black text-right">
                    17/01/2025
                  </p>
                </div>
                <Divider orientation="vertical" />
                <div className="flex flex-col">
                  <p className="flex justify-start text-body1 font-satoshi font-bold">
                    Heure
                  </p>
                  <p className="flex justify-end text-h1 font-satoshi font-black text-right">
                    20:00
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-red-400 rounded-xl px-5 py-3 bg-background_card p-5 w-1/4">
            <div className="flex flex-col justify-between">
              <p className="text-body1 font-satoshi font-bold">Participants</p>
              <p className="text-h1 font-satoshi font-black text-right">
                21/22
              </p>
            </div>
          </Card>
        </div>
        <Card className="bg-red-400 rounded-xl px-5 py-3 bg-background_card">
          <div className="flex flex-col gap-5">
            <img
              className="w-full h-full rounded-lg"
              src="/images/wallpaper.svg"
              alt="background"
            />
            <div className="flex flex-row gap-5 justify-center">
              <Button className="bg-grey-50">
                <p className="text-body1 font-satoshi font-normal text-green-500">
                  Changer de fond
                </p>
              </Button>
              <Button className="bg-green-500">
                <p className="text-body1 font-satoshi font-normal text-grey-50">
                  Afficher
                </p>
                <HugeiconsIcon icon={LinkSquare02Icon} color="white" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div>
        <Card className="flex flex-col justify-start h-full bg-background_card p-6 gap-3">
          <img
            className="rounded-lg"
            src="/images/classement_image.svg"
            alt="classement svg"
          />
          <p className="text-center text-green-300 font-satoshi text-body1 font-bold">
            Revenez après le tournoi pour voir qui a dominé les cartes !
          </p>
        </Card>
      </div>
    </div>
  );
}
