export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
};

const USER_KEY = 'ab_user';
const TOKEN_KEY = 'accessToken';

export function setUser(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) as User : null;
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function isActive() {
  const u = getUser();
  return !!u && !!u.is_active;
}

export function clearAuth() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
