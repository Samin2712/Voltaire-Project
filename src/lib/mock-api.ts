// Mock API layer. Replace these functions with real API calls later.
// All UI reads from these functions — no direct data access elsewhere.
import type {
  ActivityEvent,
  Alert,
  Device,
  DeviceType,
  PowerSample,
  Room,
  RoomId,
} from "./types";

export const ROOMS: Room[] = [
  { id: "drawing", name: "Drawing Room", description: "Waiting area" },
  { id: "work1", name: "Work Room 1", description: "Employee workspace" },
  { id: "work2", name: "Work Room 2", description: "Employee workspace" },
];

const POWER: Record<DeviceType, number> = { fan: 60, light: 15 };

function seed(): Device[] {
  const now = Date.now();
  const devices: Device[] = [];
  for (const room of ROOMS) {
    for (let i = 1; i <= 2; i++) {
      const on = Math.random() > 0.4;
      devices.push({
        id: `${room.id}-fan-${i}`,
        name: `Fan ${i}`,
        type: "fan",
        room: room.id,
        status: on ? "on" : "off",
        power: POWER.fan,
        lastChanged: new Date(now - Math.random() * 3_600_000).toISOString(),
        runtimeMinutes: Math.floor(Math.random() * 240),
      });
    }
    for (let i = 1; i <= 3; i++) {
      const on = Math.random() > 0.35;
      devices.push({
        id: `${room.id}-light-${i}`,
        name: `Light ${i}`,
        type: "light",
        room: room.id,
        status: on ? "on" : "off",
        power: POWER.light,
        lastChanged: new Date(now - Math.random() * 3_600_000).toISOString(),
        runtimeMinutes: Math.floor(Math.random() * 240),
      });
    }
  }
  return devices;
}

let DEVICES: Device[] = seed();

const ACTIVITY: ActivityEvent[] = [];

