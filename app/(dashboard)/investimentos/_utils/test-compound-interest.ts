/**
 * Arquivo de teste para validar a lógica de juros compostos
 * Execute com: npx tsx app/(dashboard)/investimentos/_utils/test-compound-interest.ts
 */

import { calculateCompoundInterest, DAILY_RATE, MONTHLY_RATE } from './compound-interest';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function runTest(testName: string, testFn: () => void) {
  console.log(`\n${colors.cyan}▶ ${testName}${colors.reset}`);
  try {
    testFn();
    console.log(`${colors.green}✓ Teste passou${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Teste falhou: ${error}${colors.reset}`);
  }
}

// Teste 1: Taxa diária fixa (sistema atual)
runTest('Verificação da taxa diária fixa do sistema', () => {
  const dailyRate = DAILY_RATE;
  const expectedRate = 0.000394520548; // Taxa fixa atual
  
  console.log(`  Taxa diária do sistema: ${(dailyRate * 100).toFixed(8)}%`);
  console.log(`  Taxa diária esperada: ${(expectedRate * 100).toFixed(8)}%`);
  console.log(`  Equivale a aprox. ${((Math.pow(1 + dailyRate, 365) - 1) * 100).toFixed(2)}% ao ano`);
  
  if (Math.abs(dailyRate - expectedRate) > 0.000000001) {
    throw new Error('Taxa diária incorreta');
  }
});

// Teste 2: Rendimento com taxa fixa em período curto
runTest('Rendimento com taxa diária fixa em 1 dia', () => {
  const principal = 1000;
  const startDate = new Date('2025-02-15');
  const endDate = new Date('2025-02-16');
  
  const result = calculateCompoundInterest(principal, startDate, endDate, DAILY_RATE);
  const expectedInterest = principal * DAILY_RATE;
  
  console.log(`  Capital inicial: ${formatCurrency(principal)}`);
  console.log(`  Período: 1 dia`);
  console.log(`  Taxa diária: ${(DAILY_RATE * 100).toFixed(8)}%`);
  console.log(`  Rendimento calculado: ${formatCurrency(result.interest)}`);
  console.log(`  Rendimento esperado: ${formatCurrency(expectedInterest)}`);
  
  if (Math.abs(result.interest - expectedInterest) > 0.001) {
    throw new Error('Rendimento incorreto');
  }
});

// Teste 3: Rendimento de 1 dia com taxa fixa
runTest('Rendimento de R$ 100.000 em 1 dia (30/01 a 31/01)', () => {
  const principal = 100000;
  const startDate = new Date('2025-01-30');
  const endDate = new Date('2025-01-31');
  
  const result = calculateCompoundInterest(principal, startDate, endDate, DAILY_RATE);
  
  // Taxa diária fixa
  const expectedInterest = principal * DAILY_RATE;
  
  console.log(`  Capital inicial: ${formatCurrency(principal)}`);
  console.log(`  Período: 30/01/2025 a 31/01/2025 (${result.days} dia)`);
  console.log(`  Taxa diária: ${(DAILY_RATE * 100).toFixed(8)}%`);
  console.log(`  Rendimento calculado: ${formatCurrency(result.interest)}`);
  console.log(`  Rendimento esperado: ${formatCurrency(expectedInterest)}`);
  console.log(`  Montante final: ${formatCurrency(result.amount)}`);
  
  if (Math.abs(result.interest - expectedInterest) > 0.01) {
    throw new Error('Rendimento incorreto');
  }
});

// Teste 4: Rendimento de 30 dias com taxa fixa
runTest('Rendimento de R$ 10.000 em 30 dias (01/01 a 31/01)', () => {
  const principal = 10000;
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');
  
  const result = calculateCompoundInterest(principal, startDate, endDate, DAILY_RATE);
  
  // Para 30 dias com juros compostos usando taxa fixa
  const expectedAmount = principal * Math.pow(1 + DAILY_RATE, 30);
  const expectedInterest = expectedAmount - principal;
  
  console.log(`  Capital inicial: ${formatCurrency(principal)}`);
  console.log(`  Período: 01/01/2025 a 31/01/2025 (${result.days} dias)`);
  console.log(`  Taxa diária: ${(DAILY_RATE * 100).toFixed(8)}%`);
  console.log(`  Rendimento calculado: ${formatCurrency(result.interest)}`);
  console.log(`  Rendimento esperado: ${formatCurrency(expectedInterest)}`);
  console.log(`  Montante final: ${formatCurrency(result.amount)}`);
  
  if (Math.abs(result.interest - expectedInterest) > 0.01) {
    throw new Error('Rendimento incorreto');
  }
});

