import { pgTable, foreignKey, text, numeric, timestamp, integer, unique, boolean, serial, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const invitationStatus = pgEnum("invitation_status", ['ACCEPTED', 'REVOKED', 'PENDING'])
export const invitationType = pgEnum("invitation_type", ['NORMAL', 'INVESTOR'])
export const userRole = pgEnum("user_role", ['ADMIN', 'EDITOR', 'INVESTOR', 'VIEWER'])


export const contributionsOrWithdrawals = pgTable("contributions_or_withdrawals", {
	id: text().primaryKey().notNull(),
	amount: numeric({ precision: 19, scale:  6 }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	investorId: text("investor_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.investorId],
			foreignColumns: [investors.id],
			name: "contributions_or_withdrawals_investor_id_investors_id_fk"
		}).onDelete("cascade"),
]);

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	userId: text("user_id").notNull(),
	type: text().default('expense').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const investments = pgTable("investments", {
	id: text().primaryKey().notNull(),
	amount: integer().notNull(),
	type: text().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	notes: text(),
	investorId: text("investor_id").notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.investorId],
			foreignColumns: [investors.id],
			name: "investments_investor_id_investors_id_fk"
		}).onDelete("cascade"),
]);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("email_verification_tokens_token_unique").on(table.token),
]);

export const entries = pgTable("entries", {
	id: text().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	description: text().notNull(),
	value: numeric({ precision: 19, scale:  6 }).notNull(),
	categoryId: text("category_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const expenseCategories = pgTable("expense_categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	isDefault: boolean("is_default").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
	id: text().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	description: text().notNull(),
	value: numeric({ precision: 19, scale:  6 }).notNull(),
	isTaxable: boolean("is_taxable").notNull(),
	isPayroll: boolean("is_payroll").default(false).notNull(),
	categoryId: text("category_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const fileUploads = pgTable("file_uploads", {
	id: text().primaryKey().notNull(),
	filename: text().notNull(),
	originalFilename: text("original_filename").notNull(),
	size: integer().notNull(),
	mimetype: text().notNull(),
	rows: integer().default(0).notNull(),
	status: text().default('processing').notNull(),
	error: text(),
	processingTime: integer("processing_time"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const financialDataCsv = pgTable("financial_data_csv", {
	id: text().primaryKey().notNull(),
	idOperacao: text("id_operacao").notNull(),
	cpfCnpjCedente: text("cpf_cnpj_cedente"),
	data: timestamp({ mode: 'string' }),
	fator: numeric({ precision: 19, scale:  6 }),
	adValorem: numeric("ad_valorem", { precision: 19, scale:  6 }),
	valorFator: numeric("valor_fator", { precision: 19, scale:  6 }),
	valorAdValorem: numeric("valor_ad_valorem", { precision: 19, scale:  6 }),
	valorIof: numeric("valor_iof", { precision: 19, scale:  6 }),
	retencaoPis: numeric("retencao_pis", { precision: 19, scale:  6 }),
	retencaoIr: numeric("retencao_ir", { precision: 19, scale:  6 }),
	retencaoCsll: numeric("retencao_csll", { precision: 19, scale:  6 }),
	retencaoCofins: numeric("retencao_cofins", { precision: 19, scale:  6 }),
	pis: numeric({ precision: 19, scale:  6 }),
	csll: numeric({ precision: 19, scale:  6 }),
	cofins: numeric({ precision: 19, scale:  6 }),
	issqn: numeric({ precision: 19, scale:  6 }),
	valorTarifas: numeric("valor_tarifas", { precision: 19, scale:  6 }),
	valorLiquido: numeric("valor_liquido", { precision: 19, scale:  6 }),
	valorIofAdicional: numeric("valor_iof_adicional", { precision: 19, scale:  6 }),
	retencaoIss: numeric("retencao_iss", { precision: 19, scale:  6 }),
	irpj: numeric({ precision: 19, scale:  6 }),
	dataFinalizacao: timestamp("data_finalizacao", { mode: 'string' }),
	pais: text(),
	regiao: text(),
	etapa: text(),
	dataPagamento: timestamp("data_pagamento", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("financial_data_csv_id_operacao_unique").on(table.idOperacao),
]);

export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const invitations = pgTable("invitations", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	status: invitationStatus().default('PENDING').notNull(),
	role: userRole().notNull(),
	type: invitationType().notNull(),
}, (table) => [
	unique("invitations_email_unique").on(table.email),
]);

export const monthlyFinancialResults = pgTable("monthly_financial_results", {
	id: text().primaryKey().notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	totalOperation: numeric("total_operation", { precision: 19, scale:  6 }).notNull(),
	totalFator: numeric("total_fator", { precision: 19, scale:  6 }).notNull(),
	totalAdValorem: numeric("total_ad_valorem", { precision: 19, scale:  6 }).notNull(),
	totalIof: numeric("total_iof", { precision: 19, scale:  6 }).notNull(),
	totalPis: numeric("total_pis", { precision: 19, scale:  6 }).notNull(),
	totalCofins: numeric("total_cofins", { precision: 19, scale:  6 }).notNull(),
	totalIssqn: numeric("total_issqn", { precision: 19, scale:  6 }).notNull(),
	totalExpenses: numeric("total_expenses", { precision: 19, scale:  6 }).notNull(),
	netRevenue: numeric("net_revenue", { precision: 19, scale:  6 }).notNull(),
	grossResult: numeric("gross_result", { precision: 19, scale:  6 }).notNull(),
	netResult: numeric("net_result", { precision: 19, scale:  6 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
	id: text().primaryKey().notNull(),
	notification: text().notNull(),
	url: text(),
	type: text(),
	read: boolean().default(false).notNull(),
	deletable: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("password_reset_tokens_token_unique").on(table.token),
]);

export const sessions = pgTable("sessions", {
	sessionToken: text("session_token").primaryKey().notNull(),
	userId: text("user_id").notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const quarterlyFinancialResults = pgTable("quarterly_financial_results", {
	id: text().primaryKey().notNull(),
	quarter: integer().default(1).notNull(),
	year: integer().notNull(),
	totalOperation: numeric("total_operation", { precision: 19, scale:  6 }).default('0').notNull(),
	totalOtherIncome: numeric("total_other_income", { precision: 19, scale:  6 }).default('0').notNull(),
	totalIncome: numeric("total_income", { precision: 19, scale:  6 }).default('0').notNull(),
	totalFator: numeric("total_fator", { precision: 19, scale:  6 }).default('0').notNull(),
	totalAdValorem: numeric("total_ad_valorem", { precision: 19, scale:  6 }).default('0').notNull(),
	totalIof: numeric("total_iof", { precision: 19, scale:  6 }).default('0').notNull(),
	totalCosts: numeric("total_costs", { precision: 19, scale:  6 }).default('0').notNull(),
	totalPis: numeric("total_pis", { precision: 19, scale:  6 }).default('0').notNull(),
	totalCofins: numeric("total_cofins", { precision: 19, scale:  6 }).default('0').notNull(),
	totalIssqn: numeric("total_issqn", { precision: 19, scale:  6 }).default('0').notNull(),
	totalIrpj: numeric("total_irpj", { precision: 19, scale:  6 }).default('0').notNull(),
	totalCsll: numeric("total_csll", { precision: 19, scale:  6 }).default('0').notNull(),
	totalTaxableExpenses: numeric("total_taxable_expenses", { precision: 19, scale:  6 }).default('0').notNull(),
	totalNonTaxableExpenses: numeric("total_non_taxable_expenses", { precision: 19, scale:  6 }).default('0').notNull(),
	totalExpenses: numeric("total_expenses", { precision: 19, scale:  6 }).default('0').notNull(),
	taxDeduction: numeric("tax_deduction", { precision: 19, scale:  6 }).default('0').notNull(),
	grossRevenue: numeric("gross_revenue", { precision: 19, scale:  6 }).default('0').notNull(),
	netRevenue: numeric("net_revenue", { precision: 19, scale:  6 }).default('0').notNull(),
	grossResult: numeric("gross_result", { precision: 19, scale:  6 }).default('0').notNull(),
	netResult: numeric("net_result", { precision: 19, scale:  6 }).default('0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const twoFactorConfirmations = pgTable("two_factor_confirmations", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "two_factor_confirmations_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("two_factor_confirmations_user_id_unique").on(table.userId),
]);

export const taxDeductions = pgTable("tax_deductions", {
	id: serial().primaryKey().notNull(),
	year: integer().notNull(),
	quarter: integer().notNull(),
	value: numeric().default('0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const investors = pgTable("investors", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	startedInvestingAt: timestamp("started_investing_at", { mode: 'string' }),
	endedInvestingAt: timestamp("ended_investing_at", { mode: 'string' }),
	city: text(),
	address: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("investors_email_unique").on(table.email),
]);

export const permissions = pgTable("permissions", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	access: boolean().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.email],
			foreignColumns: [users.email],
			name: "permissions_email_users_email_fk"
		}),
]);

export const twoFactorTokens = pgTable("two_factor_tokens", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("two_factor_tokens_token_unique").on(table.token),
]);

export const uploadHistory = pgTable("upload_history", {
	id: serial().primaryKey().notNull(),
	filename: varchar({ length: 255 }).notNull(),
	originalFilename: varchar("original_filename", { length: 255 }).notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: varchar("mime_type", { length: 100 }),
	importedBy: varchar("imported_by", { length: 255 }).notNull(),
	importedAt: timestamp("imported_at", { mode: 'string' }).defaultNow().notNull(),
	success: boolean().notNull(),
	errorMessage: text("error_message"),
	recordsProcessed: integer("records_processed"),
	recordsFailed: integer("records_failed"),
	processingTime: integer("processing_time"),
});

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("verification_tokens_token_unique").on(table.token),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp("email_verified", { mode: 'string' }),
	image: text(),
	hashedPassword: text("hashed_password"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	role: userRole().default('VIEWER'),
	isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false).notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const userInvestorLinks = pgTable("user_investor_links", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	investorId: text("investor_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_investor_links_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.investorId],
			foreignColumns: [investors.id],
			name: "user_investor_links_investor_id_investors_id_fk"
		}).onDelete("cascade"),
]);
