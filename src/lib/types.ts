export type DeviceType = "fan" | "light";
export type DeviceStatus = "on" | "off";
export type RoomId = "drawing" | "work1" | "work2" | string;

export interface Room {
  id: RoomId;
  name: string;
  description: string;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  power: number; // watts when on (alias for powerDraw)
  room: RoomId;
  lastChanged: string; // ISO
  runtimeMinutes: number;
  // Extended fields from backend
  roomId?: string;
  powerDraw?: number;
  ratedPower?: number;
  runtimeToday?: number; // seconds
  totalRuntime?: number; // seconds
  energyUsedToday?: number; // kWh
  isOnline?: boolean;
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  room?: RoomId;
  deviceId?: string;
  timestamp: string;
  // Extended fields from backend
  type?: string;
  dismissed?: boolean;
  resolved?: boolean;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  message: string;
  deviceId?: string;
  room?: RoomId;
  kind: "on" | "off" | "alert" | "system";
}

export interface PowerSample {
  time: string; // HH:mm
  total: number;
  drawing: number;
  work1: number;
  work2: number;
}

export interface UsageData {
  currentPower: number;
  todayEnergy: number;
  estimatedBill: number;
  roomBreakdown: {
    roomId: string;
    room: string;
    currentPower: number;
    devicesOn: number;
    totalDevices: number;
  }[];
}
