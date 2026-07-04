import { Router } from 'express';
import { getOfficeStatus, getRoomSummary, getUsageSummary, getAlertsSummary } from '../services/bot-service.js';

const router = Router();

/** GET /api/bot/status — Human-friendly office status. */
router.get('/bot/status', (_req, res) => {
  try {
    const summary = getOfficeStatus();
    res.json({ message: summary });
  } catch (err) {
    console.error('GET /api/bot/status error:', err);
    res.status(500).json({ error: 'Failed to generate status' });
  }
});

/** GET /api/bot/room/:roomName — Human-friendly room summary. */
router.get('/bot/room/:roomName', (req, res) => {
  try {
    const summary = getRoomSummary(req.params.roomName);
    res.json({ message: summary });
  } catch (err) {
    console.error('GET /api/bot/room/:roomName error:', err);
    res.status(500).json({ error: 'Failed to generate room summary' });
  }
});

/** GET /api/bot/usage — Human-friendly usage summary. */
router.get('/bot/usage', (_req, res) => {
  try {
    const summary = getUsageSummary();
    res.json({ message: summary });
  } catch (err) {
    console.error('GET /api/bot/usage error:', err);
    res.status(500).json({ error: 'Failed to generate usage summary' });
  }
});

/** GET /api/bot/alerts — Human-friendly alerts summary. */
router.get('/bot/alerts', (_req, res) => {
  try {
    const summary = getAlertsSummary();
    res.json({ message: summary });
  } catch (err) {
    console.error('GET /api/bot/alerts error:', err);
    res.status(500).json({ error: 'Failed to generate alerts summary' });
  }
});

export default router;
