import { apiFetch } from '@/lib/api';
import { notifyError } from '@/lib/notify';

export async function getTables() {
  try {
    const res = await apiFetch('/api/tables');
    return res?.tables || [];
  } catch (err: any) {
    notifyError(err?.message || err);
    throw err;
  }
}

export async function getTableColumns(schema: string, name: string) {
  try {
    const res = await apiFetch(`/api/tables/${encodeURIComponent(schema)}/${encodeURIComponent(name)}/columns`);
    return res?.columns || [];
  } catch (err: any) {
    notifyError(err?.message || err);
    throw err;
  }
}

export async function getTableRows(schema: string, name: string, limit = 50) {
  try {
    const res = await apiFetch(`/api/tables/${encodeURIComponent(schema)}/${encodeURIComponent(name)}/rows?limit=${Number(limit)}`);
    return res?.rows || [];
  } catch (err: any) {
    notifyError(err?.message || err);
    throw err;
  }
}

export async function deleteTable(schema: string, name: string) {
  try {
    const res = await apiFetch(`/api/tables/${encodeURIComponent(schema)}/${encodeURIComponent(name)}`, { method: 'DELETE' });
    return res;
  } catch (err: any) {
    notifyError(err?.message || err);
    throw err;
  }
}
