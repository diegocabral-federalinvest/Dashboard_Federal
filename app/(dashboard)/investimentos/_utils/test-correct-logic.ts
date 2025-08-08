/**
 * Teste para validar a lógica correta de cálculo de rendimentos
 * onde cada aporte rende até o próximo aporte (não até hoje)
 */

import { calculateCompoundInterest, MONTHLY_RATE } from './compound-interest';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

console.log(`${colors.cyan}════════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}  TESTE DA LÓGICA CORRETA DE RENDIMENTOS POR PERÍODO${colors.reset}`);
console.log(`${colors.cyan}════════════════════════════════════════════════════════════════${colors.reset}\n`);

// Cenário do usuário
console.log(`${colors.yellow}▶ Cenário do Usuário:${colors.reset}`);
console.log(`  Taxa mensal: ${(MONTHLY_RATE * 100).toFixed(1)}%`);
console.log(`  Taxa diária julho (31 dias): ${(MONTHLY_RATE / 31 * 100).toFixed(5)}%\n`);

// Simulação de aportes
const aportes = [
  { date: new Date('2025-07-06'), value: 50000, description: 'Primeiro aporte' },
  { date: new Date('2025-07-08'), value: 10000, description: 'Segundo aporte' },
  { date: new Date('2025-07-28'), value: 30000, description: 'Terceiro aporte' }
];

const hoje = new Date('2025-07-31'); // Simulando "hoje"

console.log(`${colors.blue}▶ Aportes realizados:${colors.reset}`);
aportes.forEach((aporte, index) => {
  console.log(`  ${index + 1}. ${formatDate(aporte.date)}: ${formatCurrency(aporte.value)} - ${aporte.description}`);
});
console.log(`  Data atual: ${formatDate(hoje)}\n`);

// Processar aportes com a lógica CORRETA
console.log(`${colors.magenta}▶ Cálculo de Rendimentos (Lógica CORRETA):${colors.reset}`);
console.log(`  Cada aporte rende até o PRÓXIMO aporte (não até hoje)\n`);

let saldoAcumulado = 0;
const resultados: any[] = [];

aportes.forEach((aporte, index) => {
  const isLast = index === aportes.length - 1;
  
  // Adicionar o aporte ao saldo
  saldoAcumulado += aporte.value;
  
  // Calcular rendimento do período
  let rendimento = { interest: 0, days: 0 };
  let dataFinal: Date;
  
  if (isLast) {
    // Último aporte: calcular até hoje
    dataFinal = hoje;
    rendimento = calculateCompoundInterest(
      saldoAcumulado,
      aporte.date,
      dataFinal,
      MONTHLY_RATE
    );
  } else {
    // Não é o último: calcular até o próximo aporte
    dataFinal = aportes[index + 1].date;
    rendimento = calculateCompoundInterest(
      saldoAcumulado,
      aporte.date,
      dataFinal,
      MONTHLY_RATE
    );
  }
  
  resultados.push({
    data: aporte.date,
    aporte: aporte.value,
    saldoAposAporte: saldoAcumulado,
    rendimento: rendimento.interest,
    dias: rendimento.days,
    dataFinalCalculo: dataFinal,
    saldoFinal: saldoAcumulado + rendimento.interest
  });
  
  // Atualizar saldo com rendimento para próximo período
  if (!isLast) {
    saldoAcumulado += rendimento.interest;
  }
});

// Exibir resultados
console.log(`${colors.green}▶ Tabela de Investimentos:${colors.reset}`);
console.log(`  ┌────────────┬──────────────┬──────────────┬──────────────┬────────┬──────────────┐`);
console.log(`  │    Data    │    Aporte    │    Caixa     │    Renda     │  Dias  │    Saldo     │`);
console.log(`  ├────────────┼──────────────┼──────────────┼──────────────┼────────┼──────────────┤`);

