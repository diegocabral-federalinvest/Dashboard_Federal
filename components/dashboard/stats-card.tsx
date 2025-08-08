"use client";

import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative";
  isLoading?: boolean;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  change,
  changeType,
  isLoading = false,
  delay = 0
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <Card className="border-none overflow-hidden relative group">
        <div className="bg-gradient-to-br from-primary/25 to-transparent dark:from-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center text-primary shadow-sm">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <div className="text-2xl font-bold tracking-tighter transition-all group-hover:scale-105 origin-left group-hover:translate-x-1 duration-300">{value}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          {change && !isLoading ? (
            <div className="flex items-center pt-3">
              <div className={`flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                changeType === "positive" 
                  ? "text-emerald-700 bg-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/50" 
                  : "text-rose-700 bg-rose-300 dark:text-rose-400 dark:bg-rose-950/80"
              }`}>
                {changeType === "positive" ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3" />
                )}
                {change}
              </div>
            </div>
          ) : change && isLoading ? (
            <div className="pt-3">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
} 