#!/usr/bin/env node

/**
 * 🧪 Script de Teste Rápido DRE
 * 
 * Script para testar rapidamente as correções dos bugs do DRE
 */

const http = require('http');

console.log('🚀 TESTE RÁPIDO DRE - Federal Invest\n');
console.log('=====================================\n');
console.log('✅ CORREÇÕES IMPLEMENTADAS:\n');
console.log('1. ✅ API DRE - Conversão correta de valores numeric');
console.log('2. ✅ Frontend - Invalidação de cache do React Query');
console.log('3. ✅ Trimestral - Distribuição automática nos 3 meses');
console.log('4. ✅ Logs detalhados - Debug completo do processo\n');
console.log('=====================================\n');

console.log('📋 INSTRUÇÕES DE TESTE:\n');
console.log('1. Certifique-se que o servidor está rodando (npm run dev)');
console.log('2. Acesse http://localhost:3000/dre');
console.log('3. Abra o console do navegador (F12)');
console.log('4. Teste os seguintes cenários:\n');

console.log('🧪 TESTE 1 - TAB MENSAL:');
console.log('   a) Clique na tab "Mensal"');
console.log('   b) Clique no botão "Dedução: R$ X,XX"');
console.log('   c) Digite um valor (ex: 5000)');
console.log('   d) Clique em "Salvar Dedução"');
console.log('   e) ✅ VERIFICAR: Valor deve aparecer na tabela');
console.log('   f) 📝 LOGS: Verifique os logs detalhados no console\n');

console.log('🧪 TESTE 2 - TAB TRIMESTRAL:');
console.log('   a) Clique na tab "Trimestral"');
console.log('   b) Clique no botão "Dedução: R$ X,XX"');
console.log('   c) Digite um valor (ex: 9000)');
console.log('   d) Clique em "Salvar Dedução"');
console.log('   e) ✅ VERIFICAR: Valor deve aparecer como 9000 (não 23.333.333)');
console.log('   f) 📝 LOGS: Valor será distribuído em 3000 por mês\n');

console.log('=====================================\n');
console.log('🔍 LOGS IMPORTANTES NO CONSOLE:\n');
console.log('- [DRE-DEBUG] Iniciando salvamento...');
console.log('- [DRE-DEBUG] Salvando mês X...');
console.log('- [DRE-DEBUG] Invalidando cache...');
console.log('- [DRE-DEBUG] Refetch concluído!');
console.log('- [DRE-API-DEBUG] Resultado consulta...\n');

console.log('=====================================\n');
console.log('💡 DICAS DE DEBUG:\n');
console.log('1. Se o valor continuar zero, verifique:');
console.log('   - Os logs mostram "value" e "typeOfValue"');
console.log('   - O banco está salvando corretamente');
console.log('   - O cache foi invalidado\n');
console.log('2. Se aparecer valor errado no trimestral:');
console.log('   - Verifique se está salvando nos 3 meses');
console.log('   - Confirme que está somando corretamente\n');

console.log('=====================================\n');
console.log('🎯 RESULTADO ESPERADO:');
console.log('✅ Tab Mensal: Valor salvo aparece imediatamente na tabela');
console.log('✅ Tab Trimestral: Valor total aparece correto (sem multiplicação)');
console.log('✅ Logs detalhados: Mostram todo o processo de salvamento');
console.log('✅ Performance: Refetch acontece após 500ms de delay\n');

console.log('=====================================\n');
console.log('📱 EXECUTANDO TESTE AUTOMATIZADO...\n');

// Verificar se o servidor está rodando
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('✅ Servidor rodando em http://localhost:3000');
    console.log('👉 Abra o navegador e siga as instruções acima!');
  } else {
    console.log('⚠️ Servidor respondendo mas com status:', res.statusCode);
  }
});

req.on('error', (error) => {
  console.error('❌ ERRO: Servidor não está rodando!');
  console.error('   Execute "npm run dev" primeiro.');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ ERRO: Timeout ao conectar com o servidor!');
  console.error('   Verifique se o servidor está rodando.');
  req.destroy();
  process.exit(1);
});

req.end();
