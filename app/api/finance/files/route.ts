import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { fileUploads } from "@/db/schema";
import { desc } from "drizzle-orm";
import logger from "@/lib/logger";
import { ensureFileUploadsTable } from "./migrate-schema";

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: GET File Uploads`, {
    source: 'backend',
    context: 'api:finance:files',
    tags: ['request', 'get', 'files'],
    data: {
      requestId,
      url: req.url
    }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to file uploads`, {
        source: 'backend',
        context: 'api:finance:files',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Garante que a tabela file_uploads existe antes de fazer consultas
    const tableReady = await ensureFileUploadsTable();
    
    if (!tableReady) {
      logger.error(`Failed to ensure file_uploads table exists`, {
        source: 'backend',
        context: 'api:finance:files',
        tags: ['schema', 'error'],
        data: { requestId }
      });
      
      return NextResponse.json(
        { error: "Erro de infraestrutura. Não foi possível acessar os dados de uploads." }, 
        { status: 500 }
      );
    }
    
    // Buscar todos os uploads de arquivos, ordenando pelo mais recente
    const files = await db
      .select()
      .from(fileUploads)
      .orderBy(desc(fileUploads.createdAt));
    
    logger.info(`File uploads retrieved successfully`, {
      source: 'backend',
      context: 'api:finance:files',
      tags: ['success', 'query'],
      data: {
        requestId,
        totalFiles: files.length
      }
    });
    
    return NextResponse.json({
      success: true,
      data: files
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error retrieving file uploads`, {
      source: 'backend',
      context: 'api:finance:files',
      tags: ['error', 'query'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[FILE_UPLOADS]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 