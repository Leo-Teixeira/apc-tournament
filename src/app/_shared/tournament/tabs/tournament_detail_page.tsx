"use client";
import { Card, CardBody, Chip, Tab, Tabs } from "@heroui/react";

export default function TournamentDetailPage() {
  let tabs = [
    {
      id: "general",
      label: "Général",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
      id: "niveaux",
      label: "Niveaux",
      content:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      id: "joueurs",
      label: "Joueurs",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
      id: "tables",
      label: "Tables",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
      id: "jetons",
      label: "Jetons",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
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
              <Card>
                <CardBody>{item.content}</CardBody>
              </Card>
            </Tab>
          )}
        </Tabs>
      </div>
    </div>
  );
}
