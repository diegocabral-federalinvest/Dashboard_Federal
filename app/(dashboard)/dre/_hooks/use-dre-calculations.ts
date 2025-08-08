"use client";

import { useMemo } from "react";
import { DREData } from "@/features/finance/api/use-get-dre";

export const useDRECalculations = (data: DREData | null) => {
  // Cálculo das métricas financeiras
  const financialMetrics = useMemo(() => {
    if (!data) return null;

    const lucroPercentual = data.resultadoLiquido / data.receitas.total * 100;
    const margemBruta = data.resultadoBruto / data.receitas.total * 100;
    const margemOperacional = data.resultadoOperacional / data.receitas.total * 100;
    const impostoTotal = 
      data.impostos.pis + 
      data.impostos.cofins + 
      data.impostos.issqn + 
      data.impostos.ir + 
      data.impostos.csll;
    const impostoPercentual = impostoTotal / data.receitas.total * 100;
    
    return {
      lucroPercentual: parseFloat(lucroPercentual.toFixed(2)),
      margemBruta: parseFloat(margemBruta.toFixed(2)),
      margemOperacional: parseFloat(margemOperacional.toFixed(2)),
      impostoTotal,
      impostoPercentual: parseFloat(impostoPercentual.toFixed(2))
    };
  }, [data]);

  // Dados para gráficos do DRE
  const chartData = useMemo(() => {
    if (!data || !financialMetrics) return null;

    return {
      lucroPercentual: {
        labels: ['Lucro', 'Impostos', 'Despesas', 'Custos'],
        datasets: [
          {
            label: 'Percentual de Lucro',
            data: [
              financialMetrics.lucroPercentual,
              financialMetrics.impostoPercentual,
              (data.despesas.total / data.receitas.total * 100).toFixed(2),
              ((data.custos.fator + data.custos.adValorem + data.custos.iof) / data.receitas.total * 100).toFixed(2)
            ],
            backgroundColor: [
              'rgba(22, 163, 74, 0.7)',
              'rgba(220, 38, 38, 0.7)',
              'rgba(59, 130, 246, 0.7)',
              'rgba(234, 179, 8, 0.7)'
            ],
            borderColor: [
              'rgb(22, 163, 74)',
              'rgb(220, 38, 38)',
              'rgb(59, 130, 246)',
              'rgb(234, 179, 8)'
            ],
            borderWidth: 1
          }
        ]
      },
      resultadoComparativo: {
        labels: ['Receita Bruta', 'Receita Líquida', 'Resultado Bruto', 'Resultado Líquido'],
        datasets: [
          {
            label: 'Valores',
            data: [
              data.receitas.total,
              data.resultadoBruto,
              data.resultadoOperacional,
              data.resultadoLiquido
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        ]
      },
      impostos: {
        labels: ['PIS', 'COFINS', 'ISSQN', 'IRPJ', 'CSLL'],
        datasets: [
          {
            label: 'Impostos',
            data: [
              data.impostos.pis,
              data.impostos.cofins,
              data.impostos.issqn,
              data.impostos.ir,
              data.impostos.csll
            ],
            backgroundColor: [
              'rgba(220, 38, 38, 0.5)',
              'rgba(220, 38, 38, 0.6)',
              'rgba(220, 38, 38, 0.7)',
              'rgba(220, 38, 38, 0.8)',
              'rgba(220, 38, 38, 0.9)'
            ],
            borderColor: 'rgb(220, 38, 38)',
            borderWidth: 1
          }
        ]
      },
      receitas: {
        labels: ['Operações', 'Outras Receitas'],
        datasets: [
          {
            label: 'Composição da Receita',
            data: [data.receitas.operacoes, data.receitas.outras],
            backgroundColor: [
              'rgba(22, 163, 74, 0.7)',
              'rgba(234, 179, 8, 0.7)'
            ],
            borderColor: [
              'rgb(22, 163, 74)',
              'rgb(234, 179, 8)'
            ],
            borderWidth: 1
          }
        ]
      }
    };
  }, [data, financialMetrics]);

  // Configurações padrão para os gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            
            if (label === 'Percentual de Lucro') {
              return `${value}%`;
            }
            
            return new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(value);
          }
        }
      }
    }
  };

  return {
    financialMetrics,
    chartData,
    chartOptions
  };
}; 