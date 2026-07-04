import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Zap,
  Activity,
  Bell,
  Cpu,
  Fan,
  Lightbulb,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ArrowUpRight,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useEffect } from "react";
import { applyTheme, getStoredTheme, THEME_CHANGED_EVENT } from "@/lib/theme";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  useSyncedTheme();

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <Architecture />
      <TechStack />
      <CTA />
      <Footer />
    </div>
  );
}

function useSyncedTheme() {
  useEffect(() => {
    const syncTheme = () => applyTheme(getStoredTheme());
    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(THEME_CHANGED_EVENT, syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(THEME_CHANGED_EVENT, syncTheme);
    };
  }, []);
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/50 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-purple-500 shadow-glow-primary">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <span className="text-sm font-bold tracking-tight">Voltaire</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#architecture" className="hover:text-foreground">Architecture</a>
          <a href="#stack" className="hover:text-foreground">Technology</a>
          <Link to="/dashboard" className="hover:text-foreground">Live Demo</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-semibold text-background transition-transform hover:scale-[1.02]"
          >
            Enter Dashboard <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Now with Discord co-pilot for on-the-go monitoring
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-gradient sm:text-6xl md:text-7xl">
            Smart Office Energy Monitoring
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every light, every fan, every watt — in real time. Voltaire turns your office
            into an intelligent grid you can watch, tune, and trust from a single
            beautifully-crafted dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow-primary transition-transform hover:scale-[1.03]"
            >
              Enter Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur hover:bg-card/70"
            >
              Live Demo
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-1 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Features <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-1 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Architecture <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2 }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="relative rounded-3xl border border-border/60 bg-gradient-to-b from-card/70 to-card/20 p-6 shadow-elegant backdrop-blur-2xl">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-primary/40 via-transparent to-purple-500/40 opacity-40 blur-xl" />
        <div className="relative grid grid-cols-3 gap-4">
          {["Drawing Room", "Work Room 1", "Work Room 2"].map((label, i) => (
            <div
              key={label}
              className="relative h-56 overflow-hidden rounded-2xl border border-border/60 bg-background/40 p-4"
            >
              <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                {label}
              </div>
              {/* lights */}
              <div className="flex justify-around px-2">
                {[0, 1, 2].map((k) => {
                  const on = (i + k) % 2 === 0;
                  return (
                    <div
                      key={k}
                      className={
                        on
                          ? "grid h-10 w-10 place-items-center rounded-full border border-warning/50 bg-warning/15 text-warning shadow-[0_0_24px_var(--color-warning)] animate-pulse-glow"
                          : "grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/40 text-muted-foreground"
                      }
                    >
                      <Lightbulb
                        className="h-4 w-4"
                        fill={on ? "currentColor" : "none"}
                      />
                    </div>
                  );
                })}
              </div>
              {/* desk */}
              <div className="mx-auto mt-4 h-8 w-24 rounded border border-border/60 bg-muted/40" />
              {/* fans */}
              <div className="mt-4 flex justify-between px-2">
                {[0, 1].map((k) => {
                  const on = (i * 2 + k) % 3 !== 0;
                  return (
                    <div
                      key={k}
                      className={
                        on
                          ? "grid h-12 w-12 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary"
                          : "grid h-12 w-12 place-items-center rounded-2xl border border-border bg-muted/40 text-muted-foreground"
                      }
                    >
                      <Fan
                        className={"h-6 w-6 " + (on ? "animate-spin-slow" : "")}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Total Draw", value: "742 W", accent: "text-primary" },
            { label: "Today", value: "4.2 kWh", accent: "text-success" },
            { label: "Devices ON", value: "11 / 18", accent: "text-warning" },
            { label: "Alerts", value: "3 active", accent: "text-destructive" },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-border/60 bg-background/40 p-4"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {k.label}
              </div>
              <div className={"mt-1 text-2xl font-bold " + k.accent}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Stats() {
  const items = [
    { v: "15", l: "Devices monitored" },
    { v: "<50 ms", l: "State propagation" },
    { v: "99.99%", l: "Uptime target" },
    { v: "24/7", l: "Anomaly detection" },
  ];
  return (
    <section className="border-y border-border/40 bg-card/20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
        {items.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-gradient-primary md:text-4xl">
              {s.v}
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {s.l}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Activity,
      title: "Live Floor Plan",
      body: "See your office breathe. Lights glow, fans spin, rooms come alive as devices flip state in real time.",
    },
    {
      icon: BarChart3,
      title: "Power Analytics",
      body: "Hourly, daily and weekly consumption with room-by-room breakdown and peak detection.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      body: "After-hours activity, long-running rooms, unusual spikes — flagged with context and severity.",
    },
    {
      icon: MessageSquare,
      title: "Discord Co-pilot",
      body: "Ask !status, !room, or !usage in Discord. The bot shares Voltaire's brain, not a mirror.",
    },
    {
      icon: Shield,
      title: "One source of truth",
      body: "Dashboard and bot both read from the same backend contract. Never out of sync.",
    },
    {
      icon: Cpu,
      title: "ESP32-ready",
      body: "Designed around a real hardware pipeline. Simulated today, wired tomorrow.",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader
        eyebrow="Features"
        title="Built for teams that care about every watt"
        sub="A commercial-grade IoT surface — designed with the same discipline as Stripe, Linear and Vercel."
      />
      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl transition-colors hover:border-primary/40"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <div className="relative mt-4 text-lg font-semibold text-foreground">
              {f.title}
            </div>
            <div className="relative mt-1 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section id="architecture" className="border-y border-border/40 bg-card/20">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="Architecture"
          title="One backend. Two surfaces. Zero drift."
          sub="Devices simulate state upstream. Everything downstream — dashboard, bot, exports — reads the same truth."
        />
        <div className="mt-14 rounded-3xl border border-border/60 bg-background/40 p-8 backdrop-blur">
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-4">
            {[
              { t: "Simulated Devices", s: "15 devices · fans + lights", c: "from-primary/30 to-primary/5", i: Cpu },
              { t: "Backend API", s: "Single source of truth", c: "from-purple-500/30 to-purple-500/5", i: Activity },
              { t: "Web Dashboard", s: "Real-time, animated, gorgeous", c: "from-success/30 to-success/5", i: BarChart3 },
              { t: "Discord Bot", s: "!status · !room · !usage", c: "from-warning/30 to-warning/5", i: MessageSquare },
            ].map((n) => (
              <div
                key={n.t}
                className="relative rounded-2xl border border-border/60 bg-card/60 p-5"
              >
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${n.c} text-foreground`}>
                  <n.i className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold">{n.t}</div>
                <div className="text-xs text-muted-foreground">{n.s}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-center text-xs text-muted-foreground">
            [ Devices ] ─► [ Backend API ] ─► [ Web Dashboard ] &nbsp; ║ &nbsp; [ Discord Bot ]
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  const stack = [
    "React 19",
    "TypeScript",
    "TanStack Start",
    "Tailwind v4",
    "shadcn/ui",
    "Framer Motion",
    "Recharts",
    "Lucide",
    "ESP32",
    "MQTT",
    "Discord.js",
    "Node.js",
  ];
  return (
    <section id="stack" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader
        eyebrow="Technology"
        title="Every layer chosen with intent"
      />
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {stack.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur"
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
          Ready to see your office in a new light?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Jump into the live dashboard — no signup, no setup. Judged in the first 30 seconds.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow-primary hover:scale-[1.03] transition-transform"
          >
            Enter Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-card/70"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-purple-500 shadow-glow-primary">
              <Zap className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-bold">Voltaire</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The smart office energy platform. Built for Techathon Nationals &amp; Rover Summit.
          </p>
          <div className="mt-4 flex gap-2">
            {[Github, Twitter, Linkedin].map((I, i) => (
              <a
                key={i}
                href="#"
                className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
              >
                <I className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
        <FooterCol
          title="Product"
          links={[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/analytics", label: "Analytics" },
            { to: "/alerts", label: "Alerts" },
            { to: "/reports", label: "Reports" },
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            { to: "/help", label: "Help" },
            { to: "/settings", label: "Settings" },
            { to: "/login", label: "Login" },
          ]}
        />
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © 2026 Voltaire. Crafted with intent.
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-foreground">
        {title}
      </div>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <div key={l.to}>
            <Link to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}