function pushActivity(ev: Omit<ActivityEvent, "id" | "timestamp">) {
  ACTIVITY.unshift({
    ...ev,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  if (ACTIVITY.length > 60) ACTIVITY.pop();
}

// Simulator: randomly flip states to keep it "live"
if (typeof window !== "undefined") {
  setInterval(() => {
    const d = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    const next = d.status === "on" ? "off" : "on";
    d.status = next;
    d.lastChanged = new Date().toISOString();
    pushActivity({
      kind: next,
      message: `${d.name} in ${roomName(d.room)} turned ${next.toUpperCase()}`,
      deviceId: d.id,
      room: d.room,
    });
    listeners.forEach((l) => l());
  }, 4500);
}

function roomName(id: RoomId) {
  return ROOMS.find((r) => r.id === id)?.name ?? id;
}

const listeners = new Set<() => void>();
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function fetchDevices(): Promise<Device[]> {
  return structuredClone(DEVICES);
}

export async function toggleDevice(id: string) {
  const d = DEVICES.find((x) => x.id === id);
  if (!d) return;
  d.status = d.status === "on" ? "off" : "on";
  d.lastChanged = new Date().toISOString();
  pushActivity({
    kind: d.status,
    message: `${d.name} in ${roomName(d.room)} turned ${d.status.toUpperCase()}`,
    deviceId: d.id,
    room: d.room,
  });
  listeners.forEach((l) => l());
}

export function currentPower(devices: Device[] = DEVICES) {
  return devices.filter((d) => d.status === "on").reduce((s, d) => s + d.power, 0);
}

export function roomPower(room: RoomId, devices: Device[] = DEVICES) {
  return devices
    .filter((d) => d.room === room && d.status === "on")
    .reduce((s, d) => s + d.power, 0);
}

export async function fetchAlerts(): Promise<Alert[]> {
  const now = new Date();
  const hour = now.getHours();
  const alerts: Alert[] = [];
  for (const r of ROOMS) {
    const onDevices = DEVICES.filter((d) => d.room === r.id && d.status === "on");
    if (onDevices.length === 5) {
      alerts.push({
        id: `all-on-${r.id}`,
        severity: "warning",
        title: `${r.name} fully active`,
        message: `All 5 devices in ${r.name} have been ON. Consider automating shutoff.`,
        room: r.id,
        timestamp: new Date(Date.now() - 15 * 60_000).toISOString(),
      });
    }
    if ((hour >= 17 || hour < 9) && onDevices.length > 0) {
      alerts.push({
        id: `after-hours-${r.id}`,
        severity: "critical",
        title: `After-hours activity in ${r.name}`,
        message: `${onDevices.length} device(s) still running outside 9AM–5PM office hours.`,
        room: r.id,
        timestamp: new Date(Date.now() - 4 * 60_000).toISOString(),
      });
    }
  }
  const power = currentPower();
  if (power > 350) {
    alerts.push({
      id: "high-power",
      severity: "warning",
      title: "High office power draw",
      message: `Current draw is ${power}W — above your 350W efficiency target.`,
      timestamp: new Date(Date.now() - 2 * 60_000).toISOString(),
    });
  }
  alerts.push({
    id: "spike-detected",
    severity: "info",
    title: "Unusual spike detected at 14:32",
    message: "Power drew +180W briefly in Work Room 2. Auto-normalized.",
    room: "work2",
    timestamp: new Date(Date.now() - 42 * 60_000).toISOString(),
  });
  return alerts;
}

export async function fetchActivity(): Promise<ActivityEvent[]> {
  if (ACTIVITY.length === 0) {
    // seed with a few
    for (let i = 0; i < 6; i++) {
      const d = DEVICES[Math.floor(Math.random() * DEVICES.length)];
      ACTIVITY.push({
        id: crypto.randomUUID(),
        kind: d.status,
        deviceId: d.id,
        room: d.room,
        message: `${d.name} in ${roomName(d.room)} turned ${d.status.toUpperCase()}`,
        timestamp: new Date(Date.now() - i * 90_000).toISOString(),
      });
    }
  }
  return structuredClone(ACTIVITY);
}

// Deterministic-ish 24h synthetic power curve
export async function fetchPowerSeries(points = 24): Promise<PowerSample[]> {
  const out: PowerSample[] = [];
  for (let i = 0; i < points; i++) {
    const hour = i;
    const wave = Math.sin((hour / 24) * Math.PI * 2 - 1.4);
    const base = hour >= 9 && hour <= 17 ? 320 : 90;
    const draw = base + wave * 60 + Math.sin(hour) * 30;
    const w1 = Math.max(20, draw * 0.42 + Math.cos(hour) * 10);
    const w2 = Math.max(20, draw * 0.38 + Math.sin(hour * 1.3) * 12);
    const dr = Math.max(15, draw - w1 - w2);
    out.push({
      time: `${String(hour).padStart(2, "0")}:00`,
      total: Math.round(w1 + w2 + dr),
      drawing: Math.round(dr),
      work1: Math.round(w1),
      work2: Math.round(w2),
    });
  }
  return out;
}

export async function fetchWeeklyUsage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d, i) => ({
    day: d,
    kWh: +(3 + Math.sin(i) * 0.8 + Math.random() * 0.6).toFixed(2),
    peak: +(0.4 + Math.random() * 0.2).toFixed(2),
  }));
}

export async function fetchRoomStats() {
  const stats = ROOMS.map((r) => {
    const list = DEVICES.filter((d) => d.room === r.id);
    const on = list.filter((d) => d.status === "on");
    const power = on.reduce((s, d) => s + d.power, 0);
    const efficiency = Math.max(30, 100 - (on.length / list.length) * 55);
    return {
      room: r,
      total: list.length,
      running: on.length,
      power,
      efficiency: Math.round(efficiency),
      health: Math.round(70 + Math.random() * 25),
      temperature: +(22 + Math.random() * 3).toFixed(1),
      lastActivity: list
        .map((d) => d.lastChanged)
        .sort()
        .reverse()[0],
    };
  });
  return stats;
}

export function estimatedBillBDT(kWh: number) {
  // Approx tiered rate BDT ~8/kWh
  return Math.round(kWh * 8.4 * 100) / 100;
}

export function todayKWh(): number {
  // Rough estimate: current power * hours today
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  const avgW = currentPower() * 0.85;
  return +((avgW * hours) / 1000).toFixed(2);
}
