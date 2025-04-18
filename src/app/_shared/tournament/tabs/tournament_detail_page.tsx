"use client";
import { Card, CardBody, Chip, Tab, Tabs } from "@heroui/react";
import General from "./general";

export default function TournamentDetailPage() {
  let tabs = [
    {
      id: "general",
      label: "Général",
      content: <General />
    },
    {
      id: "niveaux",
      label: "Niveaux",
      content: <General />
    },
    {
      id: "joueurs",
      label: "Joueurs",
      content: <General />
    },
    {
      id: "tables",
      label: "Tables",
      content: <General />
    },
    {
      id: "jetons",
      label: "Jetons",
      content: <General />
    }
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-3">
        {/* dynamique */}
        <h1>Tournoi APT 1 - T1</h1>
        <Chip>En cours</Chip>
      </div>
      <div className="flex w-full flex-col">
        <Tabs aria-label="Dynamic tabs" items={tabs}>
          {(item) => (
            <Tab key={item.id} title={item.label}>
              {item.content}
            </Tab>
          )}
        </Tabs>
      </div>
    </div>
  );
}
