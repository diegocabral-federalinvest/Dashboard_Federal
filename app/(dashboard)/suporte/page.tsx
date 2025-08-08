"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle, 
  Clock, 
  Filter, 
  MailOpen, 
  MessageSquare, 
  Search, 
  Star, 
  StarHalf, 
  Trash2, 
  RefreshCw, 
  Bell, 
  X, 
  Send, 
  ArrowUpFromLine, 
  BookOpen, 
  BellRing, 
  CheckCheck, 
  AlertCircle,
  TrendingUp,
  MessageCircle,
  Activity
} from "lucide-react";
import logger from "@/lib/logger";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl: string;
  subject: string;
  message: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  category: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "feature" | "maintenance" | "reminder" | "alert";
  createdAt: string;
  isRead: boolean;
  isGlobal: boolean;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "T-1001",
    userId: "user-1",
    userName: "João Silva",
    userEmail: "joao.silva@exemplo.com",
    avatarUrl: "/placeholder-user.jpg",
    subject: "Dúvidas sobre relatório trimestral",
    message: "Olá, estou tendo dificuldade em entender alguns dados do relatório trimestral. Os valores de IRPJ parecem inconsistentes com o que eu esperava. Poderia me ajudar a interpretar esses números?",
    status: "pending",
    priority: "high",
    category: "financeiro",
    createdAt: "2023-04-20T10:30:00",
    updatedAt: "2023-04-20T10:30:00",
    isRead: false,
    responses: []
  },
  {
    id: "T-1002",
    userId: "user-2",
    userName: "Maria Oliveira",
    userEmail: "maria.oliveira@exemplo.com",
    avatarUrl: "/placeholder-user.jpg",
    subject: "Problema ao fazer upload de CSV",
    message: "Estou tentando fazer o upload de um arquivo CSV com as operações do mês, mas recebo um erro que não consigo entender. O arquivo está no formato padrão que sempre utilizei. Poderiam verificar o que está acontecendo?",
    status: "in-progress",
    priority: "medium",
    category: "técnico",
    createdAt: "2023-04-19T14:45:00",
    updatedAt: "2023-04-19T16:20:00",
    isRead: true,
    responses: [
      {
        id: "R-1",
        authorName: "Suporte Federal Invest",
        message: "Olá Maria, verificamos que pode haver um problema com a formatação do CSV. Você poderia nos enviar o arquivo para analisarmos?",
        createdAt: "2023-04-19T16:20:00"
      }
    ]
  },
  {
    id: "T-1003",
    userId: "user-3",
    userName: "Carlos Mendes",
    userEmail: "carlos.mendes@exemplo.com",
    avatarUrl: "/placeholder-user.jpg",
    subject: "Solicitação de novos relatórios",
    message: "Gostaria de solicitar a inclusão de um novo tipo de relatório que mostre a distribuição das despesas por categoria. Isso nos ajudaria muito no planejamento financeiro da empresa.",
    status: "resolved",
    priority: "low",
    category: "feature",
    createdAt: "2023-04-15T09:00:00",
    updatedAt: "2023-04-18T11:30:00",
    isRead: true,
    responses: [
      {
        id: "R-2",
        authorName: "Suporte Federal Invest",
        message: "Olá Carlos, agradecemos a sugestão! Registramos sua solicitação e vamos incluir na próxima sprint de desenvolvimento.",
        createdAt: "2023-04-16T13:45:00"
      },
      {
        id: "R-3",
        authorName: "Suporte Federal Invest",
        message: "Atualização: Implementamos o relatório solicitado. Você pode acessá-lo na seção 'Relatórios > Despesas por Categoria'. Qualquer dúvida, estamos à disposição.",
        createdAt: "2023-04-18T11:30:00"
      }
    ]
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "N-1001",
    title: "Novas funcionalidades disponíveis",
    message: "Lançamos novos recursos de análise financeira na plataforma. Confira as novidades!",
    type: "feature",
    createdAt: "2023-04-21T08:00:00",
    isRead: false,
    isGlobal: true
  },
  {
    id: "N-1002",
    title: "Manutenção programada",
    message: "Informamos que no dia 30/04/2023, das 02:00 às 04:00, realizaremos uma manutenção programada. O sistema ficará indisponível durante este período.",
    type: "maintenance",
    createdAt: "2023-04-20T09:30:00",
    isRead: true,
    isGlobal: true
  },
  {
    id: "N-1003",
    title: "Lembrete: Fechamento trimestral",
    message: "O prazo para envio dos documentos fiscais do trimestre se encerra em 5 dias. Certifique-se de que todos os dados estão atualizados no sistema.",
    type: "reminder",
    createdAt: "2023-04-18T14:15:00",
    isRead: false,
    isGlobal: true
  }
];

