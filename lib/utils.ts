import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor numérico para o formato de moeda brasileira (BRL)
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada como moeda (ex: R$ 1.234,56)
 */
export function formatCurrency(
  value: number, 
  options: { 
    currency?: string; 
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const { 
    currency = 'BRL', 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2 
  } = options;

  // Validar se o valor é um número válido
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(0);
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

// Format percentage values
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

// Format date values to Brazilian format
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Safely formats a date value with comprehensive error handling
 * @param value - Date value (string, Date, null, undefined, or any other type)
 * @param fallback - Fallback message for invalid dates (default: 'Data não informada')
 * @returns Formatted date string or fallback message
 */
export function formatSafeDate(
  value: string | Date | null | undefined | any, 
  fallback: string = 'Data não informada'
): string {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return fallback;
  }

  // Handle string values
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      return fallback;
    }
  }

  // Reject non-date types that shouldn't be converted to dates
  if (typeof value === 'boolean' || Array.isArray(value) || 
      (typeof value === 'object' && !(value instanceof Date)) ||
      (typeof value === 'number' && value < 0)) {
    return 'Data inválida';
  }

  // Handle the special case of 0 (epoch start) - treat as falsy for our use case
  if (value === 0) {
    return fallback;
  }

  try {
    // Create Date object
    const parsedDate = value instanceof Date ? value : new Date(value);
    
    // Validate the date
    if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(parsedDate);
    } else {
      return 'Data inválida';
    }
  } catch (error) {
    return 'Data inválida';
  }
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

// Truncate text with ellipsis 
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
