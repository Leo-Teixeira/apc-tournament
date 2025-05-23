// hooks/useDeleteTournament.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: number | string) => {
      const res = await fetch(`/api/tournament/${tournamentId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ["apt-details"] });
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId]
      });
    }
  });
};
