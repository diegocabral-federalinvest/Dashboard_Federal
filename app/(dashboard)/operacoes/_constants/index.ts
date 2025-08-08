// Constantes para a página de operações financeiras

// Arrays de categorias (igual aos formulários)
const EXPENSE_CATEGORIES_ARRAY = [
  { id: "operacional", name: "Operacional", description: "Despesas de funcionamento do negócio" },
  { id: "marketing", name: "Marketing", description: "Publicidade e promoção" },
  { id: "folha", name: "Folha de Pagamento", description: "Salários e encargos trabalhistas" },
  { id: "impostos", name: "Impostos e Taxas", description: "Tributos e taxas governamentais" },
  { id: "aluguel", name: "Aluguel", description: "Locação de imóveis e equipamentos" },
  { id: "servicos", name: "Serviços", description: "Prestação de serviços terceirizados" },
  { id: "material", name: "Material", description: "Materiais de consumo e escritório" },
  { id: "tecnologia", name: "Tecnologia", description: "Software, hardware e TI" },
  { id: "viagem", name: "Viagem", description: "Despesas de viagem e hospedagem" },
  { id: "juridico", name: "Jurídico", description: "Serviços jurídicos e contábeis" },
  { id: "manutencao", name: "Manutenção", description: "Reparos e manutenção" },
  { id: "outros", name: "Outros", description: "Outras despesas não categorizadas" }
];

const ENTRY_CATEGORIES_ARRAY = [
  { id: "vendas", name: "Vendas", description: "Receitas de vendas de produtos" },
  { id: "servicos", name: "Serviços", description: "Prestação de serviços" },
  { id: "consultoria", name: "Consultoria", description: "Serviços de consultoria especializada" },
  { id: "locacao", name: "Locação", description: "Rendimentos de aluguel e locação" },
  { id: "juros", name: "Juros", description: "Rendimentos de investimentos" },
  { id: "dividendos", name: "Dividendos", description: "Dividendos e participações" },
  { id: "royalties", name: "Royalties", description: "Direitos autorais e royalties" },
  { id: "comissoes", name: "Comissões", description: "Comissões e indicações" },
  { id: "subvencoes", name: "Subvenções", description: "Auxílios e subvenções governamentais" },
  { id: "financiamento", name: "Financiamento", description: "Recursos de financiamento" },
  { id: "outros", name: "Outros", description: "Outras receitas não categorizadas" }
];

// Mapeamento de categorias de despesas (para getCategoryName)
export const EXPENSE_CATEGORIES = EXPENSE_CATEGORIES_ARRAY.reduce((acc, cat) => {
  acc[cat.id] = cat.name;
  return acc;
}, {} as Record<string, string>);

// Mapeamento de categorias de entradas (para getCategoryName)
export const ENTRY_CATEGORIES = ENTRY_CATEGORIES_ARRAY.reduce((acc, cat) => {
  acc[cat.id] = cat.name;
  return acc;
}, {} as Record<string, string>);

// Configurações de gráficos
export const CHART_CONFIG = {
  HEIGHT: 320,
  DAILY_CHART_HEIGHT: 270,
  COLORS: {
    PRIMARY: '#0366FF',
    SUCCESS: '#10B981',
    ERROR: '#EF4444',
    WARNING: '#F97316',
    PURPLE: '#8B5CF6'
  },
  DAYS_RANGE: 30,
  MONTHS_RANGE: 6,
  MAX_CATEGORIES: 6
} as const;

// Mensagens padrão
export const DEFAULT_MESSAGES = {
  NO_DATA: 'Sem dados',
  NO_DESCRIPTION: 'Sem descrição',
  NO_CATEGORY: 'Não categorizada',
  NO_TRANSACTIONS: 'Nenhuma transação',
  NO_OPERATIONS: 'Nenhuma operação registrada',
  LOADING: 'Carregando operações financeiras...'
} as const;

// Configurações de tabela
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  ALL_OPERATIONS_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [5, 10, 15, 20, 30, 50, 100],
  SEARCH_PLACEHOLDER: {
    EXPENSES: 'Buscar despesas...',
    ENTRIES: 'Buscar entradas...',
    ALL: 'Buscar operações...'
  }
} as const;
