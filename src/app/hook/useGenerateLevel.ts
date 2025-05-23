import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGenerateLevels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string | number) => {
      const res = await fetch(
        `/api/tournament/${tournamentId}/level/generate`,
        {
          method: "POST"
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Erreur serveur");
      }
    },
    onSuccess: (tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId]
      });
    }
  });
};
