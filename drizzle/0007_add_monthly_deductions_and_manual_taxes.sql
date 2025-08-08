-- Criação da tabela para deduções fiscais mensais
CREATE TABLE IF NOT EXISTS "monthly_tax_deductions" (
    "id" SERIAL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL CHECK ("month" >= 1 AND "month" <= 12),
    "value" NUMERIC NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("year", "month")
);

-- Criação da tabela para impostos manuais trimestrais
CREATE TABLE IF NOT EXISTS "manual_quarterly_taxes" (
    "id" SERIAL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL CHECK ("quarter" >= 1 AND "quarter" <= 4),
    "csll" NUMERIC NOT NULL DEFAULT '0',
    "irpj" NUMERIC NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("year", "quarter")
);

-- Índices para melhor performance
CREATE INDEX idx_monthly_tax_deductions_year_month ON "monthly_tax_deductions"("year", "month");
CREATE INDEX idx_manual_quarterly_taxes_year_quarter ON "manual_quarterly_taxes"("year", "quarter");

-- Migração de dados existentes da tabela antiga para a nova estrutura
-- Converter deduções trimestrais em mensais (dividindo o valor por 3 meses)
INSERT INTO "monthly_tax_deductions" ("year", "month", "value", "created_at", "updated_at")
SELECT 
    td.year,
    CASE 
        WHEN td.quarter = 1 THEN m.month -- Jan, Fev, Mar
        WHEN td.quarter = 2 THEN m.month + 3 -- Abr, Mai, Jun
        WHEN td.quarter = 3 THEN m.month + 6 -- Jul, Ago, Set
        WHEN td.quarter = 4 THEN m.month + 9 -- Out, Nov, Dez
    END as month,
    td.value / 3 as value, -- Divide o valor trimestral por 3 meses
    td."created_at",
    td."updated_at"
FROM "tax_deductions" td
CROSS JOIN (SELECT 1 as month UNION SELECT 2 UNION SELECT 3) m
WHERE NOT EXISTS (
    SELECT 1 FROM "monthly_tax_deductions" mtd 
    WHERE mtd.year = td.year 
    AND mtd.month = CASE 
        WHEN td.quarter = 1 THEN m.month 
        WHEN td.quarter = 2 THEN m.month + 3
        WHEN td.quarter = 3 THEN m.month + 6
        WHEN td.quarter = 4 THEN m.month + 9
    END
);

-- Adicionar comentários para documentação
COMMENT ON TABLE "monthly_tax_deductions" IS 'Deduções fiscais mensais';
COMMENT ON COLUMN "monthly_tax_deductions"."year" IS 'Ano da dedução';
COMMENT ON COLUMN "monthly_tax_deductions"."month" IS 'Mês da dedução (1-12)';
COMMENT ON COLUMN "monthly_tax_deductions"."value" IS 'Valor da dedução fiscal mensal';

COMMENT ON TABLE "manual_quarterly_taxes" IS 'Impostos CSLL e IRPJ inseridos manualmente por trimestre';
COMMENT ON COLUMN "manual_quarterly_taxes"."year" IS 'Ano do trimestre';
COMMENT ON COLUMN "manual_quarterly_taxes"."quarter" IS 'Trimestre (1-4)';
COMMENT ON COLUMN "manual_quarterly_taxes"."csll" IS 'Valor do CSLL manual';
COMMENT ON COLUMN "manual_quarterly_taxes"."irpj" IS 'Valor do IRPJ manual';
