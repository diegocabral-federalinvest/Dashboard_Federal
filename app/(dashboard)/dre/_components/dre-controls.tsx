"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';

interface DREControlsProps {
  onPeriodChange?: (period: any) => void;
}

export const DREControls: React.FC<DREControlsProps> = ({ onPeriodChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  
  // Get current values from URL or use defaults
  const periodo = searchParams.get("periodo") || "trimestral";
  const ano = parseInt(searchParams.get("ano") || currentYear.toString());
  const trimestre = parseInt(searchParams.get("trimestre") || currentQuarter.toString());
  const mes = parseInt(searchParams.get("mes") || (new Date().getMonth() + 1).toString());
  
  // Generate options for selects
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const quarters = [1, 2, 3, 4];
  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" }
  ];

  // Handle period type change
  const handlePeriodChange = (value: string) => {
    updateURL({ periodo: value });
  };

  // Handle year change
  const handleYearChange = (value: string) => {
    updateURL({ ano: value });
  };

  // Handle quarter change
  const handleQuarterChange = (value: string) => {
    updateURL({ trimestre: value });
  };

  // Handle month change
  const handleMonthChange = (value: string) => {
    updateURL({ mes: value });
  };

  // Update URL with new parameters
  const updateURL = (params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Update parameters
    Object.keys(params).forEach(key => {
      current.set(key, params[key]);
    });
    
    // Create new URL
    const search = current.toString();
    const query = search ? `?${search}` : "";
    
    // Update URL
    router.push(`/dre${query}`);
    
    // Notify parent component if callback provided
    if (onPeriodChange) {
      onPeriodChange({
        periodType: current.get("periodo") || "trimestral",
        year: parseInt(current.get("ano") || currentYear.toString()),
        quarter: parseInt(current.get("trimestre") || currentQuarter.toString()),
        month: parseInt(current.get("mes") || (new Date().getMonth() + 1).toString())
      });
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 shadow-sm border-blue-200 dark:border-blue-900">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Seletor de Período */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Período</label>
            <Select defaultValue={periodo} onValueChange={handlePeriodChange}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Selecione o período..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Ano */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
            <Select defaultValue={ano.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Selecione o ano..." />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Trimestre (mostrado apenas quando o período é trimestral) */}
          {periodo === "trimestral" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trimestre</label>
              <Select defaultValue={trimestre.toString()} onValueChange={handleQuarterChange}>
                <SelectTrigger className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Selecione o trimestre..." />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter.toString()}>
                      {quarter}º Trimestre
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Seletor de Mês (mostrado apenas quando o período é mensal) */}
          {periodo === "mensal" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mês</label>
              <Select defaultValue={mes.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Selecione o mês..." />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botão de Atualizar */}
          <div className="flex items-end">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => router.refresh()}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 