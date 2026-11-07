import type { Breakdown } from "@/lib/admin/queries";
import { formatNumber, formatPercent } from "@/lib/admin/format";

export function ReferrerTable({ items }: { items: Breakdown[] }) {
  if (items.length === 0) return <p className="py-2 text-sm text-muted">No data in this period.</p>;
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[380px] text-sm">
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            <th scope="col" className="pb-2 pr-3 font-bold">Referrer</th>
            <th scope="col" className="pb-2 pr-3 text-right font-bold">Clicks</th>
            <th scope="col" className="pb-2 pr-3 text-right font-bold">Visitors</th>
            <th scope="col" className="pb-2 font-bold">Share</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.label} className="border-t border-line-hair">
              <td className="max-w-[180px] truncate py-2 pr-3 font-semibold text-ink" title={r.label}>{r.label}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{formatNumber(r.clicks)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{formatNumber(r.visitors)}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-lav-1" role="presentation"><div className="h-2 rounded-full bg-purple" style={{ width: `${Math.max(2, r.share * 100)}%` }} /></div>
                  <span className="text-xs tabular-nums text-muted">{formatPercent(r.share)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
