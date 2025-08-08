"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import logger from "@/lib/logger";

export function InvestorAutoLink() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const tryLinkInvestor = async () => {
      if (status === 'loading' || !session?.user) return;

      // Verificar se o usuário tem role INVESTOR
      const userRole = session.user.role;
      if (userRole !== 'INVESTOR') return;

      try {
        // Primeiro, verificar se já existe link
        const getResponse = await fetch("/api/investors/link-user", {
          method: "GET",
        });

        if (getResponse.ok) {
          const data = await getResponse.json();
          if (data.linked && data.investor?.id) {
            logger.info(`Investidor já linkado: ${data.investor.id} - Email: ${session.user.email}`);
            
            // Se estiver na página principal (/), redirecionar para dashboard do investidor
            if (window.location.pathname === '/') {
              router.replace(`/investidor/dashboard/${data.investor.id}`);
            }
            return;
          }
        }

        // Se não tem link, tentar criar (POST)
        const postResponse = await fetch("/api/investors/link-user", {
          method: "POST",
        });

        if (postResponse.ok) {
          const data = await postResponse.json();
          if (data.success && data.linked && data.investor?.id) {
            logger.info(`Investidor linkado com sucesso: ${data.investor.id} - Email: ${session.user.email} - Criado: ${data.message.includes('automaticamente')}`);
            
            // Redirecionar para dashboard do investidor
            router.replace(`/investidor/dashboard/${data.investor.id}`);
          }
        } else if (postResponse.status === 404) {
          // Não é um investidor autorizado
          logger.info(`Usuário ${session.user.email} não é um investidor autorizado`);
        } else {
          logger.warn(`Erro ao tentar conectar investidor: ${postResponse.status}`);
        }
      } catch (error) {
        logger.error("Erro ao tentar conectar investidor:", error instanceof Error ? error.message : String(error));
      }
    };

    tryLinkInvestor();
  }, [session, status, router]);

  // Componente invisível - apenas executa lógica de background
  return null;
} 