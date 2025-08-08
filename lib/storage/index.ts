// Re-exporta todas as funções e tipos relacionados a armazenamento
export * from './user-preferences';
export * from './cache-utils';

// Objeto de armazenamento com métodos acessíveis
const storageUtils = {
  // Preferências do usuário
  userPreferences: {
    save: {
      drePeriod: async (period: any) => await import('./user-preferences').then(m => m.saveDREPeriod(period)),
      drePeriodType: async (type: 'monthly' | 'quarterly' | 'annual') => await import('./user-preferences').then(m => m.saveDREPeriodType(type)),
      ui: async (key: string, value: any) => await import('./user-preferences').then(m => m.saveUIPreference(key, value)),
    },
    get: {
      drePeriod: async () => await import('./user-preferences').then(m => m.getDREPeriod()),
      drePeriodType: async () => await import('./user-preferences').then(m => m.getDREPeriodType()),
      ui: async <T>(key: string, defaultValue: T) => await import('./user-preferences').then(m => m.getUIPreference(key, defaultValue)),
      allUI: async () => await import('./user-preferences').then(m => m.getAllUIPreferences()),
    },
    clear: async () => await import('./user-preferences').then(m => m.clearAllPreferences()),
  },
  
  // Cache de dados
  cache: {
    dre: {
      save: async (key: string, data: any) => await import('./cache-utils').then(m => m.cacheDREData(key, data)),
      get: async (key: string) => await import('./cache-utils').then(m => m.getCachedDREData(key)),
      invalidate: async (key?: string) => await import('./cache-utils').then(m => m.invalidateDRECache(key)),
    },
    preload: {
      dre: async (fetchFn: any, params: any, cacheKey: string) => await import('./cache-utils').then(m => m.preloadDREData(fetchFn, params, cacheKey)),
    },
  },
  
  // Utilitários
  utils: {
    memoize: async <T, R>(fn: (...args: T[]) => R, getTTL?: () => number, getKey?: (...args: T[]) => string) => 
      await import('./cache-utils').then(m => m.memoize(fn, getTTL, getKey)),
  },
};

// Exporta o objeto como padrão
export default storageUtils; 