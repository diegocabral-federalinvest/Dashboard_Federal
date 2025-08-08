/**
 * Utilitários para cálculo de juros compostos com taxa diária fixa
 * Implementa a lógica correta de rendimentos diários com juros compostos
 */

import { differenceInDays } from 'date-fns';

// Taxa diária FIXA (0.0394520548% ao dia)
// Equivale a aproximadamente 15.4% ao ano com juros compostos
export const DAILY_RATE = 0.000394520548;

// Taxa mensal para exibição (deprecated - mantida apenas para compatibilidade)
export const MONTHLY_RATE = 0.012;

/**
 * Calcula o montante com juros compostos usando taxa diária fixa
 * @param principal Valor principal (capital inicial)
 * @param startDate Data inicial do investimento
 * @param endDate Data final para cálculo
 * @param dailyRate Taxa diária fixa (padrão: 0.0394520548%)
 * @returns Objeto com montante final e rendimento
 */
export function calculateCompoundInterest(
  principal: number,
  startDate: Date,
  endDate: Date,
  dailyRate: number = DAILY_RATE
): { amount: number; interest: number; days: number } {
  
  // Se as datas são iguais ou inválidas, não há rendimento
  if (startDate >= endDate || principal <= 0) {
    return { amount: principal, interest: 0, days: 0 };
  }

  // Calcular número de dias entre as datas
  const days = differenceInDays(endDate, startDate);
  
  if (days <= 0) {
    return { amount: principal, interest: 0, days: 0 };
  }

  // Aplicar juros compostos: Montante = Principal * (1 + taxa)^dias
  const amount = principal * Math.pow(1 + dailyRate, days);
  const interest = amount - principal;
  
  return {
    amount: amount,
    interest: interest,
    days: days
  };
}

/**
 * Calcula o saldo líquido individual com rendimentos compostos
 * Baseado na lógica fornecida pelo usuário
 * @param contributions Lista de aportes com data e valor
 * @param currentDate Data atual para cálculo (padrão: hoje)
 * @returns Saldo total com rendimentos
 */
export async function calculateIndividualNetBalance(
  contributions: Array<{ date: Date; value: number; type: 'aporte' | 'retirada' }>,
  currentDate: Date = new Date()
): Promise<number> {
  let totalBalance = 0;
  let lastContributionDate: Date | null = null;

  // Ordenar contribuições por data
  const sortedContributions = [...contributions].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  for (const contribution of sortedContributions) {
    const contributionDate = contribution.date;
    
    // Se não é a primeira contribuição, calcular rendimento do período
    if (lastContributionDate && totalBalance > 0) {
      const timeDifference = contributionDate.getTime() - lastContributionDate.getTime();
      const daysPassed = timeDifference / (1000 * 60 * 60 * 24);
      
      // Aplicar juros compostos para o período
      if (daysPassed > 0) {
        totalBalance = totalBalance * Math.pow(1 + DAILY_RATE, daysPassed);
      }
    }
    
    // Adicionar ou subtrair o valor da contribuição
    if (contribution.type === 'aporte') {
      totalBalance += contribution.value;
    } else {
      totalBalance -= contribution.value;
    }
    
    lastContributionDate = contributionDate;
  }

  // Calcular rendimento desde a última contribuição até hoje
  if (lastContributionDate && totalBalance > 0) {
    const timeDifference = currentDate.getTime() - lastContributionDate.getTime();
    const daysPassed = timeDifference / (1000 * 60 * 60 * 24);
    
    if (daysPassed > 0) {
      totalBalance = totalBalance * Math.pow(1 + DAILY_RATE, daysPassed);
    }
  }

  return totalBalance;
}

/**
 * Calcula o rendimento acumulado de múltiplos aportes
 * Versão simplificada usando taxa diária fixa
 */
