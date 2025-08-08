#!/usr/bin/env node

/**
 * 🧪 Script para Testar Bugs do DRE
 * 
 * Script para executar testes automatizados e detectar os bugs reportados
 * nas tabs Mensal e Trimestral do sistema de deduções fiscais.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configurações
const CONFIG = {
  testTimeout: 60000, // 60 segundos
  retries: 2,
  verbose: true,
  headless: process.env.CI === 'true' || process.env.HEADLESS === 'true',
  baseURL: process.env.TEST_URL || 'http://localhost:3000'
};

console.log(chalk.blue.bold('🧪 Federal Invest - DRE Bug Testing Suite'));
console.log(chalk.gray('═'.repeat(60)));

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    debug: chalk.gray
  };
  
  const color = colors[level] || chalk.white;
  console.log(color(`[${level.toUpperCase()}] ${timestamp} - ${message}`));
  
  if (data && CONFIG.verbose) {
    console.log(chalk.gray(JSON.stringify(data, null, 2)));
  }
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log('info', `Executando: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function checkPrerequisites() {
  log('info', 'Verificando pré-requisitos...');
  
  // Verificar se o servidor está rodando
  try {
    const response = await fetch(CONFIG.baseURL);
    if (!response.ok) {
      throw new Error(`Servidor não responsivo: ${response.status}`);
    }
    log('success', 'Servidor está rodando');
  } catch (error) {
    log('error', 'Servidor não está rodando!', { url: CONFIG.baseURL, error: error.message });
    log('info', 'Execute: npm run dev');
    process.exit(1);
  }
  
  // Verificar se os testes existem
  const testFiles = [
    '__tests__/dre-tax-deductions.test.ts',
    '__tests__/playwright-dre-interface.test.ts'
  ];
  
  for (const testFile of testFiles) {
    if (!fs.existsSync(testFile)) {
      log('error', `Arquivo de teste não encontrado: ${testFile}`);
      process.exit(1);
    }
  }
  
  log('success', 'Todos os pré-requisitos verificados');
}

async function runJestTests() {
  log('info', '🧪 Executando testes Jest...');
  
  try {
    await runCommand('npm', ['run', 'test', '--', '__tests__/dre-tax-deductions.test.ts', '--verbose']);
    log('success', 'Testes Jest concluídos');
  } catch (error) {
    log('error', 'Testes Jest falharam', { error: error.message });
    throw error;
  }
}

async function runPlaywrightTests() {
  log('info', '🎭 Executando testes Playwright...');
  
  try {
    const playwrightArgs = [
      'exec', 'playwright', 'test',
      '__tests__/playwright-dre-interface.test.ts',
      '--config=playwright.config.ts'
    ];
    
    if (CONFIG.headless) {
      playwrightArgs.push('--headed=false');
    }
    
    await runCommand('npx', playwrightArgs);
    log('success', 'Testes Playwright concluídos');
  } catch (error) {
    log('error', 'Testes Playwright falharam', { error: error.message });
    throw error;
  }
}

async function generateReport() {
  log('info', '📊 Gerando relatório de bugs...');
  
  const reportPath = 'test-results/bug-report.md';
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = `# 🐛 Relatório de Bugs DRE - ${new Date().toLocaleDateString('pt-BR')}

## Bugs Identificados

### 🐛 Bug 1: Tab Mensal - Valor zerado na tabela
- **Status**: ${process.env.BUG_1_STATUS || 'DETECTADO'}
- **Descrição**: Valor inserido no input não aparece na tabela (fica zerado)
- **Impacto**: Alto - Usuários não conseguem ver o valor salvo
- **Evidências**: Screenshots em \`test-results/bug-mensal-*.png\`

### 🐛 Bug 2: Tab Trimestral - Valor incorreto (23.333.333)
- **Status**: ${process.env.BUG_2_STATUS || 'DETECTADO'}
- **Descrição**: Valor 10.000 se torna 23.333.333 na tabela
- **Impacto**: Alto - Dados financeiros incorretos
- **Possível Causa**: Erro na agregação/conversão de valores mensais
- **Evidências**: Screenshots em \`test-results/bug-trimestral-*.png\`

## Logs Detalhados

### Logs do Console
\`\`\`
${process.env.CONSOLE_LOGS || 'Execute os testes para capturar logs'}
\`\`\`

### Logs da API
\`\`\`
${process.env.API_LOGS || 'Execute os testes para capturar logs da API'}
\`\`\`

## Próximos Passos

1. ✅ Logs detalhados adicionados
2. ✅ Testes automatizados criados
3. 🔄 Correção dos bugs identificados
4. ⏳ Validação das correções

## Comandos Úteis

\`\`\`bash
# Executar testes completos
npm run test:dre-bugs

# Executar apenas Jest
npm run test __tests__/dre-tax-deductions.test.ts

# Executar apenas Playwright
npx playwright test __tests__/playwright-dre-interface.test.ts

# Ver logs detalhados no navegador
# Abrir DevTools -> Console -> Filtrar por "DRE-DEBUG"
\`\`\`

---
*Relatório gerado automaticamente em ${new Date().toISOString()}*
`;
  
  fs.writeFileSync(reportPath, report);
  log('success', `Relatório salvo em: ${reportPath}`);
}

async function main() {
  try {
    await checkPrerequisites();
    
    log('info', 'Iniciando suite de testes para bugs do DRE...');
    
    // Executar testes Jest (lógica)
    await runJestTests();
    
    // Executar testes Playwright (interface)
    await runPlaywrightTests();
    
    // Gerar relatório
    await generateReport();
    
    log('success', '✅ Todos os testes concluídos!');
    log('info', 'Verifique os resultados em: test-results/');
    log('info', 'Logs detalhados disponíveis no console do navegador (filtrar por "🔍 [DRE-DEBUG]")');
    
  } catch (error) {
    log('error', '❌ Falha na execução dos testes', { error: error.message });
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red.bold('💥 Erro fatal:'), error);
    process.exit(1);
  });
}

module.exports = { main, CONFIG, log };
