import { getAccessToken, setAccessToken, clearAuth } from '@/lib/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export type ApiError = { status?: string; message?: string; details?: any };

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const token = getAccessToken();
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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


  // If unauthorized, try a single refresh attempt (unless this request was the refresh endpoint)
  if (!res.ok) {
    const payload: ApiError = data || { message: res.statusText };
    if (res.status === 401 && !path.includes('/api/auth/refresh')) {
      // Use a single in-flight refresh promise to avoid race conditions where
      // multiple requests try to refresh simultaneously and some fail / redirect.
      const newToken = await ensureRefresh();
      if (newToken) {
        // retry original request once with new token
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...(config.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
        };
        const retryRes = await fetch(url, retryConfig);
        const retryText = await retryRes.text();
        let retryData: any = undefined;
        try { retryData = retryText ? JSON.parse(retryText) : undefined; } catch (e) { retryData = retryText; }
        if (!retryRes.ok) {
          const p: ApiError = retryData || { message: retryRes.statusText };
          throw p;
        }
        return retryData;
      }

      // refresh failed -> clear client auth and redirect to sign-in
      clearAuth();
      try { window.location.href = '/signin'; } catch (e) {}
      throw payload;
    }
    throw payload;
  }

  return data;
}

// ---- refresh coordination ----
let _refreshPromise: Promise<string | null> | null = null;

async function ensureRefresh(): Promise<string | null> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
      const refreshText = await refreshRes.text();
      const refreshData = refreshText ? JSON.parse(refreshText) : undefined;
      if (refreshRes.ok && refreshData?.accessToken) {
        setAccessToken(refreshData.accessToken);
        return refreshData.accessToken as string;
      }
      // If refresh endpoint responded ok but no accessToken was returned,
      // treat as failure (caller will clear auth). Some backends may set cookie-only
      // flows; if yours does not return an access token in the body, consider
      // updating the backend to include it for SPA clients.
      return null;
    } catch (e) {
      return null;
    } finally {
      // allow subsequent refresh attempts
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}
