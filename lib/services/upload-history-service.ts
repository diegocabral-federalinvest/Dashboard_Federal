import { db } from '@/db/drizzle';
import { uploadHistory, NewUploadHistory, UploadHistory } from '@/db/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

export class UploadHistoryService {
  /**
   * Adiciona um novo registro de histórico de uploads
   */
  static async create(data: NewUploadHistory): Promise<UploadHistory> {
    const [result] = await db.insert(uploadHistory).values(data).returning();
    return result;
  }

  /**
   * Obtem todos os registros de histórico de upload, ordenados pelo mais recente
   */
  static async getAll(
    limit: number = 100, 
    offset: number = 0,
    filters?: { success?: boolean }
  ): Promise<{ data: UploadHistory[], total: number }> {
    // Construir condições de filtro
    const conditions = [];
    if (filters?.success !== undefined) {
      conditions.push(eq(uploadHistory.success, filters.success));
    }
    
    // Executar query com filtros
    const data = await db
      .select()
      .from(uploadHistory)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(uploadHistory.importedAt))
      .limit(limit)
      .offset(offset);
    
    // Contar total para paginação
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(uploadHistory)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    return { data, total: count };
  }

  /**
   * Obter um registro específico pelo ID
   */
  static async getById(id: number): Promise<UploadHistory | undefined> {
    const [result] = await db
      .select()
      .from(uploadHistory)
      .where(eq(uploadHistory.id, id));
    
    return result;
  }

  /**
   * Obter estatísticas sobre uploads
   */
  static async getStatistics() {
    // Total de uploads
    const [{ totalUploads }] = await db
      .select({ totalUploads: sql`count(*)` })
      .from(uploadHistory) as [{ totalUploads: number }];
    
    // Uploads bem-sucedidos vs falhas
    const [{ successfulUploads }] = await db
      .select({ successfulUploads: sql`count(*)` })
      .from(uploadHistory)
      .where(eq(uploadHistory.success, true)) as [{ successfulUploads: number }];
    
    // Falhas
    const failedUploads = Number(totalUploads) - Number(successfulUploads);
    
    // Total de registros processados
    const [{ totalRecordsProcessed }] = await db
      .select({
        totalRecordsProcessed: sql`sum(${uploadHistory.recordsProcessed})`
      })
      .from(uploadHistory) as [{ totalRecordsProcessed: number | null }];
    
    return {
      totalUploads: Number(totalUploads),
      successfulUploads: Number(successfulUploads),
      failedUploads,
      successRate: totalUploads > 0 ? (Number(successfulUploads) / Number(totalUploads) * 100) : 0,
      totalRecordsProcessed: Number(totalRecordsProcessed) || 0
    };
  }

  /**
   * Obtem informações para análise temporal de uploads
   */
  static async getTimeAnalysis() {
    // Implementação futura - análise por data, hora do dia, etc.
    return { 
      // placeholder para análise temporal futura
    };
  }
} 