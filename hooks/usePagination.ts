import { useState, useCallback } from 'react';

export interface PagyResponse<T> {
  [key: string]: T[] | any; // Dynamic key for the data array (e.g., "accounts", "users")
  pagy: {
    count: number;
    page: number;
    last: number;
    pages: number;
    prev: number | null;
    next: number | null;
  };
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
  loading: boolean;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setLoading: (loading: boolean) => void;
  updateFromResponse: <T>(response: PagyResponse<T>) => void;
  reset: () => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPageSize = 10 } = options;

  const [state, setState] = useState<PaginationState>({
    current: initialPage,
    pageSize: initialPageSize,
    total: 0,
    loading: false,
  });

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, current: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, pageSize: size, current: 1 }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const updateFromResponse = useCallback(<T,>(response: PagyResponse<T>) => {
    setState(prev => ({
      ...prev,
      current: response.pagy.page,
      total: response.pagy.count,
      loading: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      current: initialPage,
      pageSize: initialPageSize,
      total: 0,
      loading: false,
    });
  }, [initialPage, initialPageSize]);

  const getQueryParams = useCallback(() => ({
    page: state.current,
    limit: state.pageSize,
  }), [state.current, state.pageSize]);

  const actions: PaginationActions = {
    setPage,
    setPageSize,
    setLoading,
    updateFromResponse,
    reset,
  };

  return {
    ...state,
    ...actions,
    getQueryParams,
  };
}