// The Tedoku mark: a white water drop inside a rounded purple square, plus the TEDOKU wordmark.
// The same drop is used in app/icon.svg (browser tab icon).
export function DropMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#5B2A86" />
      <path d="M16 6.5c0 0-6.5 7.1-6.5 11.6a6.5 6.5 0 0 0 13 0C22.5 13.6 16 6.5 16 6.5z" fill="#FFFFFF" />
      <path d="M13.2 18.6a3 3 0 0 0 2.6 2.8" stroke="#5B2A86" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".55" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <DropMark />
      <span className={`text-lg font-extrabold tracking-[0.18em] ${light ? "text-white" : "text-ink"}`}>TEDOKU</span>
    </span>
  );
}
