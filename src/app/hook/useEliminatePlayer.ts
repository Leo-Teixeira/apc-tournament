// hooks/useEliminatePlayer.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEliminatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      tournamentId: number | string;
      registrationId: number;
      killerId: number;
    }) => {
      const res = await fetch(
        `/api/tournament/${params.tournamentId}/player/${params.registrationId}/elimination`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_kill_id: params.killerId })
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

