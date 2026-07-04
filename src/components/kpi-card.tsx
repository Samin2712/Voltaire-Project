import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  trend?: string;
  trendPositive?: boolean;
  accent?: "primary" | "success" | "warning" | "danger";
  delay?: number;
}

const accents = {
  primary: "from-primary/25 to-primary/5 text-primary",
  success: "from-success/25 to-success/5 text-success",
  warning: "from-warning/25 to-warning/5 text-warning",
  danger: "from-destructive/25 to-destructive/5 text-destructive",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  suffix,
  prefix,
  decimals,
  trend,
  trendPositive = true,
  accent = "primary",
  delay = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 shadow-card backdrop-blur-xl"
    >
      <div
        className={cn(
          "absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-90",
          accents[accent],
        )}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br",
            accents[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-4 flex items-baseline gap-1">
        <AnimatedCounter
          value={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          className="text-3xl font-bold tracking-tight text-foreground"
        />
      </div>
      {trend && (
        <div className="relative mt-2 text-xs">
          <span className={trendPositive ? "text-success" : "text-destructive"}>
            {trend}
          </span>{" "}
          <span className="text-muted-foreground">vs yesterday</span>
        </div>
      )}
    </motion.div>
  );
}
