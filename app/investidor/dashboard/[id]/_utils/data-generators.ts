import { Investment } from "@/features/investments/api/use-get-investment";
import { format, subDays, addDays, startOfMonth, endOfMonth, eachMonthOfInterval, eachWeekOfInterval, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { InvestmentFlowRecord } from "../_types";
import type { InvestmentRowData } from "../constants";
import type { DateRange } from "react-day-picker";

// Tipo para filtro de período (sem custom)
type PeriodFilter = "today" | "week" | "month" | "3months" | "6months" | "year";

// Função para gerar dados do gráfico
export function generateChartData(investments: Investment[], days = 30) {
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = subDays(new Date(), i);
    let totalValue = 0;
    let totalInvestedAtDate = 0;
    let totalReturns = 0;
    
    investments.forEach(investment => {
      const investmentStartDate = new Date(investment.startDate);
      
      if (investmentStartDate <= targetDate && investment.status !== 'withdrawn') {
        // Placeholder - será substituído no componente que chama essa função
        const investmentValue = typeof investment.value === 'string' 
          ? parseFloat(investment.value) 
          : investment.value;
        totalInvestedAtDate += investmentValue;
        totalValue += investmentValue * 1.1; // Simular crescimento
        totalReturns += investmentValue * 0.1;
      }
    });
    
    data.push({
      date: format(targetDate, "dd/MM", { locale: ptBR }),
      value: totalValue,
      invested: totalInvestedAtDate,
      returns: totalReturns,
    });
  }
  
  return data;
}

// Função para processar dados para tabela de fluxo de investimentos
export function generateTableData(
  investments: Investment[], 
  calculateReturn: (investment: Investment) => any
): InvestmentFlowRecord[] {
  if (!investments || investments.length === 0) return [];
  
  const sortedInvestments = [...investments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let saldoAcumulado = 0;
  let totalAportadoAcumulado = 0;
  let totalRetornadoAcumulado = 0;
  
  return sortedInvestments.map((investment) => {
    const investmentValue = typeof investment.value === 'string' 
      ? parseFloat(investment.value) 
      : investment.value;
    
    const caixaInicial = saldoAcumulado;
    const aporte = investment.status === 'withdrawn' ? -Math.abs(investmentValue) : investmentValue;
    
    totalAportadoAcumulado += aporte;
    const caixaAporte = caixaInicial + aporte;
    
    // Calcular retorno mensal (1,2% ao mês ≈ 0,04% ao dia)
    const returns = calculateReturn(investment);
    const retornoMensal = returns.earned;
    
    totalRetornadoAcumulado += retornoMensal;
    const caixaFinal = totalAportadoAcumulado + totalRetornadoAcumulado;
    
    saldoAcumulado = caixaFinal;
    
    return {
      id: investment.id,
      date: format(new Date(investment.date), "dd/MM/yyyy", { locale: ptBR }),
      caixaInicial,
      aporte,
      totalAportado: totalAportadoAcumulado,
      caixaAporte,
      retornoMensal,
      totalRetornado: totalRetornadoAcumulado,
      caixaFinal,
    };
  });
} 

// Função para gerar dados simulados da tabela de investimentos
export function generateInvestmentTableData(count: number = 100): InvestmentRowData[] {
  const data: InvestmentRowData[] = [];
  const types = ["Aporte", "Resgate", "Rendimento"] as const;
  const statuses = ["Concluído", "Pendente", "Cancelado"] as const;
  
  for (let i = 0; i < count; i++) {
    const randomDays = Math.floor(Math.random() * 365);
    const date = format(subDays(new Date(), randomDays), "dd/MM/yyyy", { locale: ptBR });
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let value = 0;
    let returnValue = "";
    
    switch (type) {
      case "Aporte":
        value = Math.floor(Math.random() * 10000) + 1000; // R$ 1.000 a R$ 11.000
        const monthsInvested = Math.floor(Math.random() * 12) + 1;
        const totalReturn = monthsInvested * 1.2; // 1.2% ao mês
        returnValue = `+${totalReturn.toFixed(2)}%`;
        break;
      case "Resgate":
        value = Math.floor(Math.random() * 5000) + 500; // R$ 500 a R$ 5.500
        returnValue = `0.00%`;
        break;
      case "Rendimento":
        value = Math.floor(Math.random() * 500) + 50; // R$ 50 a R$ 550
        const rendimentoPercentage = Math.random() * 2 + 0.5; // 0.5% a 2.5%
        returnValue = `+${rendimentoPercentage.toFixed(2)}%`;
        break;
    }
    
    data.push({
      id: `inv_${i + 1}`,
      date,
      type,
      value,
      return: returnValue,
      status,
    });
  }
  
  return data.sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());
}

