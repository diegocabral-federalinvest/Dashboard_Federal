import { DREData } from "@/features/finance/api/use-get-dre";

// Chaves para armazenamento em cache
const CACHE_KEYS = {
  DRE_DATA: 'federal_invest_dre_data_cache',
};

// Configuração para TTL (Time To Live) do cache
const CACHE_TTL = {
  DRE_DATA: 5 * 60 * 1000, // 5 minutos em milissegundos
};

// Estrutura para dados cacheados com timestamp
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Função para salvar dados do DRE em cache
export const cacheDREData = (
  key: string, 
  data: DREData, 
  ttl: number = CACHE_TTL.DRE_DATA
): void => {
  const cacheKey = `${CACHE_KEYS.DRE_DATA}_${key}`;
  const cacheItem: CacheItem<DREData> = {
    data,
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  } catch (e) {
    console.error('Erro ao salvar dados do DRE em cache:', e);
  }
};

// Função para recuperar dados do DRE do cache
export const getCachedDREData = (key: string): DREData | null => {
  const cacheKey = `${CACHE_KEYS.DRE_DATA}_${key}`;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    const cacheItem: CacheItem<DREData> = JSON.parse(cached);
    const now = Date.now();
    
    // Verificar se o cache ainda é válido
    if (now - cacheItem.timestamp > CACHE_TTL.DRE_DATA) {
      // Cache expirado
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return cacheItem.data;
  } catch (e) {
    console.error('Erro ao recuperar dados do DRE do cache:', e);
    return null;
  }
};

// Função para invalidar o cache do DRE
export const invalidateDRECache = (key?: string): void => {
  if (key) {
    // Invalidar apenas um item específico
    const cacheKey = `${CACHE_KEYS.DRE_DATA}_${key}`;
    localStorage.removeItem(cacheKey);
  } else {
    // Invalidar todos os caches do DRE
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEYS.DRE_DATA)) {
        localStorage.removeItem(key);
      }
    }
  }
};

// Função genérica para memoização com TTL
export function memoize<T, R>(
  fn: (...args: T[]) => R, 
  getTTL: () => number = () => 60 * 1000, // 1 minuto por padrão
  getKey: (...args: T[]) => string = (...args) => JSON.stringify(args)
): (...args: T[]) => R {
  const cache = new Map<string, { value: R; timestamp: number }>();
  
  return (...args: T[]): R => {
    const key = getKey(...args);
    const cached = cache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < getTTL()) {
      return cached.value;
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  };
}

// Função para pré-carregar dados
export const preloadDREData = async (
  fetchFn: (params: any) => Promise<DREData>,
  params: any,
  cacheKey: string
): Promise<DREData | null> => {
  try {
    // Primeiro verifica se já existe em cache
    const cachedData = getCachedDREData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Se não existir, busca os dados
    const data = await fetchFn(params);
    
    // Salva em cache
    cacheDREData(cacheKey, data);
    
    return data;
  } catch (e) {
    console.error('Erro ao pré-carregar dados do DRE:', e);
    return null;
  }
}; 