import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { contributionsOrWithdrawals, investors, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ApiLogger } from "@/lib/api-logger";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Schema mais flexível para permitir atualizações parciais
const updateInvestmentSchema = z.object({
  value: z.union([
    z.number().positive("O valor deve ser positivo"),
    z.string().transform(val => parseFloat(val))
  ]).optional(),
  date: z.union([
    z.string().datetime(),
    z.string().transform(val => {
      // Aceita diferentes formatos de data
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error("Data inválida");
      }
      return date.toISOString();
    })
  ]).optional(),
  type: z.enum(["aporte", "retirada"]).optional(),
  // Flexibilizar validação do investorId - aceitar qualquer string não vazia
  investorId: z.string().min(1, "ID do investidor inválido").optional(),
  investorName: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  returnRate: z.number().optional(),
  status: z.enum(["active", "completed", "withdrawn"]).optional()
}).refine(data => {
  // Pelo menos um campo deve ser fornecido para atualização
  return Object.keys(data).length > 0;
}, {
  message: "Pelo menos um campo deve ser fornecido para atualização"
});

// GET para obter um investimento específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('investments:id');
  logger.logRequest('GET', req.url, { 
    tags: ['get'],
    data: { investmentId: params.id }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.logUnauthorized();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    const record = await db
      .select({
        id: contributionsOrWithdrawals.id,
        value: contributionsOrWithdrawals.amount,
        investorId: contributionsOrWithdrawals.investorId,
        date: contributionsOrWithdrawals.date,
        createdAt: contributionsOrWithdrawals.createdAt,
        updatedAt: contributionsOrWithdrawals.updatedAt,
        investorName: investors.name,
      })
      .from(contributionsOrWithdrawals)
      .leftJoin(investors, eq(contributionsOrWithdrawals.investorId, investors.id))
      .where(eq(contributionsOrWithdrawals.id, params.id))
      .limit(1);
    
    if (!record.length) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    const r = record[0];
    const investment = {
      id: r.id,
      value: Math.abs(Number(r.value)),
      type: Number(r.value) >= 0 ? "aporte" : "retirada",
      investorId: r.investorId,
      investorName: r.investorName ?? "",
      description: Number(r.value) >= 0 ? "Aporte" : "Retirada",
      date: r.date.toISOString(),
      startDate: r.date.toISOString(),
      returnRate: 0.0004,
      status: Number(r.value) >= 0 ? "active" : "withdrawn",
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
    
    logger.logSuccess(`Investment retrieved successfully`, {
      data: { investment }
    });
    
    return NextResponse.json(investment);
  } catch (error) {
    logger.logError(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH para atualizar um investimento
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('investments:id');
  logger.logRequest('PATCH', req.url, { 
    tags: ['update'],
    data: { investmentId: params.id }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      logger.logUnauthorized();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verificar se é admin ou editor
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length || !["ADMIN", "EDITOR"].includes(user[0].role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    // Verificar se o investimento existe
    const [existingInvestment] = await db
      .select({ id: contributionsOrWithdrawals.id })
      .from(contributionsOrWithdrawals)
      .where(eq(contributionsOrWithdrawals.id, params.id))
      .limit(1);
    
    if (!existingInvestment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Log detalhado do body recebido
    logger.logDebug('Request body received', {
      data: { 
        body,
        bodyKeys: Object.keys(body),
        investmentId: params.id
      },
      tags: ['debug', 'request-body']
    });
    
    // Validar e processar dados
    let validatedData;
    try {
      logger.logDebug('Starting validation', {
        data: { 
          bodyData: body,
          schemaKeys: ['value', 'date', 'type', 'investorId', 'investorName', 'description', 'startDate', 'returnRate', 'status']
        },
        tags: ['validation', 'start']
      });
      
      validatedData = updateInvestmentSchema.parse(body);
      
      logger.logDebug('Data validated successfully', {
        data: { 
          validatedData,
          validatedKeys: Object.keys(validatedData)
        },
        tags: ['validation', 'success']
      });
    } catch (validationError) {
      logger.logError('Validation error details', {
        data: { 
          error: validationError,
          body,
          errorMessage: validationError instanceof z.ZodError ? validationError.errors : String(validationError)
        },
        tags: ['validation', 'error']
      });
      
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validationError instanceof z.ZodError 
            ? validationError.errors 
            : String(validationError),
          receivedData: body
        },
        { status: 400 }
      );
    }
    
    // Buscar o investimento atual para pegar valores não fornecidos
    const [currentInvestment] = await db
      .select()
      .from(contributionsOrWithdrawals)
      .where(eq(contributionsOrWithdrawals.id, params.id))
      .limit(1);
    
    // Preparar dados para atualização (usar valores existentes se não fornecidos)
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Verificar se o investidor mudou
    if (validatedData.investorId && validatedData.investorId !== currentInvestment.investorId) {
      logger.logDebug('Investor ID change detected', {
        data: { 
          newInvestorId: validatedData.investorId,
          currentInvestorId: currentInvestment.investorId
        },
        tags: ['investor', 'change']
      });
      
      const investor = await db
        .select({ id: investors.id })
        .from(investors)
        .where(eq(investors.id, validatedData.investorId))
        .limit(1);

      logger.logDebug('Investor lookup result', {
        data: { 
          searchedId: validatedData.investorId,
          foundInvestors: investor,
          investorCount: investor.length
        },
        tags: ['investor', 'lookup']
      });

      if (!investor.length) {
        logger.logError('Investor not found', {
          data: { 
            investorId: validatedData.investorId,
            message: "Investidor não encontrado"
          },
          tags: ['investor', 'not-found']
        });
        
        return NextResponse.json(
          {
            error: "Investidor não encontrado",
            details: `ID: ${validatedData.investorId}`,
          },
          { status: 400 }
        );
      }
      updateData.investorId = validatedData.investorId;
      
      logger.logDebug('Investor update prepared', {
        data: { investorId: validatedData.investorId },
        tags: ['investor', 'update-prepared']
      });
    }
    
    // Atualizar valor se fornecido
    if (validatedData.value !== undefined) {
      // Determinar tipo baseado no valor atual ou no tipo fornecido
      const type = validatedData.type || (Number(currentInvestment.amount) >= 0 ? "aporte" : "retirada");
      const finalAmount = type === "aporte" 
        ? Math.abs(validatedData.value)
        : -Math.abs(validatedData.value);
      updateData.amount = finalAmount.toString();
      
      logger.logDebug('Value update prepared', {
        data: { 
          originalValue: validatedData.value,
          detectedType: type,
          finalAmount,
          currentAmount: currentInvestment.amount
        },
        tags: ['value', 'update-prepared']
      });
    }
    
    // Atualizar data se fornecida
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
      
      logger.logDebug('Date update prepared', {
        data: { 
          originalDate: validatedData.date,
          parsedDate: updateData.date,
          currentDate: currentInvestment.date
        },
        tags: ['date', 'update-prepared']
      });
    }
    
    logger.logDebug('Update data prepared', {
      data: { updateData },
      tags: ['update', 'prepared']
    });
    
    // Atualizar no banco de dados
    logger.logDebug('Performing database update', {
      data: { 
        investmentId: params.id,
        updateData,
        updateDataKeys: Object.keys(updateData)
      },
      tags: ['database', 'update-start']
    });
    
    const [updatedInvestment] = await db
      .update(contributionsOrWithdrawals)
      .set(updateData)
      .where(eq(contributionsOrWithdrawals.id, params.id))
      .returning();
    
    logger.logDebug('Database update completed', {
      data: { 
        investmentId: params.id,
        updatedInvestment,
        wasUpdated: !!updatedInvestment
      },
      tags: ['database', 'update-completed']
    });
    
    const responseData = {
      id: updatedInvestment.id,
      value: Math.abs(Number(updatedInvestment.amount)),
      type: Number(updatedInvestment.amount) >= 0 ? "aporte" : "retirada",
      investorId: updatedInvestment.investorId,
      date: updatedInvestment.date.toISOString(),
      status: Number(updatedInvestment.amount) >= 0 ? "active" : "withdrawn",
      createdAt: updatedInvestment.createdAt.toISOString(),
      updatedAt: updatedInvestment.updatedAt.toISOString(),
    };
    
    logger.logSuccess(`Investment updated successfully`, {
      data: { 
        investmentId: params.id,
        responseData
      }
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    logger.logError('Unexpected error in PATCH handler', {
      data: { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        investmentId: params.id
      },
      tags: ['error', 'unexpected', 'patch']
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE para remover um investimento
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('investments:id');
  logger.logRequest('DELETE', req.url, { 
    tags: ['delete'],
    data: { investmentId: params.id }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      logger.logUnauthorized();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verificar se é admin ou editor
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length || !["ADMIN", "EDITOR"].includes(user[0].role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    // Verificar se o investimento existe
    const [existingInvestment] = await db
      .select({ 
        id: contributionsOrWithdrawals.id,
        amount: contributionsOrWithdrawals.amount,
        investorId: contributionsOrWithdrawals.investorId,
        date: contributionsOrWithdrawals.date
      })
      .from(contributionsOrWithdrawals)
      .where(eq(contributionsOrWithdrawals.id, params.id))
      .limit(1);
    
    if (!existingInvestment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    // Excluir do banco de dados
    await db
      .delete(contributionsOrWithdrawals)
      .where(eq(contributionsOrWithdrawals.id, params.id));
    
    logger.logSuccess(`Investment deleted successfully`, {
      data: { 
        investmentId: params.id,
        deletedInvestment: existingInvestment
      }
    });
    
    return NextResponse.json({ 
      message: "Investment deleted successfully",
      deleted: {
        id: existingInvestment.id,
        value: Math.abs(Number(existingInvestment.amount)),
        type: Number(existingInvestment.amount) >= 0 ? "aporte" : "retirada",
        investorId: existingInvestment.investorId,
        date: existingInvestment.date.toISOString()
      }
    });
  } catch (error) {
    logger.logError(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}