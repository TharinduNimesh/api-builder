import { useState, useCallback } from 'react';
import { getTables } from '@/services/tables';
import { notifyError } from '@/lib/notify';

export interface TableData {
  name: string;
  full_name?: string;
  schema?: string;
  columns?: any[];
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
  updatedById?: string;
}

export const useTables = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTables = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      
      const rows = await getTables();
      const transformedTables = rows.map((r: any) => ({
        name: r.name,
        full_name: r.full_name,
        schema: r.schema,
        columns: Array.isArray(r.columns?.columns) ? r.columns.columns : [],
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        createdById: r.createdById,
        updatedById: r.updatedById,
      }));
      
      setTables(transformedTables);
    } catch (error) {
      notifyError('Failed to fetch tables');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  return {
    tables,
    loading,
    refreshing,
    fetchTables,
  };
};