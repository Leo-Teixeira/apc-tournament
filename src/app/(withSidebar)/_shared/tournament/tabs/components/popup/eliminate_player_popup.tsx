import { Radio, RadioGroup } from "@heroui/react";
import { Registration } from "@/app/types";

type EliminatePlayerProps = {
  eliminatePlayer: string;
  allPlayerTable: Registration[];
};

export const EliminatePlayerFormBody: React.FC<EliminatePlayerProps> = ({
  eliminatePlayer,
  allPlayerTable
}) => {
  return (
    <div className="flex flex-col gap-4 text-primary_brand-50">
      <span className="text-l font-satoshiRegular text-primary_brand-50">
        Qui a éliminé {eliminatePlayer} ?
      </span>
      <RadioGroup name="killer">
        {allPlayerTable.map((player) => (
          <Radio key={player.id} value={String(player.id)}>
            <div
              className={`flex items-center gap-3 p-2 rounded cursor-pointer`}>
              <img
                src={player.wp_users?.photo_url || "/images/ellipseAvatar.png"}
                alt={player.wp_users?.pseudo_winamax ?? ""}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-satoshiRegular text-l text-primary_brand-50">
                {player.wp_users?.pseudo_winamax ?? ""}
              </span>
            </div>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
};
