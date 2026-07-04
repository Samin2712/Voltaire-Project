import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — Voltaire" }],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl animate-float-slow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-border/60 bg-card/60 p-8 shadow-elegant backdrop-blur-2xl"
      >
        <Link to="/" className="mb-6 inline-flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-glow-primary">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <span className="text-sm font-bold tracking-tight">Voltaire</span>
        </Link>

        <h1 className="text-2xl font-bold text-gradient">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your office energy dashboard.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setTimeout(() => nav({ to: "/dashboard" }), 700);
          }}
          className="mt-6 space-y-4"
        >
          <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" placeholder="you@company.com" defaultValue="admin@voltaire.io" />
          <Field icon={<Lock className="h-4 w-4" />} label="Password" type="password" placeholder="••••••••" defaultValue="demo-password" />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-border bg-transparent accent-primary" />
              Remember me
            </label>
            <a href="#" className="text-primary hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow-primary transition-transform hover:scale-[1.01] disabled:opacity-70"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5 text-sm font-semibold hover:bg-background/60">
          <Github className="h-4 w-4" /> Continue with GitHub
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          No account? <Link to="/dashboard" className="text-primary hover:underline">Skip to demo</Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  label,
  type,
  placeholder,
  defaultValue,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="h-11 w-full rounded-xl border border-border/60 bg-background/40 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
