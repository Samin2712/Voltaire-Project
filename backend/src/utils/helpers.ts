import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { ROOMS } from '../types/index.js';

/** Generate a UUID v4. */
export function generateId(): string {
  return uuidv4();
}

/** Check if current time is within configured office hours. */
export function isOfficeHours(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= config.officeHours.start && hour < config.officeHours.end;
}

/** Format watts nicely. */
export function formatWatts(w: number): string {
  return w >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${Math.round(w)} W`;
}

/** Format seconds to human-friendly duration. */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}

/** Look up room name from roomId. */
export function roomNameFromId(roomId: string): string {
  return ROOMS.find((r) => r.id === roomId)?.name ?? roomId;
}

/** Look up room from roomId. */
export function findRoom(roomId: string) {
  return ROOMS.find((r) => r.id === roomId);
}

/** Find room by partial/fuzzy name match. */
export function findRoomByName(name: string) {
  const lower = name.toLowerCase().replace(/[-_\s]+/g, '');
  return ROOMS.find((r) => {
    const id = r.id.replace(/[-_\s]+/g, '');
    const rName = r.name.toLowerCase().replace(/[-_\s]+/g, '');
    return id === lower || rName === lower || rName.includes(lower) || id.includes(lower);
  });
}

/** Current ISO timestamp. */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Clamp a number between min and max. */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Random integer between min and max (inclusive). */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array. */
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random boolean with a given probability of true. */
export function chance(probability: number): boolean {
  return Math.random() < probability;
}
