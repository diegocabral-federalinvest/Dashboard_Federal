import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { quarterlyFinancialResults } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import logger from "@/lib/logger";
import { createId } from "@paralleldrive/cuid2";

// Schema for validating request body
const quarterlyFinancialResultSchema = z.object({
  quarter: z.number().int().min(1).max(4),
  year: z.number().int().positive(),
  totalOperation: z.number().optional(),
  totalOtherIncome: z.number().optional(),
  totalIncome: z.number().optional(),
  totalFator: z.number().optional(),
  totalAdValorem: z.number().optional(),
  totalIOF: z.number().optional(),
  totalCosts: z.number().optional(),
  totalPis: z.number().optional(),
  totalCofins: z.number().optional(),
  totalIssqn: z.number().optional(),
  totalIRPJ: z.number().optional(),
  totalCSLL: z.number().optional(),
  totalTaxableExpenses: z.number().optional(),
  totalNonTaxableExpenses: z.number().optional(),
  totalExpenses: z.number().optional(),
  taxDeduction: z.number().optional(),
  grossRevenue: z.number().optional(),
  netRevenue: z.number().optional(),
  grossResult: z.number().optional(),
  netResult: z.number().optional(),
});

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: POST Quarterly Financial Result`, {
    source: 'backend',
    context: 'api:finance:quarterly-result',
    tags: ['request', 'post', 'quarterly-result'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to quarterly result endpoint`, {
        source: 'backend',
        context: 'api:finance:quarterly-result',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get and validate request body
    const body = await req.json();
    
    const validationResult = quarterlyFinancialResultSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn(`Invalid request body for quarterly result`, {
        source: 'backend',
        context: 'api:finance:quarterly-result',
        tags: ['validation', 'error'],
        data: { 
          requestId,
          errors: validationResult.error.errors
        }
      });
      
      return NextResponse.json({ 
        error: "Invalid request body", 
        details: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const {
      quarter,
      year,
      totalOperation,
      totalOtherIncome,
      totalIncome,
      totalFator,
      totalAdValorem,
      totalIOF,
      totalCosts,
      totalPis,
      totalCofins,
      totalIssqn,
      totalIRPJ,
      totalCSLL,
      totalTaxableExpenses,
      totalNonTaxableExpenses,
      totalExpenses,
      taxDeduction,
      grossRevenue,
      netRevenue,
      grossResult,
      netResult,
    } = validationResult.data;
    
    // Check if a record already exists for this quarter/year
    const existingResult = await db
      .select()
      .from(quarterlyFinancialResults)
      .where(
        and(
          eq(quarterlyFinancialResults.quarter, quarter),
          eq(quarterlyFinancialResults.year, year)
        )
      )
      .limit(1);
    
    let result;
    
    if (existingResult.length > 0) {
      // Update existing record
      logger.info(`Updating existing quarterly result for ${year} Q${quarter}`, {
        source: 'backend',
        context: 'api:finance:quarterly-result',
        tags: ['update', 'quarterly-result'],
        data: { 
          requestId,
          resultId: existingResult[0].id
        }
      });
      
      const updateData: any = { updatedAt: new Date() };
      
      // Only include fields that were provided
      if (totalOperation !== undefined) updateData.totalOperation = totalOperation;
      if (totalOtherIncome !== undefined) updateData.totalOtherIncome = totalOtherIncome;
      if (totalIncome !== undefined) updateData.totalIncome = totalIncome;
      if (totalFator !== undefined) updateData.totalFator = totalFator;
      if (totalAdValorem !== undefined) updateData.totalAdValorem = totalAdValorem;
      if (totalIOF !== undefined) updateData.totalIOF = totalIOF;
      if (totalCosts !== undefined) updateData.totalCosts = totalCosts;
      if (totalPis !== undefined) updateData.totalPis = totalPis;
      if (totalCofins !== undefined) updateData.totalCofins = totalCofins;
      if (totalIssqn !== undefined) updateData.totalIssqn = totalIssqn;
      if (totalIRPJ !== undefined) updateData.totalIRPJ = totalIRPJ;
      if (totalCSLL !== undefined) updateData.totalCSLL = totalCSLL;
      if (totalTaxableExpenses !== undefined) updateData.totalTaxableExpenses = totalTaxableExpenses;
      if (totalNonTaxableExpenses !== undefined) updateData.totalNonTaxableExpenses = totalNonTaxableExpenses;
      if (totalExpenses !== undefined) updateData.totalExpenses = totalExpenses;
      if (taxDeduction !== undefined) updateData.taxDeduction = taxDeduction;
      if (grossRevenue !== undefined) updateData.grossRevenue = grossRevenue;
      if (netRevenue !== undefined) updateData.netRevenue = netRevenue;
      if (grossResult !== undefined) updateData.grossResult = grossResult;
      if (netResult !== undefined) updateData.netResult = netResult;
      
      result = await db
        .update(quarterlyFinancialResults)
        .set(updateData)
        .where(
          and(
            eq(quarterlyFinancialResults.quarter, quarter),
            eq(quarterlyFinancialResults.year, year)
          )
        )
        .returning();
    } else {
      // Create new record
      logger.info(`Creating new quarterly result for ${year} Q${quarter}`, {
        source: 'backend',
        context: 'api:finance:quarterly-result',
        tags: ['create', 'quarterly-result'],
        data: { 
          requestId,
          year,
          quarter
        }
      });
      
      const insertData = {
        id: createId(),
        quarter,
        year,
        totalOperation: totalOperation?.toString() || "0",
        totalOtherIncome: totalOtherIncome?.toString() || "0",
        totalIncome: totalIncome?.toString() || "0",
        totalFator: totalFator?.toString() || "0",
        totalAdValorem: totalAdValorem?.toString() || "0",
        totalIOF: totalIOF?.toString() || "0",
        totalCosts: totalCosts?.toString() || "0",
        totalPis: totalPis?.toString() || "0",
        totalCofins: totalCofins?.toString() || "0",
        totalIssqn: totalIssqn?.toString() || "0",
        totalIRPJ: totalIRPJ?.toString() || "0",
        totalCSLL: totalCSLL?.toString() || "0",
        totalTaxableExpenses: totalTaxableExpenses?.toString() || "0",
        totalNonTaxableExpenses: totalNonTaxableExpenses?.toString() || "0",
        totalExpenses: totalExpenses?.toString() || "0",
        taxDeduction: taxDeduction?.toString() || "0",
        grossRevenue: grossRevenue?.toString() || "0",
        netRevenue: netRevenue?.toString() || "0",
        grossResult: grossResult?.toString() || "0",
        netResult: netResult?.toString() || "0",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      result = await db
        .insert(quarterlyFinancialResults)
        .values(insertData)
        .returning();
    }
    
    logger.info(`Quarterly result saved successfully`, {
      source: 'backend',
      context: 'api:finance:quarterly-result',
      tags: ['success', 'quarterly-result'],
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
    
    logger.error(`Error saving quarterly result`, {
      source: 'backend',
      context: 'api:finance:quarterly-result',
      tags: ['error', 'quarterly-result'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[QUARTERLY_RESULT]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET Quarterly Financial Result`, {
    source: 'backend',
    context: 'api:finance:quarterly-result',
    tags: ['request', 'get', 'quarterly-result'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to quarterly result endpoint`, {
        source: 'backend',
        context: 'api:finance:quarterly-result',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null;
    const quarter = searchParams.get("quarter") ? parseInt(searchParams.get("quarter")!) : null;
    
    // Validate parameters
    if (!year || !quarter) {
      logger.warn(`Missing required query parameters for quarterly result`, {
        source: 'backend',
        context: 'api:finance:quarterly-result',
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
    
    // Fetch record
    const result = await db
      .select()
      .from(quarterlyFinancialResults)
      .where(
        and(
          eq(quarterlyFinancialResults.year, year),
          eq(quarterlyFinancialResults.quarter, quarter)
        )
      )
      .limit(1);
    
    logger.info(`Quarterly result query successful`, {
      source: 'backend',
      context: 'api:finance:quarterly-result',
      tags: ['success', 'query', 'quarterly-result'],
      data: { 
        requestId,
        found: result.length > 0,
        year,
        quarter
      }
    });
    
    // Return data or default empty object if not found
    return NextResponse.json({ 
      success: true,
      data: result[0] || {
        year,
        quarter,
        totalOperation: 0,
        totalOtherIncome: 0,
        totalIncome: 0,
        totalFator: 0,
        totalAdValorem: 0,
        totalIOF: 0,
        totalCosts: 0,
        totalPis: 0,
        totalCofins: 0,
        totalIssqn: 0,
        totalIRPJ: 0,
        totalCSLL: 0,
        totalTaxableExpenses: 0,
        totalNonTaxableExpenses: 0,
        totalExpenses: 0,
        taxDeduction: 0,
        grossRevenue: 0,
        netRevenue: 0,
        grossResult: 0,
        netResult: 0
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error fetching quarterly result`, {
      source: 'backend',
      context: 'api:finance:quarterly-result',
      tags: ['error', 'quarterly-result'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[QUARTERLY_RESULT]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 