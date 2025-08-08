"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardClient from "./client";
import logger from "@/lib/logger";

export default function HomePage() { 
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    logger.info("Página principal acessada");
    
    if (status === 'loading') {
      // Ainda carregando a sessão
      return;
    }
    
    if (!session) {
      // Usuário não logado - redirecionar para landing page
      logger.info("Usuário não logado - redirecionando para landing page");
      router.push('/site');
      return;
    }
    
    // Usuário logado - continua na página
    logger.info("Usuário logado - carregando dashboard");
  }, [session, status, router]);
  
  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Se não tem sessão, mostra loading enquanto redireciona
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Usuário logado - mostrar dashboard
  return <DashboardClient />;
}
