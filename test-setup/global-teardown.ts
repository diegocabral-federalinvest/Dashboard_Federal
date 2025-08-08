/**
 * 🧪 Playwright Global Teardown
 * 
 * Teardown global para testes do DRE
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando teardown global dos testes DRE...');
  
  try {
    // Gerar resumo dos resultados
    const resultsDir = 'test-results';
    const summaryFile = path.join(resultsDir, 'test-summary.json');
    
    const summary = {
      timestamp: new Date().toISOString(),
      testDir: (config as any)?.testDir,
      outputDir: (config as any)?.outputDir,
      artifacts: {
        screenshots: [] as string[],
        videos: [] as string[],
        traces: [] as string[],
        reports: [] as string[]
      }
    };
    
    // Listar artifacts gerados
    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir, { recursive: true });
      
      for (const file of files) {
        const filePath = file.toString();
        if (filePath.includes('.png')) summary.artifacts.screenshots.push(filePath);
        if (filePath.includes('.webm')) summary.artifacts.videos.push(filePath);
        if (filePath.includes('.zip')) summary.artifacts.traces.push(filePath);
        if (filePath.includes('.html')) summary.artifacts.reports.push(filePath);
      }
    }
    
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('📊 Resumo dos testes:');
    console.log(`  Screenshots: ${summary.artifacts.screenshots.length}`);
    console.log(`  Vídeos: ${summary.artifacts.videos.length}`);
    console.log(`  Traces: ${summary.artifacts.traces.length}`);
    console.log(`  Relatórios: ${summary.artifacts.reports.length}`);
    
    // Mostrar links úteis
    console.log('\n🔗 Links úteis:');
    console.log('  Relatório HTML: test-results/playwright-report/index.html');
    console.log('  Resumo JSON: test-results/test-summary.json');
    console.log('  Artifacts: test-results/artifacts/');
    
  } catch (error) {
    console.error('❌ Erro no teardown:', error);
  }
  
  console.log('✅ Teardown global concluído');
}

export default globalTeardown;
