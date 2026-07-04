import { Router } from 'express';
import { getRecentActivity } from '../data/activity.js';

const router = Router();

/** GET /api/activity — Get recent activity timeline. */
router.get('/activity', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activity = getRecentActivity(Math.min(limit, 100));
    res.json(activity);
  } catch (err) {
    console.error('GET /api/activity error:', err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

export default router;
