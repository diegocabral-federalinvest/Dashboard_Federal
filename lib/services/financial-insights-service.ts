import { db } from '@/db/drizzle';
import { sql } from 'drizzle-orm';

export interface FinancialInsight {
  key: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  percentageChange?: number;
}

export class FinancialInsightsService {
  /**
   * Obtém o dia com o maior valor total de operações
   */
  static async getDayWithHighestOperationValue(): Promise<FinancialInsight> {
    // Consulta SQL para encontrar o dia com maior valor total de operações
    const result = await db.execute(sql`
      SELECT 
        DATE(data_operacao) as dia,
        SUM(valor_operacao) as valor_total
      FROM 
        financial_data
      GROUP BY 
        dia
      ORDER BY 
        valor_total DESC
      LIMIT 1;
    `);
    
    const data = (result as unknown as { dia: string; valor_total: number }[])[0];
    
    if (!data) {
      return {
        key: 'day-highest-value',
        title: 'Dia com Maior Volume',
        value: 'Sem dados',
        description: 'Nenhuma operação registrada',
      };
    }
    
    // Converter data para formato mais amigável
    const date = new Date(data.dia);
    const formattedDate = date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
    
    return {
      key: 'day-highest-value',
      title: 'Dia com Maior Volume',
      value: formattedDate,
      description: `R$ ${data.valor_total.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    };
  }
  
  /**
   * Obtém a distribuição de operações por tipo
   */
  static async getOperationTypeDistribution(): Promise<FinancialInsight[]> {
    const result = await db.execute(sql`
      SELECT 
        tipo_operacao,
        COUNT(*) as quantidade,
        SUM(valor_operacao) as valor_total
      FROM 
        financial_data
      GROUP BY 
        tipo_operacao
      ORDER BY 
        valor_total DESC;
    `);
    
    const data = result as unknown as { tipo_operacao: string; quantidade: number; valor_total: number }[];
    
    if (!data || data.length === 0) {
      return [{
        key: 'operation-type-empty',
        title: 'Distribuição por Tipo',
        value: 'Sem dados',
        description: 'Nenhuma operação registrada',
      }];
    }
    
    // Calcular valores totais para percentuais
    const totalOperations = data.reduce((sum, item) => sum + Number(item.quantidade), 0);
    const totalValue = data.reduce((sum, item) => sum + Number(item.valor_total), 0);
    
    return data.map(item => ({
      key: `type-${item.tipo_operacao}`,
      title: item.tipo_operacao || 'Sem tipo',
      value: Number(item.quantidade),
      description: `R$ ${Number(item.valor_total).toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`,
      percentageChange: Number(item.valor_total) / totalValue * 100
    }));
  }
  
  /**
   * Obtém análise de tendência mensal das operações
   */
  static async getMonthlyTrend(): Promise<FinancialInsight[]> {
    const result = await db.execute(sql`
      SELECT 
        EXTRACT(YEAR FROM data_operacao) || '-' || EXTRACT(MONTH FROM data_operacao) as mes,
        SUM(valor_operacao) as valor_total,
        COUNT(*) as quantidade
      FROM 
        financial_data
      WHERE
        data_operacao >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
      GROUP BY 
        mes
      ORDER BY 
        mes ASC;
    `);
    
    const data = result as unknown as { mes: string; valor_total: number; quantidade: number }[];
    
    if (!data || data.length === 0) {
      return [{
        key: 'monthly-trend-empty',
        title: 'Tendência Mensal',
        value: 'Sem dados',
        description: 'Nenhuma operação registrada',
      }];
    }
    
    // Calcular tendências
    return data.map((item, index) => {
      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      let percentageChange = 0;
      
      if (index > 0) {
        const prevValue = Number(data[index - 1].valor_total);
        const currentValue = Number(item.valor_total);
        
        if (prevValue > 0) {
          percentageChange = ((currentValue - prevValue) / prevValue) * 100;
          trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral';
        }
      }
      
      // Formatar nome do mês
      const [year, month] = item.mes.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      const formattedMonth = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      return {
        key: `month-${item.mes}`,
        title: formattedMonth,
        value: Number(item.valor_total).toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }),
        description: `${Number(item.quantidade)} operações`,
        trend,
        percentageChange
      };
    });
  }
  
  /**
   * Obtém todos os insights financeiros consolidados
   */
  static async getAllInsights(): Promise<{
    dayWithHighestValue: FinancialInsight;
    operationTypes: FinancialInsight[];
    monthlyTrend: FinancialInsight[];
  }> {
    const [
      dayWithHighestValue,
      operationTypes,
      monthlyTrend
    ] = await Promise.all([
      this.getDayWithHighestOperationValue(),
      this.getOperationTypeDistribution(),
      this.getMonthlyTrend()
    ]);
    
    return {
      dayWithHighestValue,
      operationTypes,
      monthlyTrend
    };
  }
} 