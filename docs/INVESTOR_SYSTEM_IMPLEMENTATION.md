# Sistema de Investidores - Federal Invest

## 📋 Visão Geral

Este documento descreve a implementação completa do sistema de gestão de investidores no Federal Invest, incluindo cadastro, gestão de aportes/retiradas, integração com sistema de convites e dashboard individual para investidores.

## 🏗️ Arquitetura do Sistema

### Fluxo Principal
1. **Cadastro de Investidor** → Administrador cadastra investidor
2. **Convite Automático** → Sistema cria convite e permissão de acesso
3. **Registro de Usuário** → Investidor cria conta no sistema
4. **Link Automático** → Sistema conecta usuário ao perfil de investidor
5. **Dashboard Individual** → Investidor acessa seus dados em tempo real

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `investors`
- `id` - Identificador único
- `name` - Nome completo
- `email` - Email (único, usado para linking)
- `birthday` - Data de nascimento
- `city` - Cidade
- `address` - Endereço
- `startedInvestingAt` - Data de início dos investimentos
- `endedInvestingAt` - Data de término (opcional)

#### `userInvestorLinks`
- `id` - Identificador único
- `userId` - Referência ao usuário no sistema
- `investorId` - Referência ao perfil de investidor
- Permite conectar contas de usuário aos perfis de investidor

#### `contributionsOrWithdrawals`
- Tabela existente que armazena aportes e retiradas
- Conectada aos investidores via `investorId`

#### `invitations`
- Sistema de convites expandido para incluir investidores
- `type` pode ser 'INVESTOR' para investidores

## 🚀 Componentes Implementados

### 1. Modal de Cadastro de Investidores
**Arquivo:** `features/investments/components/investor-registration-modal.tsx`

**Funcionalidades:**
- Formulário completo com validação (nome, email, nascimento, cidade, endereço)
- Integração automática com sistema de convites
- Feedback visual de sucesso/erro
- Validação de email duplicado

**Uso:**
```typescript
<InvestorRegistrationModal
  open={isOpen}
  onOpenChange={setIsOpen}
  onSuccess={() => console.log('Investidor cadastrado!')}
/>
```

### 2. API de Investidores
**Arquivo:** `app/api/investors/route.ts`

**Endpoints:**
- `POST /api/investors` - Cadastrar novo investidor
- `GET /api/investors` - Listar todos os investidores

**Funcionalidades:**
- Validação de dados com Zod
- Verificação de email duplicado
- Criação automática de convite e permissão
- Logs detalhados de operações

### 3. API de Link Usuário-Investidor
**Arquivo:** `app/api/investors/link-user/route.ts`

**Endpoints:**
- `POST /api/investors/link-user` - Conectar usuário ao perfil
- `GET /api/investors/link-user` - Verificar conexão existente

**Funcionalidades:**
- Link automático baseado no email
- Verificação de links existentes
- Suporte a multiple tentativas de conexão

### 4. Dashboard Individual do Investidor
**Arquivo:** `app/investidor/dashboard/[id]/page.tsx`

**Funcionalidades:**
- **Conexão Automática**: Conecta usuário ao perfil na primeira visita
- **Dados Reais**: Busca aportes/retiradas reais do banco
- **Simulação de Rendimentos**: Mostra rendimentos em tempo real
- **Múltiplas Abas**: Visão geral, histórico e análise
- **Gráficos Interativos**: Evolução patrimonial e composição
- **Estados de Loading**: Feedback visual durante carregamento

**Seções:**
- **Overview**: Cards com totais e gráfico de evolução
- **History**: Histórico de transações com animações
- **Analysis**: Análises detalhadas e metas

### 5. Componente de Auto-Link
**Arquivo:** `components/investor-auto-link.tsx`

**Funcionalidades:**
- Executa automaticamente no login
- Tenta conectar usuário a perfil de investidor
- Logs detalhados de sucesso/falha
- Não interfere na experiência do usuário

### 6. Acesso Rápido no Dashboard Principal
**Arquivo:** `components/dashboard/investor-quick-access.tsx`

**Funcionalidades:**
- Aparece apenas para usuários-investidores
- Mostra resumo financeiro
- Link direto para dashboard individual
- Design integrado com tema Federal Invest

## 🔄 Integração com Sistema Existente

