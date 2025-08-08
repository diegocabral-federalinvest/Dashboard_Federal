"use client";

import { useState } from "react";
import { Edit, Trash2, Eye, ArrowUpRight, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInvestmentReturn } from "../hooks/use-investment-return";
import { formatCurrency } from "@/lib/utils";
import { Investment } from "../api/use-get-investment";

interface InvestmentCardProps {
  investment: Investment;
  onEdit?: (investment: Investment) => void;
  onDelete?: (investment: Investment) => void;
  isAdmin?: boolean;
}

export function InvestmentCard({
  investment,
  onEdit,
  onDelete,
  isAdmin = false,
}: InvestmentCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { calculateReturn } = useInvestmentReturn();
  
  // Calcular o retorno do investimento
  const returns = calculateReturn(investment);
  
  // Determinar o estilo do badge de status
  const getStatusBadge = () => {
    switch (investment.status) {
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>Ativo</span>
            </div>
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <div className="flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" />
              <span>Concluído</span>
            </div>
          </Badge>
        );
      case "withdrawn":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            Retirado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{investment.investorName}</CardTitle>
              <CardDescription className="line-clamp-1 mt-1">
                {investment.description}
              </CardDescription>
            </div>
            <div className="flex-shrink-0">{getStatusBadge()}</div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor Investido:</span>
              <span className="font-medium">
                {formatCurrency(returns.principal)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rendimento:</span>
              <span className={`font-medium ${investment.status === "active" ? "text-green-600" : ""}`}>
                {formatCurrency(returns.earned)}
              </span>
            </div>
            
            <div className="border-t my-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-bold">
                {formatCurrency(returns.total)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Dias ativos:</span>
              <span className="text-xs">
                {returns.daysActive} {returns.daysActive === 1 ? "dia" : "dias"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t bg-slate-50 px-4 py-2.5">
          <div className="text-xs text-muted-foreground">
            {format(new Date(investment.startDate), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver detalhes</span>
            </Button>
            
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit && onEdit(investment)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDelete && onDelete(investment)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Modal de detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Investimento</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o investimento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Investidor</h4>
                <p className="text-sm">{investment.investorName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {investment.investorId}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <div>{getStatusBadge()}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Data do Registro</h4>
                <p className="text-sm">
                  {format(new Date(investment.date), "PPP", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Data de Início</h4>
                <p className="text-sm">
                  {format(new Date(investment.startDate), "PPP", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Valor</h4>
                <p className="text-sm font-medium">
                  {formatCurrency(returns.principal)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Taxa de Retorno</h4>
                <p className="text-sm">
                  {(returns.dailyRate * 100).toFixed(8)}% ao dia
                </p>
                <p className="text-xs text-muted-foreground">
                  ~{(returns.dailyRate * 100 * 365).toFixed(2)}% ao ano
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Rendimento</h4>
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(returns.earned)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ativo há {returns.daysActive} {returns.daysActive === 1 ? "dia" : "dias"}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Total Acumulado</h4>
                <p className="text-sm font-bold">
                  {formatCurrency(returns.total)}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Descrição</h4>
              <p className="text-sm whitespace-pre-line border p-2 rounded-md bg-slate-50">
                {investment.description}
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Criado em: {format(new Date(investment.createdAt), "PPP 'às' HH:mm", { locale: ptBR })}</p>
              <p>Última atualização: {format(new Date(investment.updatedAt), "PPP 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 