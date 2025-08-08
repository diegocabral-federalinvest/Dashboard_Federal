import { useQuery } from "@tanstack/react-query";
import logger from "@/lib/logger";
import { FinancialDataCSV } from "../types/index";


export interface RawFinancialDataParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
}

export interface RawFinancialDataResponse {
  data: FinancialDataCSV[];
  total: number;
  from: number;
  to: number;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

export const useGetRawFinancialData = (params: RawFinancialDataParams = {}) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "data",
    sortOrder = "desc",
    searchTerm = "",
    startDate,
    endDate,
    minValue,
    maxValue,
  } = params;

  return useQuery<RawFinancialDataResponse>({
    queryKey: [
      "raw-financial-data",
      page,
      pageSize,
      sortBy,
      sortOrder,
      searchTerm,
      startDate,
      endDate,
      minValue,
      maxValue,
    ],
    queryFn: async () => {
      logger.info("Buscando dados financeiros brutos", {
        source: "frontend",
        context: "finance:use-get-raw-financial-data",
        tags: ["query", "financial-data"],
        data: { page, pageSize, sortBy, sortOrder, searchTerm }
      });
      
      // Construir a URL com os parâmetros de consulta
      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
      });
      
      if (searchTerm) {
        searchParams.append('search', searchTerm);
      }
      
      if (startDate) {
        searchParams.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        searchParams.append('endDate', endDate.toISOString());
      }
      
      if (minValue !== undefined) {
        searchParams.append('minValue', minValue.toString());
      }
      
      if (maxValue !== undefined) {
        searchParams.append('maxValue', maxValue.toString());
      }
      
      const url = `/api/finance/raw-data?${searchParams.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        logger.error("Falha ao buscar dados financeiros brutos", { 
          source: "frontend", 
          context: "finance:use-get-raw-financial-data", 
          tags: ["error", "api-response"],
          data: error 
        });
        throw new Error(error.message || "Falha ao buscar dados financeiros brutos");
      }
      
      const responseData = await response.json();
      
      logger.debug("Dados financeiros brutos recebidos", {
        source: "frontend",
        context: "finance:use-get-raw-financial-data",
        tags: ["response", "financial-data"],
        data: { 
          total: responseData.data.total,
          currentPage: responseData.data.currentPage,
          totalPages: responseData.data.totalPages
        }
      });
      
      return responseData.data;
    },
  });
}; 