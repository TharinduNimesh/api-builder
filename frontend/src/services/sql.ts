import { apiFetch } from '@/lib/api';
import { notifyError, notifySuccess } from '@/lib/notify';

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
