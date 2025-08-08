import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { fileUploads, financialDataCSV } from "@/db/schema";
import { parse } from "csv-parse/sync";
import crypto from "crypto";
import { z } from "zod";
import logger from "@/lib/logger";
import { eq } from "drizzle-orm";

// Schema for validating CSV data
const csvRowSchema = z.object({
  IdOperacao: z.string(),
  "CPF/CNPJ Cedente": z.string().optional(),
  Data: z.string().optional(),
  Fator: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  AdValorem: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Valor Fator": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Valor AdValorem": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Valor IOF": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Retenção PIS": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Retenção IR": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Retenção CSLL": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Retenção COFINS": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  PIS: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  CSLL: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  COFINS: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  ISSQN: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Valor Tarifas": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Valor Líquido": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Valor IOF Adicional": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Retenção ISS": z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  IRPJ: z.string().optional().transform(val => val ? parseFloat(val.replace(',', '.')) : null),
  "Data Finalização": z.string().optional(),
  País: z.string().optional(),
  Região: z.string().optional(),
  Etapa: z.string().optional(),
  "Data Pagamento": z.string().optional()
});

// Adicionar uma função para converter datas do formato brasileiro para formato ISO
function parseBrazilianDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Verificar se a string está no formato esperado DD/MM/YYYY
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return null;
  
  const [day, month, year] = dateString.split('/').map(Number);
  
  // Criar data no formato correto (mês em JavaScript é base-0)
  const date = new Date(year, month - 1, day);
  
  // Verificar se é uma data válida
  if (isNaN(date.getTime())) return null;
  
  // Retornar objeto Date em vez de string ISO
  return date;
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info(`API Request: POST CSV Upload`, {
    source: 'backend',
    context: 'api:finance:csv-upload',
    tags: ['request', 'post', 'upload', 'csv'],
    data: { requestId }
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to CSV upload endpoint`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify that the request is multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      logger.warn(`Invalid content type for CSV upload: ${contentType}`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['validation', 'error', 'content-type'],
        data: { requestId, contentType }
      });
      
      return NextResponse.json({
        error: "Invalid content type. Expected multipart/form-data"
      }, { status: 400 });
    }
    
    // Get the form data
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      logger.warn(`No file provided in CSV upload request`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['validation', 'error', 'missing-file'],
        data: { requestId }
      });
      
      return NextResponse.json({
        error: "No file provided"
      }, { status: 400 });
    }
    
    // Validate file type
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    if (!fileName.endsWith(".csv") && !fileType.includes("csv")) {
      logger.warn(`Invalid file type in CSV upload: ${fileType}`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['validation', 'error', 'invalid-file-type'],
        data: { requestId, fileName, fileType }
      });
      
      return NextResponse.json({
        error: "Invalid file type. Only CSV files are allowed."
      }, { status: 400 });
    }
    
    if (fileSize === 0) {
      logger.warn(`Empty file provided for CSV upload`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['validation', 'error', 'empty-file'],
        data: { requestId, fileName }
      });
      
      return NextResponse.json({
        error: "The file is empty"
      }, { status: 400 });
    }
    
    // Create a record for the file upload (processing status)
    const fileId = crypto.randomUUID();
    const newUpload = {
      id: fileId,
      filename: fileName,
      originalFilename: fileName,
      size: fileSize,
      mimetype: fileType,
      rows: 0,
      status: "processing",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(fileUploads).values(newUpload);
    
    logger.info(`File upload record created, processing started`, {
      source: 'backend',
      context: 'api:finance:csv-upload',
      tags: ['upload', 'processing', 'start'],
      data: { 
        requestId,
        fileId,
        fileName,
        fileSize
      }
    });
    
    // Return immediate response to client
    // The actual processing will continue asynchronously
    const response = NextResponse.json({
      success: true,
      message: "File upload received, processing started",
      data: newUpload
    });
    
    // Process the CSV file asynchronously
    processCSVFile(file, fileId, requestId).catch(error => {
      logger.error(`Error processing CSV file asynchronously`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['error', 'processing'],
        data: {
          requestId,
          fileId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    });
    
    return response;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error processing CSV upload`, {
      source: 'backend',
      context: 'api:finance:csv-upload',
      tags: ['error', 'upload'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[CSV_UPLOAD]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function processCSVFile(file: File, fileId: string, requestId: string) {
  const startTime = Date.now();
  let rows = 0;
  
  try {
    // Read the file content
    const fileContent = await file.text();
    
    // Detect and handle BOM (Byte Order Mark) if present
    const cleanContent = fileContent.replace(/^\uFEFF/, '');
    
    // Detect delimiter (typically ; or ,)
    let delimiter = ';';
    const firstLine = cleanContent.split('\n')[0];
    
    if (firstLine) {
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      
      if (commaCount > semicolonCount) {
        delimiter = ',';
      }
      
      logger.info(`Delimiter detected: "${delimiter}" (counts - semicolons: ${semicolonCount}, commas: ${commaCount})`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['debug', 'delimiter-detection'],
        data: { requestId, delimiter, semicolonCount, commaCount }
      });
    }
    
    // Handle quoted CSV properly with more robust options
    const parseOptions = {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: delimiter,
      relax_quotes: true,
      relax_column_count: true,
      skip_records_with_error: true,
      escape: '"'
    };
    
    // Parse CSV with the detected delimiter
    const records = parse(cleanContent, parseOptions);
    
    rows = records.length;
    
    // Log first record for debugging
    if (rows > 0) {
      logger.debug(`First record sample: ${JSON.stringify(records[0])}`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['debug', 'sample-record'],
        data: { requestId, sampleRecord: records[0] }
      });
    }
    
    logger.info(`CSV parsed successfully`, {
      source: 'backend',
      context: 'api:finance:csv-upload',
      tags: ['processing', 'parse', 'success'],
      data: { 
        requestId,
        fileId,
        rowCount: rows
      }
    });
    
    // Process and validate each row
    const validRecords = [];
    const errors = [];
    
    for (let i = 0; i < records.length; i++) {
      try {
        const record = records[i];
        const validatedRecord = csvRowSchema.parse(record);
        
        // Map CSV fields to database fields
        const dbRecord = {
          id: crypto.randomUUID(),
          IdOperacao: validatedRecord.IdOperacao,
          CPFCNPJCedente: validatedRecord["CPF/CNPJ Cedente"] || null,
          Data: validatedRecord.Data ? parseBrazilianDate(validatedRecord.Data) : null,
          Fator: validatedRecord.Fator,
          AdValorem: validatedRecord.AdValorem,
          ValorFator: validatedRecord["Valor Fator"],
          ValorAdValorem: validatedRecord["Valor AdValorem"],
          ValorIOF: validatedRecord["Valor IOF"],
          RetencaoPIS: validatedRecord["Retenção PIS"],
          RetencaoIR: validatedRecord["Retenção IR"],
          RetencaoCSLL: validatedRecord["Retenção CSLL"],
          RetencaoCOFINS: validatedRecord["Retenção COFINS"],
          PIS: validatedRecord.PIS,
          CSLL: validatedRecord.CSLL,
          COFINS: validatedRecord.COFINS,
          ISSQN: validatedRecord.ISSQN,
          ValorTarifas: validatedRecord["Valor Tarifas"],
          ValorLiquido: validatedRecord["Valor Líquido"],
          ValorIOFAdicional: validatedRecord["Valor IOF Adicional"],
          RetencaoISS: validatedRecord["Retenção ISS"],
          IRPJ: validatedRecord.IRPJ,
          DataFinalizacao: validatedRecord["Data Finalização"] ? parseBrazilianDate(validatedRecord["Data Finalização"]) : null,
          Pais: validatedRecord.País || null,
          Regiao: validatedRecord.Região || null,
          Etapa: validatedRecord.Etapa || null,
          DataPagamento: validatedRecord["Data Pagamento"] ? parseBrazilianDate(validatedRecord["Data Pagamento"]) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add debug logging for the first record
        if (i === 0) {
          logger.debug(`First record after transformation`, {
            source: 'backend',
            context: 'api:finance:csv-upload',
            tags: ['debug', 'record-transformation'],
            data: {
              requestId,
              original: validatedRecord,
              transformed: {
                id: dbRecord.id,
                IdOperacao: dbRecord.IdOperacao,
                // Log date values to verify format
                Data: dbRecord.Data instanceof Date ? dbRecord.Data.toISOString() : dbRecord.Data,
                DataFinalizacao: dbRecord.DataFinalizacao instanceof Date ? dbRecord.DataFinalizacao.toISOString() : dbRecord.DataFinalizacao,
                DataPagamento: dbRecord.DataPagamento instanceof Date ? dbRecord.DataPagamento.toISOString() : dbRecord.DataPagamento,
                // Sample of numeric values
                Fator: dbRecord.Fator,
                ValorFator: dbRecord.ValorFator
              }
            }
          });
        }
        
        validRecords.push(dbRecord);
      } catch (error) {
        errors.push({
          row: i + 2, // +2 because 1-based index and header row
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    if (errors.length > 0) {
      logger.warn(`Found ${errors.length} validation errors in CSV`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['processing', 'validation', 'errors'],
        data: { 
          requestId,
          fileId,
          errors: errors.slice(0, 10) // Log only first 10 errors
        }
      });
    }
    
    // Insert valid records into the database
    if (validRecords.length > 0) {
      try {
      // Insert in batches of 100 to avoid issues with large files
      const batchSize = 100;
      for (let i = 0; i < validRecords.length; i += batchSize) {
        const batch = validRecords.slice(i, i + batchSize);
          
          logger.debug(`Inserting batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(validRecords.length/batchSize)}`, {
            source: 'backend',
            context: 'api:finance:csv-upload',
            tags: ['processing', 'database', 'batch-insert'],
            data: { 
              requestId,
              fileId,
              batchSize: batch.length,
              firstRecordId: batch[0].id
            }
          });
          
        await db.insert(financialDataCSV).values(batch as any)
          .onConflictDoUpdate({
            target: financialDataCSV.IdOperacao,
            set: {
              updatedAt: new Date()
            }
          });
      }
      
      logger.info(`Inserted ${validRecords.length} records into financialDataCSV table`, {
        source: 'backend',
        context: 'api:finance:csv-upload',
        tags: ['processing', 'database', 'insert', 'success'],
        data: { 
          requestId,
          fileId,
          insertedCount: validRecords.length
        }
      });
      } catch (dbError) {
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        const stack = dbError instanceof Error ? dbError.stack : undefined;
        
        logger.error(`Database error inserting CSV data`, {
          source: 'backend',
          context: 'api:finance:csv-upload',
          tags: ['error', 'database'],
          data: {
            requestId,
            fileId,
            error: errorMessage,
            stack
          }
        });
        
        // Update file upload record with error
        await db.update(fileUploads)
          .set({
            status: "error",
            error: `Erro ao inserir no banco de dados: ${errorMessage}`,
            updatedAt: new Date()
          })
          .where(eq(fileUploads.id, fileId));
          
        return; // Stop processing after database error
      }
    }
    
    // Update file upload record
    const processingTime = Date.now() - startTime;
    await db.update(fileUploads)
      .set({
        status: "completed",
        rows: validRecords.length,
        processingTime,
        updatedAt: new Date()
      })
      .where(eq(fileUploads.id, fileId));
    
    logger.info(`CSV processing completed successfully`, {
      source: 'backend',
      context: 'api:finance:csv-upload',
      tags: ['processing', 'complete', 'success'],
      data: { 
        requestId,
        fileId,
        processingTimeMs: processingTime,
        totalRows: rows,
        validRows: validRecords.length,
        errorCount: errors.length
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error processing CSV file`, {
      source: 'backend',
      context: 'api:finance:csv-upload',
      tags: ['error', 'processing'],
      data: {
        requestId,
        fileId,
        error: errorMessage,
        stack
      }
    });
    
    // Update file upload record with error
    await db.update(fileUploads)
      .set({
        status: "error",
        error: errorMessage,
        updatedAt: new Date()
      })
      .where(eq(fileUploads.id, fileId));
  }
}

// Config for handling large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const maxDuration = 60; // Adjusted for handling larger files (in seconds)