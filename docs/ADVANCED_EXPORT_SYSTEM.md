# 📊 Sistema de Exportação Avançado - Federal Invest

## 🎯 Visão Geral

O Federal Invest agora conta com um sistema de exportação avançado que gera **PDFs e PNGs profissionais** com layout bonito, logo da empresa e cores do brand. O sistema substitui as exportações simples anteriores por relatórios de alta qualidade.

## ✨ Características Principais

### 🎨 Design Profissional
- **Logo da empresa** integrado no cabeçalho
- **Cores azul escura** seguindo o brand Federal Invest
- **Layout responsivo** com cards 2x2 + gráfico embaixo
- **Tipografia moderna** com fonte Inter
- **Efeitos visuais** com gradientes e sombras

### 📁 Formatos Disponíveis
- **PDF Avançado**: Relatório profissional completo
- **PNG de Alta Qualidade**: Imagem para apresentações
- **PDF Simples**: Tabela básica (mantido para compatibilidade)
- **Excel**: Planilha para análise
- **CSV**: Dados brutos

### 🎯 Funcionalidades
- **Cards informativos** com dados principais
- **Gráficos integrados** usando Chart.js
- **Informações do período** no cabeçalho
- **Footer com timestamp** e branding
- **Dados em tempo real** extraídos da aplicação

---

## 🏗️ Arquitetura

### Serviço Principal
```typescript
// lib/services/advanced-export-service.ts
export class AdvancedExportService {
  // Exporta para PDF com layout profissional
  async exportToPDF(data: ExportData, fileName: string): Promise<void>
  
  // Exporta para PNG de alta qualidade  
  async exportToPNG(data: ExportData, fileName: string): Promise<void>
}
```

### Interfaces TypeScript
```typescript
export interface ExportData {
  title: string;              // Título principal
  subtitle?: string;          // Subtítulo opcional
  period: string;             // Período do relatório
  cards: ExportCard[];        // Cards com dados principais
  chart?: ExportChart;        // Gráfico opcional
  additionalInfo?: string;    // Informações adicionais
  showLogo?: boolean;         // Mostrar logo da empresa
}

export interface ExportCard {
  title: string;              // Título do card
  value: string;              // Valor principal (ex: "R$ 150.000,00")
  description?: string;       // Descrição opcional
  trend?: 'up' | 'down' | 'neutral';  // Tendência
  trendValue?: string;        // Valor da tendência (ex: "+15%")
  color?: 'blue' | 'green' | 'yellow' | 'red';  // Cor do card
}

export interface ExportChart {
  title: string;              // Título do gráfico
  data: any;                  // Dados do Chart.js
  type: 'bar' | 'line' | 'pie' | 'doughnut';  // Tipo do gráfico
  height?: number;            // Altura do gráfico
}
```

---

## 🚀 Como Usar

### 1. No DRE (Já Implementado)

O DRE já possui o novo sistema integrado com 5 opções de exportação:

```typescript
// app/(dashboard)/dre/client-refactored.tsx

// Preparar dados dos cards
const prepareExportCards = useMemo((): ExportCard[] => {
  if (!effectiveData) return [];

  return [
    {
      title: "Receita Total",
      value: formatCurrency(effectiveData.receitas.total),
      description: "Soma de todas as receitas do período",
      trend: effectiveData.receitas.total >= 0 ? 'up' : 'down',
      color: 'blue'
    },
    // ... mais cards
  ];
}, [effectiveData]);

// Usar as funções de exportação
const handleAdvancedPDF = async () => {
  await exportToAdvancedPDF({
    fileName: `DRE_Avancado_${periodType}_${year}`,
    title: "Demonstrativo de Resultados do Exercício",
    subtitle: "Relatório Financeiro Profissional",
    period: periodLabel,
    cards: prepareExportCards,
    chart: prepareExportChart,
    additionalInfo: "Dados gerados automaticamente..."
  });
};
```

### 2. No Dashboard

```typescript
// app/_hooks/index.ts

// Exportar dashboard como PDF
export const handleExportDashboard = async () => {
  const exportData: ExportData = {
    title: "Dashboard Financeiro",
    subtitle: "Federal Invest - Gestão Financeira",
    period: `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    cards: extractedCards,
    chart: chartData,
    showLogo: true
  };

  await advancedExportService.exportToPDF(exportData, fileName);
};

// Exportar dashboard como PNG
export const handleExportDashboardPNG = async () => {
  // Similar ao PDF, mas gera imagem
  await advancedExportService.exportToPNG(exportData, fileName);
};
```

### 3. Em Outros Componentes

```typescript
import { advancedExportService, ExportData } from "@/lib/services/advanced-export-service";

