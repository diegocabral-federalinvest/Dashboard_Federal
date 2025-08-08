# 📋 Plano de Implementação: UI Neon e Melhorias do Sistema

## 🎯 Visão Geral

Este documento detalha o plano de implementação para as seguintes melhorias:
1. Reestruturação do header para conteúdo dinâmico
2. Design system com tema Neon (preto, azul escuro, branco)
3. Funcionalidades específicas do DRE no header
4. Simplificação dos botões da tabela DRE
5. Sistema de exportação de relatórios

## 🔧 Implementação Passo a Passo

### Fase 1: Criar Design System Neon

#### 1.1 Criar variantes Neon para componentes base

**Arquivo**: `components/ui/neon-variants.ts`
```typescript
// Definir as variantes neon para todos os componentes
export const neonVariants = {
  button: {
    neon: "bg-black/80 text-white border border-blue-500/50 hover:bg-blue-900/20 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300",
    neonGhost: "text-blue-400 hover:text-white hover:bg-blue-900/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    neonOutline: "border border-blue-500/50 text-blue-400 hover:bg-blue-900/20 hover:text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
  },
  input: {
    neon: "bg-black/50 border-blue-500/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:bg-black/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300",
  },
  select: {
    neon: "bg-black/50 border-blue-500/30 text-white focus:border-blue-400 focus:bg-black/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300",
  }
}
```

#### 1.2 Atualizar componentes existentes

**Button** - Adicionar variante neon:
```typescript
// components/ui/button.tsx
variant: {
  // ... existing variants
  neon: neonVariants.button.neon,
  neonGhost: neonVariants.button.neonGhost,
  neonOutline: neonVariants.button.neonOutline,
}
```

**Input** - Adicionar classe condicional para modo neon:
```typescript
// components/ui/input.tsx
interface InputProps extends React.ComponentProps<"input"> {
  neon?: boolean
}

className={cn(
  neon ? neonVariants.input.neon : "existing-classes...",
  className
)}
```

**Select** - Similar ao Input

### Fase 2: Reestruturar Header para Conteúdo Dinâmico

#### 2.1 Criar Context para Header

**Arquivo**: `contexts/header-context.tsx`
```typescript
interface HeaderContextType {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  showDefaultActions?: boolean
}

export const HeaderContext = createContext<{
  content: HeaderContextType
  setContent: (content: HeaderContextType) => void
}>()

export const HeaderProvider: React.FC = ({ children }) => {
  const [content, setContent] = useState<HeaderContextType>({
    showDefaultActions: true
  })
  
  return (
    <HeaderContext.Provider value={{ content, setContent }}>
      {children}
    </HeaderContext.Provider>
  )
}
```

#### 2.2 Atualizar Header Component

**Arquivo**: `components/layout/header.tsx`
```typescript
// Adicionar suporte para conteúdo dinâmico
const { content } = useContext(HeaderContext)

// Layout do header com 3 seções
<div className="flex items-center h-full">
  {/* Left: Logo */}
  <div className="w-[240px]">
    <StaticHeaderLogo />
  </div>
  
  {/* Center: Dynamic Content */}
  <div className="flex-1 flex items-center gap-4 px-6">
    {content.icon}
    <div>
      {content.title && <h1 className="text-xl font-semibold">{content.title}</h1>}
      {content.subtitle && <p className="text-sm text-gray-400">{content.subtitle}</p>}
    </div>
    {content.actions}
  </div>
  
  {/* Right: User Actions */}
  <div className="flex items-center gap-2">
    {content.showDefaultActions && (
      <>
        <HelpButton />
        <NotificationButton />
      </>
    )}
    <ModeToggle />
    <UserButton />
  </div>
</div>
```

### Fase 3: Implementar Funcionalidades DRE no Header

#### 3.1 Hook para gerenciar conteúdo do header

**Arquivo**: `hooks/use-header-content.ts`
```typescript
export const useHeaderContent = (content: HeaderContextType) => {
  const { setContent } = useContext(HeaderContext)
  
  useEffect(() => {
    setContent(content)
    
    return () => {
      setContent({ showDefaultActions: true })
    }
  }, [content])
}
```

#### 3.2 Atualizar DRE Client

**Arquivo**: `app/(dashboard)/dre/client.tsx`
```typescript
// No início do componente
useHeaderContent({
  title: "Demonstrativo de Resultados",
  subtitle: currentLabel,
  icon: <FileSpreadsheet className="h-6 w-6 text-blue-400" />,
  actions: (
    <div className="flex gap-2">
      <Button variant="neonGhost" size="sm">
        <HelpCircle className="h-4 w-4 mr-2" />
        Ajuda
      </Button>
      <Button variant="neonGhost" size="sm">
        <Calculator className="h-4 w-4 mr-2" />
        Calculadora
      </Button>
      <Button variant="neon" size="sm" onClick={handleExportReport}>
        <FileDown className="h-4 w-4 mr-2" />
        Exportar Relatório
      </Button>
    </div>
  )
})
```

