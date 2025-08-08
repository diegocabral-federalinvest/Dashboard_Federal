import { Investment } from "../api/use-get-investment";

// Constante para a taxa de retorno diário padrão (aproximadamente 15% ao ano)
// Cálculo: (1.15)^(1/365) - 1 = 0.000383 ≈ 0.0004 (0.04% ao dia)
export const DEFAULT_DAILY_RATE = 0.0004;

interface InvestmentReturnOptions {
  currentDate?: Date;
  useCustomRate?: boolean;
}

export const useInvestmentReturn = () => {
  /**
   * Calcula o retorno de um investimento com base na data de início 
   * e na taxa de retorno diária, considerando aportes e retiradas
   */
  const calculateReturn = (
    investment: Investment,
    options: InvestmentReturnOptions = {}
  ) => {
    const { currentDate = new Date(), useCustomRate = false } = options;
    
    // Usar a taxa de retorno do investimento ou a padrão
    const rate = useCustomRate && investment.returnRate 
      ? investment.returnRate 
      : DEFAULT_DAILY_RATE;
    
    // Converter o valor do investimento para número se for string
    let principal = typeof investment.value === 'string' 
      ? parseFloat(investment.value) 
      : investment.value;
    
    // Garantir que o principal seja sempre positivo (valor absoluto)
    principal = Math.abs(principal);
    
    // Calcular os dias desde o início do investimento
    const startDate = new Date(investment.startDate);
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysDiff = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
    
    // Determinar o tipo de operação (nova implementação)
    const operationType = (investment as any).type || 
      (investment.status === 'withdrawn' ? 'retirada' : 'aporte');
    
    // Retiradas não geram rendimento, apenas reduzem o saldo
    if (operationType === 'retirada' || investment.status === 'withdrawn') {
      return {
        principal,
        earned: 0,
        total: principal, // Para retiradas, mostramos o valor retirado
        daysActive: daysDiff,
        dailyRate: rate,
        isActive: false,
        type: 'retirada'
      };
    }
    
    // Apenas aportes geram rendimento
    if (operationType === 'aporte' && investment.status === 'active') {
      // Cálculo do retorno acumulado: P(1 + r)^n
      const earned = principal * (Math.pow(1 + rate, daysDiff) - 1);
      const total = principal + earned;
      
      return {
        principal,
        earned,
        total,
        daysActive: daysDiff,
        dailyRate: rate,
        isActive: true,
        type: 'aporte'
      };
    }
    
    // Para outros casos (completed), não gerar rendimento adicional
    return {
      principal,
      earned: 0,
      total: principal,
      daysActive: daysDiff,
      dailyRate: rate,
      isActive: investment.status === 'active',
      type: operationType
    };
  };
  
  /**
   * Calcula o retorno para múltiplos investimentos
   */
  const calculateMultipleReturns = (
    investments: Investment[],
    options: InvestmentReturnOptions = {}
  ) => {
    return investments.map(inv => calculateReturn(inv, options));
  };
  
  /**
   * Fornece estatísticas agregadas sobre múltiplos investimentos
   * Considera aportes e retiradas separadamente
   */
  const getInvestmentStats = (investments: Investment[], options: InvestmentReturnOptions = {}) => {
    const returns = calculateMultipleReturns(investments, options);
    
    // Separar aportes e retiradas
    const aportes = returns.filter(item => (item as any).type === 'aporte');
    const retiradas = returns.filter(item => (item as any).type === 'retirada');
    
    // Calcular totais de aportes (apenas aportes ativos geram rendimento)
    const totalAportes = aportes.reduce((sum, item) => sum + item.principal, 0);
    const totalRetiradas = retiradas.reduce((sum, item) => sum + item.principal, 0);
    
    // Saldo líquido (aportes - retiradas)
    const netPrincipal = totalAportes - totalRetiradas;
    
    // Rendimentos apenas dos aportes ativos
    const activeAportes = aportes.filter(item => item.isActive);
    const totalEarned = activeAportes.reduce((sum, item) => sum + item.earned, 0);
    
    // Valor total atual
    const totalValue = netPrincipal + totalEarned;
    
    return {
      totalInvestments: investments.length,
      totalPrincipal: netPrincipal, // Saldo líquido
      totalAportes, // Total de aportes
      totalRetiradas, // Total de retiradas
      totalEarned, // Rendimentos dos aportes ativos
      totalValue, // Valor total atual
      percentageReturn: totalAportes > 0 ? (totalEarned / totalAportes) * 100 : 0,
      activeInvestments: activeAportes.length,
      totalActivePrincipal: totalAportes, // Principal dos aportes ativos
      totalActiveEarned: totalEarned,
      averageDailyReturn: DEFAULT_DAILY_RATE * 100, // Percentual para exibição
      dailyRate: DEFAULT_DAILY_RATE
    };
  };
  
  return {
    calculateReturn,
    calculateMultipleReturns,
    getInvestmentStats,
    DEFAULT_DAILY_RATE
  };
}; 