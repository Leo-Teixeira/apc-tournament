import { Button, Card, Divider } from "@heroui/react";
import background from "/images/background_dashboard.svg";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ButtonComponents } from "@/app/components/button";
import { BackgroundComponent } from "./components/background_components";
import { Registration, Tournament, TournamentRanking } from "@/app/types";
import { ClassementComponent } from "./components/classement_components";

type GeneralProps = {
  tournament: Tournament;
  registrations: Registration[];
  classement: TournamentRanking[];
};

export const GeneralTabs: React.FC<GeneralProps> = ({
  tournament,
  registrations,
  classement
}) => {
  return (
    <div className="flex flex-row gap-6">
      <div className="flex flex-col gap-5 w-3/4">
        <div className="flex flex-row gap-6">
          <Card
            className="bg-red-400 rounded-xl px-5 py-3 bg-background_card w-3/4"
            fullWidth={true}>
            <div className="flex flex-col gap-3">
              <p className="text-primary_brand-50 font-satoshiBold text-l">
                Début du tournoi
              </p>
              <Divider />
              <div className="flex flex-row justify-between">
                <div className="flex flex-col px-5 py-3 justify-center items-start gap-2">
                  <p className="text-primary_brand-50 font-satoshiBold text-l">
                    Date
                  </p>
                  <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                    17/01/2025
                  </p>
                </div>
                <Divider orientation="vertical" />
                <div className="flex flex-col px-5 py-3 justify-center items-start gap-2">
                  <p className="text-primary_brand-50 font-satoshiBold text-l">
                    Heure
                  </p>
                  <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                    20:00
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-red-400 rounded-xl px-5 py-3 bg-background_card p-5 w-1/4">
            <div className="flex flex-col justify-between items-start p-5 self-stretch">
              <p className="text-primary_brand-50 font-satoshiBold text-l">
                Durée estimée
              </p>
              <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                3H
              </p>
            </div>
          </Card>
        </div>
        <div className="flex flex-row gap-6">
          <Card
            className="bg-red-400 rounded-xl px-5 py-3 bg-background_card w-3/4"
            fullWidth={true}>
            <div className="flex flex-col gap-3">
              <p className="text-primary_brand-50 font-satoshiBold text-l">
                Ouverture des inscriptions
              </p>
              <Divider />
              <div className="flex flex-row justify-between">
                <div className="flex flex-col px-5 py-3 justify-center items-start gap-2">
                  <p className="text-primary_brand-50 font-satoshiBold text-l">
                    Date
                  </p>
                  <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                    17/01/2025
                  </p>
                </div>
                <Divider orientation="vertical" />
                <div className="flex flex-col px-5 py-3 justify-center items-start gap-2">
                  <p className="text-primary_brand-50 font-satoshiBold text-l">
                    Heure
                  </p>
                  <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                    20:00
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-red-400 rounded-xl px-5 py-3 bg-background_card p-5 w-1/4">
            <div className="flex flex-col justify-between items-start p-5 self-stretch">
              <p className="text-primary_brand-50 font-satoshiBold text-l">
                Participants
              </p>
              <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                21/22
              </p>
            </div>
          </Card>
        </div>
        <BackgroundComponent tournamentStatus={tournament.tournament_status} />
      </div>
      <div>
        <ClassementComponent
          tournament_status={tournament.tournament_status}
          classement={classement}
        />
      </div>
    </div>
  );
};
