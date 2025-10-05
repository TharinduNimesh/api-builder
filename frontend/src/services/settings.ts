import { apiFetch } from '@/lib/api';
import { notifyError, notifySuccess } from '@/lib/notify';

const BASE_URL = '/api/settings';

export interface SettingsData {
  project: {
    id: string;
    name: string;
    description?: string | null;
    createdById: string;
    enable_roles: boolean;
    roles: any[];
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
  try {
    const res = await apiFetch(`${BASE_URL}/`);
    return {
      project: res.project,
      user: res.user,
      isOwner: res.isOwner,
    };
  } catch (err: any) {
    notifyError(err?.message || 'Failed to fetch settings');
    throw err;
  }
}

// Update project information (owner only)
export async function updateProject(data: { name: string; description?: string }) {
  try {
    const res = await apiFetch(`${BASE_URL}/project`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    notifySuccess('Project updated successfully');
    return res.project;
  } catch (err: any) {
    notifyError(err?.message || 'Failed to update project');
    throw err;
  }
}

// Update user profile
export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}) {
  try {
    const res = await apiFetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    notifySuccess('Profile updated successfully');
    return res.user;
  } catch (err: any) {
    notifyError(err?.message || 'Failed to update profile');
    throw err;
  }
}

// Update roles (owner only)
export async function updateRoles(data: { roles: any[]; enable_roles?: boolean }) {
  try {
    const res = await apiFetch(`${BASE_URL}/roles`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    notifySuccess('Roles updated successfully');
    return res.project;
  } catch (err: any) {
    notifyError(err?.message || 'Failed to update roles');
    throw err;
  }
}

// Reset project (owner only)
export async function resetProject() {
  try {
    await apiFetch(`${BASE_URL}/reset`, {
      method: 'POST',
    });
    notifySuccess('Project reset successfully');
  } catch (err: any) {
    notifyError(err?.message || 'Failed to reset project');
    throw err;
  }
}

// Delete account (owner only)
export async function deleteAccount() {
  try {
    await apiFetch(`${BASE_URL}/account`, {
      method: 'DELETE',
    });
    notifySuccess('Account deleted successfully');
  } catch (err: any) {
    notifyError(err?.message || 'Failed to delete account');
    throw err;
  }
}
