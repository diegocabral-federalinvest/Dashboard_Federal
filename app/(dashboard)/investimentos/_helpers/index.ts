import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Investment, InvestmentCalculation, ChartDataPoint, InvestmentStats } from "../_types";
import { DAILY_RETURN_RATE, calculatePreciseReturn } from "../_constants";
import { calculateCompoundInterest, DAILY_RATE } from "../_utils/compound-interest";

/**
 * Calcula o número de dias entre duas datas
 */
export function calculateDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return Math.max(0, differenceInDays(end, start));
}

/**
 * Processa investimentos e calcula rendimentos acumulados por investidor
 * Usa juros compostos com taxa diária FIXA
 * IMPORTANTE: O rendimento de cada linha é calculado até o próximo aporte (não até hoje)
 * Apenas o último aporte tem rendimento calculado até hoje
 */
export function calculateInvestmentReturns(investments: Investment[]): InvestmentCalculation[] {
  const results: InvestmentCalculation[] = [];
  const today = new Date();
  
  // Agrupar por investidor
  const investorGroups = investments.reduce((groups, investment) => {
    if (!groups[investment.investorId]) {
      groups[investment.investorId] = [];
    }
    groups[investment.investorId].push(investment);
    return groups;
  }, {} as Record<string, Investment[]>);

  // Processar cada investidor
  Object.entries(investorGroups).forEach(([investorId, investorInvestments]) => {
    // Ordenar por data
    const sortedInvestments = investorInvestments.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let caixaAcumulada = 0;
    let totalAportado = 0;
    let totalRetirado = 0;
    let totalRendimentoAcumulado = 0;

    sortedInvestments.forEach((investment, index) => {
      const isFirstInvestment = index === 0;
      const isLastInvestment = index === sortedInvestments.length - 1;
      const currentDate = new Date(investment.date);
      
      // Capturar o saldo inicial (caixa antes do novo aporte)
      const caixaInicial = caixaAcumulada;
      
      // Processar o aporte ou retirada
      const isAporte = investment.type === 'aporte';
      const valorOperacao = Number(investment.value);
      
      if (isAporte) {
        caixaAcumulada += valorOperacao;
        totalAportado += valorOperacao;
      } else {
        caixaAcumulada -= valorOperacao;
        totalRetirado += valorOperacao;
      }
      
      // Calcular rendimento deste aporte até o próximo (ou até hoje se for o último)
      let rendimentoDoPeriodo = 0;
      let diasDoPeriodo = 0;
      
      if (isLastInvestment) {
        // Último aporte: calcular rendimento até hoje
        const { interest, days } = calculateCompoundInterest(
          caixaAcumulada,
          currentDate,
          today,
          DAILY_RATE // Usando taxa diária fixa
        );
        rendimentoDoPeriodo = interest;
        diasDoPeriodo = days;
      } else {
        // Não é o último: calcular rendimento até o próximo aporte
        const nextInvestmentDate = new Date(sortedInvestments[index + 1].date);
        const { interest, days } = calculateCompoundInterest(
          caixaAcumulada,
          currentDate,
          nextInvestmentDate,
          DAILY_RATE // Usando taxa diária fixa
        );
        rendimentoDoPeriodo = interest;
        diasDoPeriodo = days;
      }
      
      // Acumular o rendimento total
      totalRendimentoAcumulado += rendimentoDoPeriodo;
      
      // Calcular saldo final para esta linha
      // Saldo final = caixa acumulada + rendimento do período
      const saldoFinal = caixaAcumulada + rendimentoDoPeriodo;

      // Criar registro de cálculo
      const calculation: InvestmentCalculation = {
        id: investment.id,
        investorId: investment.investorId,
        investorName: investment.investorName,
        date: investment.date,
        caixaInicial: caixaInicial,
        aporte: isAporte ? valorOperacao : -valorOperacao, // Negativo para retiradas
        totalAportado: totalAportado - totalRetirado, // Total líquido
        caixaInicialMaisAporte: caixaAcumulada, // Caixa após o aporte/retirada
        retornoPorcentagem: DAILY_RATE * 100, // Taxa diária em %
        diasRendimento: diasDoPeriodo,
        totalRetornado: totalRendimentoAcumulado, // Total de rendimentos acumulados
        caixaFinal: saldoFinal, // Saldo final com rendimento do período
        rendimentoPeriodo: rendimentoDoPeriodo // Rendimento apenas deste período
      };

      results.push(calculation);
      
      // Atualizar caixa acumulada com o rendimento para o próximo período
      if (!isLastInvestment) {
        caixaAcumulada += rendimentoDoPeriodo;
      }
    });
  });

  return results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Gera dados para o gráfico acumulado (CORRIGIDO - primeiro ponto com rendimento = 0)
 */
export function generateChartData(calculations: InvestmentCalculation[]): ChartDataPoint[] {
  if (calculations.length === 0) return [];
  
  // Ordenar por data
  const sortedCalculations = calculations.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Agrupar por data
  const dailyGroups = sortedCalculations.reduce((acc, calc) => {
    const dateKey = calc.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(calc);
    return acc;
  }, {} as Record<string, InvestmentCalculation[]>);
  
  // Variáveis acumulativas
  let acumuladoAportado = 0;
  let acumuladoRendimento = 0;
  
  const chartPoints: ChartDataPoint[] = [];
  const dateKeys = Object.keys(dailyGroups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  // Processar cada data em ordem cronológica
  dateKeys.forEach((dateKey, index) => {
    const dayCalculations = dailyGroups[dateKey];
    const isFirstPoint = index === 0;
    
    // Para cada dia, somar os novos aportes/retiradas
    dayCalculations.forEach(calc => {
      // Atualizar aportado (pode subir ou descer)
      if (calc.aporte > 0) {
        acumuladoAportado += calc.aporte; // Aporte
      } else {
        acumuladoAportado += calc.aporte; // Retirada (valor negativo)
      }
      
      // CORREÇÃO PRINCIPAL: Primeiro ponto sempre tem rendimento = 0
      if (!isFirstPoint) {
        // Rendimento só começa a acumular a partir do segundo ponto
        acumuladoRendimento += calc.rendimentoPeriodo;
      }
    });
    
    // CORREÇÃO: No primeiro ponto, forçar rendimento = 0
    if (isFirstPoint) {
      acumuladoRendimento = 0;
    }
    
    // Garantir que rendimento nunca diminua (exceto no primeiro ponto)
    if (!isFirstPoint) {
      acumuladoRendimento = Math.max(acumuladoRendimento, 
        chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].totalRendimento : 0
      );
    }
    
    // Garantir que aportado não fique negativo
    acumuladoAportado = Math.max(acumuladoAportado, 0);
    
    // Saldo total = Aportado + Rendimento
    const saldoTotal = acumuladoAportado + acumuladoRendimento;
    
    chartPoints.push({
      date: dateKey,
      saldoTotal,
      totalAportado: acumuladoAportado,
      totalRendimento: acumuladoRendimento
    });
  });
  
  return chartPoints;
}

/**
 * Calcula estatísticas gerais dos investimentos
 */
export function calculateInvestmentStats(calculations: InvestmentCalculation[]): InvestmentStats {
  const totalInvestment = calculations.reduce((sum, calc) => sum + calc.totalAportado, 0);
  const totalReturns = calculations.reduce((sum, calc) => sum + calc.totalRetornado, 0);
  const uniqueInvestors = new Set(calculations.map(calc => calc.investorId)).size;
  
  return {
    totalInvestment,
    totalReturns,
    totalWithdrawn: 0,
    activeInvestors: uniqueInvestors,
    returnPercentage: totalInvestment > 0 ? (totalReturns / totalInvestment) * 100 : 0,
    averageInvestmentPerInvestor: uniqueInvestors > 0 ? totalInvestment / uniqueInvestors : 0
  };
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date, formatStr: string = "dd/MM/yyyy"): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ptBR });
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Aplica filtros aos investimentos
 */
