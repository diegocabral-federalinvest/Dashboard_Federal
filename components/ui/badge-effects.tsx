"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

// Base badge variants
const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "border border-primary/20 text-primary",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        muted: "bg-muted text-muted-foreground",
        accent: "bg-accent text-accent-foreground",
      },
      size: {
        default: "h-6 text-xs",
        sm: "h-5 text-[0.6rem]",
        lg: "h-7 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Standard Badge component
function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// NeonBadge with glow effect
const neonBadgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-all whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]",
        blue: "bg-blue-500/10 text-blue-500 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        green: "bg-green-500/10 text-green-500 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
        red: "bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        yellow: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
        purple: "bg-purple-500/10 text-purple-500 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]",
      },
      animate: {
        true: "animate-pulse-glow",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      animate: false,
    }
  }
);

export interface NeonBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neonBadgeVariants> {
  glow?: boolean;
}

{/*
export function NeonBadge({ className, variant, animate, glow = true, ...props }: NeonBadgeProps) {
  return (
    <motion.div
      className={cn(neonBadgeVariants({ variant, animate: glow }), className)}
      whileHover={{ scale: 1.05 }}
      {...props}
    />
  );
}
*/}

// BorderGlowBadge with border glow effect
const borderGlowVariants = cva(
  "inline-flex items-center rounded-md px-3 py-1 text-xs font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary/5 text-primary border border-primary/30 relative",
        blue: "bg-blue-500/5 text-blue-500 border border-blue-500/30 relative",
        green: "bg-green-500/5 text-green-500 border border-green-500/30 relative",
        red: "bg-red-500/5 text-red-500 border border-red-500/30 relative",
        yellow: "bg-yellow-500/5 text-yellow-500 border border-yellow-500/30 relative",
        purple: "bg-purple-500/5 text-purple-500 border border-purple-500/30 relative",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
);

export interface BorderGlowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof borderGlowVariants> {}

export function BorderGlowBadge({ className, variant, ...props }: BorderGlowProps) {
  return (
    <div className="relative inline-block">
      <div className={cn(borderGlowVariants({ variant }), className)} {...props} />
      <div className={cn(
        "absolute inset-0 rounded-md -z-10 opacity-40 blur-sm",
        variant === "default" && "bg-primary/30",
        variant === "blue" && "bg-blue-500/30",
        variant === "green" && "bg-green-500/30",
        variant === "red" && "bg-red-500/30",
        variant === "yellow" && "bg-yellow-500/30",
        variant === "purple" && "bg-purple-500/30",
      )} />
    </div>
  );
}

// GlowBadge with background glow effect
const glowBadgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground relative",
        outline: "bg-transparent border border-primary text-primary relative",
        blue: "bg-blue-500 text-white relative",
        green: "bg-green-500 text-white relative",
        red: "bg-red-500 text-white relative",
        yellow: "bg-yellow-500 text-black relative",
        purple: "bg-purple-500 text-white relative",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
);

export interface GlowBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glowBadgeVariants> {}

export function GlowBadge({ className, variant, ...props }: GlowBadgeProps) {
  return (
    <div className="relative inline-block">
      <div className={cn(glowBadgeVariants({ variant }), className)} {...props} />
      <div className={cn(
        "absolute inset-0 -z-10 rounded-md blur-md opacity-40 scale-110",
        variant === "default" && "bg-primary", 
        variant === "outline" && "bg-primary/30",
        variant === "blue" && "bg-blue-500",
        variant === "green" && "bg-green-500",
        variant === "red" && "bg-red-500",
        variant === "yellow" && "bg-yellow-500",
        variant === "purple" && "bg-purple-500",
      )} />
    </div>
  );
}

// ValueChangeBadge for showing numeric change values with trend indicator
export interface ValueChangeBadgeProps {
  value: number;
  showIcon?: boolean;
}

export function ValueChangeBadge({ value, showIcon = true }: ValueChangeBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
      "transition-colors duration-200",
      isPositive && "text-green-700 dark:text-green-400 bg-green-100/80 dark:bg-green-900/20",
      isNegative && "text-red-700 dark:text-red-400 bg-red-100/80 dark:bg-red-900/20",
      isNeutral && "text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-900/20"
    )}>
      {showIcon && isPositive && <ArrowUp className="h-3 w-3 mr-0.5" />}
      {showIcon && isNegative && <ArrowDown className="h-3 w-3 mr-0.5" />}
      {showIcon && isNeutral && <ArrowRight className="h-3 w-3 mr-0.5" />}
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

export { Badge, badgeVariants }; 