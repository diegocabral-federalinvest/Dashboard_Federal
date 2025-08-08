import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { expenses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import ApiLogger from "@/lib/api-logger";

// Schema para validação de atualização
const updateExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  value: z.coerce.number().positive().optional(),
  date: z.string().transform(val => new Date(val)).optional(),
  isTaxable: z.boolean().optional(),
});

// GET para obter uma despesa específica
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('expenses:id');
  logger.logRequest('GET', req.url, { 
    tags: ['detail'],
    data: { expenseId: params.id }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.logUnauthorized();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    logger.logQuery('single-expense', { 
      data: { expenseId: params.id }
    });
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    // Buscar a despesa pelo ID, garantindo que pertence ao usuário atual
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    
    if (!expense) {
      logger.logDebug(`Expense not found: ${id}`);
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    
    logger.logSuccess(`Expense retrieved successfully`, {
      data: { expenseId: id }
    });
    
    return NextResponse.json(expense);
  } catch (error) {
    logger.logError(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH para atualizar uma despesa específica
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('expenses:id');
  logger.logRequest('PATCH', req.url, { 
    tags: ['update'],
    data: { expenseId: params.id }
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
    
    // Verificar se a despesa existe e pertence ao usuário
    const [existingExpense] = await db
      .select({ id: expenses.id })
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    
    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    
    const body = await req.json();
    
    logger.logDebug(`Update expense request data`, {
      data: { 
        expenseId: id,
        updateData: body
      }
    });
    
    try {
      // Validar dados da atualização
      const validatedData = updateExpenseSchema.parse(body);
      
      // Preparar objeto com dados a serem atualizados
      const updateData: Record<string, unknown> = {
        updatedAt: new Date()
      };
      
      // Add validated fields individually with proper type handling
      if (validatedData.description !== undefined) {
        updateData.description = validatedData.description;
      }
      
      if (validatedData.date !== undefined) {
        updateData.date = validatedData.date;
      }
      
      if (validatedData.value !== undefined) {
        updateData.value = String(validatedData.value); // Convert to string for db
      }
      
      if (validatedData.isTaxable !== undefined) {
        updateData.isTaxable = validatedData.isTaxable;
      }
      
      logger.logQuery('update-expense', { 
        data: { 
          expenseId: id,
          fieldsToUpdate: Object.keys(updateData) 
        }
      });
      
      // Atualizar no banco de dados
      const [updatedExpense] = await db
        .update(expenses)
        .set(updateData)
        .where(eq(expenses.id, id))
        .returning();
      
      if (!updatedExpense) {
        logger.logDebug(`Expense not found for update: ${id}`);
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      }
      
      logger.logSuccess(`Expense updated successfully`, {
        data: { 
          expenseId: id,
          updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt')
        }
      });
      
      return NextResponse.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.logValidationError(error.errors);
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    logger.logError(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE para remover uma despesa específica
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('expenses:id');
  logger.logRequest('DELETE', req.url, { 
    tags: ['delete'],
    data: { expenseId: params.id }
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
    
    // Verificar se a despesa existe e pertence ao usuário
    const [existingExpense] = await db
      .select({ id: expenses.id })
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    
    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    
    // Excluir do banco de dados
    await db
      .delete(expenses)
      .where(eq(expenses.id, id));
    
    logger.logSuccess(`Expense deleted successfully`, {
      data: { 
        expenseId: id,
        deletedExpense: existingExpense
      }
    });
    
    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    logger.logError(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 