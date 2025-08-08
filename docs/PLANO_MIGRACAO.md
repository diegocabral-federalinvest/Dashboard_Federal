# Plano de Migração para Federal Invest App

Este documento apresenta o plano detalhado para transformar a aplicação financeira atual em um sistema completo para a Federal Invest, seguindo os requisitos específicos e o design proposto.

## 1. Reestruturação do Banco de Dados (Dias 1-2)

### 1.1 Adaptar Schema do Banco de Dados
- Modificar o schema atual para incluir as novas entidades:
  - `Investors`: Gerenciar investidores e seus dados
  - `Expenses`: Registrar despesas categorizadas
  - `Revenues`: Controlar receitas e entradas
  - `Investments`: Rastrear investimentos e retornos
  - `Reports`: Armazenar relatórios gerados (DRE, projeções)
  - `Invites`: Gerenciar convites de acesso ao sistema
  - `Notifications`: Sistema de notificações para usuários

### 1.2 Definir Relacionamentos
- Estabelecer relações entre entidades:
  - Investidores -> Investimentos (1:N)
  - Usuários -> Permissões (N:N)
  - Categorias -> Despesas (1:N)

### 1.3 Adaptar Migrações
- Criar scripts de migração para implementar o novo schema
- Manter compatibilidade com o banco PostgreSQL/Neon

## 2. Rebranding e UI (Dias 3-4)

### 2.1 Redesign Visual
- Atualizar a paleta de cores para o azul escuro da Federal Invest e preto:
  ```css
  /* Cores primárias */
  --federal-dark-blue: #0a192f; /* Azul escuro corporativo */
  --federal-black: #121212;     /* Preto para contraste */
  --federal-accent: #3a86ff;    /* Azul para destaques */
  ```

- Adaptar componentes existentes para o novo design, incluindo:
  - Cards
  - Tabelas
  - Botões
  - Navegação

### 2.2 Atualização de Layout
- Redesenhar o layout da aplicação para refletir a identidade da Federal Invest
- Criar um modo escuro que harmonize com a identidade visual
- Implementar um sistema de grid responsivo para diferentes dispositivos

### 2.3 Atualização de Assets
- Atualizar logo, favicon e outros assets visuais
- Criar novos ícones e ilustrações alinhados à marca

## 3. Adaptação de Funcionalidades Principais (Dias 5-8)

### 3.1 Dashboard Principal
- Criar dashboard com KPIs principais:
  - Resumo financeiro
  - Indicadores de desempenho
  - Alertas e notificações
  - Gráficos de performance

### 3.2 Módulo DRE (Demonstração do Resultado do Exercício)
- Implementar visualização completa de DRE
- Criar formulários para entrada de despesas e receitas
- Configurar cálculos automáticos de resultado líquido

### 3.3 Gestão de Investidores
- Criar CRUD completo para investidores
- Implementar visualização de histórico de investimentos
- Adicionar funcionalidade de registro de aportes e retiradas

### 3.4 Projeções de Impostos
- Desenvolver sistema de cálculo de projeções tributárias
- Implementar visualizações de cenários fiscais
- Criar relatórios exportáveis

### 3.5 Upload e Processamento de CSV
- Adaptar sistema para importação de dados via CSV
- Criar validações e processamento dos dados importados
- Implementar feedback visual do processamento

## 4. Sistema de Autenticação e Permissões (Dias 9-10)

### 4.1 Configuração do Clerk
- Ajustar Clerk para o modelo de acesso por convite
- Implementar allow-list para e-mails autorizados
- Configurar webhooks para validação de usuários

### 4.2 Sistema de Convites
- Criar funcionalidade para administradores enviarem convites
- Implementar fluxo de aceitação de convites
- Desenvolver gerenciamento de permissões por perfil

### 4.3 Perfis de Acesso
- Implementar distinção entre administradores e clientes
- Configurar rotas protegidas com base em perfil
- Implementar middleware para verificação de permissões

## 5. API e Integração de Dados (Dias 11-13)

### 5.1 Endpoints da API
- Adaptar os endpoints existentes para o novo modelo de dados
- Criar novos endpoints para as funcionalidades específicas da Federal Invest
- Implementar validação e sanitização de dados

### 5.2 Serviços de Dados
- Desenvolver serviços para cálculos financeiros complexos
- Implementar cache e otimização de consultas
- Configurar revalidação de dados em tempo real

### 5.3 React Query
- Adaptar hooks de consulta para os novos endpoints
- Implementar estratégias de invalidação de cache
- Otimizar performance de carregamento

## 6. Testes e Otimização (Dias 14-15)

### 6.1 Testes Unitários e de Integração
- Desenvolver testes para as novas funcionalidades
- Verificar integridade do sistema após adaptações
- Validar fluxos de usuário

