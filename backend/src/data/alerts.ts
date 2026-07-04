import { getStore } from './database.js';
import type { Alert, AlertType, AlertSeverity } from '../types/index.js';
import { generateId, nowISO } from '../utils/helpers.js';

/** Get all alerts (newest first). */
export function getAllAlerts(): Alert[] {
  return [...getStore().alerts].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Get active (undismissed) alerts. */
export function getActiveAlerts(): Alert[] {
  return getStore().alerts
    .filter((a) => !a.dismissed)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Get alerts by type. */
export function getAlertsByType(type: AlertType): Alert[] {
  return getStore().alerts
    .filter((a) => a.type === type)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Check if an alert with the same type and room already exists (undismissed). */
export function alertExists(type: AlertType, room?: string): boolean {
  return getStore().alerts.some((a) => {
    if (a.type !== type) return false;
    if (a.dismissed || a.resolved) return false;
    if (room && a.room !== room) return false;
    return true;
  });
}

/** Create a new alert. Returns the created alert. */
export function createAlert(data: {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  room?: string;
  deviceId?: string;
}): Alert {
  const alert: Alert = {
    id: generateId(),
    type: data.type,
    severity: data.severity,
    title: data.title,
    message: data.message,
    room: data.room,
    deviceId: data.deviceId,
    timestamp: nowISO(),
    dismissed: false,
    resolved: false,
  };

  getStore().alerts.unshift(alert);

  // Keep alerts manageable
  if (getStore().alerts.length > 100) {
    getStore().alerts = getStore().alerts.slice(0, 100);
  }

  return alert;
}

/** Dismiss an alert by ID. */
export function dismissAlert(id: string): Alert | undefined {
  const alert = getStore().alerts.find((a) => a.id === id);
  if (!alert) return undefined;
  alert.dismissed = true;
  return { ...alert };
}

/** Resolve an alert by ID. */
export function resolveAlert(id: string): Alert | undefined {
  const alert = getStore().alerts.find((a) => a.id === id);
  if (!alert) return undefined;
  alert.resolved = true;
  return { ...alert };
}

/** Resolve all alerts of a specific type for a room. */
export function resolveAlertsByTypeAndRoom(type: AlertType, room: string): void {
  for (const alert of getStore().alerts) {
    if (alert.type === type && alert.room === room && !alert.resolved) {
      alert.resolved = true;
    }
  }
}

/** Get count of active alerts. */
export function getActiveAlertCount(): number {
  return getStore().alerts.filter((a) => !a.dismissed && !a.resolved).length;
}

/** Clean up old resolved/dismissed alerts (keep last 100). */
export function cleanupOldAlerts(): void {
  const s = getStore();
  if (s.alerts.length > 100) {
    s.alerts = s.alerts.slice(0, 100);
  }
}
