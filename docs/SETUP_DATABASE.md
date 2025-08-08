# 🗄️ Configuração do Banco de Dados - Federal Invest

## 📋 Pré-requisitos

Para executar o seed completo do banco de dados, você precisa configurar:

1. **DATABASE_URL** - URL de conexão com PostgreSQL/Neon
2. **Chaves do Clerk** - Para criação automática de usuários

## 🔧 Configuração

### 1. Criar arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# 🗄️ DATABASE
DATABASE_URL="postgresql://username:password@hostname:port/database"

# 🔐 CLERK
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-key-here"
CLERK_SECRET_KEY="sk_test_your-secret-key-here"

# 🔗 URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# 🌐 APP
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2. Obter DATABASE_URL

**Opção A - Neon (Recomendado):**
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string

**Opção B - PostgreSQL Local:**
1. Instale PostgreSQL
2. Crie um banco de dados
3. Use: `postgresql://user:password@localhost:5432/federal_invest`

### 3. Configurar Clerk

1. Acesse [clerk.com](https://clerk.com)
2. Crie uma conta e projeto
3. Na dashboard, copie as chaves:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 4. Liberar emails no Clerk

No painel do Clerk, adicione estes emails à lista de usuários permitidos:

- pedro-eli@hotmail.com
- avel@hotmail.com
- avel2@hotmail.com
- avel3@hotmail.com
- avel4@hotmail.com
- avel5@hotmail.com
- avel6@hotmail.com
- avel7@hotmail.com
- avel8@hotmail.com
- avel9@hotmail.com
- avel10@hotmail.com

## 🚀 Executar Seed

Após configurar o `.env.local`:

```bash
# Executar seed completo
npm run db:seed

# Ou resetar e fazer seed
npm run db:reset:seed
```

## 📊 O que será criado

O seed completo criará:

- **👥 11 usuários** (pedro-eli como ADMIN + avel1-10)
- **💼 15 investidores** com dados realistas
- **💰 ~75 operações** de aportes/resgates
- **💸 500 despesas** categorizadas
- **💵 200 receitas** de serviços
- **📊 150 registros** de dados financeiros CSV
- **📈 48 resultados** mensais (2023-2024)
- **📊 16 resultados** trimestrais
- **🎯 16 deduções** fiscais
- **📁 7 uploads** de arquivos
- **🔔 25 notificações**
- **✉️ 4 convites** pendentes
- **🔗 8 links** usuário-investidor
- **🔐 Permissões** para todos os usuários

## 🔑 Credenciais de Teste

**Admin Principal:**
- Email: `pedro-eli@hotmail.com`
- Senha: `Galod1234@`
- Role: `ADMIN`

**Usuários de Teste:**
- Emails: `avel@hotmail.com` até `avel10@hotmail.com`
- Senha: `Galod1234@`
- Roles: Distribuídas entre `ADMIN`, `EDITOR`, `VIEWER`, `INVESTOR`

## ⚠️ Importante

- O seed **limpa todas as tabelas** antes de inserir dados novos
- Use apenas em ambiente de desenvolvimento
- Dados gerados são **fictícios** para teste
- Configure seu banco de produção separadamente

## 🆘 Problemas Comuns

**Erro: "DATABASE_URL não está definida"**
- Verifique se criou o arquivo `.env.local`
- Confirme se a URL do banco está correta

**Erro: "uniqueness_violation"**
- Emails já existem no Clerk
- O script tenta reutilizar usuários existentes

**Erro de conexão com banco**
- Verifique se o banco está ativo
- Confirme as credenciais na URL

## 📞 Suporte

Em caso de problemas:
1. Verifique a configuração do `.env.local`
2. Confirme se o banco está acessível
3. Teste a conexão com o Clerk
4. Execute `npm run db:check` para verificar o schema 