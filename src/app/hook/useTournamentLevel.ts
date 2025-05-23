// hooks/useUpdateTournamentLevel.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TournamentLevel } from "@/app/types";

export const useUpdateTournamentLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: number;
      data: Partial<TournamentLevel>;
    }) => {
      const res = await fetch(`/api/level/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: params.id, ...params.data })
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament-data"] });
    }
  });
};

export const useDeleteTournamentLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (levelId: number) => {
      const res = await fetch(`/api/level/${levelId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament-data"] });
    }
  });
};
