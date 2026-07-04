import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { initDatabase, closeDatabase, startAutoPersist, stopAutoPersist } from './data/database.js';
import { setSocketIO } from './socket/socket-manager.js';
import { startSimulator, stopSimulator } from './simulator/simulator.js';
import { getDevices, getRoomSummaries, getUsageData, getDashboardStats } from './services/device-service.js';
import { getActiveAlerts } from './data/alerts.js';
import { getRecentActivity } from './data/activity.js';

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║         ⚡ VOLTAIRE BACKEND v1.0.0 ⚡        ║');
  console.log('║   Smart Office Energy Monitoring System      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // 1. Initialize database
  initDatabase();

  // 2. Create Express app
  const app = createApp();
  const server = http.createServer(app);

  // 3. Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  setSocketIO(io);

  // 4. Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send full initial state
    socket.emit('client:connected', {
      devices: getDevices(),
      rooms: getRoomSummaries(),
      usage: getUsageData(),
      stats: getDashboardStats(),
      alerts: getActiveAlerts(),
      activity: getRecentActivity(20),
      serverTime: new Date().toISOString(),
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  // 5. Start the simulator
  startSimulator();
  startAutoPersist();

  // 6. Start listening
  server.listen(config.port, config.host, () => {
    console.log('');
    console.log(`[Server] Listening on http://${config.host}:${config.port}`);
    console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
    console.log(`[Server] API docs: http://localhost:${config.port}/api/devices`);
    console.log(`[Server] CORS origins: ${config.corsOrigin.join(', ')}`);
    console.log(`[Server] Simulator interval: ${config.simulator.intervalMs}ms`);
    console.log('');
  });

  // 7. Graceful shutdown
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    stopSimulator();
    stopAutoPersist();
    io.close();
    server.close(() => {
      closeDatabase();
      console.log('[Server] Goodbye! 👋');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
