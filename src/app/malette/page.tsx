"use client";

import { Chip, Stack } from "@/app/types";
import { Card, useDisclosure } from "@heroui/react";
import React, { useEffect, useState } from "react";
import { ButtonComponents } from "../components/button";
import Link from "next/link";
import { GenericModal } from "../components/popup";
import { InputComponents } from "../components/form/input";

export default function StackPage() {
  const [stacks, setStack] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [newStackName, setNewStackName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stackRes = await fetch(`/api/stack`);
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

  const handleCreateStack = () => {
    console.log("Créer le stack :", newStackName);
    // Ajouter un appel API ici
    setNewStackName("");
    onClose();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <p className="font-satoshiBlack text-4xl text-primary_brand-50">
          Stacks
        </p>
        <ButtonComponents
          text="Nouveau Stack"
          buttonClassName="bg-primary_brand-500"
          textClassName="text-primary_brand-50"
          onClick={onOpen}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stacks.map((stack) => (
          <Link href={`/malette/${stack.id}`} key={stack.id}>
            <Card className="flex flex-col items-center justify-center gap-4 p-6 bg-background_card rounded-2xl hover:cursor-pointer">
              <div className="flex flex-row -space-x-6">
                {(stack.chips as Chip[]).slice(0, 5).map((chip, index) => (
                  <img
                    key={index}
                    src={typeof chip === "string" ? "" : chip.chip_image}
                    alt={`Jeton ${typeof chip === "string" ? "?" : chip.value}`}
                    className="w-20 h-20 rounded-full border-1 border-black"
                  />
                ))}
              </div>
              <p className="text-neutral-50 font-satoshi text-l">
                {stack.name}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Nouveau stack"
        confirmLabel="Créer le stack"
        onConfirm={handleCreateStack}>
        <InputComponents
          label="Nom du stack"
          type={"text"}
          value={newStackName}
          onChange={(e) => setNewStackName(e.target.value)}
        />
      </GenericModal>
    </div>
  );
}
