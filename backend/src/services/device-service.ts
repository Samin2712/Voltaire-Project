import { getAllDevices, getDeviceById, getDevicesByRoom, toggleDevice as toggleDeviceData, updateDeviceStatus, getTotalPower, getRoomPower } from '../data/devices.js';
import { ROOMS } from '../types/index.js';
import type { Device, RoomSummary, RoomBreakdown, UsageData, DashboardStats } from '../types/index.js';
import { config } from '../config/index.js';
import { getTodayKWh } from '../data/usage.js';
import { getActiveAlertCount } from '../data/alerts.js';

/** Get all devices. */
export function getDevices(): Device[] {
  return getAllDevices();
}

/** Get single device. */
export function getDevice(id: string): Device | undefined {
  return getDeviceById(id);
}

/** Toggle device. */
export function toggle(id: string): Device | undefined {
  return toggleDeviceData(id);
}

/** Get room summaries with device details. */
export function getRoomSummaries(): RoomSummary[] {
  return ROOMS.map((room) => {
    const devices = getDevicesByRoom(room.id);
    const onDevices = devices.filter((d) => d.status === 'on');
    const power = onDevices.reduce((s, d) => s + d.powerDraw, 0);
    const efficiency = devices.length > 0
      ? Math.max(30, 100 - (onDevices.length / devices.length) * 55)
      : 100;

    return {
      ...room,
      devices,
      currentPower: power,
      devicesOn: onDevices.length,
      totalDevices: devices.length,
      efficiency: Math.round(efficiency),
      health: Math.round(70 + Math.random() * 25),
      temperature: +(22 + Math.random() * 3).toFixed(1),
      lastActivity: devices
        .map((d) => d.lastChanged)
        .sort()
        .reverse()[0] ?? new Date().toISOString(),
    };
  });
}

/** Get single room summary. */
export function getRoomSummary(roomId: string): RoomSummary | undefined {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return undefined;

  const devices = getDevicesByRoom(roomId);
  const onDevices = devices.filter((d) => d.status === 'on');
  const power = onDevices.reduce((s, d) => s + d.powerDraw, 0);
  const efficiency = devices.length > 0
    ? Math.max(30, 100 - (onDevices.length / devices.length) * 55)
    : 100;

  return {
    ...room,
    devices,
    currentPower: power,
    devicesOn: onDevices.length,
    totalDevices: devices.length,
    efficiency: Math.round(efficiency),
    health: Math.round(70 + Math.random() * 25),
    temperature: +(22 + Math.random() * 3).toFixed(1),
    lastActivity: devices
      .map((d) => d.lastChanged)
      .sort()
      .reverse()[0] ?? new Date().toISOString(),
  };
}

/** Get room breakdowns for usage data. */
export function getRoomBreakdowns(): RoomBreakdown[] {
  return ROOMS.map((room) => {
    const devices = getDevicesByRoom(room.id);
    const onDevices = devices.filter((d) => d.status === 'on');
    return {
      roomId: room.id,
      room: room.name,
      currentPower: onDevices.reduce((s, d) => s + d.powerDraw, 0),
      devicesOn: onDevices.length,
      totalDevices: devices.length,
    };
  });
}

/** Get current usage data. */
export function getUsageData(): UsageData {
  const currentPower = getTotalPower();
  const todayEnergy = getTodayKWh();
  const estimatedBill = +(todayEnergy * config.billing.ratePerKWh).toFixed(2);

  return {
    currentPower,
    todayEnergy,
    estimatedBill,
    roomBreakdown: getRoomBreakdowns(),
  };
}

/** Get dashboard stats. */
export function getDashboardStats(): DashboardStats {
  const devices = getAllDevices();
  const onDevices = devices.filter((d) => d.status === 'on');
  const currentPower = onDevices.reduce((s, d) => s + d.powerDraw, 0);
  const todayEnergy = getTodayKWh();

  return {
    totalDevices: devices.length,
    devicesOn: onDevices.length,
    devicesOff: devices.length - onDevices.length,
    currentPower,
    todayEnergy,
    estimatedBill: +(todayEnergy * config.billing.ratePerKWh).toFixed(2),
    activeAlerts: getActiveAlertCount(),
    avgRoomUsage: ROOMS.length > 0 ? Math.round(currentPower / ROOMS.length) : 0,
  };
}
