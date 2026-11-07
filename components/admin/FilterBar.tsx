"use client";
// Date range chips, custom dates, the "Include bots" switch and the CSV button.
// Everything is stored in the URL (?range=7d&bots=1) so a view can be bookmarked and shared.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
] as const;

interface Props {
  range: string;
  from: string;
  to: string;
  bots: boolean;
  /** Query string for the current view, used by the export link. */
  exportQuery: string;
}

export function FilterBar({ range, from, to, bots, exportQuery }: Props) {
  const router = useRouter();
  const [customOpen, setCustomOpen] = useState(range === "custom");
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);

  const href = (r: string, b: boolean) => `/admin?range=${r}${b ? "&bots=1" : ""}`;
  const chip = (active: boolean) =>
    `inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${active ? "bg-purple text-white" : "bg-white text-ink shadow-adm hover:bg-lav-1"}`;

  function applyCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!f || !t) return;
    router.push(`/admin?range=custom&from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}${bots ? "&bots=1" : ""}`);
  }
  function toggleBots() {
    const q = new URLSearchParams({ range });
    if (range === "custom") { q.set("from", from); q.set("to", to); }
    if (!bots) q.set("bots", "1");
    router.push(`/admin?${q.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Date range">
        {RANGES.map((r) =>
          r.key === "custom" ? (
            <button key={r.key} type="button" className={chip(range === "custom")} aria-pressed={range === "custom"} onClick={() => setCustomOpen((o) => !o)}>
              {r.label}
            </button>
          ) : (
            <Link key={r.key} href={href(r.key, bots)} className={chip(range === r.key)} aria-current={range === r.key ? "true" : undefined}>
              {r.label}
            </Link>
          ),
        )}
        <div className="ml-auto flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <button
              type="button"
              role="switch"
              aria-checked={bots}
              aria-label="Include bots"
              onClick={toggleBots}
              className={`relative h-6 w-11 rounded-full transition ${bots ? "bg-purple" : "bg-line-input"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${bots ? "left-[22px]" : "left-0.5"}`} />
            </button>
            <span>Include bots</span>
          </label>
          <a href={`/api/admin/export?${exportQuery}`} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-bold text-purple shadow-adm hover:bg-lav-1">
            Export CSV
          </a>
        </div>
      </div>
      {customOpen && (
        <form onSubmit={applyCustom} className="flex flex-wrap items-end gap-3 rounded-adm bg-white p-3 shadow-adm">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            From
            <input type="date" value={f} onChange={(e) => setF(e.target.value)} required className="mt-1 block h-10 rounded-xl border border-line-input px-3 text-sm font-medium normal-case tracking-normal text-ink" />
          </label>
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            To
            <input type="date" value={t} onChange={(e) => setT(e.target.value)} required className="mt-1 block h-10 rounded-xl border border-line-input px-3 text-sm font-medium normal-case tracking-normal text-ink" />
          </label>
          <button type="submit" className="h-10 rounded-xl bg-purple px-5 text-sm font-bold text-white hover:bg-purple-deep">Apply</button>
        </form>
      )}
    </div>
  );
}
