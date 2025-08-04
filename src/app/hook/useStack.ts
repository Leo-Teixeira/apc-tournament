// hooks/useCreateStack.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack } from "@/app/types"; // adapte selon ton type réel

export const useCreateStack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { stack_name: string; stack_total_player: number }) => {
      const res = await fetch("/api/stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
    }
  });
};

export const useDeleteStack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/stack/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
    }
  });
};

export const useStacks = () => {
  return useQuery<Stack[]>({
    queryKey: ["stacks"],
    queryFn: async () => {
      const res = await fetch("/api/stack");
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
  });
};

export const useStackById = (id?: string) => {
  return useQuery<Stack>({
    queryKey: ["stack", id],
    queryFn: async () => {
      const res = await fetch(`/api/stack/${id}`);
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    enabled: !!id,
  });
};
