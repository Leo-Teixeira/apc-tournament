// hooks/useGenerateTables.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGenerateTables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: number | string) => {
      const res = await fetch(
        `/api/tournament/${tournamentId}/table_assignement/generate`,
        {
          method: "POST"
        }
      );

      if (!res.ok) {
        throw new Error("Erreur serveur lors de la génération des tables.");
      }
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId]
      });
    }
  });
};
