"use client";

import { useState } from "react";
import { Calendar, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { InvestorMultiSelect } from "./investor-multi-select";

export interface InvestmentFilters {
  search?: string;
  dateRange?: DateRange;
  type?: "aporte" | "retirada" | "all";
  status?: "active" | "completed" | "withdrawn" | "all";
  investorId?: string;
  minValue?: number;
  maxValue?: number;
}

interface InvestmentFiltersProps {
  filters: InvestmentFilters;
  onFiltersChange: (filters: InvestmentFilters) => void;
  investors: Array<{ id: string; name: string }>;
  className?: string;
}

export function InvestmentFilters({
  filters,
  onFiltersChange,
  investors,
  className = "",
}: InvestmentFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof InvestmentFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.dateRange?.from ||
      filters.type !== "all" ||
      filters.status !== "all" ||
      filters.investorId ||
      filters.minValue ||
      filters.maxValue
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange?.from) count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.investorId) count++;
    if (filters.minValue) count++;
    if (filters.maxValue) count++;
    return count;
  };

  return (
    <Card className={`border-2 border-slate-500 dark:border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-8 px-2 text-xs"
            >
              {showAdvancedFilters ? "Menos filtros" : "Mais filtros"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Nome do investidor..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <DateRangePicker
              value={filters.dateRange || { from: undefined, to: undefined }}
              onValueChange={(range) => updateFilter("dateRange", range)}
              placeholder="Selecione o período"
            />
          </div>

          {/* Tipo de Operação */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => updateFilter("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="aporte">💰 Aportes</SelectItem>
                <SelectItem value="retirada">📤 Retiradas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">🟢 Ativo</SelectItem>
                <SelectItem value="completed">🔵 Concluído</SelectItem>
                <SelectItem value="withdrawn">🔴 Retirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros Avançados */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Investidor */}
            <div className="space-y-2">
              <Label htmlFor="investor">Investidor</Label>
              <InvestorMultiSelect
                value={filters.investorId || "all"}
                onChange={(value) => updateFilter("investorId", value === "all" ? undefined : value)}
                placeholder="Todos os investidores"
              />
            </div>

            {/* Valor Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="minValue">Valor Mínimo (R$)</Label>
              <Input
                id="minValue"
                type="number"
                placeholder="Digite o valor mínimo"
                value={filters.minValue || ""}
                onChange={(e) => updateFilter("minValue", e.target.value ? Number(e.target.value) : undefined)}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Valor Máximo */}
            <div className="space-y-2">
              <Label htmlFor="maxValue">Valor Máximo (R$)</Label>
              <Input
                id="maxValue"
                type="number"
                placeholder="Digite o valor máximo"
                value={filters.maxValue || ""}
                onChange={(e) => updateFilter("maxValue", e.target.value ? Number(e.target.value) : undefined)}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        )}

        {/* Filtros Ativos */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Busca: "{filters.search}"
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("search", "")}
                  />
                </Badge>
              )}
              
              {filters.dateRange?.from && (
                <Badge variant="secondary" className="gap-1">
                  Período: {format(filters.dateRange.from, "dd/MM/yy", { locale: ptBR })}
                  {filters.dateRange.to && ` - ${format(filters.dateRange.to, "dd/MM/yy", { locale: ptBR })}`}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("dateRange", { from: undefined, to: undefined })}
                  />
                </Badge>
              )}
              
              {filters.type && filters.type !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Tipo: {filters.type === "aporte" ? "Aportes" : "Retiradas"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("type", "all")}
                  />
                </Badge>
              )}
              
              {filters.status && filters.status !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("status", "all")}
                  />
                </Badge>
              )}
              
              {filters.investorId && (
                <Badge variant="secondary" className="gap-1">
                  Investidor: {investors.find(i => i.id === filters.investorId)?.name || "Desconhecido"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("investorId", undefined)}
                  />
                </Badge>
              )}
              
              {(filters.minValue || filters.maxValue) && (
                <Badge variant="secondary" className="gap-1">
                  Valor: R$ {filters.minValue || 0} - R$ {filters.maxValue || "∞"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      updateFilter("minValue", undefined);
                      updateFilter("maxValue", undefined);
                    }}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 