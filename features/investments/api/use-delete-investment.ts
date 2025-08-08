import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useDeleteInvestment = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID do investimento é necessário");
      
      const response = await (client as any).api.investments[id].$delete();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao excluir investimento");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success("Investimento excluído com sucesso!");
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["investments", id] });
      
      // Invalidate the investments list to refetch
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: (error) => {
      console.error("Falha ao excluir investimento:", error);
      toast.error("Erro ao excluir investimento");
    },
  });
}; 