"use client";

import { motion } from "framer-motion";
import { User, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface WelcomeSectionProps {
  currentBalance: number;
}

export default function WelcomeSection({ currentBalance }: WelcomeSectionProps) {
  const { data: session } = useSession();
  
  const formatTime = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Extrair primeiro nome do nome completo ou usar email
  const getDisplayName = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ')[0];
    }
    if (session?.user?.email) {
      return session.user.email.split('@')[0];
    }
    return 'Investidor';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 dark:from-blue-950/50 dark:to-blue-900/40 border-blue-700/30 dark:border-blue-600/20 backdrop-blur-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar animado */}
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  {session?.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="Avatar" 
                      width={56}
                      height={56}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-white" />
                  )}
                </div>
                {/* Ponto de status online */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"
                />
              </motion.div>

              {/* Texto de boas vindas */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-2xl font-bold text-white"
                >
                  {formatTime()}, {getDisplayName()}!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-blue-200/80 dark:text-blue-300/80 text-sm"
                >
                  {session?.user?.email} • {formatDate()}
                </motion.p>
              </div>
            </div>

            {/* Indicadores rápidos */}
            <div className="hidden md:flex items-center gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center gap-2 text-emerald-400"
              >
                <TrendingUp className="w-5 h-5" />
                <div>
                  <p className="text-xs text-blue-200/70 dark:text-blue-300/70">Status</p>
                  <p className="text-sm font-medium">Ativo</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex items-center gap-2 text-cyan-400"
              >
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-xs text-blue-200/70 dark:text-blue-300/70">Última atualização</p>
                  <p className="text-sm font-medium">Agora mesmo</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Barra de progresso animada (decorativa) */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full mt-4 opacity-30"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
} 