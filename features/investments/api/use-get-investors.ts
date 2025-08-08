import { useQuery } from "@tanstack/react-query";

interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  startedInvestingAt: string | null;
  endedInvestingAt: string | null;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'pending' | 'inactive';
}

export const useGetInvestors = () => {
  const query = useQuery<Investor[]>({
    queryKey: ["investors"],
    queryFn: async () => {
      const response = await fetch("/api/investors");
      
      if (!response.ok) {
        throw new Error("Failed to fetch investors");
      }
      
      return response.json();
    },
  });

  return query;
}; 