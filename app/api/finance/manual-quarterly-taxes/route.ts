import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { manualQuarterlyTaxes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import logger from "@/lib/logger";

// Schema para validação do corpo da requisição
const manualQuarterlyTaxesSchema = z.object({
  year: z.number().int().positive(),
  quarter: z.number().int().min(1).max(4),
  csll: z.number().nonnegative(),
  irpj: z.number().nonnegative(),
});

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: POST Manual Quarterly Taxes`, {
    source: 'backend',
    context: 'api:finance:manual_quarterly_taxes',
    tags: ['request', 'post', 'manual_quarterly_taxes'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to manual quarterly taxes endpoint`, {
        source: 'backend',
        context: 'api:finance:manual_quarterly_taxes',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Obter e validar corpo da requisição
    const rawBody = await req.text();
    
    logger.debug(`Raw request body for manual quarterly taxes`, {
      source: 'backend',
      context: 'api:finance:manual_quarterly_taxes',
      tags: ['debug', 'request', 'manual_quarterly_taxes'],
      data: { 
        requestId,
        rawBody
      }
    });
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      logger.error(`Failed to parse JSON body for manual quarterly taxes`, {
        source: 'backend',
        context: 'api:finance:manual_quarterly_taxes',
        tags: ['error', 'parsing', 'manual_quarterly_taxes'],
        data: { 
          requestId,
          rawBody,
          error: parseError instanceof Error ? parseError.message : String(parseError)
        }
      });
      
      return NextResponse.json({ 
        error: "Invalid JSON in request body" 
      }, { status: 400 });
    }
    
    // Validar usando schema
    const validationResult = manualQuarterlyTaxesSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn(`Invalid request body for manual quarterly taxes`, {
        source: 'backend',
        context: 'api:finance:manual_quarterly_taxes',
        tags: ['validation', 'error'],
        data: { 
          requestId,
          requestBody: body,
          errors: validationResult.error.errors
        }
      });
      
      return NextResponse.json({ 
        error: "Invalid request body", 
        details: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const { year, quarter, csll, irpj } = validationResult.data;
    
    // Log dados validados
    logger.debug(`Validated manual quarterly taxes data`, {
      source: 'backend',
      context: 'api:finance:manual_quarterly_taxes',
      tags: ['debug', 'validation', 'manual_quarterly_taxes'],
      data: { 
        requestId,
        year,
        quarter,
        csll,
        irpj
      }
    });
    
    // Verificar se já existem impostos para este ano/trimestre
    const existingTaxes = await db
      .select()
      .from(manualQuarterlyTaxes)
      .where(
        and(
          eq(manualQuarterlyTaxes.year, year),
          eq(manualQuarterlyTaxes.quarter, quarter)
        )
      )
      .limit(1);
    
    let result;
    
    if (existingTaxes.length > 0) {
      // Atualizar impostos existentes
      logger.info(`Updating existing manual quarterly taxes for ${year} Q${quarter}`, {
        source: 'backend',
        context: 'api:finance:manual_quarterly_taxes',
        tags: ['update', 'manual_quarterly_taxes'],
        data: { 
          requestId,
          taxesId: existingTaxes[0].id,
          oldCsll: existingTaxes[0].csll,
          oldIrpj: existingTaxes[0].irpj,
          newCsll: csll,
          newIrpj: irpj
        }
      });
      
      result = await db
        .update(manualQuarterlyTaxes)
        .set({ 
          csll: csll.toString(),
          irpj: irpj.toString(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(manualQuarterlyTaxes.year, year),
            eq(manualQuarterlyTaxes.quarter, quarter)
          )
        )
        .returning();
    } else {
      // Criar novos impostos
      logger.info(`Creating new manual quarterly taxes for ${year} Q${quarter}`, {
        source: 'backend',
        context: 'api:finance:manual_quarterly_taxes',
        tags: ['create', 'manual_quarterly_taxes'],
        data: { 
          requestId,
          year,
          quarter,
          csll,
          irpj
        }
      });
      
      result = await db
        .insert(manualQuarterlyTaxes)
        .values({
          year,
          quarter,
          csll: csll.toString(),
          irpj: irpj.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }
    
    logger.info(`Manual quarterly taxes saved successfully`, {
      source: 'backend',
      context: 'api:finance:manual_quarterly_taxes',
      tags: ['success', 'manual_quarterly_taxes'],
      data: { 
        requestId,
        result: result[0]
      }
    });
    
    return NextResponse.json({ 
      success: true,
      data: result[0]
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error saving manual quarterly taxes`, {
      source: 'backend',
      context: 'api:finance:manual_quarterly_taxes',
      tags: ['error', 'manual_quarterly_taxes'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[MANUAL_QUARTERLY_TAXES]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET Manual Quarterly Taxes`, {
    source: 'backend',
    context: 'api:finance:manual_quarterly_taxes',
    tags: ['request', 'get', 'manual_quarterly_taxes'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to manual quarterly taxes endpoint`, {
        source: 'backend',
        context: 'api:finance:manual_quarterly_taxes',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Extrair parâmetros da consulta
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null;
    const quarter = searchParams.get("quarter") ? parseInt(searchParams.get("quarter")!) : null;
    
    // Validar parâmetros
    if (!year || !quarter) {
      logger.warn(`Missing required query parameters for manual quarterly taxes`, {
        source: 'backend',
        context: 'api:finance:manual_quarterly_taxes',
        tags: ['validation', 'error'],
        data: { 
          requestId,
          year,
          quarter
        }
      });
      
      return NextResponse.json({ 
        error: "Missing required query parameters",
        details: "Both 'year' and 'quarter' are required"
      }, { status: 400 });
    }
    
    // Buscar impostos
    const taxes = await db
      .select()
      .from(manualQuarterlyTaxes)
      .where(
        and(
          eq(manualQuarterlyTaxes.year, year),
          eq(manualQuarterlyTaxes.quarter, quarter)
        )
      )
      .limit(1);
    
    logger.info(`Manual quarterly taxes query successful`, {
      source: 'backend',
      context: 'api:finance:manual_quarterly_taxes',
      tags: ['success', 'query', 'manual_quarterly_taxes'],
      data: { 
        requestId,
        found: taxes.length > 0,
        year,
        quarter
      }
    });
    
    return NextResponse.json({ 
      success: true,
      data: taxes[0] || { year, quarter, csll: 0, irpj: 0 }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error fetching manual quarterly taxes`, {
      source: 'backend',
      context: 'api:finance:manual_quarterly_taxes',
      tags: ['error', 'query', 'manual_quarterly_taxes'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[MANUAL_QUARTERLY_TAXES]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
