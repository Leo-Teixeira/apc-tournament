"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { GenericTable } from "../components/table/generic_table";
import { seatsColumns } from "../components/table/presets/seats.config";
import { STRINGS } from "../constants/string";
import { standingsColumns } from "../components/table/presets/standings.config";
import { StandingRow, TournamentRow } from "../components/table/table.types";
import { tournamentColumns } from "../components/table/presets/tournament.config";
import { mapTournamentToRow } from "@/app/lib/adapter/tournament.adapter";
import { QuarterRanking } from "../types";
import { mapQuarterRankingByTrimestry } from "../lib/adapter/quarter_ranking.adapter";

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
            fetch("/lib/api/tournaments/apt"),
            fetch("/lib/api/registrations"),
            fetch("/lib/api/quarter_ranking")
          ]);
        console.log(tournamentsRes);
        const tournaments = await tournamentsRes.json();
        console.log(tournaments);
        const registrations = await registrationsRes.json();
        const quarterRanking = await quarterRankingRes.json();

        const rows = mapTournamentToRow(tournaments, registrations);
        const quarterRankingRows = mapQuarterRankingByTrimestry(quarterRanking);
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1>Championnat APT</h1>

      <div className="flex flex-col gap-3">
        <h2>Tournoi</h2>
        <Card className="w-full">
          <CardBody className="w-full">
            <GenericTable<TournamentRow>
              items={tournamentRows}
              columns={tournamentColumns}
              ariaLabel="Liste des sièges"
              showActions={true}
              enableRowClick
              getDetailUrl={(id) => `/apt/${id}`}
            />
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2>Classement</h2>
        <div className="flex flex-row gap-6">
          {(Object.keys(quarterRankingRows) as TrimestryKey[]).map(
            (trimestry) => (
              <div key={trimestry} className="flex-1 flex flex-col gap-2">
                <h2>{trimestry}</h2>
                <Card className="w-full h-full">
                  <CardBody className="w-full">
                    <GenericTable<StandingRow>
                      items={quarterRankingRows[trimestry]}
                      columns={standingsColumns}
                      ariaLabel={`Classement ${trimestry}`}
                      showActions={false}
                    />
                  </CardBody>
                </Card>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
