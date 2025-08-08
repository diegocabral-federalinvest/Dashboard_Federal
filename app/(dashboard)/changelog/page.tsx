"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Clock, 
  Bug, 
  Plus, 
  Settings, 
  Users, 
  TrendingUp, 
  FileText,
  Shield,
  Database,
  Zap,
  BarChart3,
  ArrowRight,
  Layout,
  Filter,
  RefreshCw
} from "lucide-react";
import { useHeaderContent } from "@/hooks/use-header-content";

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  status: 'released' | 'beta' | 'planned';
  changes: {
    type: 'feature' | 'fix' | 'improvement' | 'docs' | 'security';
    title: string;
    description: string;
    icon: any;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "2.0.0",
    date: "2025-08-06",
    type: "major",
    status: "released",
    changes: [
      {
        type: "feature",
        title: "Sistema de Juros Compostos com Taxa Diária Fixa",
        description: "Implementação completa da lógica de juros compostos com taxa diária fixa de 0.0394520548% (equivalente a ~15% ao ano), substituindo o sistema de taxa mensal variável",
        icon: TrendingUp
      },
      {
        type: "fix",
        title: "Correção da Lógica da Coluna 'Renda'",
        description: "Corrigida lógica para calcular rendimento do aporte atual até o próximo aporte (ou até hoje se for o último), em vez de sempre calcular até hoje",
        icon: BarChart3
      },
      {
        type: "improvement",
        title: "Formulário de Investimentos Simplificado",
        description: "Removidos campos desnecessários (descrição, status, data de início, taxa de retorno) mantendo apenas campos essenciais para melhor UX",
        icon: Layout
      },
      {
        type: "feature",
        title: "Switch Aporte/Retirada com Shadcn UI",
        description: "Implementado switch elegante para escolher entre aporte (💰 adiciona valor) e retirada (📤 remove valor) com feedback visual claro",
        icon: Plus
      },
      {
        type: "improvement",
        title: "Modernização do Sistema de Modais",
        description: "Substituição do modal antigo (NewInvestmentDialog) pelo sistema moderno (NewInvestmentSheet) com formulário unificado para criar e editar",
        icon: RefreshCw
      },
      {
        type: "docs",
        title: "Documentação Completa da Lógica de Juros Compostos",
        description: "Criada documentação detalhada em INVESTMENT_COMPOUND_INTEREST_LOGIC.md explicando algoritmos, exemplos e fórmulas matemáticas",
        icon: FileText
      },
      {
        type: "improvement",
        title: "Arquitetura de Cálculos Refatorada",
        description: "Criado arquivo compound-interest.ts com funções puras para cálculos, separando lógica de negócio da apresentação",
        icon: Settings
      },
      {
        type: "fix",
        title: "Validação de Dados nos Cálculos",
        description: "Adicionadas validações robustas para evitar valores negativos, datas inválidas e divisões por zero nos cálculos de rendimento",
        icon: Shield
      },
      {
        type: "improvement",
        title: "Performance nos Cálculos de Investimento",
        description: "Otimizados algoritmos de cálculo para processar múltiplos aportes de forma mais eficiente, melhorando tempo de resposta da tabela",
        icon: Zap
      },
      {
        type: "feature",
        title: "Sistema de Testes para Lógica de Investimentos",
        description: "Criados arquivos de teste para validar cenários complexos de múltiplos aportes com diferentes datas e valores",
        icon: CheckCircle2
      }
    ]
  },
  {
    version: "1.9.0",
    date: "2025-01-26",
    type: "major",
    status: "released",
    changes: [
      {
        type: "fix",
        title: "Correção Crítica do Banco de Dados",
        description: "Resolvidos erros de tabelas ausentes ('users' e 'financial_data_csv') que impediam o funcionamento dos endpoints da API",
        icon: Database
      },
      {
        type: "improvement",
        title: "Aplicação Completa das Migrações Drizzle",
        description: "Executadas todas as migrações pendentes do Drizzle ORM, garantindo sincronização entre schema e banco de dados",
        icon: RefreshCw
      },
      {
        type: "feature",
        title: "Script de Limpeza do Banco de Dados",
        description: "Criado script inteligente para limpeza completa dos dados mantendo estrutura das tabelas, respeitando foreign keys",
        icon: Zap
      },
      {
        type: "improvement",
        title: "Banco Zerado para Testes CRUD",
        description: "Todas as 23 tabelas limpas com sequences resetadas, preparando ambiente ideal para testes de criação, leitura, atualização e exclusão",
        icon: CheckCircle2
      },
      {
        type: "fix",
        title: "Resolução de Conflitos de Migrações",
        description: "Corrigidos erros de tipos já existentes e duplicação de enums durante aplicação das migrações do PostgreSQL",
        icon: Settings
      }
    ]
  },
  {
    version: "1.8.0",
    date: "2025-01-23",
    type: "major",
    status: "released",
    changes: [
      {
        type: "fix",
        title: "Correção da Página DRE - Refresh Automático",
        description: "Implementado auto-refresh dos gráficos e tabela quando dedução fiscal é alterada, melhorando a usabilidade",
        icon: RefreshCw
      },
      {
        type: "fix",
        title: "Correção de Gráficos com Valores NaN",
        description: "Resolvidos problemas nos tooltips dos gráficos de 'Evolução dos Resultados' e 'Análise de Impostos' que mostravam NaN",
        icon: BarChart3
      },
      {
        type: "improvement",
        title: "Validação de Dados nos Gráficos DRE",
        description: "Adicionada verificação robusta para evitar valores NaN/undefined em todos os gráficos da página DRE",
        icon: Shield
      },
      {
        type: "fix",
        title: "Correção da Estrutura da Tabela DRE",
        description: "Tabela DRE reformulada para modo normal (8 itens) e expandido (17 itens) conforme especificação técnica exata",
        icon: FileText
      },
      {
        type: "improvement",
        title: "Feedback de Usuário na Dedução Fiscal",
        description: "Melhorados toasts de feedback ao salvar dedução fiscal, incluindo tratamento de erros e confirmação de sucesso",
        icon: CheckCircle2
      },
      {
        type: "fix",
        title: "Problema de Salvamento nas APIs",
        description: "Corrigidas APIs de despesas e entradas que não salvavam categoryId e isPayroll devido a schemas de validação incompletos",
        icon: Database
      }
    ]
  },
  {
    version: "1.7.0",
    date: "2024-12-22",
    type: "major",
    status: "released",
    changes: [
      {
        type: "fix",
        title: "Correção Crítica do Middleware de Autenticação",
        description: "Resolvido erro 401 na identificação de roles, implementado acesso direto aos metadados do Clerk e fallback para emails admin específicos",
        icon: Shield
      },
      {
        type: "improvement",
        title: "Páginas Públicas Acessíveis",
        description: "Páginas /site, /sobre, /contato agora acessíveis para usuários logados e deslogados, com configuração ignoredRoutes do Clerk",
        icon: Users
      },
      {
        type: "feature",
        title: "Sistema Completo Aporte/Retirada",
        description: "Implementado formulário com campo tipo (aporte/retirada), lógica de subtração automática no backend e interface com ícones visuais",
        icon: TrendingUp
      },
      {
        type: "fix",
        title: "Cálculo de Rendimento Corrigido",
        description: "Taxa diária padronizada (0.04% ao dia), juros compostos baseados em data de início, separação entre aportes e retiradas no cálculo",
        icon: BarChart3
      },
      {
        type: "feature",
        title: "Sistema Avançado de Filtros",
        description: "Filtros completos na página de investimentos: busca, período, tipo, status, investidor específico, valor mín/máx com badges visuais",
        icon: Settings
      },
      {
        type: "fix",
        title: "Correções na Página DRE",
        description: "Tabela resumida completa (todas as linhas da DRE), modal de dedução fiscal funcional, lógica da receita bruta confirmada",
        icon: FileText
      },
      {
        type: "improvement",
        title: "Layout Interno Limpo",
        description: "Removidos botões WhatsApp/Bot do dashboard interno, mantidos apenas nas páginas públicas para não atrapalhar gráficos",
        icon: Zap
      },
      {
        type: "feature",
        title: "Role VIEWER Implementada",
        description: "Adicionado suporte completo para role VIEWER com acesso limitado ao dashboard principal e lógica de redirecionamento específica",
        icon: Users
      }
    ]
  },
  {
    version: "1.6.0",
    date: "2024-12-21",
    type: "minor",
    status: "released",
    changes: [
      {
        type: "fix",
        title: "Sistema de Roles para Investidores",
        description: "Correção crítica no webhook do Clerk - investidores agora recebem corretamente a role 'INVESTOR' ao se registrar, resolvendo problemas de redirecionamento",
        icon: Shield
      },
      {
        type: "improvement",
        title: "Scripts de Teste Automatizados",
        description: "Criados scripts para validação automática do sistema de roles e fluxo de investidores",
        icon: CheckCircle2
      },
      {
        type: "docs",
        title: "Documentação de Correção",
        description: "Plano detalhado de correção documentado em PLANO_CORRECAO_ROLES_USUARIOS.md",
        icon: FileText
      }
    ]
  },
  {
    version: "1.5.0",
    date: "2024-12-21",
    type: "minor",
    status: "released",
    changes: [
      {
        type: "fix",
        title: "Sistema de Investidores e Convites",
        description: "Correções em erros críticos no sistema de cadastro e gerenciamento de investidores",
        icon: Users
      },
      {
        type: "docs",
        title: "Documentação do Sistema de Investimentos",
        description: "Documentação completa e final do sistema de investimentos adicionada",
        icon: FileText
      },
      {
        type: "fix",
        title: "Interface TypeScript",
        description: "Corrigido erro na interface Investor - removido campo birthday, adicionado phone e status",
        icon: Bug
      }
    ]
  },
  {
    version: "1.4.0",
    date: "2024-12-20",
    type: "minor",
    status: "released",
    changes: [
      {
        type: "feature",
        title: "Sistema Completo de Investidores",
        description: "Atualização massiva com dashboard individual para investidores, cálculos de retorno em tempo real e gestão completa de aportes",
        icon: TrendingUp
      },
      {
        type: "improvement",
        title: "Interface de Usuário Refinada",
        description: "Melhorias significativas na experiência do usuário em todo o sistema",
        icon: Zap
      }
    ]
  },
  {
    version: "1.3.0",
    date: "2024-12-19",
    type: "minor",
    status: "released",
    changes: [
      {
        type: "fix",
        title: "Tooltips Personalizados no DRE",
        description: "Corrigidas importações e funcionalidade dos tooltips na página de Demonstração de Resultados",
        icon: Bug
      },
      {
        type: "improvement",
        title: "Estabilidade do Sistema",
        description: "Múltiplas correções para melhorar a estabilidade geral da aplicação",
        icon: CheckCircle2
      }
    ]
  },
  {
    version: "1.2.0",
    date: "2024-12-18",
    type: "major",
    status: "released",
    changes: [
      {
        type: "feature",
        title: "Renovação Completa da Página de Operações",
        description: "Layout completamente redesenhado com tabs no topo, botões contextuais inteligentes e UX drasticamente melhorada",
        icon: BarChart3
      },
      {
        type: "feature",
        title: "DatePicker Aprimorado",
        description: "Fechamento automático ao selecionar data, experiência de um clique apenas",
        icon: Plus
      },
      {
        type: "feature",
        title: "Sistema de Categorias para Entradas",
        description: "11 categorias predefinidas com descrições detalhadas (vendas, serviços, consultoria, etc.)",
        icon: Database
      },
      {
        type: "improvement",
        title: "Efeitos Visuais nos Formulários",
        description: "Hover effects, focus rings personalizados e transições suaves de 300ms",
        icon: Zap
      },
      {
        type: "improvement",
        title: "Dados Reais nos Gráficos",
        description: "Substituição completa de mock data por dados reais do banco de dados",
        icon: BarChart3
      },
      {
        type: "improvement",
        title: "Tabelas Aprimoradas",
        description: "Novas colunas: Tributável e Gasto com Folha, badges coloridos para status",
        icon: FileText
      }
    ]
  },
  {
    version: "1.1.0",
    date: "2024-12-15",
    type: "minor",
    status: "released",
    changes: [
      {
        type: "feature",
        title: "Sistema de Autenticação",
        description: "Implementação completa com Clerk, roles e middleware de proteção",
        icon: Shield
      },
      {
        type: "feature",
        title: "Dashboard Principal",
        description: "Interface principal com KPIs, gráficos e widgets interativos",
        icon: BarChart3
      },
      {
        type: "feature",
        title: "Gestão Financeira",
        description: "Sistema completo de despesas, receitas e categorização",
        icon: TrendingUp
      }
    ]
  },
  {
    version: "1.0.0",
    date: "2024-12-10",
    type: "major",
    status: "released",
    changes: [
      {
        type: "feature",
        title: "Lançamento da Federal Invest Platform",
        description: "Primeira versão da plataforma de gestão financeira com Next.js 14, PostgreSQL e autenticação Clerk",
        icon: Plus
      },
      {
        type: "feature",
        title: "Arquitetura Base",
        description: "Setup completo com Drizzle ORM, TailwindCSS, Shadcn/ui e deploy na Vercel",
        icon: Database
      }
    ]
  }
];