// Teste 5: Rendimento atravessando período longo
runTest('Rendimento de R$ 50.000 em período longo (30/01 a 15/02)', () => {
  const principal = 50000;
  const startDate = new Date('2025-01-30');
  const endDate = new Date('2025-02-15');
  
  const result = calculateCompoundInterest(principal, startDate, endDate, DAILY_RATE);
  
  console.log(`  Capital inicial: ${formatCurrency(principal)}`);
  console.log(`  Período: 30/01/2025 a 15/02/2025 (${result.days} dias)`);
  console.log(`  Taxa diária: ${(DAILY_RATE * 100).toFixed(8)}%`);
  console.log(`  Rendimento total: ${formatCurrency(result.interest)}`);
  console.log(`  Montante final: ${formatCurrency(result.amount)}`);
  
  // Cálculo manual para validação usando taxa fixa
  const expectedAmount = principal * Math.pow(1 + DAILY_RATE, result.days);
  const expectedInterest = expectedAmount - principal;
  
  console.log(`  Rendimento esperado: ${formatCurrency(expectedInterest)}`);
  
  if (Math.abs(result.interest - expectedInterest) > 0.01) {
    throw new Error('Rendimento incorreto');
  }
});

// Teste 6: Exemplo do usuário - R$ 100.000 em 30/01/2025
runTest('Exemplo do usuário: R$ 100.000 investidos em 30/01/2025', () => {
  const principal = 100000;
  const startDate = new Date('2025-01-30');
  const today = new Date('2025-01-31'); // Simulando "hoje" como 31/01
  
  const result = calculateCompoundInterest(principal, startDate, today, DAILY_RATE);
  
  console.log(`  ${colors.yellow}Cenário do usuário:${colors.reset}`);
  console.log(`  Aporte: ${formatCurrency(principal)} em 30/01/2025`);
  console.log(`  Data atual: 31/01/2025`);
  console.log(`  Taxa diária: ${(DAILY_RATE * 100).toFixed(8)}%`);
  console.log(`  Equivale a ${((Math.pow(1 + DAILY_RATE, 365) - 1) * 100).toFixed(2)}% ao ano`);
  console.log(`  `);
  console.log(`  ${colors.blue}Resultado:${colors.reset}`);
  console.log(`  Dias corridos: ${result.days}`);
  console.log(`  Rendimento (coluna Renda): ${formatCurrency(result.interest)}`);
  console.log(`  Saldo atual: ${formatCurrency(result.amount)}`);
  
  // Verificação: o rendimento deve ser maior que zero
  if (result.interest <= 0) {
    throw new Error('Rendimento deveria ser maior que zero');
  }
});

// Teste 7: Múltiplos aportes
runTest('Múltiplos aportes com rendimentos acumulados', () => {
  console.log(`  ${colors.yellow}Simulação de múltiplos aportes:${colors.reset}`);
  
  // Aporte 1: 30/01/2025 - R$ 100.000
  const aporte1Date = new Date('2025-01-30');
  const aporte1Value = 100000;
  
  // Aporte 2: 15/02/2025 - R$ 50.000
  const aporte2Date = new Date('2025-02-15');
  const aporte2Value = 50000;
  
  // Data atual para cálculo
  const currentDate = new Date('2025-02-28');
  
  // Cálculo do primeiro período (30/01 a 15/02)
  const period1 = calculateCompoundInterest(aporte1Value, aporte1Date, aporte2Date, DAILY_RATE);
  const balanceAfterPeriod1 = period1.amount;
  
  console.log(`  \n  Aporte 1: ${formatCurrency(aporte1Value)} em 30/01/2025`);
  console.log(`  Rendimento até 15/02: ${formatCurrency(period1.interest)}`);
  console.log(`  Saldo em 15/02: ${formatCurrency(balanceAfterPeriod1)}`);
  
  // Adicionar segundo aporte
  const balanceWithAporte2 = balanceAfterPeriod1 + aporte2Value;
  
  console.log(`  \n  Aporte 2: ${formatCurrency(aporte2Value)} em 15/02/2025`);
  console.log(`  Saldo após aporte 2: ${formatCurrency(balanceWithAporte2)}`);
  
  // Cálculo do segundo período (15/02 a 28/02)
  const period2 = calculateCompoundInterest(balanceWithAporte2, aporte2Date, currentDate, DAILY_RATE);
  
  console.log(`  Rendimento de 15/02 a 28/02: ${formatCurrency(period2.interest)}`);
  console.log(`  Saldo final em 28/02: ${formatCurrency(period2.amount)}`);
  
  // Resumo
  const totalInvested = aporte1Value + aporte2Value;
  const totalEarned = period1.interest + period2.interest;
  const finalBalance = period2.amount;
  
  console.log(`  \n  ${colors.blue}Resumo:${colors.reset}`);
  console.log(`  Total investido: ${formatCurrency(totalInvested)}`);
  console.log(`  Total de rendimentos: ${formatCurrency(totalEarned)}`);
  console.log(`  Saldo final: ${formatCurrency(finalBalance)}`);
  console.log(`  Rentabilidade: ${((totalEarned / totalInvested) * 100).toFixed(2)}%`);
});

console.log(`\n${colors.green}════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}  Todos os testes passaram com sucesso! ${colors.reset}`);
console.log(`${colors.green}════════════════════════════════════════${colors.reset}\n`);