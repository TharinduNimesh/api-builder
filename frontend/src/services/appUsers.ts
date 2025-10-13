import { apiFetch } from '@/lib/api';

export interface AppUserPayload {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roles?: any;
  status: string;
  createdAt: string;
}

export async function listAppUsers(status: 'all' | 'active' | 'inactive' = 'all') {
  const qs = status && status !== 'all' ? `?status=${status}` : '';
  const data = await apiFetch(`/api/users/app${qs}`);
  return data.users as AppUserPayload[];
}

export async function setAppUserStatus(userId: string, isActive: boolean) {
  const data = await apiFetch(`/api/users/app/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
  return data.user as { id: string; status: string };
}
