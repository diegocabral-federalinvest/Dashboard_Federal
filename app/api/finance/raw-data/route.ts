import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { financialDataCSV } from "@/db/schema";
import { and, asc, desc, gte, lte, like, sql, inArray } from "drizzle-orm";
import logger from "@/lib/logger";

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET Raw Financial Data`, {
    source: 'backend',
    context: 'api:finance:raw-data',
    tags: ['request', 'get', 'financial-data'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to raw financial data`, {
        source: 'backend',
        context: 'api:finance:raw-data',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parâmetros da consulta
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortBy = searchParams.get("sortBy") || "Data";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : null;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : null;
    const minValue = searchParams.get("minValue") ? parseFloat(searchParams.get("minValue")!) : null;
    const maxValue = searchParams.get("maxValue") ? parseFloat(searchParams.get("maxValue")!) : null;
    
    // Condições de filtro
    const conditions = [];
    
    if (search) {
      conditions.push(
        like(financialDataCSV.IdOperacao, `%${search}%`)
      );
    }
    
    if (startDate) {
      conditions.push(
        gte(financialDataCSV.Data, startDate)
      );
    }
    
    if (endDate) {
      conditions.push(
        lte(financialDataCSV.Data, endDate)
      );
    }
    
    if (minValue !== null) {
      conditions.push(
        gte(financialDataCSV.ValorLiquido, minValue.toString())
      );
    }
    
    if (maxValue !== null) {
      conditions.push(
        lte(financialDataCSV.ValorLiquido, maxValue.toString())
      );
    }
    
    // Calcular total de registros para paginação
    const countResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(financialDataCSV)
      .where(conditions.length ? and(...conditions) : undefined);
    
    const totalCount = Number(countResult[0].count);
    
    // Determine order direction and column name
    const orderDirection = sortOrder === "asc" ? asc : desc;
    const orderByColumn = sortBy as keyof typeof financialDataCSV;
    
    // Consulta para obter os dados paginados
    const data = await db
      .select()
      .from(financialDataCSV)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(financialDataCSV.Data)
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    
    const totalPages = Math.ceil(totalCount / pageSize);
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);
    
    logger.info(`Raw financial data retrieved successfully`, {
      source: 'backend',
      context: 'api:finance:raw-data',
      tags: ['success', 'query'],
      data: {
        requestId,
        totalItems: totalCount,
        page,
        pageSize,
        totalPages
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        data,
        total: totalCount,
        from,
        to,
        currentPage: page,
        totalPages
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error retrieving raw financial data`, {
      source: 'backend',
      context: 'api:finance:raw-data',
      tags: ['error', 'query'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[FINANCIAL_DATA]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 

export async function DELETE(req: Request) {
  const requestId = crypto.randomUUID();

  logger.info(`API Request: DELETE Raw Financial Data`, {
    source: 'backend',
    context: 'api:finance:raw-data',
    tags: ['request', 'delete', 'financial-data'],
    data: { requestId }
  });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to delete raw financial data`, {
        source: 'backend', context: 'api:finance:raw-data', tags: ['auth','unauthorized'], data: { requestId }
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyText = await req.text();
    let body: any = {};
    try { body = bodyText ? JSON.parse(bodyText) : {}; } catch {}

    const ids: string[] | undefined = Array.isArray(body?.ids) ? body.ids : undefined;
    const deleteAll: boolean = Boolean(body?.all);

    let deletedCount = 0;

    if (deleteAll) {
      const result = await db.delete(financialDataCSV).returning({ id: financialDataCSV.id });
      deletedCount = result.length;
      logger.info(`Deleted all raw financial rows`, { source: 'backend', context: 'api:finance:raw-data', tags: ['delete','all'], data: { requestId, deletedCount } });
    } else if (ids && ids.length > 0) {
      const result = await db
        .delete(financialDataCSV)
        .where(inArray(financialDataCSV.id, ids))
        .returning({ id: financialDataCSV.id });
      deletedCount = result.length;
      logger.info(`Deleted selected raw financial rows`, { source: 'backend', context: 'api:finance:raw-data', tags: ['delete','selected'], data: { requestId, deletedCount } });
    } else {
      return NextResponse.json({ error: 'No ids provided and all=false' }, { status: 400 });
    }

    return NextResponse.json({ success: true, deleted: deletedCount });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error deleting raw financial data`, { source: 'backend', context: 'api:finance:raw-data', tags: ['error','delete'], data: { requestId, error: errorMessage } });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}