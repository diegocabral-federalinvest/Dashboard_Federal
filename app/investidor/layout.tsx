"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Header } from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { CustomScrollbar } from "@/components/ui/custom-scrollbar";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function InvestorLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { data: session } = useSession();
  const { setContent } = useHeader();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const updateMediaQuery = () => {
        setIsSidebarCollapsed(window.innerWidth < 1024);
      };

      updateMediaQuery();
      window.addEventListener("resize", updateMediaQuery);
      return () => window.removeEventListener("resize", updateMediaQuery);
    }
  }, [isMounted]);

  // Update header with user info
  useEffect(() => {
    if (session?.user) {
      const userName = session.user.name || session.user.email?.split('@')[0] || 'Investidor';
      const userEmail = session.user.email || '';

      setContent({
        title: `Dashboard - ${userName}`,
        subtitle: userEmail,
        pageType: 'dashboard',
        showDefaultActions: true
      });
    }
  }, [session, setContent]);
  
  if (!isMounted) {
    return null; // Prevents flashing content during hydration
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-blue-950/30">
      {/* Ocean bubbles animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/10 dark:bg-blue-300/10"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              animation: `bubble ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes bubble {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
      
      <Header />
      <Sidebar onToggleCollapse={(collapsed) => {
        setIsSidebarCollapsed(collapsed);
        localStorage.setItem('sidebarCollapsed', String(collapsed));
      }} />
      
      <motion.div 
        className="pt-[70px] transition-all duration-300"
        animate={{
          marginLeft: isSidebarCollapsed ? "70px" : "200px"
        }}
        transition={{
          type: "spring",
          stiffness: 300, 
          damping: 35,
          mass: 0.8
        }}
      >
        <main className="h-[calc(100vh-80px)]">
          <CustomScrollbar className="h-full">
            <div className="relative min-h-[calc(100vh-80px)]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-1 sm:p-1 lg:p-2 xl:p-2 border-2 rounded-2xl border-[#ffffff]/20"
              >
                {children}
              </motion.div>
            </div>
          </CustomScrollbar>
        </main>
      </motion.div>
    </div>
  );
}

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["INVESTOR"]}>
      <HeaderProvider>
        <InvestorLayoutContent>{children}</InvestorLayoutContent>
      </HeaderProvider>
    </RoleGuard>
  );
}
