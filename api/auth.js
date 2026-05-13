import { hashPassword, comparePassword } from './bcrypt.js';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';
console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? '✓ loaded' : '✗ not found, using default');

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
      const token = jwt.sign(user, SECRET, { expiresIn: '1d' });
      res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`]);
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
      const token = jwt.sign(user, SECRET, { expiresIn: '1d' });
      res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`]);
      return res.status(200).json({ message: 'Authenticated', user });
    }
  } else if (req.method === 'GET') {
    // Check JWT from cookie or Authorization header
    let token = null;
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/token=([^;]+)/);
    if (match) {
      console.log('Found token in cookie');
      token = match[1];
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      console.log('Found token in Authorization header');
      token = req.headers.authorization.substring(7);
    }
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    try {
      console.log(SECRET);
      const tokenUser = jwt.verify(token, SECRET);
      console.log('Token valid for user:', tokenUser);
      // Fetch user from DB to get id
      let dbUser;
      try {
        const q = await sql`SELECT id, name, email, role, manager_id FROM users WHERE email = ${tokenUser.email}`;
        const rows = Array.isArray(q?.rows) ? q.rows : [];
        if (rows.length > 0) {
          dbUser = rows[0];
        } else {
          return res.status(404).json({ message: 'User not found' });
        }
      } catch (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      res.status(200).json({ user: dbUser });
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}