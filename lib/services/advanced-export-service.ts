"use client";

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

// Cores da empresa baseadas no globals.css
export const COMPANY_COLORS = {
  primary: '#3B82F6', // Azul primário
  darkBlue: '#0A192F', // Azul escuro da empresa
  lightBlue: '#3A86FF', // Azul claro da empresa  
  background: '#F8FAFC', // Fundo claro
  cardBackground: '#FFFFFF', // Fundo dos cards
  text: '#1E293B', // Texto escuro
  textSecondary: '#64748B', // Texto secundário
  border: '#E2E8F0', // Bordas
  success: '#10B981', // Verde
  warning: '#F59E0B', // Amarelo
  danger: '#EF4444', // Vermelho
  gradient: {
    from: '#0A192F',
    to: '#1E293B'
  }
};

// Logo da empresa em base64 (convertido do SVG)
const COMPANY_LOGO_SVG = `<svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="150" height="150" rx="20" fill="#0A192F"/>
  <path d="M30 40H120V55H30V40Z" fill="#3A86FF"/>
  <path d="M30 65H120V80H30V65Z" fill="#3A86FF"/>
  <path d="M30 90H120V105H30V90Z" fill="#3A86FF"/>
  <circle cx="75" cy="72" r="50" stroke="#3A86FF" stroke-width="4" fill="none"/>
  <path d="M50 40L75 120L100 40" stroke="#3A86FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

export interface ExportCard {
  title: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export interface ExportChart {
  title: string;
  data: any;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  height?: number;
}

export interface ExportData {
  title: string;
  subtitle?: string;
  period: string;
  cards: ExportCard[];
  chart?: ExportChart;
  additionalInfo?: string;
  showLogo?: boolean;
}

export class AdvancedExportService {
  private static instance: AdvancedExportService;

  public static getInstance(): AdvancedExportService {
    if (!AdvancedExportService.instance) {
      AdvancedExportService.instance = new AdvancedExportService();
    }
    return AdvancedExportService.instance;
  }

  // Gerar o HTML do relatório
  private generateReportHTML(data: ExportData): string {
    const cardsHTML = this.generateCardsHTML(data.cards);
    const chartHTML = data.chart ? this.generateChartHTML(data.chart) : '';
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.title}</title>
          <style>${this.getReportStyles()}</style>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="report-header">
              ${data.showLogo !== false ? `
                <div class="logo-container">
                  ${COMPANY_LOGO_SVG}
                </div>
              ` : ''}
              <div class="header-content">
                <h1 class="report-title">${data.title}</h1>
                ${data.subtitle ? `<h2 class="report-subtitle">${data.subtitle}</h2>` : ''}
                <p class="report-period">${data.period}</p>
              </div>
            </div>

            <!-- Cards Grid -->
            <div class="cards-grid">
              ${cardsHTML}
            </div>

            <!-- Chart Section -->
            ${chartHTML}

            <!-- Additional Info -->
            ${data.additionalInfo ? `
              <div class="additional-info">
                <p>${data.additionalInfo}</p>
              </div>
            ` : ''}

            <!-- Footer -->
            <div class="report-footer">
              <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p>Federal Invest - Gestão Financeira</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Gerar HTML dos cards
  private generateCardsHTML(cards: ExportCard[]): string {
    return cards.map(card => {
      const colorClass = this.getCardColorClass(card.color);
      const trendIcon = this.getTrendIcon(card.trend);
      
      return `
        <div class="card ${colorClass}">
          <div class="card-header">
            <h3 class="card-title">${card.title}</h3>
            ${card.icon ? `<div class="card-icon">${card.icon}</div>` : ''}
          </div>
          <div class="card-value">${card.value}</div>
          ${card.description ? `<p class="card-description">${card.description}</p>` : ''}
          ${card.trend && card.trendValue ? `
            <div class="card-trend ${card.trend}">
              ${trendIcon}
              <span>${card.trendValue}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Gerar HTML do gráfico
  private generateChartHTML(chart: ExportChart): string {
    const chartId = `chart-${Date.now()}`;
    const height = chart.height || 400;
    
    return `
      <div class="chart-container">
        <h3 class="chart-title">${chart.title}</h3>
        <div class="chart-wrapper" style="height: ${height}px;">
          <canvas id="${chartId}" width="800" height="${height}"></canvas>
        </div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('${chartId}');
            if (ctx) {
              new Chart(ctx, ${JSON.stringify(this.getChartConfig(chart))});
            }
          });
        </script>
      </div>
    `;
  }

  // Configuração do gráfico
  private getChartConfig(chart: ExportChart): any {
    const baseConfig = {
      type: chart.type,
      data: chart.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              }
            }
          }
        },
        elements: {
          bar: {
            borderRadius: 8,
            borderSkipped: false
          }
        }
      }
    };

    // Configurações específicas por tipo
    if (chart.type === 'bar' || chart.type === 'line') {
      (baseConfig.options as any).scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: COMPANY_COLORS.border
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, sans-serif'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, sans-serif'
            }
          }
        }
      };
    }

    return baseConfig;
  }

  // Estilos CSS do relatório
  private getReportStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, ${COMPANY_COLORS.gradient.from} 0%, ${COMPANY_COLORS.gradient.to} 100%);
        color: ${COMPANY_COLORS.text};
        line-height: 1.6;
        padding: 40px 20px;
      }

      .report-container {
        max-width: 1200px;
        margin: 0 auto;
        background: ${COMPANY_COLORS.cardBackground};
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .report-header {
        background: linear-gradient(135deg, ${COMPANY_COLORS.darkBlue} 0%, ${COMPANY_COLORS.primary} 100%);
        color: white;
        padding: 40px;
        display: flex;
        align-items: center;
        gap: 30px;
      }

      .logo-container {
        flex-shrink: 0;
      }

      .logo-container svg {
        width: 80px;
        height: 80px;
        border-radius: 12px;
      }

      .header-content {
        flex: 1;
      }

      .report-title {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 8px;
        letter-spacing: -0.025em;
      }

      .report-subtitle {
        font-size: 1.25rem;
        font-weight: 500;
        opacity: 0.9;
        margin-bottom: 4px;
      }

      .report-period {
        font-size: 1rem;
        opacity: 0.8;
        font-weight: 400;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        padding: 40px;
        background: ${COMPANY_COLORS.background};
      }

      .card {
        background: ${COMPANY_COLORS.cardBackground};
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        border: 1px solid ${COMPANY_COLORS.border};
        position: relative;
        overflow: hidden;
      }

      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${COMPANY_COLORS.lightBlue}, ${COMPANY_COLORS.primary});
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .card-title {
        font-size: 1rem;
        font-weight: 600;
        color: ${COMPANY_COLORS.textSecondary};
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .card-icon {
        width: 24px;
        height: 24px;
        opacity: 0.6;
      }

      .card-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: ${COMPANY_COLORS.text};
        margin-bottom: 8px;
        letter-spacing: -0.02em;
      }

      .card-description {
        font-size: 0.875rem;
        color: ${COMPANY_COLORS.textSecondary};
        margin-bottom: 16px;
      }

      .card-trend {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .card-trend.up {
        color: ${COMPANY_COLORS.success};
      }

      .card-trend.down {
        color: ${COMPANY_COLORS.danger};
      }

      .card-trend.neutral {
        color: ${COMPANY_COLORS.textSecondary};
      }

      .card.blue::before {
        background: linear-gradient(90deg, ${COMPANY_COLORS.primary}, ${COMPANY_COLORS.lightBlue});
      }

      .card.green::before {
        background: linear-gradient(90deg, ${COMPANY_COLORS.success}, #34D399);
      }

      .card.yellow::before {
        background: linear-gradient(90deg, ${COMPANY_COLORS.warning}, #FBBF24);
      }

      .card.red::before {
        background: linear-gradient(90deg, ${COMPANY_COLORS.danger}, #F87171);
      }

      .chart-container {
        padding: 40px;
        background: ${COMPANY_COLORS.cardBackground};
      }

      .chart-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: ${COMPANY_COLORS.text};
        margin-bottom: 24px;
        text-align: center;
      }

      .chart-wrapper {
        background: ${COMPANY_COLORS.cardBackground};
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border: 1px solid ${COMPANY_COLORS.border};
      }

      .additional-info {
        padding: 30px 40px;
        background: ${COMPANY_COLORS.background};
        border-top: 1px solid ${COMPANY_COLORS.border};
      }

      .additional-info p {
        font-size: 0.875rem;
        color: ${COMPANY_COLORS.textSecondary};
        text-align: center;
      }

      .report-footer {
        background: ${COMPANY_COLORS.darkBlue};
        color: white;
        padding: 24px 40px;
        text-align: center;
        font-size: 0.875rem;
        opacity: 0.9;
      }

      .report-footer p:first-child {
        margin-bottom: 4px;
      }

      @media print {
        body {
          background: white;
          padding: 0;
        }
        
        .report-container {
          box-shadow: none;
          border-radius: 0;
        }
        
        .card {
          break-inside: avoid;
        }
      }
    `;
  }

  // Utilitários
  private getCardColorClass(color?: string): string {
    return color || 'blue';
  }

  private getTrendIcon(trend?: string): string {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'neutral':
        return '➡️';
      default:
        return '';
    }
  }

  // Exportar para PDF
  public async exportToPDF(data: ExportData, fileName: string): Promise<void> {
    try {
      const htmlContent = this.generateReportHTML(data);
      
      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '1200px';
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);

      // Aguardar o carregamento dos gráficos
      await this.waitForCharts(tempDiv);

      // Capturar como imagem
      const canvas = await html2canvas(tempDiv.querySelector('.report-container') as HTMLElement, {
        width: 1200,
        height: tempDiv.offsetHeight,
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${fileName}.pdf`);

      // Limpar
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  }

  // Exportar para PNG
  public async exportToPNG(data: ExportData, fileName: string): Promise<void> {
    try {
      const htmlContent = this.generateReportHTML(data);
      
      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '1200px';
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);

      // Aguardar o carregamento dos gráficos
      await this.waitForCharts(tempDiv);

      // Capturar como imagem
      const canvas = await html2canvas(tempDiv.querySelector('.report-container') as HTMLElement, {
        width: 1200,
        height: tempDiv.offsetHeight,
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Baixar PNG
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${fileName}.png`);
        }
      }, 'image/png');

      // Limpar
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      throw error;
    }
  }

  // Aguardar carregamento dos gráficos
  private async waitForCharts(container: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const charts = container.querySelectorAll('canvas');
      if (charts.length === 0) {
        resolve();
        return;
      }

      // Aguardar um tempo para os gráficos renderizarem
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }
}

// Export singleton instance
export const advancedExportService = AdvancedExportService.getInstance(); 