# 🧪 TESTE MANUAL DE LOGIN - Diagnóstico

## 📋 **Status Atual dos Testes:**

✅ **Banco de dados:** Todos os usuários criados corretamente  
✅ **Senhas:** Todas as senhas hash funcionando  
✅ **NextAuth API:** Endpoints funcionando  
⚠️ **Problema identificado:** Erro CSRF no login  

---

## 🔧 **TESTE MANUAL - PASSO A PASSO**

### **1. Acesse a aplicação:**
```
http://localhost:3000
```

### **2. Vá para a página de login:**
- Clique em "Login" ou "Comece já"
- Ou acesse diretamente: `http://localhost:3000/sign-in`

### **3. Abra as ferramentas de desenvolvedor:**
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **Console**
- Mantenha aberto para ver os logs

### **4. Teste de login:**
Use qualquer uma dessas credenciais:

#### 🔵 **Super Admin:**
- **Email:** `admin@federalinvest.com`
- **Senha:** `admin123!@#`

#### 🟡 **Pedro Eli:**
- **Email:** `pedro-eli@hotmail.com`
- **Senha:** `Galod1234@`

### **5. Observe os logs:**
Procure por mensagens como:
- `🔄 Login attempt started`
- `📞 Calling signIn with credentials...`
- `📋 SignIn result:`
- `✅ SignIn successful` ou `❌ SignIn error`

---

## 🔍 **O QUE OBSERVAR:**

### ✅ **Se funcionou:**
- Console mostra: `✅ SignIn successful, redirecting...`
- Página redireciona para o dashboard
- Você vê o nome do usuário no header

### ❌ **Se não funcionou:**
- Console mostra: `❌ SignIn error: [erro]`
- Mensagem de erro na tela
- Permanece na página de login

---

## 🐛 **POSSÍVEIS ERROS E SOLUÇÕES:**

### **Erro: "E-mail ou senha inválidos"**
- ✅ Teste com: `admin@federalinvest.com` + `admin123!@#`
- ✅ Verifique se não há espaços antes/depois

### **Erro: "Erro inesperado no login"**
- 🔧 Problema na configuração NextAuth
- 🔧 Verificar logs do servidor no terminal

### **Erro: CSRF token mismatch**
- 🔧 Limpar cookies do navegador
- 🔧 Recarregar a página completamente (Ctrl+F5)

### **Página não carrega:**
- 🔧 Verificar se o servidor está rodando: `npm run dev`
- 🔧 Acessar: `http://localhost:3000/api/auth/providers`

---

## 📊 **RESULTADOS ESPERADOS:**

### **Teste bem-sucedido:**
```
Console:
🔄 Login attempt started { email: "admin@federalinvest.com" }
📞 Calling signIn with credentials...
📋 SignIn result: { ok: true, status: 200, error: null, url: null }
✅ SignIn successful, redirecting...
🔄 Navigating to: /
🔄 Refreshing router...
```

### **Login funcionando:**
- ✅ Redirecionamento para dashboard (`/`)
- ✅ Nome do usuário aparece no header
- ✅ Menu lateral funcional
- ✅ Dados carregando

---

## 🚨 **SE NÃO FUNCIONAR:**

### **1. Reporte os logs:**
- Copie todos os logs do console
- Inclua mensagens de erro
- Inclua o status da requisição

### **2. Teste adicional:**
```
Acesse: http://localhost:3000/api/auth/session
Resultado esperado: {}
```

### **3. Limpar cache:**
- Ctrl+F5 para recarregar completamente
- Limpar cookies e dados do site
- Tentar em aba anônima/incógnita

---

## 📞 **PRÓXIMOS PASSOS:**

1. **Execute este teste manual**
2. **Reporte o resultado** (funcionou/não funcionou)
3. **Compartilhe os logs** se houver erro
4. **Informe qual credencial testou**

---

**🎯 OBJETIVO:** Identificar se o problema é no frontend, backend, ou configuração do NextAuth.

*Guia criado em: ${new Date().toLocaleString('pt-BR')}* 