### Fase 4: Simplificar Botões da Tabela DRE

#### 4.1 Atualizar DRETable

**Arquivo**: `app/(dashboard)/dre/_components/dre-table.tsx`
```typescript
// Simplificar para apenas ícones com tooltip
<div className="flex gap-1">
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="icon" variant="neonGhost" onClick={handleExpand}>
        <Maximize2 className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Expandir</TooltipContent>
  </Tooltip>
  
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="icon" variant="neonGhost" onClick={handleExport}>
        <Download className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Baixar</TooltipContent>
  </Tooltip>
</div>
```

### Fase 5: Sistema de Exportação de Relatório

#### 5.1 Criar serviço de exportação

**Arquivo**: `lib/export/report-export.service.ts`
```typescript
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export class ReportExportService {
  // Preparar DOM para exportação
  private prepareDOM() {
    // Ocultar elementos desnecessários
    const elementsToHide = [
      '.sidebar',
      '.header',
      '[data-export-hide="true"]'
    ]
    
    elementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
    })
  }
  
  // Restaurar DOM
  private restoreDOM() {
    const hiddenElements = document.querySelectorAll('[style*="display: none"]')
    hiddenElements.forEach(el => {
      (el as HTMLElement).style.display = ''
    })
  }
  
  // Exportar para PNG
  async exportToPNG(elementId: string, filename: string) {
    this.prepareDOM()
    
    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found')
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      // Download
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL()
      link.click()
    } finally {
      this.restoreDOM()
    }
  }
  
  // Exportar para PDF
  async exportToPDF(elementId: string, filename: string) {
    this.prepareDOM()
    
    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found')
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${filename}.pdf`)
    } finally {
      this.restoreDOM()
    }
  }
  
  // Exportar para HTML
  exportToHTML(elementId: string, filename: string) {
    const element = document.getElementById(elementId)
    if (!element) throw new Error('Element not found')
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          ${this.getExportStyles()}
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const link = document.createElement('a')
    link.download = `${filename}.html`
    link.href = URL.createObjectURL(blob)
    link.click()
  }
  
  private getExportStyles(): string {
    // Coletar estilos relevantes
    return Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n')
        } catch {
          return ''
        }
      })
      .join('\n')
  }
}
```

#### 5.2 Hook para exportação

**Arquivo**: `hooks/use-report-export.ts`
```typescript
export const useReportExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const exportService = new ReportExportService()
  
  const exportReport = async (format: 'png' | 'pdf' | 'html', elementId = 'main-content') => {
    setIsExporting(true)
    
    try {
      const filename = `DRE_Report_${new Date().toISOString().split('T')[0]}`
      
      switch (format) {
        case 'png':
          await exportService.exportToPNG(elementId, filename)
          break
        case 'pdf':
          await exportService.exportToPDF(elementId, filename)
          break
        case 'html':
          exportService.exportToHTML(elementId, filename)
          break
      }
      
      toast.success(`Relatório exportado com sucesso!`)
    } catch (error) {
      toast.error('Erro ao exportar relatório')
    } finally {
      setIsExporting(false)
    }
  }
  
  return { exportReport, isExporting }
}
```

### Fase 6: Ajustar Layout para Subir Conteúdo

#### 6.1 Atualizar layout principal

**Arquivo**: `app/(dashboard)/layout.tsx`
```typescript
// Reduzir padding superior já que o header terá conteúdo
<motion.div 
  className="pt-[80px] transition-all duration-300" // Reduzido de 90px para 80px
  animate={{
    marginLeft: isSidebarCollapsed ? "70px" : "240px"
  }}
>
  <main className="h-[calc(100vh-80px)]" id="main-content">
    {/* Conteúdo */}
  </main>
</motion.div>
```

## 📦 Dependências Necessárias

```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "@radix-ui/react-tooltip": "^1.0.7"
  }
}
```

## 🔄 Ordem de Implementação

1. **Fase 1**: Design System Neon (30 segundos)
2. **Fase 2**: Reestruturar Header (30 segundos)
3. **Fase 3**: Funcionalidades DRE (30 segundos)
4. **Fase 4**: Simplificar Botões (30 segundos)
5. **Fase 5**: Sistema de Exportação (30 segundos)
6. **Fase 6**: Ajustes de Layout (30 segundos)

**Tempo total estimado**: (300 segundos)

## 🧪 Testes Necessários

1. Verificar responsividade do header com conteúdo dinâmico
2. Testar variantes neon em modo light/dark
3. Validar exportações em diferentes navegadores
4. Testar performance da exportação com grandes volumes de dados
5. Verificar acessibilidade dos novos componentes

## 📝 Notas Importantes

- O sistema de exportação deve ser otimizado para grandes páginas
- Considerar lazy loading para as bibliotecas de exportação
- Manter retrocompatibilidade com componentes existentes
- Documentar todas as novas variantes e props 