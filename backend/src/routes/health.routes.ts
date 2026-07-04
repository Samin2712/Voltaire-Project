import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'voltaire-backend',
    version: '1.0.0',
  });
});

export default router;
