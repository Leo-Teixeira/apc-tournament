import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { LoadingComponent } from "@/app/error/loading/page";
import { Card, Divider } from "@heroui/react";
import React, { useEffect, useState } from "react";

export const ChipTabs: React.FC = () => {
  const { tournament, assignements } = useTournamentContext();

  const [stackTotal, setStackTotal] = useState(0);
  const [stackPerPlayer, setStackPerPlayer] = useState(0);
  const [stackAverage, setStackAverage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const stackChips =
    tournament?.stack?.stack_chip?.filter((sc) => sc.chip !== undefined) ?? [];
  const chips = stackChips.map((sc) => sc.chip!);

  const stackPerPlayerValue = tournament?.stack?.stack_total_player ?? 0;
  const aliveAssignements = assignements.filter((a) => !a.eliminated);
  const activePlayersCount = aliveAssignements.length;

  useEffect(() => {
    const total = stackPerPlayerValue * aliveAssignements.length;
    const average =
      aliveAssignements.length > 0
        ? Math.floor(total / aliveAssignements.length)
        : 0;

    setStackPerPlayer(stackPerPlayerValue);
    setStackTotal(total);
    setStackAverage(average);
    setIsLoading(false);
  }, [stackPerPlayerValue, aliveAssignements]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (chips.length === 0) {
    return (
      <div className="text-center text-white mt-10">
        Aucun jeton n’a encore été défini pour ce tournoi.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col">
          <p className="p-5 font-satoshiBold text-l">
            Stack utilisé : {tournament?.stack?.stack_name}
          </p>
          <Divider />
          <div className="flex flex-row justify-between">
            {chips.map((chip, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col p-5 gap-2 justify-end">
                  <img
                    src={chip.chip_image}
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
          { title: "Stack Total", value: stackTotal },
          { title: "Stack initial par joueur", value: stackPerPlayer },
          { title: "Stack moyen", value: stackAverage }
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
