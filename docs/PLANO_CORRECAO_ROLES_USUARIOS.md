# 🚨 Plano de Correção - Sistema de Roles de Usuários

## 📋 Problemas Identificados

### 1. **Problema Principal**: Usuario Investidor sendo cadastrado como VIEWER
- **Localização**: Sistema de criação automática de usuários
- **Descrição**: Quando um investidor é cadastrado na página de investimentos, o convite é criado corretamente com role "INVESTOR", mas quando o usuário se registra no sistema, está sendo criado com role "VIEWER" por padrão

### 2. **Falta de Campos no Formulário de Usuários**
- **Localização**: `app/(dashboard)/usuarios/components/invite-user-modal.tsx`
- **Descrição**: O formulário de cadastro de usuários não possui campos opcionais como telefone, cidade, endereço e nome completo, que estão disponíveis no formulário de investidores

---

## 🕵️ Análise do Problema

### **Fluxo Atual (COM PROBLEMA)**:
1. **Admin cadastra investidor** → Sistema cria convite com role "INVESTOR" ✅
2. **Investidor recebe convite** → Email enviado com permissão de acesso ✅
3. **Investidor cria conta** → Sistema cria usuário com role "VIEWER" ❌ (PROBLEMA)
4. **Sistema faz redirect** → Usuário VIEWER é redirecionado incorretamente ❌

### **Fluxo Esperado (CORRETO)**:
1. **Admin cadastra investidor** → Sistema cria convite com role "INVESTOR" ✅
2. **Investidor recebe convite** → Email enviado com permissão de acesso ✅
3. **Investidor cria conta** → Sistema verifica convite e cria usuário com role "INVESTOR" ✅
4. **Sistema faz redirect** → Usuário INVESTOR é redirecionado para `/investidor/dashboard/[id]` ✅

---

## 🛠️ Localização dos Arquivos Problemáticos

### **1. Webhook do Clerk - PROBLEMA PRINCIPAL**
- **Arquivo**: `app/api/clerk-webhook/route.ts` (linha 132)
- **Problema**: Role padrão definida como "VIEWER" sem verificar convites existentes
```typescript
const role = adminEmails.includes(email?.toLowerCase() || '') ? "ADMIN" : "VIEWER"; // ❌ PROBLEMA
```

### **2. Schema do Banco de Dados**
- **Arquivo**: `db/schema.ts` (linha 31)
- **Problema**: Role padrão da tabela users definida como "VIEWER"
```typescript
role: userRoleEnum("role").default("VIEWER"), // ❌ PROBLEMA
```

### **3. API de Criação de Usuários**
- **Arquivo**: `app/api/user/me/route.ts` (linha 36)  
- **Status**: Este arquivo está correto, não é a causa do problema
```typescript
const role = user.publicMetadata?.role as string || "INVESTOR"; // ✅ CORRETO
```

### **2. Formulário de Usuários - Campos Faltantes**
- **Arquivo**: `app/(dashboard)/usuarios/components/invite-user-modal.tsx`
- **Problema**: Faltam campos: telefone, cidade, endereço, nome completo

---

## 📝 Plano de Correção Detalhado

### **ETAPA 1: Corrigir Webhook do Clerk - CRÍTICO** 🚨

#### **1.1 Atualizar Webhook do Clerk**
- **Arquivo**: `app/api/clerk-webhook/route.ts` (linha 132)
- **Ação**: Modificar lógica para verificar convites antes de definir role padrão
- **Implementação**:
  ```typescript
  // Verificar se existe convite para o email
  const invitation = await db.select({ role: invitations.role })
    .from(invitations)
    .where(eq(invitations.email, email))
    .limit(1);
  
  // Determinar role baseada em: 1) Admin especial, 2) Convite existente, 3) VIEWER padrão
  let role: string;
  if (adminEmails.includes(email?.toLowerCase() || '')) {
    role = "ADMIN";
  } else if (invitation.length > 0) {
    role = invitation[0].role; // Usar role do convite
  } else {
    role = "VIEWER"; // Fallback para usuários sem convite
  }
  ```

