import Cookies from 'js-cookie';
import { Period } from '@/features/finance/types';

// Chaves para armazenamento
const STORAGE_KEYS = {
  DRE_PERIOD: 'federal_invest_dre_period',
  DRE_PERIOD_TYPE: 'federal_invest_dre_period_type',
  UI_PREFERENCES: 'federal_invest_ui_preferences',
  DASHBOARD_PERIOD: 'federal_invest_dashboard_period',
  DASHBOARD_PERIOD_TYPE: 'federal_invest_dashboard_period_type',
};

// Constantes para expiração de cookies
const COOKIE_EXPIRATION = {
  STANDARD: 30, // dias
};

// Funções para gerenciar o período do DRE
export const saveDREPeriod = (period: Period): void => {
  localStorage.setItem(STORAGE_KEYS.DRE_PERIOD, JSON.stringify(period));
  
  // Também salvamos como cookie para persistência entre sessões
  document.cookie = `${STORAGE_KEYS.DRE_PERIOD}=${JSON.stringify(period)}; path=/; max-age=${COOKIE_EXPIRATION.STANDARD * 24 * 60 * 60}; SameSite=Strict`;
};

export const getDREPeriod = (): Period | null => {
  // Primeiro, tentamos obter do localStorage (mais recente)
  const storedPeriod = localStorage.getItem(STORAGE_KEYS.DRE_PERIOD);
  
  if (storedPeriod) {
    try {
      return JSON.parse(storedPeriod);
    } catch (e) {
      console.error('Erro ao processar período do DRE do localStorage:', e);
    }
  }
  
  // Se não encontrou no localStorage, tenta nos cookies
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const periodCookie = cookies.find(cookie => cookie.startsWith(`${STORAGE_KEYS.DRE_PERIOD}=`));
  
  if (periodCookie) {
    try {
      const periodValue = periodCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(periodValue));
    } catch (e) {
      console.error('Erro ao processar período do DRE do cookie:', e);
    }
  }
  
  return null;
};

// Funções para gerenciar o tipo de período (mensal, trimestral, anual)
export const saveDREPeriodType = (periodType: 'monthly' | 'quarterly' | 'annual'): void => {
  localStorage.setItem(STORAGE_KEYS.DRE_PERIOD_TYPE, periodType);
  
  // Também salvamos como cookie para persistência entre sessões
  document.cookie = `${STORAGE_KEYS.DRE_PERIOD_TYPE}=${periodType}; path=/; max-age=${COOKIE_EXPIRATION.STANDARD * 24 * 60 * 60}; SameSite=Strict`;
};

export const getDREPeriodType = (): 'monthly' | 'quarterly' | 'annual' | null => {
  // Primeiro, tentamos obter do localStorage (mais recente)
  const storedType = localStorage.getItem(STORAGE_KEYS.DRE_PERIOD_TYPE) as 'monthly' | 'quarterly' | 'annual' | null;
  
  if (storedType) {
    return storedType;
  }
  
  // Se não encontrou no localStorage, tenta nos cookies
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const typeCookie = cookies.find(cookie => cookie.startsWith(`${STORAGE_KEYS.DRE_PERIOD_TYPE}=`));
  
  if (typeCookie) {
    const typeValue = typeCookie.split('=')[1];
    return decodeURIComponent(typeValue) as 'monthly' | 'quarterly' | 'annual';
  }
  
  return null;
};

// Interface para preferências de UI
interface UIPreferences {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  tableCompactMode?: boolean;
  dashboardLayout?: 'standard' | 'compact' | 'detailed';
  [key: string]: any; // Para permitir personalização futura
}

// Funções para gerenciar preferências de UI
export const saveUIPreference = (key: string, value: any): void => {
  let preferences: UIPreferences = {};
  
  const stored = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
  if (stored) {
    try {
      preferences = JSON.parse(stored);
    } catch (e) {
      console.error('Erro ao processar preferências de UI:', e);
    }
  }
  
  preferences[key] = value;
  localStorage.setItem(STORAGE_KEYS.UI_PREFERENCES, JSON.stringify(preferences));
  
  // Também salvamos como cookie para persistência entre sessões
  document.cookie = `${STORAGE_KEYS.UI_PREFERENCES}=${JSON.stringify(preferences)}; path=/; max-age=${COOKIE_EXPIRATION.STANDARD * 24 * 60 * 60}; SameSite=Strict`;
};

export const getUIPreference = <T>(key: string, defaultValue: T): T => {
  let preferences: UIPreferences = {};
  
  // Primeiro, tentamos obter do localStorage (mais recente)
  const stored = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
  if (stored) {
    try {
      preferences = JSON.parse(stored);
      if (key in preferences) {
        return preferences[key] as T;
      }
    } catch (e) {
      console.error('Erro ao processar preferências de UI do localStorage:', e);
    }
  }
  
  // Se não encontrou no localStorage, tenta nos cookies
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const prefCookie = cookies.find(cookie => cookie.startsWith(`${STORAGE_KEYS.UI_PREFERENCES}=`));
  
  if (prefCookie) {
    try {
      const prefValue = prefCookie.split('=')[1];
      preferences = JSON.parse(decodeURIComponent(prefValue));
      if (key in preferences) {
        return preferences[key] as T;
      }
    } catch (e) {
      console.error('Erro ao processar preferências de UI do cookie:', e);
    }
  }
  
  return defaultValue;
};

