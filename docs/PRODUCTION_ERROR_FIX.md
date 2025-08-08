# 🚨 ERRO "CLIENT SIDE ERROR" EM PRODUÇÃO - SOLUÇÃO

## ⚡ SOLUÇÃO RÁPIDA

O erro "client side error" ao criar conta em produção é causado por **variáveis de ambiente ausentes**. Siga estes passos:

### 1. **Verificar Configuração Atual**
Execute no seu projeto local:
```bash
npm run check-env
```

### 2. **Configurar Variáveis no Vercel**
Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

Adicione essas variáveis **OBRIGATÓRIAS**:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_SEU_KEY_AQUI
CLERK_SECRET_KEY=sk_live_SEU_SECRET_AQUI  
CLERK_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_AQUI
DATABASE_URL=postgresql://seu_banco_aqui
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 3. **Configurar Clerk para Produção**
No painel do Clerk (https://dashboard.clerk.com):

1. **Criar instância de produção** (se usando teste)
2. **Configurar webhook**: 
   - URL: `https://seu-dominio.vercel.app/api/clerk-webhook`
   - Eventos: `user.created`, `user.updated`, `user.deleted`
3. **Adicionar domínio** na configuração
4. **Copiar as chaves** `pk_live_` e `sk_live_`

### 4. **Redeploy**
No Vercel: Deployments → Redeploy

## 🔍 PROBLEMAS ESPECÍFICOS

### ❌ "TypeError: Failed to fetch"
**Causa**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ausente
**Solução**: Adicionar a variável no Vercel

### ❌ "Network request failed"  
**Causa**: CORS ou `NEXT_PUBLIC_APP_URL` incorreta
**Solução**: Configurar URL corretamente

### ❌ "Authentication failed"
**Causa**: Chaves de teste em produção
**Solução**: Usar chaves `pk_live_` e `sk_live_`

## ✅ LISTA DE VERIFICAÇÃO

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Chaves de produção do Clerk (`pk_live_`, `sk_live_`)
- [ ] Webhook configurado no Clerk
- [ ] Domínio adicionado no Clerk
- [ ] `NEXT_PUBLIC_APP_URL` com URL correta
- [ ] Redeploy realizado

## 🧪 TESTAR A CORREÇÃO

1. Acesse sua URL de produção
2. Tente criar uma conta nova
3. Verifique se não há mais erro
4. Confirme que o usuário foi criado no banco

## 📋 CONFIGURAÇÃO COMPLETA DE EXEMPLO

```env
# No painel do Vercel - Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_abc123...
CLERK_SECRET_KEY=sk_live_xyz789...
CLERK_WEBHOOK_SECRET=whsec_webhook123...
DATABASE_URL=postgresql://user:pass@ep-abc.aws.neon.tech/db
NEXT_PUBLIC_APP_URL=https://federal-invest.vercel.app
NODE_ENV=production
```

---

**🎯 Esta configuração deve resolver 99% dos problemas de "client side error" em produção.**

Precisa de mais ajuda? Verifique `ENVIRONMENT_SETUP.md` para guia completo. 