#### **1.2 Adicionar Import de Invitations no Webhook**
- **Arquivo**: `app/api/clerk-webhook/route.ts` (topo do arquivo)
- **Ação**: Adicionar import da tabela invitations
- **Implementação**:
  ```typescript
  import { users, invitations } from '@/db/schema'; // Adicionar invitations
  import { eq } from 'drizzle-orm'; // Verificar se já está importado
  ```

#### **1.3 Criar Utilitário de Verificação de Convites (OPCIONAL)**
- **Arquivo**: `lib/services/invitation-service.ts` (NOVO)
- **Função**: Centralizar lógica de verificação de convites para reuso futuro
- **Prioridade**: Baixa - pode ser implementado depois

### **ETAPA 2: Expandir Formulário de Usuários** 📝

#### **2.1 Atualizar Schema de Validação**
- **Arquivo**: `app/(dashboard)/usuarios/components/invite-user-modal.tsx`
- **Ação**: Adicionar campos opcionais ao `formSchema`
- **Implementação**:
  ```typescript
  const formSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(["ADMIN", "EDITOR", "INVESTOR", "VIEWER"]),
    type: z.enum(["NORMAL", "INVESTOR"]),
  });
  ```

#### **2.2 Adicionar Campos ao Formulário**
- **Arquivo**: `app/(dashboard)/usuarios/components/invite-user-modal.tsx`
- **Campos a adicionar**:
  - Nome completo (opcional)
  - Telefone (opcional)
  - Cidade (opcional)
  - Endereço (opcional)

### **ETAPA 3: Melhorar Sistema de Convites** 📧

#### **3.1 Expandir API de Convites**
- **Arquivo**: `app/api/invitations/route.ts`
- **Ação**: Aceitar dados opcionais de usuário no convite
- **Implementação**:
  ```typescript
  const createInvitationSchema = z.object({
    email: z.string().email("Email inválido"),
    role: z.enum(["ADMIN", "EDITOR", "INVESTOR", "VIEWER"]),
    type: z.enum(["NORMAL", "INVESTOR"]),
    // Dados opcionais do usuário
    name: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  });
  ```

#### **3.2 Criar Sistema de Pre-População**
- **Funcionalidade**: Quando usuário aceita convite, dados opcionais são usados para pré-popular perfil

### **ETAPA 4: Atualizar Middleware** 🔒

#### **4.1 Adicionar Logs Detalhados**
- **Arquivo**: `middleware.ts`
- **Ação**: Melhorar logs para debug de roles
- **Implementação**:
  ```typescript
  console.log(`🔍 User role verification: ${userRole} for email: ${userEmail}`);
  console.log(`🎯 Redirecting ${userRole} from ${path} to appropriate dashboard`);
  ```

### **ETAPA 5: Criar Testes de Validação** 🧪

#### **5.1 Teste de Fluxo Completo**
- **Arquivo**: `scripts/test-user-role-flow.js` (NOVO)
- **Ação**: Validar fluxo completo de cadastro → convite → registro → redirect

#### **5.2 Teste de Formulários**
- **Arquivo**: `__tests__/components/invite-user-modal.test.tsx` (NOVO)
- **Ação**: Validar campos opcionais e validações

---

## 🎯 Ordem de Implementação

### **Prioridade 1 - CRÍTICA** 🚨
1. **Corrigir Webhook do Clerk** → Resolver problema principal de roles
2. **Adicionar import de invitations** → Permitir consulta de convites no webhook
3. **Testar fluxo investidor** → Validar correção

### **Prioridade 2 - IMPORTANTE** ⚡
4. **Expandir formulário de usuários** → Adicionar campos opcionais
5. **Atualizar API de convites** → Aceitar dados opcionais
6. **Melhorar logs do middleware** → Facilitar debug

### **Prioridade 3 - MELHORIA** 🔧
7. **Criar testes automatizados** → Prevenir regressões
8. **Documentar novas funcionalidades** → Manter documentação atualizada

---

## 📊 Estrutura de Arquivos Afetados

