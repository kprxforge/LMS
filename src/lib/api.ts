const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function apiFetch(url: string, options: any = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)) {
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  return fetch(fullUrl, { ...options, headers });
}