const handleCustomExport = async () => {
  const exportData: ExportData = {
    title: "Meu Relatório",
    period: "Janeiro 2024",
    cards: [
      {
        title: "Vendas",
        value: "R$ 50.000,00",
        color: 'green'
      }
    ],
    showLogo: true
  };

  // Escolher o formato
  await advancedExportService.exportToPDF(exportData, "meu-relatorio");
  // ou
  await advancedExportService.exportToPNG(exportData, "meu-relatorio");
};
```

---

## 🎨 Personalização

### Cores da Empresa
```typescript
// lib/services/advanced-export-service.ts
export const COMPANY_COLORS = {
  primary: '#3B82F6',        // Azul primário
  darkBlue: '#0A192F',       // Azul escuro Federal Invest
  lightBlue: '#3A86FF',      // Azul claro
  background: '#F8FAFC',     // Fundo claro
  cardBackground: '#FFFFFF', // Fundo dos cards
  // ... mais cores
};
```

### Layout dos Cards
O layout segue o padrão **2x2** (4 cards principais) + gráfico embaixo:
```
┌─────────────┬─────────────┐
│   Card 1    │   Card 2    │
├─────────────┼─────────────┤
│   Card 3    │   Card 4    │
└─────────────┴─────────────┘
┌─────────────────────────────┐
│         Gráfico             │
└─────────────────────────────┘
```

### Estilos CSS
O serviço gera CSS inline com:
- **Fonte**: Inter, sistema padrão
- **Cores**: Gradient azul escuro no header
- **Cards**: Fundo branco com borda colorida no topo
- **Gráficos**: Integração com Chart.js
- **Footer**: Azul escuro com timestamp

---

## 🔧 Dependências

### NPM Packages Necessários
```json
{
  "html2canvas": "^1.4.1",    // Captura de tela
  "jspdf": "^2.5.1",          // Geração de PDF
  "file-saver": "^2.0.5",     // Download de arquivos
  "chart.js": "^4.0.0"        // Gráficos (já instalado)
}
```

### Importações Principais
```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
```

---

## 📱 Interface do Usuário

### Dialog de Exportação Avançado
O novo dialog (`AdvancedExportDialog`) oferece:

#### ✨ Relatórios Profissionais
- **PDF Avançado** (badge "Novo")
- **PNG de Alta Qualidade** (badge "Novo")

#### 📊 Formatos Tradicionais  
- **PDF Simples** (badge "Clássico")
- **Excel**
- **CSV**

### Cores dos Botões
- **PDF Avançado**: Vermelho (`bg-red-50`)
- **PNG**: Roxo (`bg-purple-50`)
- **PDF Simples**: Cinza (`bg-gray-50`)
- **Excel**: Verde (`bg-green-50`)
- **CSV**: Azul (`bg-blue-50`)

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Canvas não renderiza
```typescript
// Aguardar carregamento dos gráficos
private async waitForCharts(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 2000); // 2 segundos
  });
}
```

#### 2. HTML não encontrado
```typescript
// Verificar se elemento existe
const tempDiv = document.createElement('div');
if (!tempDiv) {
  throw new Error('Não foi possível criar elemento temporário');
}
```

#### 3. Erro de CORS
```typescript
// Configurar html2canvas
const canvas = await html2canvas(element, {
  useCORS: true,           // Permitir CORS
  allowTaint: false,       // Não permitir imagens externas
  backgroundColor: '#fff'   // Fundo branco padrão
});
```

### Debug
```typescript
// Ativar logs detalhados
console.log('Exportando:', exportData);
console.log('Canvas gerado:', canvas.width, 'x', canvas.height);
```

---

## 🚀 Próximas Melhorias

### Planejadas
- [ ] **Múltiplas páginas** para PDFs longos
- [ ] **Temas personalizáveis** (claro/escuro)
- [ ] **Marca d'água** opcional
- [ ] **Compressão de imagens** para PDFs menores
- [ ] **Templates salvos** para reutilização
- [ ] **Agenda de exportação** automática

### Em Consideração
- [ ] **PowerPoint** export
- [ ] **Word** export  
- [ ] **Envio por email** direto
- [ ] **Cloud storage** integration
- [ ] **Watermarks** personalizadas

---

## 📝 Exemplos de Uso

### DRE Trimestral
```typescript
const dreData: ExportData = {
  title: "DRE - 1º Trimestre 2024",
  subtitle: "Demonstração de Resultados",
  period: "Janeiro a Março de 2024",
  cards: [
    { title: "Receita Total", value: "R$ 500.000,00", color: 'blue' },
    { title: "Custos", value: "R$ 200.000,00", color: 'red' },
    { title: "Lucro Bruto", value: "R$ 300.000,00", color: 'green' },
    { title: "Lucro Líquido", value: "R$ 240.000,00", color: 'green' }
  ],
  chart: {
    title: "Evolução Mensal",
    type: 'bar',
    data: chartData
  }
};
```

### Dashboard Executivo
```typescript
const dashboardData: ExportData = {
  title: "Dashboard Executivo",
  subtitle: "Visão Geral do Negócio",
  period: "Dezembro 2024",
  cards: [
    { title: "Faturamento", value: "R$ 1.2M", trend: 'up', trendValue: "+15%" },
    { title: "Clientes Ativos", value: "1,247", trend: 'up', trendValue: "+8%" },
    { title: "Margem", value: "32%", trend: 'neutral', trendValue: "0%" },
    { title: "ROI", value: "18%", trend: 'up', trendValue: "+3%" }
  ]
};
```

---

## 🎉 Conclusão

O sistema de exportação avançado transforma relatórios simples em **documentos profissionais** dignos de apresentações executivas. Com layout bonito, cores da marca e dados em tempo real, o Federal Invest agora oferece exportações de **qualidade enterprise**.

### Benefícios Principais:
✅ **Visual profissional** com logo e cores da empresa  
✅ **Layout otimizado** com cards e gráficos  
✅ **Múltiplos formatos** (PDF/PNG/Excel/CSV)  
✅ **Dados em tempo real** da aplicação  
✅ **Fácil integração** em qualquer componente  
✅ **Performance otimizada** com cache e lazy loading  

---

**🎯 O resultado são relatórios que impressionam e agregam valor real ao negócio!** 