```
├── app/
│   ├── api/
│   │   ├── clerk-webhook/route.ts              # 🔧 MODIFICAR (CRÍTICO)
│   │   └── invitations/route.ts                # 🔧 MODIFICAR
│   └── (dashboard)/usuarios/components/
│       └── invite-user-modal.tsx               # 🔧 MODIFICAR
├── db/
│   └── schema.ts                               # 🔧 VERIFICAR (role padrão)
├── lib/
│   └── services/
│       └── invitation-service.ts               # 🆕 CRIAR (opcional)
├── middleware.ts                               # 🔧 MODIFICAR (logs)
├── scripts/
│   └── test-user-role-flow.js                  # 🆕 CRIAR
└── __tests__/
    └── components/
        └── invite-user-modal.test.tsx          # 🆕 CRIAR
```

---

## ✅ Critérios de Sucesso

### **Teste 1: Fluxo Investidor**
- [ ] Admin cadastra investidor na página de investimentos
- [ ] Sistema cria convite com role "INVESTOR"
- [ ] Investidor cria conta no sistema
- [ ] Sistema cria usuário com role "INVESTOR" (não VIEWER)
- [ ] Usuário é redirecionado para `/investidor/dashboard/[id]`

### **Teste 2: Formulário de Usuários**
- [ ] Admin pode preencher campos opcionais (nome, telefone, cidade, endereço)
- [ ] Sistema aceita e processa campos opcionais
- [ ] Convite é criado com dados opcionais incluídos

### **Teste 3: Diferentes Tipos de Usuário**
- [ ] ADMIN → Acesso completo ao sistema
- [ ] EDITOR → Acesso a funções de edição
- [ ] INVESTOR → Redirecionado para dashboard de investidor
- [ ] VIEWER → Acesso limitado (se aplicável)

---

## 🚨 Riscos e Contingências

### **Risco 1: Usuarios Existentes**
- **Problema**: Usuários já cadastrados com role incorreta
- **Solução**: Script de correção de dados existentes
- **Arquivo**: `scripts/fix-existing-user-roles.js`

### **Risco 2: Quebra de Funcionalidades**
- **Problema**: Mudanças podem afetar funcionalidades existentes
- **Solução**: Testes abrangentes antes de deploy
- **Mitigação**: Deploy gradual com rollback plan

### **Risco 3: Convites Órfãos**
- **Problema**: Convites antigos sem usuários correspondentes
- **Solução**: Limpeza de convites expirados
- **Arquivo**: `scripts/cleanup-expired-invitations.js`

---

## 📋 Checklist de Implementação

### **Preparação**
- [ ] Backup do banco de dados
- [ ] Identificar usuários afetados existentes
- [ ] Preparar ambiente de testes

### **Desenvolvimento**
- [x] Corrigir webhook do Clerk (CRÍTICO) ✅ CONCLUÍDO
- [x] Adicionar import de invitations no webhook ✅ CONCLUÍDO
- [x] Melhorar logs do webhook para debug ✅ CONCLUÍDO
- [x] Criar script de teste para validação ✅ CONCLUÍDO
- [ ] Expandir formulário de usuários
- [ ] Atualizar API de convites (campos opcionais)
- [ ] Melhorar logs do middleware

### **Testes**
- [ ] Testar fluxo completo de cadastro investidor
- [ ] Testar formulário expandido de usuários
- [ ] Testar redirecionamentos por role
- [ ] Testar com usuários existentes

### **Deploy**
- [ ] Deploy em ambiente de homologação
- [ ] Validação com usuários reais
- [ ] Deploy em produção
- [ ] Monitoramento pós-deploy

---

## 📞 Próximos Passos

1. **Aprovação do plano** → Revisão e validação das correções propostas
2. **Início da implementação** → Seguir ordem de prioridades definida
3. **Testes unitários** → Validar cada correção individualmente
4. **Teste de integração** → Validar fluxo completo end-to-end
5. **Deploy gradual** → Implementar em etapas com validação

---

**⚠️ IMPORTANTE**: Este plano deve ser executado em ambiente de desenvolvimento/homologação primeiro, com testes completos antes de qualquer deploy em produção. 