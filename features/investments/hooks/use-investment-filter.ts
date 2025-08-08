import { useMemo } from 'react';
import { Investment } from "../api/use-get-investment";

type FilterOptions = {
  status?: Investment['status'] | 'all';
  investorId?: string;
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  minValue?: number;
  maxValue?: number;
};

export const useInvestmentFilter = (investments: Investment[] = []) => {
  /**
   * Filtra investimentos com base em vários critérios
   */
  const filterInvestments = (options: FilterOptions = {}) => {
    const {
      status = 'all',
      investorId,
      search = '',
      dateRange,
      minValue,
      maxValue
    } = options;

    return investments.filter(investment => {
      // Filtrar por status
      if (status !== 'all' && investment.status !== status) {
        return false;
      }

      // Filtrar por investidor
      if (investorId && investment.investorId !== investorId) {
        return false;
      }

      // Filtrar por termo de busca (nome do investidor ou descrição)
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = investment.investorName.toLowerCase().includes(searchLower);
        const matchesDescription = investment.description.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      // Filtrar por intervalo de data
      if (dateRange) {
        const investmentDate = new Date(investment.date);
        
        if (dateRange.start && investmentDate < dateRange.start) {
          return false;
        }
        
        if (dateRange.end) {
          const endDateWithDay = new Date(dateRange.end);
          endDateWithDay.setHours(23, 59, 59, 999); // Final do dia
          
          if (investmentDate > endDateWithDay) {
            return false;
          }
        }
      }

      // Filtrar por valor mínimo
      if (minValue !== undefined) {
        const investmentValue = typeof investment.value === 'string' 
          ? parseFloat(investment.value) 
          : investment.value;
          
        if (investmentValue < minValue) {
          return false;
        }
      }

      // Filtrar por valor máximo
      if (maxValue !== undefined) {
        const investmentValue = typeof investment.value === 'string' 
          ? parseFloat(investment.value) 
          : investment.value;
          
        if (investmentValue > maxValue) {
          return false;
        }
      }

      // Passou por todos os filtros
      return true;
    });
  };

  /**
   * Agrupa investimentos por investidor
   */
  const groupByInvestor = (filteredInvestments = investments) => {
    return filteredInvestments.reduce((groups, investment) => {
      const { investorId, investorName } = investment;
      
      if (!groups[investorId]) {
        groups[investorId] = {
          investorId,
          investorName,
          investments: []
        };
      }
      
      groups[investorId].investments.push(investment);
      return groups;
    }, {} as Record<string, { investorId: string; investorName: string; investments: Investment[] }>);
  };

  /**
   * Lista investidores únicos
   */
  const getUniqueInvestors = useMemo(() => {
    const investors = new Map<string, string>();
    
    investments.forEach(investment => {
      if (!investors.has(investment.investorId)) {
        investors.set(investment.investorId, investment.investorName);
      }
    });
    
    return Array.from(investors).map(([id, name]) => ({ id, name }));
  }, [investments]);

  return {
    filterInvestments,
    groupByInvestor,
    getUniqueInvestors
  };
}; 