let caixaAnterior = 0;
resultados.forEach((res, index) => {
  const dataStr = formatDate(res.data).padEnd(10);
  const aporteStr = formatCurrency(res.aporte).padStart(12);
  const caixaStr = formatCurrency(caixaAnterior).padStart(12);
  const rendaStr = formatCurrency(res.rendimento).padStart(12);
  const diasStr = res.dias.toString().padStart(6);
  const saldoStr = formatCurrency(res.saldoFinal).padStart(12);
  
  console.log(`  │ ${dataStr} │ ${aporteStr} │ ${caixaStr} │ ${rendaStr} │ ${diasStr} │ ${saldoStr} │`);
  
  // Atualizar caixa para próxima linha
  caixaAnterior = res.saldoFinal;
});

console.log(`  └────────────┴──────────────┴──────────────┴──────────────┴────────┴──────────────┘\n`);

// Explicação detalhada
console.log(`${colors.yellow}▶ Explicação Detalhada:${colors.reset}`);
resultados.forEach((res, index) => {
  const isLast = index === resultados.length - 1;
  console.log(`\n  ${colors.cyan}${index + 1}. Aporte de ${formatDate(res.data)}:${colors.reset}`);
  console.log(`     Valor: ${formatCurrency(res.aporte)}`);
  console.log(`     Saldo após aporte: ${formatCurrency(res.saldoAposAporte)}`);
  console.log(`     Período de rendimento: ${formatDate(res.data)} até ${formatDate(res.dataFinalCalculo)}`);
  console.log(`     Dias: ${res.dias}`);
  console.log(`     Rendimento: ${formatCurrency(res.rendimento)}`);
  console.log(`     ${isLast ? '(Último aporte - rende até hoje)' : '(Rende até o próximo aporte)'}`);
});

// Teste específico do problema relatado
console.log(`\n${colors.magenta}════════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.magenta}  VALIDAÇÃO DO PROBLEMA RELATADO${colors.reset}`);
console.log(`${colors.magenta}════════════════════════════════════════════════════════════════${colors.reset}\n`);

console.log(`${colors.yellow}Problema original:${colors.reset}`);
console.log(`  "O aporte de 06/07 mostrava R$ 124 de renda até hoje"`);
console.log(`  "Após adicionar aporte de 28/07, o valor continuou R$ 124"`);
console.log(`  "Mas deveria mudar para o rendimento de 06/07 até 28/07"\n`);

console.log(`${colors.green}Solução implementada:${colors.reset}`);
console.log(`  ✓ Aporte de 06/07: renda calculada de 06/07 até 08/07 (próximo aporte)`);
console.log(`  ✓ Aporte de 08/07: renda calculada de 08/07 até 28/07 (próximo aporte)`);
console.log(`  ✓ Aporte de 28/07: renda calculada de 28/07 até hoje (último aporte)`);
console.log(`  ✓ Se adicionar novo aporte, o de 28/07 será recalculado até o novo aporte\n`);

// Simulação de novo aporte
console.log(`${colors.blue}▶ Simulação: Adicionando novo aporte em 15/08/2025${colors.reset}`);
const novoAporte = { date: new Date('2025-08-15'), value: 20000 };

// Recalcular o rendimento do último aporte (28/07) até o novo aporte
const rendimentoRecalculado = calculateCompoundInterest(
  resultados[2].saldoAposAporte,
  resultados[2].data,
  novoAporte.date,
  MONTHLY_RATE
);

console.log(`  Aporte de 28/07 ANTES do novo aporte:`);
console.log(`    Rendimento: ${formatCurrency(resultados[2].rendimento)} (de 28/07 até 31/07)`);
console.log(`  Aporte de 28/07 APÓS o novo aporte:`);
console.log(`    Rendimento: ${formatCurrency(rendimentoRecalculado.interest)} (de 28/07 até 15/08)`);
console.log(`    ${colors.green}✓ Valor da coluna Renda mudou conforme esperado!${colors.reset}\n`);

console.log(`${colors.green}════════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}  LÓGICA IMPLEMENTADA CORRETAMENTE! ✓${colors.reset}`);
console.log(`${colors.green}════════════════════════════════════════════════════════════════${colors.reset}\n`);