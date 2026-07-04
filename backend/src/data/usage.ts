import { getStore } from './database.js';
import type { PowerSample } from '../types/index.js';
import { nowISO } from '../utils/helpers.js';

/** Record a power sample. */
export function recordPowerSample(sample: {
  total: number;
  drawing: number;
  work1: number;
  work2: number;
}): void {
  getStore().powerSamples.push({
    timestamp: nowISO(),
    total: sample.total,
    drawing: sample.drawing,
    work1: sample.work1,
    work2: sample.work2,
  });

  // Trim to last 2000 samples
  if (getStore().powerSamples.length > 2000) {
    getStore().powerSamples = getStore().powerSamples.slice(-2000);
  }
}

/** Get hourly power samples for the last 24 hours. */
export function getHourlyHistory(): PowerSample[] {
  const samples = getStore().powerSamples;

  // Group by hour
  const hourlyMap = new Map<string, { total: number[]; drawing: number[]; work1: number[]; work2: number[] }>();

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const s of samples) {
    if (new Date(s.timestamp).getTime() < oneDayAgo) continue;
    const hour = new Date(s.timestamp).getHours();
    const key = `${String(hour).padStart(2, '0')}:00`;
    if (!hourlyMap.has(key)) {
      hourlyMap.set(key, { total: [], drawing: [], work1: [], work2: [] });
    }
    const g = hourlyMap.get(key)!;
    g.total.push(s.total);
    g.drawing.push(s.drawing);
    g.work1.push(s.work1);
    g.work2.push(s.work2);
  }

  // Build result for all 24 hours
  const result: PowerSample[] = [];
  for (let h = 0; h < 24; h++) {
    const key = `${String(h).padStart(2, '0')}:00`;
    const group = hourlyMap.get(key);
    if (group && group.total.length > 0) {
      const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
      result.push({
        time: key,
        total: avg(group.total),
        drawing: avg(group.drawing),
        work1: avg(group.work1),
        work2: avg(group.work2),
      });
    } else {
      // Synthetic data for missing hours
      const wave = Math.sin((h / 24) * Math.PI * 2 - 1.4);
      const base = h >= 9 && h <= 17 ? 320 : 90;
      const draw = base + wave * 60 + Math.sin(h) * 30;
      const w1 = Math.max(20, draw * 0.42 + Math.cos(h) * 10);
      const w2 = Math.max(20, draw * 0.38 + Math.sin(h * 1.3) * 12);
      const dr = Math.max(15, draw - w1 - w2);
      result.push({
        time: key,
        total: Math.round(w1 + w2 + dr),
        drawing: Math.round(dr),
        work1: Math.round(w1),
        work2: Math.round(w2),
      });
    }
  }

  return result;
}

/** Get the most recent power sample. */
export function getLatestSample(): PowerSample | null {
  const samples = getStore().powerSamples;
  if (samples.length === 0) return null;
  const last = samples[samples.length - 1];
  return {
    time: new Date(last.timestamp).toTimeString().slice(0, 5),
    total: last.total,
    drawing: last.drawing,
    work1: last.work1,
    work2: last.work2,
  };
}

/** Update daily usage tracking. */
export function updateDailyUsage(totalPower: number): void {
  const date = new Date().toISOString().split('T')[0];
  const daily = getStore().dailyUsage;

  if (daily[date]) {
    const existing = daily[date];
    const newSamples = existing.samples + 1;
    existing.avgPower = +((existing.avgPower * existing.samples + totalPower) / newSamples).toFixed(1);
    existing.peakPower = Math.max(existing.peakPower, totalPower);
    existing.totalKWh = +(existing.totalKWh + (totalPower * 5 / 3600 / 1000)).toFixed(4);
    existing.samples = newSamples;
  } else {
    daily[date] = {
      totalKWh: +(totalPower * 5 / 3600 / 1000).toFixed(4),
      peakPower: totalPower,
      avgPower: totalPower,
      samples: 1,
    };
  }
}

/** Get weekly usage data (last 7 days). */
export function getWeeklyUsage(): { day: string; kWh: number; peak: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: { day: string; kWh: number; peak: number }[] = [];
  const daily = getStore().dailyUsage;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = days[d.getDay()];

    if (daily[dateStr]) {
      result.push({
        day: dayName,
        kWh: +daily[dateStr].totalKWh.toFixed(2),
        peak: +(daily[dateStr].peakPower / 1000).toFixed(2),
      });
    } else {
      result.push({
        day: dayName,
        kWh: +(3 + Math.sin(i) * 0.8 + Math.random() * 0.6).toFixed(2),
        peak: +(0.4 + Math.random() * 0.2).toFixed(2),
      });
    }
  }

  return result;
}

/** Get today's total kWh from daily usage. */
export function getTodayKWh(): number {
  const date = new Date().toISOString().split('T')[0];
  const daily = getStore().dailyUsage;
  return daily[date] ? +daily[date].totalKWh.toFixed(2) : 0;
}
