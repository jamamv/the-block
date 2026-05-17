import { Router } from 'express';
import db from '../db.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

// GET /api/watchlist
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT vehicle_id FROM watchlist WHERE user_id = ?')
    .all(req.user!.userId) as { vehicle_id: string }[];
  res.json(rows.map((r) => r.vehicle_id));
});

// POST /api/watchlist/:vehicleId
router.post('/:vehicleId', requireAuth, (req, res) => {
  db.prepare('INSERT OR IGNORE INTO watchlist (user_id, vehicle_id) VALUES (?, ?)')
    .run(req.user!.userId, req.params.vehicleId);
  res.json({ ok: true });
});

// DELETE /api/watchlist/:vehicleId
router.delete('/:vehicleId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM watchlist WHERE user_id = ? AND vehicle_id = ?')
    .run(req.user!.userId, req.params.vehicleId);
  res.json({ ok: true });
});

export default router;
