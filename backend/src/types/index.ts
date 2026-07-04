// ── Device ───────────────────────────────────────────────────────────────────
export type DeviceType = 'fan' | 'light';
export type DeviceStatus = 'on' | 'off';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: string;       // human-readable: "Drawing Room"
  roomId: string;      // slug: "drawing-room"
  status: DeviceStatus;
  powerDraw: number;   // current watts (0 when off)
  ratedPower: number;  // watts at full load
  lastChanged: string; // ISO 8601
  runtimeToday: number;   // seconds
  totalRuntime: number;   // seconds (lifetime)
  energyUsedToday: number; // kWh
  isOnline: boolean;
}

// ── Room ─────────────────────────────────────────────────────────────────────
export interface Room {
  id: string;
  name: string;
  description: string;
}

export interface RoomSummary extends Room {
  devices: Device[];
  currentPower: number;
  devicesOn: number;
  totalDevices: number;
  efficiency: number;
  health: number;
  temperature: number;
  lastActivity: string;
}

// ── Alert ────────────────────────────────────────────────────────────────────
export type AlertType = 'after-hours' | 'full-room' | 'high-power' | 'spike';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  room?: string;
  deviceId?: string;
  timestamp: string;
  dismissed: boolean;
  resolved: boolean;
}

// ── Activity ─────────────────────────────────────────────────────────────────
export type ActivityKind = 'on' | 'off' | 'alert' | 'system';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  message: string;
  deviceId?: string;
  room?: string;
  kind: ActivityKind;
}

// ── Usage / Power ────────────────────────────────────────────────────────────
export interface PowerSample {
  time: string;  // HH:mm
  total: number;
  drawing: number;
  work1: number;
  work2: number;
}

export interface RoomBreakdown {
  roomId: string;
  room: string;
  currentPower: number;
  devicesOn: number;
  totalDevices: number;
}

export interface UsageData {
  currentPower: number;
  todayEnergy: number;      // kWh
  estimatedBill: number;    // BDT
  roomBreakdown: RoomBreakdown[];
}

export interface DashboardStats {
  totalDevices: number;
  devicesOn: number;
  devicesOff: number;
  currentPower: number;
  todayEnergy: number;
  estimatedBill: number;
  activeAlerts: number;
  avgRoomUsage: number;
}

export interface WeeklyUsage {
  day: string;
  kWh: number;
  peak: number;
}

export interface DailyReport {
  date: string;
  totalKWh: number;
  peakPower: number;
  avgPower: number;
  roomBreakdown: RoomBreakdown[];
  alertCount: number;
}

export interface WeeklyReport {
  days: WeeklyUsage[];
  totalKWh: number;
  estimatedBill: number;
  peakDay: string;
  avgPerDay: number;
  roomSummaries: RoomBreakdown[];
}

// ── Room definitions ─────────────────────────────────────────────────────────
export const ROOMS: Room[] = [
  { id: 'drawing-room', name: 'Drawing Room', description: 'Waiting area' },
  { id: 'work-room-1', name: 'Work Room 1', description: 'Employee workspace' },
  { id: 'work-room-2', name: 'Work Room 2', description: 'Employee workspace' },
];

export const RATED_POWER: Record<DeviceType, number> = {
  fan: 60,
  light: 15,
};