### Página de Investimentos
**Modificações em:** `app/(dashboard)/investimentos/client.tsx`

**Novas Funcionalidades:**
- Botão "Cadastrar Investidor" 
- Lista real de investidores cadastrados
- Integração com modal de cadastro
- Atualização automática após cadastro

### Dashboard Principal
**Modificações em:** `app/(dashboard)/client.tsx`

**Adições:**
- Componente InvestorQuickAccess
- Auto-detecção de usuários investidores
- Interface contextual baseada no tipo de usuário

### Layout da Aplicação
**Modificações em:** `app/(dashboard)/layout.tsx`

**Adições:**
- Componente InvestorAutoLink
- Execução automática em toda sessão
- Conexão silenciosa de investidores

## 📊 Hooks e APIs Customizados

### `useGetInvestors`
**Arquivo:** `features/investments/api/use-get-investors.ts`

```typescript
const { data: investors, isLoading, refetch } = useGetInvestors();
```

**Funcionalidades:**
- Cache automático com React Query
- Lista completa de investidores
- Atualização manual via refetch

## 🎯 Fluxo de Uso Completo

### Para Administradores:
1. Acessa página de **Investimentos**
2. Clica em **"Cadastrar Investidor"**
3. Preenche formulário completo
4. Sistema automaticamente:
   - Cria perfil do investidor
   - Gera convite para acesso
   - Adiciona email às permissões

### Para Investidores:
1. Recebe convite (via sistema de permissões)
2. Cria conta no Federal Invest
3. Sistema automaticamente:
   - Detecta email do investidor
   - Conecta usuário ao perfil
   - Habilita funcionalidades específicas
4. Pode acessar:
   - **Dashboard principal** com área específica
   - **Dashboard individual** em `/investidor/dashboard/[id]`
   - Dados de investimentos em tempo real

## 🔒 Segurança e Validações

### Validações Implementadas:
- Email único por investidor
- Validação de dados com Zod schemas
- Autenticação obrigatória em todas as APIs
- Verificação de permissões por email

### Logs e Monitoramento:
- Log completo de cadastros
- Log de tentativas de conexão
- Log de acesso ao dashboard individual
- Tratamento de erros detalhado

## 🎨 UI/UX Highlights

### Design System:
- Cores Federal Invest (#0A192F, #3A86FF)
- Componentes glass morphism
- Animações com Framer Motion
- Estados de loading consistentes

### Responsividade:
- Mobile-first design
- Adaptação automática de layouts
- Touch-friendly na mobile

### Feedback Visual:
- Estados de sucesso/erro claros
- Loading skeletons
- Notificações contextuais
- Animações suaves

## 🚀 Próximos Passos

### Melhorias Sugeridas:
1. **Notificações Email**: Enviar email ao investidor quando cadastrado
2. **Dashboard Administrativo**: Painel para gestão completa de investidores
3. **Relatórios Específicos**: Relatórios individuais por investidor
4. **Comunicação Interna**: Sistema de mensagens investidor-admin
5. **Histórico Detalhado**: Logs de todas as interações

### Funcionalidades Avançadas:
1. **Metas de Investimento**: Sistema de metas personalizadas
2. **Alertas Automáticos**: Notificações baseadas em performance
3. **Comparativos**: Benchmarking entre investidores
4. **API Externa**: Endpoints para apps mobile futuros

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `features/investments/components/investor-registration-modal.tsx`
- `features/investments/api/use-get-investors.ts`
- `app/api/investors/route.ts`
- `app/api/investors/link-user/route.ts`
- `components/investor-auto-link.tsx`
- `components/dashboard/investor-quick-access.tsx`

### Arquivos Modificados:
- `app/(dashboard)/investimentos/client.tsx`
- `app/(dashboard)/client.tsx`
- `app/(dashboard)/layout.tsx`
- `app/investidor/dashboard/[id]/page.tsx`
- `features/investments/components/index.ts`

## ✅ Conclusão

O sistema de investidores foi implementado com sucesso, oferecendo:
- **Cadastro simplificado** para administradores
- **Experiência seamless** para investidores
- **Integração completa** com sistema existente
- **Dados em tempo real** e visualizações avançadas
- **Segurança robusta** e logs detalhados

O sistema está pronto para produção e pode ser expandido conforme necessidades futuras do negócio. 