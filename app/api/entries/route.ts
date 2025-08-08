import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import { db } from "@/db/drizzle";
import { entries } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { desc, lte, gte, and, sql } from "drizzle-orm";
import logger from "@/lib/logger";

// Schema para validação de dados
const createEntrySchema = z.object({
  description: z.string().min(1),
  value: z.coerce.number().positive(),
  date: z.string().transform(val => new Date(val)),
  categoryId: z.string().optional(),
});

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET entries`, {
    source: 'backend',
    context: 'api:entries',
    tags: ['request', 'get', 'entries'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to entries API`, {
        source: 'backend',
        context: 'api:entries',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parâmetros de query para possível filtragem
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    
    logger.debug(`Entries query parameters`, {
      source: 'backend',
      context: 'api:entries',
      tags: ['query', 'filter'],
      data: {
        requestId,
        month,
        year
      }
    });
    
    // Inicializar com uma consulta básica
    let entriesList;
    
    // Aplicar filtros se fornecidos
    if (month && year) {
      // Converter para números e criar datas de início e fim do mês
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);
      
      logger.debug(`Querying entries with date filter`, {
        source: 'backend',
        context: 'api:entries',
        tags: ['query', 'filter', 'date'],
        data: {
          requestId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      // Execute a consulta com filtro de data
      entriesList = await db
        .select()
        .from(entries)
        .where(
          and(
            gte(entries.date, startDate),
            lte(entries.date, endDate)
          )
        )
        .orderBy(desc(entries.date));
    } else {
      // Execute a consulta sem filtros
      logger.debug(`Quering all entries`, {
        source: 'backend',
        context: 'api:entries',
        tags: ['query', 'all'],
        data: { requestId }
      });
      
      entriesList = await db
        .select()
        .from(entries)
        .orderBy(desc(entries.date));
    }
    
    logger.info(`Entries retrieved successfully`, {
      source: 'backend',
      context: 'api:entries',
      tags: ['response', 'success'],
      data: {
        requestId,
        count: entriesList.length,
      }
    });
    
    return NextResponse.json(entriesList);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error retrieving entries`, {
      source: 'backend',
      context: 'api:entries',
      tags: ['error', 'query'],
      data: {
        requestId,
        error: errorMessage,
        stack,
      }
    });
    
    console.error("[ENTRIES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: POST entries`, {
    source: 'backend',
    context: 'api:entries',
    tags: ['request', 'post', 'entries'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to create entry`, {
        source: 'backend',
        context: 'api:entries',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    
    logger.debug(`Entry creation request data`, {
      source: 'backend',
      context: 'api:entries',
      tags: ['create', 'validation'],
      data: {
        requestId,
        body
      }
    });
    
    // Validar os dados de entrada
    const validatedData = createEntrySchema.parse(body);
    
    // Criar objeto com os dados validados
    const entryData = {
      id: createId(),
      description: validatedData.description,
      date: validatedData.date,
      value: String(validatedData.value), // Convert to string for the database
      categoryId: validatedData.categoryId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    logger.debug(`Validated entry data`, {
      source: 'backend',
      context: 'api:entries',
      tags: ['create', 'validated'],
      data: {
        requestId,
        entryData: { ...entryData, id: `${entryData.id.substring(0, 8)}...` } // Truncated ID for logs
      }
    });
    
    // Inserir no banco de dados
    const [newEntry] = await db
      .insert(entries)
      .values(entryData)
      .returning();
    
    logger.info(`Entry created successfully`, {
      source: 'backend',
      context: 'api:entries',
      tags: ['create', 'success'],
      data: {
        requestId,
        entryId: newEntry.id,
        description: newEntry.description,
        value: newEntry.value
      }
    });
      
    return NextResponse.json(newEntry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`Validation error in entry creation`, {
        source: 'backend',
        context: 'api:entries',
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
    
    logger.error(`Error creating entry`, {
      source: 'backend',
      context: 'api:entries',
      tags: ['error', 'create'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[ENTRIES_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 