"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import logger from "@/lib/logger";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  Send,
  HelpCircle,
  PhoneCall,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InvestorSupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [investorId, setInvestorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkInvestorLink = async () => {
      try {
        const response = await fetch("/api/investors/link-user");
        if (response.ok) {
          const data = await response.json();
          if (data.linked && data.investor?.id) {
            setInvestorId(data.investor.id);
            // Redirecionar para a versão com ID se disponível
            router.replace(`/investidor/suporte/${data.investor.id}`);
            return;
          }
        }
        setIsLoading(false);
        logger.info("Página de suporte do investidor carregada (sem ID específico)");
      } catch (error) {
        logger.error("Erro ao verificar link do investidor:", error instanceof Error ? error.message : String(error));
        setIsLoading(false);
      }
    };

    checkInvestorLink();
  }, [router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info("Formulário de suporte enviado", { data: { subject, message } });

    // Simulação de envio do formulário
    setStatus("enviado");
    setTimeout(() => {
      setSubject("");
      setMessage("");
      setStatus("");
    }, 3000);
  };

  const contactChannels = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Telefone",
      value: "(11) 3000-0000",
      description: "Segunda a Sexta, 9h às 18h",
      color: "text-blue-500"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "E-mail",
      value: "suporte@federalinvest.com.br",
      description: "Resposta em até 24h",
      color: "text-purple-500"
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "WhatsApp",
      value: "(11) 99000-0000",
      description: "Atendimento de 9h às 18h",
      color: "text-emerald-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando suporte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Suporte ao Investidor
        </h1>
        <p className="text-muted-foreground">
          Estamos aqui para ajudar com suas dúvidas sobre investimentos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <CardHeader>
                <CardTitle>Enviar Nova Mensagem</CardTitle>
                <CardDescription>
                  Nossa equipe responderá sua mensagem em até 24 horas úteis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Select value={subject} onValueChange={setSubject} required>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
                        <SelectValue placeholder="Selecione um assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investments">Investimentos</SelectItem>
                        <SelectItem value="returns">Rendimentos</SelectItem>
                        <SelectItem value="documents">Documentos</SelectItem>
                        <SelectItem value="profile">Perfil do Investidor</SelectItem>
                        <SelectItem value="other">Outros Assuntos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Sua Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Descreva seu problema ou dúvida em detalhes"
                      className="min-h-[200px] bg-slate-800/50 border-slate-700/50"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700" 
                    disabled={status === "enviado"}
                  >
                    {status === "enviado" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mensagem Enviada!
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </GlassCard>
          </motion.div>
        </div>
        
        {/* Contact Channels - 1 column on large screens */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard>
              <CardHeader>
                <CardTitle>Canais de Atendimento</CardTitle>
                <CardDescription>
                  Outras formas de entrar em contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactChannels.map((channel, index) => (
                  <motion.div
                    key={channel.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-1", channel.color)}>
                        {channel.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{channel.title}</h3>
                        <p className={cn("font-semibold", channel.color)}>
                          {channel.value}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700/50 hover:bg-slate-800/50"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  FAQ - Perguntas Frequentes
                </Button>
              </CardFooter>
            </GlassCard>
          </motion.div>
        </div>
      </div>
      
      {/* Info sobre perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>Status da sua conta de investidor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <h4 className="font-medium text-yellow-500">Perfil em Configuração</h4>
                  <p className="text-sm text-muted-foreground">
                    Seu perfil de investidor está sendo configurado. Em breve você terá acesso completo ao dashboard.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
} 