"use client";

import { useMemo } from "react";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";
import { Investment } from "../api/use-get-investment";

export interface InvestmentFilters {
  search?: string;
  dateRange?: DateRange;
  type?: "aporte" | "retirada" | "all";
  status?: "active" | "completed" | "withdrawn" | "all";
  investorId?: string;
  minValue?: number;
  maxValue?: number;
}

export function useInvestmentFilters(
  investments: Investment[],
  filters: InvestmentFilters
) {
  const filteredInvestments = useMemo(() => {
    return investments.filter((investment) => {
      // Filtro de busca por nome do investidor
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!investment.investorName.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por período de data
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const investmentDate = parseISO(investment.date);
        
        if (filters.dateRange.from && filters.dateRange.to) {
          if (!isWithinInterval(investmentDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to
          })) {
            return false;
          }
        } else if (filters.dateRange.from) {
          if (investmentDate < filters.dateRange.from) {
            return false;
          }
        } else if (filters.dateRange.to) {
          if (investmentDate > filters.dateRange.to) {
            return false;
          }
        }
      }

      // Filtro por tipo de operação
      if (filters.type && filters.type !== "all") {
        const investmentType = (investment as any).type || 
          (investment.status === "withdrawn" ? "retirada" : "aporte");
        
        if (investmentType !== filters.type) {
          return false;
        }
      }

      // Filtro por status
      if (filters.status && filters.status !== "all") {
        if (investment.status !== filters.status) {
          return false;
        }
      }

      // Filtro por investidor
      if (filters.investorId) {
        if (investment.investorId !== filters.investorId) {
          return false;
        }
      }

      // Filtro por valor mínimo
      if (filters.minValue !== undefined) {
        const investmentValue = typeof investment.value === "string" 
          ? parseFloat(investment.value) 
          : investment.value;
        
        if (Math.abs(investmentValue) < filters.minValue) {
          return false;
        }
      }

      // Filtro por valor máximo
      if (filters.maxValue !== undefined) {
        const investmentValue = typeof investment.value === "string" 
          ? parseFloat(investment.value) 
          : investment.value;
        
        if (Math.abs(investmentValue) > filters.maxValue) {
          return false;
        }
      }

      return true;
    });
  }, [investments, filters]);

  // Estatísticas dos dados filtrados
  const filteredStats = useMemo(() => {
    const totalInvestments = filteredInvestments.length;
    
    const aportes = filteredInvestments.filter(inv => {
      const type = (inv as any).type || (inv.status === "withdrawn" ? "retirada" : "aporte");
      return type === "aporte";
    });
    
    const retiradas = filteredInvestments.filter(inv => {
      const type = (inv as any).type || (inv.status === "withdrawn" ? "retirada" : "aporte");
      return type === "retirada";
    });

    const totalAportes = aportes.reduce((sum, inv) => {
      const value = typeof inv.value === "string" ? parseFloat(inv.value) : inv.value;
      return sum + Math.abs(value);
    }, 0);

    const totalRetiradas = retiradas.reduce((sum, inv) => {
      const value = typeof inv.value === "string" ? parseFloat(inv.value) : inv.value;
      return sum + Math.abs(value);
    }, 0);

    const uniqueInvestors = new Set(filteredInvestments.map(inv => inv.investorId)).size;

    return {
      totalInvestments,
      totalAportes,
      totalRetiradas,
      netAmount: totalAportes - totalRetiradas,
      uniqueInvestors,
      aportes: aportes.length,
      retiradas: retiradas.length,
    };
  }, [filteredInvestments]);

  // Lista única de investidores para o filtro
  const uniqueInvestors = useMemo(() => {
    const investorMap = new Map();
    
    investments.forEach(inv => {
      if (!investorMap.has(inv.investorId)) {
        investorMap.set(inv.investorId, {
          id: inv.investorId,
          name: inv.investorName
        });
      }
    });
    
    return Array.from(investorMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [investments]);

  return {
    filteredInvestments,
    filteredStats,
    uniqueInvestors,
  };
} 