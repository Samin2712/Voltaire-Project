import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "./dashboard";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { getStoredTheme, notifyThemeChanged, saveTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Voltaire" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [prefs, setPrefs] = useState({
    dark:
      typeof window === "undefined"
        ? false
        : getStoredTheme() === "dark",
    animations: true,
    notifications: true,
    sound: false,
  });

  useEffect(() => {
    const theme = prefs.dark ? "dark" : "light";
    saveTheme(theme);
    notifyThemeChanged();
  }, [prefs.dark]);

  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Settings</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fine-tune how Voltaire behaves.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Appearance">
          <Row label="Dark mode" desc="Optimised for long viewing sessions." value={prefs.dark} onChange={(v) => setPrefs({ ...prefs, dark: v })} />
          <Row label="Animations" desc="Framer Motion transitions across the app." value={prefs.animations} onChange={(v) => setPrefs({ ...prefs, animations: v })} />
        </Card>
        <Card title="Notifications">
          <Row label="Push notifications" desc="Alert center pushes in real time." value={prefs.notifications} onChange={(v) => setPrefs({ ...prefs, notifications: v })} />
          <Row label="Sound" desc="Play a chime for critical alerts." value={prefs.sound} onChange={(v) => setPrefs({ ...prefs, sound: v })} />
        </Card>
        <Card title="Localization">
          <Field label="Timezone" defaultValue="Asia/Dhaka" />
          <Field label="Language" defaultValue="English (Global)" />
        </Card>
        <Card title="Live Data">
          <Field label="Refresh interval (s)" defaultValue="4" type="number" />
          <Field label="Peak threshold (W)" defaultValue="350" type="number" />
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/40 py-3 first:border-0 first:pt-0">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="border-t border-border/40 py-3 first:border-0 first:pt-0">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-xl border border-border/60 bg-background/40 px-3 text-sm outline-none focus:border-primary/50"
      />
    </div>
  );
}
