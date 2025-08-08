import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { financialDataCSV } from "@/db/schema";
import { z } from "zod";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import logger from "@/lib/logger";

// Interface para tipar os resultados das consultas
interface CurrentYearResult {
  totalOperation: number;
  totalFator: number;
  totalAdValorem: number;
  totalPIS: number;
  totalCOFINS: number;
  totalISSQN: number;
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  logger.info(`Iniciando GET /api/reports/taxes`, {
    source: 'backend',
    context: 'api:reports:taxes',
    tags: ['request', 'get', 'taxes'],
    data: { requestId, url: req.url }
  });

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Acesso não autorizado à projeção de impostos`, {
        source: 'backend',
        context: 'api:reports:taxes',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parâmetros para filtrar e configurar a projeção
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const growthRate = searchParams.get("growth");
    
    // Valores padrão se não fornecidos
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear + 1;
    const growth = growthRate ? parseFloat(growthRate) : 5; // 5% de crescimento padrão
    
    logger.debug(`Parâmetros da projeção`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['parameters'],
      data: { requestId, targetYear, growth }
    });

    // Obter dados do ano atual para fazer projeções
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
    // Obter as taxas de impostos mais recentes
    logger.debug(`Buscando taxas de impostos`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['db-query', 'tax-rates'],
      data: { requestId }
    });
    
    // Taxas padrão se não houver registros
    const taxRateValues = {
      irpjRate: '15.00', // Usar string para evitar problemas com decimal
      csllRate: '9.00',
      pisRate: '0.65',
      cofinsRate: '3.00',
      issRate: '2.00',
    };
    
    logger.debug(`Taxas de impostos encontradas (ou padrão)`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['tax-rates'],
      data: { requestId, rates: taxRateValues }
    });

    // Obter dados de operações financeiras do ano atual
    logger.debug(`Buscando dados financeiros do ano atual`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['db-query', 'financial-data'],
      data: { requestId, currentYear }
    });
    const currentYearData = await db
      .select({
        totalOperation: sql`COALESCE(SUM("valor_liquido"), 0)`.as("total_operation"),
        totalFator: sql`COALESCE(SUM("valor_fator"), 0)`.as("total_fator"),
        totalAdValorem: sql`COALESCE(SUM("valor_ad_valorem"), 0)`.as("total_ad_valorem"),
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
    
    // Extrair valores e fazer cast
    const current: CurrentYearResult = {
      totalOperation: Number(currentYearData[0]?.totalOperation || 0),
      totalFator: Number(currentYearData[0]?.totalFator || 0),
      totalAdValorem: Number(currentYearData[0]?.totalAdValorem || 0),
      totalPIS: Number(currentYearData[0]?.totalPIS || 0),
      totalCOFINS: Number(currentYearData[0]?.totalCOFINS || 0),
      totalISSQN: Number(currentYearData[0]?.totalISSQN || 0),
    };
    
    logger.debug(`Dados financeiros do ano atual processados`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['data', 'current-year'],
      data: { requestId, currentData: current }
    });

    // Aplicar taxa de crescimento para projeção
    const growthFactor = 1 + (growth / 100);
    
    // Projetar receita operacional
    const projectedOperations = current.totalOperation * growthFactor;
    
    // Calcular projeção de impostos
    const projectedPIS = projectedOperations * (parseFloat(taxRateValues.pisRate ?? '0') / 100);
    const projectedCOFINS = projectedOperations * (parseFloat(taxRateValues.cofinsRate ?? '0') / 100);
    const projectedISS = projectedOperations * (parseFloat(taxRateValues.issRate ?? '0') / 100);
    
    // Calcular projeção de resultado antes do IRPJ e CSLL (simplificado)
    const projectedCosts = current.totalFator * growthFactor + current.totalAdValorem * growthFactor;
    
    const projectedGrossResult = projectedOperations - projectedCosts;
    const projectedOperatingExpenses = projectedGrossResult * 0.40; // Estimativa de 40% de despesas
    const projectedOperatingResult = projectedGrossResult - projectedOperatingExpenses;
    
    // Calcular IRPJ e CSLL projetados
    const projectedIRPJ = projectedOperatingResult * (parseFloat(taxRateValues.irpjRate ?? '0') / 100);
    const projectedCSLL = projectedOperatingResult * (parseFloat(taxRateValues.csllRate ?? '0') / 100);
    
    // Projeção total de impostos
    const totalProjectedTaxes = projectedPIS + projectedCOFINS + projectedISS + projectedIRPJ + projectedCSLL;
    
    logger.debug(`Projeção calculada`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['calculation', 'projection'],
      data: { 
        requestId, 
        projectedOperations, 
        projectedPIS, 
        projectedCOFINS, 
        projectedISS, 
        projectedIRPJ, 
        projectedCSLL, 
        totalProjectedTaxes 
      }
    });

    // Preparar dados da projeção
    const taxProjection = {
      ano: {
        atual: currentYear,
        projetado: targetYear
      },
      taxaCrescimento: growth,
      valores: {
        atual: {
          operacoes: current.totalOperation,
          pis: current.totalPIS,
          cofins: current.totalCOFINS,
          iss: current.totalISSQN
        },
        projetado: {
          operacoes: projectedOperations,
          pis: projectedPIS,
          cofins: projectedCOFINS,
          iss: projectedISS,
          irpj: projectedIRPJ,
          csll: projectedCSLL,
          totalImpostos: totalProjectedTaxes
        }
      },
      taxas: {
        pis: parseFloat(taxRateValues.pisRate ?? '0'),
        cofins: parseFloat(taxRateValues.cofinsRate ?? '0'),
        iss: parseFloat(taxRateValues.issRate ?? '0'),
        irpj: parseFloat(taxRateValues.irpjRate ?? '0'),
        csll: parseFloat(taxRateValues.csllRate ?? '0')
      },
      percentualImpostos: projectedOperations > 0 ? (totalProjectedTaxes / projectedOperations) * 100 : 0
    };
    
    logger.info(`Projeção de impostos gerada com sucesso`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['success', 'projection'],
      data: { requestId, targetYear }
    });

    return NextResponse.json({ data: taxProjection });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Erro ao gerar projeção de impostos: ${errorMessage}`, {
      source: 'backend',
      context: 'api:reports:taxes',
      tags: ['error', 'projection'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });

    console.error("[TAX_PROJECTION]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 