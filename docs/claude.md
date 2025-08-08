# 🎯 Claude.md - Instrutor do Projeto Federal Invest

## 📋 Visão Geral do Projeto

**Federal Invest App** é uma plataforma de gestão financeira desenvolvida em Next.js 14 que evoluiu de um Finance SaaS Platform. O sistema é projetado para gerenciar investidores, despesas, receitas, investimentos e gerar relatórios financeiros como DRE (Demonstração de Resultado do Exercício).

### 🏗️ Arquitetura Técnica
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: API Routes do Next.js com Hono.js
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Autenticação**: NextAuth.js (suporte a OAuth e credenciais, com roles)
- **Estado**: Tanstack React Query + Context API
- **UI**: Shadcn/ui + componentes customizados
- **Deploy**: Vercel

---

## ✅ Status de Implementação

### 🟢 CONCLUÍDO ✅

#### Semana 1 - Fundação
- [x] **Setup e Banco de Dados**
  - [x] Schema completo definido (`db/schema.ts`)
  - [x] Migrações executadas (`drizzle/`)
  - [x] Entidades implementadas: expenses, revenues, investments, reports, upload history

- [x] **Branding e UI Base**
  - [x] Cores atualizadas no `globals.css`
  - [x] Tailwind configurado (`tailwind.config.ts`)
  - [x] Componentes UI base criados (`components/ui/`)
  - [x] Tema dark implementado

- [x] **Autenticação e Layout**
  - [x] NextAuth.js configurado com middleware
  - [x] Layout principal do dashboard (`app/(dashboard)/layout.tsx`)
  - [x] Header com branding (`components/layout/header.tsx`)
  - [x] Sidebar de navegação (`components/layout/sidebar.tsx`)
  - [x] Sistema de roles baseado em sessão

#### Semana 2 - Funcionalidades Principais
- [x] **Dashboard Principal**
  - [x] Página inicial implementada (`app/(dashboard)/page.tsx`)
  - [x] KPIs e widgets (`components/dashboard/stats-card.tsx`)
  - [x] Gráficos e visualizações (`components/charts/`)
  - [x] Hook de dados do dashboard (`hooks/use-dashboard-data.ts`)

- [x] **Gestão de Investidores**
  - [x] CRUD completo para investidores (`features/investments/`)
  - [x] Listagem de investidores
  - [x] Formulários de criação/edição
  - [x] API endpoints (`app/api/`)

#### Semana 3 - Finanças e Relatórios
- [x] **Despesas e Receitas**
  - [x] CRUD completo (`features/expenses/`, `features/entries/`)
  - [x] Formulários implementados
  - [x] Categorização
  - [x] API endpoints funcionais

- [x] **DRE e Relatórios**
  - [x] Página DRE implementada (`app/(dashboard)/dre/`)
  - [x] Visualização de dados DRE
  - [x] Sistema de upload CSV (`app/(dashboard)/dre/_components/csv-upload.tsx`)
  - [x] Dados brutos visualizáveis (`app/(dashboard)/dre/dados-brutos/`)
  - [x] Histórico de uploads (`app/(dashboard)/historico-uploads/`)
  - [x] Sistema de exportação (`lib/export/`)

#### Recursos Avançados
- [x] **Importação de Dados**
  - [x] Interface para upload CSV
  - [x] Processamento de dados
  - [x] Validações implementadas
  - [x] Histórico de uploads

- [x] **Sistema de Logs**
  - [x] Logger frontend/backend (`lib/logger.ts`, `lib/frontend-logger.ts`)
  - [x] Middleware de API logging (`lib/api-logger-middleware.ts`)
  - [x] Panel de logs (`components/logger-panel.tsx`)

### 🟡 EM PROGRESSO 🔄

#### Design System Avançado
- [ ] **UI Neon Theme**
  - [ ] Variantes neon para componentes (`components/ui/neon-variants.ts`)
  - [x] Componentes base com efeitos glassmorphism (`components/ui/glass-card.tsx`)
  - [x] Badge effects implementados (`components/ui/badge-effects.tsx`)

