import { useState, useCallback, useEffect } from 'react';
import { UploadHistory } from '@/db/schema';

interface UploadHistoryPagination {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

interface UseUploadHistoryOptions {
  initialPage?: number;
  pageSize?: number;
  initialFilter?: {
    success?: boolean;
  }
}

interface UseUploadHistoryReturn {
  data: UploadHistory[];
  pagination: UploadHistoryPagination;
  isLoading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: {success?: boolean}) => void;
  refetch: () => Promise<void>;
}

export function useUploadHistory({
  initialPage = 1,
  pageSize = 10,
  initialFilter = {}
}: UseUploadHistoryOptions = {}): UseUploadHistoryReturn {
  const [data, setData] = useState<UploadHistory[]>([]);
  const [pagination, setPagination] = useState<UploadHistoryPagination>({
    total: 0,
    page: initialPage,
    pageSize,
    pageCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState(initialFilter);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Construir URL com parâmetros de consulta
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.pageSize.toString());
      
      if (filter.success !== undefined) {
        params.append('success', filter.success.toString());
      }

      // Fazer a requisição à API
      const response = await fetch(`/api/upload-history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Atualizar estado com os dados recebidos
      setData(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filter]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Funções para controlar paginação e filtros
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, page: 1 }));
  }, []);

  const handleSetFilter = useCallback((newFilter: {success?: boolean}) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    data,
    pagination,
    isLoading,
    error,
    setPage,
    setPageSize,
    setFilter: handleSetFilter,
    refetch: fetchData
  };
} 