export const getAllUIPreferences = (): UIPreferences => {
  let preferences: UIPreferences = {};
  
  // Primeiro, tentamos obter do localStorage (mais recente)
  const stored = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
  if (stored) {
    try {
      preferences = JSON.parse(stored);
    } catch (e) {
      console.error('Erro ao processar preferências de UI do localStorage:', e);
    }
  }
  
  // Se não encontrou no localStorage, tenta nos cookies
  if (Object.keys(preferences).length === 0) {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const prefCookie = cookies.find(cookie => cookie.startsWith(`${STORAGE_KEYS.UI_PREFERENCES}=`));
    
    if (prefCookie) {
      try {
        const prefValue = prefCookie.split('=')[1];
        preferences = JSON.parse(decodeURIComponent(prefValue));
      } catch (e) {
        console.error('Erro ao processar preferências de UI do cookie:', e);
      }
    }
  }
  
  return preferences;
};

// Função para limpar todas as preferências
export const clearAllPreferences = (): void => {
  localStorage.removeItem(STORAGE_KEYS.DRE_PERIOD);
  localStorage.removeItem(STORAGE_KEYS.DRE_PERIOD_TYPE);
  localStorage.removeItem(STORAGE_KEYS.UI_PREFERENCES);
  localStorage.removeItem(STORAGE_KEYS.DASHBOARD_PERIOD);
  localStorage.removeItem(STORAGE_KEYS.DASHBOARD_PERIOD_TYPE);
  
  // Limpar cookies também
  document.cookie = `${STORAGE_KEYS.DRE_PERIOD}=; path=/; max-age=0; SameSite=Strict`;
  document.cookie = `${STORAGE_KEYS.DRE_PERIOD_TYPE}=; path=/; max-age=0; SameSite=Strict`;
  document.cookie = `${STORAGE_KEYS.UI_PREFERENCES}=; path=/; max-age=0; SameSite=Strict`;
  document.cookie = `${STORAGE_KEYS.DASHBOARD_PERIOD}=; path=/; max-age=0; SameSite=Strict`;
  document.cookie = `${STORAGE_KEYS.DASHBOARD_PERIOD_TYPE}=; path=/; max-age=0; SameSite=Strict`;
};

// Funções para gerenciar o período do Dashboard
export const saveDashboardPeriod = (period: Period): void => {
  localStorage.setItem(STORAGE_KEYS.DASHBOARD_PERIOD, JSON.stringify(period));
  
  // Também salvamos como cookie para persistência entre sessões
  document.cookie = `${STORAGE_KEYS.DASHBOARD_PERIOD}=${JSON.stringify(period)}; path=/; max-age=${COOKIE_EXPIRATION.STANDARD * 24 * 60 * 60}; SameSite=Strict`;
};

export const getDashboardPeriod = (): Period | null => {
  // Primeiro, tentamos obter do localStorage (mais recente)
  const storedPeriod = localStorage.getItem(STORAGE_KEYS.DASHBOARD_PERIOD);
  
  if (storedPeriod) {
    try {
      return JSON.parse(storedPeriod);
    } catch (e) {
      console.error('Erro ao processar período do Dashboard do localStorage:', e);
    }
  }
  
  // Se não encontrou no localStorage, tenta nos cookies
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const periodCookie = cookies.find(cookie => cookie.startsWith(`${STORAGE_KEYS.DASHBOARD_PERIOD}=`));
  
  if (periodCookie) {
    try {
      const periodValue = periodCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(periodValue));
    } catch (e) {
      console.error('Erro ao processar período do Dashboard do cookie:', e);
    }
  }
  
  return null;
};

// Funções para gerenciar o tipo de período do Dashboard
export const saveDashboardPeriodType = (periodType: 'monthly' | 'quarterly' | 'annual'): void => {
  localStorage.setItem(STORAGE_KEYS.DASHBOARD_PERIOD_TYPE, periodType);
  
  // Também salvamos como cookie para persistência entre sessões
  document.cookie = `${STORAGE_KEYS.DASHBOARD_PERIOD_TYPE}=${periodType}; path=/; max-age=${COOKIE_EXPIRATION.STANDARD * 24 * 60 * 60}; SameSite=Strict`;
};

export const getDashboardPeriodType = (): 'monthly' | 'quarterly' | 'annual' | null => {
  // Primeiro, tentamos obter do localStorage (mais recente)
  const storedType = localStorage.getItem(STORAGE_KEYS.DASHBOARD_PERIOD_TYPE) as 'monthly' | 'quarterly' | 'annual' | null;
  
  if (storedType) {
    return storedType;
  }
  
  // Se não encontrou no localStorage, tenta nos cookies
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const typeCookie = cookies.find(cookie => cookie.startsWith(`${STORAGE_KEYS.DASHBOARD_PERIOD_TYPE}=`));
  
  if (typeCookie) {
    const typeValue = typeCookie.split('=')[1];
    return decodeURIComponent(typeValue) as 'monthly' | 'quarterly' | 'annual';
  }
  
  return null;
}; 