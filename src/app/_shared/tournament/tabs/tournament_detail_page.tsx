"use client";
import { Button, Card, CardBody, Chip, Tab, Tabs } from "@heroui/react";
import General from "./general";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { TournamentRow } from "@/app/components/table/table.types";

export default function TournamentDetailPage(id: string) {
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

  const [tournamentRows, setTournamentRows] = useState<TournamentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, registrationsRes] = await Promise.all([
          fetch(`/lib/api/tournaments/apt/${id}`),
          fetch(`/lib/api/registrations/tournament/apt/${id}`)
        ]);
        console.log(tournamentsRes);
        const tournaments = await tournamentsRes.json();
        console.log(tournaments);
        const registrations = await registrationsRes.json();

        // const rows = mapTournamentToRow(tournaments, registrations, "APT");
        // setTournamentRows(rows);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <h1>Tournoi APT 1 - T1</h1>
          <Chip>En cours</Chip>
        </div>

        <div className="flex flex-row gap-3">
          <Button className="bg-green-500 rounded-xl p-3">
            <p className="text-grey-50 font-satoshi text-body1 font-normal">
              Lancer le tournoi
            </p>
          </Button>
          <div className="flex flex-col gap-6">
            <Button className="bg-green-500 rounded-xl p-3">
              <p className="text-grey-50 font-satoshi text-body1 font-normal">
                Voir l'affichage
              </p>
              <HugeiconsIcon icon={LinkSquare02Icon} color="white" />
            </Button>
            <Button className="bg-grey-50 rounded-xl p-3">
              <p className="text-green-500 font-satoshi text-body1 font-normal">
                Modifier le tournoi
              </p>
            </Button>
          </div>
        </div>
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
