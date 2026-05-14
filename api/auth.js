import { hashPassword, comparePassword } from './bcrypt.js';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, name, password, type } = req.body;
    if (!email || !password || (type === 'register' && !name)) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (type === 'register') {
      // Check if user exists
      let existing;
      try {
        const q = await sql`SELECT id FROM users WHERE email = ${email}`;
        existing = Array.isArray(q?.rows) ? q.rows : [];
      } catch (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      // Hash password
      const hashed = await hashPassword(password);
      // Save user
      const insert = await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hashed}) RETURNING id, name, email, role, manager_id`;
      const created = Array.isArray(insert?.rows) && insert.rows.length > 0 ? insert.rows[0] : null;
      const user = created ? { id: created.id, name: created.name, email: created.email, role: created.role, manager_id: created.manager_id } : { name, email };
      // Set session cookie
      res.setHeader('Set-Cookie', [`user_id=${created.id}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`]);
      return res.status(200).json({ message: 'Authenticated', user });
    } else {
      // Login: find user and check password
      let resultRows = [];
      try {
        const q = await sql`SELECT * FROM users WHERE email = ${email}`;
        resultRows = Array.isArray(q?.rows) ? q.rows : [];
      } catch (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (resultRows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const userRow = resultRows[0];
      const valid = await comparePassword(password, userRow.password);
      if (!valid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const user = { id: userRow.id, name: userRow.name, email: userRow.email, role: userRow.role, manager_id: userRow.manager_id };
      // Set session cookie
      res.setHeader('Set-Cookie', [`user_id=${userRow.id}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`]);
      return res.status(200).json({ message: 'Authenticated', user });
    }
  } else if (req.method === 'GET') {
    // Check session cookie
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/user_id=([^;]+)/);
    if (!match) return res.status(401).json({ message: 'Not authenticated' });
    
    const userId = match[1];
    try {
      const q = await sql`SELECT id, name, email, role, manager_id FROM users WHERE id = ${userId}`;
      const rows = Array.isArray(q?.rows) ? q.rows : [];
      if (rows.length > 0) {
        res.status(200).json({ user: rows[0] });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}