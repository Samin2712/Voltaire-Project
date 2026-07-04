import { Router } from 'express';
import { getDailyReport, getWeeklyReport } from '../services/usage-service.js';

const router = Router();

/** GET /api/reports/daily — Get daily report data. */
router.get('/reports/daily', (_req, res) => {
  try {
    const report = getDailyReport();
    res.json(report);
  } catch (err) {
    console.error('GET /api/reports/daily error:', err);
    res.status(500).json({ error: 'Failed to generate daily report' });
  }
});

/** GET /api/reports/weekly — Get weekly report data. */
router.get('/reports/weekly', (_req, res) => {
  try {
    const report = getWeeklyReport();
    res.json(report);
  } catch (err) {
    console.error('GET /api/reports/weekly error:', err);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

export default router;
