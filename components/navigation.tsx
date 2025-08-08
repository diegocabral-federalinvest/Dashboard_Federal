"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useMedia } from "react-use";
import { 
  Menu, 
  AlertCircle, 
  LayoutDashboard, 
  TrendingUp, 
  LineChart, 
  Users, 
  LifeBuoy, 
  Settings,
  ArrowLeftRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { Button } from "@/components/ui/button";
import NavButton from "./nav-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const routes = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    requiredRole: ["ADMIN", "VIEWER", "EDITOR", "INVESTOR"],
  },
  {
    href: "/operacoes",
    label: "Operações",
    icon: ArrowLeftRight,
    requiredRole: ["ADMIN", "EDITOR"],
  },
  {
    href: "/investimentos",
    label: "Investimentos",
    icon: TrendingUp,
    requiredRole: ["ADMIN", "EDITOR"],
  },
  {
    href: "/dre",
    label: "DRE",
    icon: LineChart,
    requiredRole: ["ADMIN", "EDITOR"],
  },
  {
    href: "/usuarios",
    label: "Usuários",
    icon: Users,
    requiredRole: ["ADMIN", "EDITOR"],
  },
  {
    href: "/suporte",
    label: "Suporte",
    icon: LifeBuoy,
    requiredRole: ["ADMIN", "VIEWER", "EDITOR", "INVESTOR"],
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings,
    requiredRole: ["ADMIN"],
  },
];

type NavigationProps = {
  forceAdmin?: boolean;
};

// Create a cache for the user role to avoid repeated API calls
let cachedUserRole: string | null = null;

