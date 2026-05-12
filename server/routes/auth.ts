import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.ts';
import { requireAuth, signToken } from '../middleware/auth.ts';

const router = Router();

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

function safeUser(row: UserRow) {
  return { id: row.id, name: row.name, email: row.email };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body as Record<string, string>;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = uuidv4();
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
  ).run(id, name.trim(), email.toLowerCase(), password_hash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ user: safeUser(user), token });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body as Record<string, string>;

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as UserRow | undefined;
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ user: safeUser(user), token });
});

// GET /api/auth/me  (protected)
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as UserRow | undefined;
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: safeUser(user) });
});

export default router;
