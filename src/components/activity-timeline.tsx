import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Power, PowerOff, Bell, Cpu } from "lucide-react";
import type { ActivityEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const meta = {
  on: { icon: Power, color: "text-success bg-success/10 border-success/30" },
  off: { icon: PowerOff, color: "text-muted-foreground bg-muted/40 border-border" },
  alert: { icon: Bell, color: "text-warning bg-warning/10 border-warning/30" },
  system: { icon: Cpu, color: "text-primary bg-primary/10 border-primary/30" },
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/40 to-transparent" />
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {events.slice(0, 12).map((ev) => {
            const m = meta[ev.kind];
            const Icon = m.icon;
            return (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative flex items-start gap-3"
              >
                <div
                  className={cn(
                    "relative z-10 grid h-10 w-10 place-items-center rounded-full border",
                    m.color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="text-sm text-foreground">{ev.message}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