const Navigation = memo(({ forceAdmin = false }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(cachedUserRole);
  const [isLoaded, setIsLoaded] = useState(false);
  const [investorId, setInvestorId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMedia("(max-width: 1024px)", false);
  const { data: session } = useSession();

  // Check if a route is active, including subpages
  const isRouteActive = useCallback((routePath: string) => {
    if (routePath === "/" && userRole === "INVESTOR") {
      // Para investidores, considerar a rota de dashboard do investidor como ativa
      return pathname === "/" || pathname.startsWith("/investidor/dashboard");
    }
    return pathname === routePath || pathname.startsWith(`${routePath}/`);
  }, [pathname, userRole]);

  // Get user role and investor ID - only called once or when user changes
  useEffect(() => {
    if (cachedUserRole && !session) {
      // Clear cache if user is logged out
      cachedUserRole = null;
      setUserRole(null);
      setInvestorId(null);
    }

    const loadUserData = async () => {
      try {
        if (!session) {
          setIsLoaded(true);
          return;
        }

        // Use cached role if available to avoid unnecessary API calls
        if (cachedUserRole) {
          setUserRole(cachedUserRole);
          
          // Se for investidor, buscar o ID
          if (cachedUserRole === "INVESTOR") {
            try {
              const investorResponse = await fetch("/api/investors/link-user");
              if (investorResponse.ok) {
                const investorData = await investorResponse.json();
                if (investorData.linked && investorData.investor?.id) {
                  setInvestorId(investorData.investor.id);
                }
              }
            } catch (error) {
              console.error("Erro ao buscar dados do investidor:", error);
            }
          }
          
          setIsLoaded(true);
          return;
        }
        
        const response = await fetch('/api/auth/role');
        if (response.ok) {
          const data = await response.json();
          if (data.authorized && data.role) {
            logger.info(`User role from auth API: ${data.role}`, {
              context: "Navigation",
              source: "frontend"
            });
            
            // Cache the role
            cachedUserRole = data.role;
            setUserRole(data.role);
            
            // Se for investidor, buscar o ID
            if (data.role === "INVESTOR") {
              try {
                const investorResponse = await fetch("/api/investors/link-user");
                if (investorResponse.ok) {
                  const investorData = await investorResponse.json();
                  if (investorData.linked && investorData.investor?.id) {
                    setInvestorId(investorData.investor.id);
                  }
                }
              } catch (error) {
                console.error("Erro ao buscar dados do investidor:", error);
              }
            }
            
            if (data.role === "ADMIN" && window.location.pathname.includes("/investidor") && !window.location.pathname.includes("?redirected=true")) {
              console.log("🔄 Redirecionando para a página inicial por causa da role ADMIN");
              window.location.href = "/?redirected=true";
              return;
            }
            
            setIsLoaded(true);
            return;
          }
        } else {
          logger.warn(`Falha ao obter role da API: ${response.status}`, {
            context: "Navigation"
          });
        }
        
        const role = session?.user?.role as string || "INVESTOR";
        logger.info(`User role from Clerk metadata fallback: ${role}`);
        
        // Cache the fallback role
        cachedUserRole = role;
        setUserRole(role);
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Erro ao obter role do usuário", {
          context: "Navigation",
          data: { userId: session?.user?.id, error: errorMessage }
        });
        cachedUserRole = "INVESTOR"; // Default fallback
        setUserRole("INVESTOR");
        setIsLoaded(true);
      }
    };

    if (!cachedUserRole || !userRole) {
      loadUserData();
    }
  }, [session, userRole]);

  const hasAccess = useCallback((requiredRoles: string[]) => {
    if (forceAdmin) return true;
    if (!isLoaded || !userRole) return false;
    return requiredRoles.includes(userRole);
  }, [forceAdmin, isLoaded, userRole]);

  const handleNavClick = useCallback((href: string, requiredRoles: string[]) => {
    if (hasAccess(requiredRoles)) {
      logger.info(`Navigating to ${href} - Access granted`);
      
      // Para investidores, redirecionar dashboard para o dashboard específico
      if (userRole === "INVESTOR" && href === "/" && investorId) {
        router.push(`/investidor/dashboard/${investorId}`);
      } else if (userRole === "INVESTOR" && href === "/suporte") {
        // Redirecionar para o suporte do investidor
        router.push(`/investidor/suporte/${investorId}`);
      } else {
        router.push(href);
      }
      setIsOpen(false);
    } else {
      logger.error(`Access denied to ${href} - Current role: ${userRole}`);
      toast.error("Acesso restrito", {
        description: `Você não tem permissão para acessar ${href}. Role: ${userRole}`,
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
        duration: 5000,
      });
      
      // Redirecionar com base na role
      if (userRole === "INVESTOR" && investorId) {
        router.push(`/investidor/dashboard/${investorId}`);
      } else if (userRole === "VIEWER") {
        router.push("/");
      }
      setIsOpen(false);
    }
  }, [hasAccess, router, userRole, investorId]);

  // Memoize filteredRoutes to avoid recalculating on every render
  const filteredRoutes = useMemo(() => {
    return routes.filter(route => hasAccess(route.requiredRole));
  }, [hasAccess]);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="font-normal bg-background/10 hover:bg-background/20 focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-foreground hover:text-foreground focus:bg-background/30 transition"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2 bg-background border-r border-border">
          <nav className="flex flex-col gap-y-2 pt-6">
            {filteredRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = isRouteActive(route.href);
              
              return (
                <Button
                  key={route.href}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleNavClick(route.href, route.requiredRole)}
                  className={cn(
                    "w-full justify-start group transition-all duration-300",
                    isActive && "bg-white text-blue-800 shadow-md dark:bg-white dark:text-blue-800"
                  )}
                >
                  <Icon className={cn(
                    "mr-2 size-4 transition-colors duration-300",
                    isActive ? "text-blue-800" : "text-muted-foreground group-hover:text-blue-800"
                  )} />
                  {route.label}
                </Button>
              )
            })}
          </nav>
          <div className="mt-4 p-3 border border-amber-500/30 rounded-md bg-amber-500/10">
            <p className="text-xs text-amber-400">
              Seu papel: <span className="font-semibold">{userRole || "Carregando..."}</span>
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-1 overflow-x-auto">
      {filteredRoutes.map((route) => {
        const isActive = isRouteActive(route.href);
        
        return (
          <NavButton
            key={route.href}
            href={route.href}
            label={route.label}
            icon={route.icon}
            isActive={isActive}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(route.href, route.requiredRole);
            }}
            activeClassName="bg-white text-blue-800 dark:bg-white dark:text-blue-800"
            activeIconClassName="text-blue-800"
          />
        );
      })}
    </nav>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;