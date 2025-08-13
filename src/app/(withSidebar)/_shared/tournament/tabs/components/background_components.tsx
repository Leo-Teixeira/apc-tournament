"use client";

import { useState } from "react";
import { ButtonComponents } from "@/app/components/button";
import { Tournament } from "@/app/types";
import { Card } from "@heroui/react";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { GenericModal } from "@/app/components/popup";
import { useWpBackgroundImages } from "@/app/hook/useImages"; // réutilisé pour fonds WP
import { useUpdateTournamentBackgrounds } from "@/app/hook/useUpdateTournamentsBackground";

type BackgroundProps = {
  tournament: Tournament;
};

export const BackgroundComponent: React.FC<BackgroundProps> = ({ tournament }) => {
  const { data: wpImages = [], isLoading, error } = useWpBackgroundImages();
  const updateBackgrounds = useUpdateTournamentBackgrounds();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Indique quel fond est sélectionné pour modification dans la popup
  const [editingBackgroundIndex, setEditingBackgroundIndex] = useState<number | null>(null);

  const [pendingBackgrounds, setPendingBackgrounds] = useState<string[]>(() => {
    const arr: string[] = [];
    if (tournament.tournament_background_1) arr.push(tournament.tournament_background_1);
    if (tournament.tournament_background_2) arr.push(tournament.tournament_background_2);
    return arr;
  });

  // Ouvre la popup et sélectionne le fond à modifier
  const openModalForIndex = (index: number) => {
    setEditingBackgroundIndex(index);
    setIsModalOpen(true);
  };

  // Sélectionne une image dans la popup pour le fond en cours d'édition
  const selectImageForEditingBackground = (url: string) => {
    if (editingBackgroundIndex === null) return;
    setPendingBackgrounds((prev) => {
      const newBackgrounds = [...prev];
      newBackgrounds[editingBackgroundIndex] = url;
      return newBackgrounds;
    });
  };

  const handleSave = async () => {
    try {
      await updateBackgrounds.mutateAsync({
        id: tournament.id,
        background: pendingBackgrounds,
      });
      setIsModalOpen(false);
      alert("Fonds mis à jour !");
    } catch (err) {
      alert("Erreur lors de la mise à jour des fonds");
    }
  };

  return (
    <div className="w-full">
      {tournament.tournament_status !== "finish" ? (
        <Card className="bg-background_card rounded-xl p-5">
          <div className="flex flex-col gap-5">
            {/* Affichage des deux fonds côte à côte */}
            <div className="flex gap-4 justify-center">
              {pendingBackgrounds.length > 0 ? (
                pendingBackgrounds.map((bg, index) => (
                  <div key={index} className="flex flex-col items-center gap-4">
                    <img
                      className="rounded-lg w-[920px] h-[360px] object-cover"
                      src={bg}
                      alt={`background ${index + 1}`}
                    />

                    <ButtonComponents
                      text="Changer de fond"
                      onClick={() => {
                        openModalForIndex(index)
                      }}
                      buttonClassName="w-full sm:w-auto bg-white/20 hover:bg-primary_brand-300"
                      textClassName="text-primary_brand-50"
                    />
                  </div>
                ))
              ) : (
                <img
                  className="w-full max-w-full rounded-lg object-cover"
                  src="/images/wallpaper.svg"
                  alt="background"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {tournament.tournament_status === "in_coming" && (
                <ButtonComponents
                  text="Afficher"
                  onClick={() => {
                    window.open(`/game/${tournament.id}`);
                  }}
                  buttonClassName="w-full sm:w-auto bg-primary_background hover:bg-primary_hover_background"
                  textClassName="text-primary_brand-50"
                  icon={
                    <HugeiconsIcon
                      icon={LinkSquare02Icon}
                      size={20}
                      className="shrink-0"
                      color="white"
                    />
                  }
                />
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-6 py-6 px-2 text-center">
          <img
            className="rounded-lg w-full max-w-xl object-contain"
            src="/images/background_finish_image.svg"
            alt="background svg"
          />
          <p className="text-primary_brand-300 font-satoshiBold text-base sm:text-l leading-7 px-2">
            Les cartes ont parlé, les jetons sont rangés… Découvrez le classement final et félicitez les champions !
          </p>
        </div>
      )}

      {/* Modal de sélection WordPress */}
      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBackgroundIndex !== null ? `Changer le fond ${editingBackgroundIndex + 1}` : "Changer les fonds"}
        confirmLabel="Enregistrer"
        onConfirm={handleSave}
      >
        {isLoading && <p className="text-neutral-200">Chargement…</p>}
        {error && <p className="text-red-400">Erreur lors du chargement.</p>}

        {!isLoading && !error && (
          <div className="flex flex-wrap gap-2 max-h-80 overflow-auto mt-3">
            {wpImages.map((img) => {
              const imageUrl = img.guid.replace(
                "angers-poker-club.local",
                "aqua-bat-544144.hostingersite.com"
              );
              // Pour la sélection visuelle dans la popup
              const isSelected = editingBackgroundIndex !== null
                ? pendingBackgrounds[editingBackgroundIndex] === imageUrl
                : pendingBackgrounds.includes(imageUrl);

              return (
                <img
                  key={img.ID}
                  src={imageUrl}
                  alt={`fond ${img.post_title ?? img.ID}`}
                  className={`cursor-pointer rounded border-4 ${
                    isSelected
                      ? "border-primary_brand-500"
                      : "border-transparent"
                  }`}
                  style={{ width: 120, height: 80, objectFit: "cover" }}
                  onClick={() => {
                    if (editingBackgroundIndex !== null) {
                      selectImageForEditingBackground(imageUrl);
                    } else {
                      // Si aucun fond sélectionné précisément, toggle comme avant
                      const idx = pendingBackgrounds.indexOf(imageUrl);
                      if (idx !== -1) {
                        setPendingBackgrounds(pendingBackgrounds.filter(bg => bg !== imageUrl));
                      } else if (pendingBackgrounds.length < 2) {
                        setPendingBackgrounds([...pendingBackgrounds, imageUrl]);
                      }
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        {pendingBackgrounds.length > 0 && (
          <div className="flex gap-4 mt-4">
            {pendingBackgrounds.map((bg, i) => (
              <img
                key={i}
                src={bg}
                alt={`preview ${i}`}
                className="w-32 h-20 object-cover rounded"
              />
            ))}
          </div>
        )}
      </GenericModal>
    </div>
  );
};
