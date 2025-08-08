# Finance SaaS Platform

This project was made with the "Code With Antonio" tutorial.

Welcome to the Finance SaaS Platform project! This comprehensive README will guide you through the project setup, key features, technologies used, and how to contribute. This project aims to provide a robust financial management system with extensive functionalities, including income and expense tracking, transaction categorization, CSV import, bank account connectivity, and monetization options.

## Table of Contents

1. [Key Features](#key-features)
2. [Technologies Used](#technologies-used)
3. [Project Setup](#project-setup)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)
7. [Screenshots/Demo](#screenshotsdemo)
8. [Prerequisites](#prerequisites)
9. [Folder Structure](#folder-structure)
10. [Acknowledgments](#acknowledgments)

## Key Features
- 📊 **Interactive Financial Dashboard**: Visualize financial data with various chart types.
- 🔁 **Changeable Chart Types**: Customize the way financial data is displayed.
- 🗓 **Account and Date Filters**: Filter transactions by account and date.
- 💹 **Detailed Transactions Table**: View and manage individual transactions.
- ➕ **Form to Add Transactions**: Easily add new transactions.
- 🧩 **Customizable Select Components**: Tailor select components to fit user needs.
- 💵 **Income and Expense Toggle**: Switch between income and expense views.
- 🔄 **CSV Transaction Imports**: Import transactions from CSV files.
- 🔥 **API via Hono.js**: Efficient API management using Hono.js.
- 🪝 **State Management via Tanstack React Query**: Manage application state seamlessly.
- 🔐 **Authentication via Clerk (Core 2)**: Secure user authentication.
- 🗑 **Bulk Delete and Search in Transactions**: Perform bulk operations and search transactions.
- 👤 **User Settings Customization**: Personalize user settings.
- 🌐 **Built with Next.js 14**: Leverage the latest features of Next.js.
- 🎨 **Styled with TailwindCSS and Shadcn UI**: Modern and responsive UI design.
- 💾 **PostgreSQL & Drizzle ORM**: Robust database management.
- 🚀 **Deployed on Vercel**: Effortless deployment and scaling.

## Technologies Used
- **[Clerk](https://go.clerk.com/eoX6HkY)**: Authentication solution.
- **[Hono](https://hono.dev/)**: Lightweight API framework.
- **[Drizzle ORM](https://orm.drizzle.team/)**: ORM for database interactions.
- **[Neon DB](https://neon.tech/)**: Scalable cloud database.
- **[Logoipsum](https://logoipsum.com/)**: Placeholder logos for branding.
- **Next.js 14**: React framework for server-side rendering.
- **TailwindCSS**: Utility-first CSS framework.
- **Shadcn UI**: Component library for modern UI.
- **Tanstack React Query**: Data-fetching library for React.
- **Plaid**: Financial data connectivity.
- **Lemon Squeezy**: E-commerce platform for selling digital products.
- **Vercel**: Deployment platform.

## Project Setup
Follow these steps to set up the project locally:

**Clone the repository**:
   ```bash
   git clone https://github.com/JosueIsOffline/finance-saas-platform.git
   cd finance-saas-platform

## Getting Started
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```

## 🔄 Recentes Melhorias

### Funcionalidade de Dados Brutos CSV
Foi adicionada uma página para visualização dos dados brutos importados via CSV, oferecendo:
- Tabela completa com todas as colunas do CSV original
- Filtragem por diversos parâmetros (data, valor, termos de busca)
- Ordenação por coluna
- Formatação adequada de valores monetários
- Paginação para navegação eficiente
- Histórico de arquivos importados

### Melhorias no Upload de CSV
- Adicionada barra de progresso durante o upload
- Histórico completo de arquivos processados
- Interface drag & drop para seleção de arquivos
- Validação de tipos de arquivo e tamanho
- Logs detalhados para depuração

### Aprimoramentos de DRE
- Correção nas fórmulas de cálculo
- Adição de deduções fiscais por trimestre
- Melhor formatação dos valores nas tabelas
- Exportação de dados para formatos PDF, Excel e CSV

### Testes Automatizados
- Testes unitários para cálculos financeiros
- Testes de componente para funcionalidades de upload
- Formatação de moeda e tamanho de arquivo

## 🔍 Depuração

Para ajudar na depuração, foram adicionados logs detalhados em todo o sistema:
- Frontend: logs de interface do usuário, ações e erros
- Backend: logs detalhados para cada requisição API
- Processamento de CSV: logs do progresso de upload e processamento
- Logs específicos para operações financeiras críticas

Os logs incluem:
- Identificação da fonte (backend/frontend)
- Contexto da operação
- Tags para filtrar tipos de eventos
- Data e hora
- Informações detalhadas dependendo do tipo de operação

Isso permite um diagnóstico rápido e eficiente de problemas durante o uso do sistema.