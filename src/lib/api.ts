// ── Backend API Service ──────────────────────────────────────────────────────
// All frontend API calls go through this module.
// Configure VITE_API_URL in .env to point to the backend (default: http://localhost:3001).

const API_BASE = (typeof window !== 'undefined'
  ? (window as any).__VITE_API_URL__
  : undefined)
  ?? import.meta.env?.VITE_API_URL
  ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText} — ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Device endpoints ─────────────────────────────────────────────────────────

export async function fetchDevicesAPI() {
  return apiFetch<any[]>('/api/devices');
}

export async function fetchDeviceAPI(id: string) {
  return apiFetch<any>(`/api/devices/${id}`);
}

export async function toggleDeviceAPI(id: string) {
  return apiFetch<any>(`/api/devices/${id}/toggle`, { method: 'PATCH' });
}

export async function updateDeviceAPI(id: string, data: { status: string }) {
  return apiFetch<any>(`/api/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Room endpoints ───────────────────────────────────────────────────────────

export async function fetchRoomsAPI() {
  return apiFetch<any[]>('/api/rooms');
}

export async function fetchRoomAPI(roomId: string) {
  return apiFetch<any>(`/api/rooms/${roomId}`);
}

// ── Usage endpoints ──────────────────────────────────────────────────────────

export async function fetchUsageAPI() {
  return apiFetch<any>('/api/usage');
}

export async function fetchUsageHistoryAPI(period: string = 'hourly') {
  return apiFetch<any[]>(`/api/usage/history?period=${period}`);
}

// ── Alert endpoints ──────────────────────────────────────────────────────────

export async function fetchAlertsAPI() {
  return apiFetch<any[]>('/api/alerts');
}

export async function dismissAlertAPI(id: string) {
  return apiFetch<any>(`/api/alerts/${id}/dismiss`, { method: 'PATCH' });
}

// ── Activity endpoints ───────────────────────────────────────────────────────

export async function fetchActivityAPI(limit: number = 50) {
  return apiFetch<any[]>(`/api/activity?limit=${limit}`);
}

// ── Stats endpoints ──────────────────────────────────────────────────────────

export async function fetchStatsAPI() {
  return apiFetch<any>('/api/stats');
}

// ── Report endpoints ─────────────────────────────────────────────────────────

export async function fetchDailyReportAPI() {
  return apiFetch<any>('/api/reports/daily');
}

export async function fetchWeeklyReportAPI() {
  return apiFetch<any>('/api/reports/weekly');
}

// ── Room stats (for analytics/reports compatibility) ─────────────────────────

export async function fetchRoomStatsAPI() {
  const rooms = await fetchRoomsAPI();
  return rooms.map((r: any) => ({
    room: { id: r.id, name: r.name, description: r.description },
    total: r.totalDevices,
    running: r.devicesOn,
    power: r.currentPower,
    efficiency: r.efficiency,
    health: r.health,
    temperature: r.temperature,
    lastActivity: r.lastActivity,
  }));
}

// ── Weekly usage (for analytics/reports compatibility) ────────────────────────

export async function fetchWeeklyUsageAPI() {
  return fetchUsageHistoryAPI('weekly');
}

// ── Power series (for dashboard charts) ──────────────────────────────────────

export async function fetchPowerSeriesAPI(points: number = 24) {
  return fetchUsageHistoryAPI('hourly');
}

// ── Health check ─────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const data = await apiFetch<{ status: string }>('/api/health');
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// ── Re-export API_BASE for socket connection ─────────────────────────────────

export { API_BASE };