export function applyInvestmentFilters(
  investments: Investment[],
  filters: {
    search?: string;
    investorId?: string;
    type?: string;
    status?: string;
    dateRange?: { from: Date; to: Date };
  }
): Investment[] {
  return investments.filter(investment => {
    // Filtro por busca (nome do investidor)
    if (filters.search && !investment.investorName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Filtro por investidor
    if (filters.investorId && filters.investorId !== "all" && investment.investorId !== filters.investorId) {
      return false;
    }

    // Filtro por tipo
    if (filters.type && filters.type !== "all" && investment.type !== filters.type) {
      return false;
    }

    // Filtro por status
    if (filters.status && filters.status !== "all" && investment.status !== filters.status) {
      return false;
    }

    // Filtro por data
    if (filters.dateRange) {
      const investmentDate = new Date(investment.date);
      if (investmentDate < filters.dateRange.from || investmentDate > filters.dateRange.to) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Valida dados do formulário de investimento
 */
export function validateInvestmentForm(data: {
  investorId?: string;
  amount?: string;
  date?: Date;
}) {
  const errors: string[] = [];
  const isValidInvestor = !!data.investorId;
  const amountNum = data.amount ? parseFloat(data.amount) : NaN;
  const isValidAmount = !isNaN(amountNum) && amountNum > 0;

  if (!isValidInvestor) errors.push("Selecione um investidor");
  if (!isValidAmount) errors.push("Informe um valor válido maior que zero");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calcula projeção de rendimento futuro usando a função precisa
 */
export function calculateFutureProjection(
  currentBalance: number,
  days: number
): { futureBalance: number; totalReturn: number; dailyReturn: number } {
  const totalReturn = calculatePreciseReturn(currentBalance, days);
  const futureBalance = currentBalance + totalReturn;
  const dailyReturn = calculatePreciseReturn(currentBalance, 1);

  return {
    futureBalance,
    totalReturn,
    dailyReturn
  };
}