/**
 * Script para criar a tabela file_uploads caso ela não exista 
 * 
 * Este arquivo deve ser importado e executado antes da rota principal
 * para garantir que a tabela exista antes de qualquer operação
 */

import { sql } from "@/db/drizzle";
import logger from "@/lib/logger";

export async function ensureFileUploadsTable() {
  try {
    // Verifica se a tabela file_uploads existe
    const tableExists = await checkIfTableExists('file_uploads');
    
    if (!tableExists) {
      logger.info("Tabela file_uploads não encontrada. Criando...", {
        source: 'backend',
        context: 'db:migration',
        tags: ['schema', 'migration']
      });
      
      // Cria a tabela file_uploads baseada no schema
      await sql`
        CREATE TABLE IF NOT EXISTS file_uploads (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          size INTEGER NOT NULL,
          mimetype TEXT NOT NULL,
          rows INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'processing',
          error TEXT,
          processing_time INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;
      
      logger.info("Tabela file_uploads criada com sucesso!", {
        source: 'backend',
        context: 'db:migration',
        tags: ['schema', 'migration', 'success']
      });
      
      return true;
    } else {
      logger.debug("Tabela file_uploads já existe", {
        source: 'backend',
        context: 'db:migration',
        tags: ['schema', 'check']
      });
      
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error("Erro ao criar tabela file_uploads", {
      source: 'backend',
      context: 'db:migration',
      tags: ['schema', 'migration', 'error'],
      data: {
        error: errorMessage,
        stack
      }
    });
    
    return false;
  }
}

async function checkIfTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      );
    `;
    
    return result[0]?.exists || false;
  } catch (error) {
    logger.error(`Erro ao verificar se a tabela ${tableName} existe`, {
      source: 'backend',
      context: 'db:migration',
      tags: ['schema', 'check', 'error'],
      data: { error }
    });
    
    return false;
  }
} 