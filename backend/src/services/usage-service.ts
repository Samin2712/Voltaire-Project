import { getTotalPower, getRoomPower } from '../data/devices.js';
import { getHourlyHistory, getWeeklyUsage, getTodayKWh } from '../data/usage.js';
import { getRoomBreakdowns, getRoomSummaries } from './device-service.js';
import { config } from '../config/index.js';
import { ROOMS } from '../types/index.js';
import type { UsageData, PowerSample, WeeklyReport, DailyReport, RoomBreakdown } from '../types/index.js';

/** Get current usage data. */
export function getCurrentUsage(): UsageData {
  const currentPower = getTotalPower();
  const todayEnergy = getTodayKWh();

  return {
    currentPower,
    todayEnergy,
    estimatedBill: +(todayEnergy * config.billing.ratePerKWh).toFixed(2),
    roomBreakdown: getRoomBreakdowns(),
  };
}

/** Get usage history for charts. */
export function getUsageHistory(period: string = 'hourly'): PowerSample[] | { day: string; kWh: number; peak: number }[] {
  switch (period) {
    case 'weekly':
      return getWeeklyUsage();
    case 'hourly':
    default:
      return getHourlyHistory();
  }
}

/** Get daily report data. */
export function getDailyReport(): DailyReport {
  const today = new Date().toISOString().split('T')[0];
  const currentPower = getTotalPower();
  const todayKWh = getTodayKWh();

  return {
    date: today,
    totalKWh: todayKWh,
    peakPower: currentPower, // simplified: track actual peak via daily_usage table
    avgPower: currentPower,
    roomBreakdown: getRoomBreakdowns(),
    alertCount: 0,
  };
}

/** Get weekly report data. */
export function getWeeklyReport(): WeeklyReport {
  const weekly = getWeeklyUsage();
  const totalKWh = weekly.reduce((s, d) => s + d.kWh, 0);
  const peakDay = weekly.reduce((a, b) => (b.kWh > a.kWh ? b : a), { day: '—', kWh: 0, peak: 0 });

  return {
    days: weekly,
    totalKWh: +totalKWh.toFixed(2),
    estimatedBill: +(totalKWh * config.billing.ratePerKWh).toFixed(2),
    peakDay: peakDay.day,
    avgPerDay: +(totalKWh / Math.max(weekly.length, 1)).toFixed(2),
    roomSummaries: getRoomBreakdowns(),
  };
}
