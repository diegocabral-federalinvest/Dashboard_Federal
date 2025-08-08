import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

interface GetTaxProjectionParams {
  year?: number;
  growth?: number;
}

export const useGetTaxProjection = (params?: GetTaxProjectionParams) => {
  const searchParams = useSearchParams();
  
  // Usar parâmetros da URL se disponíveis, caso contrário, usar os fornecidos via props
  const year = params?.year || (searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined);
  const growth = params?.growth || (searchParams.get("growth") ? parseFloat(searchParams.get("growth")!) : undefined);
  
  return useQuery({
    queryKey: ["reports", "taxes", { year, growth }],
    queryFn: async () => {
      let url = `/api/reports/taxes`;
      const queryParams = new URLSearchParams();
      
      if (year) queryParams.append("year", year.toString());
      if (growth) queryParams.append("growth", growth.toString());
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch tax projection");
      }
      
      const data = await response.json();
      return data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos - relatórios podem ter cache maior
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Usar dados existentes como placeholder
    placeholderData: (oldData) => oldData,
  });
}; 