import { InputComponents } from "@/app/components/form/input";
import { NumberInputComponents } from "@/app/components/form/number_input";
import { RadioGroupComponents } from "@/app/components/form/radio_group";
import { SearchBarComponents } from "@/app/components/form/search_bar";
import { TimeInputComponents } from "@/app/components/form/time_input";
import { Checkbox } from "@heroui/react";
import { useState } from "react";

export const PlayerFormBody = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [search, setSearch] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");

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
        <SearchBarComponents
          label="Rechercher un joueur"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
