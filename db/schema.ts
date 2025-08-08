import { 
  pgTable, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  pgEnum,
  decimal,
  serial,
  numeric,
  varchar
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';


// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'EDITOR', 'INVESTOR', 'VIEWER']);
export const invitationStatusEnum = pgEnum('invitation_status', ['ACCEPTED', 'REVOKED', 'PENDING']);
export const invitationTypeEnum = pgEnum('invitation_type', ['NORMAL', 'INVESTOR']);

// User table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  hashedPassword: text("hashed_password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  role: userRoleEnum("role").default("VIEWER"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false).notNull(),
  lastLogin: timestamp("last_login"),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  twoFactorConfirmation: one(twoFactorConfirmations),
  permissions: many(permissions),
  userInvestorLinks: many(userInvestorLinks),
}));

export const insertUserSchema = createInsertSchema(users);

// Sessions table for NextAuth
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp("expires").notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const insertSessionSchema = createInsertSchema(sessions);

// Accounts table for OAuth (updated for NextAuth)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const insertAccountSchema = createInsertSchema(accounts);

// Two Factor Authentication tables
export const twoFactorTokens = pgTable("two_factor_tokens", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const insertTwoFactorTokenSchema = createInsertSchema(twoFactorTokens);

export const twoFactorConfirmations = pgTable("two_factor_confirmations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
});

export const twoFactorConfirmationsRelations = relations(twoFactorConfirmations, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorConfirmations.userId],
    references: [users.id],
  }),
}));

export const insertTwoFactorConfirmationSchema = createInsertSchema(twoFactorConfirmations);

// Verification Tokens for NextAuth
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
}, (vt) => ({
  compoundKey: {
    name: "verification_tokens_identifier_token_key",
    columns: [vt.identifier, vt.token],
  },
}));

export const insertVerificationTokenSchema = createInsertSchema(verificationTokens);

// Email Verification Tokens (custom for app functionality)
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);

// Permissions
export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(),
  email: text("email").notNull().references(() => users.email),
  access: boolean("access").notNull(),
});

export const permissionsRelations = relations(permissions, ({ one }) => ({
  user: one(users, {
    fields: [permissions.email],
    references: [users.email],
  }),
}));

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



export const insertPermissionSchema = createInsertSchema(permissions);

// Notifications
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  notification: text("notification").notNull(),
  url: text("url"),
  type: text("type"),
  read: boolean("read").default(false).notNull(),
  deletable: boolean("deletable").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications);

// Invitations
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: invitationStatusEnum("status").default('PENDING').notNull(),
  role: userRoleEnum("role").notNull(),
  type: invitationTypeEnum("type").notNull(),
});

export const insertInvitationSchema = createInsertSchema(invitations);

