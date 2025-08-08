import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  backgroundColor?: string;
  scale?: number;
}

export class ChartExportService {
  /**
   * Exporta gráfico como PNG
   */
  static async exportToPNG(
    element: HTMLElement, 
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = `federal-invest-chart-${Date.now()}`,
        backgroundColor = '#ffffff',
        scale = 2
      } = options;

      const canvas = await html2canvas(element, {
        backgroundColor,
        scale,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 0,
        removeContainer: true,
        logging: false,
      });

      // Criar link de download
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      throw new Error('Falha ao exportar como PNG');
    }
  }

  /**
   * Exporta gráfico como PDF profissional
   */
  static async exportToPDF(
    element: HTMLElement,
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = `federal-invest-dashboard-${Date.now()}`,
        title = 'Dashboard Financeiro',
        subtitle = 'Relatório de Desempenho',
        includeHeader = true,
        includeFooter = true,
        backgroundColor = '#ffffff',
        scale = 2
      } = options;

      // Criar canvas do gráfico
      const canvas = await html2canvas(element, {
        backgroundColor,
        scale,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 0,
        removeContainer: true,
        logging: false,
      });

      // Criar PDF em formato landscape A4
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = 297;
      const pageHeight = 210;
      
      // Configurações de layout
      const margin = 15;
      const headerHeight = includeHeader ? 30 : 0;
      const footerHeight = includeFooter ? 25 : 0;
      const contentHeight = pageHeight - headerHeight - footerHeight - (margin * 2);
      
      // Calcular dimensões do gráfico
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, contentHeight);
      const imgY = headerHeight + margin;

      if (includeHeader) {
        // Header com gradient azul Federal Invest
        const headerGradient = pdf.internal.pageSize.getWidth();
        pdf.setFillColor(10, 25, 47); // federal-dark-blue
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');

        // Logo/Marca Federal Invest
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.text('FEDERAL INVEST', margin, 16);
        
        // Subtitle da empresa
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(200, 220, 255);
        pdf.text('Soluções financeiras para o seu negócio', margin, 22);

        // Título do relatório
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text(title, pageWidth / 2, 16, { align: 'center' });
        
        // Subtitle do relatório
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(200, 220, 255);
        pdf.text(subtitle, pageWidth / 2, 22, { align: 'center' });

        // Data e hora do relatório
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(180, 200, 255);
        pdf.text(`Gerado em: ${dateStr}`, pageWidth - margin, 16, { align: 'right' });
        pdf.text(`Horário: ${timeStr}`, pageWidth - margin, 22, { align: 'right' });
      }

      // Adicionar o gráfico
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', margin, imgY, imgWidth, imgHeight);

      // Adicionar informações complementares se houver espaço
      const remainingSpace = contentHeight - imgHeight;
      if (remainingSpace > 20) {
        const infoY = imgY + imgHeight + 10;
        
        // Box de informações
        pdf.setFillColor(248, 250, 252); // gray-50
        pdf.rect(margin, infoY, imgWidth, remainingSpace - 10, 'F');
        
        // Borda sutil
        pdf.setDrawColor(226, 232, 240); // gray-300
        pdf.setLineWidth(0.5);
        pdf.rect(margin, infoY, imgWidth, remainingSpace - 10);
        
        // Texto de informações
        pdf.setTextColor(71, 85, 105); // gray-600
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        
        const infoText = [
          '📊 Este relatório apresenta a evolução financeira com base nos dados mais recentes.',
          '💡 Utilize os filtros de período para análises específicas.',
          '📈 As métricas incluem receitas, despesas, resultados e impostos detalhados.',
        ];
        
        infoText.forEach((text, index) => {
          pdf.text(text, margin + 5, infoY + 8 + (index * 6));
        });
      }

      if (includeFooter) {
        // Footer com accent color
        const footerY = pageHeight - footerHeight;
        pdf.setFillColor(58, 134, 255); // federal-accent
        pdf.rect(0, footerY, pageWidth, footerHeight, 'F');

        // Informações da empresa no footer
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('Federal Invest', margin, footerY + 8);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text('Dashboard Financeiro • Relatório Automatizado', margin, footerY + 15);
        pdf.text('www.federalinvest.com.br', margin, footerY + 20);

        // Número da página e timestamp
        pdf.setTextColor(220, 230, 255);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text('Página 1', pageWidth - margin, footerY + 8, { align: 'right' });
        pdf.text(`Documento: ${filename}`, pageWidth - margin, footerY + 15, { align: 'right' });

        // Status do documento
        pdf.setFillColor(34, 197, 94); // green-500
        pdf.circle(pageWidth - 35, footerY + 18, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.text('ATIVO', pageWidth - 30, footerY + 20);
      }

      // Adicionar metadados ao PDF
      pdf.setProperties({
        title: `${title} - Federal Invest`,
        subject: 'Relatório Financeiro Automatizado',
        author: 'Federal Invest',
        creator: 'Federal Invest Dashboard',
        keywords: 'dashboard, financeiro, relatório, federal invest'
      });

      // Salvar o PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw new Error('Falha ao exportar como PDF');
    }
  }

  /**
   * Exporta screenshot da tela inteira sem sidebar/header
   */
  static async exportScreenshot(
    excludeSelectors: string[] = ['.sidebar', '.header', '.nav'],
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = `federal-invest-screenshot-${Date.now()}`,
        backgroundColor = '#ffffff',
        scale = 1.5
      } = options;

      // Temporariamente ocultar elementos indesejados
      const hiddenElements: { element: HTMLElement; originalDisplay: string }[] = [];
      
      excludeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          hiddenElements.push({
            element: htmlEl,
            originalDisplay: htmlEl.style.display
          });
          htmlEl.style.display = 'none';
        });
      });

      // Aguardar um frame para aplicar as mudanças
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Capturar a tela
      const canvas = await html2canvas(document.body, {
        backgroundColor,
        scale,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      // Restaurar elementos ocultos
      hiddenElements.forEach(({ element, originalDisplay }) => {
        element.style.display = originalDisplay;
      });

      // Download da imagem
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erro ao capturar screenshot:', error);
      throw new Error('Falha ao capturar screenshot');
    }
  }

  /**
   * Detecta o melhor formato baseado no conteúdo
   */
  static detectOptimalFormat(element: HTMLElement): 'png' | 'pdf' {
    const rect = element.getBoundingClientRect();
    const aspectRatio = rect.width / rect.height;
    
    // Se o gráfico for muito largo ou muito alto, PDF é melhor
    if (aspectRatio > 2 || aspectRatio < 0.5) {
      return 'pdf';
    }
    
    // Para gráficos normais, PNG é mais adequado
    return 'png';
  }

  /**
   * Exporta com formato automático
   */
  static async exportAuto(
    element: HTMLElement,
    options: ExportOptions = {}
  ): Promise<void> {
    const format = this.detectOptimalFormat(element);
    
    if (format === 'pdf') {
      await this.exportToPDF(element, options);
    } else {
      await this.exportToPNG(element, options);
    }
  }
} 