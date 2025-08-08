# Integração Frontend-Backend no Federal Invest

Este documento fornece uma visão geral da arquitetura e integração entre o frontend e o backend na plataforma Federal Invest, incluindo fluxos de dados, padrões de API e melhores práticas para desenvolvimento.

## Arquitetura Geral

O Federal Invest utiliza uma arquitetura moderna baseada em Next.js, que permite tanto renderização do lado do servidor (SSR) quanto do lado do cliente (CSR), dependendo das necessidades de cada página.

### Componentes Principais:

1. **Frontend**: Next.js com TypeScript e Tailwind CSS
2. **Backend**: API Routes do Next.js
3. **Banco de Dados**: PostgreSQL com Drizzle ORM
4. **Autenticação**: Clerk
5. **Gerenciamento de Estado**: React Query para estado do servidor, React Context para estado global

## Fluxo de Dados

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Componentes    │ ──── │  Hooks/Queries  │ ──── │  API Routes     │
│  React          │      │  (React Query)  │      │  (Next.js)      │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                          │
                                                          │
                                                          ▼
                                               ┌─────────────────┐
                                               │                 │
                                               │  Drizzle ORM    │
                                               │                 │
                                               └─────────────────┘
                                                          │
                                                          │
                                                          ▼
                                               ┌─────────────────┐
                                               │                 │
                                               │  PostgreSQL     │
                                               │                 │
                                               └─────────────────┘
```

## Estrutura de Diretórios

A estrutura de diretórios do projeto segue uma organização que facilita a integração entre frontend e backend:

```
finance-platform/
  ├── app/                      # Páginas e rotas da aplicação (Next.js App Router)
  │   ├── (dashboard)/          # Páginas do dashboard administrativo
  │   ├── investidor/           # Páginas específicas para investidores
  │   └── api/                  # API Routes (backend)
  │       ├── finance/          # Endpoints financeiros
  │       ├── reports/          # Endpoints de relatórios
  │       └── users/            # Endpoints de usuários
  ├── components/               # Componentes React reutilizáveis
  ├── features/                 # Funcionalidades organizadas por domínio
  │   ├── finance/              # Funcionalidades financeiras
  │   │   ├── api/              # Funções de API do cliente
  │   │   ├── components/       # Componentes específicos
  │   │   └── hooks/            # Hooks personalizados
  │   └── ...
  ├── hooks/                    # Hooks globais
  ├── lib/                      # Utilitários e funções auxiliares
  │   ├── api/                  # Clientes de API centralizados
  │   └── ...
  └── db/                       # Configuração do banco de dados e esquemas
```

## Padrões de API

### Endpoints de API

Os endpoints de API seguem uma estrutura RESTful consistente:

- **GET**: Para buscar dados
- **POST**: Para criar novos registros
- **PUT/PATCH**: Para atualizar registros existentes
- **DELETE**: Para remover registros

### Formato de Resposta

Todas as respostas de API seguem um formato padronizado:

```typescript
// Resposta de sucesso
{
  data: T,           // Dados da resposta (tipado)
  success: true      // Indicador de sucesso
}

