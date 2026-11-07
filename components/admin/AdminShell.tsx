// Page frame for signed-in admin pages: purple sidebar on desktop, a top bar on phones.
import type { ReactNode } from "react";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Downloads", key: "downloads" },
  { href: "/admin/mfa", label: "Security", key: "security" },
] as const;

function Mark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/15" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5c3.6 4.4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.4-6.6 6-11z" /></svg>
    </span>
  );
}

export function AdminShell({ active, email, children }: { active: "downloads" | "security"; email?: string | null; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-admin-bg md:flex">
      <aside className="bg-purple-night text-white md:fixed md:inset-y-0 md:flex md:w-60 md:flex-col md:px-4 md:py-6">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-2 md:py-0">
          <div className="flex items-center gap-3">
            <Mark />
            <span className="text-sm font-extrabold tracking-[0.18em]">TEDOKU</span>
          </div>
          <form action="/admin/signout" method="post" className="md:hidden">
            <button className="h-9 rounded-full px-3 text-xs font-semibold text-white/80 hover:bg-white/10" type="submit">Sign out</button>
          </form>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:mt-8 md:flex-col md:px-0 md:pb-0">
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              aria-current={active === n.key ? "page" : undefined}
              className={`flex h-10 shrink-0 items-center rounded-xl px-3 text-sm font-semibold text-white ${active === n.key ? "bg-white/[.14]" : "text-white/75 hover:bg-white/10"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden px-2 md:block">
          {email && <p className="truncate text-xs text-white/70" title={email}>{email}</p>}
          <form action="/admin/signout" method="post" className="mt-2">
            <button className="h-9 rounded-xl px-3 text-sm font-semibold text-white/85 hover:bg-white/10" type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:ml-60 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
