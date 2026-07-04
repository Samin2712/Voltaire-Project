import { Router } from 'express';
import { getDashboardStats } from '../services/device-service.js';

const router = Router();

/** GET /api/stats — Get dashboard KPI stats. */
router.get('/stats', (_req, res) => {
  try {
    const stats = getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
