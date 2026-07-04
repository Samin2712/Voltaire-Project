import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { OfficeFloorPlan } from "@/components/office-floor-plan";
import { DeviceDrawer } from "@/components/device-drawer";
import { AlertList } from "@/components/alert-list";
import { ActivityTimeline } from "@/components/activity-timeline";
import {
  Cpu,
  Power,
  PowerOff,
  Zap,
  BatteryCharging,
  Receipt,
  BellRing,
  Gauge,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDevices, useAlerts, useActivity, useUsage } from "@/lib/use-live-data";
import { currentPower, estimatedBillBDT, todayKWh } from "@/lib/mock-api";
import { fetchPowerSeriesAPI, dismissAlertAPI } from "@/lib/api";
import { fetchPowerSeries } from "@/lib/mock-api";
import type { PowerSample } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Overview — Voltaire" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const devices = useDevices();
  const alerts = useAlerts();
  const activity = useActivity();
  const usage = useUsage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [series, setSeries] = useState<PowerSample[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadSeries = () => {
      fetchPowerSeriesAPI().then(setSeries).catch(() => fetchPowerSeries().then(setSeries));
    };
    loadSeries();
    const t = setInterval(loadSeries, 10000);
    return () => clearInterval(t);
  }, []);

  const on = devices.filter((d) => d.status === "on").length;
  const off = devices.length - on;
  const power = usage?.currentPower ?? currentPower(devices);
  const kwh = usage?.todayEnergy ?? todayKWh();
  const bill = usage?.estimatedBill ?? estimatedBillBDT(kwh);
  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  const avgRoomUsage = useMemo(() => {
    if (!devices.length) return 0;
    return Math.round(power / 3);
  }, [devices, power]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Overview
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">
            Good morning, Ayaan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening across your office right now.
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
          <span className="text-success">●</span> Streaming live · updated every 4s
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Total Devices" value={devices.length} icon={Cpu} accent="primary" delay={0.0} />
        <KpiCard label="Devices On" value={on} icon={Power} accent="success" delay={0.05} trend="+2" trendPositive />
        <KpiCard label="Devices Off" value={off} icon={PowerOff} accent="warning" delay={0.1} />
        <KpiCard label="Current Power" value={power} suffix=" W" icon={Zap} accent="primary" delay={0.15} />
        <KpiCard label="Today's Energy" value={kwh} decimals={2} suffix=" kWh" icon={BatteryCharging} accent="success" delay={0.2} />
        <KpiCard label="Estimated Bill" value={bill} prefix="৳ " decimals={2} icon={Receipt} accent="warning" delay={0.25} />
        <KpiCard label="Active Alerts" value={visibleAlerts.length} icon={BellRing} accent="danger" delay={0.3} />
        <KpiCard label="Avg Room Usage" value={avgRoomUsage} suffix=" W" icon={Gauge} accent="primary" delay={0.35} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Live Office Floor Plan" subtitle="Tap any device for details">
            <OfficeFloorPlan devices={devices} onDeviceClick={(d) => setSelectedId(d.id)} />
          </Card>
          <div className="mt-4">
            <Card title="Live Power Consumption" subtitle="24-hour rolling window · per room">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="work1" name="Work Room 1" stroke="var(--chart-1)" strokeWidth={2} fill="url(#g1)" />
                    <Area type="monotone" dataKey="work2" name="Work Room 2" stroke="var(--chart-2)" strokeWidth={2} fill="url(#g2)" />
                    <Area type="monotone" dataKey="drawing" name="Drawing Room" stroke="var(--chart-3)" strokeWidth={2} fill="url(#g3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card title="Active Alerts" subtitle={`${visibleAlerts.length} needing attention`}>
            {visibleAlerts.length === 0 ? (
              <EmptyState label="All clear. Nothing to worry about." />
            ) : (
              <AlertList
                alerts={visibleAlerts}
                onDismiss={(id) => {
                  dismissAlertAPI(id).catch(() => {});
                  setDismissed((s) => new Set(s).add(id));
                }}
              />
            )}
          </Card>
          <Card title="Activity Timeline" subtitle="Every device change, live">
            <ActivityTimeline events={activity} />
          </Card>
        </div>
      </div>

      <DeviceDrawer deviceId={selectedId} devices={devices} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}

export function Card({
  title,
  subtitle,
  children,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-card backdrop-blur-xl"
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <div className="text-sm font-semibold text-foreground">{title}</div>}
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border/60 bg-background/30 py-8 text-xs text-muted-foreground">
      {label}
    </div>
  );
}
