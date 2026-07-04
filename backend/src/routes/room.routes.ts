import { Router } from 'express';
import { getRoomSummaries, getRoomSummary } from '../services/device-service.js';

const router = Router();

/** GET /api/rooms — Get all rooms with device summaries. */
router.get('/rooms', (_req, res) => {
  try {
    const rooms = getRoomSummaries();
    res.json(rooms);
  } catch (err) {
    console.error('GET /api/rooms error:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

/** GET /api/rooms/:roomId — Get single room with its devices. */
router.get('/rooms/:roomId', (req, res) => {
  try {
    const room = getRoomSummary(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error('GET /api/rooms/:roomId error:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

export default router;
