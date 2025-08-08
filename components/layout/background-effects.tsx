"use client";

import { cn } from "@/lib/utils";

interface BackgroundEffectsProps {
  className?: string;
}

export function BackgroundEffects({ className = "" }: BackgroundEffectsProps) {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* CSS Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(180deg, white, rgba(255,255,255,0))',
          WebkitMaskImage: 'linear-gradient(180deg, white, rgba(255,255,255,0))'
        }}
      />
      
      {/* Radial fade overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.1)_70%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.1)_70%)]" />
    </div>
  );
} 