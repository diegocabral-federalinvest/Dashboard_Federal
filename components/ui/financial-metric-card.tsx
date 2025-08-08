"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ValueChangeBadge } from "./badge-effects";

interface FinancialMetricCardProps {
  title: string | React.ReactNode;
  value: string | number;
  previousValue?: string | number;
  percentChange?: number;
  icon?: React.ReactNode;
  className?: string;
  animationDelay?: number;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
  onClick?: () => void;
}

export function FinancialMetricCard({
  title,
  value,
  previousValue,
  percentChange,
  icon,
  className,
  animationDelay = 0,
  trend,
  trendText,
  onClick,
}: FinancialMetricCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: animationDelay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -5, 
        transition: { duration: 0.2 }
      }}
      className={cn(
        "group cursor-pointer",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
      onClick={onClick}
    >
      <Card className={cn(
        "overflow-hidden h-full transition-all duration-300",
        "border bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm",
        "hover:shadow-lg hover:bg-white/80 dark:hover:bg-gray-900/80",
        "border-blue-100 dark:border-blue-900/30",
        className
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1.5">
                {title}
              </div>
              
              <div className="text-2xl font-bold tracking-tight mb-1 text-foreground">
                {value}
              </div>
              
              {previousValue && (
                <div className="text-xs text-muted-foreground">
                  <span className="opacity-75">Anterior: {previousValue}</span>
                </div>
              )}
              
              {trendText && (
                <div className="mt-2">
                  <div className={cn(
                    "text-xs font-medium",
                    "flex items-center",
                    trend === "up" ? "text-green-600 dark:text-green-400" : "",
                    trend === "down" ? "text-red-600 dark:text-red-400" : "",
                  )}>
                    {trend === "up" && <ArrowUpIcon className="h-3 w-3 mr-1" />}
                    {trend === "down" && <ArrowDownIcon className="h-3 w-3 mr-1" />}
                    {trendText}
                  </div>
                </div>
              )}
            </div>
            
            <div className={cn(
              "p-2 rounded-full",
              "bg-blue-100/50 dark:bg-blue-900/20",
              "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
              "transition-colors duration-300"
            )}>
              {icon}
            </div>
          </div>
          
          {typeof percentChange !== 'undefined' && (
            <div className="absolute top-3 right-3">
              <ValueChangeBadge value={percentChange} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FinancialMetricGrid({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", 
      className
    )}>
      {children}
    </div>
  );
} 