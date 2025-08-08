//app/(dashboard)/layout.tsx
'use client'
import { Header } from "../../components/layout/header"
import Sidebar from "../../components/layout/sidebar"
import { CustomScrollbar } from "@/components/ui/custom-scrollbar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { InvestorAutoLink } from "@/components/investor-auto-link";


type Props = {
    children: React.ReactNode
}

const DashboardLayout = ({ children }: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);

    // Check user's preference from localStorage if available
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    } else {
      // Default to collapsed on small screens
      setIsSidebarCollapsed(window.innerWidth < 1024);
    }

    // Listen for sidebar state changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sidebarCollapsed') {
        setIsSidebarCollapsed(e.newValue === 'true');
      }
    };

    // Listen for window resize to auto-collapse on small screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
        localStorage.setItem('sidebarCollapsed', 'true');
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isMounted) {
    return null; // Prevents flashing content during hydration
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-blue-950/30">
      {/* Auto-link investor component */}
      <InvestorAutoLink />
      
      {/* Ocean bubbles animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
      
      {/* Header - Fixed at top */}
      <Header />
      
      {/* Sidebar - Fixed at left */}
      <Sidebar onToggleCollapse={(collapsed) => {
        setIsSidebarCollapsed(collapsed);
        localStorage.setItem('sidebarCollapsed', String(collapsed));
      }} />
      
      {/* Main Content Area */}
      <motion.div 
        className="transition-all duration-300"
        style={{
          paddingTop: '64px', // Header height
        }}
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
        <main className="min-h-[calc(100vh-64px)]">
          <CustomScrollbar className="h-full">
            <div className="relative min-h-[calc(100vh-64px)]">
              {/* Decorative gradient lines */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
              
              {/* Content wrapper with improved padding and responsive behavior */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-0 sm:p-0 lg:p-0 xl:p-0"
              >
                <div className="border border-border/30 rounded-xl bg-background/20 backdrop-blur-sm p-4 sm:p-6">
                  {children}
                </div>
              </motion.div>
            </div>
          </CustomScrollbar>
        </main>
      </motion.div>
    </div>
  )
}

export default DashboardLayout