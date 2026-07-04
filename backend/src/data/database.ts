import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { ROOMS, RATED_POWER } from '../types/index.js';
import type { Device, Alert, ActivityEvent, DeviceType } from '../types/index.js';
import { nowISO } from '../utils/helpers.js';

// ── In-Memory Store ──────────────────────────────────────────────────────────
// All data lives in memory for speed. Persisted to JSON file periodically.

export interface Store {
  devices: Device[];
  alerts: Alert[];
  activity: ActivityEvent[];
  powerSamples: { timestamp: string; total: number; drawing: number; work1: number; work2: number }[];
  dailyUsage: Record<string, { totalKWh: number; peakPower: number; avgPower: number; samples: number }>;
}

let store: Store = {
  devices: [],
  alerts: [],
  activity: [],
  powerSamples: [],
  dailyUsage: {},
};

const DATA_DIR = path.resolve(config.db.path.replace(/\/[^/]+$/, '') || './data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

/** Get the store (read-only reference). */
export function getStore(): Store {
  return store;
}

/** Initialize the database (in-memory store). */
export function initDatabase(): void {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Try loading from disk
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(raw) as Partial<Store>;
      if (loaded.devices && loaded.devices.length > 0) {
        store = {
          devices: loaded.devices ?? [],
          alerts: loaded.alerts ?? [],
          activity: loaded.activity ?? [],
          powerSamples: loaded.powerSamples ?? [],
          dailyUsage: loaded.dailyUsage ?? {},
        };
        console.log(`[DB] Loaded ${store.devices.length} devices from ${DATA_FILE}`);
        return;
      }
    } catch (err) {
      console.warn('[DB] Failed to load store.json, re-seeding:', err);
    }
  }

  // Seed fresh data
  seedDevices();
  seedPowerSamples();
  seedActivity();
  persistStore();

  console.log(`[DB] Initialized with ${store.devices.length} devices`);
}

/** Persist store to disk. */
export function persistStore(): void {
  try {
    // Trim data before saving
    if (store.powerSamples.length > 2000) {
      store.powerSamples = store.powerSamples.slice(-2000);
    }
    if (store.activity.length > 200) {
      store.activity = store.activity.slice(0, 200);
    }
    if (store.alerts.length > 100) {
      store.alerts = store.alerts.slice(0, 100);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Persist error:', err);
  }
}

/** Close (persist final state). */
export function closeDatabase(): void {
  persistStore();
  console.log('[DB] Store persisted and closed.');
}

// ── Seed Functions ───────────────────────────────────────────────────────────

function seedDevices(): void {
  console.log('[DB] Seeding 15 devices...');
  const now = nowISO();
  store.devices = [];

  for (const room of ROOMS) {
    for (let i = 1; i <= 2; i++) {
      const status = Math.random() > 0.4 ? 'on' : 'off';
      const rated = RATED_POWER.fan;
      const power = status === 'on' ? rated : 0;
      const runtime = Math.floor(Math.random() * 14400);
      store.devices.push({
        id: `${room.id}-fan-${i}`,
        name: `Fan ${i}`,
        type: 'fan',
        room: room.name,
        roomId: room.id,
        status,
        powerDraw: power,
        ratedPower: rated,
        lastChanged: now,
        runtimeToday: runtime,
        totalRuntime: runtime,
        energyUsedToday: +((power * runtime) / 3600000).toFixed(4),
        isOnline: true,
      });
    }
    for (let i = 1; i <= 3; i++) {
      const status = Math.random() > 0.35 ? 'on' : 'off';
      const rated = RATED_POWER.light;
      const power = status === 'on' ? rated : 0;
      const runtime = Math.floor(Math.random() * 14400);
      store.devices.push({
        id: `${room.id}-light-${i}`,
        name: `Light ${i}`,
        type: 'light',
        room: room.name,
        roomId: room.id,
        status,
        powerDraw: power,
        ratedPower: rated,
        lastChanged: now,
        runtimeToday: runtime,
        totalRuntime: runtime,
        energyUsedToday: +((power * runtime) / 3600000).toFixed(4),
        isOnline: true,
      });
    }
  }
}

function seedPowerSamples(): void {
  const now = new Date();
  store.powerSamples = [];
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now);
    t.setHours(now.getHours() - i, 0, 0, 0);
    const hour = t.getHours();
    const wave = Math.sin((hour / 24) * Math.PI * 2 - 1.4);
    const base = hour >= 9 && hour <= 17 ? 320 : 90;
    const draw = base + wave * 60 + Math.sin(hour) * 30;
    const w1 = Math.max(20, draw * 0.42 + Math.cos(hour) * 10);
    const w2 = Math.max(20, draw * 0.38 + Math.sin(hour * 1.3) * 12);
    const dr = Math.max(15, draw - w1 - w2);
    store.powerSamples.push({
      timestamp: t.toISOString(),
      total: Math.round(w1 + w2 + dr),
      drawing: Math.round(dr),
      work1: Math.round(w1),
      work2: Math.round(w2),
    });
  }
}

function seedActivity(): void {
  store.activity = [];
  const now = nowISO();
  store.activity.push({
    id: crypto.randomUUID(),
    timestamp: now,
    message: 'Voltaire backend started. Monitoring 15 devices across 3 rooms.',
    kind: 'system',
  });
  for (let i = 0; i < 5; i++) {
    const d = store.devices[Math.floor(Math.random() * store.devices.length)];
    store.activity.push({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - i * 90000).toISOString(),
      message: `${d.name} in ${d.room} turned ${d.status.toUpperCase()}`,
      deviceId: d.id,
      room: d.roomId,
      kind: d.status as 'on' | 'off',
    });
  }
}

// Auto-persist every 30 seconds
let persistInterval: ReturnType<typeof setInterval> | null = null;
export function startAutoPersist(): void {
  if (persistInterval) return;
  persistInterval = setInterval(persistStore, 30000);
}
export function stopAutoPersist(): void {
  if (persistInterval) {
    clearInterval(persistInterval);
    persistInterval = null;
  }
}
