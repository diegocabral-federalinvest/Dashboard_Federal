import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { taxDeductions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import logger from "@/lib/logger";

// Schema para validação do corpo da requisição
const taxDeductionSchema = z.object({
  year: z.number().int().positive(),
  quarter: z.number().int().min(1).max(4),
  value: z.number().nonnegative(),
});

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: POST Tax Deduction`, {
    source: 'backend',
    context: 'api:finance:tax_deduction',
    tags: ['request', 'post', 'tax_deduction'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to tax deduction endpoint`, {
        source: 'backend',
        context: 'api:finance:tax_deduction',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Obtain and validate request body with detailed logging
    const rawBody = await req.text();
    
    logger.debug(`Raw request body for tax deduction`, {
      source: 'backend',
      context: 'api:finance:tax_deduction',
      tags: ['debug', 'request', 'tax_deduction'],
      data: { 
        requestId,
        rawBody
      }
    });
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      logger.error(`Failed to parse JSON body for tax deduction`, {
        source: 'backend',
        context: 'api:finance:tax_deduction',
        tags: ['error', 'parsing', 'tax_deduction'],
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
    
    // Validate using schema
    const validationResult = taxDeductionSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn(`Invalid request body for tax deduction`, {
        source: 'backend',
        context: 'api:finance:tax_deduction',
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
    
    const { year, quarter, value } = validationResult.data;
    
    // Log validated data
    logger.debug(`Validated tax deduction data`, {
      source: 'backend',
      context: 'api:finance:tax_deduction',
      tags: ['debug', 'validation', 'tax_deduction'],
      data: { 
        requestId,
        year,
        quarter,
        value
      }
    });
    
    // Verificar se já existe uma dedução para este ano/trimestre
    const existingDeduction = await db
      .select()
      .from(taxDeductions)
      .where(
        and(
          eq(taxDeductions.year, year),
          eq(taxDeductions.quarter, quarter)
        )
      )
      .limit(1);
    
    let result;
    
    if (existingDeduction.length > 0) {
      // Atualizar dedução existente
      logger.info(`Updating existing tax deduction for ${year} Q${quarter}`, {
        source: 'backend',
        context: 'api:finance:tax_deduction',
        tags: ['update', 'tax_deduction'],
        data: { 
          requestId,
          deductionId: existingDeduction[0].id,
          oldValue: existingDeduction[0].value,
          newValue: value
        }
      });
      
      result = await db
        .update(taxDeductions)
        .set({ 
          value: value.toString(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(taxDeductions.year, year),
            eq(taxDeductions.quarter, quarter)
          )
        )
        .returning();
    } else {
      // Criar nova dedução
      logger.info(`Creating new tax deduction for ${year} Q${quarter}`, {
        source: 'backend',
        context: 'api:finance:tax_deduction',
        tags: ['create', 'tax_deduction'],
        data: { 
          requestId,
          year,
          quarter,
          value
        }
      });
      
      result = await db
        .insert(taxDeductions)
        .values({
          year,
          quarter,
          value: value.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }
    
    logger.info(`Tax deduction saved successfully`, {
      source: 'backend',
      context: 'api:finance:tax_deduction',
      tags: ['success', 'tax_deduction'],
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
    
    logger.error(`Error saving tax deduction`, {
      source: 'backend',
      context: 'api:finance:tax_deduction',
      tags: ['error', 'tax_deduction'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[TAX_DEDUCTION]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET Tax Deduction`, {
    source: 'backend',
    context: 'api:finance:tax_deduction',
    tags: ['request', 'get', 'tax_deduction'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to tax deduction endpoint`, {
        source: 'backend',
        context: 'api:finance:tax_deduction',
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
      logger.warn(`Missing required query parameters for tax deduction`, {
        source: 'backend',
        context: 'api:finance:tax_deduction',
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
    
    // Buscar dedução
    const deduction = await db
      .select()
      .from(taxDeductions)
      .where(
        and(
          eq(taxDeductions.year, year),
          eq(taxDeductions.quarter, quarter)
        )
      )
      .limit(1);
    
    logger.info(`Tax deduction query successful`, {
      source: 'backend',
      context: 'api:finance:tax_deduction',
      tags: ['success', 'query', 'tax_deduction'],
      data: { 
        requestId,
        found: deduction.length > 0,
        year,
        quarter
      }
    });
    
    return NextResponse.json({ 
      success: true,
      data: deduction[0] || { year, quarter, value: 0 }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error fetching tax deduction`, {
      source: 'backend',
      context: 'api:finance:tax_deduction',
      tags: ['error', 'query', 'tax_deduction'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[TAX_DEDUCTION]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 