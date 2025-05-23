// hooks/useLaunchTournament.ts
import { useMutation } from "@tanstack/react-query";

export const useLaunchTournament = (tournamentId: string) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tournament/${tournamentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_coming" })
      });

      if (!res.ok) {
        throw new Error("Erreur lors du changement de statut");
      }
    }
  });
};
