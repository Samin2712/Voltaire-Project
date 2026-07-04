import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from the backend root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',

  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),

  simulator: {
    intervalMs: parseInt(process.env.SIMULATOR_INTERVAL_MS || '5000', 10),
  },

  officeHours: {
    start: parseInt(process.env.OFFICE_HOURS_START || '9', 10),
    end: parseInt(process.env.OFFICE_HOURS_END || '17', 10),
  },

  thresholds: {
    highPower: parseInt(process.env.HIGH_POWER_THRESHOLD || '600', 10),
    spike: parseInt(process.env.SPIKE_THRESHOLD || '150', 10),
  },

  billing: {
    ratePerKWh: parseFloat(process.env.BILL_RATE_PER_KWH || '8.4'),
  },

  db: {
    path: process.env.DB_PATH || './data/voltaire.db',
  },
} as const;

export type Config = typeof config;
