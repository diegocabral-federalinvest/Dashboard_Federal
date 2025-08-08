"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  LifeBuoy, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export default function InvestorSidebar() {
  const pathname = usePathname();
  const [investorId, setInvestorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestorId = async () => {
      try {
        const response = await fetch("/api/investors/link-user");
        if (response.ok) {
          const data = await response.json();
          if (data.linked && data.investor?.id) {
            setInvestorId(data.investor.id);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar ID do investidor:", error);
      }
    };

    fetchInvestorId();
  }, []);

  // Criar navegação dinâmica baseada no investorId
  const navigation = [
    {
      name: "Dashboard",
      href: investorId ? `/investidor/dashboard/${investorId}` : "/investidor/dashboard/perfil",
      icon: LayoutDashboard,
      current: true,
    },
    {
      name: "Relatórios",
      href: investorId ? `/investidor/relatorios/${investorId}` : "/investidor/relatorios",
      icon: FileText,
      current: false,
    },
    {
      name: "Suporte",
      href: investorId ? `/investidor/suporte/${investorId}` : "/investidor/suporte",
      icon: LifeBuoy,
      current: false,
    },
  ];

  const secondaryNavigation = [
    {
      name: "Configurações",
      href: "/investidor/configuracoes",
      icon: Settings,
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <div className="w-64 bg-slate-950/60 backdrop-blur-lg border-r border-slate-800/50 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                  )}
                />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-blue-400" />
                )}
              </Link>
            );
          })}
        </div>

        <Separator className="my-6 bg-slate-700/50" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                  )}
                />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-blue-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
} 