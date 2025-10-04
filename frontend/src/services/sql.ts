import { apiFetch } from '@/lib/api';
import { notifyError, notifySuccess } from '@/lib/notify';

// Types
export interface QueryResult {
  status: 'success' | 'error';
  rows?: any[];
  rowsAffected?: number;
  executionTime?: number;
  message?: string;
  warnings?: string[];
}

export interface QueryHistory {
  id: string;
  query: string;
  status: string;
  rowsAffected?: number;
  executionTime?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface SqlSnippet {
  id: string;
  name: string;
  description?: string;
  query: string;
  createdAt: string;
  updatedAt: string;
}

// Execute SQL query
export async function executeSQL(sql: string): Promise<QueryResult> {
  try {
    const result = await apiFetch('/api/sql/execute', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
    return result;
  } catch (err: any) {
    throw err;
  }
}

// Get recent query history
export async function getQueryHistory(limit: number = 5): Promise<QueryHistory[]> {
  const data = await apiFetch(`/api/sql/history?limit=${limit}`);
  return data?.history || [];
}

// Get all query history (paginated)
export async function getAllQueryHistory(page: number = 1, pageSize: number = 20) {
  const data = await apiFetch(`/api/sql/history/all?page=${page}&pageSize=${pageSize}`);
  return data;
}

// Save SQL snippet
export async function saveSnippet(name: string, query: string, description?: string) {
  const result = await apiFetch('/api/sql/snippets', {
    method: 'POST',
    body: JSON.stringify({ name, query, description }),
  });
  return result;
}

// Get recent snippets
export async function getSnippets(limit: number = 5): Promise<SqlSnippet[]> {
  const data = await apiFetch(`/api/sql/snippets?limit=${limit}`);
  return data?.snippets || [];
}

// Get all snippets (paginated)
export async function getAllSnippets(page: number = 1, pageSize: number = 20) {
  const data = await apiFetch(`/api/sql/snippets/all?page=${page}&pageSize=${pageSize}`);
  return data;
}

// Update snippet
export async function updateSnippet(id: string, name: string, query: string, description?: string) {
  const result = await apiFetch(`/api/sql/snippets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, query, description }),
  });
  return result;
}

// Delete snippet
export async function deleteSnippet(id: string) {
  const result = await apiFetch(`/api/sql/snippets/${id}`, {
    method: 'DELETE',
  });
  return result;
}

// Legacy table creation function
export async function runSql(sql: string) {
  try {
    const res = await apiFetch('/api/tables', { method: 'POST', body: JSON.stringify({ sql }) });
    if (res?.warnReplace) {
      // backend signals that CREATE OR REPLACE was used
      notifyError('Statement contains CREATE OR REPLACE — this can replace existing tables. Use at your own risk.');
    } else {
      notifySuccess('Table created');
    }
    return res;
  } catch (err: any) {
    notifyError(err?.message || err);
    throw err;
  }
}

