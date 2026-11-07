// Three small line icons for the promise cards. Drawn as inline SVG so no image files are needed.
const base = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false } as const;

export function LockIcon() {
  return (<svg {...base}><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
}
export function BadgeCheckIcon() {
  return (<svg {...base}><path d="M12 3l2.4 1.7 2.9-.1 1 2.7 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-1 2.7-2.9-.1L12 21l-2.4-1.7-2.9.1-1-2.7L3.3 15l.9-2.8-.9-2.8 2.4-1.7 1-2.7 2.9.1z" /><path d="M8.5 12.2l2.4 2.4 4.6-4.8" /></svg>);
}
export function KeyIcon() {
  return (<svg {...base}><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16 7l3 3M14 9l2 2" /></svg>);
}
