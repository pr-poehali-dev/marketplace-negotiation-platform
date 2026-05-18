import func2url from '../../backend/func2url.json';

const URLS = func2url as Record<string, string>;

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(
  fn: keyof typeof func2url,
  path: string,
  method: string = 'GET',
  body?: unknown
): Promise<T> {
  const url = URLS[fn] + path;
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['X-Auth-Token'] = token;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  get: <T>(fn: keyof typeof func2url, path: string) => request<T>(fn, path),
  post: <T>(fn: keyof typeof func2url, path: string, body: unknown) => request<T>(fn, path, 'POST', body),
  put: <T>(fn: keyof typeof func2url, path: string, body: unknown) => request<T>(fn, path, 'PUT', body),
  delete: <T>(fn: keyof typeof func2url, path: string) => request<T>(fn, path, 'DELETE'),
  getToken,
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  clearToken: () => localStorage.removeItem('auth_token'),
};
