import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { financialDataCSV, expenses, entries, taxDeductions, monthlyTaxDeductions, manualQuarterlyTaxes } from "@/db/schema";
import { and, gte, lte, sql, eq } from "drizzle-orm";

// Retorna série mensal de Operação (soma dos componentes) para um ano
// GET /api/reports/operation?year=2024
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month"); // 1-12 para modo mensal
    const quarterParam = searchParams.get("quarter"); // 1, 2, 3, 4 ou null para "todos"
    const quarterlyParam = searchParams.get("quarterly") === "true"; // modo trimestral ativado
    const monthlyParam = searchParams.get("monthly") === "true"; // modo mensal ativado
    
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    if (Number.isNaN(year)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    
    const month = monthParam ? parseInt(monthParam) : null;
    if (month !== null && (month < 1 || month > 12)) {
      return NextResponse.json({ error: "Invalid month (must be 1-12)" }, { status: 400 });
    }
    
    const quarter = quarterParam ? parseInt(quarterParam) : null;
    if (quarter !== null && (quarter < 1 || quarter > 4)) {
      return NextResponse.json({ error: "Invalid quarter (must be 1-4)" }, { status: 400 });
    }

    console.log(`🔍 [OPERATION-API-DEBUG] Parâmetros:`, { 
      year, 
      month,
      quarter, 
      monthly: monthlyParam,
      quarterly: quarterlyParam, 
      yearParam,
      monthParam, 
      quarterParam 
    });

    // Debug: Verificar quais anos temos dados
    const availableYears = await db
      .select({
        year: sql`EXTRACT(YEAR FROM ${financialDataCSV.Data})`.as("year"),
        count: sql`COUNT(*)`.as("count")
      })
      .from(financialDataCSV)
      .groupBy(sql`EXTRACT(YEAR FROM ${financialDataCSV.Data})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${financialDataCSV.Data})`);
    
    console.log(`🔍 [OPERATION-API-DEBUG] Anos disponíveis no banco:`, availableYears);
    
    // Debug: Verificar estrutura da tabela
    const totalCount = await db.select({ count: sql`COUNT(*)` }).from(financialDataCSV);
    console.log(`🔍 [OPERATION-API-DEBUG] Total de registros na tabela:`, totalCount[0]?.count);
    
    const sampleRecord = await db.select().from(financialDataCSV).limit(1);
    console.log(`🔍 [OPERATION-API-DEBUG] Registro de exemplo:`, sampleRecord[0]);

    let startDate: Date;
    let endDate: Date;
    
    // Definir período baseado no modo (diário/mensal vs trimestral vs anual)
    if (monthlyParam && month !== null) {
      // Mês específico para visualização diária (ex: Janeiro 2024 = dias 1-31)
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999); // Último dia do mês
    } else if (quarterlyParam && quarter !== null) {
      // Trimestre específico (Q1, Q2, Q3, Q4)
      const startMonth = (quarter - 1) * 3;
      const endMonth = startMonth + 2;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, endMonth + 1, 0, 23, 59, 59, 999);
    } else {
      // Ano completo (todos os meses ou todos os trimestres)
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // Operação = valor_fator + valor_ad_valorem + valor_iof + valor_tarifas + valor_liquido
    let rows;
    
    if (monthlyParam) {
      // Modo mensal (diário): agrupar por dia
      rows = await db
        .select({
          period: sql`date_trunc('day', ${financialDataCSV.Data})`.as("day"),
          operacao: sql`COALESCE(SUM(COALESCE("valor_fator", 0) + COALESCE("valor_ad_valorem", 0) + COALESCE("valor_iof", 0) + COALESCE("valor_tarifas", 0) + COALESCE("valor_liquido", 0)), 0)`.as("operacao"),
          totalValorFator: sql`COALESCE(SUM(COALESCE("valor_fator", 0)), 0)`.as("totalValorFator"),
          totalValorAdValorem: sql`COALESCE(SUM(COALESCE("valor_ad_valorem", 0)), 0)`.as("totalValorAdValorem"),
          totalValorTarifas: sql`COALESCE(SUM(COALESCE("valor_tarifas", 0)), 0)`.as("totalValorTarifas"),
          totalPIS: sql`COALESCE(SUM(COALESCE("pis", 0)), 0)`.as("totalPIS"),
          totalCOFINS: sql`COALESCE(SUM(COALESCE("cofins", 0)), 0)`.as("totalCOFINS"),
          totalISSQN: sql`COALESCE(SUM(COALESCE("issqn", 0)), 0)`.as("totalISSQN"),
        })
        .from(financialDataCSV)
        .where(and(gte(financialDataCSV.Data, startDate), lte(financialDataCSV.Data, endDate)))
        .groupBy(sql`date_trunc('day', ${financialDataCSV.Data})`)
        .orderBy(sql`date_trunc('day', ${financialDataCSV.Data})`);
    } else if (quarterlyParam) {
      // Modo trimestral: agrupar por trimestre
      rows = await db
        .select({
          period: sql`EXTRACT(QUARTER FROM ${financialDataCSV.Data})`.as("quarter"),
          operacao: sql`COALESCE(SUM(COALESCE("valor_fator", 0) + COALESCE("valor_ad_valorem", 0) + COALESCE("valor_iof", 0) + COALESCE("valor_tarifas", 0) + COALESCE("valor_liquido", 0)), 0)`.as("operacao"),
          totalValorFator: sql`COALESCE(SUM(COALESCE("valor_fator", 0)), 0)`.as("totalValorFator"),
          totalValorAdValorem: sql`COALESCE(SUM(COALESCE("valor_ad_valorem", 0)), 0)`.as("totalValorAdValorem"),
          totalValorTarifas: sql`COALESCE(SUM(COALESCE("valor_tarifas", 0)), 0)`.as("totalValorTarifas"),
          totalPIS: sql`COALESCE(SUM(COALESCE("pis", 0)), 0)`.as("totalPIS"),
          totalCOFINS: sql`COALESCE(SUM(COALESCE("cofins", 0)), 0)`.as("totalCOFINS"),
          totalISSQN: sql`COALESCE(SUM(COALESCE("issqn", 0)), 0)`.as("totalISSQN"),
        })
        .from(financialDataCSV)
        .where(and(gte(financialDataCSV.Data, startDate), lte(financialDataCSV.Data, endDate)))
        .groupBy(sql`EXTRACT(QUARTER FROM ${financialDataCSV.Data})`)
        .orderBy(sql`EXTRACT(QUARTER FROM ${financialDataCSV.Data})`);
    } else {
      // Modo anual: agrupar por mês
      rows = await db
        .select({
          period: sql`date_trunc('month', ${financialDataCSV.Data})`.as("month"),
          operacao: sql`COALESCE(SUM(COALESCE("valor_fator", 0) + COALESCE("valor_ad_valorem", 0) + COALESCE("valor_iof", 0) + COALESCE("valor_tarifas", 0) + COALESCE("valor_liquido", 0)), 0)`.as("operacao"),
          totalValorFator: sql`COALESCE(SUM(COALESCE("valor_fator", 0)), 0)`.as("totalValorFator"),
          totalValorAdValorem: sql`COALESCE(SUM(COALESCE("valor_ad_valorem", 0)), 0)`.as("totalValorAdValorem"),
          totalValorTarifas: sql`COALESCE(SUM(COALESCE("valor_tarifas", 0)), 0)`.as("totalValorTarifas"),
          totalPIS: sql`COALESCE(SUM(COALESCE("pis", 0)), 0)`.as("totalPIS"),
          totalCOFINS: sql`COALESCE(SUM(COALESCE("cofins", 0)), 0)`.as("totalCOFINS"),
          totalISSQN: sql`COALESCE(SUM(COALESCE("issqn", 0)), 0)`.as("totalISSQN"),
        })
        .from(financialDataCSV)
        .where(and(gte(financialDataCSV.Data, startDate), lte(financialDataCSV.Data, endDate)))
        .groupBy(sql`date_trunc('month', ${financialDataCSV.Data})`)
        .orderBy(sql`date_trunc('month', ${financialDataCSV.Data})`);
    }

    console.log(`🔍 [OPERATION-API-DEBUG] Registros encontrados:`, rows.length);
    console.log(`🔍 [OPERATION-API-DEBUG] Primeiros registros:`, rows.slice(0, 3));
    
    // Debug específico para tarifas
    const tarifasDebug = rows.filter(r => Number(r.totalValorTarifas) > 0);
    console.log(`🔍 [TARIFAS-DEBUG] Registros com tarifas > 0:`, tarifasDebug.length);
    console.log(`🔍 [TARIFAS-DEBUG] Exemplos com tarifas:`, tarifasDebug.slice(0, 2));
    
    // Query direta para verificar dados brutos de tarifas
    const rawTarifasCheck = await db
      .select({
        data: financialDataCSV.Data,
        valor_tarifas: financialDataCSV.ValorTarifas,
        count: sql`COUNT(*)`.as("count")
      })
      .from(financialDataCSV)
      .where(and(
        gte(financialDataCSV.Data, startDate), 
        lte(financialDataCSV.Data, endDate),
        sql`"valor_tarifas" > 0`
      ))
      .groupBy(financialDataCSV.Data, financialDataCSV.ValorTarifas)
      .limit(5);
    
    console.log(`🔍 [RAW-TARIFAS-DEBUG] Dados brutos com tarifas > 0:`, rawTarifasCheck.length);
    console.log(`🔍 [RAW-TARIFAS-DEBUG] Exemplos brutos:`, rawTarifasCheck);

    // Queries para expenses e entries com o mesmo período
    let expensesRows, entriesRows;
    
    if (monthlyParam) {
      // Modo mensal (diário): agrupar por dia
      expensesRows = await db
        .select({
          period: sql`date_trunc('day', ${expenses.date})`.as("day"),
          totalExpenses: sql`COALESCE(SUM("value"), 0)`.as("totalExpenses"),
        })
        .from(expenses)
        .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
        .groupBy(sql`date_trunc('day', ${expenses.date})`)
        .orderBy(sql`date_trunc('day', ${expenses.date})`);
        
      entriesRows = await db
        .select({
          period: sql`date_trunc('day', ${entries.date})`.as("day"),
          totalEntries: sql`COALESCE(SUM("value"), 0)`.as("totalEntries"),
        })
        .from(entries)
        .where(and(gte(entries.date, startDate), lte(entries.date, endDate)))
        .groupBy(sql`date_trunc('day', ${entries.date})`)
        .orderBy(sql`date_trunc('day', ${entries.date})`);
    } else if (quarterlyParam) {
      // Modo trimestral: agrupar por trimestre
      expensesRows = await db
        .select({
          period: sql`EXTRACT(QUARTER FROM ${expenses.date})`.as("quarter"),
          totalExpenses: sql`COALESCE(SUM("value"), 0)`.as("totalExpenses"),
        })
        .from(expenses)
        .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
        .groupBy(sql`EXTRACT(QUARTER FROM ${expenses.date})`)
        .orderBy(sql`EXTRACT(QUARTER FROM ${expenses.date})`);
        
      entriesRows = await db
        .select({
          period: sql`EXTRACT(QUARTER FROM ${entries.date})`.as("quarter"),
          totalEntries: sql`COALESCE(SUM("value"), 0)`.as("totalEntries"),
        })
        .from(entries)
        .where(and(gte(entries.date, startDate), lte(entries.date, endDate)))
        .groupBy(sql`EXTRACT(QUARTER FROM ${entries.date})`)
        .orderBy(sql`EXTRACT(QUARTER FROM ${entries.date})`);
    } else {
      // Modo anual: agrupar por mês
      expensesRows = await db
        .select({
          period: sql`date_trunc('month', ${expenses.date})`.as("month"),
          totalExpenses: sql`COALESCE(SUM("value"), 0)`.as("totalExpenses"),
        })
        .from(expenses)
        .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
        .groupBy(sql`date_trunc('month', ${expenses.date})`)
        .orderBy(sql`date_trunc('month', ${expenses.date})`);
        
      entriesRows = await db
        .select({
          period: sql`date_trunc('month', ${entries.date})`.as("month"),
          totalEntries: sql`COALESCE(SUM("value"), 0)`.as("totalEntries"),
        })
        .from(entries)
        .where(and(gte(entries.date, startDate), lte(entries.date, endDate)))
        .groupBy(sql`date_trunc('month', ${entries.date})`)
        .orderBy(sql`date_trunc('month', ${entries.date})`);
    }

    console.log(`🔍 [OPERATION-API-DEBUG] Expenses encontradas:`, expensesRows.length);
    console.log(`🔍 [OPERATION-API-DEBUG] Entries encontradas:`, entriesRows.length);

    // Queries para dados manuais (dedução, CSLL, IRPJ)
    let deductionRows, csllRows, irpjRows;
    
    if (monthlyParam) {
      // Modo mensal (diário): buscar dedução mensal
      deductionRows = await db
        .select({
          month: monthlyTaxDeductions.month,
          deduction: monthlyTaxDeductions.value,
        })
        .from(monthlyTaxDeductions)
        .where(and(
          eq(monthlyTaxDeductions.year, year),
          eq(monthlyTaxDeductions.month, month!)
        ));
      
      // CSLL e IRPJ são trimestrais, buscar do trimestre correspondente
      const quarterForMonth = Math.ceil(month! / 3);
      const taxesRows = await db
        .select({
          quarter: manualQuarterlyTaxes.quarter,
          csll: manualQuarterlyTaxes.csll,
          irpj: manualQuarterlyTaxes.irpj,
        })
        .from(manualQuarterlyTaxes)
        .where(and(
          eq(manualQuarterlyTaxes.year, year),
          eq(manualQuarterlyTaxes.quarter, quarterForMonth)
        ));
      
      csllRows = taxesRows;
      irpjRows = taxesRows;
      
    } else if (quarterlyParam) {
      // Modo trimestral: buscar dados trimestrais
      if (quarter !== null) {
        // Trimestre específico
        deductionRows = await db
          .select({
            quarter: sql`${quarter}`.as("quarter"),
            deduction: taxDeductions.value,
          })
          .from(taxDeductions)
          .where(and(
            eq(taxDeductions.year, year),
            eq(taxDeductions.quarter, quarter)
          ));
          
        const taxesRows = await db
          .select({
            quarter: manualQuarterlyTaxes.quarter,
            csll: manualQuarterlyTaxes.csll,
            irpj: manualQuarterlyTaxes.irpj,
          })
          .from(manualQuarterlyTaxes)
          .where(and(
            eq(manualQuarterlyTaxes.year, year),
            eq(manualQuarterlyTaxes.quarter, quarter)
          ));
          
        csllRows = taxesRows;
        irpjRows = taxesRows;
      } else {
        // Todos os trimestres
        deductionRows = await db
          .select({
            quarter: taxDeductions.quarter,
            deduction: taxDeductions.value,
          })
          .from(taxDeductions)
          .where(eq(taxDeductions.year, year));
          
        const taxesRows = await db
          .select({
            quarter: manualQuarterlyTaxes.quarter,
            csll: manualQuarterlyTaxes.csll,
            irpj: manualQuarterlyTaxes.irpj,
          })
          .from(manualQuarterlyTaxes)
          .where(eq(manualQuarterlyTaxes.year, year));
          
        csllRows = taxesRows;
        irpjRows = taxesRows;
      }
    } else {
      // Modo anual: buscar dados mensais de dedução e trimestrais de impostos
      deductionRows = await db
        .select({
          month: monthlyTaxDeductions.month,
          deduction: monthlyTaxDeductions.value,
        })
        .from(monthlyTaxDeductions)
        .where(eq(monthlyTaxDeductions.year, year));
        
      const taxesRows = await db
        .select({
          quarter: manualQuarterlyTaxes.quarter,
          csll: manualQuarterlyTaxes.csll,
          irpj: manualQuarterlyTaxes.irpj,
        })
        .from(manualQuarterlyTaxes)
        .where(eq(manualQuarterlyTaxes.year, year));
        
      csllRows = taxesRows;
      irpjRows = taxesRows;
    }

    console.log(`🔍 [MANUAL-DATA-DEBUG] Deduções encontradas:`, deductionRows.length);
    console.log(`🔍 [MANUAL-DATA-DEBUG] CSLL encontrados:`, csllRows.length);
    console.log(`🔍 [MANUAL-DATA-DEBUG] IRPJ encontrados:`, irpjRows.length);

    let data;
    
    if (monthlyParam) {
      // Normalizar para dias do mês
      const byDayKey = new Map<string, any>();
      const expensesByDayKey = new Map<string, number>();
      const entriesByDayKey = new Map<string, number>();
      
      // Maps para dados manuais (valores fixos por período)
      const deductionValue = deductionRows.length > 0 ? Number(deductionRows[0].deduction) || 0 : 0;
      const csllValue = csllRows.length > 0 ? Number(csllRows[0].csll) || 0 : 0;
      const irpjValue = irpjRows.length > 0 ? Number(irpjRows[0].irpj) || 0 : 0;
      
      // Processar dados financeiros
      rows.forEach((r: any) => {
        const d = new Date(r.period as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        byDayKey.set(key, {
          operacao: Number(r.operacao) || 0,
          totalValorFator: Number(r.totalValorFator) || 0,
          totalValorAdValorem: Number(r.totalValorAdValorem) || 0,
          totalValorTarifas: Number(r.totalValorTarifas) || 0,
          totalPIS: Number(r.totalPIS) || 0,
          totalCOFINS: Number(r.totalCOFINS) || 0,
          totalISSQN: Number(r.totalISSQN) || 0,
        });
      });
      
      // Processar despesas
      expensesRows.forEach((r: any) => {
        const d = new Date(r.period as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        expensesByDayKey.set(key, Number(r.totalExpenses) || 0);
      });
      
      // Processar receitas
      entriesRows.forEach((r: any) => {
        const d = new Date(r.period as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        entriesByDayKey.set(key, Number(r.totalEntries) || 0);
      });
      
      console.log(`🔍 [OPERATION-API-DEBUG] Dados por dia:`, Object.fromEntries(byDayKey));

      // Gerar todos os dias do mês
      const daysInMonth = new Date(year, month!, 0).getDate(); // month! porque já validamos que não é null
      data = Array.from({ length: daysInMonth }, (_, idx) => {
        const day = idx + 1;
        const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayData = byDayKey.get(key) || { operacao: 0, totalValorFator: 0, totalValorAdValorem: 0, totalValorTarifas: 0, totalPIS: 0, totalCOFINS: 0, totalISSQN: 0 };
        const expensesData = expensesByDayKey.get(key) || 0;
        const entriesData = entriesByDayKey.get(key) || 0;
        
        // Cálculos DRE para cada dia
        const receitaBruta = dayData.totalValorFator + dayData.totalValorAdValorem + dayData.totalValorTarifas;
        const receitaLiquida = receitaBruta - dayData.totalCOFINS - dayData.totalISSQN;
        const resultadoBruto = receitaLiquida - expensesData;
        const resultadoLiquido = resultadoBruto + entriesData;
        
        return {
          period: `${day}/${String(month).padStart(2, "0")}/${year}`,
          operacao: dayData.operacao,
          totalValorFator: dayData.totalValorFator,
          totalValorAdValorem: dayData.totalValorAdValorem,
          totalValorTarifas: dayData.totalValorTarifas,
          totalPIS: dayData.totalPIS,
          totalCOFINS: dayData.totalCOFINS,
          totalISSQN: dayData.totalISSQN,
          totalExpenses: expensesData,
          totalEntries: entriesData,
          receitaBruta,
          receitaLiquida,
          resultadoBruto,
          resultadoLiquido,
          deduction: deductionValue,
          csll: csllValue,
          irpj: irpjValue,
        };
      });
    } else if (quarterlyParam) {
      // Normalizar para trimestres
      const byQuarterKey = new Map<number, any>();
      const expensesByQuarterKey = new Map<number, number>();
      const entriesByQuarterKey = new Map<number, number>();
      
      // Maps para dados manuais trimestrais
      const deductionByQuarterKey = new Map<number, number>();
      const csllByQuarterKey = new Map<number, number>();
      const irpjByQuarterKey = new Map<number, number>();
      
      // Processar dados manuais
      deductionRows.forEach((r: any) => {
        const quarterNum = quarter !== null ? quarter : Number(r.quarter);
        deductionByQuarterKey.set(quarterNum, Number(r.deduction) || 0);
      });
      
      csllRows.forEach((r: any) => {
        const quarterNum = Number(r.quarter);
        csllByQuarterKey.set(quarterNum, Number(r.csll) || 0);
      });
      
      irpjRows.forEach((r: any) => {
        const quarterNum = Number(r.quarter);
        irpjByQuarterKey.set(quarterNum, Number(r.irpj) || 0);
      });
      
      // Processar dados financeiros
      rows.forEach((r: any) => {
        const quarterNum = Number(r.period);
        byQuarterKey.set(quarterNum, {
          operacao: Number(r.operacao) || 0,
          totalValorFator: Number(r.totalValorFator) || 0,
          totalValorAdValorem: Number(r.totalValorAdValorem) || 0,
          totalValorTarifas: Number(r.totalValorTarifas) || 0,
          totalPIS: Number(r.totalPIS) || 0,
          totalCOFINS: Number(r.totalCOFINS) || 0,
          totalISSQN: Number(r.totalISSQN) || 0,
        });
      });
      
      // Processar despesas
      expensesRows.forEach((r: any) => {
        const quarterNum = Number(r.period);
        expensesByQuarterKey.set(quarterNum, Number(r.totalExpenses) || 0);
      });
      
      // Processar receitas
      entriesRows.forEach((r: any) => {
        const quarterNum = Number(r.period);
        entriesByQuarterKey.set(quarterNum, Number(r.totalEntries) || 0);
      });
      
      console.log(`🔍 [OPERATION-API-DEBUG] Dados por trimestre:`, Object.fromEntries(byQuarterKey));

      if (quarter !== null) {
        // Trimestre específico - retorna apenas 1 ponto
        const quarterData = byQuarterKey.get(quarter) || { operacao: 0, totalValorFator: 0, totalValorAdValorem: 0, totalValorTarifas: 0, totalPIS: 0, totalCOFINS: 0, totalISSQN: 0 };
        const expensesData = expensesByQuarterKey.get(quarter) || 0;
        const entriesData = entriesByQuarterKey.get(quarter) || 0;
        const deductionData = deductionByQuarterKey.get(quarter) || 0;
        const csllData = csllByQuarterKey.get(quarter) || 0;
        const irpjData = irpjByQuarterKey.get(quarter) || 0;
        
        // Cálculos DRE para o trimestre
        const receitaBruta = quarterData.totalValorFator + quarterData.totalValorAdValorem + quarterData.totalValorTarifas;
        const receitaLiquida = receitaBruta - quarterData.totalCOFINS - quarterData.totalISSQN;
        const resultadoBruto = receitaLiquida - expensesData;
        const resultadoLiquido = resultadoBruto + entriesData;
        
        data = [{
          period: `Q${quarter}/${year}`,
          operacao: quarterData.operacao,
          totalValorFator: quarterData.totalValorFator,
          totalValorAdValorem: quarterData.totalValorAdValorem,
          totalValorTarifas: quarterData.totalValorTarifas,
          totalPIS: quarterData.totalPIS,
          totalCOFINS: quarterData.totalCOFINS,
          totalISSQN: quarterData.totalISSQN,
          totalExpenses: expensesData,
          totalEntries: entriesData,
          receitaBruta,
          receitaLiquida,
          resultadoBruto,
          resultadoLiquido,
          deduction: deductionData,
          csll: csllData,
          irpj: irpjData,
        }];
      } else {
        // Todos os trimestres - retorna 4 pontos
        const quarters = ["Q1", "Q2", "Q3", "Q4"];
        data = quarters.map((label, idx) => {
          const quarterData = byQuarterKey.get(idx + 1) || { operacao: 0, totalValorFator: 0, totalValorAdValorem: 0, totalValorTarifas: 0, totalPIS: 0, totalCOFINS: 0, totalISSQN: 0 };
          const expensesData = expensesByQuarterKey.get(idx + 1) || 0;
          const entriesData = entriesByQuarterKey.get(idx + 1) || 0;
          const deductionData = deductionByQuarterKey.get(idx + 1) || 0;
          const csllData = csllByQuarterKey.get(idx + 1) || 0;
          const irpjData = irpjByQuarterKey.get(idx + 1) || 0;
          
          // Cálculos DRE para cada trimestre
          const receitaBruta = quarterData.totalValorFator + quarterData.totalValorAdValorem + quarterData.totalValorTarifas;
          const receitaLiquida = receitaBruta - quarterData.totalCOFINS - quarterData.totalISSQN;
          const resultadoBruto = receitaLiquida - expensesData;
          const resultadoLiquido = resultadoBruto + entriesData;
          
          return {
            period: `${label}/${year}`,
            operacao: quarterData.operacao,
            totalValorFator: quarterData.totalValorFator,
            totalValorAdValorem: quarterData.totalValorAdValorem,
            totalValorTarifas: quarterData.totalValorTarifas,
            totalPIS: quarterData.totalPIS,
            totalCOFINS: quarterData.totalCOFINS,
            totalISSQN: quarterData.totalISSQN,
            totalExpenses: expensesData,
            totalEntries: entriesData,
            receitaBruta,
            receitaLiquida,
            resultadoBruto,
            resultadoLiquido,
            deduction: deductionData,
            csll: csllData,
            irpj: irpjData,
          };
        });
      }
    } else {
      // Normalizar para meses (modo anual)
      const byMonthKey = new Map<string, any>();
      const expensesByMonthKey = new Map<string, number>();
      const entriesByMonthKey = new Map<string, number>();
      
      // Maps para dados manuais anuais (dedução mensal, impostos trimestrais)
      const deductionByMonthKey = new Map<number, number>();
      const csllByQuarterKey = new Map<number, number>();
      const irpjByQuarterKey = new Map<number, number>();
      
      // Processar dados manuais
      deductionRows.forEach((r: any) => {
        deductionByMonthKey.set(Number(r.month), Number(r.deduction) || 0);
      });
      
      csllRows.forEach((r: any) => {
        csllByQuarterKey.set(Number(r.quarter), Number(r.csll) || 0);
      });
      
      irpjRows.forEach((r: any) => {
        irpjByQuarterKey.set(Number(r.quarter), Number(r.irpj) || 0);
      });
      
      // Processar dados financeiros
      rows.forEach((r: any) => {
        const d = new Date(r.period as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonthKey.set(key, {
          operacao: Number(r.operacao) || 0,
          totalValorFator: Number(r.totalValorFator) || 0,
          totalValorAdValorem: Number(r.totalValorAdValorem) || 0,
          totalValorTarifas: Number(r.totalValorTarifas) || 0,
          totalPIS: Number(r.totalPIS) || 0,
          totalCOFINS: Number(r.totalCOFINS) || 0,
          totalISSQN: Number(r.totalISSQN) || 0,
        });
      });
      
      // Processar despesas
      expensesRows.forEach((r: any) => {
        const d = new Date(r.period as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        expensesByMonthKey.set(key, Number(r.totalExpenses) || 0);
      });
      
      // Processar receitas
      entriesRows.forEach((r: any) => {
        const d = new Date(r.period as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        entriesByMonthKey.set(key, Number(r.totalEntries) || 0);
      });
      
      console.log(`🔍 [OPERATION-API-DEBUG] Dados por mês:`, Object.fromEntries(byMonthKey));

      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      data = months.map((label, idx) => {
        const key = `${year}-${String(idx + 1).padStart(2, "0")}`;
        const monthData = byMonthKey.get(key) || { operacao: 0, totalValorFator: 0, totalValorAdValorem: 0, totalValorTarifas: 0, totalPIS: 0, totalCOFINS: 0, totalISSQN: 0 };
        const expensesData = expensesByMonthKey.get(key) || 0;
        const entriesData = entriesByMonthKey.get(key) || 0;
        const deductionData = deductionByMonthKey.get(idx + 1) || 0;
        const quarterForMonth = Math.ceil((idx + 1) / 3);
        const csllData = csllByQuarterKey.get(quarterForMonth) || 0;
        const irpjData = irpjByQuarterKey.get(quarterForMonth) || 0;
        
        // Cálculos DRE para cada mês
        const receitaBruta = monthData.totalValorFator + monthData.totalValorAdValorem + monthData.totalValorTarifas;
        const receitaLiquida = receitaBruta - monthData.totalCOFINS - monthData.totalISSQN;
        const resultadoBruto = receitaLiquida - expensesData;
        const resultadoLiquido = resultadoBruto + entriesData;
        
        return {
          period: `${label}/${year}`,
          operacao: monthData.operacao,
          totalValorFator: monthData.totalValorFator,
          totalValorAdValorem: monthData.totalValorAdValorem,
          totalValorTarifas: monthData.totalValorTarifas,
          totalPIS: monthData.totalPIS,
          totalCOFINS: monthData.totalCOFINS,
          totalISSQN: monthData.totalISSQN,
          totalExpenses: expensesData,
          totalEntries: entriesData,
          receitaBruta,
          receitaLiquida,
          resultadoBruto,
          resultadoLiquido,
          deduction: deductionData,
          csll: csllData,
          irpj: irpjData,
        };
      });
    }

    return NextResponse.json({ 
      data, 
      year, 
      month: month,
      quarter: quarter,
      monthly: monthlyParam,
      quarterly: quarterlyParam,
      period: monthlyParam 
        ? `${String(month).padStart(2, "0")}/${year}` 
        : quarterlyParam 
          ? (quarter !== null ? `Q${quarter}/${year}` : `Q1-Q4/${year}`)
          : `${year}`
    });
  } catch (error) {
    console.error("[OPERATION_SERIES]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


