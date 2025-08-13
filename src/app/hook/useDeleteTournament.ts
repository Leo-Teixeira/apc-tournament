// hooks/useDeleteTournament.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteTournamentPayload = number | string;

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteTournamentPayload>({
    mutationFn: async (tournamentId) => {
      const res = await fetch(`/api/tournament/${tournamentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }
    },
    onSuccess: (_, tournamentId) => {
      // Invalidation de toutes les queries liées
      queryClient.invalidateQueries({ queryKey: ["apt-details"] });
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId],
      });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync, // Appel asynchrone
    isLoading: mutation.isPending,     // Pour le loader
    isError: mutation.isError,         // Booléen erreur
    error: mutation.error,             // Objet erreur
    reset: mutation.reset,             // Reset de l'état mutation
  };
};
