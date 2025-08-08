/**
 * Client-side API functions
 * 
 * This module provides client-side functions for API calls.
 * It does NOT import any server-side code or database connections.
 */

import { DashboardData } from "@/types/dashboard";
import logger from '@/lib/frontend-logger';

export interface DashboardFilterParams {
  period: "month" | "quarter" | "year" | "custom";
  year?: number;
  month?: number;
  quarter?: number;
  isAnnual?: boolean;
  startDate?: string;
  endDate?: string;
  includeRevenues?: boolean;
  includeExpenses?: boolean;
  includeInvestments?: boolean;
}

/**
 * Fetches dashboard summary data with optional filters
 * Client-side function for use in components
 */
export async function fetchDashboardData(filters: DashboardFilterParams): Promise<DashboardData> {
  try {
    const params = new URLSearchParams({
      period: filters.period,
      ...(filters.year && { year: filters.year.toString() }),
      ...(filters.month && { month: filters.month.toString() }),
      ...(filters.quarter && { quarter: filters.quarter.toString() }),
      ...(filters.isAnnual && { isAnnual: 'true' }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      includeRevenues: String(filters.includeRevenues ?? true),
      includeExpenses: String(filters.includeExpenses ?? true),
      includeInvestments: String(filters.includeInvestments ?? true),
    });
    
    const response = await fetch('/api/finance?' + params.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  } catch (error) {
    logger.logApiError('/api/finance', error, { filters });
    throw error;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || ''
      : '';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data.data || data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard Data
  async getDashboardData(filters?: DashboardFilterParams): Promise<DashboardData> {
    const queryParams = new URLSearchParams();
    
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.year) queryParams.append('year', filters.year.toString());
    if (filters?.month) queryParams.append('month', filters.month.toString());
    if (filters?.quarter) queryParams.append('quarter', filters.quarter.toString());
    if (filters?.isAnnual) queryParams.append('isAnnual', 'true');
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.includeRevenues !== undefined) queryParams.append('includeRevenues', filters.includeRevenues.toString());
    if (filters?.includeExpenses !== undefined) queryParams.append('includeExpenses', filters.includeExpenses.toString());
    if (filters?.includeInvestments !== undefined) queryParams.append('includeInvestments', filters.includeInvestments.toString());

    const endpoint = `/api/finance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<DashboardData>(endpoint);
  }

  // Finance Data
  async getFinanceData(filters?: any) {
    const queryParams = new URLSearchParams(filters || {});
    return this.request(`/api/finance?${queryParams.toString()}`);
  }

  // DRE Data
  async getDREData(filters?: any) {
    const queryParams = new URLSearchParams(filters || {});
    return this.request(`/api/reports/dre?${queryParams.toString()}`);
  }

  // Upload History
  async getUploadHistory(limit?: number, offset?: number) {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());
    
    return this.request(`/api/upload-history?${queryParams.toString()}`);
  }

  // Export Data
  async exportData(type: 'dashboard' | 'dre' | 'finance', filters?: any) {
    return this.request(`/api/export/${type}`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }
}

export const apiClient = new ApiClient(); 