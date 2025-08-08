# 🔍 FEDERAL INVEST - CONFIGURAÇÃO DE AMBIENTE

## 🚨 ERRO "CLIENT SIDE ERROR" EM PRODUÇÃO

Se você está recebendo um "client side error" ao tentar criar conta em produção, o problema mais provável é a **ausência de variáveis de ambiente essenciais**.

## ✅ VARIÁVEIS OBRIGATÓRIAS PARA PRODUÇÃO

Configure essas variáveis no painel do seu provedor de hosting (Vercel, Netlify, etc.):

```env
# 🔐 CLERK AUTHENTICATION (OBRIGATÓRIO)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_SEU_PUBLISHABLE_KEY_AQUI"
CLERK_SECRET_KEY="sk_live_SEU_SECRET_KEY_AQUI"
CLERK_WEBHOOK_SECRET="whsec_SEU_WEBHOOK_SECRET_AQUI"

# 🗄️ DATABASE (OBRIGATÓRIO)
DATABASE_URL="postgresql://user:pass@host:port/database"

# 🌐 APPLICATION (IMPORTANTE)
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
NODE_ENV="production"

# 🔄 REDIRECTS (OPCIONAL - usa padrões se não definido)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

## 🔧 PASSO A PASSO PARA CORRIGIR

### 1. **Configurar Variáveis no Vercel/Netlify**

**Vercel:**
1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em `Settings` > `Environment Variables`
4. Adicione TODAS as variáveis obrigatórias acima

**Netlify:**
1. Acesse https://app.netlify.com
2. Selecione seu site
3. Vá em `Site settings` > `Environment variables`
4. Adicione as variáveis

### 2. **Configurar Clerk para Produção**

1. Acesse https://dashboard.clerk.com
2. **Criar ambiente de produção** (se usando teste):
   - Clique em "Create production instance"
   - Copie as novas chaves `pk_live_` e `sk_live_`
3. **Configurar webhook**:
   - Vá em `Webhooks` > `Add Endpoint`
   - URL: `https://seu-dominio.com/api/clerk-webhook`
   - Eventos: `user.created`, `user.updated`, `user.deleted`
   - Copie o webhook secret
4. **Configurar domínios**:
   - Vá em `Domains`
   - Adicione seu domínio de produção

### 3. **Redeployar**

Após configurar as variáveis, faça um redeploy:
- Vercel: Vai em `Deployments` > `Redeploy`
- Netlify: Vai em `Deploys` > `Trigger deploy`

## 🧪 TESTE NO DESENVOLVIMENTO

Para testar localmente, execute:

```bash
node diagnose-production.js
```

Este script vai mostrar quais variáveis estão ausentes.

## 📋 EXEMPLO DE CONFIGURAÇÃO COMPLETA

```env
# Produção - Configurar no painel do provedor
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_abcd1234..."
CLERK_SECRET_KEY="sk_live_xyz7890..."
CLERK_WEBHOOK_SECRET="whsec_webhook123..."
DATABASE_URL="postgresql://user:pass@ep-xyz.aws.neon.tech/database"
NEXT_PUBLIC_APP_URL="https://federal-invest.vercel.app"
NODE_ENV="production"
```

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ "Clerk keys not found"
- **Causa**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ausente
- **Solução**: Adicionar a variável no painel do provedor

### ❌ "Network Error" ou "Failed to fetch"
- **Causa**: CORS ou URL incorreta
- **Solução**: Configurar `NEXT_PUBLIC_APP_URL` corretamente

### ❌ "Database connection failed"
- **Causa**: `DATABASE_URL` incorreta ou ausente
- **Solução**: Verificar string de conexão

### ❌ "Webhook verification failed"
- **Causa**: `CLERK_WEBHOOK_SECRET` incorreta
- **Solução**: Recopiar o secret do painel do Clerk

### ❌ Usando chaves de teste em produção
- **Causa**: Chaves `pk_test_` em produção
- **Solução**: Trocar para chaves `pk_live_` do ambiente de produção

## 🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO

1. **Tente criar uma conta** na sua URL de produção
2. **Verifique os logs** no painel do provedor
3. **Acesse o banco** para confirmar que o usuário foi criado
4. **Teste o login** com a conta criada

## 📞 SUPORTE ADICIONAL

Se o problema persistir:
1. Verifique os logs de produção no painel do provedor
2. Teste as variáveis individualmente
3. Confirme que o webhook está recebendo eventos
4. Verifique se o banco de dados está acessível

---

**🎯 O erro "client side error" geralmente é resolvido configurando corretamente as variáveis de ambiente do Clerk em produção.** 