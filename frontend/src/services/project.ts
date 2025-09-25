import { apiFetch } from '@/lib/api';
import { notifyError } from '@/lib/notify';

export async function getProject() {
  try {
    const res = await apiFetch('/api/project');
    return res.project as any;
  } catch (err: any) {
    notifyError(err?.message || err);
    throw err;
  }
}

export async function createProject(data: { name: string; enable_roles?: boolean; roles?: any[]; is_protected?: boolean }) {
  try {
    return await apiFetch('/api/project', { method: 'POST', body: JSON.stringify(data) });
  } catch (err: any) {
    notifyError(err?.message || err);
    throw err;
  }
}
