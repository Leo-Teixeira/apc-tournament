import { Button, Card, Divider } from "@heroui/react";
import background from "/images/background_dashboard.svg";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ButtonComponents } from "@/app/components/button";
import { BackgroundComponent } from "./components/background_components";
import { Registration, Tournament, TournamentRanking } from "@/app/types";
import { ClassementComponent } from "./components/classement_components";
import { formatDate, formatHour, parseDateTimeLocal } from "@/app/utils/date";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";

export const GeneralTabs = () => {
  const { tournament, levels, registration, classement, loadTournamentData } =
    useTournamentContext();

  const startDate = tournament?.tournament_start_date
    ? new Date(tournament.tournament_start_date)
    : null;

  const openDate = tournament?.tournament_open_date
    ? new Date(tournament.tournament_open_date)
    : null;

  const startDateString = startDate ? formatDate(startDate) : "";
  const startTimeString = startDate ? formatHour(startDate) : "";

  const openDateString = openDate ? formatDate(openDate) : "";
  const openTimeString = openDate ? formatHour(openDate) : "";

  const durationFormatted = tournament?.estimate_duration
    ? formatHour(tournament.estimate_duration)
    : "";

  return (
    <div className="flex flex-row gap-6">
      <div className="flex flex-col gap-5 w-2/3">
        <div className="flex flex-row gap-6">
          <Card className="rounded-xl bg-background_card w-3/4" fullWidth>
            <div className="flex flex-col gap-3">
              <p className="text-primary_brand-50 font-satoshiBold text-l px-5 py-3">
                Début du tournoi
              </p>
              <Divider />
              <div className="flex flex-row  justify-between">
                <div className="flex flex-col px-5 py-3 gap-2 w-full">
                  <div className="flex flex-col justify-between w-full">
                    <p className="text-primary_brand-50 font-satoshiBold text-l">
                      Date
                    </p>
                    <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                      {startDateString}
                    </p>
                  </div>
                </div>
                <Divider orientation="vertical" />
                <div className="flex flex-col px-5 py-3 gap-2 w-full">
                  <div className="flex flex-col justify-between w-full">
                    <p className="text-primary_brand-50 font-satoshiBold text-l">
                      Heure
                    </p>
                    <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                      {startTimeString}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className=" rounded-xl flex flex-col justify-between bg-background_card p-5 w-1/4">
            <p className="text-primary_brand-50 font-satoshiBold text-l">
              Durée estimée
            </p>
            <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
              {durationFormatted}
            </p>
          </Card>
        </div>

        <div className="flex flex-row gap-6">
          <Card className="rounded-xl bg-background_card w-3/4" fullWidth>
            <div className="flex flex-col gap-3">
              <p className="text-primary_brand-50 font-satoshiBold text-l px-5 py-3">
                Ouverture des inscriptions
              </p>
              <Divider />
              <div className="flex flex-row  justify-between">
                <div className="flex flex-col px-5 py-3 gap-2 w-full">
                  <div className="flex flex-col justify-between w-full">
                    <p className="text-primary_brand-50 font-satoshiBold text-l">
                      Date
                    </p>
                    <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                      {openDateString}
                    </p>
                  </div>
                </div>
                <Divider orientation="vertical" />
                <div className="flex flex-col px-5 py-3 gap-2 w-full">
                  <div className="flex flex-col justify-between w-full">
                    <p className="text-primary_brand-50 font-satoshiBold text-l">
                      Heure
                    </p>
                    <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                      {openTimeString}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="flex flex-col justify-between rounded-xl p-5 bg-background_card w-1/4">
            <p className="text-primary_brand-50 font-satoshiBold text-l">
              Participants
            </p>
            <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
              {registration.length > 0 ? (
                <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                  {registration.filter((r) => r.statut == "Confirmed").length}/
                  {registration.length}
                </p>
              ) : (
                <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                  0
                </p>
              )}
            </p>
          </Card>
        </div>

        {tournament && <BackgroundComponent tournament={tournament} />}
      </div>

      <div className="w-1/3">
        <ClassementComponent
          tournament_status={tournament?.tournament_status ?? "in_coming"}
          classement={classement}
        />
      </div>
    </div>
  );
};
