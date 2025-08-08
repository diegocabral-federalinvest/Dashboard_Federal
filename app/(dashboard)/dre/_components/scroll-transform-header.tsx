"use client";

import { useState, useEffect } from "react";
import { Calculator, Download, TrendingUp, Info, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ScrollTransformHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-300",
        isScrolled 
          ? "bg-background/95 dark:bg-background/95 backdrop-blur-md shadow-md h-0" 
          : "bg-transparent h-0"
      )}
    >
    </header>
  );
} 