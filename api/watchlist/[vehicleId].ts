import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getUserFromHeader } from '../_lib.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromHeader(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const vehicleId = req.query.vehicleId as string;
  const db = getDb();

  if (req.method === 'POST') {
    db.prepare('INSERT OR IGNORE INTO watchlist (user_id, vehicle_id) VALUES (?, ?)')
      .run(user.userId, vehicleId);
    res.json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    db.prepare('DELETE FROM watchlist WHERE user_id = ? AND vehicle_id = ?')
      .run(user.userId, vehicleId);
    res.json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
