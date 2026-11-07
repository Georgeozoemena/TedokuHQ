"use client";
// Line chart drawn by hand as inline SVG (no chart library). Clicks in purple, unique visitors in teal.
// It measures its own width so text stays readable on a phone.
import { useEffect, useRef, useState } from "react";
import type { SeriesPoint } from "@/lib/admin/queries";

const PURPLE = "#5B2A86";
const TEAL = "#1F7A91";
const H = 240;
const M = { l: 38, r: 14, t: 12, b: 28 };

/** Round the top of the axis up to a tidy number so gridlines land on whole values. */
function niceMax(max: number): { top: number; step: number } {
  if (max <= 4) return { top: 4, step: 1 };
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  return { top: step * 4, step };
}

export function ClicksChart({ series }: { series: SeriesPoint[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const update = () => setW(Math.max(280, Math.floor(el.clientWidth)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = series.length;
  const iw = w - M.l - M.r;
  const ih = H - M.t - M.b;
  const maxVal = Math.max(0, ...series.map((p) => p.clicks));
  const { top, step } = niceMax(maxVal);
  const x = (i: number) => M.l + (n <= 1 ? iw / 2 : (i * iw) / (n - 1));
  const y = (v: number) => M.t + ih - (v / top) * ih;
  const line = (pick: (p: SeriesPoint) => number) => series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(pick(p)).toFixed(1)}`).join(" ");
  const area = n > 0 ? `${line((p) => p.clicks)} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z` : "";

  const ticks = Array.from({ length: 5 }, (_, i) => i * step);
  const labelCount = Math.max(2, Math.min(n, Math.floor(iw / 72)));
  const labelIdx = n <= labelCount ? series.map((_, i) => i) : Array.from({ length: labelCount }, (_, i) => Math.round((i * (n - 1)) / (labelCount - 1)));

  const active = hover ?? (n > 0 ? n - 1 : null);
  const point = active !== null ? series[active] : null;
  const totalClicks = series.reduce((s, p) => s + p.clicks, 0);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = n <= 1 ? 0 : Math.round(((px - M.l) / iw) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <div className="flex items-center gap-4 font-semibold">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: PURPLE }} />Clicks</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: TEAL }} />Unique visitors</span>
        </div>
        <p aria-live="polite" className="text-muted">
          {point ? <><span className="font-semibold text-ink">{point.full}</span>: {point.clicks} clicks, {point.visitors} visitors</> : "No data"}
        </p>
      </div>
      <div ref={wrap} className="w-full">
        <svg
          width={w}
          height={H}
          viewBox={`0 0 ${w} ${H}`}
          role="img"
          aria-label={`Line chart of clicks and unique visitors. ${totalClicks} clicks in total across ${n} points.`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          style={{ touchAction: "pan-y" }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={w - M.r} y1={y(t)} y2={y(t)} stroke="#EDE6F0" strokeWidth={1} />
              <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#5E5870">{t}</text>
            </g>
          ))}
          {labelIdx.map((i) => (
            <text key={series[i].key} x={x(i)} y={H - 8} textAnchor={i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle"} fontSize={11} fill="#5E5870">{series[i].label}</text>
          ))}
          {n > 0 && <path d={area} fill={PURPLE} opacity={0.08} />}
          {n > 0 && <path d={line((p) => p.visitors)} fill="none" stroke={TEAL} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
          {n > 0 && <path d={line((p) => p.clicks)} fill="none" stroke={PURPLE} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
          {n <= 40 && series.map((p, i) => (
            <g key={p.key}>
              <circle cx={x(i)} cy={y(p.visitors)} r={3} fill="#fff" stroke={TEAL} strokeWidth={2} />
              <circle cx={x(i)} cy={y(p.clicks)} r={3} fill="#fff" stroke={PURPLE} strokeWidth={2} />
            </g>
          ))}
          {hover !== null && point && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={y(0)} stroke="#CFC6D6" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(point.visitors)} r={4.5} fill={TEAL} />
              <circle cx={x(hover)} cy={y(point.clicks)} r={4.5} fill={PURPLE} />
            </g>
          )}
          {totalClicks === 0 && <text x={w / 2} y={H / 2} textAnchor="middle" fontSize={13} fill="#5E5870">No clicks in this period</text>}
        </svg>
      </div>
    </div>
  );
}
