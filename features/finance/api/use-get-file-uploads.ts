import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import logger from "@/lib/logger";
import { FileUpload } from "../types/index";


export const useGetFileUploads = () => {
  return useQuery<FileUpload[]>({
    queryKey: ["file-uploads"],
    queryFn: async () => {
      logger.info("Buscando histórico de uploads de arquivos", {
        source: "frontend",
        context: "finance:use-get-file-uploads",
        tags: ["query", "file-uploads"],
      });
      
      try {
        logger.debug("Iniciando requisição para API de arquivos", {
          source: "frontend",
          context: "finance:use-get-file-uploads",
          tags: ["request", "api-call"],
          data: { endpoint: "/api/finance/files" }
        });
        
        const response = await (client as any).api.finance.files.$get();
        
        logger.debug("Resposta recebida da API", {
          source: "frontend",
          context: "finance:use-get-file-uploads",
          tags: ["response", "api-response"],
          data: { 
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          logger.error("Falha ao buscar histórico de uploads", { 
            source: "frontend", 
            context: "finance:use-get-file-uploads", 
            tags: ["error", "api-response"],
            data: { 
              ...errorData,
              status: response.status,
              statusText: response.statusText 
            }
          });
          
          // Retornar array vazio para evitar falha completa da interface
          console.warn("Retornando array vazio devido a erro na API de uploads");
          return [];
        }
        
        const responseData = await response.json();
        
        logger.debug("Histórico de uploads recebido", {
          source: "frontend",
          context: "finance:use-get-file-uploads",
          tags: ["response", "file-uploads"],
          data: { count: responseData.data.length }
        });
        
        return responseData.data;
      } catch (error) {
        logger.error("Exceção ao buscar histórico de uploads", { 
          source: "frontend", 
          context: "finance:use-get-file-uploads", 
          tags: ["error", "exception"],
          data: { 
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined 
          }
        });
        
        // Retornar array vazio para não quebrar a interface
        console.warn("Retornando array vazio devido a exceção na API de uploads");
        return [];
      }
    },
    // Aumentar o retry para dar mais tempo para o banco de dados ser criado
    retry: 1,
    // Não mostrar erro na UI se falhar, já estamos tratando
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}; 