// Função aprimorada para gerar dados do gráfico baseado no período com duas variáveis
export function generateChartDataByPeriod(period: PeriodFilter, dateRange?: DateRange) {
  const endDate = new Date();
  let startDate: Date;
  let intervals: Date[] = [];
  let formatPattern = "dd/MM";
  
  // Definir período e intervalos baseados no filtro
  switch (period) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      // Para hoje, criar intervalos de hora em hora
      for (let i = 0; i < 24; i++) {
        const hourDate = new Date(startDate);
        hourDate.setHours(i);
        intervals.push(hourDate);
      }
      formatPattern = "HH:mm";
      break;
      
    case "week":
      startDate = subDays(endDate, 7);
      // Para semana, um ponto por dia
      for (let i = 0; i <= 7; i++) {
        intervals.push(addDays(startDate, i));
      }
      break;
      
    case "month":
      startDate = subDays(endDate, 30);
      // Para mês, intervalos semanais
      const weeklyIntervals = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
      intervals = weeklyIntervals.length > 0 ? weeklyIntervals : [startDate, endDate];
      break;
      
    case "3months":
      startDate = subDays(endDate, 90);
      // Para 3 meses, intervalos semanais
      const weekly3m = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
      intervals = weekly3m.length > 0 ? weekly3m : [startDate, endDate];
      break;
      
    case "6months":
      startDate = subDays(endDate, 180);
      // Para 6 meses, intervalos mensais
      const monthly6m = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) });
      intervals = monthly6m.length > 0 ? monthly6m : [startDate, endDate];
      formatPattern = "MMM";
      break;
      
    case "year":
      startDate = subDays(endDate, 365);
      // Para 1 ano, intervalos mensais
      const monthlyYear = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) });
      intervals = monthlyYear.length > 0 ? monthlyYear : [startDate, endDate];
      formatPattern = "MMM/yy";
      break;
      
    default:
      startDate = subDays(endDate, 30);
      const defaultWeekly = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
      intervals = defaultWeekly.length > 0 ? defaultWeekly : [startDate, endDate];
  }
  
  // Valores base para simulação
  const baseInvested = 37221; // Total investido base
  const monthlyReturn = 1.2; // 1.2% ao mês
  
  return intervals.map((date, index) => {
    // Calcular tempo decorrido desde o início em meses
    const monthsElapsed = Math.max(0, (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    // Simular aportes progressivos (investimento crescendo ao longo do tempo)
    const totalInvested = baseInvested + (monthsElapsed * 2000); // R$ 2.000 de aporte por mês
    
    // Calcular rendimento acumulado
    const monthlyGrowthRate = monthlyReturn / 100; // 1.2% convertido para decimal
    const accumulatedReturn = totalInvested * Math.pow(1 + monthlyGrowthRate, monthsElapsed) - totalInvested;
    
    // Saldo atual = total investido + rendimento acumulado
    const currentBalance = totalInvested + accumulatedReturn;
    
    // Adicionar uma pequena variação aleatória para realismo
    const randomVariation = (Math.random() - 0.5) * 0.02; // ±1% de variação
    const finalBalance = currentBalance * (1 + randomVariation);
    
    return {
      date: format(date, formatPattern, { locale: ptBR }),
      currentBalance: Math.round(finalBalance * 100) / 100, // Saldo atual
      totalInvested: Math.round(totalInvested * 100) / 100, // Total investido
      returns: Math.round(accumulatedReturn * 100) / 100,   // Rendimentos
      time: format(date, "HH:mm", { locale: ptBR })
    };
  });
}