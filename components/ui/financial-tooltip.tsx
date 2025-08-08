"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const FinancialTooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    variant?: "default" | "info" | "success" | "warning" | "error";
    size?: "sm" | "md" | "lg";
  }
>(({ className, sideOffset = 4, variant = "default", size = "md", ...props }, ref) => {
  const variantStyles = {
    default: "bg-gray-900 text-white border-gray-700",
    info: "bg-blue-900 text-blue-100 border-blue-700",
    success: "bg-green-900 text-green-100 border-green-700", 
    warning: "bg-yellow-900 text-yellow-100 border-yellow-700",
    error: "bg-red-900 text-red-100 border-red-700"
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base"
  };

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-lg border shadow-lg animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "backdrop-blur-sm font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
});
FinancialTooltip.displayName = TooltipPrimitive.Content.displayName;

// Componente wrapper para facilitar o uso
interface TooltipWrapperProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "info" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  className?: string;
}

export function TooltipWrapper({
  content,
  children,
  variant = "default",
  size = "md",
  side = "top",
  align = "center",
  delayDuration = 200,
  className
}: TooltipWrapperProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <FinancialTooltip
          variant={variant}
          size={size}
          side={side}
          align={align}
          className={className}
        >
          {content}
        </FinancialTooltip>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tooltip específico para botões de ação
export function ActionTooltip({
  content,
  children,
  variant = "default",
  ...props
}: Omit<TooltipWrapperProps, 'size'> & { variant?: "default" | "info" | "success" | "warning" | "error" }) {
  return (
    <TooltipWrapper
      content={content}
      variant={variant}
      size="sm"
      delayDuration={300}
      {...props}
    >
      {children}
    </TooltipWrapper>
  );
}

// Tooltip para informações financeiras
export function FinancialInfoTooltip({
  title,
  description,
  value,
  children,
  variant = "info",
  ...props
}: Omit<TooltipWrapperProps, 'content'> & {
  title: string;
  description?: string;
  value?: string;
  variant?: "default" | "info" | "success" | "warning" | "error";
}) {
  const content = (
    <div className="space-y-1">
      <div className="font-semibold">{title}</div>
      {description && (
        <div className="text-xs opacity-90">{description}</div>
      )}
      {value && (
        <div className="font-bold text-sm border-t border-current/20 pt-1 mt-1">
          {value}
        </div>
      )}
    </div>
  );

  return (
    <TooltipWrapper
      content={content}
      variant={variant}
      size="md"
      delayDuration={100}
      {...props}
    >
      {children}
    </TooltipWrapper>
  );
}

export { Tooltip, TooltipTrigger, TooltipProvider }; 