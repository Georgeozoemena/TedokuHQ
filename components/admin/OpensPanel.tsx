import type { DashboardData } from "@/lib/admin/queries";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import { Card, Pill } from "@/components/admin/ui";

export function OpensPanel({ kpis, byVersion }: { kpis: DashboardData["kpis"]; byVersion: DashboardData["opensByVersion"] }) {
  return (
    <Card title="Clicks vs first opens" note="A click is not an install. First opens come from the app itself, the first time it is launched.">
      {!kpis.showOpenRate ? (
        <p className="text-sm text-muted">
          No first opens recorded yet. Once the mobile app calls <code className="rounded bg-lav-1 px-1">POST /api/first-open</code>, this panel fills in.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-2xl font-extrabold tabular-nums">{formatNumber(kpis.androidClicks)}</p><p className="text-xs text-muted">Android clicks</p></div>
            <div><p className="text-2xl font-extrabold tabular-nums">{formatNumber(kpis.firstOpens)}</p><p className="text-xs text-muted">First opens</p></div>
            <div><p className="text-2xl font-extrabold tabular-nums">{kpis.openRate === null ? "n/a" : formatPercent(kpis.openRate)}</p><p className="text-xs text-muted">Rate</p></div>
          </div>
          <p className="text-xs text-muted">Rough guide only. Someone may install days after they click, and short date ranges can look lower than the real rate.</p>
          {byVersion.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="First opens by app version">
              {byVersion.map((v) => <Pill key={v.label} tone="teal">v{v.label}: {formatNumber(v.count)}</Pill>)}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
