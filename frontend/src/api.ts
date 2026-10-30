export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && !path.startsWith('/auth')) { localStorage.removeItem('token'); location.reload(); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'حصل خطأ');
  return data;
}
