import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertOctagon, Info, X } from "lucide-react";
import type { Alert } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const icon = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

const accent = {
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
  warning: "border-warning/40 bg-warning/10 text-warning",
  info: "border-primary/40 bg-primary/10 text-primary",
};

export function AlertList({
  alerts,
  onDismiss,
  compact,
}: {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {alerts.map((a) => {
          const Icon = icon[a.severity];
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "group flex items-start gap-3 rounded-xl border p-3 backdrop-blur",
                accent[a.severity],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {a.title}
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                  </span>
                </div>
                {!compact && (
                  <div className="mt-0.5 text-xs text-muted-foreground">{a.message}</div>
                )}
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(a.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
