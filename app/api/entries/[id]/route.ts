import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { entries } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import ApiLogger from "@/lib/api-logger";

// Schema para validação de atualização
const updateEntrySchema = z.object({
  description: z.string().min(1).optional(),
  value: z.coerce.number().positive().optional(),
  date: z.string().transform(val => new Date(val)).optional(),
});

// GET para obter uma despesa específica
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('entries:id');
  logger.logRequest('GET', req.url, { 
    tags: ['detail'],
    data: { entryId: params.id }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.logUnauthorized();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    logger.logQuery('single-entry', { 
      data: { entryId: params.id }
    });
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    // Buscar a entrada pelo ID, garantindo que pertence ao usuário atual
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, id))
      .limit(1);
    
    if (!entry) {
      logger.logDebug(`Entry not found: ${id}`);
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    
    logger.logSuccess(`Entry retrieved successfully`, {
      data: { entryId: id }
    });
    
    return NextResponse.json(entry);
  } catch (error) {
    logger.logError(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH para atualizar uma entrada específica
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const logger = new ApiLogger('entries:id');
  logger.logRequest('PATCH', req.url, { 
    tags: ['update'],
    data: { entryId: params.id }
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
    
    // Verificar se a entrada existe e pertence ao usuário
    const [existingEntry] = await db
      .select({ id: entries.id })
      .from(entries)
      .where(eq(entries.id, id))
      .limit(1);
    
    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    
    const body = await req.json();
    
    logger.logDebug(`Update entry request data`, {
      data: { 
        entryId: id,
        updateData: body
      }
    });
    
    try {
      // Validar dados da atualização
      const validatedData = updateEntrySchema.parse(body);
      
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
      
      
      logger.logQuery('update-entry', { 
        data: { 
          entryId: id,
          fieldsToUpdate: Object.keys(updateData) 
        }
      });
      
      // Atualizar no banco de dados
      const [updatedEntry] = await db
        .update(entries)
        .set(updateData)
        .where(eq(entries.id, id))
        .returning();
      
      if (!updatedEntry) {
        logger.logDebug(`Entry not found for update: ${id}`);
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
      
      logger.logSuccess(`Entry updated successfully`, {
        data: { 
          entryId: id,
          updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt')
        }
      });
      
      return NextResponse.json(updatedEntry);
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
  const logger = new ApiLogger('entries:id');
  logger.logRequest('DELETE', req.url, { 
    tags: ['delete'],
    data: { entryId: params.id }
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
    
    // Verificar se a entrada existe e pertence ao usuário
    const [existingEntry] = await db
      .select({ id: entries.id })
      .from(entries)
      .where(eq(entries.id, id))
      .limit(1);
    
    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    
    // Excluir do banco de dados
    await db
      .delete(entries)
      .where(eq(entries.id, id));
    
    logger.logSuccess(`Entry deleted successfully`, {
      data: { 
        entryId: id,
        deletedEntry: existingEntry
      }
    });
    
    return NextResponse.json({ message: "Entry deleted" });
  } catch (error) {
    logger.logError(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 