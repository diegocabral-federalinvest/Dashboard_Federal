"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ArrowRight, FileSpreadsheet, Upload, PieChart } from "lucide-react";
import Link from "next/link";

interface ActionCardsProps {
  isLoading: boolean;
}

export function ActionCards({ isLoading }: ActionCardsProps) {
  const actions = [
    {
      title: "Importar Dados",
      description: "Faça upload de arquivos CSV para processamento automático",
      icon: <Upload className="h-5 w-5" />,
      href: "/dre/dados-brutos",
      color: "from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30",
      delay: 0.3
    },
    {
      title: "Relatório DRE",
      description: "Visualize a Demonstração do Resultado do Exercício",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      href: "/dre",
      color: "from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30",
      delay: 0.4
    },
    {
      title: "Análise de Impostos",
      description: "Projeções e análises de impostos baseadas nos dados",
      icon: <PieChart className="h-5 w-5" />,
      href: "/dre/dados-brutos",
      color: "from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30",
      delay: 0.5
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[160px] w-full rounded-xl" />
          ))}
        </>
      ) : (
        <>
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: action.delay }}
            >
              <Link href={action.href} className="block h-full">
                <Card className={`border-none overflow-hidden h-full bg-gradient-to-br ${action.color} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
                        {action.icon}
                      </div>
                      <ArrowRight className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="mt-auto">
                      <h3 className="font-medium text-lg mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
} 