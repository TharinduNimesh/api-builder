import { setUser, setAccessToken } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { notifyError } from '@/lib/notify';

export async function signup(data: { firstName: string; lastName: string; email: string; password: string }) {
  try {
    const payload = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (payload?.accessToken) setAccessToken(payload.accessToken);
    if (payload?.user) setUser(payload.user);
    return payload;
  } catch (err: any) {
    notifyError(err);
    throw err;
  }
}

export async function signin(data: { email: string; password: string }) {
  try {
    const payload = await apiFetch('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (payload?.accessToken) setAccessToken(payload.accessToken);
    if (payload?.user) setUser(payload.user);
    return payload;
  } catch (err: any) {
    notifyError(err);
    throw err;
  }
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function signout() {
  setUser(null);
  setAccessToken(null);
  // optionally call backend to clear cookie
}