### 6.2 Otimização de Performance
- Implementar lazy loading para componentes pesados
- Otimizar renderização com memoização
- Reduzir tamanho de bundle e requisições

### 6.3 Refinamentos de UX
- Ajustar feedback visual para operações
- Melhorar acessibilidade e responsividade
- Implementar animações sutis e transições

## 7. Implementação de Funcionalidades Avançadas (Dias 16-20)

### 7.1 Sistema de Notificações
- Implementar notificações em tempo real
- Configurar envio de e-mails para alertas importantes
- Criar centro de notificações para usuários

### 7.2 Relatórios Avançados
- Desenvolver geração de relatórios personalizados
- Implementar exportação em diferentes formatos (PDF, Excel)
- Criar visualizações comparativas de períodos

### 7.3 Funcionalidades de Colaboração
- Implementar anotações e comentários em transações
- Criar sistema de registro de atividades (audit log)
- Desenvolver compartilhamento controlado de relatórios

## 8. Polimento e Lançamento (Dias 21-22)

### 8.1 Revisão Final
- Realizar revisão de código e refatoração
- Garantir que todos os requisitos foram atendidos
- Verificar consistência da experiência do usuário

### 8.2 Preparação para Produção
- Configurar variáveis de ambiente para produção
- Verificar segurança e proteção de dados
- Preparar scripts de deploy

### 8.3 Documentação
- Criar documentação técnica do sistema
- Desenvolver guias de usuário
- Documentar processos de manutenção

## 9. Estrutura de Arquivos Proposta

```
/finance-platform/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── invite/
│   ├── (dashboard)/
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── dre/                    # Demonstração de Resultados
│   │   ├── investors/              # Gestão de investidores
│   │   ├── expenses/               # Gestão de despesas
│   │   ├── revenues/               # Gestão de receitas
│   │   ├── investments/            # Gestão de investimentos
│   │   ├── reports/                # Relatórios e análises
│   │   └── tax-projections/        # Projeções de impostos
│   ├── api/
│   │   ├── accounts/
│   │   ├── investors/
│   │   ├── expenses/
│   │   ├── revenues/
│   │   ├── investments/
│   │   ├── reports/
│   │   ├── invites/
│   │   ├── clerk-webhook/
│   │   └── import/                 # Processamento de CSV
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         # Componentes base (shadcn)
│   ├── dashboard/                  # Componentes do dashboard
│   ├── charts/                     # Gráficos e visualizações
│   ├── forms/                      # Formulários reutilizáveis
│   ├── tables/                     # Tabelas de dados
│   ├── data-table.tsx              # Tabela avançada customizada
│   ├── header.tsx                  # Cabeçalho do app
│   ├── navigation.tsx              # Navegação principal
│   └── loading-states/             # Estados de carregamento
├── features/
│   ├── investors/                  # Funcionalidades de investidores
│   ├── expenses/                   # Funcionalidades de despesas
│   ├── revenues/                   # Funcionalidades de receitas
│   ├── investments/                # Funcionalidades de investimentos
│   ├── reports/                    # Funcionalidades de relatórios
│   ├── user-management/            # Gestão de usuários e convites
│   └── import-export/              # Importação e exportação de dados
├── db/
│   ├── schema.ts                   # Schema do banco de dados
│   └── drizzle.ts                  # Configuração do Drizzle ORM
├── lib/
│   ├── utils.ts                    # Utilitários
│   ├── hono.ts                     # Cliente API
│   ├── validators.ts               # Validadores de formulários
│   ├── formatters.ts               # Formatadores de valores
│   └── constants.ts                # Constantes do sistema
├── providers/                      # Providers React
└── hooks/                          # Hooks customizados
```

## 10. Considerações Técnicas

### 10.1 Padrões de Código
- Seguir as diretrizes de Clean Code e princípios SOLID
- Manter métodos pequenos e coesos (menos de 20 linhas)
- Garantir encapsulamento adequado
- Evitar duplicação de código

### 10.2 Performance
- Utilizar React Query para gerenciamento de estado do servidor
- Implementar memoização para evitar re-renderizações desnecessárias
- Utilizar carregamento assíncrono para componentes pesados
- Otimizar consultas ao banco de dados

### 10.3 Segurança
- Validar e sanitizar todas as entradas do usuário
- Proteger rotas com autenticação e autorização
- Implementar proteção contra ataques comuns
- Seguir as melhores práticas de segurança do Next.js

Este plano fornece um roteiro detalhado para adaptar o código existente e transformá-lo no aplicativo Federal Invest, mantendo os requisitos especificados e seguindo as melhores práticas de desenvolvimento.