const typeColors = {
  feature: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  fix: "bg-red-500/10 text-red-600 border-red-500/20",
  improvement: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  docs: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  security: "bg-orange-500/10 text-orange-600 border-orange-500/20"
};

const statusColors = {
  released: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  beta: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  planned: "bg-blue-500/10 text-blue-600 border-blue-500/20"
};

const versionTypeColors = {
  major: "bg-red-500/10 text-red-600 border-red-500/20",
  minor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  patch: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

// Helper to format ISO date (YYYY-MM-DD) to Brazilian format dd/MM/yyyy consistently
function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Fallback manual formatting if input is a plain YYYY-MM-DD string
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    return dateStr;
  }
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function ChangelogPage() {
  // Set header content
  useHeaderContent({
    title: "Changelog",
    subtitle: "Histórico de versões e atualizações da Federal Invest Platform"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Federal Invest Platform</h1>
            <p className="text-muted-foreground">Versão 2.0.0 - Sistema de Juros Compostos Revolucionário</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className={statusColors.released}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Versão Estável
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Database className="w-3 h-3 mr-1" />
            Banco Corrigido
          </Badge>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <GlassCard>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {changelog.filter(v => v.status === 'released').length}
            </div>
            <div className="text-sm text-muted-foreground">Versões Lançadas</div>
          </CardContent>
        </GlassCard>
        
        <GlassCard>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {changelog.reduce((acc, v) => acc + v.changes.filter(c => c.type === 'feature').length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Novas Funcionalidades</div>
          </CardContent>
        </GlassCard>
        
        <GlassCard>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {changelog.reduce((acc, v) => acc + v.changes.filter(c => c.type === 'fix').length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Correções</div>
          </CardContent>
        </GlassCard>
      </motion.div>

      {/* Changelog Entries */}
      <div className="space-y-8">
        {changelog.map((entry, index) => (
          <motion.div
            key={entry.version}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={versionTypeColors[entry.type]}>
                      v{entry.version}
                    </Badge>
                    <Badge variant="outline" className={statusColors[entry.status]}>
                      {entry.status === 'released' ? 'Lançado' : 
                       entry.status === 'beta' ? 'Beta' : 'Planejado'}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDateBR(entry.date)}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {entry.changes.map((change, changeIndex) => (
                  <motion.div
                    key={changeIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index * 0.1) + (changeIndex * 0.05) }}
                    className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${typeColors[change.type]}`}>
                        <change.icon className="w-4 h-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{change.title}</h4>
                        <Badge variant="outline" className={`text-xs ${typeColors[change.type]}`}>
                          {change.type === 'feature' ? 'Nova Funcionalidade' :
                           change.type === 'fix' ? 'Correção' :
                           change.type === 'improvement' ? 'Melhoria' :
                           change.type === 'docs' ? 'Documentação' : 'Segurança'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {change.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-8"
      >
        <Separator className="mb-6" />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Desenvolvido com ❤️ pela equipe Federal Invest
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Next.js 14</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>Clerk Auth</span>
            <span>•</span>
            <span>Vercel Deploy</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 