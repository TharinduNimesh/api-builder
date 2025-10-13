import { apiFetch } from '@/lib/api';

// UI notifications are handled by components; services should throw errors for callers to notify
const BASE_URL = '/api/settings';

export interface SettingsData {
  project: {
    id: string;
    name: string;
    description?: string | null;
    createdById: string;
    enable_roles: boolean;
    roles: any[];
    signup_enabled: boolean;
    default_role: string | null;
    is_protected: boolean;
    api_key: string | null;
    createdAt: string;
  } | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    createdAt: string;
  };
  isOwner: boolean;
}

// Get all settings (project + user profile + isOwner flag)
export async function fetchSettings(): Promise<SettingsData> {
  const res = await apiFetch(`${BASE_URL}/`);
  return {
    project: res.project,
    user: res.user,
    isOwner: res.isOwner,
  };
}

// Update project information (owner only)
export async function updateProject(data: { name: string; description?: string }) {
  const res = await apiFetch(`${BASE_URL}/project`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.project;
}

// Update user profile
export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}) {
  const res = await apiFetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.user;
}

// Update roles (owner only)
export async function updateRoles(data: { roles: any[]; enable_roles?: boolean; signup_enabled?: boolean; default_role?: string | null }) {
  const res = await apiFetch(`${BASE_URL}/roles`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.project;
}

// Reset project (owner only)
export async function resetProject() {
  await apiFetch(`${BASE_URL}/reset`, {
    method: 'POST',
  });
  return;
}

// Delete account (owner only)
export async function deleteAccount() {
  await apiFetch(`${BASE_URL}/account`, {
    method: 'DELETE',
  });
  return;
}
