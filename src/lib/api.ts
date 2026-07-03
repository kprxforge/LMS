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
  return fetch(url, { ...options, headers });
}
