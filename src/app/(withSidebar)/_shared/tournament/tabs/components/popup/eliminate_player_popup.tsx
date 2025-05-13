import { InputComponents } from "@/app/components/form/input";
import { NumberInputComponents } from "@/app/components/form/number_input";
import { RadioGroupComponents } from "@/app/components/form/radio_group";
import { SearchBarComponents } from "@/app/components/form/search_bar";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { Registration } from "@/app/types";
import { User } from "@/app/types/user.types";
import { Checkbox, CheckboxGroup } from "@heroui/react";
import { useState } from "react";

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
        Qui a éliminé {eliminatePlayer}
      </span>
      <CheckboxGroup>
        {allPlayerTable.map((player) => {
          const user = player.user_id as User;
          return (
            <div className="p-2">
              <Checkbox key={player.id} value={String(player.id)}>
                <div className="flex items-center gap-3">
                  <img
                    src={user.photo_url || "/images/ellipseAvatar.png"}
                    alt={user.pseudo_winamax ?? ""}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-satoshiRegular text-l text-primary_brand-50">
                    {user.pseudo_winamax ?? ""}
                  </span>
                </div>
              </Checkbox>
            </div>
          );
        })}
      </CheckboxGroup>
    </div>
  );
};
