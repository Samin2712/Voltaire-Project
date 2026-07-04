import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "./dashboard";
import { Download, FileText, FileSpreadsheet, FileType2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchWeeklyUsage, fetchRoomStats, ROOMS, estimatedBillBDT } from "@/lib/mock-api";
import { fetchWeeklyUsageAPI, fetchRoomStatsAPI } from "@/lib/api";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Voltaire" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [weekly, setWeekly] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchWeeklyUsageAPI().then(setWeekly).catch(() => fetchWeeklyUsage().then(setWeekly));
    fetchRoomStatsAPI().then(setRooms).catch(() => fetchRoomStats().then(setRooms));
  }, []);

  const totalKWh = weekly.reduce((s, d) => s + d.kWh, 0);
  const report = createReportModel(weekly, rooms, totalKWh);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Reports</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">Weekly Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Downloadable summary of the last 7 days.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportBtn icon={FileType2} label="PDF" onExport={() => exportReport("pdf", report)} />
          <ExportBtn icon={FileSpreadsheet} label="Excel" onExport={() => exportReport("excel", report)} />
          <ExportBtn icon={FileText} label="CSV" onExport={() => exportReport("csv", report)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Total kWh", v: totalKWh.toFixed(2) },
          { l: "Est. Bill", v: `৳ ${estimatedBillBDT(totalKWh).toFixed(2)}` },
          { l: "Peak Day", v: weekly.reduce((a, b) => b.kWh > a.kWh ? b : a, { day: "—", kWh: 0 }).day },
          { l: "Avg / Day", v: (totalKWh / (weekly.length || 1)).toFixed(2) + " kWh" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
            <div className="mt-1 text-2xl font-bold text-gradient-primary">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Card title="Daily Consumption" subtitle="Last 7 days · kWh">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="kWh" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="peak" fill="var(--warning)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Per-Room Summary" subtitle="Snapshot of current state">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2">Room</th>
                  <th>Devices</th>
                  <th>Running</th>
                  <th>Current Power</th>
                  <th>Efficiency</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r: any) => (
                  <tr key={r.room.id} className="border-t border-border/40">
                    <td className="py-2.5 font-medium">{r.room.name}</td>
                    <td>{r.total}</td>
                    <td>{r.running}</td>
                    <td>{r.power} W</td>
                    <td>{r.efficiency}%</td>
                    <td>{r.health}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function ExportBtn({ icon: Icon, label, onExport }: { icon: any; label: string; onExport: () => void }) {
  return (
    <button
      onClick={onExport}
      className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2 text-xs font-semibold hover:bg-card/90"
    >
      <Icon className="h-4 w-4" /> Export {label} <Download className="h-3 w-3 opacity-60" />
    </button>
  );
}

type WeeklyRow = { day: string; kWh: number; peak: number };
type RoomRow = {
  room: { id: string; name: string; description?: string };
  total: number;
  running: number;
  power: number;
  efficiency: number;
  health: number;
};

type ReportModel = {
  generatedAt: string;
  totalKWh: number;
  estimatedBill: number;
  peakDay: string;
  avgPerDay: number;
  weekly: WeeklyRow[];
  rooms: RoomRow[];
};

function createReportModel(weekly: WeeklyRow[], rooms: RoomRow[], totalKWh: number): ReportModel {
  const peakDay = weekly.reduce((a, b) => (b.kWh > a.kWh ? b : a), { day: "-", kWh: 0, peak: 0 });
  return {
    generatedAt: new Date().toLocaleString(),
    totalKWh,
    estimatedBill: estimatedBillBDT(totalKWh),
    peakDay: peakDay.day,
    avgPerDay: totalKWh / (weekly.length || 1),
    weekly,
    rooms,
  };
}

function exportReport(format: "pdf" | "excel" | "csv", report: ReportModel) {
  if (format === "csv") {
    downloadBlob("voltaire-weekly-report.csv", "text/csv;charset=utf-8", buildCsv(report));
  }
  if (format === "excel") {
    downloadBlob("voltaire-weekly-report.xls", "application/vnd.ms-excel;charset=utf-8", buildExcelHtml(report));
  }
  if (format === "pdf") {
    downloadBlob("voltaire-weekly-report.pdf", "application/pdf", buildPdf(report));
  }
  toast.success(`${format.toUpperCase()} report downloaded`);
}

function buildCsv(report: ReportModel) {
  const lines = [
    ["Voltaire Weekly Report"],
    ["Generated At", report.generatedAt],
    ["Total kWh", report.totalKWh.toFixed(2)],
    ["Estimated Bill", `BDT ${report.estimatedBill.toFixed(2)}`],
    ["Peak Day", report.peakDay],
    ["Average Per Day", `${report.avgPerDay.toFixed(2)} kWh`],
    [],
    ["Daily Consumption"],
    ["Day", "kWh", "Peak"],
    ...report.weekly.map((row) => [row.day, row.kWh, row.peak]),
    [],
    ["Per-Room Summary"],
    ["Room", "Devices", "Running", "Current Power (W)", "Efficiency (%)", "Health (%)"],
    ...report.rooms.map((row) => [row.room.name, row.total, row.running, row.power, row.efficiency, row.health]),
  ];
  return lines.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function buildExcelHtml(report: ReportModel) {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Voltaire Weekly Report</title></head>
<body>
  <h1>Voltaire Weekly Report</h1>
  <p>Generated at: ${escapeHtml(report.generatedAt)}</p>
  <table border="1" cellspacing="0" cellpadding="6">
    <tr><th>Total kWh</th><th>Estimated Bill</th><th>Peak Day</th><th>Avg / Day</th></tr>
    <tr><td>${report.totalKWh.toFixed(2)}</td><td>BDT ${report.estimatedBill.toFixed(2)}</td><td>${escapeHtml(report.peakDay)}</td><td>${report.avgPerDay.toFixed(2)} kWh</td></tr>
  </table>
  <h2>Daily Consumption</h2>
  <table border="1" cellspacing="0" cellpadding="6">
    <tr><th>Day</th><th>kWh</th><th>Peak</th></tr>
    ${report.weekly.map((row) => `<tr><td>${escapeHtml(row.day)}</td><td>${row.kWh}</td><td>${row.peak}</td></tr>`).join("")}
  </table>
  <h2>Per-Room Summary</h2>
  <table border="1" cellspacing="0" cellpadding="6">
    <tr><th>Room</th><th>Devices</th><th>Running</th><th>Current Power (W)</th><th>Efficiency (%)</th><th>Health (%)</th></tr>
    ${report.rooms.map((row) => `<tr><td>${escapeHtml(row.room.name)}</td><td>${row.total}</td><td>${row.running}</td><td>${row.power}</td><td>${row.efficiency}</td><td>${row.health}</td></tr>`).join("")}
  </table>
</body>
</html>`;
}

function buildPdf(report: ReportModel) {
  const lines = [
    "Voltaire Weekly Report",
    `Generated: ${report.generatedAt}`,
    `Total kWh: ${report.totalKWh.toFixed(2)}`,
    `Estimated Bill: BDT ${report.estimatedBill.toFixed(2)}`,
    `Peak Day: ${report.peakDay}`,
    `Average / Day: ${report.avgPerDay.toFixed(2)} kWh`,
    "",
    "Daily Consumption",
    ...report.weekly.map((row) => `${row.day}: ${row.kWh} kWh, peak ${row.peak}`),
    "",
    "Per-Room Summary",
    ...report.rooms.map((row) => `${row.room.name}: ${row.running}/${row.total} running, ${row.power} W, ${row.efficiency}% efficiency, ${row.health}% health`),
  ].slice(0, 42);

  const content = [
    "BT",
    "/F1 14 Tf",
    "50 780 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "/F1 18 Tf" : index === 1 ? "/F1 10 Tf" : "/F1 11 Tf",
      `(${escapePdf(line)}) Tj`,
      "0 -18 Td",
    ]),
    "ET",
  ].join("\n");

  return createPdfDocument(content);
}

function createPdfDocument(content: string) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function downloadBlob(filename: string, type: string, content: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapePdf(value: unknown) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
