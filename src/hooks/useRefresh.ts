import { useState, useCallback } from 'react';

export const useRefresh = (onRefresh: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return {
    isRefreshing,
    onRefresh: handleRefresh,
  };
};