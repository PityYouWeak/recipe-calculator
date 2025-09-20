import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, name, password, type } = req.body;
    // In production, validate password and check user in DB
    if (!email || !password || (type === 'register' && !name)) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    // Simulate user object
    const user = { email, name: name || email };
    // Create JWT
    const token = jwt.sign(user, SECRET, { expiresIn: '1d' });
    // Set JWT in HTTP-only cookie
    res.setHeader('Set-Cookie', [`token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`]);
    res.status(200).json({ message: 'Authenticated', user });
  } else if (req.method === 'GET') {
    // Check JWT from cookie
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/token=([^;]+)/);
    if (!match) return res.status(401).json({ message: 'Not authenticated' });
    try {
      const user = jwt.verify(match[1], SECRET);
      res.status(200).json({ user });
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
