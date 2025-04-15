"use client";

import { Card, CardBody } from "@heroui/react";
import { GenericTable } from "../components/table/generic_table";
import { seatsColumns } from "../components/table/presets/seats.config";

const seats = [
  { id: "1", name: "Arthur", seat: "A1", eliminated: false },
  { id: "2", name: "Léo", seat: "Éliminé", eliminated: true },
  { id: "3", name: "Sarah", seat: "A3", eliminated: false }
];

export default function APTHome() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <h1>Championnat APT</h1>

      <div className="flex flex-col gap-3">
        <h2>Tournoi</h2>
        <Card className="w-full">
          <CardBody className="w-full">
            <GenericTable
              items={seats}
              columns={seatsColumns}
              ariaLabel="Liste des sièges"
            />
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2>Classement</h2>
      </div>
    </div>
  );
}