// Investors
export const investors = pgTable("investors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  startedInvestingAt: timestamp("started_investing_at"),
  endedInvestingAt: timestamp("ended_investing_at"),
  city: text("city"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const investorsRelations = relations(investors, ({ many }) => ({
  contributions: many(contributionsOrWithdrawals),
  userInvestorLinks: many(userInvestorLinks),
}));

export const insertInvestorSchema = createInsertSchema(investors);

// User-Investor Links
export const userInvestorLinks = pgTable("user_investor_links", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  investorId: text("investor_id").notNull().references(() => investors.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userInvestorLinksRelations = relations(userInvestorLinks, ({ one }) => ({
  user: one(users, {
    fields: [userInvestorLinks.userId],
    references: [users.id],
  }),
  investor: one(investors, {
    fields: [userInvestorLinks.investorId],
    references: [investors.id],
  }),
}));

export const insertUserInvestorLinkSchema = createInsertSchema(userInvestorLinks);

// Contributions or Withdrawals
export const contributionsOrWithdrawals = pgTable("contributions_or_withdrawals", {
  id: text("id").primaryKey(),
  amount: decimal("amount", { precision: 19, scale: 6 }).notNull(),
  date: timestamp("date").notNull(),
  investorId: text("investor_id").notNull().references(() => investors.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contributionsOrWithdrawalsRelations = relations(contributionsOrWithdrawals, ({ one }) => ({
  investor: one(investors, {
    fields: [contributionsOrWithdrawals.investorId],
    references: [investors.id],
  }),
}));

export const insertContributionOrWithdrawalSchema = createInsertSchema(contributionsOrWithdrawals, {
  date: z.coerce.date(),
});

// Expenses (with taxable flag and payroll flag)
export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 19, scale: 6 }).notNull(),
  isTaxable: boolean("is_taxable").notNull(),
  isPayroll: boolean("is_payroll").notNull().default(false),
  categoryId: text("category_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses, {
  date: z.coerce.date(),
});

// Entries (Receitas)
export const entries = pgTable("entries", {
  id: text("id").primaryKey(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 19, scale: 6 }).notNull(),
  categoryId: text("category_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEntrySchema = createInsertSchema(entries, {
  date: z.coerce.date(),
});

// Financial Data CSV
export const financialDataCSV = pgTable("financial_data_csv", {
  id: text("id").primaryKey(),
  IdOperacao: text("id_operacao").notNull().unique(),
  CPFCNPJCedente: text("cpf_cnpj_cedente"),
  Data: timestamp("data"),
  Fator: decimal("fator", { precision: 19, scale: 6 }),
  AdValorem: decimal("ad_valorem", { precision: 19, scale: 6 }),
  ValorFator: decimal("valor_fator", { precision: 19, scale: 6 }),
  ValorAdValorem: decimal("valor_ad_valorem", { precision: 19, scale: 6 }),
  ValorIOF: decimal("valor_iof", { precision: 19, scale: 6 }),
  RetencaoPIS: decimal("retencao_pis", { precision: 19, scale: 6 }),
  RetencaoIR: decimal("retencao_ir", { precision: 19, scale: 6 }),
  RetencaoCSLL: decimal("retencao_csll", { precision: 19, scale: 6 }),
  RetencaoCOFINS: decimal("retencao_cofins", { precision: 19, scale: 6 }),
  PIS: decimal("pis", { precision: 19, scale: 6 }),
  CSLL: decimal("csll", { precision: 19, scale: 6 }),
  COFINS: decimal("cofins", { precision: 19, scale: 6 }),
  ISSQN: decimal("issqn", { precision: 19, scale: 6 }),
  ValorTarifas: decimal("valor_tarifas", { precision: 19, scale: 6 }),
  ValorLiquido: decimal("valor_liquido", { precision: 19, scale: 6 }),
  ValorIOFAdicional: decimal("valor_iof_adicional", { precision: 19, scale: 6 }),
  RetencaoISS: decimal("retencao_iss", { precision: 19, scale: 6 }),
  IRPJ: decimal("irpj", { precision: 19, scale: 6 }),
  DataFinalizacao: timestamp("data_finalizacao"),
  Pais: text("pais"),
  Regiao: text("regiao"),
  Etapa: text("etapa"),
  DataPagamento: timestamp("data_pagamento"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFinancialDataCSVSchema = createInsertSchema(financialDataCSV, {
  Data: z.coerce.date().optional(),
  DataFinalizacao: z.coerce.date().optional(),
  DataPagamento: z.coerce.date().optional(),
});


// Monthly Financial Results
export const monthlyFinancialResults = pgTable("monthly_financial_results", {
  id: text("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalOperation: decimal("total_operation", { precision: 19, scale: 6 }).notNull(),
  totalFator: decimal("total_fator", { precision: 19, scale: 6 }).notNull(),
  totalAdValorem: decimal("total_ad_valorem", { precision: 19, scale: 6 }).notNull(),
  totalIOF: decimal("total_iof", { precision: 19, scale: 6 }).notNull(),
  totalPis: decimal("total_pis", { precision: 19, scale: 6 }).notNull(),
  totalCofins: decimal("total_cofins", { precision: 19, scale: 6 }).notNull(),
  totalIssqn: decimal("total_issqn", { precision: 19, scale: 6 }).notNull(),
  totalExpenses: decimal("total_expenses", { precision: 19, scale: 6 }).notNull(),
  netRevenue: decimal("net_revenue", { precision: 19, scale: 6 }).notNull(),
  grossResult: decimal("gross_result", { precision: 19, scale: 6 }).notNull(),
  netResult: decimal("net_result", { precision: 19, scale: 6 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMonthlyFinancialResultSchema = createInsertSchema(monthlyFinancialResults);

// Quarterly Financial Results
export const quarterlyFinancialResults = pgTable("quarterly_financial_results", {
  id: text("id").primaryKey(),
  quarter: integer("quarter").notNull().default(1),
  year: integer("year").notNull(),
  
  // Receitas
  totalOperation: decimal("total_operation", { precision: 19, scale: 6 }).notNull().default("0"),
  totalOtherIncome: decimal("total_other_income", { precision: 19, scale: 6 }).notNull().default("0"),
  totalIncome: decimal("total_income", { precision: 19, scale: 6 }).notNull().default("0"),
  
  // Custos
  totalFator: decimal("total_fator", { precision: 19, scale: 6 }).notNull().default("0"),
  totalAdValorem: decimal("total_ad_valorem", { precision: 19, scale: 6 }).notNull().default("0"),
  totalIOF: decimal("total_iof", { precision: 19, scale: 6 }).notNull().default("0"),
  totalCosts: decimal("total_costs", { precision: 19, scale: 6 }).notNull().default("0"),
  
  // Impostos
  totalPis: decimal("total_pis", { precision: 19, scale: 6 }).notNull().default("0"),
  totalCofins: decimal("total_cofins", { precision: 19, scale: 6 }).notNull().default("0"),
  totalIssqn: decimal("total_issqn", { precision: 19, scale: 6 }).notNull().default("0"),
  totalIRPJ: decimal("total_irpj", { precision: 19, scale: 6 }).notNull().default("0"),
  totalCSLL: decimal("total_csll", { precision: 19, scale: 6 }).notNull().default("0"),
  
  // Despesas
  totalTaxableExpenses: decimal("total_taxable_expenses", { precision: 19, scale: 6 }).notNull().default("0"),
  totalNonTaxableExpenses: decimal("total_non_taxable_expenses", { precision: 19, scale: 6 }).notNull().default("0"),
  totalExpenses: decimal("total_expenses", { precision: 19, scale: 6 }).notNull().default("0"),
  
  // Resultados
  taxDeduction: decimal("tax_deduction", { precision: 19, scale: 6 }).notNull().default("0"),
  grossRevenue: decimal("gross_revenue", { precision: 19, scale: 6 }).notNull().default("0"),
  netRevenue: decimal("net_revenue", { precision: 19, scale: 6 }).notNull().default("0"),
  grossResult: decimal("gross_result", { precision: 19, scale: 6 }).notNull().default("0"),
  netResult: decimal("net_result", { precision: 19, scale: 6 }).notNull().default("0"),
  
  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuarterlyFinancialResultSchema = createInsertSchema(quarterlyFinancialResults);

// Categories table
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  type: text("type").notNull().default("expense"), // "expense" or "entry"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Expense Categories (predefined)
export const expenseCategories = pgTable("expense_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories);

// Tax Deductions (DEPRECATED - mantido para compatibilidade)
export const taxDeductions = pgTable("tax_deductions", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(),
  value: numeric("value").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTaxDeductionSchema = createInsertSchema(taxDeductions);

// Monthly Tax Deductions (NEW - dedução fiscal mensal)
export const monthlyTaxDeductions = pgTable("monthly_tax_deductions", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  value: numeric("value").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMonthlyTaxDeductionSchema = createInsertSchema(monthlyTaxDeductions);

// Manual Quarterly Taxes (NEW - CSLL e IRPJ manuais trimestrais)
export const manualQuarterlyTaxes = pgTable("manual_quarterly_taxes", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  csll: numeric("csll").notNull().default("0"),
  irpj: numeric("irpj").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertManualQuarterlyTaxesSchema = createInsertSchema(manualQuarterlyTaxes);

// File Uploads
export const fileUploads = pgTable("file_uploads", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  size: integer("size").notNull(),
  mimetype: text("mimetype").notNull(),
  rows: integer("rows").notNull().default(0),
  status: text("status").notNull().default("processing"),
  error: text("error"),
  processingTime: integer("processing_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFileUploadSchema = createInsertSchema(fileUploads);



export const uploadHistory = pgTable('upload_history', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(), // tamanho em bytes
  mimeType: varchar('mime_type', { length: 100 }),
  importedBy: varchar('imported_by', { length: 255 }).notNull(),
  importedAt: timestamp('imported_at').defaultNow().notNull(),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  recordsProcessed: integer('records_processed'),
  recordsFailed: integer('records_failed'),
  processingTime: integer('processing_time'), // tempo em milissegundos
});

export type UploadHistory = InferSelectModel<typeof uploadHistory>;
export type NewUploadHistory = InferInsertModel<typeof uploadHistory>; 