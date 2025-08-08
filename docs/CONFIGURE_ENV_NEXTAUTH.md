# 🚨 CONFIGURAÇÃO URGENTE - NEXTAUTH ENVIRONMENT

## ❌ PROBLEMA IDENTIFICADO:
As variáveis de ambiente necessárias para o NextAuth não estão definidas. Por isso o login está falhando e redirecionando para `/api/auth/error`.

## 🔧 SOLUÇÃO IMEDIATA:

### 1. **Crie o arquivo `.env.local` na raiz do projeto:**

```bash
# Na raiz do projeto (federal-novo/)
touch .env.local
```

### 2. **Adicione este conteúdo ao `.env.local`:**

```env
# 🔐 NextAuth Configuration
NEXTAUTH_SECRET="federal-invest-super-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"

# 🗄️ Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/federal_invest_db"

# 📧 Email Configuration (opcional por enquanto)
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_FROM=""

# 🔄 OAuth Providers (para o futuro)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. **Ajuste a DATABASE_URL:**

Se você tem um banco PostgreSQL local, ajuste a URL. Se não tem, pode usar SQLite temporariamente:

```env
# Para SQLite (desenvolvimento):
DATABASE_URL="file:./dev.db"

# Para PostgreSQL local:
DATABASE_URL="postgresql://postgres:senha@localhost:5432/federal_invest"

# Para Neon/Supabase (produção):
DATABASE_URL="postgresql://usuario:senha@host:5432/database"
```

### 4. **Reinicie o servidor:**

```bash
npm run dev
```

### 5. **Teste o login novamente:**

Use as credenciais:
- **Email:** `admin@federalinvest.com`
- **Senha:** `admin123!@#`

## 🎯 POR QUE ISSO RESOLVE:

1. **NEXTAUTH_SECRET** - Necessário para assinar tokens JWT
2. **NEXTAUTH_URL** - Define a URL base para callbacks
3. **DATABASE_URL** - Conecta com o banco para verificar credenciais

## 🔍 VERIFICAÇÃO:

Após criar o arquivo, execute para verificar:

```bash
node -e "console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Definida' : 'NÃO DEFINIDA'); console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Definida' : 'NÃO DEFINIDA'); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'NÃO DEFINIDA');"
```

## 🚨 IMPORTANTE:

- O arquivo `.env.local` deve estar na **raiz do projeto** (mesmo nível do `package.json`)
- **Não commite** este arquivo no Git (já está no .gitignore)
- Para produção, configure essas variáveis no painel do Vercel/Netlify

---

**Execute estes passos e teste o login novamente. O erro `/api/auth/error` deve ser resolvido!** 