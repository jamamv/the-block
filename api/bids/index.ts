import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getUserFromHeader } from '../_lib.js';

interface BidRow {
  user_id: string;
  vehicle_id: string;
  current_bid: number;
  bid_count: number;
  last_bid_at: string;
  bought_now: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromHeader(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const db = getDb();

  if (req.method === 'GET') {
    const rows = db.prepare('SELECT * FROM bids WHERE user_id = ?').all(user.userId) as BidRow[];
    const result: Record<string, object> = {};
    for (const row of rows) {
      result[row.vehicle_id] = {
        current_bid: row.current_bid,
        bid_count: row.bid_count,
        last_bid_at: row.last_bid_at,
        ...(row.bought_now ? { bought_now: true } : {}),
      };
    }
    res.json(result);
    return;
  }

  if (req.method === 'POST') {
    const { vehicleId, amount, boughtNow } = (req.body ?? {}) as { vehicleId: string; amount: number; boughtNow?: boolean };
    if (!vehicleId || typeof amount !== 'number') {
      res.status(400).json({ error: 'vehicleId and amount are required.' });
      return;
    }

    const existing = db.prepare('SELECT bid_count FROM bids WHERE user_id = ? AND vehicle_id = ?')
      .get(user.userId, vehicleId) as { bid_count: number } | undefined;
    const bid_count = (existing?.bid_count ?? 0) + 1;

    db.prepare(`
      INSERT INTO bids (user_id, vehicle_id, current_bid, bid_count, last_bid_at, bought_now)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, vehicle_id) DO UPDATE SET
        current_bid = excluded.current_bid,
        bid_count   = excluded.bid_count,
        last_bid_at = excluded.last_bid_at,
        bought_now  = excluded.bought_now
    `).run(user.userId, vehicleId, amount, bid_count, new Date().toISOString(), boughtNow ? 1 : 0);

    res.json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
