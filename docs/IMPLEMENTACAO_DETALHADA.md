# Implementação Detalhada - Federal Invest App

Este documento fornece exemplos de código e instruções detalhadas para a implementação das adaptações necessárias para transformar o aplicativo atual no Federal Invest App.

## 1. Modificação do Schema do Banco de Dados

### Novo Schema (db/schema.ts)

```typescript
import { integer, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"
import { relations } from "drizzle-orm"
import { z } from "zod"

// Tabela de investidores
export const investors = pgTable("investors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  documentId: text("document_id"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const investorsRelations = relations(investors, ({ many }) => ({
  investments: many(investments)
}));

export const insertInvestorSchema = createInsertSchema(investors);

// Tabela de investimentos
export const investments = pgTable("investments", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "deposit" ou "withdrawal"
  date: timestamp("date", { mode: "date" }).notNull(),
  notes: text("notes"),
  investorId: text("investor_id").references(() => investors.id, {
    onDelete: "cascade",
  }).notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const investmentsRelations = relations(investments, ({ one }) => ({
  investor: one(investors, {
    fields: [investments.investorId],
    references: [investors.id]
  })
}));

export const insertInvestmentSchema = createInsertSchema(investments, {
  date: z.coerce.date(),
});

// Categorias de despesas
export const expenseCategories = pgTable("expense_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "fixed" ou "variable"
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses)
}));

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);

// Despesas
export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  notes: text("notes"),
  recurring: boolean("recurring").default(false),
  categoryId: text("category_id").references(() => expenseCategories.id, {
    onDelete: "set null"
  }),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id]
  })
}));

export const insertExpenseSchema = createInsertSchema(expenses, {
  date: z.coerce.date(),
});

// Categorias de receitas
export const revenueCategories = pgTable("revenue_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const revenueCategoriesRelations = relations(revenueCategories, ({ many }) => ({
  revenues: many(revenues)
}));

export const insertRevenueCategorySchema = createInsertSchema(revenueCategories);

// Receitas
export const revenues = pgTable("revenues", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  notes: text("notes"),
  recurring: boolean("recurring").default(false),
  categoryId: text("category_id").references(() => revenueCategories.id, {
    onDelete: "set null"
  }),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const revenuesRelations = relations(revenues, ({ one }) => ({
  category: one(revenueCategories, {
    fields: [revenues.categoryId],
    references: [revenueCategories.id]
  })
}));

export const insertRevenueSchema = createInsertSchema(revenues, {
  date: z.coerce.date(),
});

// Relatórios
export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // "dre", "tax", "investment", etc.
  data: text("data").notNull(), // JSON data
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

// Convites
export const invites = pgTable("invites", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull(), // "admin" ou "client"
  status: text("status").notNull(), // "pending", "accepted", "expired"
  expiresAt: timestamp("expires_at").notNull(),
  invitedBy: text("invited_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInviteSchema = createInsertSchema(invites, {
  expiresAt: z.coerce.date(),
});

// Notificações
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "alert", "reminder", "info"
  read: boolean("read").default(false),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications);
```

## 2. Atualização do Tema (Cores da Federal Invest)

### Arquivo globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* Federal Invest Colors */
    --primary: 220 75% 12%; /* federal-dark-blue: #0a192f */
    --primary-foreground: 210 40% 98%;

    --secondary: 220 13% 7%; /* federal-black: #121212 */
    --secondary-foreground: 210 40% 98%;

    --accent: 217 100% 61%; /* federal-accent: #3a86ff */
    --accent-foreground: 210 40% 98%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 220 13% 7%; /* federal-black: #121212 */
    --foreground: 210 40% 98%;

    --card: 220 75% 12%; /* federal-dark-blue: #0a192f */
    --card-foreground: 210 40% 98%;

    --popover: 220 75% 12%; /* federal-dark-blue: #0a192f */
    --popover-foreground: 210 40% 98%;

    --primary: 217 100% 61%; /* federal-accent: #3a86ff */
    --primary-foreground: 210 40% 98%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 3. Atualização da Navegação

### Arquivo components/navigation.tsx

```typescript
"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMedia } from "react-use";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import NavButton from "./nav-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const routes = [
  {
    href: "/",
    label: "Dashboard",
  },
  {
    href: "/investors",
    label: "Investidores",
  },
  {
    href: "/expenses",
    label: "Despesas",
  },
  {
    href: "/revenues",
    label: "Receitas",
  },
  {
    href: "/investments",
    label: "Investimentos",
  },
  {
    href: "/dre",
    label: "DRE",
  },
  {
    href: "/reports",
    label: "Relatórios",
  },
  {
    href: "/tax-projections",
    label: "Projeções Fiscais",
  },
  {
    href: "/settings",
    label: "Configurações",
  },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMedia("(max-width: 1024px)", false);

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Button
            size="sm"
            variant="outline"
            className="font-normal text-white/10 bg-white/20 hover:text-black border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2 bg-primary">
          <nav className="flex flex-col gap-y-2 pt-6">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.href === pathname ? "secondary" : "ghost"}
                onClick={() => onClick(route.href)}
                className="w-full justify-start"
              >
                {route.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      {routes.map((route) => (
        <NavButton
          key={route.href}
          href={route.href}
          label={route.label}
          isActive={pathname === route.href}
        />
      ))}
    </nav>
  );
};

export default Navigation;
```

