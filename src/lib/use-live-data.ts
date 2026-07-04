import { useEffect, useState, useCallback } from "react";
import {
  fetchDevicesAPI,
  fetchAlertsAPI,
  fetchActivityAPI,
  fetchUsageAPI,
  fetchStatsAPI,
  checkBackendHealth,
} from "./api";
import { onDeviceUpdate, onAlertNew, onAlertUpdate, onActivityNew, onUsageUpdate, onDashboardUpdate, onClientConnected, initSocket } from "./socket";
import { subscribe, fetchDevices, fetchAlerts, fetchActivity } from "./mock-api";
import type { ActivityEvent, Alert, Device, UsageData } from "./types";

// ── Backend availability check ───────────────────────────────────────────────

let backendAvailable: boolean | null = null;
let backendCheckPromise: Promise<boolean> | null = null;

function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return Promise.resolve(backendAvailable);
  if (backendCheckPromise) return backendCheckPromise;

  backendCheckPromise = checkBackendHealth().then((ok) => {
    backendAvailable = ok;
    if (ok) {
      console.log("[Voltaire] Backend connected — using live data");
      initSocket();
    } else {
      console.log("[Voltaire] Backend offline — using mock data");
    }
    return ok;
  });

  return backendCheckPromise;
}

// ── Helper to normalize backend device to frontend shape ─────────────────────

function normalizeDevice(d: any): Device {
  // Map backend roomId → frontend room alias
  const roomMap: Record<string, string> = {
    "drawing-room": "drawing",
    "work-room-1": "work1",
    "work-room-2": "work2",
  };

  return {
    id: d.id,
    name: d.name,
    type: d.type,
    status: d.status,
    power: d.powerDraw ?? d.ratedPower ?? d.power ?? 0,
    room: roomMap[d.roomId] ?? d.room ?? d.roomId,
    lastChanged: d.lastChanged,
    runtimeMinutes: d.runtimeToday != null ? Math.floor(d.runtimeToday / 60) : (d.runtimeMinutes ?? 0),
    roomId: d.roomId,
    powerDraw: d.powerDraw,
    ratedPower: d.ratedPower,
    runtimeToday: d.runtimeToday,
    totalRuntime: d.totalRuntime,
    energyUsedToday: d.energyUsedToday,
    isOnline: d.isOnline,
  };
}

function normalizeAlert(a: any): Alert {
  const roomMap: Record<string, string> = {
    "drawing-room": "drawing",
    "work-room-1": "work1",
    "work-room-2": "work2",
  };

  return {
    ...a,
    room: roomMap[a.room] ?? a.room,
  };
}

function normalizeActivity(e: any): ActivityEvent {
  const roomMap: Record<string, string> = {
    "drawing-room": "drawing",
    "work-room-1": "work1",
    "work-room-2": "work2",
  };

  return {
    ...e,
    room: roomMap[e.room] ?? e.room,
  };
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    let alive = true;
    let cleanup: (() => void) | undefined;

    checkBackend().then((useBackend) => {
      if (!alive) return;

      if (useBackend) {
        // Fetch from backend API
        fetchDevicesAPI()
          .then((data) => alive && setDevices(data.map(normalizeDevice)))
          .catch(() => {
            // Fallback to mock
            fetchDevices().then((d) => alive && setDevices(d));
          });

        const unsub = onDeviceUpdate((data) => {
          if (alive) setDevices(data.map(normalizeDevice));
        });

        const unsubInit = onClientConnected((state) => {
          if (alive && state.devices) {
            setDevices(state.devices.map(normalizeDevice));
          }
        });

        cleanup = () => {
          unsub();
          unsubInit();
        };
      } else {
        const load = () => fetchDevices().then((d) => alive && setDevices(d));
        load();
        const unsub = subscribe(load);
        cleanup = unsub;
      }
    });

    return () => {
      alive = false;
      cleanup?.();
    };
  }, []);

  return devices;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let alive = true;
    let cleanup: (() => void) | undefined;

    checkBackend().then((useBackend) => {
      if (!alive) return;

      if (useBackend) {
        fetchAlertsAPI()
          .then((data) => alive && setAlerts(data.map(normalizeAlert)))
          .catch(() => {
            fetchAlerts().then((a) => alive && setAlerts(a));
          });

        const unsubNew = onAlertNew((alert) => {
          if (alive) setAlerts((prev) => [normalizeAlert(alert), ...prev]);
        });

        const unsubUpdate = onAlertUpdate((alert) => {
          if (alive) {
            setAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? normalizeAlert(alert) : a))
                .filter((a) => !a.dismissed)
            );
          }
        });

        const unsubInit = onClientConnected((state) => {
          if (alive && state.alerts) {
            setAlerts(state.alerts.map(normalizeAlert));
          }
        });

        cleanup = () => {
          unsubNew();
          unsubUpdate();
          unsubInit();
        };
      } else {
        const load = () => fetchAlerts().then((a) => alive && setAlerts(a));
        load();
        const unsub = subscribe(load);
        cleanup = unsub;
      }
    });

    return () => {
      alive = false;
      cleanup?.();
    };
  }, []);

  return alerts;
}

export function useActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let alive = true;
    let cleanup: (() => void) | undefined;

    checkBackend().then((useBackend) => {
      if (!alive) return;

      if (useBackend) {
        fetchActivityAPI()
          .then((data) => alive && setEvents(data.map(normalizeActivity)))
          .catch(() => {
            fetchActivity().then((e) => alive && setEvents(e));
          });

        const unsub = onActivityNew((event) => {
          if (alive) {
            setEvents((prev) => [normalizeActivity(event), ...prev.slice(0, 49)]);
          }
        });

        const unsubInit = onClientConnected((state) => {
          if (alive && state.activity) {
            setEvents(state.activity.map(normalizeActivity));
          }
        });

        cleanup = () => {
          unsub();
          unsubInit();
        };
      } else {
        const load = () => fetchActivity().then((e) => alive && setEvents(e));
        load();
        const unsub = subscribe(load);
        cleanup = unsub;
      }
    });

    return () => {
      alive = false;
      cleanup?.();
    };
  }, []);

  return events;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    let alive = true;
    let cleanup: (() => void) | undefined;

    checkBackend().then((useBackend) => {
      if (!alive) return;

      if (useBackend) {
        fetchUsageAPI()
          .then((data) => alive && setUsage(data))
          .catch(() => {});

        const unsub = onUsageUpdate((data) => {
          if (alive) setUsage(data);
        });

        const unsubInit = onClientConnected((state) => {
          if (alive && state.usage) setUsage(state.usage);
        });

        cleanup = () => {
          unsub();
          unsubInit();
        };
      }
    });

    return () => {
      alive = false;
      cleanup?.();
    };
  }, []);

  return usage;
}

export function useStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    let cleanup: (() => void) | undefined;

    checkBackend().then((useBackend) => {
      if (!alive) return;

      if (useBackend) {
        fetchStatsAPI()
          .then((data) => alive && setStats(data))
          .catch(() => {});

        const unsub = onDashboardUpdate((data) => {
          if (alive) setStats(data);
        });

        cleanup = unsub;
      }
    });

    return () => {
      alive = false;
      cleanup?.();
    };
  }, []);

  return stats;
}
