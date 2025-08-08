"use client";

import { useState, useMemo } from "react";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Investment } from "../api/use-get-investment";
import { useInvestmentReturn } from "../hooks/use-investment-return";
import { useInvestmentFilter } from "../hooks/use-investment-filter";
import { formatCurrency } from "@/lib/utils";

// Types for the investment flow records
interface InvestmentFlowRecord {
  id: string;
  date: Date;
  investorId: string;
  investorName: string;
  initialBalance: number;
  contributionAmount: number;
  totalContributed: number;
  balancePlusContribution: number;
  returnRate: number;
  returnAmount: number;
  totalReturn: number;
  finalBalance: number;
  isPeriodEnd?: boolean;
}

interface InvestmentContributionsTableProps {
  investments: Investment[];
}

export function InvestmentContributionsTable({ investments }: InvestmentContributionsTableProps) {
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const { getUniqueInvestors } = useInvestmentFilter(investments);
  const { calculateReturn } = useInvestmentReturn();
  const uniqueInvestors = getUniqueInvestors;
  
  // Process investments to create flow records with running totals
  const investmentFlowRecords = useMemo(() => {
    if (!investments || investments.length === 0) return [];
    
    // Filter by selected investors if any are selected
    const filteredInvestments = selectedInvestors.length > 0
      ? investments.filter(inv => selectedInvestors.includes(inv.investorId))
      : investments;
    
    // Sort investments by date
    const sortedInvestments = [...filteredInvestments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Track running totals by investor
    const investorBalances: Record<string, {
      lastBalance: number;
      totalContributed: number;
      totalReturn: number;
    }> = {};
    
    // Create flow records with running calculations
    const records: InvestmentFlowRecord[] = [];
    
    for (let i = 0; i < sortedInvestments.length; i++) {
      const investment = sortedInvestments[i];
      const nextInvestment = sortedInvestments[i + 1];
      
      // Initialize investor record if it doesn't exist
      if (!investorBalances[investment.investorId]) {
        investorBalances[investment.investorId] = {
          lastBalance: 0,
          totalContributed: 0,
          totalReturn: 0
        };
      }
      
      const investorBalance = investorBalances[investment.investorId];
      
      // Get investment value as number
      const investmentValue = typeof investment.value === 'string' 
        ? parseFloat(investment.value) 
        : investment.value;
      
      // Calculate contribution amounts (negative for withdrawals)
      const contributionAmount = investment.status === 'withdrawn' 
        ? -investmentValue 
        : investmentValue;
      
      // Update running totals
      const initialBalance = investorBalance.lastBalance;
      investorBalance.totalContributed += contributionAmount;
      const totalContributed = investorBalance.totalContributed;
      
      // Calculate balance plus contribution
      const balancePlusContribution = initialBalance + contributionAmount;
      
      // Calculate return - if withdrawn, no returns are generated
      let returnAmount = 0;
      
      if (investment.status !== 'withdrawn') {
        // Calculate returns from this investment's date to the next investment date
        const returnEndDate = nextInvestment 
          ? new Date(nextInvestment.date) 
          : new Date(); // Use current date if this is the last investment
        
        const returns = calculateReturn(investment, {
          currentDate: returnEndDate,
          useCustomRate: true
        });
        
        returnAmount = returns.earned;
      }
      
      // Update total return
      investorBalance.totalReturn += returnAmount;
      const totalReturn = investorBalance.totalReturn;
      
      // Calculate final balance
      const finalBalance = totalContributed + totalReturn;
      
      // Update last balance for next record
      investorBalance.lastBalance = finalBalance;
      
      // Create record
      records.push({
        id: investment.id,
        date: new Date(investment.date),
        investorId: investment.investorId,
        investorName: investment.investorName,
        initialBalance,
        contributionAmount,
        totalContributed,
        balancePlusContribution,
        returnRate: investment.returnRate,
        returnAmount,
        totalReturn,
        finalBalance,
        isPeriodEnd: i === sortedInvestments.length - 1
      });
    }
    
    return records;
  }, [investments, selectedInvestors, calculateReturn]);
  
  // Pagination logic
  const paginatedRecords = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return investmentFlowRecords.slice(startIndex, endIndex);
  }, [investmentFlowRecords, page, pageSize]);
  
  const totalPages = Math.ceil(investmentFlowRecords.length / pageSize);
  
  // Handle investor selection
  const handleInvestorSelection = (value: string) => {
    if (value === "all") {
      setSelectedInvestors([]);
    } else {
      setSelectedInvestors([value]);
    }
    setPage(1); // Reset to first page when changing selection
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Tabela De Aportes E Retiradas
        </CardTitle>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
          <Select onValueChange={handleInvestorSelection}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Selecione os investidores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os investidores</SelectItem>
              {uniqueInvestors.map((investor) => (
                <SelectItem key={investor.id} value={investor.id}>
                  {investor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Investidor</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold text-right">Caixa(I)</TableHead>
                  <TableHead className="font-semibold text-right">Aporte</TableHead>
                  <TableHead className="font-semibold text-right">Total Aportado</TableHead>
                  <TableHead className="font-semibold text-right">Caixa(I) + Aporte</TableHead>
                  <TableHead className="font-semibold text-right">Retorno(1.2%)</TableHead>
                  <TableHead className="font-semibold text-right">Total Retornado</TableHead>
                  <TableHead className="font-semibold text-right">Caixa (F)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => (
                    <TableRow 
                      key={record.id}
                      className={record.isPeriodEnd ? "bg-slate-50" : ""}
                    >
                      <TableCell>{record.investorName}</TableCell>
                      <TableCell>{format(record.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.initialBalance)}</TableCell>
                      <TableCell className="text-right">
                        <span className={record.contributionAmount < 0 ? "text-red-600" : ""}>
                          {formatCurrency(record.contributionAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(record.totalContributed)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.balancePlusContribution)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.returnAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.totalReturn)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(record.finalBalance)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Exibindo {investmentFlowRecords.length > 0 ? (page - 1) * pageSize + 1 : 0}-
            {Math.min(page * pageSize, investmentFlowRecords.length)} de {investmentFlowRecords.length}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Linhas por Página</p>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <span className="sr-only">Primeira página</span>
                <ChevronFirst className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                <span className="sr-only">Última página</span>
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 