#### Header Dinâmico
- [x] Context para header criado (`contexts/header-context.tsx`)
- [ ] Header com conteúdo dinâmico totalmente implementado
- [ ] Integração completa com páginas DRE

### 🔴 PENDENTE ❌

#### Semana 4 - Recursos Avançados
- [ ] **Sistema de Convites**
  - [ ] API para gerenciamento de convites
  - [ ] Interface para aceitação de convites
  - [ ] Verificação de e-mails autorizados

- [ ] **Projeções de Impostos**
  - [ ] Interface para projeções tributárias
  - [ ] Cálculos de impostos
  - [ ] Visualizações de cenários fiscais

- [ ] **Notificações**
  - [ ] Sistema de notificações in-app
  - [ ] Envio de e-mails para alertas
  - [ ] Interface de gerenciamento

- [ ] **Testes e Otimização**
  - [x] Estrutura de testes criada (`__tests__/`)
  - [ ] Testes de integração completos
  - [ ] Otimização de performance
  - [ ] Cache implementado

---

## 🎨 Padrões de Design e Código

### Design System

#### Cores Principais
```css
/* Federal Invest Colors */
--primary: 220 75% 12%;        /* federal-dark-blue: #0a192f */
--secondary: 220 13% 7%;       /* federal-black: #121212 */
--accent: 217 100% 61%;        /* federal-accent: #3a86ff */
```

#### Componentes UI Reutilizáveis
1. **StatsCard** - Cards de estatísticas financeiras
2. **GlassCard** - Cards com efeito glassmorphism
3. **FinancialMetricCard** - Métricas financeiras com indicadores
4. **DataTable** - Tabelas com paginação e filtros
5. **Charts** - Componentes de gráficos (Line, Bar, Multi-line)

### Estrutura de Arquivos

```
app/
├── (auth)/              # Páginas de autenticação
├── (dashboard)/         # Dashboard principal
│   ├── dre/            # Demonstração de Resultados
│   ├── operacoes/      # Operações financeiras
│   ├── investimentos/  # Gestão de investimentos
│   └── configuracoes/  # Configurações
├── api/                # API Routes
│   ├── finance/        # Endpoints financeiros
│   ├── reports/        # Relatórios
│   └── users/          # Usuários
features/               # Funcionalidades por domínio
├── finance/           # Funcionalidades financeiras
├── investments/       # Investimentos
├── expenses/          # Despesas
└── users/            # Usuários
```

---

## 🔧 Regras de Negócio

### Autenticação e Autorização
- Sistema baseado em NextAuth.js com JWT sessions
- Dois tipos de usuário: **Admin** e **Investidor**, mais **Editor** e **Viewer**
- Provedores: Google OAuth e credenciais (email/senha)
- Middleware personalizado para controle de acesso baseado em roles
- Sessões seguras com JWT tokens

### Gestão Financeira
- **Receitas**: Categorizadas, podem ser recorrentes
- **Despesas**: Fixas ou variáveis, categorizadas
- **Investimentos**: Aportes e retiradas por investidor
- **DRE**: Gerado automaticamente com base nos dados

### Upload e Processamento
- Suporte a arquivos CSV
- Validação de dados na importação
- Histórico completo de uploads
- Dados brutos preservados para auditoria

### Relatórios
- DRE por período (mensal, trimestral, anual)
- Exportação em múltiplos formatos (PDF, Excel, CSV)
- Comparativos entre períodos
- Projeções fiscais

---

## 💻 Padrões de Código

### Estrutura de Componentes React

```typescript
// Exemplo de componente seguindo padrões do projeto
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceData } from "@/hooks/use-finance-data";
import { formatCurrency } from "@/lib/utils";

interface ComponentProps {
  // Props tipadas
}

export function Component({ prop }: ComponentProps) {
  // 1. Estados locais
  const [state, setState] = useState();
  
  // 2. Hooks personalizados
  const { data, isLoading, error } = useFinanceData();
  
  // 3. Efeitos
  useEffect(() => {
    // Logic here
  }, []);
  
  // 4. Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // 5. Renderização condicional
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  // 6. Return principal
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

### API Routes

```typescript
// app/api/[endpoint]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/db/drizzle";
import { apiLogger } from "@/lib/api-logger";

