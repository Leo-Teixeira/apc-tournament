"use client";

import { Card, CardBody } from "@heroui/react";
import { GenericTable } from "../components/table/generic_table";
import { seatsColumns } from "../components/table/presets/seats.config";
import { STRINGS } from "../constants/string";
import { standingsColumns } from "../components/table/presets/standings.config";
import { StandingRow, TournamentRow } from "../components/table/table.types";
import { standingsMock, tournamentMocks } from "../constants/mock";
import { tournamentColumns } from "../components/table/presets/tournament.config";

export default function APTHome() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <h1>Championnat APT</h1>

      <div className="flex flex-col gap-3">
        <h2>Tournoi</h2>
        <Card className="w-full">
          <CardBody className="w-full">
            <GenericTable<TournamentRow>
              items={tournamentMocks}
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
          {STRINGS.apt.trimestry.map((trimestry, index) => (
            <div key={index} className="flex-1 flex flex-col gap-2">
              <h2>{trimestry}</h2>
              <Card className="w-full h-full">
                <CardBody className="w-full">
                  <GenericTable<StandingRow>
                    items={standingsMock}
                    columns={standingsColumns}
                    ariaLabel="Liste des sièges"
                    showActions={false}
                  />
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
