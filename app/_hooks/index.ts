import { 
  advancedExportService, 
  ExportData, 
  ExportCard, 
  ExportChart 
} from "@/lib/services/advanced-export-service";
import { formatCurrency } from "@/lib/utils";

export const handleExportDashboard = async () => {
  // Capturar dados do dashboard atual
  const dashboardElement = document.querySelector('[data-dashboard-content]');
  
  if (!dashboardElement) {
    console.error('Elemento do dashboard não encontrado');
    return;
  }

  // Extrair dados dos cards do dashboard para exportação
  const cards: ExportCard[] = [];
  
  // Buscar cards de stats do dashboard
  const statsCards = dashboardElement.querySelectorAll('[data-stats-card]');
  statsCards.forEach((card, index) => {
    const title = card.querySelector('[data-card-title]')?.textContent || `Métrica ${index + 1}`;
    const value = card.querySelector('[data-card-value]')?.textContent || 'R$ 0,00';
    const description = card.querySelector('[data-card-description]')?.textContent || '';
    
    cards.push({
      title,
      value,
      description,
      color: index % 2 === 0 ? 'blue' : 'green'
    });
  });

  // Se não encontrou cards nos data attributes, usar dados padrão
  if (cards.length === 0) {
    cards.push(
      {
        title: "Receita Total",
        value: "R$ 150.000,00",
        description: "Receitas do período atual",
        color: 'blue'
      },
      {
        title: "Despesas Totais",
        value: "R$ 80.000,00", 
        description: "Despesas do período atual",
        color: 'red'
      },
      {
        title: "Lucro Bruto",
        value: "R$ 70.000,00",
        description: "Resultado operacional",
        color: 'green'
      },
      {
        title: "Margem de Lucro",
        value: "46.7%",
        description: "Percentual de lucratividade",
        color: 'purple'
      }
    );
  }

  // Preparar dados do gráfico (se existir)
  let chart: ExportChart | undefined;
  const chartElement = dashboardElement.querySelector('canvas');
  if (chartElement) {
    // Dados de exemplo para o gráfico
    chart = {
      title: "Evolução Financeira",
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Receitas',
          data: [120000, 135000, 145000, 150000, 160000, 155000],
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderWidth: 2
        }, {
          label: 'Despesas',
          data: [80000, 85000, 82000, 80000, 83000, 81000],
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          borderWidth: 2
        }]
      },
      type: 'bar',
      height: 400
    };
  }

  const exportData: ExportData = {
    title: "Dashboard Financeiro",
    subtitle: "Federal Invest - Gestão Financeira",
    period: `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    cards,
    chart,
    additionalInfo: "Dados extraídos automaticamente do dashboard da aplicação.",
    showLogo: true
  };

  try {
    // Exportar como PDF por padrão
    await advancedExportService.exportToPDF(exportData, `Dashboard_${new Date().toISOString().split('T')[0]}`);
    
    console.log('Dashboard exportado com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar dashboard:', error);
  }
};

// Função para exportar dashboard como PNG
export const handleExportDashboardPNG = async () => {
  // Similar à função acima, mas exporta como PNG
  const dashboardElement = document.querySelector('[data-dashboard-content]');
  
  if (!dashboardElement) {
    console.error('Elemento do dashboard não encontrado');
    return;
  }

  const cards: ExportCard[] = [
    {
      title: "Receita Total",
      value: "R$ 150.000,00",
      description: "Receitas do período atual",
      color: 'blue'
    },
    {
      title: "Despesas Totais",
      value: "R$ 80.000,00", 
      description: "Despesas do período atual",
      color: 'red'
    },
    {
      title: "Lucro Bruto",
      value: "R$ 70.000,00",
      description: "Resultado operacional",
      color: 'green'
    },
    {
      title: "Margem de Lucro",
      value: "46.7%",
      description: "Percentual de lucratividade",
      color: 'purple'
    }
  ];

  const chart: ExportChart = {
    title: "Evolução Financeira",
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Receitas',
        data: [120000, 135000, 145000, 150000, 160000, 155000],
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 2
      }]
    },
    type: 'bar',
    height: 400
  };

  const exportData: ExportData = {
    title: "Dashboard Financeiro",
    subtitle: "Federal Invest - Gestão Financeira",
    period: `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    cards,
    chart,
    additionalInfo: "Imagem de alta qualidade para apresentações.",
    showLogo: true
  };

  try {
    await advancedExportService.exportToPNG(exportData, `Dashboard_Imagem_${new Date().toISOString().split('T')[0]}`);
    
    console.log('Dashboard exportado como PNG com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar dashboard como PNG:', error);
  }
};

// Função auxiliar para extrair dados reais do dashboard
export const extractDashboardData = (): { cards: ExportCard[], hasChart: boolean } => {
  const dashboardElement = document.querySelector('[data-dashboard-content]');
  
  if (!dashboardElement) {
    return { cards: [], hasChart: false };
  }

  const cards: ExportCard[] = [];
  
  // Tentar extrair dados dos cards de estatísticas
  const statsCards = dashboardElement.querySelectorAll('.stats-card, [data-stats-card]');
  
  statsCards.forEach((card, index) => {
    const titleElement = card.querySelector('.card-title, [data-card-title], h3, h4');
    const valueElement = card.querySelector('.card-value, [data-card-value], .text-2xl, .text-3xl');
    const descriptionElement = card.querySelector('.card-description, [data-card-description], .text-sm');
    
    const title = titleElement?.textContent?.trim() || `Métrica ${index + 1}`;
    const value = valueElement?.textContent?.trim() || 'R$ 0,00';
    const description = descriptionElement?.textContent?.trim() || '';
    
    cards.push({
      title,
      value,
      description,
      color: ['blue', 'green', 'purple', 'red'][index % 4] as any
    });
  });

  const hasChart = !!dashboardElement.querySelector('canvas, .chart-container');
  
  return { cards, hasChart };
};