// Status badges com glassmorphism
const StatusBadge = ({ status }: { status: Ticket['status'] }) => {
  const statusConfig = {
    pending: { 
      label: "Pendente", 
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: <Clock className="h-3 w-3" />
    },
    "in-progress": { 
      label: "Em Andamento", 
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <Activity className="h-3 w-3" />
    },
    resolved: { 
      label: "Resolvido", 
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: <CheckCircle className="h-3 w-3" />
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={cn("font-medium flex items-center gap-1", config.color)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

// Priority indicators
const PriorityIndicator = ({ priority }: { priority: Ticket['priority'] }) => {
  const priorityConfig = {
    low: { 
      icon: <Star className="h-4 w-4 text-slate-400" />, 
      label: "Baixa",
      color: "text-slate-400"
    },
    medium: { 
      icon: <StarHalf className="h-4 w-4 text-yellow-500" />, 
      label: "Média",
      color: "text-yellow-500"
    },
    high: { 
      icon: <Star className="h-4 w-4 text-red-500 fill-red-500" />, 
      label: "Alta",
      color: "text-red-500"
    }
  };

  const config = priorityConfig[priority] || priorityConfig.low;

  return (
    <div className="flex items-center gap-1" title={`Prioridade: ${config.label}`}>
      {config.icon}
      <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
    </div>
  );
};

// Notification Type indicators
const NotificationTypeBadge = ({ type }: { type: Notification['type'] }) => {
  const typeConfig = {
    feature: { 
      label: "Novidade", 
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      icon: <TrendingUp className="h-3 w-3" />
    },
    maintenance: { 
      label: "Manutenção", 
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      icon: <RefreshCw className="h-3 w-3" />
    },
    reminder: { 
      label: "Lembrete", 
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <Bell className="h-3 w-3" />
    },
    alert: { 
      label: "Alerta", 
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: <AlertCircle className="h-3 w-3" />
    }
  };

  const config = typeConfig[type] || typeConfig.feature;

  return (
    <Badge variant="outline" className={cn("font-medium flex items-center gap-1", config.color)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default function SuportePage() {
  const [activeTab, setActiveTab] = useState("tickets");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  
  logger.info("Página de suporte carregada");

  // Filtrar tickets baseado nos filtros e busca
  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter !== "all" && ticket.status !== ticketFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(query) ||
        ticket.message.toLowerCase().includes(query) ||
        ticket.userName.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    if (notificationFilter === "unread" && notification.isRead) return false;
    if (notificationFilter === "read" && !notification.isRead) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Estatísticas
  const ticketStats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === "pending").length,
    inProgress: tickets.filter(t => t.status === "in-progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    unread: tickets.filter(t => !t.isRead).length,
  };

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
  };

  // Handlers
  const markTicketAsResolved = (ticketId: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId ? {...ticket, status: "resolved", updatedAt: new Date().toISOString()} : ticket
      )
    );
  };

  const deleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
  };

  const markTicketAsRead = (ticketId: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId ? {...ticket, isRead: true} : ticket
      )
    );
  };

  const handleTicketResponse = () => {
    if (!responseText.trim() || !selectedTicket) return;

    const newResponse: TicketResponse = {
      id: `R-${Date.now()}`,
      authorName: "Suporte Federal Invest",
      message: responseText,
      createdAt: new Date().toISOString()
    };

    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === selectedTicket.id 
          ? {
              ...ticket, 
              responses: [...ticket.responses, newResponse],
              status: "in-progress",
              updatedAt: new Date().toISOString(),
              isRead: true
            } 
          : ticket
      )
    );

    setResponseText("");
    setResponseDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Suporte ao Cliente
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie tickets e notificações da plataforma
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-2 rounded-lg border border-yellow-500/20"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{ticketStats.pending} pendentes</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-2 rounded-lg border border-blue-500/20"
            >
              <BellRing className="h-4 w-4" />
              <span className="text-sm font-medium">{notificationStats.unread} não lidas</span>
            </motion.div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <GlassCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ticketStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todos os tickets no sistema
                </p>
              </CardContent>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{ticketStats.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aguardando primeira resposta
                </p>
              </CardContent>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{ticketStats.inProgress}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets em atendimento
                </p>
              </CardContent>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{ticketStats.resolved}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets finalizados
                </p>
              </CardContent>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tickets" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="grid w-full sm:w-[300px] grid-cols-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <TabsTrigger value="tickets" className="flex items-center gap-2 data-[state=active]:bg-slate-700/50">
              <MessageSquare className="h-4 w-4" />
              <span>Tickets</span>
              {ticketStats.unread > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                  {ticketStats.unread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-slate-700/50">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
              {notificationStats.unread > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                  {notificationStats.unread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === "tickets" && (
              <Select value={ticketFilter} onValueChange={setTicketFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">Todos os Tickets</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvidos</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            
            {activeTab === "notifications" && (
              <Select value={notificationFilter} onValueChange={setNotificationFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                  <SelectValue placeholder="Filtrar notificações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">Não lidas</SelectItem>
                    <SelectItem value="read">Lidas</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-9 w-full sm:w-[200px] bg-slate-800/50 backdrop-blur-sm border-slate-700/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle>Lista de Tickets</CardTitle>
              <CardDescription>
                Gerenciar solicitações de suporte dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTickets.length > 0 ? (
                <div className="divide-y divide-slate-700/50">
                  {filteredTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-10 w-10 border border-slate-700/50">
                            <AvatarImage src={ticket.avatarUrl} />
                            <AvatarFallback className="bg-slate-800">
                              {ticket.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{ticket.subject}</h3>
                              {!ticket.isRead && (
                                <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-blue-500" />
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {ticket.message}
                            </p>
                            
                            <div className="flex items-center gap-4 pt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">ID:</span>
                                <code className="text-xs bg-slate-800/50 px-1.5 py-0.5 rounded">
                                  {ticket.id}
                                </code>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Usuário:</span>
                                <span className="text-xs font-medium">{ticket.userName}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(ticket.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2">
                            <PriorityIndicator priority={ticket.priority} />
                            <StatusBadge status={ticket.status} />
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setResponseDialogOpen(true);
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            
                            {ticket.status !== "resolved" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => markTicketAsResolved(ticket.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => deleteTicket(ticket.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {ticket.responses.length > 0 && (
                        <div className="mt-4 pl-14 space-y-2">
                          <div className="text-xs text-muted-foreground mb-2">
                            {ticket.responses.length} resposta{ticket.responses.length > 1 ? 's' : ''}
                          </div>
                          <div className="space-y-2">
                            {ticket.responses.slice(-2).map((response) => (
                              <div 
                                key={response.id} 
                                className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-indigo-400">
                                    {response.authorName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(response.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {response.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum ticket encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery 
                      ? "Tente ajustar os filtros ou termos de busca" 
                      : "Todos os tickets foram resolvidos!"}
                  </p>
                </div>
              )}
            </CardContent>
          </GlassCard>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle>Notificações do Sistema</CardTitle>
              <CardDescription>
                Avisos importantes e atualizações da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-slate-700/50">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "p-4 hover:bg-slate-800/30 transition-colors",
                        !notification.isRead && "bg-slate-800/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{notification.title}</h3>
                            <NotificationTypeBadge type={notification.type} />
                            {!notification.isRead && (
                              <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-blue-500" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 pt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setNotifications(prev => 
                                prev.map(n => n.id === notification.id ? {...n, isRead: true} : n)
                              )}
                            >
                              <CheckCheck className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => setNotifications(prev => 
                              prev.filter(n => n.id !== notification.id)
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
                </div>
              )}
            </CardContent>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
          <DialogHeader>
            <DialogTitle>Responder Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket && (
                <div className="mt-2 space-y-1">
                  <p className="font-medium text-foreground">{selectedTicket.subject}</p>
                  <p className="text-sm">ID: {selectedTicket.id} • {selectedTicket.userName}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTicket && selectedTicket.responses.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto space-y-2 p-3 bg-slate-800/30 rounded-lg">
                {selectedTicket.responses.map((response) => (
                  <div key={response.id} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-indigo-400">{response.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{response.message}</p>
                  </div>
                ))}
              </div>
            )}
            
            <Textarea
              placeholder="Digite sua resposta..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="min-h-[100px] bg-slate-800/50 border-slate-700/50"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleTicketResponse}
              disabled={!responseText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 