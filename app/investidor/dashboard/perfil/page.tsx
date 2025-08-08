"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function InvestorPerfilPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const redirectToCorrectDashboard = async () => {
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated") {
        router.replace("/sign-in");
        return;
      }

      if (!session?.user) {
        return;
      }

      try {
        // Verificar role primeiro
        if (session.user.role !== "INVESTOR") {
          // Se não for investidor, redirecionar para dashboard admin
          router.replace('/');
          return;
        }

        // Buscar dados do investidor
        const investorResponse = await fetch("/api/investors/link-user");
        if (investorResponse.ok) {
          const investorData = await investorResponse.json();
          if (investorData.linked && investorData.investor?.id) {
            // Redirecionar para o dashboard específico do investidor
            router.replace(`/investidor/dashboard/${investorData.investor.id}`);
            return;
          }
        }

        // Se chegou até aqui, mostrar erro ou tentar criar link
        console.log("Tentando criar link do investidor...");
        const createLinkResponse = await fetch("/api/investors/link-user", {
          method: "POST",
        });
        
        if (createLinkResponse.ok) {
          const linkData = await createLinkResponse.json();
          if (linkData.linked && linkData.investor?.id) {
            router.replace(`/investidor/dashboard/${linkData.investor.id}`);
            return;
          }
        }

        // Se não conseguiu criar link, mostrar erro
        setIsRedirecting(false);
        
      } catch (error) {
        console.error("Erro ao redirecionar investidor:", error);
        setIsRedirecting(false);
      }
    };

    redirectToCorrectDashboard();
  }, [status, session, router]);

  // Loading state
  if (isRedirecting || status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecionando para seu dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">Erro de Configuração</h2>
        <p className="text-muted-foreground">
          Não foi possível vincular sua conta a um perfil de investidor.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Entre em contato com o administrador para resolver este problema.
        </p>
      </div>
    </div>
  );
} 