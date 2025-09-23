const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export type ApiError = { status?: string; message?: string; details?: any };

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const config: RequestInit = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  };

  let res: Response;
  try {
    res = await fetch(url, config);
  } catch (err: any) {
    throw { message: 'Network error', details: err } as ApiError;
  }

  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const payload: ApiError = data || { message: res.statusText };
    throw payload;
  }

  return data;
}
