// hooks/useMovePlayer.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

type MoveMode = "swap" | "move";

type MovePlayerPayload = {
  tournamentId: number | string;
  playerId: number;
  mode: MoveMode;
  targetId: number;
};

export const useMovePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      playerId,
      mode,
      targetId
    }: MovePlayerPayload) => {
      const res = await fetch(`/api/tournament/${tournamentId}/table/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          mode,
          targetId
        })
      });

      if (!res.ok) {
        throw new Error("Erreur lors du déplacement");
      }
    },
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["tournament-data", tournamentId]
      });
    }
  });
};
