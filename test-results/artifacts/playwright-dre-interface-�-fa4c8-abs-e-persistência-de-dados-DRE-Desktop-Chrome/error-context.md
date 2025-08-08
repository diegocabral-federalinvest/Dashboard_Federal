# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- main:
  - img
  - heading "Bem-vindo de volta" [level=1]
  - paragraph: Entre com suas credenciais para acessar sua conta
  - text: E-mail
  - img
  - textbox "E-mail": admin@federalinvest.com
  - text: Senha
  - link "Esqueceu a senha?":
    - /url: /forgot-password
  - img
  - textbox "Senha": admin123
  - img
  - paragraph: Erro no login
  - paragraph: Email ou senha incorretos
  - button "Entrar":
    - img
    - text: Entrar
  - text: ou
  - paragraph:
    - text: Não tem uma conta?
    - link "Criar conta":
      - /url: /sign-up
  - img
  - heading "Gestão Financeira Completa" [level=2]
  - paragraph: Gerencie seus investimentos, controle despesas e receitas, e acompanhe relatórios DRE em uma plataforma moderna e segura.
  - text: Dashboard interativo e personalizado Relatórios DRE automatizados Gestão completa de investidores Segurança e controle de acesso
- alert: Federal Invest - Plataforma Financeira
```