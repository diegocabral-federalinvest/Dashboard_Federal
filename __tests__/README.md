# 🧪 Testes Automatizados - Bugs DRE Federal Invest

Este diretório contém uma suite completa de testes automatizados para identificar, debugar e corrigir os bugs reportados no sistema de deduções fiscais do DRE.

## 🐛 Bugs Identificados

### Bug 1: Tab Mensal - Valor zerado na tabela
- **Problema**: Valor inserido no input não aparece na tabela (fica zerado)
- **Impacto**: Alto - Usuários não conseguem visualizar o valor salvo
- **Arquivo de Teste**: `dre-tax-deductions.test.ts` e `playwright-dre-interface.test.ts`

### Bug 2: Tab Trimestral - Valor incorreto (23.333.333)
- **Problema**: Valor 10.000 se transforma em 23.333.333 na tabela
- **Impacto**: Alto - Dados financeiros incorretos são exibidos
- **Possível Causa**: Erro na agregação/conversão de valores mensais para trimestrais
- **Arquivo de Teste**: `dre-tax-deductions.test.ts` e `playwright-dre-interface.test.ts`

## 🔧 Setup Inicial

### Pré-requisitos
```bash
# Node.js 18+ e npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Dependências do projeto
npm install

# Instalar Playwright
npx playwright install
```

### Configuração do Ambiente
```bash
# Variáveis de ambiente (opcional)
export TEST_URL="http://localhost:3000"
export HEADLESS="false"  # true para CI
export TEST_ADMIN_EMAIL="admin@federalinvest.com"
export TEST_ADMIN_PASSWORD="admin123"
```

## 🚀 Executando os Testes

### Método 1: Script Automatizado (Recomendado)
```bash
# Executar todos os testes + relatório
node scripts/test-dre-bugs.js

# Com logs verbosos
VERBOSE=true node scripts/test-dre-bugs.js

# Modo headless (sem interface gráfica)
HEADLESS=true node scripts/test-dre-bugs.js
```

### Método 2: Comandos Individuais

#### Testes Jest (Lógica de Negócio)
```bash
# Executar testes Jest específicos para DRE
npm test __tests__/dre-tax-deductions.test.ts

# Com watch mode (re-executa quando arquivo muda)
npm test __tests__/dre-tax-deductions.test.ts -- --watch

# Com coverage
npm test __tests__/dre-tax-deductions.test.ts -- --coverage
```

#### Testes Playwright (Interface E2E)
```bash
# Executar testes Playwright
npx playwright test __tests__/playwright-dre-interface.test.ts

# Com interface gráfica
npx playwright test __tests__/playwright-dre-interface.test.ts --headed

# Modo debug (pausa e abre DevTools)
npx playwright test __tests__/playwright-dre-interface.test.ts --debug

# Executar teste específico
npx playwright test --grep "Bug 1: Testar tab Mensal"
```

## 📊 Monitoramento e Debug

### Logs Detalhados no Navegador
Os logs de debug foram adicionados no código da aplicação. Para visualizá-los:

1. Abrir DevTools (F12)
2. Ir para aba Console
3. Filtrar por: `🔍 [DRE-DEBUG]`
4. Executar operação de salvar dedução fiscal
5. Observar logs detalhados

### Exemplo de Logs Esperados
```javascript
🔍 [DRE-DEBUG] Iniciando salvamento de dedução fiscal
🔍 [DRE-DEBUG] Salvamento MENSAL { endpoint: "/api/finance/monthly-tax-deduction", body: {...} }
🔍 [DRE-DEBUG] Fazendo requisição: { endpoint, method: "POST", body: "..." }
🔍 [DRE-DEBUG] Resposta recebida: { status: 200, statusText: "OK", ok: true }
🔍 [DRE-DEBUG] Dados da resposta: { success: true, data: {...} }
🔍 [DRE-DEBUG] Aguardando refetch dos dados...
🔍 [DRE-DEBUG] Refetch concluído!
```

### Logs da API Backend
```javascript
🔍 [DRE-API-DEBUG] Consultando dedução mensal { year: 2025, month: 1 }
🔍 [DRE-API-DEBUG] Resultado consulta dedução mensal { resultLength: 1, result: [...] }
🔍 [DRE-API-DEBUG] Valor mensal convertido { originalValue: "10000.00", convertedValue: 10000 }
```

## 📁 Estrutura dos Testes

```
__tests__/
├── README.md                           # Este arquivo
├── dre-tax-deductions.test.ts         # Testes Jest (lógica)
├── playwright-dre-interface.test.ts   # Testes Playwright (E2E)
└── fixtures/                          # Dados de teste (futuro)

test-setup/
├── global-setup.ts                    # Setup global do Playwright
└── global-teardown.ts                 # Teardown global do Playwright

test-results/
├── screenshots/                       # Screenshots dos bugs
├── videos/                           # Vídeos das execuções
├── traces/                           # Traces do Playwright
├── playwright-report/                # Relatório HTML
├── bug-report.md                     # Relatório de bugs
├── test-summary.json                 # Resumo dos testes
└── artifacts/                        # Outros artifacts

scripts/
└── test-dre-bugs.js                  # Script principal de testes
```

