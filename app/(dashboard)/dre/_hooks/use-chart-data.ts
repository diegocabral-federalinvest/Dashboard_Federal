import { useMemo } from "react";
import { DREData } from "@/features/finance/api/use-get-dre";

// Define the expected chart data structure
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string | string[];
    borderWidth: number;
  }[];
}

export interface DREChartData {
  evolucaoReceita: ChartData;
  lucroPercentual: ChartData;
  resultadoComparativo: ChartData;
  impostos: ChartData;
  receitas: ChartData;
}

// Cores padrão para os gráficos - variações de azul
const CHART_COLORS = {
  blue1: {
    main: 'rgba(54, 162, 235, 0.6)', // Azul padrão
    border: 'rgba(54, 162, 235, 1)'
  },
  blue2: {
    main: 'rgba(30, 64, 175, 0.6)', // Azul escuro
    border: 'rgba(30, 64, 175, 1)'
  },
  blue3: {
    main: 'rgba(59, 130, 246, 0.6)', // Azul médio
    border: 'rgba(59, 130, 246, 1)'
  },
  blue4: {
    main: 'rgba(96, 165, 250, 0.6)', // Azul claro
    border: 'rgba(96, 165, 250, 1)'
  },
  blue5: {
    main: 'rgba(147, 197, 253, 0.6)', // Azul mais claro
    border: 'rgba(147, 197, 253, 1)'
  },
  teal1: {
    main: 'rgba(20, 184, 166, 0.6)', // Teal
    border: 'rgba(20, 184, 166, 1)'
  },
  teal2: {
    main: 'rgba(45, 212, 191, 0.6)', // Teal claro
    border: 'rgba(45, 212, 191, 1)'
  },
  white: {
    main: 'rgba(255, 255, 255, 0.8)', // Branco para contraste
    border: 'rgba(255, 255, 255, 1)'
  }
};

// Options padrão para os gráficos
export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(context.parsed);
          }
          return label;
        }
      }
    }
  },
};

// Dereference para facilitar uso
const { blue1, blue2, blue3, blue4, blue5, teal1, teal2, white } = CHART_COLORS;

// Hook para preparar os dados para os gráficos
export const useChartData = (dreData: DREData | null | undefined): {
  data: DREChartData | null;
  isLoading: boolean;
  error: Error | null;
} => {
  // Memorizar os dados transformados
  const chartData = useMemo(() => {
    if (!dreData) return null;

    // Calcular total da receita (soma fator, advalorem, iof e tarifas + dedução fiscal)
    const totalReceita = 
      dreData.receitas.total + 
      (dreData.deducaoFiscal || 0);
  
    // Calculate percentages for profit chart
    const totalRevenue = dreData.receitas.total || 1; // Prevent division by zero
    const profitMargin = (dreData.resultadoLiquido / totalRevenue) * 100;
    const expensePercentage = (dreData.despesas.total / totalRevenue) * 100;
    const taxPercentage = ((dreData.impostos.ir + dreData.impostos.csll) / totalRevenue) * 100;
  
    // Prepare data for IRPJ and CSLL tax projections
    const irpjTax = dreData.impostos.ir;
    const csllTax = dreData.impostos.csll;
    const totalTax = irpjTax + csllTax;
    
    // Calculate what tax would be without deductions (for comparison)
    const resultadoBrutoSemDeducao = dreData.resultadoBruto + (dreData.deducaoFiscal || 0);
    const irpjSemDeducao = Math.max(0, resultadoBrutoSemDeducao * 0.15);
    const csllSemDeducao = Math.max(0, resultadoBrutoSemDeducao * 0.09);
    const totalTaxSemDeducao = irpjSemDeducao + csllSemDeducao;
    const economiaFiscal = totalTaxSemDeducao - totalTax;
    
    // Criar objeto base de chart data
    const result: DREChartData = {
      // Evolução da receita até o resultado líquido (gráfico de barras)
      evolucaoReceita: {
        labels: ['Receita Bruta', 'Receita Líquida', 'Resultado Bruto', 'Resultado Líquido'],
        datasets: [{
          label: 'Evolução dos Resultados',
          data: [totalReceita, dreData.resultadoBruto, dreData.resultadoOperacional, dreData.resultadoLiquido],
          backgroundColor: [blue1.main, blue2.main, blue3.main, blue4.main],
          borderColor: [blue1.border, blue2.border, blue3.border, blue4.border],
          borderWidth: 1
        }]
      },
      
      // Pie chart showing profit margin percentages
      lucroPercentual: {
        labels: ['Lucro Líquido %', 'Despesas %', 'Impostos %'],
        datasets: [{
          label: 'Percentual',
          data: [profitMargin, expensePercentage, taxPercentage],
          backgroundColor: [blue1.main, blue3.main, blue5.main],
          borderColor: [blue1.border, blue3.border, blue5.border],
          borderWidth: 1
        }]
      },
      
      // Bar chart comparing revenue, expenses and net result
      resultadoComparativo: {
        labels: ['Receita Bruta', 'Despesas Totais', 'Resultado Líquido'],
        datasets: [{
          label: 'Valores (R$)',
          data: [dreData.receitas.total, dreData.despesas.total, dreData.resultadoLiquido],
          backgroundColor: [blue1.main, blue3.main, blue4.main],
          borderColor: [blue1.border, blue3.border, blue4.border],
          borderWidth: 1
        }]
      },
      
      // Tax analysis chart - IRPJ and CSLL projections
      impostos: {
        labels: ['IRPJ (15%)', 'CSLL (9%)', 'Total Impostos', 'Economia com Deduções'],
        datasets: [{
          label: 'Projeção de Impostos (R$)',
          data: [irpjTax, csllTax, totalTax, economiaFiscal],
          backgroundColor: [blue2.main, blue3.main, blue4.main, teal1.main],
          borderColor: [blue2.border, blue3.border, blue4.border, teal1.border],
          borderWidth: 1
        }]
      },
      
      // Revenue composition - composição da receita bruta
      receitas: {
        labels: ['Valor Fator', 'Valor AdValorem', 'Valor Tarifas', 'Dedução Fiscal'],
        datasets: [{
          label: 'Composição de Receita Bruta (R$)',
          data: [
            dreData.custos.fator,
            dreData.custos.adValorem,
            dreData.custos.tarifas,
            dreData.deducaoFiscal || 0
          ],
          backgroundColor: [blue1.main, blue3.main, blue5.main, teal2.main],
          borderColor: [blue1.border, blue3.border, blue5.border, teal2.border],
          borderWidth: 1
        }]
      }
    };

    return result;
  }, [dreData]);

  return {
    data: chartData,
    isLoading: false,
    error: null
  };
}; 