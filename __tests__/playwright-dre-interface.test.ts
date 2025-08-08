/**
 * 🎭 Playwright Tests para Interface DRE
 * 
 * Testes E2E para identificar bugs visuais nas tabs Mensal e Trimestral
 * do sistema de deduções fiscais do DRE.
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';

// Novo teste E2E para validar retirada acima do saldo
import { test as pwTest, expect as pwExpect } from '@playwright/test';

async function loginAndGoToInvestimentos(page: Page) {
  // Reusa lógica: navegar e logar se necessário
  await page.goto('http://localhost:3000/investimentos');
  await page.waitForTimeout(1500);
  if (page.url().includes('/sign-in') || page.url().includes('/login')) {
    await page.fill('input[type="email"], input[name="email"]', 'admin@federalinvest.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    await page.waitForURL('**/investimentos', { timeout: 15000 });
  }
  pwExpect(page.url()).toContain('/investimentos');
}

// Configurações de teste
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  credentials: {
    email: 'admin@federalinvest.com',
    password: 'admin123'
  }
};

// Helper functions
const loginIfNeeded = async (page: Page) => {
  try {
    // Tentar navegar para DRE diretamente
    await page.goto(`${TEST_CONFIG.baseURL}/dre`);
    await page.waitForTimeout(2000);
    
    // Se redirecionou para login, fazer login
    if (page.url().includes('/sign-in') || page.url().includes('/login')) {
      console.log('🔐 Login necessário, fazendo autenticação...');
      
      await page.fill('input[type="email"], input[name="email"]', TEST_CONFIG.credentials.email);
      await page.fill('input[type="password"], input[name="password"]', TEST_CONFIG.credentials.password);
      await page.click('button[type="submit"], button:has-text("Entrar")');
      
      // Aguardar redirecionamento
      await page.waitForURL('**/dre', { timeout: 15000 });
    }
    
    // Verificar se está na página DRE
    expect(page.url()).toContain('/dre');
    console.log('✅ Autenticado e na página DRE');
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    throw error;
  }
};

const waitForDREDataLoad = async (page: Page) => {
  // Aguardar elementos do DRE carregar
  await page.waitForSelector('[data-testid="dre-table"], .dre-table, table', { timeout: 15000 });
  await page.waitForTimeout(2000); // Aguardar estabilizar
  console.log('✅ Dados do DRE carregados');
};

const switchToDRETab = async (page: Page, tabType: 'mensal' | 'trimestral' | 'anual') => {
  const tabSelectors = {
    mensal: '[data-testid="tab-mensal"], button:has-text("Mensal")',
    trimestral: '[data-testid="tab-trimestral"], button:has-text("Trimestral")',
    anual: '[data-testid="tab-anual"], button:has-text("Anual")'
  };
  
  await page.click(tabSelectors[tabType]);
  await page.waitForTimeout(1500); // Aguardar troca de aba
  console.log(`📊 Mudou para aba ${tabType}`);
};

