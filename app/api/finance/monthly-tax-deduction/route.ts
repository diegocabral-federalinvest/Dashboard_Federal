import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { monthlyTaxDeductions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import logger from "@/lib/logger";

// Schema para validação do corpo da requisição
const monthlyTaxDeductionSchema = z.object({
  year: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  value: z.number().nonnegative(),
});

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: POST Monthly Tax Deduction`, {
    source: 'backend',
    context: 'api:finance:monthly_tax_deduction',
    tags: ['request', 'post', 'monthly_tax_deduction'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to monthly tax deduction endpoint`, {
        source: 'backend',
        context: 'api:finance:monthly_tax_deduction',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Obter e validar corpo da requisição
    const rawBody = await req.text();
    
    logger.debug(`Raw request body for monthly tax deduction`, {
      source: 'backend',
      context: 'api:finance:monthly_tax_deduction',
      tags: ['debug', 'request', 'monthly_tax_deduction'],
      data: { 
        requestId,
        rawBody
      }
    });
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      logger.error(`Failed to parse JSON body for monthly tax deduction`, {
        source: 'backend',
        context: 'api:finance:monthly_tax_deduction',
        tags: ['error', 'parsing', 'monthly_tax_deduction'],
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
    const validationResult = monthlyTaxDeductionSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn(`Invalid request body for monthly tax deduction`, {
        source: 'backend',
        context: 'api:finance:monthly_tax_deduction',
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
    
    const { year, month, value } = validationResult.data;
    
    // Log dados validados
    logger.debug(`Validated monthly tax deduction data`, {
      source: 'backend',
      context: 'api:finance:monthly_tax_deduction',
      tags: ['debug', 'validation', 'monthly_tax_deduction'],
      data: { 
        requestId,
        year,
        month,
        value
      }
    });
    
    // Verificar se já existe uma dedução para este ano/mês
    const existingDeduction = await db
      .select()
      .from(monthlyTaxDeductions)
      .where(
        and(
          eq(monthlyTaxDeductions.year, year),
          eq(monthlyTaxDeductions.month, month)
        )
      )
      .limit(1);
    
    let result;
    
    if (existingDeduction.length > 0) {
      // Atualizar dedução existente
      logger.info(`Updating existing monthly tax deduction for ${year}/${month}`, {
        source: 'backend',
        context: 'api:finance:monthly_tax_deduction',
        tags: ['update', 'monthly_tax_deduction'],
        data: { 
          requestId,
          deductionId: existingDeduction[0].id,
          oldValue: existingDeduction[0].value,
          newValue: value
        }
      });
      
      result = await db
        .update(monthlyTaxDeductions)
        .set({ 
          value: value.toString(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(monthlyTaxDeductions.year, year),
            eq(monthlyTaxDeductions.month, month)
          )
        )
        .returning();
    } else {
      // Criar nova dedução
      logger.info(`Creating new monthly tax deduction for ${year}/${month}`, {
        source: 'backend',
        context: 'api:finance:monthly_tax_deduction',
        tags: ['create', 'monthly_tax_deduction'],
        data: { 
          requestId,
          year,
          month,
          value
        }
      });
      
      result = await db
        .insert(monthlyTaxDeductions)
        .values({
          year,
          month,
          value: value.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }
    
    logger.info(`Monthly tax deduction saved successfully`, {
      source: 'backend',
      context: 'api:finance:monthly_tax_deduction',
      tags: ['success', 'monthly_tax_deduction'],
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
    
    logger.error(`Error saving monthly tax deduction`, {
      source: 'backend',
      context: 'api:finance:monthly_tax_deduction',
      tags: ['error', 'monthly_tax_deduction'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[MONTHLY_TAX_DEDUCTION]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET Monthly Tax Deduction`, {
    source: 'backend',
    context: 'api:finance:monthly_tax_deduction',
    tags: ['request', 'get', 'monthly_tax_deduction'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to monthly tax deduction endpoint`, {
        source: 'backend',
        context: 'api:finance:monthly_tax_deduction',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Extrair parâmetros da consulta
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null;
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;
    
    // Validar parâmetros
    if (!year || !month) {
      logger.warn(`Missing required query parameters for monthly tax deduction`, {
        source: 'backend',
        context: 'api:finance:monthly_tax_deduction',
        tags: ['validation', 'error'],
        data: { 
          requestId,
          year,
          month
        }
      });
      
      return NextResponse.json({ 
        error: "Missing required query parameters",
        details: "Both 'year' and 'month' are required"
      }, { status: 400 });
    }
    
    // Buscar dedução
    const deduction = await db
      .select()
      .from(monthlyTaxDeductions)
      .where(
        and(
          eq(monthlyTaxDeductions.year, year),
          eq(monthlyTaxDeductions.month, month)
        )
      )
      .limit(1);
    
    logger.info(`Monthly tax deduction query successful`, {
      source: 'backend',
      context: 'api:finance:monthly_tax_deduction',
      tags: ['success', 'query', 'monthly_tax_deduction'],
      data: { 
        requestId,
        found: deduction.length > 0,
        year,
        month
      }
    });
    
    return NextResponse.json({ 
      success: true,
      data: deduction[0] || { year, month, value: 0 }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error fetching monthly tax deduction`, {
      source: 'backend',
      context: 'api:finance:monthly_tax_deduction',
      tags: ['error', 'query', 'monthly_tax_deduction'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[MONTHLY_TAX_DEDUCTION]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
