// Taxa de juros mensal (1.2% ao mês)
export const MONTHLY_RETURN_RATE = 0.012;

// Taxa de juros diária fixa (aprox. 0,03945% ao dia) - DEPRECATED
// Mantida apenas para compatibilidade com código legado
export const DAILY_RETURN_RATE = 0.000394520548;

// Função que calcula o retorno financeiro proporcional ao número de dias de aplicação.
// O cálculo considera juros compostos diários a partir de uma taxa fixa.
// Parâmetros:
//   amount: valor principal investido/aplicado
//   days: quantidade de dias que o valor ficou investido
// Retorna:
//   O valor do rendimento (juros) obtido no período informado.
//
// Exemplo de uso: calcular quanto um aporte de R$1000 renderia em 30 dias.
//
// Fórmula utilizada:
//   retorno = amount * ( (1 + dailyRate) ^ days - 1 )
export const calculatePreciseReturn = (amount: number, days: number): number => {
  const dailyRate = DAILY_RETURN_RATE; // Taxa de juros diária (aprox. 0,03945% ao dia)
  // Calcula o fator de capitalização composto para o período
  const capitalizationFactor = Math.pow(1 + dailyRate, days);
  // Retorna apenas o rendimento (juros), sem o principal
  return amount * (capitalizationFactor - 1);
};

// Animation variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  }
};

// Chart colors
export const CHART_COLORS = {
  primary: "#3B82F6", // blue-500
  secondary: "#10B981", // emerald-500
  accent: "#F59E0B", // amber-500
  danger: "#EF4444", // red-500
  success: "#22C55E", // green-500
  warning: "#F97316", // orange-500
  info: "#06B6D4", // cyan-500
  gradient: {
    from: "#3B82F6",
    to: "#1D4ED8"
  }
};

// Tabs configuration
export const TABS_CONFIG = [
  {
    value: "overview",
    label: "Visão Geral",
    icon: "BarChart3"
  },
  {
    value: "contributions", 
    label: "Aportes e Retiradas",
    icon: "ArrowUpDown"
  }
];

// Default filter values
export const DEFAULT_FILTERS = {
  search: "",
  investorId: "",
  type: "all" as const,
  status: "all" as const,
  dateRange: undefined
};
