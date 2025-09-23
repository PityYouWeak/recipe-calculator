import { hashPassword, comparePassword } from './bcrypt.js';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';
const sql = neon(process.env.DATABASE_URL);

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
        existing = await sql.query('SELECT id FROM users WHERE email = $1', [email]);
      } catch (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (!Array.isArray(existing)) {
        console.error('Unexpected DB response:', existing);
        return res.status(500).json({ message: 'Unexpected database response' });
      }
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      // Hash password
      const hashed = await hashPassword(password);
      // Save user
      await sql.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashed]);
      const user = { name, email };
      const token = jwt.sign(user, SECRET, { expiresIn: '1d' });
      res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`]);
      return res.status(200).json({ message: 'Authenticated', user });
    } else {
      // Login: find user and check password
      let result;
      try {
        result = await sql.query('SELECT * FROM users WHERE email = $1', [email]);
      } catch (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (!Array.isArray(result) || result.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const userRow = result[0];
      const valid = await comparePassword(password, userRow.password);
      if (!valid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const user = { name: userRow.name, email: userRow.email };
      const token = jwt.sign(user, SECRET, { expiresIn: '1d' });
      res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`]);
      return res.status(200).json({ message: 'Authenticated', user });
    }
  } else if (req.method === 'GET') {
    // Check JWT from cookie
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/token=([^;]+)/);
    if (!match) return res.status(401).json({ message: 'Not authenticated' });
    try {
      const tokenUser = jwt.verify(match[1], SECRET);
      // Fetch user from DB to get id
      let dbUser;
      try {
        const result = await sql.query('SELECT id, name, email FROM users WHERE email = $1', [tokenUser.email]);
        if (Array.isArray(result) && result.length > 0) {
          dbUser = result[0];
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
