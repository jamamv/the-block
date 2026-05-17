import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getUserFromHeader } from '../_lib.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const user = getUserFromHeader(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const vehicleId = req.query.vehicleId as string;
  getDb().prepare('DELETE FROM bids WHERE user_id = ? AND vehicle_id = ?')
    .run(user.userId, vehicleId);
  res.json({ ok: true });
}
