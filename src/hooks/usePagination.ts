import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  hasNext: boolean;
  isLoading: boolean;
}

export const usePagination = (
  fetchData: (page: number) => Promise<{ hasNext: boolean }>,
  resetTrigger?: any
) => {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    hasNext: true,
    isLoading: false,
  });

  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasNext) return;

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await fetchData(state.page + 1);
      setState(prev => ({
        page: prev.page + 1,
        hasNext: result.hasNext,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [state.page, state.hasNext, state.isLoading, fetchData]);

  const reset = useCallback(() => {
    setState({
      page: 1,
      hasNext: true,
      isLoading: false,
    });
  }, []);

  // Reset when trigger changes
  if (resetTrigger !== undefined) {
    reset();
  }

  return {
    ...state,
    loadMore,
    reset,
  };
};