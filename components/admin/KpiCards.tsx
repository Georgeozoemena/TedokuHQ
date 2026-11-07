import type { DashboardData } from "@/lib/admin/queries";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import { Label } from "@/components/admin/ui";

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-adm bg-white p-4 shadow-adm">
      <Label>{label}</Label>
      <p className="mt-2 text-[28px] font-extrabold leading-none tracking-tight text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function KpiCards({ kpis }: { kpis: DashboardData["kpis"] }) {
  const pct = (n: number) => (kpis.totalClicks ? formatPercent(n / kpis.totalClicks) : "0%");
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
      <Kpi label="Total download clicks" value={formatNumber(kpis.totalClicks)} hint="Clicks, not installs" />
      <Kpi label="Unique visitors" value={formatNumber(kpis.uniqueVisitors)} hint="Different people, counted once" />
      <Kpi label="Android clicks" value={formatNumber(kpis.androidClicks)} hint={`${pct(kpis.androidClicks)} of clicks. Can install.`} />
      <Kpi label="Desktop clicks" value={formatNumber(kpis.desktopClicks)} hint={`${pct(kpis.desktopClicks)} of clicks. Probably cannot.`} />
      {kpis.showOpenRate && (
        <Kpi
          label="Click-to-first-open rate"
          value={kpis.openRate === null ? "n/a" : formatPercent(kpis.openRate)}
          hint={`${formatNumber(kpis.firstOpens)} first opens vs ${formatNumber(kpis.androidClicks)} Android clicks`}
        />
      )}
    </div>
  );
}