// Resposta de erro
{
  error: string,     // Mensagem de erro
  details?: any,     // Detalhes adicionais (opcional)
  success: false     // Indicador de falha
}
```

### Tratamento de Erros

Os erros são tratados de forma consistente em toda a aplicação:

1. **Erros de API**: Códigos HTTP apropriados (400, 401, 403, 404, 500)
2. **Erros de Validação**: Detalhes estruturados usando Zod
3. **Logging**: Todos os erros são registrados usando o sistema de logging centralizado

## Integração Frontend-Backend

### Camada de API do Cliente

A pasta `lib/api` contém clientes de API centralizados que encapsulam a lógica de comunicação com o backend:

```typescript
// Exemplo de cliente de API financeira
export async function getDashboardData(filters?: DashboardFilterParams): Promise<DashboardData> {
  try {
    // Construção de parâmetros de consulta
    const queryParams = new URLSearchParams();
    // ...

    // Chamada à API
    const response = await fetch(`/api/finance/dashboard?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    // Tratamento de erro e logging
    logger.error("Error fetching dashboard data", { error });
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }
}
```

### Hooks Personalizados

Os hooks personalizados em `hooks/` e `features/*/hooks/` fornecem uma interface elegante para componentes React consumirem dados da API:

```typescript
// Exemplo de hook para dados do dashboard
export function useDashboardData(options?: UseDashboardDataOptions) {
  const [filters, setFilters] = useState<DashboardFilterParams>(options?.initialFilters || {});
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: () => getDashboardData(filters),
    // Opções adicionais...
  });
  
  // Funções auxiliares, efeitos, etc.
  
  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    // ...
  };
}
```

### Componentes de UI

Os componentes de UI consomem hooks para exibir dados e gerenciar estados de carregamento:

```tsx
function DashboardPage() {
  const { data, isLoading, setFilters } = useDashboardData();
  
  // Renderização condicional baseada no estado de carregamento
  if (isLoading) {
    return <SkeletonDashboard />;
  }
  
  return (
    <div>
      <FilterBar onFilterChange={setFilters} />
      <StatsCards data={data.summary} />
      <FinancialCharts data={data.charts} />
    </div>
  );
}
```

## Autenticação e Autorização

A autenticação é gerenciada pelo Clerk, que fornece um sistema completo de identidade:

1. **Middleware**: Verifica a autenticação em rotas protegidas
2. **API Routes**: Usam `auth()` para verificar o usuário atual
3. **Componentes de UI**: Usam hooks do Clerk para acessar informações do usuário

### Exemplo de Proteção de API:

```typescript
export async function GET(req: Request) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Lógica da API...
}
```

## Validação de Dados

A validação de dados é realizada usando Zod tanto no frontend quanto no backend:

1. **Backend**: Validação de parâmetros de consulta e corpo da requisição
2. **Frontend**: Validação de formulários antes do envio

### Exemplo de Validação:

```typescript
// Schema de validação
const filterParamsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // ...
});

// Validação no backend
const result = filterParamsSchema.safeParse(params);
if (!result.success) {
  return NextResponse.json({ 
    error: "Invalid parameters", 
    details: result.error.errors 
  }, { status: 400 });
}
```

## Cache e Revalidação

O Federal Invest utiliza várias estratégias de cache para otimizar o desempenho:

1. **React Query**: Cache do lado do cliente com invalidação automática
2. **SWR**: Para dados que precisam ser atualizados frequentemente
3. **Cache Local**: Para dados que não mudam com frequência

### Exemplo de Configuração de Cache:

```typescript
const { data } = useQuery({
  queryKey: ['dashboardData', filters],
  queryFn: () => getDashboardData(filters),
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 30 * 60 * 1000, // 30 minutos
});
```

## Estados de Carregamento e Tratamento de Erros

A aplicação gerencia estados de carregamento e erros de forma consistente:

1. **Skeletons**: Componentes de esqueleto para estados de carregamento
2. **Spinners**: Para operações assíncronas menores
3. **Tratamento de Erros**: Componentes de fallback para diferentes tipos de erro

### Exemplo de Componente com Estados:

```tsx
function DataTable({ data, isLoading, error }) {
  if (isLoading) {
    return <SkeletonTable />;
  }
  
  if (error) {
    return <ErrorDisplay message={error.message} />;
  }
  
  if (!data || data.length === 0) {
    return <EmptyState />;
  }
  
  return <Table data={data} />;
}
```

## Melhores Práticas

### Para Desenvolvedores Frontend

1. **Use os hooks personalizados**: Evite chamar APIs diretamente nos componentes
2. **Implemente estados de carregamento**: Sempre considere a experiência do usuário durante carregamentos
3. **Valide dados de entrada**: Use Zod para validar dados antes de enviar ao backend
4. **Gerencie o cache**: Configure adequadamente as opções de cache do React Query
5. **Componentes reutilizáveis**: Crie componentes específicos para padrões comuns de UI

### Para Desenvolvedores Backend

1. **Valide todas as entradas**: Use Zod para validar parâmetros e corpo das requisições
2. **Estruture as respostas**: Siga o formato padronizado de resposta
3. **Trate erros adequadamente**: Retorne códigos HTTP apropriados e mensagens informativas
4. **Logging**: Use o sistema de logging para registrar eventos importantes
5. **Segurança**: Verifique autenticação e autorização em todos os endpoints

## Exemplos de Integração

### Fluxo Completo: Dashboard Financeiro

1. **Componente React**: `app/(dashboard)/page.tsx`
2. **Hook Personalizado**: `hooks/use-dashboard-data.ts`
3. **Cliente de API**: `lib/api/finance.ts`
4. **Endpoint de API**: `app/api/finance/dashboard/route.ts`
5. **Consulta ao Banco**: Usando Drizzle ORM para buscar dados

### Fluxo de Atualização de Dados

1. Usuário interage com um filtro no dashboard
2. O componente chama `setFilters` do hook `useDashboardData`
3. React Query invalida a consulta e dispara uma nova chamada à API
4. O endpoint de API processa os novos parâmetros de filtro
5. Drizzle ORM executa a consulta filtrada no banco de dados
6. Os dados retornam pelo mesmo caminho até o componente

## Conclusão

A integração frontend-backend no Federal Invest é projetada para ser robusta, tipada e fácil de manter. Seguindo os padrões e práticas descritos neste documento, os desenvolvedores podem criar novas funcionalidades de forma consistente e eficiente.

Para mais informações sobre implementações específicas, consulte os arquivos de código-fonte relevantes e a documentação adicional disponível na pasta `docs/`. 