export async function GET(request: Request) {
  try {
    // 1. Autenticação
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 2. Validação de parâmetros
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("param");
    
    // 3. Query no banco
    const data = await db.query.table.findMany({
      where: eq(table.userId, userId)
    });
    
    // 4. Log da operação
    apiLogger.info("Operation completed", { userId, count: data.length });
    
    // 5. Resposta
    return NextResponse.json({ data, success: true });
    
  } catch (error) {
    apiLogger.error("Operation failed", { error: error.message });
    return NextResponse.json({ 
      error: "Internal server error", 
      success: false 
    }, { status: 500 });
  }
}
```

### Hooks Personalizados

```typescript
// hooks/use-[feature].ts
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";

export function useFeature(options?) {
  const [filters, setFilters] = useState(options?.initialFilters || {});
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feature', filters],
    queryFn: () => api.getFeature(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  };
}
```

---

## 🚨 Diretrizes Importantes

### Performance
- Use `useMemo` e `useCallback` para cálculos complexos
- Implemente loading states e skeletons
- Use React Query para cache de dados
- Virtualize listas grandes

### Acessibilidade
- Sempre adicionar `aria-labels` apropriados
- Usar cores com contraste adequado
- Implementar navegação por teclado
- Adicionar `loading` states visuais

### Segurança
- Validar todos os inputs com Zod
- Verificar autenticação em todas as rotas protegidas
- Sanitizar dados antes de exibir
- Usar HTTPS em produção

### Testes
- Criar testes unitários para utilitários
- Implementar testes de integração para fluxos críticos
- Usar fixtures para dados de teste
- Manter cobertura de testes > 80%

---

## 🔍 Checklist para Novas Features

### Antes de Implementar
- [ ] Definir tipos TypeScript
- [ ] Criar schema de validação com Zod
- [ ] Planejar estrutura de componentes
- [ ] Considerar impacto na performance

### Durante Implementação
- [ ] Seguir padrões de nomenclatura
- [ ] Implementar loading e error states
- [ ] Adicionar logs apropriados
- [ ] Criar hooks reutilizáveis

### Após Implementação
- [ ] Testar responsividade
- [ ] Verificar acessibilidade
- [ ] Documentar mudanças
- [ ] Revisar performance

---

## 📚 Recursos e Documentação

### Documentação Técnica Disponível
- `docs/ANALISE_FRONTEND.md` - Análise detalhada do frontend
- `docs/DASHBOARD_REFACTORING.md` - Refatoração do dashboard
- `docs/DRE_PAGE_REDESIGN.md` - Redesign da página DRE
- `docs/FRONTEND_BACKEND_INTEGRATION.md` - Integração frontend-backend
- `docs/IMPLEMENTACAO_DETALHADA.md` - Exemplos de implementação

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test
npm run test:watch

# Database
npm run db:generate
npm run db:push
npm run db:migrate

# Linting
npm run lint
npm run lint:fix
```

---

## 🎯 Próximos Passos Prioritários

1. **Finalizar Sistema de Convites**
   - Implementar API completa
   - Criar interface de usuário
   - Integrar com Clerk

2. **Projeções Fiscais**
   - Desenvolver cálculos tributários
   - Criar visualizações
   - Implementar cenários

3. **Otimizações de Performance**
   - Implementar cache Redis
   - Otimizar queries do banco
   - Adicionar compressão de assets

4. **Testes Automatizados**
   - Completar suite de testes
   - Configurar CI/CD
   - Implementar testes E2E

---

## 💡 Lembre-se Sempre

- **Consistência**: Siga os padrões estabelecidos
- **Performance**: Considere o impacto de cada mudança
- **UX**: Priorize a experiência do usuário
- **Segurança**: Valide tudo, confie em nada
- **Documentação**: Documente mudanças significativas
- **Testes**: Teste antes de fazer deploy

**Esta é uma aplicação financeira crítica. Qualidade e confiabilidade são fundamentais.** 