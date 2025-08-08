# 🚨 SETUP IMEDIATO - RESOLVER LOGIN AGORA

## 🎯 PROBLEMA:
Login redirecionando para `/api/auth/error` porque NextAuth não tem variáveis de ambiente.

## ⚡ SOLUÇÃO RÁPIDA (5 minutos):

### 1. **Criar `.env.local` na raiz:**

Crie o arquivo `.env.local` ao lado do `package.json`:

```env
# 🔐 NextAuth - OBRIGATÓRIO
NEXTAUTH_SECRET="federal-invest-dev-secret-2024-xyz"
NEXTAUTH_URL="http://localhost:3000"

# 🗄️ Database - TEMPORÁRIO (usar SQLite para teste rápido)
DATABASE_URL="file:./dev.db"

# 📧 Email - OPCIONAL (deixar vazio por enquanto)
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_FROM=""
```

### 2. **Instalar SQLite (para teste rápido):**

```bash
npm install better-sqlite3
```

### 3. **Ajustar configuração do Drizzle temporariamente:**

Edite `drizzle.config.ts`:

```typescript
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local"}); // Mudança aqui

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "sqlite", // Mudança aqui
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 4. **Rodar migração:**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5. **Reiniciar servidor:**

```bash
npm run dev
```

### 6. **Testar login:**

- Acesse: `http://localhost:3000/sign-in`
- Use: `admin@federalinvest.com` / `admin123!@#`

## 🔍 VERIFICAR SE FUNCIONOU:

Execute este comando:

```bash
node -e "require('dotenv').config({path:'.env.local'}); console.log('✅ NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'OK' : '❌ FALTANDO'); console.log('✅ NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'OK' : '❌ FALTANDO'); console.log('✅ DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : '❌ FALTANDO');"
```

## 📊 RESULTADO ESPERADO:

```
✅ NEXTAUTH_SECRET: OK
✅ NEXTAUTH_URL: OK  
✅ DATABASE_URL: OK
```

## 🎯 SE AINDA NÃO FUNCIONAR:

### **Problema A**: Erro de banco
```bash
# Limpar e recriar banco
rm -f dev.db
npx drizzle-kit migrate
```

### **Problema B**: Usuário não existe
```bash
# Criar usuário admin manualmente no banco
npm run db:seed
```

### **Problema C**: Ainda dá erro
- Verifique se o arquivo `.env.local` está na raiz correta
- Confirme se reiniciou o servidor
- Abra DevTools e veja erros no console

## 🚀 APÓS RESOLVER:

Depois que o login funcionar, você pode:
1. Migrar para PostgreSQL (Neon/Supabase)
2. Fazer seed completo dos dados
3. Configurar para produção

---

**⏰ FAÇA ISSO AGORA E TESTE IMEDIATAMENTE!** 