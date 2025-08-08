"use client";
import { HelpCircle, Bell, FileSpreadsheet, Calculator, FileDown, Menu, LogOut, User, Settings } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { memo } from "react";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useHeader } from "@/contexts/header-context";
// import { DREHeaderActions } from "@/app/(dashboard)/dre/_components/header-actions"; // Removido - não usado mais
import { signOut, useSession } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Static pre-import for instant rendering
import StaticHeaderLogo from "../header-logo";

// Dynamic imports with ssr: false for components that depend on client state
const ModeToggle = dynamic(() => import("../mode-toggle").then(mod => mod.ModeToggle), {
  ssr: false,
  loading: () => <div className="w-9 h-9 rounded-md animate-pulse bg-muted" />
});

// Create a cache key for user role
const USER_ROLE_CACHE_KEY = "federal_invest_user_role";

const Header = memo(() => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { title, subtitle, actions, pageType } = useHeader();

  const [headerRole, setHeaderRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [isExporting, setIsExporting] = useState(false); // Removido - não usado mais

  const initials = useMemo(() => {
    if (!session?.user?.name) return "FI";
    return session.user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [session?.user?.name]);

  // On load, check if we have a cached role
  useEffect(() => {
    if (status === 'loading') return;
    
    // Update header role from session
    const role = session?.user?.role || 'VIEWER';
    setHeaderRole(role);
    
    // Cache role locally for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ROLE_CACHE_KEY, role);
    }
  }, [session, status]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Navigation helpers
  const isDRE = pathname?.includes('/dre');
  const isInvestor = pathname?.startsWith('/investidor');
  const isMainDashboard = pathname === '/';
  const isHistoricoUploads = pathname?.startsWith('/historico-uploads');

  // Get correct header title based on pathname
  const headerTitle = useMemo(() => {
    // If title is explicitly set via context, use that
    if (title) return title;
    
    if (isMainDashboard) return "Dashboard Financeiro";
    if (isDRE) return "DRE - Demonstração de Resultados";
    if (pathname?.includes("/investimentos")) return "Gestão de Investimentos";
    if (pathname?.includes("/operacoes")) return "Operações Financeiras";
    if (pathname?.includes("/configuracoes")) return "Configurações";
    if (isHistoricoUploads) return "Histórico de Uploads";
    if (pathname?.includes("/usuarios")) return "Gerenciamento de Usuários";
    
    // Default case
    return "Federal Invest";
  }, [title, pathname, isMainDashboard, isDRE, isHistoricoUploads]);

  // Mock export function for DREHeaderActions - Removido pois não é mais necessário
  // const handleExportReport = (format: 'png' | 'pdf' | 'html') => {
  //   setIsExporting(true);
  //   
  //   // Simulate export process
  //   setTimeout(() => {
  //     setIsExporting(false);
  //     console.log(`Exporting ${format} report`);
  //   }, 1500);
  // };

  const headerActionButtons = useMemo(() => {
    // Return explicitly set actions if they exist
    if (actions) {
      return actions;
    }

    // Removido os botões de Calculadora e Exportar Relatório da DRE conforme solicitado
    // if (isDRE) {
    //   return (
    //     <DREHeaderActions 
    //       exportReport={handleExportReport} 
    //       isExportingReport={isExporting} 
    //     />
    //   );
    // }

    return null;
  }, [actions]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
  };

  return (
    <>
      <header 
        className={cn(
          // Base styles
          "fixed top-0 left-0 right-0 z-50",
          "flex items-center h-16 px-4 sm:px-6",
          "border-b border-border/60",
          "backdrop-blur-md",
          "shadow-sm",
          // Dark mode styles
          "bg-gradient-to-b from-[#04085bf2] via-[#070b5ef2] to-[#020436f2] text-white dark:bg-gradient-to-b dark:from-[#080918f2] dark:via-[#00021df2] dark:to-[#04050ff2] dark:border-border/40",
          // Improved backdrop blur
          "supports-[backdrop-filter]:bg-background/60"
        )}
      >
        <div className="flex w-full items-center max-w-none">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <StaticHeaderLogo showTitle={false} className="w-12 h-12 sm:w-14 sm:h-14 lg:w-40 lg:h-40" />
          </div>
          
          {/* Title Section - Centralized */}
          <div className="flex-1 flex flex-col xl:flex-row items-center justify-center min-w-0 px-4 sm:px-8 xl:gap-3">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight truncate text-center xl:text-left">
              {headerTitle}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-300 mt-0.5 xl:mt-0 truncate text-center xl:text-left">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Actions Section */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Header Actions - Hidden on small screens */}
            {headerActionButtons && (
              <div className="hidden lg:block">
                {headerActionButtons}
              </div>
            )}

            {/* Notification and Help - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 hover:bg-accent/50"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 hover:bg-accent/50 relative"
              >
                <Bell className="h-4 w-4" />
                {/* Notification dot */}
                <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
              </Button>
            </div>
            
            {/* Theme Toggler - Hidden on mobile */}
            <div className="hidden sm:block">
              <ModeToggle />
            </div>
            
            {/* User Menu */}
            {status === 'loading' ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full hover:bg-accent/50"
                    aria-label="Menu do usuário"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={session?.user?.image || ''} 
                        alt={session?.user?.name || 'Usuário'} 
                      />
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name || 'Usuário'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  {/* Mobile-only menu items */}
                  <div className="sm:hidden">
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <HelpCircle className="h-4 w-4" />
                      <span>Ajuda</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <Bell className="h-4 w-4" />
                      <span>Notificações</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Mobile Menu Button - Show actions on mobile */}
            {headerActionButtons && (
              <Button 
                variant="ghost" 
                size="icon"
                className="lg:hidden ml-1 h-9 w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Mobile Actions Menu */}
      <AnimatePresence>
        {mobileMenuOpen && headerActionButtons && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 lg:hidden"
          >
            <div className="bg-background/95 backdrop-blur-md border-b border-border/60 shadow-lg">
              <div className="p-4 max-w-none">
                {headerActionButtons}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

Header.displayName = "Header";
export { Header };