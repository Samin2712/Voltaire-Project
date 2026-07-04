import { Router } from 'express';
import { getCurrentUsage, getUsageHistory } from '../services/usage-service.js';

const router = Router();

/** GET /api/usage — Get current usage data. */
router.get('/usage', (_req, res) => {
  try {
    const usage = getCurrentUsage();
    res.json(usage);
  } catch (err) {
    console.error('GET /api/usage error:', err);
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
});

/** GET /api/usage/history — Get historical usage data for charts. */
router.get('/usage/history', (req, res) => {
  try {
    const period = (req.query.period as string) || 'hourly';
    const history = getUsageHistory(period);
    res.json(history);
  } catch (err) {
    console.error('GET /api/usage/history error:', err);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

export default router;
