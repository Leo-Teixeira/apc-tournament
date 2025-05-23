"use client";

import { Chip, Stack } from "@/app/types";
import { Button, Card, Divider, useDisclosure } from "@heroui/react";
import React, { useEffect, useState } from "react";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newJetonName, setNewJetonName] = useState("");
  const [chipToDelete, setChipToDelete] = useState<Chip | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [allChips, setAllChips] = useState<Chip[]>([]);
  const [selectedChipId, setSelectedChipId] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    const fetchChips = async () => {
      try {
        const res = await fetch("/api/chip");
        const data = await res.json();
        setAllChips(data);
      } catch (err) {
        console.error("Erreur chargement chips:", err);
      }
    };
    fetchChips();
  }, [isOpen]);

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
  }, [id]);

  const sortedChips =
    stack?.stack_chip
      ?.filter((sc) => sc.chip !== undefined)
      .map((sc) => sc.chip!)
      .sort((a, b) => a.value - b.value) ?? [];

  const existingChipIds = new Set(sortedChips.map((chip) => chip.id));
  const availableChips = allChips.filter(
    (chip) => !existingChipIds.has(chip.id)
  );

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="font-satoshiBlack text-3xl sm:text-4xl text-primary_brand-50">
          Stacks
        </p>
        <ButtonComponents
          text="Nouveau jeton"
          buttonClassName="bg-primary_brand-500 w-full sm:w-auto"
          textClassName="text-primary_brand-50"
          onClick={onOpen}
        />
      </div>

      <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
        {sortedChips.map((chip) => (
          <Card
            key={chip.value + chip.chip_image}
            className="flex flex-col items-center p-4 gap-2 bg-background_card rounded-2xl w-28 sm:w-32">
            <img
              className="rounded-lg w-20 h-20 sm:w-24 sm:h-24 object-contain"
              src={chip.chip_image}
              alt={`jeton ${chip.value}`}
            />
            <p className="text-neutral-50 font-satoshi text-m sm:text-l">
              {chip.value}
            </p>
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setChipToDelete(chip);
                setIsDeleteModalOpen(true);
              }}
              className="text-lg px-3xs rounded-xl cursor-pointer active:opacity-50 text-neutral-50">
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
        onConfirm={async () => {
          if (!stack) return;

          if (selectedChipId) {
            await fetch(`/api/stack/${stack.id}/chip`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chip_id: Number(selectedChipId) })
            });

            const chip = allChips.find((c) => c.id === Number(selectedChipId));
            if (chip) {
              setStack((prev) =>
                prev
                  ? {
                      ...prev,
                      stack_chip: [
                        ...(prev.stack_chip ?? []),
                        { chip_id: chip.id, stack_id: stack.id, chip }
                      ]
                    }
                  : prev
              );
            }
          } else {
            const res = await fetch(`/api/stack/${stack.id}/chip`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                value: Number(newJetonName),
                chip_image: "/images/ellipseAvatar.png"
              })
            });

            if (res.ok) {
              const created = await res.json();
              setStack((prev) =>
                prev
                  ? {
                      ...prev,
                      stack_chip: [
                        ...(prev.stack_chip ?? []),
                        {
                          chip_id: created.id,
                          stack_id: stack.id,
                          chip: created
                        }
                      ]
                    }
                  : prev
              );
              setAllChips((prev) => [...prev, created]);
            }
          }

          setNewJetonName("");
          setSelectedChipId("");
          onClose();
        }}>
        <div className="flex flex-col gap-4 w-full">
          <label className="text-neutral-200">
            Sélectionner un jeton existant
          </label>
          <select
            value={selectedChipId}
            onChange={(e) => setSelectedChipId(e.target.value)}
            className="rounded border p-2 bg-background_card text-neutral-50">
            <option value="">Créer un nouveau jeton</option>
            {availableChips.map((chip) => (
              <option key={chip.id} value={chip.id}>
                {chip.value}
              </option>
            ))}
          </select>

          {!selectedChipId && (
            <>
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
                label="valeur du jeton"
                type={"text"}
                value={newJetonName}
                onChange={(e) => setNewJetonName(e.target.value)}
              />
            </>
          )}
        </div>
      </GenericModal>

      <GenericModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setChipToDelete(null);
          setIsDeleteModalOpen(false);
        }}
        title="Supprimer le chip"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (!chipToDelete || !stack) return;

          try {
            const res = await fetch(`/api/stack/${stack.id}/chip`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chip_id: chipToDelete.id })
            });

            if (!res.ok) throw new Error("Erreur serveur");

            setStack((prev) =>
              prev
                ? {
                    ...prev,
                    stack_chip: prev.stack_chip?.filter(
                      (sc) => sc.chip?.id !== chipToDelete.id
                    )
                  }
                : prev
            );

            setChipToDelete(null);
            setIsDeleteModalOpen(false);
          } catch (error) {
            console.error("Erreur suppression chip du stack :", error);
            alert("Une erreur est survenue.");
          }
        }}>
        <p>
          Es-tu sûr de vouloir supprimer le chip{" "}
          <span className="font-semibold">{chipToDelete?.value}</span> ?
        </p>
      </GenericModal>
    </div>
  );
}
