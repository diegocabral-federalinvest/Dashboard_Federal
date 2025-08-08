import { useGetDRE, DREData as ApiDREData } from "@/features/finance/api/use-get-dre";

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
    lucroPercentual: ChartData;
    resultadoComparativo: ChartData;
    impostos: ChartData;
    receitas: ChartData;
    // Novo gráfico para mostrar a evolução da receita
    evolucaoReceita: ChartData;
  }
  
  // Tipo para o período
  export interface Period {
    month?: number;
    quarter?: number;
    year: number | null; // Permite null para "todos os anos"
    deducaoFiscal?: number;
    periodType: "monthly" | "quarterly" | "annual";
  }
  
  // Trimestres para o seletor
  export const quarters = [
    { value: 1, label: "1º Trimestre (Jan-Mar)" },
    { value: 2, label: "2º Trimestre (Abr-Jun)" },
    { value: 3, label: "3º Trimestre (Jul-Set)" },
    { value: 4, label: "4º Trimestre (Out-Dez)" },
  ];
  
  // Chart options with improved styling
  export const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            
            // Verificar se o valor é válido (não é NaN, null ou undefined)
            let value = context.parsed;
            if (context.parsed.y !== undefined) {
              value = context.parsed.y;
            } else if (context.parsed.x !== undefined) {
              value = context.parsed.x;
            }
            
            if (value !== null && value !== undefined && !isNaN(value)) {
              label += new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(value);
            } else {
              label += 'R$ 0,00';
            }
            
            return label;
          }
        }
      }
    },
  };
  
  // Função para gerar uma chave de cache baseada no período
  export const generateCacheKey = (period: Period): string => {
    return `${period.periodType}_${period.year}_${period.quarter || period.month || 0}`;
  };
  
  // Adapter function - Transform API data to chart format
  export const transformDataForChart = (apiData: ApiDREData | null | undefined): DREChartData | null => {
    if (!apiData) return null;
    
    // Paleta de cores simplificada - apenas tons de azul, verde e vermelho
    const azulEscuro = 'rgba(30, 64, 175, 0.8)';     // Azul mais escuro
    const azulMedio = 'rgba(59, 130, 246, 0.7)';     // Azul médio
    const azulClaro = 'rgba(96, 165, 250, 0.6)';     // Azul claro
    const azulSuave = 'rgba(147, 197, 253, 0.5)';    // Azul mais suave
    const verde = 'rgba(16, 185, 129, 0.7)';         // Verde para resultados positivos
    const vermelho = 'rgba(239, 68, 68, 0.7)';       // Vermelho para despesas/impostos
    
    const borderAzulEscuro = azulEscuro.replace('0.8', '1');
    const borderAzulMedio = azulMedio.replace('0.7', '1');
    const borderAzulClaro = azulClaro.replace('0.6', '1');
    const borderAzulSuave = azulSuave.replace('0.5', '1');
    const borderVerde = verde.replace('0.7', '1');
    const borderVermelho = vermelho.replace('0.7', '1');
  
    // Calcular total da receita (soma fator, advalorem, iof e tarifas + dedução fiscal)
    const totalReceita = 
      apiData.receitas.total + 
      (apiData.deducaoFiscal || 0);
  
    // Calculate percentages for profit chart
    const totalRevenue = Math.max(apiData.receitas.total || 0, 1); // Prevent division by zero
    const profitMargin = isNaN(apiData.resultadoLiquido) ? 0 : (apiData.resultadoLiquido / totalRevenue) * 100;
    const expensePercentage = isNaN(apiData.despesas.total) ? 0 : (apiData.despesas.total / totalRevenue) * 100;
    const taxPercentage = ((apiData.impostos.ir || 0) + (apiData.impostos.csll || 0)) / totalRevenue * 100;
  
    // Prepare data for IRPJ and CSLL tax projections
    const irpjTax = apiData.impostos.ir || 0;
    const csllTax = apiData.impostos.csll || 0;
    const totalTax = irpjTax + csllTax;
    
    // Calculate what tax would be without deductions (for comparison)
    const resultadoBrutoSemDeducao = (apiData.resultadoBruto || 0) + (apiData.deducaoFiscal || 0);
    const irpjSemDeducao = Math.max(0, resultadoBrutoSemDeducao * 0.15);
    const csllSemDeducao = Math.max(0, resultadoBrutoSemDeducao * 0.09);
    const totalTaxSemDeducao = irpjSemDeducao + csllSemDeducao;
    const economiaFiscal = Math.max(0, totalTaxSemDeducao - totalTax);
    
    return {
      // Evolução da receita até o resultado líquido (tons de azul em gradação)
      evolucaoReceita: {
        labels: ['Receita Bruta', 'Receita Líquida', 'Resultado Bruto', 'Resultado Líquido'],
        datasets: [{
          label: 'Evolução dos Resultados',
          data: [
            totalReceita || 0, 
            apiData.resultadoBruto || 0, 
            apiData.resultadoOperacional || 0, 
            apiData.resultadoLiquido || 0
          ],
          backgroundColor: [azulEscuro, azulMedio, azulClaro, azulSuave],
          borderColor: [borderAzulEscuro, borderAzulMedio, borderAzulClaro, borderAzulSuave],
          borderWidth: 1
        }]
      },
      
      // Pie chart showing profit margin percentages (verde para lucro, vermelho para gastos)
      lucroPercentual: {
        labels: ['Lucro Líquido %', 'Despesas %', 'Impostos %'],
        datasets: [{
          label: 'Percentual',
          data: [
            isNaN(profitMargin) ? 0 : profitMargin, 
            isNaN(expensePercentage) ? 0 : expensePercentage, 
            isNaN(taxPercentage) ? 0 : taxPercentage
          ],
          backgroundColor: [verde, vermelho, azulMedio],
          borderColor: [borderVerde, borderVermelho, borderAzulMedio],
          borderWidth: 1
        }]
      },
      
      // Bar chart comparing revenue, expenses and net result (tons de azul)
      resultadoComparativo: {
        labels: ['Receita Bruta', 'Despesas Totais', 'Resultado Líquido'],
        datasets: [{
          label: 'Valores (R$)',
          data: [apiData.receitas.total, apiData.despesas.total, apiData.resultadoLiquido],
          backgroundColor: [azulEscuro, azulMedio, azulClaro],
          borderColor: [borderAzulEscuro, borderAzulMedio, borderAzulClaro],
          borderWidth: 1
        }]
      },
      
      // Tax analysis chart - IRPJ and CSLL projections (tons de azul)
      impostos: {
        labels: ['IRPJ (15%)', 'CSLL (9%)', 'Total Impostos', 'Economia com Deduções'],
        datasets: [{
          label: 'Projeção de Impostos (R$)',
          data: [
            isNaN(irpjTax) ? 0 : irpjTax, 
            isNaN(csllTax) ? 0 : csllTax, 
            isNaN(totalTax) ? 0 : totalTax, 
            isNaN(economiaFiscal) ? 0 : economiaFiscal
          ],
          backgroundColor: [azulEscuro, azulMedio, azulClaro, verde],
          borderColor: [borderAzulEscuro, borderAzulMedio, borderAzulClaro, borderVerde],
          borderWidth: 1
        }]
      },
      
      // Revenue composition - tons de azul para composição de receita
      receitas: {
        labels: ['Fator', 'AdValorem', 'Tarifas', 'Dedução Fiscal'],
        datasets: [{
          label: 'Composição de Receita Bruta (R$)',
          data: [
            isNaN(apiData.custos.fator) ? 0 : apiData.custos.fator,
            isNaN(apiData.custos.adValorem) ? 0 : apiData.custos.adValorem,
            isNaN(apiData.custos.tarifas) ? 0 : apiData.custos.tarifas,
            isNaN(apiData.deducaoFiscal) ? 0 : (apiData.deducaoFiscal || 0)
          ],
          backgroundColor: [azulEscuro, azulMedio, azulClaro, azulSuave],
          borderColor: [borderAzulEscuro, borderAzulMedio, borderAzulClaro, borderAzulSuave],
          borderWidth: 1
        }]
      }
    };
  };