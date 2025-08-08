"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Users,
  LifeBuoy,
  Settings,
  ArrowLeftRight,
  Home,
  Receipt,
  BarChart4,
  UploadCloud
} from "lucide-react";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Use the same routes as in the Navigation component
const routes = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    requiredRole: ["ADMIN", "VIEWER", "EDITOR", "INVESTOR"],
  },
  {
    href: "/operacoes",
    label: "Despesas",
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
  // {
  //   href: "/suporte",
  //   label: "Suporte",
  //   icon: LifeBuoy,
  //   requiredRole: ["ADMIN", "VIEWER", "EDITOR", "INVESTOR"],
  // },
  // {
  //   href: "/configuracoes", 
  //   label: "Configurações",
  //   icon: Settings,
  //   requiredRole: ["ADMIN"],
  // },
  {
    href: "/changelog",
    label: "Changelog",
    icon: BarChart4,
    requiredRole: ["ADMIN", "EDITOR", "VIEWER"],
  },
];

// Create a cache for the user role to avoid repeated API calls
let cachedUserRole: string | null = null;

type SidebarProps = {
  forceAdmin?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
};

const Sidebar = memo(({ forceAdmin = false, onToggleCollapse }: SidebarProps) => {
  const [userRole, setUserRole] = useState<string | null>(cachedUserRole);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [investorId, setInvestorId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Listen for scroll events to sync border effects with header
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
              context: "Sidebar",
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
            
            // Verificar se admin está tentando acessar área do investidor
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
            context: "Sidebar"
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
          context: "Sidebar",
          data: { userId: session?.user?.id, error: errorMessage }
        });
        cachedUserRole = "INVESTOR"; // Default fallback
        setUserRole("INVESTOR");
        setIsLoaded(true);
      }
    };

    if (!cachedUserRole || !session) {
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
    }
  }, [hasAccess, router, userRole, investorId]);

  // Memoize filteredRoutes to avoid recalculating on every render
  const filteredRoutes = useMemo(() => {
    return routes.filter(route => hasAccess(route.requiredRole));
  }, [hasAccess]);
  // Memoize border effect based on scroll position
  const sidebarBorderClassName = useMemo(() => {
    // Calculate border opacity based on scroll with higher base opacity
    const scrollOpacity = Math.min(scrollY / 100, 0.9); // Increased max opacity to 0.9
    const opacityHex = Math.round(scrollOpacity * 255).toString(16).padStart(2, '0');
    const borderColor = `rgba(255, 255, 255, ${scrollOpacity})`; // Use rgba for smoother transitions

    return cn(
      // Right border with gradient that appears when scrolling
      // Using a pseudo-element for the border to allow gradient and opacity control
      "before:absolute before:top-[var(--header-height)] before:bottom-0 before:right-0 before:w-[1px]",
      `before:bg-gradient-to-b before:from-[${borderColor}] before:via-[${borderColor}] before:to-transparent`,
      "before:transition-opacity before:duration-300",
      // Bottom border only when collapsed with increased opacity
      isCollapsed && scrollY > 20
        ? `after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-[rgba(255,255,255,0.5)] after:via-[rgba(255,255,255,0.5)] after:to-transparent`
        : ""
    );
  }, [scrollY, isCollapsed]);

  // Animation variants for framer-motion
  const sidebarVariants = {
    expanded: { width: "200px" },
    collapsed: { width: "70px" }
  };

  const sectionVariants = {
    expanded: { opacity: 1, height: "auto" },
    collapsed: { opacity: 0, height: 0 }
  };

  // Add effect to sync collapsed state with parent component
  useEffect(() => {
    // Check localStorage for initial collapsed state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Update the toggle handler to notify parent component
  const toggleCollapse = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Notify parent component about the change
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    }
  }, [isCollapsed, onToggleCollapse]);

  return (
    <motion.div
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "h-screen fixed left-0 top-0 z-40 pt-[calc(var(--header-height)_+_2.5rem)] backdrop-blur-md ",
        "bg-gradient-to-b from-[#04085bf2] via-[#070b5ef2] to-[#020436f2] text-white",
        "bg-gradient-to-b from-[#04085bf2] via-[#070b5ef2] to-[#020436f2] text-white dark:bg-gradient-to-b dark:from-[#080918f2] dark:via-[#00021df2] dark:to-[#04050ff2]",
        sidebarBorderClassName, // Apply dynamic border effects
        "shadow-[5px_0px_15px_rgba(0,0,0,0.2)]" // Add shadow to the right side
      )}
    >
      {/* Visual glass effect overlay - consider removing if header doesn't have it or make consistent */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" /> */}

      <div className="flex flex-col h-full relative z-10">
        <TooltipProvider delayDuration={0}>
          <div className="flex-grow px-2 py-4 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-y-1.5">
              {filteredRoutes.map((route, index) => {
                const Icon = route.icon;
                const isActive = isRouteActive(route.href);

                const buttonContent = (
                  <div className={cn(
                    "flex items-center w-full",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}>
                    <div className={cn(
                      "flex items-center justify-center transition-all duration-300",
                      isCollapsed ? "h-full w-full" : "min-w-[28px] mr-3"
                    )}>
                      <Icon className={cn(
                        "size-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                        isActive ? "text-blue-800" : "text-white/80 group-hover:text-white"
                      )} />
                    </div>
                    {!isCollapsed && (
                      <span className="truncate">{route.label}</span>
                    )}
                  </div>
                );

                return (
                  <motion.div
                    key={route.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            onClick={() => handleNavClick(route.href, route.requiredRole)}
                            className={cn(
                              "w-full group transition-all duration-300 overflow-hidden h-10", // Fixed height for collapsed
                              isCollapsed ? "px-0" : "px-3 justify-start", // No padding horizontal when collapsed
                              isActive
                                ? "bg-white text-blue-800 shadow-md dark:bg-white dark:text-blue-800 font-medium"
                                : "text-white/80 hover:text-white hover:bg-white/10"
                            )}
                          >
                            {buttonContent}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                          <p>{route.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        onClick={() => handleNavClick(route.href, route.requiredRole)}
                        className={cn(
                          "w-full group transition-all duration-300 overflow-hidden",
                          "px-3 justify-start", // Standard padding when expanded
                          isActive
                            ? "bg-white text-blue-800 shadow-md dark:bg-white dark:text-blue-800 font-medium"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {buttonContent}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-l-full bg-blue-800"
                          />
                        )}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TooltipProvider>
        <div className="p-2 border-t border-white/10 relative">
          {/* Subtle glow effect at the top border */}
          <div className="absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <Button 
            variant="ghost" 
            className="w-full justify-center hover:bg-white/10 text-white/80 hover:text-white group"
            onClick={toggleCollapse}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className="transition-transform duration-300 group-hover:scale-110"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </motion.div>
          </Button>
          
          <motion.div
            variants={sectionVariants}
            initial={false}
            animate={isCollapsed ? "collapsed" : "expanded"}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {!isCollapsed && (
              <div className="mt-4 p-3 border border-sky-500/30 rounded-md bg-sky-800/20 backdrop-blur-md relative group">
                {/* Subtle corner decorations */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-sky-500/50" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-sky-500/50" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-sky-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-sky-500/50" />
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-500/0 group-hover:from-sky-500/5 group-hover:to-sky-500/0 transition-all duration-500" />
                
                <p className="text-xs text-sky-200">
                  Seu papel: <span className="font-semibold text-white">{userRole || "Carregando..."}</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
