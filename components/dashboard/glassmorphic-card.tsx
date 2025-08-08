"use client";

import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface GlassmorphicCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isLoading?: boolean;
  delay?: number;
}

export function GlassmorphicCard({
  icon,
  title,
  description,
  onClick,
  isLoading = false,
  delay = 0
}: GlassmorphicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <div 
        onClick={!isLoading ? onClick : undefined}
        className={`h-full ${!isLoading ? 'cursor-pointer' : 'cursor-default'} relative group overflow-hidden rounded-lg border border-primary/10 
                   bg-gradient-to-br from-white/5 to-white/2 dark:from-white/5 dark:to-transparent 
                   backdrop-blur-sm transition-all duration-300
                   ${!isLoading ? 'hover:border-primary/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]' : ''}`}
      >
        {/* Border glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                        bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 
                          bg-gradient-to-r from-primary/10 to-primary/30 
                          w-16 h-1 group-hover:w-20 transition-all duration-500" />
        </div>
        
        <div className="p-5 flex flex-col h-full">
          {/* Icon with glowing effect */}
          <div className="mb-4 p-3 rounded-full w-12 h-12 flex items-center justify-center
                          bg-primary/10 text-primary group-hover:bg-primary/20
                          transition-all duration-300 group-hover:scale-110">
            {icon}
          </div>
          
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-3 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </>
          ) : (
            <>
              <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors duration-300">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </>
          )}
          
          {/* Arrow indicator */}
          <div className="mt-auto pt-4 flex justify-end">
            <ArrowRight className={`h-4 w-4 text-primary/50 transform translate-x-0 ${!isLoading ? 'group-hover:translate-x-1' : ''} opacity-50 ${!isLoading ? 'group-hover:opacity-100' : ''} transition-all duration-300`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 