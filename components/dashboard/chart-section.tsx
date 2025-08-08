"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiLineChart } from "@/components/charts/multi-line-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface ChartSectionProps {
  chartData: any;
  title: string;
  isLoading: boolean;
}

export function ChartSection({ chartData, title, isLoading }: ChartSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="border-none overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium tracking-tight">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <Tabs defaultValue="revenue" className="h-full flex flex-col">
            <TabsList className="mb-4 flex-shrink-0 w-full max-w-md overflow-x-auto">
              <TabsTrigger value="revenue">Receita</TabsTrigger>
              <TabsTrigger value="expenses">Despesas</TabsTrigger>
              <TabsTrigger value="profit">Lucro</TabsTrigger>
            </TabsList>
            <div className="flex-1 min-h-0">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <>
                  <TabsContent value="revenue" className="h-full">
                    <div className="h-[300px] sm:h-[350px] lg:h-full">
                      <MultiLineChart 
                        data={chartData?.revenue || []} 
                        categories={["Bruta", "Líquida"]}
                        colors={["#3b82f6", "#10b981"]}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="expenses" className="h-full">
                    <div className="h-[300px] sm:h-[350px] lg:h-full">
                      <MultiLineChart 
                        data={chartData?.expenses || []} 
                        categories={["Tributáveis", "Não-Tributáveis"]}
                        colors={["#f43f5e", "#f97316"]}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="profit" className="h-full">
                    <div className="h-[300px] sm:h-[350px] lg:h-full">
                      <MultiLineChart 
                        data={chartData?.profit || []} 
                        categories={["Resultado Bruto", "Resultado Líquido"]}
                        colors={["#8b5cf6", "#6366f1"]}
                      />
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
} 