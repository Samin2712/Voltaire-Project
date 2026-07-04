import { Router } from 'express';
import { getActiveAlerts } from '../data/alerts.js';
import { dismissAlert } from '../data/alerts.js';
import { emitAlertUpdate } from '../socket/socket-manager.js';

const router = Router();

/** GET /api/alerts — Get active alerts. */
router.get('/alerts', (_req, res) => {
  try {
    const alerts = getActiveAlerts();
    res.json(alerts);
  } catch (err) {
    console.error('GET /api/alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/** PATCH /api/alerts/:id/dismiss — Dismiss an alert. */
router.patch('/alerts/:id/dismiss', (req, res) => {
  try {
    const alert = dismissAlert(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    emitAlertUpdate(alert);
    res.json(alert);
  } catch (err) {
    console.error('PATCH /api/alerts/:id/dismiss error:', err);
    res.status(500).json({ error: 'Failed to dismiss alert' });
  }
});

export default router;
