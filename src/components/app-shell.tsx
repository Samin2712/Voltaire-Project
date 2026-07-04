import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  BarChart3,
  Bell,
  FileText,
  Settings,
  HelpCircle,
  Search,
  Zap,
  Sun,
  Moon,
  BellRing,
  Wifi,
  User,
  LogOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { applyTheme, getStoredTheme, notifyThemeChanged, saveTheme, THEME_CHANGED_EVENT } from "@/lib/theme";
import { useAlerts } from "@/lib/use-live-data";
import { formatDistanceToNow } from "date-fns";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Cpu },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: HelpCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [time, setTime] = useState(() => new Date());
  const [dark, setDark] = useState(() => getStoredTheme() === "dark");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const alerts = useAlerts();
  const activeAlerts = useMemo(() => alerts.filter((a) => !a.dismissed), [alerts]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const next = dark ? "dark" : "light";
    saveTheme(next);
  }, [dark]);

  function toggleTheme() {
    const nextTheme = dark ? "light" : "dark";
    saveTheme(nextTheme);
    setDark(nextTheme === "dark");
    notifyThemeChanged();
  }

  useEffect(() => {
    const syncTheme = () => {
      const theme = getStoredTheme();
      applyTheme(theme);
      setDark(theme === "dark");
    };
    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(THEME_CHANGED_EVENT, syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(THEME_CHANGED_EVENT, syncTheme);
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-2xl lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-5">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-glow-primary">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Voltaire</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Energy OS
            </div>
          </div>
        </Link>

        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent ring-1 ring-primary/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative h-4 w-4",
                    active && "text-primary",
                  )}
                />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 to-purple-500/10 p-4">
          <div className="text-xs font-semibold text-foreground">System Status</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            15 devices synced · mock data live
          </div>
          <div className="mt-3">
            <StatusBadge status="online" label="All systems online" pulse />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-2xl lg:px-8">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search devices, rooms, alerts…"
              className="h-9 w-full rounded-xl border border-border/60 bg-card/60 pl-9 pr-16 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs text-success md:flex">
              <Wifi className="h-3 w-3" />
              Live
            </div>
            <div className="hidden text-xs text-muted-foreground md:block">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div ref={notificationRef} className="relative">
              <button
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((v) => !v)}
                className="relative grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
              >
                <BellRing className="h-4 w-4" />
                {activeAlerts.length > 0 && (
                  <span className="pointer-events-none absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-background">
                    {Math.min(activeAlerts.length, 9)}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-card">
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold">Notifications</div>
                      <div className="text-xs text-muted-foreground">
                        {activeAlerts.length} active alert{activeAlerts.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <Link
                      to="/alerts"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {activeAlerts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border/60 bg-background/40 px-4 py-6 text-center text-xs text-muted-foreground">
                        No active alerts right now.
                      </div>
                    ) : (
                      activeAlerts.slice(0, 5).map((alert) => (
                        <Link
                          key={alert.id}
                          to="/alerts"
                          onClick={() => setNotificationsOpen(false)}
                          className="block rounded-lg px-3 py-2 hover:bg-accent"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-foreground">
                                {alert.title}
                              </div>
                              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {alert.message}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[10px] capitalize text-muted-foreground">
                              {alert.severity}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-2 py-1">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-purple-500 text-white">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="hidden text-xs md:block">
                <div className="font-semibold">Samin Abdullah</div>
                <div className="text-muted-foreground">Admin</div>
              </div>
            </div>
            <Link
              to="/"
              aria-label="Exit dashboard"
              className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
