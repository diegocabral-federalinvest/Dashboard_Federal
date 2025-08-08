import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Entry } from "./use-get-entry";
import logger from "@/lib/logger";

export const useGetEntries = () => {
  return useQuery<Entry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      logger.info("Buscando lista de entradas", {
        source: "frontend",
        context: "entries:use-get-entries",
        tags: ["query", "entries"]
      });
      
      // Use relative path when running in development to avoid CORS issues
      const apiUrl = "/api/entries";
      
      logger.debug("Chamando API Entries", {
        source: "frontend",
        context: "entries:use-get-entries",
        tags: ["debug", "api-call"],
        data: { apiUrl, environment: process.env.NODE_ENV }
      });
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        let errorMessage = "Falha ao carregar entradas";
        try {
          const errorData = await response.json();
          logger.error("Erro na resposta da API Entries", {
            source: "frontend",
            context: "entries:use-get-entries",
            tags: ["error", "api-response"],
            data: errorData
          });
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          logger.error("Erro ao processar resposta de erro da API Entries", {
            source: "frontend",
            context: "entries:use-get-entries",
            tags: ["error", "api-parsing"],
            data: { status: response.status, statusText: response.statusText }
          });
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      logger.debug("Dados de entradas recebidos", {
        source: "frontend",
        context: "entries:use-get-entries",
        tags: ["response", "entries"],
        data: { count: data.length }
      });
      
      return data;
    },
  });
}; 