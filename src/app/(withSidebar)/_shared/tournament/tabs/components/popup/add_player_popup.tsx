import { InputComponents } from "@/app/components/form/input";
import { NumberInputComponents } from "@/app/components/form/number_input";
import { RadioGroupComponents } from "@/app/components/form/radio_group";
import { SearchBarComponents } from "@/app/components/form/search_bar";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { Checkbox } from "@heroui/react";
import { useEffect, useState } from "react";
import { useTournamentContext } from "@/app/providers/TournamentContextProvider";
import { User } from "@/app/types/user.types";

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
  const [players, setPlayers] = useState<User[]>([]);

  const { tournament, registration } = useTournamentContext();

  useEffect(() => {
    onUpdate({ pseudo, firstName, lastName });
  }, [pseudo, firstName, lastName]);

  useEffect(() => {
    const fetchPlayer = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setPlayers(data);
    };
    fetchPlayer();
  }, []);

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
    <div className="flex flex-col gap-4 text-white">
      <RadioGroupComponents
        label="Déjà inscrit au club ?"
        value={String(isRegister)}
        onChange={(e) => {
          e.target.value == "true" ? setIsRegister(true) : setIsRegister(false);
        }}
      />
      {isRegister ? (
        <div className="flex flex-col gap-3">
          <SearchBarComponents
            label="Rechercher un joueur"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <ul className="bg-default-100 text-primary_brand-50 rounded-lg p-2 hover:bg-default-200 cursor-pointer">
              {availablePlayers.map((player) => (
                <li
                  key={player.ID}
                  onClick={() => {
                    setPseudo(player.pseudo_winamax);
                    setSearch(player.pseudo_winamax);
                  }}>
                  {player.pseudo_winamax} - {player.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <InputComponents
            label="Nom"
            type={"text"}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <InputComponents
            label="Prénom"
            type={"text"}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <InputComponents
            label="Pseudo"
            type={"text"}
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
