import { apiFetch } from '@/lib/api';

export interface EndpointData {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description?: string | null;
  sql: string;
  is_active: boolean;
  is_protected?: boolean;
  allowed_roles?: string[] | null;
  params?: Array<{ name: string; in: 'path' | 'query' | 'body'; type?: 'string' | 'number' | 'boolean'; required?: boolean }>;
  createdAt: string;
}

export interface CreateEndpointInput {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description?: string | null;
  sql: string;
  is_active?: boolean;
  params?: Array<{ name: string; in: 'path' | 'query' | 'body'; type?: 'string' | 'number' | 'boolean'; required?: boolean }>;
  is_protected?: boolean;
  allowed_roles?: string[];
}

export async function listEndpoints(): Promise<EndpointData[]> {
  const data = await apiFetch('/api/endpoints');
  return data?.endpoints || [];
}

export async function createEndpoint(input: CreateEndpointInput) {
  return await apiFetch('/api/endpoints', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateEndpoint(id: string, input: CreateEndpointInput) {
  return await apiFetch(`/api/endpoints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteEndpoint(id: string) {
  return await apiFetch(`/api/endpoints/${id}`, {
    method: 'DELETE',
  });
}
