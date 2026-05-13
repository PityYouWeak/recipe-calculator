export async function loginOrRegister({ email, password, name, type }) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, type }),
    credentials: 'include'
  });
  return await res.json();
}

export async function getCurrentUser() {
  const headers = { credentials: 'include' };
  const token = localStorage.getItem('jwt');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch('/api/auth', { method: 'GET', ...headers });
  if (res.ok) return await res.json();
  return null;
}
