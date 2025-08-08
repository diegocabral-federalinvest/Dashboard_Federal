import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useDeleteExpense = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID da despesa é necessário");
      
      console.log("[useDeleteExpense] Attempting to delete expense with ID:", id);
      
      try {
        const response = await (client as any).api.expenses[id].$delete();
        console.log("[useDeleteExpense] Delete response status:", response.status);
        
        if (!response.ok) {
          const error = await response.json();
          console.error("[useDeleteExpense] Delete error:", error);
          throw new Error(error.message || "Falha ao excluir despesa");
        }
        
        console.log("[useDeleteExpense] Delete successful with status:", response.status);
        return response.json();
      } catch (error) {
        console.error("[useDeleteExpense] Exception during delete:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("[useDeleteExpense] Delete successful, data:", data);
      toast.success("Despesa excluída com sucesso!");
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["expenses", id] });
      
      // Invalidate the expenses list to refetch
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error) => {
      console.error("[useDeleteExpense] Failed to delete expense:", error);
      toast.error("Erro ao excluir despesa");
    },
  });
}; 