export function calculateMultipleContributions(
  contributions: Array<{ date: Date; value: number; type: 'aporte' | 'retirada' }>,
  currentDate: Date = new Date()
) {
  const sortedContributions = [...contributions].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  let accumulatedBalance = 0;
  let totalContributed = 0;
  let totalWithdrawn = 0;
  const results = [];

  for (let i = 0; i < sortedContributions.length; i++) {
    const contribution = sortedContributions[i];
    const contributionDate = contribution.date;
    const isLast = i === sortedContributions.length - 1;
    
    // Caixa inicial (saldo antes do novo aporte/retirada)
    const initialBalance = accumulatedBalance;
    
    // Calcular rendimento do saldo acumulado desde o último aporte até este
    let periodInterest = 0;
    let periodDays = 0;
    
    if (i > 0 && accumulatedBalance > 0) {
      const lastDate = sortedContributions[i - 1].date;
      const { interest, days } = calculateCompoundInterest(
        accumulatedBalance,
        lastDate,
        contributionDate
      );
      periodInterest = interest;
      periodDays = days;
      accumulatedBalance += interest;
    }
    
    // Aplicar o aporte ou retirada
    const isAporte = contribution.type === 'aporte';
    const contributionValue = contribution.value;
    
    if (isAporte) {
      accumulatedBalance += contributionValue;
      totalContributed += contributionValue;
    } else {
      accumulatedBalance -= contributionValue;
      totalWithdrawn += contributionValue;
    }
    
    // Calcular rendimento até o próximo aporte ou até hoje (se for o último)
    let futureInterest = 0;
    let futureDays = 0;
    
    if (isLast) {
      // Último aporte: calcular até hoje
      const { interest, days } = calculateCompoundInterest(
        accumulatedBalance,
        contributionDate,
        currentDate
      );
      futureInterest = interest;
      futureDays = days;
    } else {
      // Calcular até o próximo aporte
      const nextDate = sortedContributions[i + 1].date;
      const { interest, days } = calculateCompoundInterest(
        accumulatedBalance,
        contributionDate,
        nextDate
      );
      futureInterest = interest;
      futureDays = days;
    }
    
    results.push({
      date: contributionDate,
      type: contribution.type,
      initialBalance: initialBalance,
      contribution: contributionValue,
      totalContributed: totalContributed,
      totalWithdrawn: totalWithdrawn,
      periodInterest: futureInterest,
      periodDays: futureDays,
      currentBalance: accumulatedBalance + futureInterest,
      finalBalance: accumulatedBalance
    });
    
    // Atualizar saldo para próxima iteração (se não for o último)
    if (!isLast) {
      accumulatedBalance += futureInterest;
    }
  }
  
  return results;
}

/**
 * Formata a taxa para exibição
 * @param rate Taxa decimal (ex: 0.000394520548)
 * @param decimals Número de casas decimais
 * @returns String formatada (ex: "0.0395%")
 */
export function formatRate(rate: number, decimals: number = 4): string {
  return `${(rate * 100).toFixed(decimals)}%`;
}

/**
 * Calcula a taxa anual equivalente a partir da taxa diária
 * @param dailyRate Taxa diária (ex: 0.000394520548)
 * @returns Taxa anual equivalente
 */
export function getAnnualRateFromDaily(dailyRate: number = DAILY_RATE): number {
  // Fórmula: (1 + taxa_diária)^365 - 1
  return Math.pow(1 + dailyRate, 365) - 1;
}

/**
 * Valida se uma data é válida para cálculo
 * @param date Data a ser validada
 * @returns true se a data é válida
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Exemplo de uso da função principal
 * 
 * const result = calculateCompoundInterest(
 *   100000,                    // R$ 100.000,00
 *   new Date('2025-01-30'),    // Data inicial
 *   new Date('2025-01-31'),    // Data final (hoje)
 *   0.012                      // 1.2% ao mês
 * );
 * 
 * console.log(`Montante: R$ ${result.amount.toFixed(2)}`);
 * console.log(`Rendimento: R$ ${result.interest.toFixed(2)}`);
 * console.log(`Dias: ${result.days}`);
 */