import { apiFetch } from '@/lib/api';

export interface FunctionData {
  id?: string;
  name: string;
  schema: string;
  full_name?: string;
  parameters?: string;
  return_type?: string;
  definition?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFunctionInput {
  sql: string;
}

export async function listFunctions(): Promise<FunctionData[]> {
  const data = await apiFetch('/api/functions');
  return data?.functions || [];
}

export async function createFunction(input: CreateFunctionInput): Promise<{ status: string; result?: any }> {
  return await apiFetch('/api/functions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getFunctionDefinition(schema: string, name: string): Promise<any> {
  const data = await apiFetch(`/api/functions/${schema}/${name}`);
  return data?.definition || null;
}

export async function deleteFunction(schema: string, name: string): Promise<{ status: string }> {
  return await apiFetch(`/api/functions/${schema}/${name}`, {
    method: 'DELETE',
  });
}

export async function runFunction(schema: string, name: string, args: any[] = []) {
  const data = await apiFetch(`/api/functions/${schema}/${name}/run`, {
    method: 'POST',
    body: JSON.stringify({ args }),
  });
  return data;
}
