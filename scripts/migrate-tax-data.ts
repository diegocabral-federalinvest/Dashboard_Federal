/**
 * Script de migração de dados de impostos
 * Converte dedução fiscal trimestral para mensal
 * Mantém compatibilidade com dados antigos
 */

import { db } from "@/db/drizzle";
import { taxDeductions, monthlyTaxDeductions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import logger from "@/lib/logger";

async function migrateTaxDeductions() {
  logger.info("Iniciando migração de deduções fiscais", {
    source: 'migration',
    context: 'tax-data-migration',
    tags: ['migration', 'start']
  });

  try {
    // 1. Buscar todas as deduções trimestrais antigas
    const oldDeductions = await db
      .select()
      .from(taxDeductions);

    logger.info(`Encontradas ${oldDeductions.length} deduções trimestrais para migrar`);

    // 2. Para cada dedução trimestral, criar 3 deduções mensais
    for (const oldDeduction of oldDeductions) {
      const { year, quarter, value } = oldDeduction;
      
      // Determinar os meses do trimestre
      const startMonth = (quarter - 1) * 3 + 1;
      const months = [startMonth, startMonth + 1, startMonth + 2];
      
      // Dividir o valor trimestral por 3 para cada mês
      const monthlyValue = Number(value) / 3;
      
      for (const month of months) {
        try {
          // Verificar se já existe dedução para este mês
          const existing = await db
            .select()
            .from(monthlyTaxDeductions)
            .where(
              and(
                eq(monthlyTaxDeductions.year, year),
                eq(monthlyTaxDeductions.month, month)
              )
            );
          
          if (existing.length === 0) {
            // Inserir nova dedução mensal
            await db.insert(monthlyTaxDeductions).values({
              year,
              month,
              // numeric aceita string, mas manteremos número para consistência
              value: monthlyValue,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            logger.info(`Migrada dedução para ${month}/${year}`, {
              source: 'migration',
              context: 'tax-data-migration',
              tags: ['migration', 'success'],
              data: {
                year,
                month,
                value: monthlyValue,
                originalQuarter: quarter,
                originalValue: value
              }
            });
          } else {
            logger.warn(`Dedução mensal já existe para ${month}/${year}, pulando...`);
          }
        } catch (error) {
          logger.error(`Erro ao migrar dedução para ${month}/${year}`, {
            source: 'migration',
            context: 'tax-data-migration',
            tags: ['migration', 'error'],
            data: {
              error: error instanceof Error ? error.message : String(error),
              year,
              month,
              quarter,
              value
            }
          });
        }
      }
    }
    
    logger.info("Migração de deduções fiscais concluída com sucesso", {
      source: 'migration',
      context: 'tax-data-migration',
      tags: ['migration', 'complete'],
      data: {
        totalMigrated: oldDeductions.length,
        monthsCreated: oldDeductions.length * 3
      }
    });
    
    // 3. Opcionalmente, marcar ou remover as deduções antigas
    // Por enquanto, vamos mantê-las para compatibilidade
    logger.info("Mantendo deduções trimestrais antigas para compatibilidade");
    
  } catch (error) {
    logger.error("Erro fatal na migração", {
      source: 'migration',
      context: 'tax-data-migration',
      tags: ['migration', 'fatal-error'],
      data: {
        error: error instanceof Error ? error.message : String(error)
      }
    });
    throw error;
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateTaxDeductions()
    .then(() => {
      console.log("✅ Migração concluída com sucesso");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro na migração:", error);
      process.exit(1);
    });
}

export { migrateTaxDeductions };
