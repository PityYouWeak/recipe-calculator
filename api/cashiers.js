import { sql } from '@vercel/postgres';
import { hashPassword } from './bcrypt.js';

// Ensure users table has columns to store cashier metadata (role, manager_id, employee_id, created_at)
async function ensureUsersColumns() {
  try {
    // remove legacy cashiers table if present
    try { await sql`DROP TABLE IF EXISTS cashiers`; } catch (e) { /* ignore */ }
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'manager'`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`;
    // Allow email and password to be nullable for cashier records
    try { await sql`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`; } catch (e) { /* ignore if not applicable */ }
    try { await sql`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`; } catch (e) { /* ignore if not applicable */ }
  } catch (e) {
    console.error('Failed to ensure users columns', e.message || e);
  }
}

export default async function handler(req, res) {
  await ensureUsersColumns();
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    try {
      const rows = await sql`SELECT id, name, employee_id, manager_id, created_at FROM users WHERE manager_id = ${userId} AND role = 'cashier' ORDER BY created_at DESC`;
      return res.status(200).json(Array.isArray(rows.rows) ? rows.rows : []);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error', details: err.message });
    }
  }

  if (req.method === 'POST') {
    const { userId, username, employeeId, password } = req.body;
    if (!userId || !username) return res.status(400).json({ error: 'Missing fields' });
    try {
      const hashed = password ? await hashPassword(password) : null;
      const result = await sql`
        INSERT INTO users (name, email, password, role, manager_id, employee_id, created_at)
        VALUES (${username}, ${username}, ${hashed}, 'cashier', ${userId}, ${employeeId || null}, NOW())
        RETURNING id, name, manager_id, employee_id, created_at
      `;
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error', details: err.message });
    }
  }

  if (req.method === 'PUT') {
    const { id, username, employeeId, password } = req.body;
    if (!id || !username) return res.status(400).json({ error: 'Missing fields' });
    try {
      if (password) {
        const hashed = await hashPassword(password);
        await sql`UPDATE users SET name = ${username}, employee_id = ${employeeId || null}, password = ${hashed} WHERE id = ${id}`;
      } else {
        await sql`UPDATE users SET name = ${username}, employee_id = ${employeeId || null} WHERE id = ${id}`;
      }
      const rows = await sql`SELECT id, name, manager_id, employee_id, created_at FROM users WHERE id = ${id}`;
      return res.status(200).json(rows.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error', details: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id, userId } = req.query;
    if (!id || !userId) return res.status(400).json({ error: 'Missing id or userId' });
    try {
      // Only allow deleting a cashier entry owned by this manager
      await sql`DELETE FROM users WHERE id = ${id} AND role = 'cashier' AND manager_id = ${userId}`;
      return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
