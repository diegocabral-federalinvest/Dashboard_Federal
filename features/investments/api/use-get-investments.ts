import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Investment } from "./use-get-investment";
import logger from "@/lib/logger";

export const useGetInvestments = (investorId?: string) => {
  return useQuery<Investment[]>({
    queryKey: ["investments", investorId],
    queryFn: async () => {
      logger.info("Buscando lista de investimentos", {
        source: "frontend",
        context: "investments:use-get-investments",
        tags: ["query", "investments"]
      });
      
      // Usar fetch diretamente com a URL completa em vez do cliente Hono
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://federal-novo.vercel.app' 
          : 'http://localhost:3000');
      
      const apiUrl = `${baseUrl}/api/investments${investorId ? `?investorId=${investorId}` : ""}`;
      
      logger.debug("Chamando API Investments", {
        source: "frontend",
        context: "investments:use-get-investments",
        tags: ["debug", "api-call"],
        data: { apiUrl, environment: process.env.NODE_ENV }
      });
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        let errorMessage = "Falha ao carregar investimentos";
        try {
          const errorData = await response.json();
          logger.error("Erro na resposta da API Investments", {
            source: "frontend",
            context: "investments:use-get-investments",
            tags: ["error", "api-response"],
            data: errorData
          });
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          logger.error("Erro ao processar resposta de erro da API Investments", {
            source: "frontend",
            context: "investments:use-get-investments",
            tags: ["error", "api-parsing"],
            data: { status: response.status, statusText: response.statusText }
          });
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      logger.debug("Dados de investimentos recebidos", {
        source: "frontend",
        context: "investments:use-get-investments",
        tags: ["response", "investments"],
        data: { count: data.length }
      });
      
      return data;
    },
  });
}; 