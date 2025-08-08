import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Expense } from "./use-get-expense";
import logger from "@/lib/logger";

export const useGetExpenses = () => {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      logger.info("Buscando lista de despesas", {
        source: "frontend",
        context: "expenses:use-get-expenses",
        tags: ["query", "expenses"]
      });
      
      // Use relative path when running in development to avoid CORS issues
      const apiUrl = "/api/expenses";
      
      logger.debug("Chamando API Expenses", {
        source: "frontend",
        context: "expenses:use-get-expenses",
        tags: ["debug", "api-call"],
        data: { apiUrl, environment: process.env.NODE_ENV }
      });
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        let errorMessage = "Falha ao carregar despesas";
        try {
          const errorData = await response.json();
          logger.error("Erro na resposta da API Expenses", {
            source: "frontend",
            context: "expenses:use-get-expenses",
            tags: ["error", "api-response"],
            data: errorData
          });
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          logger.error("Erro ao processar resposta de erro da API Expenses", {
            source: "frontend",
            context: "expenses:use-get-expenses",
            tags: ["error", "api-parsing"],
            data: { status: response.status, statusText: response.statusText }
          });
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      logger.debug("Dados de despesas recebidos", {
        source: "frontend",
        context: "expenses:use-get-expenses",
        tags: ["response", "expenses"],
        data: { count: data.length }
      });
      
      return data;
    },
  });
}; 