const openTaxDeductionDialog = async (page: Page) => {
  // Procurar por botões de dedução fiscal
  const possibleSelectors = [
    '[data-testid="tax-deduction-button"]',
    'button:has-text("Dedução Fiscal")',
    'button:has-text("Editar Dedução")',
    '[title="Dedução Fiscal"]'
  ];
  
  let buttonFound = false;
  for (const selector of possibleSelectors) {
    try {
      if (await page.locator(selector).isVisible()) {
        await page.click(selector);
        buttonFound = true;
        console.log(`✅ Botão de dedução encontrado: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!buttonFound) {
    throw new Error('❌ Botão de dedução fiscal não encontrado');
  }
  
  // Aguardar dialog abrir
  await page.waitForSelector('dialog, [role="dialog"], .dialog', { timeout: 5000 });
  console.log('📝 Dialog de dedução fiscal aberto');
};

const fillTaxDeductionValue = async (page: Page, value: number) => {
  // Procurar input de valor
  const inputSelectors = [
    'input[name="deducaoFiscal"]',
    'input[placeholder*="dedução"]',
    'input[type="number"]'
  ];
  
  let inputFound = false;
  for (const selector of inputSelectors) {
    try {
      if (await page.locator(selector).isVisible()) {
        await page.fill(selector, value.toString());
        inputFound = true;
        console.log(`✅ Valor ${value} inserido no input: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!inputFound) {
    throw new Error('❌ Input de dedução fiscal não encontrado');
  }
};

const saveTaxDeduction = async (page: Page) => {
  // Procurar botão de salvar
  const saveSelectors = [
    'button[type="submit"]',
    'button:has-text("Salvar")',
    'button:has-text("Confirmar")'
  ];
  
  let saveButtonFound = false;
  for (const selector of saveSelectors) {
    try {
      if (await page.locator(selector).isVisible()) {
        await page.click(selector);
        saveButtonFound = true;
        console.log(`✅ Botão salvar clicado: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!saveButtonFound) {
    throw new Error('❌ Botão de salvar não encontrado');
  }
  
  // Aguardar dialog fechar e dados atualizarem
  await page.waitForTimeout(3000);
  console.log('💾 Dedução fiscal salva, aguardando atualização...');
};

const getTaxDeductionValueFromTable = async (page: Page): Promise<string> => {
  // Procurar valor da dedução na tabela
  const possibleSelectors = [
    '[data-testid="deducao-fiscal-value"]',
    'td:has-text("Dedução Fiscal") + td',
    'tr:has-text("Dedução Fiscal") td:last-child',
    'tr:has-text("Dedução") td:last-child'
  ];
  
  for (const selector of possibleSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const value = await element.textContent();
        console.log(`📊 Valor encontrado na tabela: ${value}`);
        return value?.trim() || '0';
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback: procurar em toda a tabela
  const tableText = await page.locator('table, .table').textContent();
  console.log('📊 Conteúdo da tabela:', tableText);
  
  return '0';
};

test.describe('🧪 DRE Tax Deductions Interface Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
    await waitForDREDataLoad(page);
  });

  test('🔍 Bug 1: Testar tab Mensal - Valor zerado na tabela', async ({ page }) => {
    console.log('🧪 Testando bug da tab mensal...');
    
    // 1. Mudar para aba mensal
    await switchToDRETab(page, 'mensal');
    
    // 2. Capturar valor inicial na tabela
    const initialValue = await getTaxDeductionValueFromTable(page);
    console.log('📊 Valor inicial na tabela mensal:', initialValue);
    
    // 3. Abrir dialog de dedução fiscal
    await openTaxDeductionDialog(page);
    
    // 4. Inserir valor de teste
    const testValue = 5000;
    await fillTaxDeductionValue(page, testValue);
    
    // 5. Salvar
    await saveTaxDeduction(page);
    
    // 6. Verificar se valor aparece na tabela
    await page.waitForTimeout(2000); // Aguardar atualização
    const finalValue = await getTaxDeductionValueFromTable(page);
    console.log('📊 Valor final na tabela mensal:', finalValue);
    
    // 7. Verificar se o bug existe
    const valueInTable = parseFloat(finalValue.replace(/[^\d.]/g, '')) || 0;
    
    if (valueInTable === 0 && testValue > 0) {
      console.error('🐛 BUG DETECTADO: Valor salvo mas zerado na tabela mensal!');
      console.error({
        expectedValue: testValue,
        actualValue: valueInTable,
        bugType: 'monthly-zero-value'
      });
      
      // Capturar screenshot do bug
      await page.screenshot({ 
        path: `test-results/bug-mensal-zerado-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Falhar o teste para indicar bug
      expect(valueInTable, 'Valor deveria aparecer na tabela mensal').toBeGreaterThan(0);
    } else {
      console.log('✅ Valor aparece corretamente na tabela mensal');
    }
  });

  test('🔍 Bug 2: Testar tab Trimestral - Valor incorreto (23.333.333)', async ({ page }) => {
    console.log('🧪 Testando bug da tab trimestral...');
    
    // 1. Mudar para aba trimestral
    await switchToDRETab(page, 'trimestral');
    
    // 2. Capturar valor inicial
    const initialValue = await getTaxDeductionValueFromTable(page);
    console.log('📊 Valor inicial na tabela trimestral:', initialValue);
    
    // 3. Abrir dialog de dedução fiscal
    await openTaxDeductionDialog(page);
    
    // 4. Inserir valor de teste (10.000)
    const testValue = 10000;
    await fillTaxDeductionValue(page, testValue);
    
    // 5. Salvar
    await saveTaxDeduction(page);
    
    // 6. Verificar valor na tabela
    await page.waitForTimeout(3000); // Aguardar cálculos
    const finalValue = await getTaxDeductionValueFromTable(page);
    console.log('📊 Valor final na tabela trimestral:', finalValue);
    
    // 7. Verificar se o bug existe
    const valueInTable = parseFloat(finalValue.replace(/[^\d.]/g, '')) || 0;
    const expectedValue = testValue;
    
    // Verificar se o valor está muito diferente do esperado (indica bug)
    const difference = Math.abs(valueInTable - expectedValue);
    const percentageDiff = (difference / expectedValue) * 100;
    
    if (percentageDiff > 50) { // Mais de 50% de diferença indica bug
      console.error('🐛 BUG DETECTADO: Valor incorreto na tabela trimestral!');
      console.error({
        expectedValue,
        actualValue: valueInTable,
        difference,
        percentageDiff: `${percentageDiff.toFixed(2)}%`,
        bugType: 'quarterly-incorrect-calculation',
        possibleCause: valueInTable === 23333333 ? 'Conhecido bug 23.333.333' : 'Cálculo incorreto'
      });
      
      // Capturar screenshot do bug
      await page.screenshot({ 
        path: `test-results/bug-trimestral-incorreto-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Falhar o teste para indicar bug
      expect(valueInTable, `Valor deveria ser próximo de ${expectedValue}`).toBeCloseTo(expectedValue, 0);
    } else {
      console.log('✅ Valor aparece corretamente na tabela trimestral');
    }
  });

  test('📊 Testar navegação entre tabs e persistência de dados', async ({ page }) => {
    console.log('🧪 Testando navegação entre tabs...');
    
    const testData = [
      { tab: 'mensal' as const, value: 3000 },
      { tab: 'trimestral' as const, value: 7000 }
    ];
    
    for (const { tab, value } of testData) {
      console.log(`📋 Testando tab ${tab}...`);
      
      // 1. Mudar para a aba
      await switchToDRETab(page, tab);
      
      // 2. Tentar salvar valor
      try {
        await openTaxDeductionDialog(page);
        await fillTaxDeductionValue(page, value);
        await saveTaxDeduction(page);
        
        // 3. Verificar se persiste
        await page.waitForTimeout(2000);
        const tableValue = await getTaxDeductionValueFromTable(page);
        const numericValue = parseFloat(tableValue.replace(/[^\d.]/g, '')) || 0;
        
        console.log(`📊 Tab ${tab}: esperado ${value}, obtido ${numericValue}`);
        
        // Salvar dados de debug
        await page.evaluate((data) => {
          console.log(`🔍 [TAB-DEBUG] ${data.tab}:`, {
            expectedValue: data.value,
            actualValue: data.actualValue,
            timestamp: new Date().toISOString()
          });
        }, { tab, value, actualValue: numericValue });
        
      } catch (error) {
        console.error(`❌ Erro ao testar tab ${tab}:`, error);
      }
    }
  });

  test('🕵️ Debug: Capturar logs do console durante operações', async ({ page }) => {
    console.log('🔍 Capturando logs do console...');
    
    // Escutar mensagens do console
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('DRE-DEBUG') || text.includes('🔍')) {
        consoleLogs.push(`[${msg.type().toUpperCase()}] ${text}`);
        console.log(`🖥️ Console: ${text}`);
      }
    });
    
    // Escutar erros de rede
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.error(`🌐 Network Error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Executar operação que deve gerar logs
    await switchToDRETab(page, 'mensal');
    
    try {
      await openTaxDeductionDialog(page);
      await fillTaxDeductionValue(page, 1000);
      await saveTaxDeduction(page);
    } catch (error) {
      console.log('❌ Erro esperado durante debug:', error);
    }
    
    // Aguardar logs
    await page.waitForTimeout(5000);
    
    // Salvar logs em arquivo
    if (consoleLogs.length > 0) {
      console.log('📝 Logs capturados do console:');
      consoleLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('⚠️ Nenhum log de debug capturado');
    }
    
    // Verificar se logs de debug estão sendo gerados
    expect(consoleLogs.length, 'Deveria capturar logs de debug').toBeGreaterThan(0);
  });

  test('📸 Capturar screenshots de diferentes estados', async ({ page }) => {
    console.log('📸 Capturando screenshots para análise...');
    
    const states = ['mensal', 'trimestral', 'anual'] as const;
    
    for (const state of states) {
      await switchToDRETab(page, state);
      await page.waitForTimeout(1500);
      
      // Screenshot da aba
      await page.screenshot({ 
        path: `test-results/dre-tab-${state}-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Screenshot da tabela específica
      const table = page.locator('table, .table').first();
      if (await table.isVisible()) {
        await table.screenshot({ 
          path: `test-results/dre-table-${state}-${Date.now()}.png` 
        });
      }
      
      console.log(`📸 Screenshot capturado para aba ${state}`);
    }
  });
});

// Teste de performance
test.describe('⚡ Performance Tests', () => {
  test('📊 Medir tempo de carregamento do DRE', async ({ page }) => {
    const startTime = Date.now();
    
    await loginIfNeeded(page);
    await waitForDREDataLoad(page);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`⏱️ Tempo de carregamento do DRE: ${loadTime}ms`);
    
    // Verificar se não está muito lento (> 10 segundos)
    expect(loadTime, 'DRE deveria carregar em menos de 10 segundos').toBeLessThan(10000);
  });
});



export { TEST_CONFIG, loginIfNeeded, waitForDREDataLoad, switchToDRETab, openTaxDeductionDialog };
