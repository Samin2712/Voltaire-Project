import { motion } from "framer-motion";
import { Fan, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device, RoomId } from "@/lib/types";
import { ROOMS } from "@/lib/mock-api";

interface Props {
  devices: Device[];
  onDeviceClick?: (d: Device) => void;
}

const roomLayouts: Record<RoomId, { col: string; label: string }> = {
  drawing: { col: "col-span-12 lg:col-span-4", label: "Drawing Room" },
  work1: { col: "col-span-12 lg:col-span-4", label: "Work Room 1" },
  work2: { col: "col-span-12 lg:col-span-4", label: "Work Room 2" },
};

function DeviceIcon({ device, onClick }: { device: Device; onClick?: () => void }) {
  const on = device.status === "on";
  if (device.type === "fan") {
    return (
      <button
        onClick={onClick}
        title={`${device.name} · ${device.status.toUpperCase()} · ${on ? device.power : 0}W`}
        className={cn(
          "group relative grid h-14 w-14 place-items-center rounded-2xl border transition-all",
          on
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-muted/40 text-muted-foreground hover:border-border/80",
        )}
      >
        <Fan
          className={cn(
            "h-7 w-7 transition-transform",
            on && "animate-spin-slow",
          )}
        />
        {on && (
          <span className="absolute inset-0 rounded-2xl ring-2 ring-primary/40 ring-offset-2 ring-offset-background/40 animate-pulse-glow" />
        )}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      title={`${device.name} · ${device.status.toUpperCase()} · ${on ? device.power : 0}W`}
      className={cn(
        "group relative grid h-12 w-12 place-items-center rounded-full border transition-all",
        on
          ? "border-warning/50 bg-warning/15 text-warning shadow-[0_0_24px_var(--color-warning)]"
          : "border-border bg-muted/40 text-muted-foreground hover:border-border/80",
      )}
    >
      <Lightbulb
        className={cn("h-5 w-5", on && "animate-pulse-glow")}
        fill={on ? "currentColor" : "none"}
      />
    </button>
  );
}

function Furniture() {
  return (
    <>
      {/* Desk */}
      <div className="absolute left-1/2 top-1/2 h-14 w-32 -translate-x-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-muted/30" />
      {/* Chairs */}
      <div className="absolute left-1/2 top-1/2 -translate-x-[62px] -translate-y-1/2 h-4 w-4 rounded-sm border border-border/60 bg-muted/40" />
      <div className="absolute left-1/2 top-1/2 translate-x-[46px] -translate-y-1/2 h-4 w-4 rounded-sm border border-border/60 bg-muted/40" />
      {/* Plant */}
      <div className="absolute bottom-3 right-3 h-3 w-3 rounded-full bg-success/70" />
      {/* Door */}
      <div className="absolute top-0 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-b-md bg-primary/40" />
      {/* Window */}
      <div className="absolute bottom-0 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-t-md bg-sky-400/40" />
    </>
  );
}

export function OfficeFloorPlan({ devices, onDeviceClick }: Props) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {ROOMS.map((room, ri) => {
        const roomDevices = devices.filter((d) => d.room === room.id);
        const fans = roomDevices.filter((d) => d.type === "fan");
        const lights = roomDevices.filter((d) => d.type === "light");
        const activeCount = roomDevices.filter((d) => d.status === "on").length;
        return (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * ri, duration: 0.5 }}
            className={cn(roomLayouts[room.id].col)}
          >
            <div className="relative h-[320px] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/60 to-card/30 p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {room.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {room.description}
                  </div>
                </div>
                <div className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {activeCount}/{roomDevices.length} active
                </div>
              </div>

              <div className="relative h-[240px] rounded-xl border border-border/40 bg-background/30">
                <Furniture />
                {/* Ceiling lights row */}
                <div className="absolute left-0 right-0 top-3 flex justify-around px-4">
                  {lights.map((l) => (
                    <DeviceIcon
                      key={l.id}
                      device={l}
                      onClick={() => onDeviceClick?.(l)}
                    />
                  ))}
                </div>
                {/* Fans on the sides at bottom */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
                  {fans.map((f) => (
                    <DeviceIcon
                      key={f.id}
                      device={f}
                      onClick={() => onDeviceClick?.(f)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