## 🔍 Casos de Teste

### Jest Tests (`dre-tax-deductions.test.ts`)
- ✅ Salvar dedução mensal corretamente
- ✅ Recuperar dedução mensal salva no DRE
- 🐛 Detectar quando valor salvo não aparece na tabela
- ✅ Calcular dedução trimestral corretamente
- 🐛 Detectar cálculo incorreto na agregação trimestral
- ✅ Identificar problema na agregação de valores mensais
- ✅ Teste de integração completo

### Playwright Tests (`playwright-dre-interface.test.ts`)
- 🐛 Testar tab Mensal - Valor zerado na tabela
- 🐛 Testar tab Trimestral - Valor incorreto (23.333.333)
- ✅ Testar navegação entre tabs e persistência
- 🔍 Capturar logs do console durante operações
- 📸 Capturar screenshots de diferentes estados
- ⚡ Medir tempo de carregamento do DRE

## 🛠️ Utilitários de Debug

### Helper Functions disponíveis
```typescript
// Jest helpers
import { testHelpers } from './__tests__/dre-tax-deductions.test';

// Criar período de teste
const period = testHelpers.createMockCurrentPeriod('monthly', 2025, 1);

// Criar estado local de teste  
const state = testHelpers.createMockLocalState(10000);

// Simular cenário de bug
const bugScenario = testHelpers.simulateBugScenario('monthly-zero');

// Playwright helpers
import { loginIfNeeded, switchToDRETab } from './__tests__/playwright-dre-interface.test';
```

### Mock Data para Testes
```typescript
// Resposta de sucesso da API
const mockTaxDeductionResponse = {
  success: true,
  data: { id: 1, year: 2025, month: 1, value: "10000.00" }
};

// Dados DRE simulados
const mockDREResponse = {
  success: true,
  data: {
    deducaoFiscal: 10000,
    resultadoLiquido: -9820,
    // ... outros campos
  }
};
```

## 📈 Interpretando Resultados

### ✅ Teste Passou
```
✓ deve salvar dedução mensal corretamente
✓ deve recuperar dedução mensal salva no DRE
```

### 🐛 Bug Detectado
```
✗ deve detectar quando valor salvo não aparece na tabela
  Expected: > 0
  Received: 0
  
🐛 [BUG DETECTED] Valor salvo mas não recuperado no DRE mensal:
  saved: true
  expectedValue: 10000
  actualValue: 0
```

### 📊 Relatórios Gerados
- **HTML Report**: `test-results/playwright-report/index.html`
- **Bug Report**: `test-results/bug-report.md`
- **JSON Results**: `test-results/test-results.json`
- **Screenshots**: `test-results/screenshots/`

## 🚨 Solução de Problemas

### Servidor não está rodando
```bash
# Erro: Servidor não responsivo
# Solução: Iniciar servidor de desenvolvimento
npm run dev
```

### Testes Playwright falhando
```bash
# Instalar browsers
npx playwright install

# Verificar configuração
npx playwright test --config=playwright.config.ts --list
```

### Permissões de arquivo
```bash
# Dar permissão de execução ao script
chmod +x scripts/test-dre-bugs.js
```

### Base URL incorreta
```bash
# Definir URL correta
export TEST_URL="http://localhost:3000"

# Ou passar diretamente
TEST_URL="http://localhost:3000" node scripts/test-dre-bugs.js
```

## 🔄 Fluxo de Correção de Bugs

1. **Identificar**: Execute os testes para confirmar bugs
2. **Debugar**: Use logs detalhados no console
3. **Corrigir**: Implemente correções no código
4. **Validar**: Re-execute testes para confirmar correção
5. **Documentar**: Atualize status no relatório

### Exemplo de Correção
```typescript
// ANTES (com bug)
const taxDeductionValue = Number(queryResult.totalValue); // NaN ou valor incorreto

// DEPOIS (corrigido)  
const taxDeductionValue = parseFloat(queryResult.totalValue) || 0;
console.log('🔍 [DRE-DEBUG] Valor convertido:', { 
  original: queryResult.totalValue, 
  converted: taxDeductionValue 
});
```

## 📝 Contribuindo

### Adicionando Novos Testes
1. Criar novo arquivo em `__tests__/`
2. Seguir padrão de nomenclatura: `*.test.ts`
3. Adicionar documentação no cabeçalho
4. Incluir logs de debug apropriados

### Reportando Novos Bugs
1. Criar teste que reproduza o bug
2. Adicionar logs detalhados
3. Capturar screenshots/vídeos
4. Documentar no `bug-report.md`

## 🔗 Links Úteis

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Federal Invest Codebase](../)
- [DRE Component](../app/(dashboard)/dre/)

---

**🎯 Objetivo**: Identificar rapidamente os bugs, debugar com logs detalhados e validar correções através de testes automatizados.

**📞 Suporte**: Se encontrar problemas, verifique os logs no console do navegador e nos resultados dos testes.
