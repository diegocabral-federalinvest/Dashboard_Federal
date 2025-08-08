CREATE TYPE "public"."invitation_status" AS ENUM('ACCEPTED', 'REVOKED', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."invitation_type" AS ENUM('NORMAL', 'INVESTOR');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'EDITOR', 'INVESTOR', 'VIEWER');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'expense' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions_or_withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" numeric(19, 6) NOT NULL,
	"date" timestamp NOT NULL,
	"investor_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"description" text NOT NULL,
	"value" numeric(19, 6) NOT NULL,
	"category_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"description" text NOT NULL,
	"value" numeric(19, 6) NOT NULL,
	"is_taxable" boolean NOT NULL,
	"is_payroll" boolean DEFAULT false NOT NULL,
	"category_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_filename" text NOT NULL,
	"size" integer NOT NULL,
	"mimetype" text NOT NULL,
	"rows" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"error" text,
	"processing_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_data_csv" (
	"id" text PRIMARY KEY NOT NULL,
	"id_operacao" text NOT NULL,
	"cpf_cnpj_cedente" text,
	"data" timestamp,
	"fator" numeric(19, 6),
	"ad_valorem" numeric(19, 6),
	"valor_fator" numeric(19, 6),
	"valor_ad_valorem" numeric(19, 6),
	"valor_iof" numeric(19, 6),
	"retencao_pis" numeric(19, 6),
	"retencao_ir" numeric(19, 6),
	"retencao_csll" numeric(19, 6),
	"retencao_cofins" numeric(19, 6),
	"pis" numeric(19, 6),
	"csll" numeric(19, 6),
	"cofins" numeric(19, 6),
	"issqn" numeric(19, 6),
	"valor_tarifas" numeric(19, 6),
	"valor_liquido" numeric(19, 6),
	"valor_iof_adicional" numeric(19, 6),
	"retencao_iss" numeric(19, 6),
	"irpj" numeric(19, 6),
	"data_finalizacao" timestamp,
	"pais" text,
	"regiao" text,
	"etapa" text,
	"data_pagamento" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "financial_data_csv_id_operacao_unique" UNIQUE("id_operacao")
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"date" timestamp NOT NULL,
	"notes" text,
	"investor_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"started_investing_at" timestamp,
	"ended_investing_at" timestamp,
	"city" text,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"status" "invitation_status" DEFAULT 'PENDING' NOT NULL,
	"role" "user_role" NOT NULL,
	"type" "invitation_type" NOT NULL,
	CONSTRAINT "invitations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "monthly_financial_results" (
	"id" text PRIMARY KEY NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"total_operation" numeric(19, 6) NOT NULL,
	"total_fator" numeric(19, 6) NOT NULL,
	"total_ad_valorem" numeric(19, 6) NOT NULL,
	"total_iof" numeric(19, 6) NOT NULL,
	"total_pis" numeric(19, 6) NOT NULL,
	"total_cofins" numeric(19, 6) NOT NULL,
	"total_issqn" numeric(19, 6) NOT NULL,
	"total_expenses" numeric(19, 6) NOT NULL,
	"net_revenue" numeric(19, 6) NOT NULL,
	"gross_result" numeric(19, 6) NOT NULL,
	"net_result" numeric(19, 6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"notification" text NOT NULL,
	"url" text,
	"type" text,
	"read" boolean DEFAULT false NOT NULL,
	"deletable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"access" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quarterly_financial_results" (
	"id" text PRIMARY KEY NOT NULL,
	"quarter" integer DEFAULT 1 NOT NULL,
	"year" integer NOT NULL,
	"total_operation" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_other_income" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_income" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_fator" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_ad_valorem" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_iof" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_costs" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_pis" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_cofins" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_issqn" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_irpj" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_csll" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_taxable_expenses" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_non_taxable_expenses" numeric(19, 6) DEFAULT '0' NOT NULL,
	"total_expenses" numeric(19, 6) DEFAULT '0' NOT NULL,
	"tax_deduction" numeric(19, 6) DEFAULT '0' NOT NULL,
	"gross_revenue" numeric(19, 6) DEFAULT '0' NOT NULL,
	"net_revenue" numeric(19, 6) DEFAULT '0' NOT NULL,
	"gross_result" numeric(19, 6) DEFAULT '0' NOT NULL,
	"net_result" numeric(19, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_deductions" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"quarter" integer NOT NULL,
	"value" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_confirmations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "two_factor_confirmations_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "two_factor_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "two_factor_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "upload_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100),
	"imported_by" varchar(255) NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"success" boolean NOT NULL,
	"error_message" text,
	"records_processed" integer,
	"records_failed" integer,
	"processing_time" integer
);
--> statement-breakpoint
CREATE TABLE "user_investor_links" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"investor_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"hashed_password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "user_role" DEFAULT 'VIEWER',
	"is_two_factor_enabled" boolean DEFAULT false NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions_or_withdrawals" ADD CONSTRAINT "contributions_or_withdrawals_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_email_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_confirmations" ADD CONSTRAINT "two_factor_confirmations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_investor_links" ADD CONSTRAINT "user_investor_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_investor_links" ADD CONSTRAINT "user_investor_links_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;