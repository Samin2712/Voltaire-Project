import { getStore } from './database.js';
import type { Device, DeviceStatus } from '../types/index.js';
import { nowISO } from '../utils/helpers.js';

/** Get all devices. */
export function getAllDevices(): Device[] {
  return [...getStore().devices].sort((a, b) => {
    if (a.roomId !== b.roomId) return a.roomId.localeCompare(b.roomId);
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });
}

/** Get a single device by ID. */
export function getDeviceById(id: string): Device | undefined {
  return getStore().devices.find((d) => d.id === id);
}

/** Get devices for a specific room. */
export function getDevicesByRoom(roomId: string): Device[] {
  return getStore().devices
    .filter((d) => d.roomId === roomId)
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}

/** Toggle a device on/off. Returns the updated device. */
export function toggleDevice(id: string): Device | undefined {
  const device = getStore().devices.find((d) => d.id === id);
  if (!device) return undefined;

  device.status = device.status === 'on' ? 'off' : 'on';
  device.powerDraw = device.status === 'on' ? device.ratedPower : 0;
  device.lastChanged = nowISO();

  return { ...device };
}

/** Update device status and power. */
export function updateDeviceStatus(id: string, status: DeviceStatus): Device | undefined {
  const device = getStore().devices.find((d) => d.id === id);
  if (!device) return undefined;

  device.status = status;
  device.powerDraw = status === 'on' ? device.ratedPower : 0;
  device.lastChanged = nowISO();

  return { ...device };
}

/** Update device fields (partial update). */
export function updateDevice(id: string, updates: Partial<Pick<Device, 'status' | 'powerDraw' | 'runtimeToday' | 'totalRuntime' | 'energyUsedToday' | 'lastChanged' | 'isOnline'>>): Device | undefined {
  const device = getStore().devices.find((d) => d.id === id);
  if (!device) return undefined;

  if (updates.status !== undefined) device.status = updates.status;
  if (updates.powerDraw !== undefined) device.powerDraw = updates.powerDraw;
  if (updates.runtimeToday !== undefined) device.runtimeToday = updates.runtimeToday;
  if (updates.totalRuntime !== undefined) device.totalRuntime = updates.totalRuntime;
  if (updates.energyUsedToday !== undefined) device.energyUsedToday = updates.energyUsedToday;
  if (updates.lastChanged !== undefined) device.lastChanged = updates.lastChanged;
  if (updates.isOnline !== undefined) device.isOnline = updates.isOnline;

  return { ...device };
}

/** Increment runtime and energy for all ON devices (called by simulator each tick). */
export function tickRuntime(intervalSeconds: number): void {
  for (const device of getStore().devices) {
    if (device.status === 'on') {
      device.runtimeToday += intervalSeconds;
      device.totalRuntime += intervalSeconds;
      device.energyUsedToday = +(device.energyUsedToday + (device.powerDraw * intervalSeconds / 3600000)).toFixed(6);
    }
  }
}

/** Reset daily counters (runtimeToday, energyUsedToday). */
export function resetDailyCounters(): void {
  for (const device of getStore().devices) {
    device.runtimeToday = 0;
    device.energyUsedToday = 0;
  }
}

/** Calculate total power draw across all devices. */
export function getTotalPower(): number {
  return getStore().devices
    .filter((d) => d.status === 'on')
    .reduce((s, d) => s + d.powerDraw, 0);
}

/** Calculate power draw for a specific room. */
export function getRoomPower(roomId: string): number {
  return getStore().devices
    .filter((d) => d.roomId === roomId && d.status === 'on')
    .reduce((s, d) => s + d.powerDraw, 0);
}
