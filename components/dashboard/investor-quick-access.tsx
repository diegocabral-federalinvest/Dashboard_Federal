"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  TrendingUp, 
  Eye, 
  ArrowRight, 
  Wallet,
  BarChart3 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInvestmentReturn } from "@/features/investments/hooks/use-investment-return";
import { Investment } from "@/features/investments/api/use-get-investment";

interface InvestorData {
  linked: boolean;
  investor?: {
    id: string;
    name: string;
    email: string;
  };
}

export function InvestorQuickAccess() {
  // Hook para calcular rendimentos
  const { getInvestmentStats } = useInvestmentReturn();
  
  // Check if user is linked to investor profile
  const { data: investorData, isLoading } = useQuery<InvestorData>({
    queryKey: ["investor-link"],
    queryFn: async () => {
      const response = await fetch("/api/investors/link-user");
      if (!response.ok) {
        return { linked: false };
      }
      return response.json();
    },
  });

  // Get investments for this investor
  const { data: investmentsData = [] } = useQuery<Investment[]>({
    queryKey: ["investor-investments", investorData?.investor?.id],
    queryFn: async () => {
      if (!investorData?.investor?.id) return [];
      const response = await fetch(`/api/investments?investorId=${investorData.investor.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!investorData?.investor?.id,
  });

  // Don't show if not an investor or loading
  if (isLoading || !investorData?.linked) {
    return null;
  }

  // Calculate investment stats using the hook
  const investmentStats = getInvestmentStats(investmentsData);
  const totalInvested = investmentStats.totalActivePrincipal;
  const totalReturns = investmentStats.totalEarned;
  const currentBalance = investmentStats.totalValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 dark:border-indigo-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <User className="h-5 w-5" />
              Área do Investidor
            </CardTitle>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-300">
              <Wallet className="h-3 w-3 mr-1" />
              Investidor Ativo
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Investido</div>
              <div className="text-xl font-bold text-indigo-900 dark:text-indigo-200">
                {formatCurrency(totalInvested)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Rendimentos</div>
              <div className="text-xl font-bold text-emerald-600">
                {formatCurrency(totalReturns)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Patrimônio Total</div>
              <div className="text-xl font-bold text-indigo-900 dark:text-indigo-200">
                {formatCurrency(currentBalance)}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Olá, {investorData.investor?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Acompanhe seus investimentos em tempo real
                </p>
              </div>
              
              <Link href={`/investidor/dashboard/${investorData.investor?.id}`}>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {investmentsData.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>
                Rendimento de {((totalReturns / totalInvested) * 100).toFixed(1)}% 
                sobre o capital investido
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 