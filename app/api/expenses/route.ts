import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { expenses } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { desc, lte, gte, and, sql, eq } from "drizzle-orm";
import logger from "@/lib/logger";

// Schema para validação de dados
const createExpenseSchema = z.object({
  description: z.string().min(1),
  value: z.coerce.number().positive(),
  date: z.string().transform(val => new Date(val)),
  isTaxable: z.boolean().default(false),
  isPayroll: z.boolean().default(false),
  categoryId: z.string().optional(),
});

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET expenses`, {
    source: 'backend',
    context: 'api:expenses',
    tags: ['request', 'get', 'expenses'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to expenses API`, {
        source: 'backend',
        context: 'api:expenses',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parâmetros de query para possível filtragem
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    
    logger.debug(`Expenses query parameters`, {
      source: 'backend',
      context: 'api:expenses',
      tags: ['query', 'filter'],
      data: {
        requestId,
        month,
        year,
        userId: session.user.id
      }
    });
    
    // Inicializar com uma consulta básica
    let expensesList;
    
    // Aplicar filtros se fornecidos
    if (month && year) {
      // Converter para números e criar datas de início e fim do mês
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);
      
      logger.debug(`Querying expenses with date filter`, {
        source: 'backend',
        context: 'api:expenses',
        tags: ['query', 'filter', 'date'],
        data: {
          requestId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      // Execute a consulta com filtro de data
      expensesList = await db
        .select()
        .from(expenses)
        .where(
          and(
            gte(expenses.date, startDate),
            lte(expenses.date, endDate)
          )
        )
        .orderBy(desc(expenses.date));
    } else {
      // Execute a consulta sem filtros
      logger.debug(`Querying all expenses`, {
        source: 'backend',
        context: 'api:expenses',
        tags: ['query', 'all'],
        data: { requestId }
      });
      
      expensesList = await db
        .select()
        .from(expenses)
        .orderBy(desc(expenses.date));
    }
    
    logger.info(`Expenses retrieved successfully`, {
      source: 'backend',
      context: 'api:expenses',
      tags: ['response', 'success'],
      data: {
        requestId,
        count: expensesList.length,
      }
          });
      
      return NextResponse.json(expensesList);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error retrieving expenses`, {
      source: 'backend',
      context: 'api:expenses',
      tags: ['error', 'query'],
      data: {
        requestId,
        error: errorMessage,
        stack,
      }
    });
    
    console.error("[EXPENSES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: POST expenses`, {
    source: 'backend',
    context: 'api:expenses',
    tags: ['request', 'post', 'expenses'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to create expense`, {
        source: 'backend',
        context: 'api:expenses',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validar os dados de entrada
    const validatedData = createExpenseSchema.parse(body);
    
    // Criar objeto com os dados validados
    const expenseData = {
      id: createId(),
      description: validatedData.description,
      date: validatedData.date,
      value: String(validatedData.value), // Convert to string for the database
      isTaxable: validatedData.isTaxable,
      isPayroll: validatedData.isPayroll,
      categoryId: validatedData.categoryId || "outros", // SEMPRE garante categoria
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Inserir no banco de dados
    const [newExpense] = await db
      .insert(expenses)
      .values(expenseData)
      .returning();
    
    logger.info(`Expense created successfully`, {
      source: 'backend',
      context: 'api:expenses',
      tags: ['create', 'success'],
      data: {
        requestId,
        expenseId: newExpense.id,
        description: newExpense.description,
        value: newExpense.value
      }
    });
      
    return NextResponse.json(newExpense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`Validation error in expense creation`, {
        source: 'backend',
        context: 'api:expenses',
        tags: ['error', 'validation'],
        data: {
          requestId,
          validationErrors: error.errors
        }
      });
      
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error creating expense`, {
      source: 'backend',
      context: 'api:expenses',
      tags: ['error', 'create'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[EXPENSES_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}