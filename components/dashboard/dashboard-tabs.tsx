"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface DashboardTabsProps {
  children: {
    overview: React.ReactNode;
    receitas: React.ReactNode;
    despesas: React.ReactNode;
    impostos: React.ReactNode;
  };
}

export function DashboardTabs({ children }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const tabs = [
    { value: "overview", label: "Visão Geral" },
    { value: "receitas", label: "Receitas" },
    { value: "despesas", label: "Despesas" },
    { value: "impostos", label: "Impostos" },
  ];
  
  return (
    <Tabs 
      defaultValue="overview" 
      className="space-y-6"
      onValueChange={setActiveTab}
    >
      <div className="flex justify-between items-center overflow-x-auto">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-black/5 dark:bg-white/5 p-1">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {Object.entries(children).map(([key, content]) => (
        <TabsContent key={key} value={key} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {content}
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  );
} 