import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, safeUser, verifyToken } from '../_lib.js';
import type { UserRow } from '../_lib.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as UserRow | undefined;
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ user: safeUser(user) });
}
