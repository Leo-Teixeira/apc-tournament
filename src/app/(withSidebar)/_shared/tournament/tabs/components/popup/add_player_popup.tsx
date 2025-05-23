"use client";

import { InputComponents } from "@/app/components/form/input";
import { RadioGroupComponents } from "@/app/components/form/radio_group";
import { SearchBarComponents } from "@/app/components/form/search_bar";
import { useEffect, useState } from "react";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { User } from "@/app/types/user.types";
import { useUsers } from "@/app/hook/useUsers";

export const PlayerFormBody = ({
  onUpdate
}: {
  onUpdate: (data: {
    pseudo: string;
    firstName: string;
    lastName: string;
  }) => void;
}) => {
  const [isRegister, setIsRegister] = useState(true);
  const [search, setSearch] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const { tournament, registration } = useTournamentContext();

  const { data: players, isLoading: isPlayersLoading, error } = useUsers();

  useEffect(() => {
    onUpdate({ pseudo, firstName, lastName });
  }, [pseudo, firstName, lastName]);

  useEffect(() => {
    const searchPlayers = () => {
      const filtered = players.filter(
        (p: any) =>
          p.pseudo_winamax.toLowerCase().startsWith(search.toLowerCase()) &&
          !registration.some(
            (r) => r.wp_users?.pseudo_winamax === p.pseudo_winamax
          )
      );
      setAvailablePlayers(filtered);
    };
    searchPlayers();
  }, [search, isRegister, registration, players]);

  return (
    <div className="flex flex-col gap-6 text-white w-full">
      <RadioGroupComponents
        label="Déjà inscrit au club ?"
        value={String(isRegister)}
        onChange={(e) => {
          setIsRegister(e.target.value === "true");
        }}
      />

      {isRegister ? (
        <div className="flex flex-col gap-4">
          <SearchBarComponents
            label="Rechercher un joueur"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <ul className="bg-default-100 text-primary_brand-50 rounded-lg p-2 max-h-48 overflow-y-auto shadow-md">
              {availablePlayers.map((player) => (
                <li
                  key={player.ID}
                  className="py-1 px-2 rounded hover:bg-default-200 cursor-pointer transition-colors"
                  onClick={() => {
                    setPseudo(player.pseudo_winamax);
                    setSearch(player.pseudo_winamax);
                  }}>
                  {player.pseudo_winamax} – {player.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <InputComponents
            label="Nom"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <InputComponents
            label="Prénom"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <InputComponents
            label="Pseudo"
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
