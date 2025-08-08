"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cva } from "class-variance-authority";

interface GlassCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  elevation?: "none" | "low" | "medium" | "high";
  variant?: "default" | "blue" | "light" | "dark" | "green" | "red";
  hover?: boolean;
  headerAction?: React.ReactNode;
}

const glassCardVariants = cva(
  "border rounded-lg overflow-hidden transition-all duration-300",
  {
    variants: {
      elevation: {
        none: "",
        low: "shadow-sm",
        medium: "shadow-md",
        high: "shadow-lg"
      },
      variant: {
        default: "bg-card/80 backdrop-blur-sm border-border",
        blue: "bg-blue-950/10 dark:bg-blue-950/20 border-blue-500/30 backdrop-blur-sm",
        light: "bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/70 dark:border-slate-700/30",
        dark: "bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-800/30 dark:border-slate-700/30",
        green: "bg-gradient-to-br from-emerald-50/90 to-green-100/80 dark:from-emerald-950/40 dark:to-green-900/30 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-700/30",
        red: "bg-gradient-to-br from-red-50/90 to-rose-100/80 dark:from-red-950/40 dark:to-rose-900/30 backdrop-blur-sm border-red-200/50 dark:border-red-700/30"
      },
      hover: {
        true: "hover:shadow-md hover:border-blue-500/30 hover:bg-opacity-100",
        false: ""
      }
    },
    defaultVariants: {
      elevation: "low",
      variant: "default",
      hover: false
    }
  }
);

export function GlassCard({
  title,
  children,
  className,
  elevation = "low",
  variant = "default",
  hover = false,
  headerAction
}: GlassCardProps) {
  return (
    <Card
      className={cn("border-l border-2 border-gray-200",
        glassCardVariants({
          elevation,
          variant,
          hover,
          className
        })
      )}
    >
      {title && (
        <CardHeader className="pb-0 pt-3 px-3 flex flex-row items-center justify-between">
          {typeof title === "string" ? (
            <h3 className="text-sm font-medium">{title}</h3>
          ) : (
            title
          )}
          {headerAction}
        </CardHeader>
      )}
      <CardContent className={cn("p-0", title ? "pt-2" : "pt-3")}>
        {children}
      </CardContent>
    </Card>
  );
}

export function GlassCardGrid({ 
  children, 
  className,
  columns = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 } 
}: { 
  children: React.ReactNode;
  className?: string;
  columns?: { 
    default: number;
    sm?: number;
    md?: number; 
    lg?: number;
    xl?: number;
  };
}) {
  // Build responsive grid classes
  const colsDefault = `grid-cols-${columns.default}`;
  const colsSm = columns.sm ? `sm:grid-cols-${columns.sm}` : "";
  const colsMd = columns.md ? `md:grid-cols-${columns.md}` : "";
  const colsLg = columns.lg ? `lg:grid-cols-${columns.lg}` : "";
  const colsXl = columns.xl ? `xl:grid-cols-${columns.xl}` : "";
  
  return (
    <div className={cn(
      "grid gap-6",
      colsDefault,
      colsSm,
      colsMd,
      colsLg,
      colsXl,
      className
    )}>
      {children}
    </div>
  );
} 