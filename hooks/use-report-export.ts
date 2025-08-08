"use client"

import { useState, useCallback, useMemo } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ReportExportService } from "@/lib/export/report-export.service"

export const useReportExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  
  // Memoize the export service instance
  const exportService = useMemo(() => new ReportExportService(), [])
  
  // Memoize the export function to prevent re-creation on every render
  const exportReport = useCallback(async (
    format: 'png' | 'pdf' | 'html', 
    elementId = 'main-content'
  ) => {
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
      
      toast({
        title: "Relatório exportado com sucesso!",
        description: `O arquivo ${filename}.${format} foi baixado.`,
        duration: 3000
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Erro ao exportar relatório",
        description: "Ocorreu um erro ao exportar o relatório. Tente novamente.",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsExporting(false)
    }
  }, [exportService, toast])
  
  return { exportReport, isExporting }
} 