# 🔑 CREDENCIAIS DE LOGIN - Federal Invest

## ✅ **Banco Resetado com Sucesso!**

O banco de dados foi completamente resetado e recriado com NextAuth. Todas as tabelas foram criadas e os usuários estão prontos para login.

---

## 👥 **USUÁRIOS DISPONÍVEIS**

### 🔵 **Super Admin** (Acesso Total)
- **Email:** `admin@federalinvest.com`
- **Senha:** `admin123!@#`
- **Role:** ADMIN
- **Descrição:** Conta principal com todos os privilégios

### 🟡 **Pedro Eli** (Administrador)
- **Email:** `pedro-eli@hotmail.com`
- **Senha:** `Galod1234@`
- **Role:** ADMIN
- **Descrição:** Sua conta pessoal com privilégios de administrador

### 🟢 **Editor Test** (Editor)
- **Email:** `editor@test.com`
- **Senha:** `editor123`
- **Role:** EDITOR
- **Descrição:** Usuário de teste com privilégios de edição

### 🟣 **Viewer Test** (Visualizador)
- **Email:** `viewer@test.com`
- **Senha:** `viewer123`
- **Role:** VIEWER
- **Descrição:** Usuário de teste apenas para visualização

---

## 🚀 **COMO FAZER LOGIN**

1. **Acesse:** `http://localhost:3000`
2. **Clique em:** "Login" ou "Comece já"
3. **Use qualquer uma das credenciais acima**
4. **Será redirecionado para o dashboard**

---

## 🛠️ **COMANDOS DO BANCO (Drizzle)**

### Comandos Básicos
```bash
npm run db:push              # Aplicar mudanças do schema
npm run db:studio            # Interface visual do banco
npm run db:check             # Verificar diferenças no schema
```

### Comandos de Reset
```bash
npm run db:reset-complete    # 🆕 RESET TOTAL + criar usuários
npm run db:verify-schema     # Verificar integridade do schema
npm run db:create-users      # Criar apenas usuários de teste
```

### Outros Comandos
```bash
npm run db:seed              # Preencher com dados completos
npm run db:reset             # Reset interativo (Drizzle)
```

---

## 📊 **STATUS DO SISTEMA**

✅ **NextAuth configurado** - Sistema de autenticação funcionando  
✅ **Banco limpo** - Sem referências ao Clerk  
✅ **4 usuários criados** - Todos com senhas hash  
✅ **25 tabelas** - Estrutura completa recriada  
✅ **Sessões funcionais** - Login/logout operacional  

---

## 🔧 **TROUBLESHOOTING**

### Se não conseguir fazer login:
1. Verifique se o servidor está rodando: `npm run dev`
2. Confirme as variáveis de ambiente no `.env.local`
3. Execute: `npm run db:verify-schema`

### Se o banco estiver com problemas:
1. Execute: `npm run db:reset-complete`
2. Aguarde a conclusão
3. Teste login novamente

### Se precisar recriar apenas usuários:
1. Execute: `npm run db:create-users`
2. Use as credenciais desta lista

---

## 📱 **PRÓXIMOS PASSOS**

1. **Teste o login** com qualquer conta acima
2. **Explore o dashboard** com privilégios de admin
3. **Configure funcionalidades** específicas do sistema
4. **Importe dados** se necessário

---

**🎉 O sistema está pronto para uso com NextAuth!**

*Arquivo criado em: ${new Date().toLocaleString('pt-BR')}* 