import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getUserFromHeader } from '../_lib.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const user = getUserFromHeader(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const rows = getDb()
    .prepare('SELECT vehicle_id FROM watchlist WHERE user_id = ?')
    .all(user.userId) as { vehicle_id: string }[];

  res.json(rows.map((r) => r.vehicle_id));
}
