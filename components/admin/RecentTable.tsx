import type { RecentRow } from "@/lib/admin/queries";
import { countryName, dateTime } from "@/lib/admin/format";
import { Pill } from "@/components/admin/ui";

export function RecentTable({ rows }: { rows: RecentRow[] }) {
  if (rows.length === 0) return <p className="py-2 text-sm text-muted">No clicks in this period.</p>;
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            {["Time (WAT)", "Country", "Device", "OS", "Source", "Button"].map((h) => (
              <th key={h} scope="col" className="pb-2 pr-3 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.time}-${i}`} className="border-t border-line-hair">
              <td className="whitespace-nowrap py-2 pr-3 tabular-nums">{dateTime(r.time)}</td>
              <td className="py-2 pr-3">{countryName(r.country)}</td>
              <td className="py-2 pr-3 capitalize">{r.device}</td>
              <td className="py-2 pr-3">{r.os}</td>
              <td className="max-w-[160px] truncate py-2 pr-3" title={r.source}>{r.source}</td>
              <td className="py-2 pr-3"><Pill>{r.button}</Pill>{r.isBot && <span className="ml-1"><Pill tone="warn">Bot</Pill></span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
