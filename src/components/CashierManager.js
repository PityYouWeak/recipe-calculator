import React, { useEffect, useState } from 'react';

// Simple CRUD manager for cashiers stored per-manager in localStorage.
// Each cashier: { id, username, employeeId, createdAt }

const storageKey = (userId) => `cashiers:${userId}`;

const CashierManager = ({ user }) => {
  const [cashiers, setCashiers] = useState([]);
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    // load from backend
    fetch(`/api/cashiers?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map(item => ({
          id: item.id,
          username: item.name ?? item.username,
          employeeId: item.employee_id ?? item.employeeId ?? '',
          createdAt: item.created_at ?? item.createdAt ?? null,
          managerId: item.manager_id ?? item.managerId ?? null,
        }));
        setCashiers(mapped);
      })
      .catch(() => setCashiers([]));
  }, [user]);

  const persist = (next) => {
    setCashiers(next);
    // keep local cache too
    try { localStorage.setItem(storageKey(user.id), JSON.stringify(next)); } catch {}
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const name = (username || '').trim();
    if (!name) return;
    if (!user?.id) return;
    // create on backend
    fetch('/api/cashiers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, username: name, employeeId: (employeeId||'').trim(), password: password || null })
    }).then(r => r.json()).then(created => {
      if (created && created.id) {
        const mapped = {
          id: created.id,
          username: created.name ?? created.username,
          employeeId: created.employee_id ?? created.employeeId ?? '',
          createdAt: created.created_at ?? created.createdAt ?? null,
          managerId: created.manager_id ?? created.managerId ?? null,
        };
        persist([mapped, ...cashiers]);
        setUsername(''); setEmployeeId(''); setPassword('');
      }
    }).catch(err => console.error('Failed to create cashier', err));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setUsername(item.username || '');
    setEmployeeId(item.employeeId || '');
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!editingId) return;
    const payload = { id: editingId, username: (username||'').trim(), employeeId: (employeeId||'').trim(), password: password || null };
    fetch('/api/cashiers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(updatedItem => {
        const mapped = {
          id: updatedItem.id,
          username: updatedItem.name ?? updatedItem.username,
          employeeId: updatedItem.employee_id ?? updatedItem.employeeId ?? '',
          createdAt: updatedItem.created_at ?? updatedItem.createdAt ?? null,
          managerId: updatedItem.manager_id ?? updatedItem.managerId ?? null,
        };
        const updated = cashiers.map(c => c.id === editingId ? mapped : c);
        persist(updated);
        setEditingId(null); setUsername(''); setEmployeeId(''); setPassword('');
      }).catch(err => console.error('Failed to update cashier', err));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUsername('');
    setEmployeeId('');
  };

  const remove = (id) => {
    if (!window.confirm('Delete this cashier?')) return;
    fetch(`/api/cashiers?id=${id}&userId=${user.id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(() => {
        const next = cashiers.filter(c => c.id !== id);
        persist(next);
      }).catch(err => console.error('Failed to delete cashier', err));
  };

  if (!user?.id) {
    return (
      <div className="card">
        <h2 className="card-title">Cashier Manager</h2>
        <div style={{ padding: 12 }}>Manager must be logged in to manage cashiers.</div>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleString();
  };

  return (
    <div className="card">
      <h2 className="card-title">Cashiers</h2>
      <form onSubmit={editingId ? saveEdit : handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          className="form-input"
          placeholder="Cashier username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="form-input"
          placeholder="Employee ID (optional)"
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Password (optional)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">{editingId ? 'Save' : 'Add Cashier'}</button>
        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
      </form>

      <div style={{ display: 'grid', gap: 8 }}>
  {cashiers.length === 0 && <div style={{ color: '#6b7280' }}>No cashiers yet.</div>}
        {cashiers.map(c => (
          <div key={c.id} className="recipe-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{c.username}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{c.employeeId || '—'} • {formatDate(c.createdAt)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => startEdit(c)}>Edit</button>
              <button className="btn btn-danger" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashierManager;
