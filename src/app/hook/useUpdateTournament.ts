import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tournament } from "@/app/types";

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: number; data: Partial<Tournament> }) => {
      const res = await fetch(`/api/tournament/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params.data)
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", variables.id]
      });
    }
  });
};

// hooks/useFinishTournament.ts
export const useFinishTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: number | string) => {
      const res = await fetch(`/api/tournament/${tournamentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "finish" })
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la finalisation du tournoi");
      }
    },
    onSuccess: (__, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId]
      });
    }
  });
};
