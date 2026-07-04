import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "./dashboard";
import { useEffect, useMemo, useState } from "react";
import { fetchPowerSeries, fetchWeeklyUsage, ROOMS } from "@/lib/mock-api";
import { fetchPowerSeriesAPI, fetchWeeklyUsageAPI } from "@/lib/api";
import { useDevices } from "@/lib/use-live-data";
import type { Device, PowerSample, Room } from "@/lib/types";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Voltaire" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [series, setSeries] = useState<PowerSample[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const devices = useDevices();

  useEffect(() => {
    fetchPowerSeriesAPI().then(setSeries).catch(() => fetchPowerSeries().then(setSeries));
    fetchWeeklyUsageAPI().then(setWeekly).catch(() => fetchWeeklyUsage().then(setWeekly));
  }, []);

  const rooms = useMemo(() => buildLiveRoomStats(devices), [devices]);
  const roomsLoaded = devices.length > 0;

  const pie = ROOMS.map((r, i) => ({
    name: r.name,
    value: rooms.find((s) => s.room.id === r.id)?.power ?? 0,
    fill: `var(--chart-${i + 1})`,
  }));
  const totalRoomPower = pie.reduce((sum, item) => sum + item.value, 0);

  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Analytics</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">Live Power Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hourly, daily, weekly — sliced by room.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Today's Hourly Usage" subtitle="Total watts drawn per hour">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="ta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={tt} />
                  <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="url(#ta)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="Room Share" subtitle="Which room is using the most power right now">
          <div className="h-72">
            {!roomsLoaded ? (
              <RoomShareState title="Loading room data" body="Waiting for the latest room power snapshot." />
            ) : totalRoomPower <= 0 ? (
              <RoomShareState title="No active power draw" body="All fans and lights are currently OFF or drawing 0 W, so there is no room share to compare." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={4}>
                    {pie.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tt} formatter={(value) => [`${value} W`, "Power"]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Weekly Consumption" subtitle="kWh per day">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="kWh" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Room Comparison" subtitle="Trend by room across the day">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tt} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="drawing" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="work1" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="work2" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {rooms.map((s) => (
          <Card key={s.room.id} title={s.room.name} subtitle={s.room.description}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Stat label="Power" value={`${s.power} W`} />
              <Stat label="Running" value={`${s.running}/${s.total}`} />
              <Stat label="Health" value={`${s.health}%`} />
              <Stat label="Efficiency" value={`${s.efficiency}%`} />
              <Stat label="State" value={s.state} />
              <Stat label="Room ID" value={s.room.id} />
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

type LiveRoomStats = {
  room: Room;
  total: number;
  running: number;
  power: number;
  health: number;
  efficiency: number;
  state: string;
};

function buildLiveRoomStats(devices: Device[]): LiveRoomStats[] {
  return ROOMS.map((room) => {
    const roomDevices = devices.filter((device) => device.room === room.id);
    const runningDevices = roomDevices.filter((device) => device.status === "on");
    const onlineDevices = roomDevices.filter((device) => device.isOnline !== false);
    const total = roomDevices.length;
    const running = runningDevices.length;
    const loadRatio = total > 0 ? running / total : 0;

    return {
      room,
      total,
      running,
      power: runningDevices.reduce((sum, device) => sum + devicePower(device), 0),
      health: total > 0 ? Math.round((onlineDevices.length / total) * 100) : 100,
      efficiency: Math.round(Math.max(30, 100 - loadRatio * 55)),
      state: running > 0 ? "Active" : "Idle",
    };
  });
}

function devicePower(device: Device) {
  return device.powerDraw ?? device.power ?? device.ratedPower ?? 0;
}

function RoomShareState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed border-border/60 bg-background/30 px-6 text-center">
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

const tt = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}
