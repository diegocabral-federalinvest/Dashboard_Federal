-- Create the quarterly_financial_results table
CREATE TABLE IF NOT EXISTS "quarterly_financial_results" (
  "id" text PRIMARY KEY,
  "quarter" integer NOT NULL DEFAULT 1,
  "year" integer NOT NULL,
  
  -- Receitas
  "total_operation" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_other_income" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_income" numeric(19, 6) NOT NULL DEFAULT '0',
  
  -- Custos
  "total_fator" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_ad_valorem" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_iof" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_costs" numeric(19, 6) NOT NULL DEFAULT '0',
  
  -- Impostos
  "total_pis" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_cofins" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_issqn" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_irpj" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_csll" numeric(19, 6) NOT NULL DEFAULT '0',
  
  -- Despesas
  "total_taxable_expenses" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_non_taxable_expenses" numeric(19, 6) NOT NULL DEFAULT '0',
  "total_expenses" numeric(19, 6) NOT NULL DEFAULT '0',
  
  -- Resultados
  "tax_deduction" numeric(19, 6) NOT NULL DEFAULT '0',
  "gross_revenue" numeric(19, 6) NOT NULL DEFAULT '0',
  "net_revenue" numeric(19, 6) NOT NULL DEFAULT '0',
  "gross_result" numeric(19, 6) NOT NULL DEFAULT '0',
  "net_result" numeric(19, 6) NOT NULL DEFAULT '0',
  
  -- Metadados
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
); 