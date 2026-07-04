import { getStore } from './database.js';
import type { ActivityEvent, ActivityKind } from '../types/index.js';
import { generateId, nowISO } from '../utils/helpers.js';

/** Add an activity event. */
export function addActivity(data: {
  message: string;
  deviceId?: string;
  room?: string;
  kind: ActivityKind;
}): ActivityEvent {
  const event: ActivityEvent = {
    id: generateId(),
    timestamp: nowISO(),
    message: data.message,
    deviceId: data.deviceId,
    room: data.room,
    kind: data.kind,
  };

  getStore().activity.unshift(event);

  // Keep log manageable
  if (getStore().activity.length > 200) {
    getStore().activity = getStore().activity.slice(0, 200);
  }

  return event;
}

/** Get recent activity events. */
export function getRecentActivity(limit: number = 50): ActivityEvent[] {
  return getStore().activity.slice(0, Math.min(limit, 100));
}
