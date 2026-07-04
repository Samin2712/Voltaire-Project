import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "./dashboard";
import { useDevices } from "@/lib/use-live-data";
import { toggleDevice, ROOMS } from "@/lib/mock-api";
import { toggleDeviceAPI } from "@/lib/api";
import type { Device, RoomId } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { DeviceDrawer } from "@/components/device-drawer";
import { motion } from "framer-motion";
import { Fan, Lightbulb, LayoutGrid, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/devices")({
  head: () => ({ meta: [{ title: "Devices — Voltaire" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const devices = useDevices();
  const [q, setQ] = useState("");
  const [room, setRoom] = useState<"all" | RoomId>("all");
  const [status, setStatus] = useState<"all" | "on" | "off">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      if (room !== "all" && d.room !== room) return false;
      if (status !== "all" && d.status !== status) return false;
      if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [devices, q, room, status]);

  return (
    <AppShell>
      <Header title="Devices" sub={`${devices.length} devices across 3 rooms`} />

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search devices…"
              className="h-10 w-full rounded-xl border border-border/60 bg-background/40 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <Select value={room} onChange={(v) => setRoom(v as any)} options={[
            { v: "all", l: "All rooms" },
            ...ROOMS.map((r) => ({ v: r.id, l: r.name })),
          ]} />
          <Select value={status} onChange={(v) => setStatus(v as any)} options={[
            { v: "all", l: "All status" },
            { v: "on", l: "On" },
            { v: "off", l: "Off" },
          ]} />
          <div className="ml-auto flex overflow-hidden rounded-xl border border-border/60">
            <ViewBtn active={view === "grid"} onClick={() => setView("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </ViewBtn>
            <ViewBtn active={view === "list"} onClick={() => setView("list")}>
              <List className="h-4 w-4" />
            </ViewBtn>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-6">
        {ROOMS.map((r) => {
          const list = filtered.filter((d) => d.room === r.id);
          if (list.length === 0) return null;
          return (
            <div key={r.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.description}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {list.filter((d) => d.status === "on").length} on / {list.length} total
                </div>
              </div>
              {view === "grid" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((d, i) => (
                    <DeviceTile key={d.id} device={d} delay={i * 0.03} onOpen={() => setSelectedId(d.id)} />
                  ))}
                </div>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                        <tr>
                          <th className="py-2">Device</th>
                          <th>Status</th>
                          <th>Power</th>
                          <th>Runtime</th>
                          <th>Last changed</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((d) => (
                          <tr key={d.id} className="border-t border-border/40">
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                {d.type === "fan" ? <Fan className="h-4 w-4 text-primary" /> : <Lightbulb className="h-4 w-4 text-warning" />}
                                {d.name}
                              </div>
                            </td>
                            <td><StatusBadge status={d.status} pulse={d.status === "on"} /></td>
                            <td>{d.status === "on" ? `${d.power} W` : "—"}</td>
                            <td>{Math.floor(d.runtimeMinutes / 60)}h {d.runtimeMinutes % 60}m</td>
                            <td className="text-muted-foreground">{formatDistanceToNow(new Date(d.lastChanged), { addSuffix: true })}</td>
                            <td className="text-right">
                              <button
                                onClick={() => toggleDeviceAPI(d.id).catch(() => toggleDevice(d.id))}
                                className="rounded-lg border border-border/60 px-2.5 py-1 text-xs hover:bg-accent"
                              >
                                Toggle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      <DeviceDrawer deviceId={selectedId} devices={devices} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}

function DeviceTile({ device, onOpen, delay }: { device: Device; onOpen: () => void; delay: number }) {
  const on = device.status === "on";
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 text-left backdrop-blur-xl transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl",
            on
              ? device.type === "fan"
                ? "bg-primary/15 text-primary"
                : "bg-warning/15 text-warning shadow-[0_0_18px_var(--color-warning)]"
              : "bg-muted/40 text-muted-foreground",
          )}
        >
          {device.type === "fan" ? (
            <Fan className={cn("h-5 w-5", on && "animate-spin-slow")} />
          ) : (
            <Lightbulb className={cn("h-5 w-5", on && "animate-pulse-glow")} fill={on ? "currentColor" : "none"} />
          )}
        </div>
        <StatusBadge status={device.status} pulse={on} />
      </div>
      <div className="mt-3 text-sm font-semibold">{device.name}</div>
      <div className="text-xs text-muted-foreground">{ROOMS.find(r => r.id === device.room)?.name}</div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Power</div>
          <div className="font-semibold text-foreground">{on ? device.power : 0} W</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Runtime</div>
          <div className="font-semibold text-foreground">{Math.floor(device.runtimeMinutes / 60)}h {device.runtimeMinutes % 60}m</div>
        </div>
      </div>
    </motion.button>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary">{title}</div>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-border/60 bg-background/40 px-3 text-sm outline-none focus:border-primary/50"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}

function ViewBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm",
        active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
