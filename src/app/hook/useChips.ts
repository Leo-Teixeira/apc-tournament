import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip } from "@/app/types";

export const useAllChips = (enabled = true) =>
  useQuery<Chip[]>({
    queryKey: ["chips"],
    queryFn: async () => {
      const res = await fetch("/api/chip");
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    enabled
  });

export const useAddChipToStack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stackId,
      chip_id
    }: {
      stackId: number;
      chip_id: number;
    }) => {
      const res = await fetch(`/api/stack/${stackId}/chip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chip_id })
      });
      if (!res.ok) throw new Error("Erreur ajout jeton");
    },
    onSuccess: (_, { stackId }) => {
      queryClient.invalidateQueries({
        queryKey: ["stack", stackId.toString()]
      });
    }
  });
};

export const useCreateChipInStack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stackId,
      value
    }: {
      stackId: number;
      value: number;
    }): Promise<Chip> => {
      const res = await fetch(`/api/stack/${stackId}/chip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value,
          chip_image: "/images/ellipseAvatar.png"
        })
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: (_, { stackId }) => {
      queryClient.invalidateQueries({
        queryKey: ["stack", stackId.toString()]
      });
      queryClient.invalidateQueries({ queryKey: ["chips"] });
    }
  });
};

export const useRemoveChipFromStack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stackId,
      chipId
    }: {
      stackId: number;
      chipId: number;
    }) => {
      const res = await fetch(`/api/stack/${stackId}/chip`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chip_id: chipId })
      });
      if (!res.ok) throw new Error("Erreur suppression jeton");
    },
    onSuccess: (_, { stackId }) => {
      queryClient.invalidateQueries({
        queryKey: ["stack", stackId.toString()]
      });
    }
  });
};
