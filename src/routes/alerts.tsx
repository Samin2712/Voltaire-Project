import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "./dashboard";
import { useAlerts } from "@/lib/use-live-data";
import { AlertList } from "@/components/alert-list";
import { dismissAlertAPI } from "@/lib/api";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts — Voltaire" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const alerts = useAlerts();
  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState<"all" | "critical" | "warning" | "info">("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => alerts.filter(a => {
    if (dismissed.has(a.id)) return false;
    if (severity !== "all" && a.severity !== severity) return false;
    if (q && !(a.title + a.message).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [alerts, q, severity, dismissed]);

  const counts = {
    critical: alerts.filter(a => a.severity === "critical").length,
    warning: alerts.filter(a => a.severity === "warning").length,
    info: alerts.filter(a => a.severity === "info").length,
  };

  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Alerts</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">Active Alerts Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">Anomalies, after-hours activity and health signals.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Critical" value={counts.critical} accent="text-destructive" />
        <Stat label="Warning" value={counts.warning} accent="text-warning" />
        <Stat label="Info" value={counts.info} accent="text-primary" />
      </div>

      <div className="mt-4">
        <Card>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search alerts…" className="h-10 w-full rounded-xl border border-border/60 bg-background/40 pl-9 pr-3 text-sm outline-none focus:border-primary/50" />
            </div>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} className="h-10 rounded-xl border border-border/60 bg-background/40 px-3 text-sm outline-none focus:border-primary/50">
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          {filtered.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-border/60 bg-background/30 py-12 text-sm text-muted-foreground">
              You're all caught up. No active alerts.
            </div>
          ) : (
            <AlertList alerts={filtered} onDismiss={(id) => { dismissAlertAPI(id).catch(() => {}); setDismissed(s => new Set(s).add(id)); }} />
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}
