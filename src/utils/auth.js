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
  const res = await fetch('/api/auth', { method: 'GET', credentials: 'include' });
  if (res.ok) return await res.json();
  return null;
}
