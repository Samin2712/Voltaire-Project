import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import deviceRoutes from './routes/device.routes.js';
import roomRoutes from './routes/room.routes.js';
import usageRoutes from './routes/usage.routes.js';
import alertRoutes from './routes/alert.routes.js';
import activityRoutes from './routes/activity.routes.js';
import statsRoutes from './routes/stats.routes.js';
import reportRoutes from './routes/report.routes.js';
import botRoutes from './routes/bot.routes.js';

export function createApp() {
  const app = express();

  // ── Middleware ──────────────────────────────────────────────────────────────
  app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging (minimal)
  app.use((req, _res, next) => {
    if (req.path !== '/api/health') {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api', healthRoutes);
  app.use('/api', deviceRoutes);
  app.use('/api', roomRoutes);
  app.use('/api', usageRoutes);
  app.use('/api', alertRoutes);
  app.use('/api', activityRoutes);
  app.use('/api', statsRoutes);
  app.use('/api', reportRoutes);
  app.use('/api', botRoutes);

  // ── 404 handler ────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      error: 'Not found',
      message: 'The requested endpoint does not exist.',
      availableEndpoints: [
        'GET  /api/health',
        'GET  /api/devices',
        'GET  /api/devices/:id',
        'PATCH /api/devices/:id/toggle',
        'PATCH /api/devices/:id',
        'GET  /api/rooms',
        'GET  /api/rooms/:roomId',
        'GET  /api/usage',
        'GET  /api/usage/history',
        'GET  /api/alerts',
        'PATCH /api/alerts/:id/dismiss',
        'GET  /api/activity',
        'GET  /api/stats',
        'GET  /api/reports/daily',
        'GET  /api/reports/weekly',
        'GET  /api/bot/status',
        'GET  /api/bot/room/:roomName',
        'GET  /api/bot/usage',
        'GET  /api/bot/alerts',
      ],
    });
  });

  // ── Error handler ──────────────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API] Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
    });
  });

  return app;
}
