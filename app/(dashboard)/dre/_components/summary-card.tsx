"use client";

import React, { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  previousValue?: number;
  currency?: boolean;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  previousValue = 0,
  currency = true,
  icon,
  variant = 'primary',
}) => {
  // Calculate percentage change
  const percentChange = previousValue 
    ? ((value - previousValue) / Math.abs(previousValue)) * 100 
    : 0;
  
  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;
  const hasChange = percentChange !== 0 && previousValue !== 0;

  // Get variant classes
  const variantClasses = {
    primary: "bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900",
    secondary: "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
    tertiary: "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
  };

  return (
    <Card className={cn("border rounded-xl overflow-hidden shadow-sm", variantClasses[variant])}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {title}
            </p>
            <div className="text-2xl font-semibold">
              {currency ? formatCurrency(value) : `${value.toFixed(1)}%`}
            </div>
            
            {hasChange && (
              <div className="flex items-center mt-1">
                <div className={cn(
                  "text-xs font-medium flex items-center",
                  isPositive ? "text-green-600 dark:text-green-400" : isNegative ? "text-red-600 dark:text-red-400" : "text-gray-500"
                )}>
                  {isPositive ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : isNegative ? (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  ) : null}
                  {isPositive ? "+" : ""}{percentChange.toFixed(1)}%
                </div>
                <span className="text-xs text-gray-400 ml-1">vs. anterior</span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              "p-2 rounded-full",
              variant === 'primary' && "bg-blue-100 dark:bg-blue-900/30",
              variant === 'secondary' && "bg-gray-100 dark:bg-gray-800",
              variant === 'tertiary' && "bg-blue-50 dark:bg-blue-950/30"
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 