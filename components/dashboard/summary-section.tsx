"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface SummarySectionProps {
  data: {
    title: string;
    items: Array<{
      label: string;
      value: string;
    }>;
  };
  isLoading: boolean;
}

export function SummarySection({ data, isLoading }: SummarySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="h-full"
    >
      <Card className="border-none overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium tracking-tight">{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-2 flex-1">
            {isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-2 border-b border-border/40 last:border-0"
                  >
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {data.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-2 border-b border-border/40 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 