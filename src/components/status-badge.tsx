import { cn } from "@/lib/utils";

interface Props {
  status: "on" | "off" | "critical" | "warning" | "info" | "online";
  label?: string;
  className?: string;
  pulse?: boolean;
}

const styles: Record<Props["status"], string> = {
  on: "bg-success/15 text-success border-success/30",
  online: "bg-success/15 text-success border-success/30",
  off: "bg-muted/60 text-muted-foreground border-border",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  info: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({ status, label, className, pulse }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          pulse && "animate-pulse",
        )}
      />
      {label ?? status.toUpperCase()}
    </span>
  );
}
