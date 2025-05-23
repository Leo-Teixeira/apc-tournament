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
    <div className="flex flex-col gap-6 text-primary_brand-50 w-full">
      <span className="text-l font-satoshiRegular">
        Qui a éliminé {eliminatePlayer} ?
      </span>
      <RadioGroup name="killer" className="flex flex-col gap-3">
        {allPlayerTable.map((player) => (
          <Radio key={player.id} value={String(player.id)}>
            <div className="flex items-center gap-4 p-2 rounded w-full">
              <img
                src={player.wp_users?.photo_url || "/images/ellipseAvatar.png"}
                alt={player.wp_users?.pseudo_winamax ?? ""}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-satoshiRegular text-l">
                {player.wp_users?.pseudo_winamax ?? ""}
              </span>
            </div>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
};
