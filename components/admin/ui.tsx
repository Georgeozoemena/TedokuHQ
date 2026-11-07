// Small building blocks shared by the dashboard: card, label, pill, bar list.
import type { ReactNode } from "react";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import type { Breakdown } from "@/lib/admin/queries";

/** 11px uppercase label used above cards and table columns. */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-bold uppercase tracking-[0.08em] text-muted ${className}`}>{children}</p>;
}

export function Card({ title, note, children, className = "" }: { title?: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-adm bg-white p-4 shadow-adm sm:p-5 ${className}`}>
      {title && <Label>{title}</Label>}
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
}

const PILL_TONES = {
  neutral: "bg-lav-1 text-purple-dusk",
  ok: "bg-ok-bg text-ok-text",
  warn: "bg-warn-bg text-warn",
  teal: "bg-teal-bg text-teal",
} as const;

/** Status pill, 24px tall. */
export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof PILL_TONES }) {
  return <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ${PILL_TONES[tone]}`}>{children}</span>;
}

/** Horizontal bar list: label, bar, count and share. */
export function BarList({ items, empty = "No data in this period.", format }: { items: Breakdown[]; empty?: string; format?: (label: string) => string }) {
  if (items.length === 0) return <p className="py-2 text-sm text-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.clicks), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-semibold text-ink" title={format ? format(i.label) : i.label}>
              {format ? format(i.label) : i.label}
            </span>
            <span className="shrink-0 tabular-nums text-muted">
              <span className="font-bold text-ink">{formatNumber(i.clicks)}</span> · {formatPercent(i.share)}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-lav-1" role="presentation">
            <div className="h-2 rounded-full bg-purple" style={{ width: `${Math.max(2, (i.clicks / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
