"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { GenericTable } from "../../components/table/generic_table";
import { seatsColumns } from "../../components/table/presets/seats.config";
import { STRINGS } from "../../constants/string";
import { standingsColumns } from "../../components/table/presets/standings.config";
import {
  ActionDefinition,
  StandingRow,
  TournamentRow
} from "../../components/table/table.types";
import { tournamentColumns } from "../../components/table/presets/tournament.config";
import {
  mapTournamentsToRow,
  mapTournamentToRow
} from "@/app/lib/adapter/tournament.adapter";
import { QuarterRanking } from "../../types";
import { mapQuarterRankingByTrimestry } from "../../lib/adapter/quarter_ranking.adapter";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  ViewIcon
} from "@hugeicons/core-free-icons";

export default function APTHome() {
  type TrimestryKey = "T1" | "T2" | "T3";
  const [tournamentRows, setTournamentRows] = useState<TournamentRow[]>([]);
  const [quarterRankingRows, setQuarterRankingRows] = useState<
    Record<TrimestryKey, StandingRow[]>
  >({ T1: [], T2: [], T3: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, registrationsRes, quarterRankingRes] =
          await Promise.all([
            fetch("/api/tournaments/apt"),
            fetch("/api/registrations/apt"),
            fetch("/api/quarter_ranking")
          ]);
        console.log("test" + tournamentsRes);
        const tournaments = await tournamentsRes.json();
        console.log(tournaments);
        const registrations = await registrationsRes.json();
        const quarterRanking = await quarterRankingRes.json();

        const rows = mapTournamentsToRow(tournaments, registrations);
        const quarterRankingRows = mapQuarterRankingByTrimestry(
          quarterRanking,
          "APT"
        );
        setTournamentRows(rows);
        setQuarterRankingRows(quarterRankingRows);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getConditionalActions = (item: TournamentRow) => {
    const actions: ActionDefinition<TournamentRow>[] = [
      {
        tooltip: "Voir",
        icon: <HugeiconsIcon icon={ViewIcon} size={20} strokeWidth={1.5} />,
        onClick: () => window.open(`/apt/${item.id}`, "_self")
      }
    ];

    if (item.status !== "finish") {
      actions.push({
        tooltip: "Éditer",
        icon: (
          <HugeiconsIcon icon={PencilEdit02Icon} size={20} strokeWidth={1.5} />
        ),
        onClick: () => {}
      });

      actions.push({
        tooltip: "Supprimer",
        icon: <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={1.5} />,
        onClick: () => {},
        color: "danger"
      });
    }

    return actions;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="font-satoshiBold text-4xl">Championnat APT</h1>

      <div className="flex flex-col gap-3">
        <h2 className="font-satoshiBold text-xl3p2 leading-10">Tournois</h2>
        <GenericTable<TournamentRow>
          items={tournamentRows}
          columns={tournamentColumns}
          ariaLabel="Liste des sièges"
          showActions={true}
          actions={getConditionalActions}
          enableRowClick
          getDetailUrl={(id) => `/apt/${id}`}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-satoshiBold text-xl3p2 leading-10">Classement</h2>
        <div className="flex flex-row gap-6">
          {(Object.keys(quarterRankingRows) as TrimestryKey[]).map(
            (trimestry) => (
              <div key={trimestry} className="flex-1 flex flex-col gap-2">
                <h2 className="font-satoshibold text-xl2p9 leading-10">
                  {trimestry == "T1"
                    ? STRINGS.apt.trimestry.T1
                    : trimestry == "T2"
                    ? STRINGS.apt.trimestry.T2
                    : STRINGS.apt.trimestry.T3}
                </h2>
                <GenericTable<StandingRow>
                  items={quarterRankingRows[trimestry]}
                  columns={standingsColumns}
                  ariaLabel={`Classement ${trimestry}`}
                  showActions={false}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
