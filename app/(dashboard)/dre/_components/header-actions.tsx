"use client"

import React, { memo } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HelpCircle, Calculator, FileDown, Loader2 } from "lucide-react"

interface DREHeaderActionsProps {
  exportReport: (format: 'png' | 'pdf' | 'html') => void
  isExportingReport: boolean
}

export const DREHeaderActions = memo(({ exportReport, isExportingReport }: DREHeaderActionsProps) => {
  return (
    <div className="flex gap-2">
      
      <Button variant="neonGhost" size="sm">
        <Calculator className="h-4 w-4 mr-2" />
        Calculadora
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="neon" 
            size="sm" 
            disabled={isExportingReport}
          >
            {isExportingReport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Exportar Relatório
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportReport('pdf')}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportReport('png')}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PNG
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportReport('html')}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar HTML
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})

DREHeaderActions.displayName = "DREHeaderActions" 