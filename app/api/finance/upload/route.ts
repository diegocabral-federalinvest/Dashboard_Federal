import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { financialDataCSV } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { parse } from "csv-parse/sync";
import logger from "@/lib/logger";

// Utility function to safely parse number values from CSV
const parseNumberValue = (value: string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  
  // Replace comma with dot for decimal parsing
  const normalizedValue = value.toString().replace(',', '.');
  const parsed = parseFloat(normalizedValue);
  
  return isNaN(parsed) ? null : parsed;
};

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  logger.info(`Iniciando POST /api/finance/csv-upload`, {
    source: 'backend',
    context: 'api:finance:upload',
    tags: ['request', 'post', 'upload'],
    data: { requestId, url: req.url }
  });

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Tentativa de upload não autorizada`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['auth', 'unauthorized'],
        data: { requestId }
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Obter o FormData com o arquivo CSV
    logger.debug(`Processando FormData`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['processing', 'formdata'],
      data: { requestId }
    });
    
    console.log("👋 API UPLOAD: Iniciando processamento");
    
    let formData;
    try {
      formData = await req.formData();
      console.log("FormData obtido com sucesso");
    } catch (formError) {
      console.error("❌ ERRO obtendo FormData:", formError);
      logger.error(`Erro ao processar FormData: ${formError instanceof Error ? formError.message : String(formError)}`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['error', 'formdata'],
        data: { requestId, error: String(formError) }
      });
      return NextResponse.json({ error: "Failed to process form data" }, { status: 400 });
    }
    
    const file = formData.get("file");
    console.log("Arquivo do FormData:", file ? "Encontrado" : "Não encontrado");
    
    if (!file || !(file instanceof File)) {
      logger.warn(`Nenhum arquivo encontrado no upload`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['validation', 'error', 'file-missing'],
        data: { requestId }
      });
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    logger.info(`Arquivo recebido: ${file.name}, Tipo: ${file.type}, Tamanho: ${file.size} bytes`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['file-info'],
      data: { requestId, filename: file.name, type: file.type, size: file.size }
    });

    // Verificar o tipo MIME do arquivo
    if (!file.type.includes("csv") && !file.type.includes("text/plain")) {
      logger.warn(`Tipo de arquivo inválido: ${file.type}`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['validation', 'error', 'invalid-type'],
        data: { requestId, type: file.type }
      });
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }
    
    // Ler o conteúdo do arquivo
    logger.debug(`Lendo conteúdo do arquivo`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['processing', 'read-file'],
      data: { requestId }
    });
    const csvText = await file.text();
    
    // Log dos primeiros 500 caracteres para debug
    logger.debug(`Primeiros 500 caracteres do CSV: ${csvText.substring(0, 500)}...`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['debug', 'csv-content'],
      data: { requestId }
    });
    
    // Detectar o delimitador (geralmente ; ou ,)
    let delimiter = ';';
    const firstLine = csvText.split('\n')[0];
    
    if (firstLine) {
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      
      if (commaCount > semicolonCount) {
        delimiter = ',';
      }
      
      logger.info(`Delimitador detectado: "${delimiter}" (contagem - ; : ${semicolonCount}, , : ${commaCount})`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['debug', 'delimiter-detection'],
        data: { requestId, delimiter, semicolonCount, commaCount }
      });
    }
    
    // Parsear o CSV
    logger.debug(`Parseando CSV com delimitador "${delimiter}"`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['processing', 'parse-csv'],
      data: { requestId, delimiter }
    });
    
    let records;
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: delimiter,
        relax_quotes: true,
        escape: '"'
      });
      
      logger.debug(`Colunas encontradas no CSV: ${Object.keys(records[0] || {}).join(', ')}`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['debug', 'csv-columns'],
        data: { requestId, columns: Object.keys(records[0] || {}) }
      });
    } catch (parseError) {
      logger.error(`Erro ao parsear CSV: ${parseError instanceof Error ? parseError.message : String(parseError)}`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['error', 'csv-parse'],
        data: { requestId, errorMessage: parseError instanceof Error ? parseError.message : String(parseError) }
      });
      
      return NextResponse.json({ 
        error: "Failed to parse CSV", 
        message: parseError instanceof Error ? parseError.message : String(parseError)
      }, { status: 400 });
    }
    
    if (!records.length) {
      logger.warn(`Arquivo CSV vazio`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['validation', 'error', 'empty-file'],
        data: { requestId }
      });
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }
    
    logger.info(`${records.length} registros encontrados no CSV`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['parse-success'],
      data: { requestId, count: records.length }
    });

    // Processar os registros
    logger.debug(`Processando e mapeando registros para o schema do DB`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['processing', 'map-records'],
      data: { requestId }
    });
    
    // Log a first record for debugging
    logger.debug(`Exemplo do primeiro registro: ${JSON.stringify(records[0])}`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['debug', 'sample-record'],
      data: { requestId, sampleRecord: records[0] }
    });
    
    const processedRecords = records.map((record: any, index: number) => {
      // Obter os campos originais - para cada campo, tente obter pelas diferentes formas que podem estar nomeados
      const idOperacao = record.IdOperacao || record['IdOperacao'] || record['Id Operacao'] || record['ID'] || `OP-${Date.now()}-${index}`;
      const cpfCnpjCedente = record['CPF/CNPJ Cedente'] || record.CPFCNPJCedente || record['CPFCNPJ'] || null;
      const data = record.Data || record['Data'] || record['data'] || null;
      const dataFormatted = data ? new Date(data.split('/').reverse().join('-')) : new Date();
      
      // Campos numéricos - valores financeiros
      const fator = parseNumberValue(record.Fator || record['Fator']);
      const adValorem = parseNumberValue(record.AdValorem || record['AdValorem'] || record['Ad Valorem']);
      const valorFator = parseNumberValue(record['Valor Fator'] || record.ValorFator);
      const valorAdValorem = parseNumberValue(record['Valor AdValorem'] || record.ValorAdValorem || record['Valor Ad Valorem']);
      const valorIOF = parseNumberValue(record['Valor IOF'] || record.ValorIOF);
      const retencaoPIS = parseNumberValue(record['Retenção PIS'] || record.RetencaoPIS);
      const retencaoIR = parseNumberValue(record['Retenção IR'] || record.RetencaoIR);
      const retencaoCSLL = parseNumberValue(record['Retenção CSLL'] || record.RetencaoCSLL);
      const retencaoCOFINS = parseNumberValue(record['Retenção COFINS'] || record.RetencaoCOFINS);
      const pis = parseNumberValue(record.PIS);
      const csll = parseNumberValue(record.CSLL);
      const cofins = parseNumberValue(record.COFINS);
      const issqn = parseNumberValue(record.ISSQN);
      const valorTarifas = parseNumberValue(record['Valor Tarifas'] || record.ValorTarifas);
      const valorLiquido = parseNumberValue(record['Valor Líquido'] || record.ValorLiquido || record['Valor Liquido']);
      const valorIOFAdicional = parseNumberValue(record['Valor IOF Adicional'] || record.ValorIOFAdicional);
      const retencaoISS = parseNumberValue(record['Retenção ISS'] || record.RetencaoISS);
      const irpj = parseNumberValue(record.IRPJ);
      
      // Outros campos
      const dataFinalizacao = record['Data Finalização'] || record.DataFinalizacao || null;
      const dataFinalizacaoFormatted = dataFinalizacao 
        ? new Date(dataFinalizacao.split('/').reverse().join('-')) 
        : null;
      
      const pais = record.País || record.Pais || record['pais'] || null;
      const regiao = record.Região || record.Regiao || record['regiao'] || null;
      const etapa = record.Etapa || record['etapa'] || null;
      
      const dataPagamento = record['Data Pagamento'] || record.DataPagamento || null;
      const dataPagamentoFormatted = dataPagamento 
        ? new Date(dataPagamento.split('/').reverse().join('-')) 
        : null;
      
      // Debug log for parsing each record
      if (index === 0 || index === records.length - 1) { // Log primeiro e último registro
        logger.debug(`Processando registro ${index + 1}/${records.length}: ${JSON.stringify({
          idOperacao,
          valorFator,
          valorAdValorem,
          valorTarifas,
          valorLiquido
        })}`, {
          source: 'backend',
          context: 'api:finance:upload',
          tags: ['debug', 'record-processing'],
          data: { 
            requestId, 
            recordIndex: index,
            originalRecord: record,
            parsedValues: {
              idOperacao,
              valorFator,
              valorAdValorem,
              valorTarifas,
              valorLiquido
            }
          }
        });
      }
        
      // Retornar o objeto formatado
      return {
        id: createId(),
        IdOperacao: idOperacao,
        CPFCNPJCedente: cpfCnpjCedente,
        Data: dataFormatted,
        Fator: fator,
        AdValorem: adValorem,
        ValorFator: valorFator,
        ValorAdValorem: valorAdValorem,
        ValorIOF: valorIOF,
        RetencaoPIS: retencaoPIS,
        RetencaoIR: retencaoIR,
        RetencaoCSLL: retencaoCSLL,
        RetencaoCOFINS: retencaoCOFINS,
        PIS: pis,
        CSLL: csll,
        COFINS: cofins,
        ISSQN: issqn,
        ValorTarifas: valorTarifas,
        ValorLiquido: valorLiquido,
        ValorIOFAdicional: valorIOFAdicional,
        RetencaoISS: retencaoISS,
        IRPJ: irpj,
        DataFinalizacao: dataFinalizacaoFormatted,
        Pais: pais,
        Regiao: regiao,
        Etapa: etapa,
        DataPagamento: dataPagamentoFormatted,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    
    // Inserir os registros no banco de dados
    logger.debug(`Inserindo ${processedRecords.length} registros no banco de dados`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['db-insert'],
      data: { requestId, count: processedRecords.length }
    });
    
    console.log(`👉 Tentando inserir ${processedRecords.length} registros no banco de dados`);
    
    try {
      const data = await db
        .insert(financialDataCSV)
        .values(processedRecords)
        .returning();
      
      console.log(`✅ Inserção bem-sucedida: ${data.length} registros inseridos`);
      
      logger.info(`Upload e processamento concluídos. ${data.length} registros inseridos.`, {
        source: 'backend',
        context: 'api:finance:upload',
        tags: ['success'],
        data: { requestId, count: data.length }
      });
      
      return NextResponse.json({ 
        success: true, 
        count: data.length,
        data: data 
      });
    } catch (dbError) {
      console.error("❌ ERRO de banco de dados:", dbError);
      throw dbError; // Re-throw para capturar no catch geral
    }
    
  } catch (error) {    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    console.error("❌ ERRO CRÍTICO:", errorMessage);
    if (stack) console.error("Stack trace:", stack);
    
    logger.error(`Erro no processamento do upload: ${errorMessage}`, {
      source: 'backend',
      context: 'api:finance:upload',
      tags: ['error', 'processing'],
      data: {
        requestId,
        error: errorMessage,
        stack
      }
    });
    
    console.error("[FINANCE_UPLOAD]", error);
    
    return NextResponse.json({ 
      error: "Error processing CSV file", 
      message: errorMessage 
    }, { status: 500 });
  }
}

// Config for large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const maxDuration = 60; // 60 seconds for handling large uploads 