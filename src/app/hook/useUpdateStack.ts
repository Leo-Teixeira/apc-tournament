// hooks/useUpdateStack.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateStackPayload = {
  stackId: number;
  data: {
    tournament_id: number;
    selected_stack_id: number;
    stack_total_player: number;
    stack_chip: {
      stack_id: number;
      chip_id?: number;
      chip?: {
        value: number;
        chip_image: string;
      };
    }[];
  };
};

export const useUpdateStack = () => {
  const queryClient = useQueryClient();

return useMutation({
  mutationFn: async ({ stackId, data }: UpdateStackPayload) => {
    const res = await fetch(`/api/stack/${stackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = await res.json();
      throw new Error(msg.error || "Erreur serveur");
    }
    return await res.json(); // si tu veux récupérer la réponse (facultatif)
  },
  onSuccess: (_, variables) => { // variables = arguments passés à la mutation
    queryClient.invalidateQueries({
      queryKey: ["tournament-data", variables.data.tournament_id],
    });
  }
});

};
