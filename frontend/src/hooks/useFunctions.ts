import { useState, useCallback } from 'react';
import * as functionsService from '@/services/functions';
import type { FunctionData } from '@/services/functions';

export function useFunctions() {
  const [functions, setFunctions] = useState<FunctionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunctions = useCallback(async (force = false) => {
    try {
      setError(null);
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await functionsService.listFunctions();
      setFunctions(data);
    } catch (err: any) {
      console.error('Failed to fetch functions:', err);
      setError(err?.message || 'Failed to load functions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  return {
    functions,
    loading,
    refreshing,
    error,
    fetchFunctions,
  };
}
