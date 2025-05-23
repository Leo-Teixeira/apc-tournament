"use client";

import { useParams } from "next/navigation";
import { useDisclosure, Card, Input } from "@heroui/react";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { ButtonComponents } from "@/app/components/button";
import { GenericModal } from "@/app/components/popup";
import { InputComponents } from "@/app/components/form/input";
import { useStackById } from "@/app/hook/useStack";
import {
  useAllChips,
  useAddChipToStack,
  useCreateChipInStack,
  useRemoveChipFromStack
} from "@/app/hook/useChips";
import { Chip } from "@/app/types";

export default function StackPage() {
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedChipId, setSelectedChipId] = useState("");
  const [newJetonName, setNewJetonName] = useState("");
  const [chipToDelete, setChipToDelete] = useState<Chip | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: stack } = useStackById(String(id));
  const { data: allChips = [] } = useAllChips(isOpen);
  const addChipToStack = useAddChipToStack();
  const createChipInStack = useCreateChipInStack();
  const removeChipFromStack = useRemoveChipFromStack();

  const sortedChips =
    stack?.stack_chip
      ?.filter((sc) => sc.chip !== undefined)
      .map((sc) => sc.chip!)
      .sort((a, b) => a.value - b.value) ?? [];

  const existingChipIds = new Set(sortedChips.map((chip) => chip.id));
  const availableChips = allChips.filter(
    (chip: Chip) => !existingChipIds.has(chip.id)
  );

  const handleAddChip = async () => {
    if (!stack) return;

    try {
      if (selectedChipId) {
        await addChipToStack.mutateAsync({
          stackId: stack.id,
          chip_id: Number(selectedChipId)
        });
      } else {
        await createChipInStack.mutateAsync({
          stackId: stack.id,
          value: Number(newJetonName)
        });
      }
      setSelectedChipId("");
      setNewJetonName("");
      onClose();
    } catch (error) {
      alert("Erreur lors de l'ajout du jeton.");
    }
  };

  const handleDeleteChip = async () => {
    if (!chipToDelete || !stack) return;

    try {
      await removeChipFromStack.mutateAsync({
        stackId: stack.id,
        chipId: chipToDelete.id
      });
      setChipToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert("Erreur lors de la suppression du jeton.");
    }
  };

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
        {sortedChips.map((chip: Chip) => (
          <Card
            key={chip.id}
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
        onConfirm={handleAddChip}>
        <div className="flex flex-col gap-4 w-full">
          <label className="text-neutral-200">
            Sélectionner un jeton existant
          </label>
          <select
            value={selectedChipId}
            onChange={(e) => setSelectedChipId(e.target.value)}
            className="rounded border p-2 bg-background_card text-neutral-50">
            <option value="">Créer un nouveau jeton</option>
            {availableChips.map((chip: Chip) => (
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
                type="text"
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
        onConfirm={handleDeleteChip}>
        <p>
          Es-tu sûr de vouloir supprimer le chip{" "}
          <span className="font-semibold">{chipToDelete?.value}</span> ?
        </p>
      </GenericModal>
    </div>
  );
}
