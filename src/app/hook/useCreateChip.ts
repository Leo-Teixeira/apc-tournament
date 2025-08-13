import { useMutation } from "@tanstack/react-query";

export const useCreateChipInStackWithImage = () => {
  return useMutation({
    mutationFn: async ({
      stackId,
      value,
      chipImage, // doit être du type { type: "wordpress", url: string }
    }: {
      stackId: string | number,
      value: number,
      chipImage: { type: "wordpress", url: string }
    }) => {
      const formData = new FormData();
      formData.append("stackId", stackId.toString());
      formData.append("value", value.toString());

      // On ne prend que la version wordpress !
      if (chipImage.type === "wordpress") {
        formData.append("wpImageUrl", chipImage.url);
      } else {
        throw new Error("Seul l’envoi d’image WordPress est supporté");
      }

      const response = await fetch("/api/images/chip/create", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Erreur API lors de la création du jeton");
      return response.json();
    }
  });
};
