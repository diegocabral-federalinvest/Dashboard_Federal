"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import frontendLogger from "@/lib/frontend-logger";
import logger from "@/lib/logger";

/**
 * Provider component that initializes and manages frontend logging
 * This component should be included near the top of the component tree
 */
export function FrontendLoggerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Initialize the frontend logger
      frontendLogger.init();

      logger.info("Application started", {
        context: "app",
        tags: ["startup"],
        data: {
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        },
      });

      // Log some useful diagnostic information
      if (typeof window !== 'undefined') {
        logger.debug("Environment information", {
          context: "diagnostics",
          data: {
            screenSize: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
            devicePixelRatio: window.devicePixelRatio,
            language: navigator.language,
            darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });
      }
    } catch (error) {
      console.error("Error initializing frontend logger:", error);
    }
    
    // Clean up function
    return () => {
      try {
        logger.info("Application stopping", {
          context: "app",
          tags: ["shutdown"],
        });
      } catch (error) {
        console.error("Error in frontend logger cleanup:", error);
      }
    };
  }, []);

  // Log page views when the path changes
  useEffect(() => {
    if (pathname) {
      try {
        frontendLogger.logPageView(pathname);
      } catch (error) {
        console.error("Error logging page view:", error);
      }
    }
  }, [pathname]);

  return <>{children}</>;
}

export default FrontendLoggerProvider; 