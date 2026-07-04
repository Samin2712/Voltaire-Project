import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "./dashboard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Cpu, Activity, MessageSquare, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help — Voltaire" }] }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Help</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">How Voltaire Works</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you need to demo, extend, or debug.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><Cpu className="h-5 w-5" /></div>
          <div className="mt-3 font-semibold">Simulated Devices</div>
          <p className="mt-1 text-sm text-muted-foreground">15 mock devices generate live state every few seconds. Swap the mock layer for MQTT or REST later — the UI won't budge.</p>
        </Card>
        <Card>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><Activity className="h-5 w-5" /></div>
          <div className="mt-3 font-semibold">Backend Contract</div>
          <p className="mt-1 text-sm text-muted-foreground">All data flows through <code className="rounded bg-muted px-1">src/lib/mock-api.ts</code>. Replace each function with your real endpoint — components stay identical.</p>
        </Card>
        <Card>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><MessageSquare className="h-5 w-5" /></div>
          <div className="mt-3 font-semibold">Discord Co-pilot</div>
          <p className="mt-1 text-sm text-muted-foreground">The Discord bot reads from the same source of truth. Ask <code>!status</code>, <code>!room work1</code>, <code>!usage</code>.</p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Architecture" subtitle="One backend feeds every surface">
          <pre className="overflow-x-auto rounded-xl border border-border/60 bg-background/50 p-4 text-xs text-muted-foreground">{`[ Simulated Devices ]
        │
        ▼
[   Backend API   ]
   │            │
   ▼            ▼
[ Web UI ]  [ Discord Bot ]
`}</pre>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" /> Web dashboard and bot always reflect the same reality.
          </div>
        </Card>

        <Card title="Frequently Asked Questions">
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "How is 'live' data faked?", a: "A simulator toggles a random device state every ~4 seconds and notifies subscribers. Replace with WebSocket or SSE for production." },
              { q: "How do I connect a real backend?", a: "Implement fetchDevices, fetchAlerts, fetchActivity, fetchPowerSeries, toggleDevice, and subscribe(). Component code doesn't change." },
              { q: "Is dark mode configurable?", a: "Yes. The app is dark-first with a toggle in the topbar. Design tokens live in src/styles.css." },
              { q: "What about hardware?", a: "A representative ESP32 circuit reads on/off states via GPIO and optionally current sensors. See the Wokwi schematic in the repo." },
            ].map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </AppShell>
  );
}
