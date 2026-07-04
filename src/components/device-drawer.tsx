import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Fan, Lightbulb, Zap, Clock, MapPin, Power, Loader2 } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { toggleDevice, ROOMS } from "@/lib/mock-api";
import { toggleDeviceAPI } from "@/lib/api";
import type { Device } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo, useCallback } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  /** The ID of the selected device (or null if drawer is closed). */
  deviceId: string | null;
  /** The full live device list from useDevices(). */
  devices: Device[];
  /** Called to close the drawer. */
  onClose: () => void;
}

function generateHistory(device: Device) {
  return Array.from({ length: 24 }, (_, i) => ({
    t: `${String(i).padStart(2, "0")}:00`,
    w:
      device.status === "on"
        ? Math.max(0, device.power + Math.sin(i) * 8)
        : Math.random() > 0.4
          ? device.power
          : 0,
  }));
}

export function DeviceDrawer({ deviceId, devices, onClose }: Props) {
  const [toggling, setToggling] = useState(false);

  // Always derive the device from the live list so it stays in sync
  const device = useMemo(
    () => (deviceId ? devices.find((d) => d.id === deviceId) ?? null : null),
    [deviceId, devices]
  );

  const open = !!device;

  // Memoize chart data — regenerate only when device id or status changes
  const chartData = useMemo(
    () => (device ? generateHistory(device) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [device?.id, device?.status]
  );

  const handleToggle = useCallback(async () => {
    if (!device || toggling) return;
    setToggling(true);
    try {
      await toggleDeviceAPI(device.id);
    } catch {
      // Fallback to mock toggle
      await toggleDevice(device.id);
    } finally {
      setToggling(false);
    }
  }, [device, toggling]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/60 bg-card/95 backdrop-blur-2xl">
        {device && (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">{device.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-2 flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
                {device.type === "fan" ? (
                  <Fan className="h-7 w-7" />
                ) : (
                  <Lightbulb className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {device.type}
                </div>
                <div className="text-xl font-bold text-foreground">{device.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge
                    status={device.status}
                    pulse={device.status === "on"}
                  />
                  <span className="text-xs text-muted-foreground">
                    {ROOMS.find((r) => r.id === device.room)?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric
                icon={<Zap className="h-4 w-4" />}
                label="Current Draw"
                value={`${device.status === "on" ? device.power : 0} W`}
              />
              <Metric
                icon={<Clock className="h-4 w-4" />}
                label="Runtime Today"
                value={`${Math.floor(device.runtimeMinutes / 60)}h ${device.runtimeMinutes % 60}m`}
              />
              <Metric
                icon={<MapPin className="h-4 w-4" />}
                label="Room"
                value={ROOMS.find((r) => r.id === device.room)?.name ?? "—"}
              />
              <Metric
                icon={<Clock className="h-4 w-4" />}
                label="Last Change"
                value={formatDistanceToNow(new Date(device.lastChanged), {
                  addSuffix: true,
                })}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">24h Energy Trace</div>
                <div className="text-xs text-muted-foreground">Watts</div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="dev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="w"
                      stroke="var(--primary)"
                      fill="url(#dev)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              disabled={toggling}
              onClick={handleToggle}
            >
              {toggling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}
              {toggling
                ? "Toggling…"
                : `Toggle ${device.status === "on" ? "Off" : "On"}`}
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