## 4. Criação do Dashboard Principal

### Arquivo app/(dashboard)/page.tsx

```typescript
"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, CreditCard, DollarSign, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Este seria um componente de estatísticas do card
const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  change, 
  changeType 
}: { 
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative";
}) => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-accent/20 p-1.5 text-accent">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {change && (
          <div className="flex items-center pt-2">
            {changeType === "positive" ? (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ${changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  // Na realidade, esses dados viriam de uma API
  const [stats, setStats] = useState({
    revenue: { value: "R$ 0", change: "0%", type: "positive" as const },
    expenses: { value: "R$ 0", change: "0%", type: "negative" as const },
    investors: { value: "0", change: "0%", type: "positive" as const },
    balance: { value: "R$ 0", change: "0%", type: "positive" as const },
  });

  useEffect(() => {
    // Simulando carregamento de dados
    setTimeout(() => {
      setStats({
        revenue: { value: "R$ 45.231,89", change: "12%", type: "positive" },
        expenses: { value: "R$ 12.593,45", change: "8%", type: "negative" },
        investors: { value: "13", change: "2%", type: "positive" },
        balance: { value: "R$ 32.638,44", change: "15%", type: "positive" },
      });
    }, 1000);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Federal Invest</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Exportar</Button>
          <Button>Novo Investidor</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receita Total"
          value={stats.revenue.value}
          description="Total de receitas no mês atual"
          icon={<DollarSign className="h-4 w-4" />}
          change={stats.revenue.change}
          changeType={stats.revenue.type}
        />
        <StatsCard
          title="Despesas"
          value={stats.expenses.value}
          description="Total de despesas no mês atual"
          icon={<CreditCard className="h-4 w-4" />}
          change={stats.expenses.change}
          changeType={stats.expenses.type}
        />
        <StatsCard
          title="Investidores"
          value={stats.investors.value}
          description="Número total de investidores"
          icon={<Users className="h-4 w-4" />}
          change={stats.investors.change}
          changeType={stats.investors.type}
        />
        <StatsCard
          title="Saldo Líquido"
          value={stats.balance.value}
          description="Resultado financeiro do mês"
          icon={<Wallet className="h-4 w-4" />}
          change={stats.balance.change}
          changeType={stats.balance.type}
        />
      </div>

      {/* Aqui seriam adicionados gráficos e outras visualizações */}
      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Evolução Financeira</CardTitle>
            <CardDescription>Acompanhamento mensal de receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Gráfico seria implementado aqui usando Recharts ou similar */}
            <div className="h-[300px] flex items-center justify-center bg-accent/5 rounded-md">
              Gráfico de Evolução Financeira
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Principais categorias de despesas</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Gráfico seria implementado aqui usando Recharts ou similar */}
            <div className="h-[300px] flex items-center justify-center bg-accent/5 rounded-md">
              Gráfico de Distribuição de Despesas
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 5. Implementação do Módulo DRE

### Arquivo app/(dashboard)/dre/page.tsx

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, Upload } from "lucide-react";

interface DREData {
  revenues: DREItem[];
  expenses: DREItem[];
  totals: {
    revenue: number;
    expense: number;
    result: number;
    taxes: number;
    finalResult: number;
  };
  period: string;
}

interface DREItem {
  id: string;
  description: string;
  amount: number;
  percentage: number;
}

export default function DRE() {
  // Na prática, esses dados viriam do banco de dados
  const [dreData, setDreData] = useState<DREData>({
    revenues: [
      { id: "1", description: "Receita Operacional", amount: 80000, percentage: 80 },
      { id: "2", description: "Receita Financeira", amount: 15000, percentage: 15 },
      { id: "3", description: "Outras Receitas", amount: 5000, percentage: 5 },
    ],
    expenses: [
      { id: "1", description: "Custos Operacionais", amount: 30000, percentage: 50 },
      { id: "2", description: "Despesas Administrativas", amount: 12000, percentage: 20 },
      { id: "3", description: "Despesas Financeiras", amount: 8000, percentage: 13.33 },
      { id: "4", description: "Marketing e Vendas", amount: 10000, percentage: 16.67 },
    ],
    totals: {
      revenue: 100000,
      expense: 60000,
      result: 40000,
      taxes: 13600,
      finalResult: 26400,
    },
    period: "Julho 2023",
  });

  // Formatador de moeda para exibir valores em R$
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Demonstração de Resultado (DRE)</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Mês Atual</TabsTrigger>
          <TabsTrigger value="previous">Mês Anterior</TabsTrigger>
          <TabsTrigger value="ytd">Acumulado Anual</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>DRE - {dreData.period}</CardTitle>
              <CardDescription>
                Demonstração do resultado do exercício para o período atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Tabela de Receitas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Receitas</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">% da Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dreData.revenues.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-primary/5">
                        <TableCell>Total de Receitas</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dreData.totals.revenue)}
                        </TableCell>
                        <TableCell className="text-right">100.00%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Tabela de Despesas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Despesas</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">% da Despesa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dreData.expenses.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-primary/5">
                        <TableCell>Total de Despesas</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dreData.totals.expense)}
                        </TableCell>
                        <TableCell className="text-right">100.00%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Resultado */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                  <Table>
                    <TableBody>
                      <TableRow className="font-bold">
                        <TableCell>Resultado Operacional</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dreData.totals.result)}
                        </TableCell>
                        <TableCell className="text-right">
                          {((dreData.totals.result / dreData.totals.revenue) * 100).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Impostos e Contribuições</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dreData.totals.taxes)}
                        </TableCell>
                        <TableCell className="text-right">
                          {((dreData.totals.taxes / dreData.totals.revenue) * 100).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                      <TableRow className="font-bold bg-accent/10">
                        <TableCell>Resultado Líquido</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dreData.totals.finalResult)}
                        </TableCell>
                        <TableCell className="text-right">
                          {((dreData.totals.finalResult / dreData.totals.revenue) * 100).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previous">
          <Card>
            <CardHeader>
              <CardTitle>DRE - Mês Anterior</CardTitle>
              <CardDescription>
                Demonstração do resultado do exercício para o mês anterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">
                  Selecione um período para visualizar os dados do DRE
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ytd">
          <Card>
            <CardHeader>
              <CardTitle>DRE - Acumulado Anual</CardTitle>
              <CardDescription>
                Demonstração do resultado acumulado do exercício
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">
                  Selecione um período para visualizar os dados do DRE
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 6. Exemplo de Implementação de API

### Arquivo app/api/investors/route.ts

```typescript
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@clerk/nextjs";
import { db } from "@/db/drizzle";
import { investors, insertInvestorSchema } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const allInvestors = await db.query.investors.findMany({
      where: eq(investors.userId, userId),
      orderBy: (investors, { desc }) => [desc(investors.createdAt)],
    });

    return NextResponse.json(allInvestors);
  } catch (error) {
    console.error("[INVESTORS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedBody = insertInvestorSchema.parse({
      ...body,
      userId,
    });

    const investor = await db
      .insert(investors)
      .values({
        id: createId(),
        ...validatedBody,
      })
      .returning();

    return NextResponse.json(investor[0]);
  } catch (error) {
    console.error("[INVESTORS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
```

## 7. Hook Customizado para Gerenciamento de Investidores

### Arquivo features/investors/hooks/use-investors.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

type Investor = InferResponseType<typeof client.api.investors.$get>[number];

export const useInvestors = () => {
  const { data, isPending, error } = useQuery<Investor[]>({
    queryKey: ["investors"],
    queryFn: async () => {
      const response = await client.api.investors.$get();
      return response.json();
    },
  });

  return {
    investors: data || [],
    isPending,
    error,
  };
};
```

## 8. Configuração de Convites para Clientes

### Arquivo app/api/invites/route.ts

```typescript
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@clerk/nextjs";
import { db } from "@/db/drizzle";
import { invites, insertInviteSchema } from "@/db/schema";
import { addDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const allInvites = await db.query.invites.findMany({
      where: eq(invites.invitedBy, userId),
      orderBy: (invites, { desc }) => [desc(invites.createdAt)],
    });

    return NextResponse.json(allInvites);
  } catch (error) {
    console.error("[INVITES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    
    // Configurar expiração para 7 dias a partir de agora
    const expiresAt = addDays(new Date(), 7);

    const validatedBody = insertInviteSchema.parse({
      ...body,
      invitedBy: userId,
      status: "pending",
      expiresAt,
    });

    const invite = await db
      .insert(invites)
      .values({
        id: createId(),
        ...validatedBody,
      })
      .returning();

    // Aqui seria implementado o envio de e-mail com o convite

    return NextResponse.json(invite[0]);
  } catch (error) {
    console.error("[INVITES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
```

## 9. Layout Principal Atualizado

### Arquivo app/(dashboard)/layout.tsx

```typescript
import { Metadata } from "next";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import Header from "@/components/header";

export const metadata: Metadata = {
  title: "Federal Invest | Dashboard",
  description: "Plataforma de gestão financeira da Federal Invest",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full relative">
      <div className="h-full flex flex-col">
        <Header />
        <div className="flex-1 h-full overflow-y-auto bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}
```

Este documento fornece exemplos detalhados e específicos de código para implementar as principais funcionalidades do Federal Invest App, seguindo o plano de migração estabelecido. Cada seção foca em um aspecto chave da adaptação, mostrando como transformar o código existente para atender aos requisitos do novo sistema.