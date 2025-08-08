# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- main:
  - link "Federal Invest Logo":
    - /url: /
    - img "Federal Invest Logo"
  - heading "DRE - Demonstração de Resultados" [level=1]
  - button:
    - img
  - button:
    - img
  - button "Alternar tema":
    - img
    - img
    - text: Alternar tema
  - button "Menu do usuário": FI
  - button:
    - img
  - paragraph: "Seu papel: Carregando..."
  - main:
    - img
    - heading "Acesso Negado" [level=2]
    - paragraph: Você não tem permissão para acessar esta página.
    - paragraph: "Role atual: Sem role"
    - paragraph: "Roles permitidas: ADMIN, EDITOR"
    - button "Recarregar página":
      - img
      - text: Recarregar página
- alert
```