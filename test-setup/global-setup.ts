/**
 * 🧪 Playwright Global Setup
 * 
 * Setup global para testes do DRE
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global dos testes DRE...');
  
  // Criar diretórios de resultados se não existirem
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/artifacts',
    'test-results/playwright-report'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Criado diretório: ${dir}`);
    }
  }
  
  // Criar arquivo de configuração de ambiente
  const envConfig = {
    timestamp: new Date().toISOString(),
    baseURL: config.webServer?.url || 'http://localhost:3000',
    testDir: config.testDir || './__tests__',
    outputDir: config.outputDir || 'test-results/artifacts'
  };
  
  fs.writeFileSync(
    'test-results/test-config.json',
    JSON.stringify(envConfig, null, 2)
  );
  
  console.log('✅ Setup global concluído');
  console.log(`🌐 Base URL: ${envConfig.baseURL}`);
  console.log(`📂 Test Dir: ${envConfig.testDir}`);
  
  return envConfig;
}

export default globalSetup;
