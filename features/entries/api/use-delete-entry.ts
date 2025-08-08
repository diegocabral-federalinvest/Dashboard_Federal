import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useDeleteEntry = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID da entrada é necessário");
      
      console.log("[useDeleteEntry] Attempting to delete entry with ID:", id);
      
      try {
        const response = await (client as any).api.entries[id].$delete();
        console.log("[useDeleteEntry] Delete response status:", response.status);
        
        if (!response.ok) {
          const error = await response.json();
          console.error("[useDeleteEntry] Delete error:", error);
          throw new Error(error.message || "Falha ao excluir entrada");
        }
        
        console.log("[useDeleteEntry] Delete successful with status:", response.status);
        return response.json();
      } catch (error) {
        console.error("[useDeleteEntry] Exception during delete:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("[useDeleteEntry] Delete successful, data:", data);
      toast.success("Entrada excluída com sucesso!");
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["entries", id] });
      
      // Invalidate the entries list to refetch
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
    onError: (error) => {
      console.error("[useDeleteEntry] Failed to delete entry:", error);
      toast.error("Erro ao excluir entrada");
    },
  });
}; 