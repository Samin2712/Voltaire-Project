import type { Server as SocketIOServer } from 'socket.io';
import type { Alert, Device, UsageData, RoomSummary, ActivityEvent, DashboardStats } from '../types/index.js';

let io: SocketIOServer | null = null;

/** Set the Socket.IO server instance. */
export function setSocketIO(server: SocketIOServer): void {
  io = server;
}

/** Get the Socket.IO server instance. */
export function getIO(): SocketIOServer | null {
  return io;
}

// ── Emit helpers ─────────────────────────────────────────────────────────────

/** Emit device update to all connected clients. */
export function emitDeviceUpdate(devices: Device[]): void {
  io?.emit('device:update', devices);
}

/** Emit usage update to all connected clients. */
export function emitUsageUpdate(usage: UsageData): void {
  io?.emit('usage:update', usage);
}

/** Emit room update to all connected clients. */
export function emitRoomUpdate(rooms: RoomSummary[]): void {
  io?.emit('room:update', rooms);
}

/** Emit new alert to all connected clients. */
export function emitAlertNew(alert: Alert): void {
  io?.emit('alert:new', alert);
}

/** Emit alert update (dismiss/resolve) to all connected clients. */
export function emitAlertUpdate(alert: Alert): void {
  io?.emit('alert:update', alert);
}

/** Emit new activity event to all connected clients. */
export function emitActivityNew(event: ActivityEvent): void {
  io?.emit('activity:new', event);
}

/** Emit full dashboard update to all connected clients. */
export function emitDashboardUpdate(stats: DashboardStats): void {
  io?.emit('dashboard:update', stats);
}
