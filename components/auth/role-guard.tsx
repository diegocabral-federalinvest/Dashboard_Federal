"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectPath?: string;
  fallbackComponent?: ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectPath = "/",
  fallbackComponent 
}: RoleGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState(false);

  const handleInvestorRedirect = useCallback(async () => {
    try {
      const investorResponse = await fetch("/api/investors/link-user");
      if (investorResponse.ok) {
        const investorData = await investorResponse.json();
        if (investorData.linked && investorData.investor?.id) {
          router.replace(`/investidor/dashboard/${investorData.investor.id}`);
        } else {
          router.replace('/investidor/dashboard/perfil');
        }
      } else {
        router.replace('/investidor/dashboard/perfil');
      }
    } catch (error) {
      router.replace('/investidor/dashboard/perfil');
    }
  }, [router]);

  const handleRedirect = useCallback((role: string) => {
    if (role === "INVESTOR") {
      if (redirectPath !== "/") {
        router.replace(redirectPath);
      } else {
        handleInvestorRedirect();
      }
    } else {
      router.replace(redirectPath);
    }
  }, [router, redirectPath, handleInvestorRedirect]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      setHasAccess(false);
      router.push('/sign-in');
      return;
    }

    // Check if user has required role
    const userRole = session?.user?.role || 'VIEWER';
    const access = allowedRoles.includes(userRole);
    
    setHasAccess(access);
    
    if (!access) {
      // Small delay to avoid conflicts with other navigations
      setTimeout(() => {
        handleRedirect(userRole);
      }, 100);
    }
  }, [status, session, allowedRoles, handleRedirect, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    const refreshPage = () => {
      window.location.reload();
    };
    
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Role atual: {session?.user?.role || 'Sem role'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Roles permitidas: {allowedRoles.join(', ')}
          </p>
          <div className="pt-4">
            <Button 
              onClick={refreshPage}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
} 