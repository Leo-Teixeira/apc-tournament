// hooks/useCancelPlayerElimination.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCancelPlayerElimination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      tournamentId: number | string;
      registrationId: number;
    }) => {
      const res = await fetch(
        `/api/tournament/${params.tournamentId}/player/${params.registrationId}/cancelElimination`,
        {
          method: "PUT"
        }
      );

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }
    },
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId]
      });
    }
  });
};
