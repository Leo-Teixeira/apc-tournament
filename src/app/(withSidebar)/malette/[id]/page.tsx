"use client";

import { Chip, Stack } from "@/app/types";
import { Button, Card, Divider, useDisclosure } from "@heroui/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonComponents } from "@/app/components/button";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { GenericModal } from "@/app/components/popup";
import { InputComponents } from "@/app/components/form/input";

export default function StackPage() {
  const { id } = useParams();
  const [stack, setStack] = useState<Stack>();
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [newJetonName, setNewJetonName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stackRes = await fetch(`/api/stack/${id}`);
        const data = await stackRes.json();
        setStack(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateJeton = () => {
    console.log("Créer le stack :", newJetonName);
    // Ajouter un appel API ici
    setNewJetonName("");
    onClose();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <p className="font-satoshiBlack text-4xl text-primary_brand-50">
          Stacks
        </p>
        <ButtonComponents
          text="Nouveau jeton"
          buttonClassName="bg-primary_brand-500"
          textClassName="text-primary_brand-50"
          onClick={onOpen}
        />
      </div>

      <div className="flex flex-row gap-6">
        {stack?.chips.map((chip) => (
          <Card className="flex flex-col items-center p-4 gap-2 bg-background_card rounded-2xl">
            <img
              className="rounded-lg"
              src={(chip as Chip).chip_image}
              alt="jeton"
            />
            <p className="text-neutral-50 font-satoshi text-l">
              {(chip as Chip).value}
            </p>
            <span
              onClick={() => {}}
              className={`text-lg px-3xs rounded-xl cursor-pointer active:opacity-50 text-neutral-50`}>
              <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={1.5} />
            </span>
          </Card>
        ))}
      </div>
      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Nouveau jeton"
        confirmLabel="Créer le jeton"
        onConfirm={handleCreateJeton}>
        <div className="flex flex-col gap-3 justify-center items-center">
          <img
            className="rounded-lg"
            src="/images/ellipseAvatar.png"
            alt="jeton"
            width={155}
            height={155}
          />
          <ButtonComponents
            text="Changer l'image"
            buttonClassName="bg-primary_brand-500"
            textClassName="text-primary_brand-50"
            onClick={onOpen}
          />
        </div>
        <InputComponents
          label="Nom du stack"
          type={"text"}
          value={newJetonName}
          onChange={(e) => setNewJetonName(e.target.value)}
        />
      </GenericModal>
    </div>
  );
}
