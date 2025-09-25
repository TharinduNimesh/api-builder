import { apiFetch } from '@/lib/api';

export interface UserPayload {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  createdAt: string;
}

export async function listUsers(status: 'all' | 'active' | 'inactive' = 'all') {
  const qs = status && status !== 'all' ? `?status=${status}` : '';
  const data = await apiFetch(`/api/users${qs}`);
  return data.users as UserPayload[];
}

export async function setUserStatus(userId: string, isActive: boolean) {
  const data = await apiFetch(`/api/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
  return data.user as { id: string; is_active: boolean };
}
