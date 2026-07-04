// ── Socket.IO Client Service ─────────────────────────────────────────────────
// Real-time connection to the Voltaire backend.
// Gracefully handles disconnection — the frontend works offline via REST polling.

import { API_BASE } from './api';

type Listener = (...args: any[]) => void;

interface SocketLike {
  connected: boolean;
  on(event: string, fn: Listener): void;
  off(event: string, fn?: Listener): void;
  disconnect(): void;
}

let socket: SocketLike | null = null;
let ioModule: any = null;
const pendingListeners: { event: string; fn: Listener }[] = [];

/** Initialize Socket.IO connection (lazy — only in browser). */
async function ensureSocket(): Promise<SocketLike | null> {
  if (typeof window === 'undefined') return null;
  if (socket) return socket;

  try {
    // Dynamic import to avoid SSR issues
    if (!ioModule) {
      ioModule = await import('socket.io-client');
    }
    const io = ioModule.io || ioModule.default?.io || ioModule.default;
    if (!io) {
      console.warn('[Socket] Could not load socket.io-client');
      return null;
    }

    socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket!.on('connect' as any, () => {
      console.log('[Socket] Connected to Voltaire backend');
    });

    socket!.on('disconnect' as any, (reason: string) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket!.on('connect_error' as any, (err: Error) => {
      // Silent — backend might not be running
      console.debug('[Socket] Connection error (backend may be offline):', err.message);
    });

    // Attach any pending listeners
    for (const { event, fn } of pendingListeners) {
      socket!.on(event, fn);
    }
    pendingListeners.length = 0;

    return socket;
  } catch {
    console.debug('[Socket] socket.io-client not available');
    return null;
  }
}

/** Subscribe to a Socket.IO event. */
export function onSocketEvent(event: string, fn: Listener): () => void {
  if (socket) {
    socket.on(event, fn);
  } else {
    pendingListeners.push({ event, fn });
    // Try to connect
    ensureSocket();
  }

  return () => {
    if (socket) {
      socket.off(event, fn);
    }
    const idx = pendingListeners.findIndex((p) => p.event === event && p.fn === fn);
    if (idx >= 0) pendingListeners.splice(idx, 1);
  };
}

/** Check if socket is connected. */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/** Initialize the socket connection. Call once at app startup. */
export function initSocket(): void {
  ensureSocket();
}

/** Disconnect the socket. */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ── Typed event helpers ──────────────────────────────────────────────────────

export function onDeviceUpdate(fn: (devices: any[]) => void) {
  return onSocketEvent('device:update', fn);
}

export function onUsageUpdate(fn: (usage: any) => void) {
  return onSocketEvent('usage:update', fn);
}

export function onRoomUpdate(fn: (rooms: any[]) => void) {
  return onSocketEvent('room:update', fn);
}

export function onAlertNew(fn: (alert: any) => void) {
  return onSocketEvent('alert:new', fn);
}

export function onAlertUpdate(fn: (alert: any) => void) {
  return onSocketEvent('alert:update', fn);
}

export function onActivityNew(fn: (event: any) => void) {
  return onSocketEvent('activity:new', fn);
}

export function onDashboardUpdate(fn: (stats: any) => void) {
  return onSocketEvent('dashboard:update', fn);
}

export function onClientConnected(fn: (initialState: any) => void) {
  return onSocketEvent('client:connected', fn);
}
