"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  hideScrollbar?: boolean;
}

export function CustomScrollbar({ 
  children, 
  className,
  hideScrollbar = false
}: CustomScrollbarProps) {
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);
  
  // Check if content overflows and needs scrollbar
  useEffect(() => {
    if (scrollContainerRef) {
      const checkOverflow = () => {
        const hasVerticalOverflow = scrollContainerRef.scrollHeight > scrollContainerRef.clientHeight;
        setHasOverflow(hasVerticalOverflow);
      };
      
      // Check initially
      checkOverflow();
      
      // Check on resize
      const resizeObserver = new ResizeObserver(checkOverflow);
      resizeObserver.observe(scrollContainerRef);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [scrollContainerRef]);

  return (
    <div 
      ref={setScrollContainerRef}
      className={cn(
        "relative overflow-y-auto",
        hasOverflow && !hideScrollbar ? "custom-scrollbar" : "scrollbar-none",
        className
      )}
    >
      {children}
    </div>
  );
} 