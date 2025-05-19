"use client";

import { Stack } from "@/app/types";
import { Card, Input, useDisclosure } from "@heroui/react";
import React, { useEffect, useState } from "react";
import { ButtonComponents } from "../../components/button";
import Link from "next/link";
import { GenericModal } from "../../components/popup";
import { InputComponents } from "../../components/form/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

export default function StackPage() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newStackName, setNewStackName] = useState("");
  const [newStackTotalPlayer, setNewStackTotalPlayer] = useState(0);
  const [stackToDelete, setStackToDelete] = useState<Stack | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stackRes = await fetch(`/api/stack`);
        const data = await stackRes.json();
        setStacks(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateStack = async () => {
    try {
      const res = await fetch("/api/stack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stack_name: newStackName,
          stack_total_player: newStackTotalPlayer
        })
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const newStack = await res.json();
      setStacks((prev) => [...prev, newStack]);
      setNewStackName("");
      setNewStackTotalPlayer(0);
      onClose();
    } catch (error) {
      console.error("Erreur création stack :", error);
      alert("Une erreur est survenue lors de la création du stack.");
    }
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
        {stacks.map((stack) => {
          const sortedChips =
            stack.stack_chip
              ?.filter((sc) => sc.chip !== undefined)
              .map((sc) => sc.chip!)
              .sort((a, b) => a.value - b.value)
              .slice(0, 5) ?? [];

          return (
            <div key={stack.id} className="relative group">
              <Link href={`/malette/${stack.id}`}>
                <Card className="flex flex-col items-center justify-center gap-4 p-6 bg-background_card rounded-2xl hover:cursor-pointer">
                  <div className="flex flex-row -space-x-6">
                    {sortedChips.map((chip, index) => (
                      <img
                        key={index}
                        src={chip.chip_image}
                        alt={`Jeton ${chip.value}`}
                        className="w-20 h-20 rounded-full border-1 border-black"
                      />
                    ))}
                  </div>
                  <p className="text-neutral-50 font-satoshi text-l">
                    {stack.stack_name}
                  </p>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setStackToDelete(stack);
                      setIsDeleteModalOpen(true);
                    }}
                    className="absolute top-2 right-2 text-lg p-1 rounded-full bg-danger-500 cursor-pointer active:opacity-50 text-white z-10 hover:bg-danger-700">
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      size={20}
                      strokeWidth={1.5}
                    />
                  </span>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>

      <GenericModal
        isOpen={isOpen}
        onClose={onClose}
        title="Nouveau stack"
        confirmLabel="Créer le stack"
        onConfirm={handleCreateStack}>
        <div className="flex flex-col gap-4">
          <InputComponents
            label="Nom du stack"
            type="text"
            value={newStackName}
            onChange={(e) => setNewStackName(e.target.value)}
          />
          <Input
            label="Stack par joueur"
            type="number"
            value={String(newStackTotalPlayer)}
            onChange={(e) => setNewStackTotalPlayer(parseInt(e.target.value))}
            min={0}
          />
        </div>
      </GenericModal>

      <GenericModal
        isOpen={isDeleteModalOpen}
        onClose={() => setStackToDelete(null)}
        title="Supprimer le stack"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (!stackToDelete) return;

          try {
            const res = await fetch(`/api/stack/${stackToDelete.id}`, {
              method: "DELETE"
            });

            if (!res.ok) throw new Error("Erreur serveur");

            setStacks((prev) => prev.filter((s) => s.id !== stackToDelete.id));
            setStackToDelete(null);
            setIsDeleteModalOpen(false);
          } catch (error) {
            console.error("Erreur suppression stack :", error);
            alert("Une erreur est survenue.");
          }
        }}>
        <p>
          Es-tu sûr de vouloir supprimer le stack{" "}
          <span className="font-semibold">{stackToDelete?.stack_name}</span> ?
        </p>
      </GenericModal>
    </div>
  );
}
