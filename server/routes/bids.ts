import { Router } from 'express';
import db from '../db.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

interface BidRow {
  user_id: string;
  vehicle_id: string;
  current_bid: number;
  bid_count: number;
  last_bid_at: string;
  bought_now: number;
}

function rowToState(row: BidRow) {
  return {
    current_bid: row.current_bid,
    bid_count: row.bid_count,
    last_bid_at: row.last_bid_at,
    ...(row.bought_now ? { bought_now: true } : {}),
  };
}

// GET /api/bids
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM bids WHERE user_id = ?').all(req.user!.userId) as BidRow[];
  const result: Record<string, ReturnType<typeof rowToState>> = {};
  for (const row of rows) result[row.vehicle_id] = rowToState(row);
  res.json(result);
});

// POST /api/bids  — place or update a bid
router.post('/', requireAuth, async (req, res) => {
  const { vehicleId, amount, boughtNow } = req.body as { vehicleId: string; amount: number; boughtNow?: boolean };
  if (!vehicleId || typeof amount !== 'number') {
    res.status(400).json({ error: 'vehicleId and amount are required.' });
    return;
  }

  const existing = db.prepare('SELECT bid_count FROM bids WHERE user_id = ? AND vehicle_id = ?')
    .get(req.user!.userId, vehicleId) as { bid_count: number } | undefined;
  const bid_count = (existing?.bid_count ?? 0) + 1;

  db.prepare(`
    INSERT INTO bids (user_id, vehicle_id, current_bid, bid_count, last_bid_at, bought_now)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id, vehicle_id) DO UPDATE SET
      current_bid = excluded.current_bid,
      bid_count   = excluded.bid_count,
      last_bid_at = excluded.last_bid_at,
      bought_now  = excluded.bought_now
  `).run(req.user!.userId, vehicleId, amount, bid_count, new Date().toISOString(), boughtNow ? 1 : 0);

  res.json({ ok: true });
});

// DELETE /api/bids/:vehicleId
router.delete('/:vehicleId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM bids WHERE user_id = ? AND vehicle_id = ?')
    .run(req.user!.userId, req.params.vehicleId);
  res.json({ ok: true });
});

export default router;
