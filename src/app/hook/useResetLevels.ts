// hooks/useResetLevels.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useResetLevels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: number | string) => {
      const res = await fetch(`/api/tournament/${tournamentId}/level`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la réinitialisation");
      }
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId]
      });
    }
  });
};
