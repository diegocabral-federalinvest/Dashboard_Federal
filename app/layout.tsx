import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-providers";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import SheetProvider from "@/providers/sheet-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";
import FrontendLoggerProvider from "@/providers/frontend-logger-provider";
import { BackgroundEffects } from "@/components/layout/background-effects";
import { HeaderProvider } from "@/contexts/header-context";
import AuthProvider from "@/providers/auth-provider";

// Import the logger panel with dynamic import to avoid SSR issues
const LoggerPanel = dynamic(() => import("@/components/logger-panel"), { 
  ssr: false 
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Federal Invest - Plataforma Financeira",
  description: "Plataforma de gestão financeira para franqueados Federal Invest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={`${inter.className} antialiased overflow-x-hidden`}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <HeaderProvider>
                <FrontendLoggerProvider>
                  <SheetProvider />
                  <Toaster />
                  <SonnerToaster position="top-center" closeButton richColors />
                  <BackgroundEffects />
                  <main className="relative z-10">{children}</main>
                  {/* <LoggerPanel /> */}
                </FrontendLoggerProvider>
              </HeaderProvider>
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
