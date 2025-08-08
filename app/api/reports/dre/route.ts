import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { 
  expenses, 
  entries, 
  financialDataCSV, 
  taxDeductions,
  monthlyTaxDeductions,
  manualQuarterlyTaxes
} from "@/db/schema";
import { z } from "zod";
import { and, eq, gte, lte, sql, sum } from "drizzle-orm";
import logger from "@/lib/logger";

// Interfaces para tipar os resultados das consultas
interface OperationsResult {
  totalValorFator: number;
  totalValorAdValorem: number;
  totalValorIOF: number;
  totalValorTarifas: number;
  totalValorLiquido: number;
  totalPIS: number;
  totalCOFINS: number;
  totalISSQN: number;
}

interface ExpensesResult {
  totalExpenses: number;
  totalTaxableExpenses: number;
}

interface EntriesResult {
  totalEntries: number;
}

interface TaxDeductionResult {
  value: number;
}

// Interface para os parâmetros da query
interface DREQueryParams {
  month?: number;
  year: number;
  quarterly?: boolean;
  annual?: boolean;
}

// Schema para validar os parâmetros da query
const queryParamsSchema = z.object({
  month: z.coerce.number().optional(),
  year: z.coerce.number(),
  quarterly: z.coerce.boolean().optional().default(false),
  annual: z.coerce.boolean().optional().default(false),
});

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET DRE Report`, {
    source: 'backend',
    context: 'api:reports:dre',
    tags: ['request', 'get', 'report', 'dre'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to DRE report`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parâmetros para filtrar por período
    const { searchParams } = new URL(req.url);
    
    // Extrair e validar os parâmetros da query
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const quarterlyParam = searchParams.get("quarterly") === "true";
    const annualParam = searchParams.get("annual") === "true";
    
    // CORREÇÃO: Não aplicar fallbacks - usar exatamente o que foi solicitado
    let year: number | null = null;
    if (yearParam === "null") {
      year = null; // "Todos os anos"
    } else if (yearParam) {
      year = parseInt(yearParam);
    } else {
      // Se não foi especificado year, retornar erro ao invés de fallback
      return NextResponse.json({ 
        error: "Year parameter is required", 
        data: {
          periodo: { mes: 0, ano: 0, dataInicio: "", dataFim: "", trimestral: false, anual: false },
          receitas: { operacoes: 0, outras: 0, total: 0 },
          custos: { fator: 0, adValorem: 0, iof: 0, tarifas: 0, total: 0 },
          despesas: { operacionais: 0, tributaveis: 0, total: 0 },
          impostos: { pis: 0, cofins: 0, issqn: 0, ir: 0, csll: 0, total: 0 },
          deducaoFiscal: 0,
          resultadoBruto: 0,
          resultadoOperacional: 0,
          resultadoLiquido: 0
        }
      }, { status: 200 });
    }
    
    const params: DREQueryParams = {
      month: monthParam ? parseInt(monthParam) : undefined,
      year: year || new Date().getFullYear(), // Só usar ano atual se year for explicitamente null
      quarterly: quarterlyParam,
      annual: annualParam,
    };
    
    // Validar parâmetros
    const result = queryParamsSchema.safeParse(params);
    if (!result.success) {
      logger.warn(`Invalid query parameters for DRE report`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['validation', 'error'],
        data: { requestId, errors: result.error.errors }
      });
      
      return NextResponse.json({ error: "Invalid query parameters", details: result.error.errors }, { status: 400 });
    }
    
    const validParams = result.data;
    
    // Configurar período com base nos parâmetros
    let startDate: Date;
    let endDate: Date;
    
    if (yearParam === "null") {
      // Se year é "null", buscar todos os anos disponível (com limite)
      // Buscar apenas os últimos 3 anos para performance
      const currentYear = new Date().getFullYear();
      startDate = new Date(currentYear - 2, 0, 1); // Últimos 3 anos
      endDate = new Date(currentYear, 11, 31);
      
      logger.debug(`Generating DRE report for last 3 years (performance optimized)`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['report', 'all-years-optimized'],
        data: { requestId, startYear: currentYear - 2, endYear: currentYear }
      });
    } else if (validParams.annual) {
      // Período anual (1 de janeiro a 31 de dezembro)
      startDate = new Date(validParams.year, 0, 1);
      endDate = new Date(validParams.year, 11, 31);
      
      logger.debug(`Generating annual DRE report for ${validParams.year}`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['report', 'annual'],
        data: { requestId, year: validParams.year }
      });
    } 
    else if (validParams.quarterly && validParams.month) {
      // Período trimestral (3 meses a partir do mês especificado)
      const quarterStartMonth = Math.floor((validParams.month - 1) / 3) * 3;
      startDate = new Date(validParams.year, quarterStartMonth, 1);
      endDate = new Date(validParams.year, quarterStartMonth + 3, 0);
      
      logger.debug(`Generating quarterly DRE report`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['report', 'quarterly'],
        data: { 
          requestId, 
          year: validParams.year,
          quarterStartMonth: quarterStartMonth + 1,
          quarterEndMonth: quarterStartMonth + 3
        }
      });
    } 
    else if (validParams.month) {
      // Período mensal
      startDate = new Date(validParams.year, validParams.month - 1, 1);
      endDate = new Date(validParams.year, validParams.month, 0);
      
      logger.debug(`Generating monthly DRE report for ${validParams.month}/${validParams.year}`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['report', 'monthly'],
        data: { requestId, month: validParams.month, year: validParams.year }
      });
    } 
    else {
      // CORREÇÃO: Se período não foi especificado adequadamente, retornar dados zerados
      logger.warn(`Invalid period specification - returning zero data`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['report', 'invalid-period'],
        data: { requestId, year: validParams.year, month: validParams.month, quarterly: validParams.quarterly, annual: validParams.annual }
      });
      
      return NextResponse.json({ 
        data: {
          periodo: { 
            mes: validParams.month || 0, 
            ano: validParams.year, 
            dataInicio: new Date().toISOString(), 
            dataFim: new Date().toISOString(), 
            trimestral: false, 
            anual: false 
          },
          receitas: { operacoes: 0, outras: 0, total: 0 },
          custos: { fator: 0, adValorem: 0, iof: 0, tarifas: 0, total: 0 },
          despesas: { operacionais: 0, tributaveis: 0, total: 0 },
          impostos: { pis: 0, cofins: 0, issqn: 0, ir: 0, csll: 0, total: 0 },
          deducaoFiscal: 0,
          resultadoBruto: 0,
          resultadoOperacional: 0,
          resultadoLiquido: 0
        }
      });
    }
    
    // 1. Calcular valores das operações financeiras do CSV
    logger.debug(`Querying financial operations data`, {
      source: 'backend',
      context: 'api:reports:dre',
      tags: ['query', 'financial-data'],
      data: { requestId }
    });
    
    // First, check if we have any data in the financialDataCSV table
    const dataCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(financialDataCSV);
      
    logger.debug(`Financial data count in database`, {
      source: 'backend',
      context: 'api:reports:dre',
      tags: ['query', 'financial-data-count'],
      data: { 
        requestId,
        count: Number(dataCount[0]?.count || 0),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
    // Log a sample of the data to verify date fields
    const sampleData = await db
      .select()
      .from(financialDataCSV)
      .limit(1);
      
    if (sampleData.length > 0) {
      logger.debug(`Financial data sample from database`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['query', 'financial-data-sample'],
        data: { 
          requestId,
          sampleId: sampleData[0].id,
          sampleDate: sampleData[0].Data ? sampleData[0].Data.toISOString() : null
        }
      });
    }
    
    const operationsResult = await db
      .select({
        totalValorFator: sql`COALESCE(SUM("valor_fator"), 0)`.as("total_valor_fator"),
        totalValorAdValorem: sql`COALESCE(SUM("valor_ad_valorem"), 0)`.as("total_valor_ad_valorem"),
        totalValorIOF: sql`COALESCE(SUM("valor_iof"), 0)`.as("total_valor_iof"),
        totalValorTarifas: sql`COALESCE(SUM("valor_tarifas"), 0)`.as("total_valor_tarifas"),
        totalValorLiquido: sql`COALESCE(SUM("valor_liquido"), 0)`.as("total_valor_liquido"),
        totalPIS: sql`COALESCE(SUM("pis"), 0)`.as("total_pis"),
        totalCOFINS: sql`COALESCE(SUM("cofins"), 0)`.as("total_cofins"),
        totalISSQN: sql`COALESCE(SUM("issqn"), 0)`.as("total_issqn"),
      })
      .from(financialDataCSV)
      .where(
        and(
          gte(financialDataCSV.Data, startDate),
          lte(financialDataCSV.Data, endDate)
        )
      );
    
    // 2. Calcular despesas do período
    logger.debug(`Querying expenses data`, {
      source: 'backend',
      context: 'api:reports:dre',
      tags: ['query', 'expenses'],
      data: { requestId }
    });
    
    const expensesResult = await db
      .select({
        totalExpenses: sql`COALESCE(SUM("value"), 0)`.as("total_expenses"),
        totalTaxableExpenses: sql`COALESCE(SUM(CASE WHEN "is_taxable" = true THEN "value" ELSE 0 END), 0)`.as("total_taxable_expenses"),
      })
      .from(expenses)
      .where(
        and(
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );
    
    // 3. Calcular entradas adicionais do período
    logger.debug(`Querying additional entries data`, {
      source: 'backend',
      context: 'api:reports:dre',
      tags: ['query', 'entries'],
      data: { requestId }
    });
    
    const entriesResult = await db
      .select({
        totalEntries: sql`COALESCE(SUM("value"), 0)`.as("total_entries"),
      })
      .from(entries)
      .where(
        and(
          gte(entries.date, startDate),
          lte(entries.date, endDate)
        )
      );
    
    // 4. Obter dedução fiscal baseado no tipo de período
    let taxDeductionValue = 0;
    const quarterNumber = validParams.quarterly ? Math.floor((startDate.getMonth()) / 3) + 1 : 0;
    
    if (validParams.monthly) {
      // Para período mensal, buscar dedução fiscal mensal
      logger.debug(`Querying monthly tax deduction`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['query', 'monthly-tax-deduction'],
        data: { 
          requestId,
          year: validParams.year,
          month: validParams.month
        }
      });
      
      const monthlyTaxDeductionResult = await db
        .select({
          value: sql`COALESCE(value, 0)`.as("value")
        })
        .from(monthlyTaxDeductions)
        .where(
          and(
            eq(monthlyTaxDeductions.year, validParams.year),
            eq(monthlyTaxDeductions.month, validParams.month || 1)
          )
        );
      
      if (monthlyTaxDeductionResult.length > 0) {
        taxDeductionValue = Number(monthlyTaxDeductionResult[0].value);
      }
      
    } else if (validParams.quarterly) {
      // Para período trimestral, somar deduções mensais do trimestre
      const startMonth = (quarterNumber - 1) * 3 + 1;
      const endMonth = startMonth + 2;
      
      logger.debug(`Querying quarterly tax deductions (sum of months)`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['query', 'quarterly-tax-deduction'],
        data: { 
          requestId,
          year: validParams.year,
          quarter: quarterNumber,
          startMonth,
          endMonth
        }
      });
      
      const quarterlyTaxDeductionResult = await db
        .select({
          totalValue: sql`COALESCE(SUM(value), 0)`.as('totalValue')
        })
        .from(monthlyTaxDeductions)
        .where(
          and(
            eq(monthlyTaxDeductions.year, validParams.year),
            gte(monthlyTaxDeductions.month, startMonth),
            lte(monthlyTaxDeductions.month, endMonth)
          )
        );
      
      if (quarterlyTaxDeductionResult.length > 0) {
        taxDeductionValue = Number(quarterlyTaxDeductionResult[0].totalValue);
      }
      
      // Fallback: Se não houver deduções mensais, buscar na tabela antiga
      if (taxDeductionValue === 0) {
        const oldTaxDeductionResult = await db
          .select({
            value: sql`COALESCE(value, 0)`.as("value")
          })
          .from(taxDeductions)
          .where(
            and(
              eq(taxDeductions.year, validParams.year),
              eq(taxDeductions.quarter, quarterNumber)
            )
          );
        
        if (oldTaxDeductionResult.length > 0) {
          taxDeductionValue = Number(oldTaxDeductionResult[0].value);
        }
      }
      
    } else if (validParams.annual) {
      // Para período anual, somar todas as deduções mensais do ano
      logger.debug(`Querying annual tax deductions (sum of all months)`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['query', 'annual-tax-deduction'],
        data: { 
          requestId,
          year: validParams.year
        }
      });
      
      const annualTaxDeductionResult = await db
        .select({
          totalValue: sql`COALESCE(SUM(value), 0)`.as('totalValue')
        })
        .from(monthlyTaxDeductions)
        .where(eq(monthlyTaxDeductions.year, validParams.year));
      
      if (annualTaxDeductionResult.length > 0) {
        taxDeductionValue = Number(annualTaxDeductionResult[0].totalValue);
      }
    }
    
    // Extrair valores e fazer o cast para os tipos corretos
    const operations: OperationsResult = {
      totalValorFator: Number(operationsResult[0]?.totalValorFator || 0),
      totalValorAdValorem: Number(operationsResult[0]?.totalValorAdValorem || 0),
      totalValorIOF: Number(operationsResult[0]?.totalValorIOF || 0),
      totalValorTarifas: Number(operationsResult[0]?.totalValorTarifas || 0),
      totalValorLiquido: Number(operationsResult[0]?.totalValorLiquido || 0),
      totalPIS: Number(operationsResult[0]?.totalPIS || 0),
      totalCOFINS: Number(operationsResult[0]?.totalCOFINS || 0),
      totalISSQN: Number(operationsResult[0]?.totalISSQN || 0)
    };
    
    const expensesData: ExpensesResult = {
      totalExpenses: Number(expensesResult[0]?.totalExpenses || 0),
      totalTaxableExpenses: Number(expensesResult[0]?.totalTaxableExpenses || 0)
    };
    
    const entriesData: EntriesResult = {
      totalEntries: Number(entriesResult[0]?.totalEntries || 0)
    };
    
    logger.debug(`Raw DRE data retrieved`, {
      source: 'backend',
      context: 'api:reports:dre',
      tags: ['data', 'raw'],
      data: {
        requestId,
        operations,
        expenses: expensesData,
        entries: entriesData,
        taxDeduction: taxDeductionValue
      }
    });
    
    // NOVA LÓGICA DE CÁLCULO DO DRE:
    
    // 1. Valor da operação
    const valorOperacao = operations.totalValorFator + 
                        operations.totalValorAdValorem + 
                        operations.totalValorIOF + 
                        operations.totalValorTarifas + 
                        operations.totalValorLiquido;
    
    // 2. Receita Bruta (dedução fiscal SOMADA conforme solicitado)
    const receitaBruta = operations.totalValorFator + 
                        operations.totalValorAdValorem + 
                        operations.totalValorTarifas + 
                        taxDeductionValue; // Dedução fiscal é SOMADA para aumentar a receita bruta
    
    // 3. Receita Líquida
    const receitaLiquida = receitaBruta - 
                          operations.totalCOFINS - 
                          operations.totalISSQN;
    
    // 4. Despesas Totais
    const despesasTotais = expensesData.totalExpenses;
    
    // 5. Resultado Bruto
    const resultadoBruto = receitaLiquida - despesasTotais;
    
    // 6. Entradas Operacionais
    const entradasOperacionais = entriesData.totalEntries;
    
    // 7. Impostos (IRPJ e CSLL)
    let irpj = 0;
    let csll = 0;
    
    // Para períodos mensais, não há CSLL e IRPJ
    if (validParams.monthly) {
      irpj = 0;
      csll = 0;
      
    } else if (validParams.quarterly) {
      // Para períodos trimestrais, primeiro tentar buscar valores manuais
      logger.debug(`Querying manual quarterly taxes`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['query', 'manual-quarterly-taxes'],
        data: { 
          requestId,
          year: validParams.year,
          quarter: quarterNumber
        }
      });
      
      const manualTaxesResult = await db
        .select({
          csll: sql`COALESCE(csll, 0)`.as("csll"),
          irpj: sql`COALESCE(irpj, 0)`.as("irpj")
        })
        .from(manualQuarterlyTaxes)
        .where(
          and(
            eq(manualQuarterlyTaxes.year, validParams.year),
            eq(manualQuarterlyTaxes.quarter, quarterNumber)
          )
        );
      
      if (manualTaxesResult.length > 0) {
        // Usar valores manuais se disponíveis
        csll = Number(manualTaxesResult[0].csll);
        irpj = Number(manualTaxesResult[0].irpj);
        
        logger.debug(`Using manual quarterly taxes`, {
          source: 'backend',
          context: 'api:reports:dre',
          tags: ['manual-taxes'],
          data: { 
            requestId,
            csll,
            irpj
          }
        });
      } else {
        // Fallback: calcular automaticamente se não houver valores manuais
        if (resultadoBruto > 0) {
          irpj = resultadoBruto * 0.15;
          csll = resultadoBruto * 0.09;
        }
        
        logger.debug(`Calculated automatic quarterly taxes`, {
          source: 'backend',
          context: 'api:reports:dre',
          tags: ['calculated-taxes'],
          data: { 
            requestId,
            csll,
            irpj,
            resultadoBruto
          }
        });
      }
      
    } else if (validParams.annual) {
      // Para período anual, somar todos os valores manuais do ano ou calcular
      logger.debug(`Querying annual manual taxes (sum of quarters)`, {
        source: 'backend',
        context: 'api:reports:dre',
        tags: ['query', 'annual-manual-taxes'],
        data: { 
          requestId,
          year: validParams.year
        }
      });
      
      const annualManualTaxesResult = await db
        .select({
          totalCsll: sql`COALESCE(SUM(csll), 0)`.as('totalCsll'),
          totalIrpj: sql`COALESCE(SUM(irpj), 0)`.as('totalIrpj')
        })
        .from(manualQuarterlyTaxes)
        .where(eq(manualQuarterlyTaxes.year, validParams.year));
      
      if (annualManualTaxesResult.length > 0 && 
          (Number(annualManualTaxesResult[0].totalCsll) > 0 || Number(annualManualTaxesResult[0].totalIrpj) > 0)) {
        // Usar soma dos valores manuais se disponíveis
        csll = Number(annualManualTaxesResult[0].totalCsll);
        irpj = Number(annualManualTaxesResult[0].totalIrpj);
        
        logger.debug(`Using summed annual manual taxes`, {
          source: 'backend',
          context: 'api:reports:dre',
          tags: ['annual-manual-taxes'],
          data: { 
            requestId,
            csll,
            irpj
          }
        });
      } else {
        // Fallback: calcular automaticamente
        if (resultadoBruto > 0) {
          irpj = resultadoBruto * 0.15;
          csll = resultadoBruto * 0.09;
        }
        
        logger.debug(`Calculated automatic annual taxes`, {
          source: 'backend',
          context: 'api:reports:dre',
          tags: ['calculated-annual-taxes'],
          data: { 
            requestId,
            csll,
            irpj,
            resultadoBruto
          }
        });
      }
    }
    
    // 8. Resultado Líquido
    const resultadoLiquido = resultadoBruto + entradasOperacionais - irpj - csll;
    
    // Preparar dados para o DRE
    const dre = {
      periodo: {
        mes: startDate.getMonth() + 1,
        ano: startDate.getFullYear(),
        dataInicio: startDate,
        dataFim: endDate,
        trimestral: validParams.quarterly,
        anual: validParams.annual
      },
      receitas: {
        operacoes: valorOperacao,
        outras: entradasOperacionais,
        total: receitaBruta
      },
      custos: {
        fator: operations.totalValorFator,
        adValorem: operations.totalValorAdValorem,
        iof: operations.totalValorIOF,
        tarifas: operations.totalValorTarifas,
        total: operations.totalValorFator + operations.totalValorAdValorem + operations.totalValorIOF
      },
      deducaoFiscal: taxDeductionValue,
      resultadoBruto: receitaLiquida,
      despesas: {
        operacionais: despesasTotais,
        tributaveis: expensesData.totalTaxableExpenses,
        total: despesasTotais
      },
      resultadoOperacional: resultadoBruto,
      impostos: {
        pis: operations.totalPIS,
        cofins: operations.totalCOFINS,
        issqn: operations.totalISSQN,
        ir: irpj,
        csll: csll,
        total: operations.totalPIS + 
               operations.totalCOFINS + 
               operations.totalISSQN + 
               irpj + csll
      },
      resultadoLiquido
    };
    
    logger.info(`DRE report generated successfully`, {
      source: 'backend',
      context: 'api:reports:dre',
      tags: ['report', 'success'],
      data: {
        requestId,
        period: validParams.quarterly 
          ? `Q${Math.floor((startDate.getMonth()) / 3) + 1}/${startDate.getFullYear()}`
          : validParams.annual
            ? `${startDate.getFullYear()}`
            : `${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        summary: {
          receita: dre.receitas.total,
          resultadoBruto: dre.resultadoBruto,
          resultadoOperacional: dre.resultadoOperacional,
          resultadoLiquido: dre.resultadoLiquido
        }
      }
    });
    
    return NextResponse.json({ data: dre });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error generating DRE report`, {
      source: 'backend',
      context: 'api:reports:dre',
      tags: ['error', 'report'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[DRE_REPORT]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 