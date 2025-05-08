import { Tournament, TournamentRanking } from "@/app/types";
import { Card, Divider } from "@heroui/react";
import React, { useEffect, useState } from "react";

type ChipProps = {
  tournament: Tournament;
  classement: TournamentRanking[];
};

type Chip = {
  image: string;
  value: number;
  player_quantity: number;
};

export const ChipTabs: React.FC<ChipProps> = ({ tournament, classement }) => {
  const [chips, setChips] = useState<Chip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stackTotal, setStackTotal] = useState(0);
  const [stackPerPlayer, setStackPerPlayer] = useState(0);
  const [stackAverage, setStackAverage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chipRes = await fetch(
          `/api/tournament/${tournament.id}/chip`
        );
        const data = await chipRes.json();
        const chips: Chip[] = data.chips ?? [];

        const total = chips.reduce(
          (acc, chip) => acc + chip.value * chip.player_quantity,
          0
        );

        const perPlayer = chips.reduce((acc, chip) => acc + chip.value, 0);
        const playerCount = classement.length;
        const average = playerCount > 0 ? Math.floor(total / playerCount) : 0;

        setChips(chips);
        setStackTotal(total);
        setStackPerPlayer(perPlayer);
        setStackAverage(average);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tournament.id, classement.length]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col">
          <p className="p-5 font-satoshiBold text-l">Début du tournoi</p>
          <Divider />
          <div className="flex flex-row justify-between">
            {chips.map((chip, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col p-5 gap-2 justify-end">
                  <img
                    src={chip.image}
                    alt={`Jeton ${chip.value}`}
                    className="w-32 h-32"
                  />
                  <p className="text-end font-satoshiBlack text-4xl">
                    {chip.value}
                  </p>
                </div>
                {index < chips.length - 1 && <Divider orientation="vertical" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex flex-row justify-between gap-6">
        {[
          {
            title: "Stack Total",
            value: stackTotal
          },
          {
            title: "Stack initial par joueur",
            value: stackPerPlayer
          },
          {
            title: "Stack moyen",
            value: stackAverage
          }
        ].map((card, index) => (
          <Card
            key={index}
            className="rounded-xl bg-background_card p-5 w-full">
            <div className="flex flex-col justify-between self-stretch">
              <p className="text-primary_brand-50 font-satoshiBold text-l">
                {card.title}
              </p>
              <p className="text-xl4 text-primary_brand-50 font-satoshiBlack text-right">
                {card.value}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
