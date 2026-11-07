import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "./Logo";
import { Footer } from "./Footer";
import { CookieNotice } from "./CookieNotice";

// Shared page frame for /privacy and /terms: simple header, readable text column, footer.
export function LegalShell({ title, updated, intro, children }: { title: string; updated: string; intro: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line-hair bg-bg">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" aria-label="Tedoku home" className="rounded-lg"><Wordmark /></Link>
          <Link href="/" className="rounded-md text-sm font-bold text-purple">Back to home</Link>
        </div>
      </header>
      <main id="main" className="container-x max-w-3xl py-12 sm:py-16">
        <h1 className="text-4xl">{title}</h1>
        <p className="mt-2 text-sm font-semibold text-muted">Last updated: {updated}</p>
        <p className="mt-6 text-lg text-muted">{intro}</p>
        <div className="mt-10 space-y-10 text-[17px] leading-relaxed">{children}</div>
      </main>
      <Footer />
      <CookieNotice />
    </>
  );
}

export function LegalSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 space-y-3">
      <h2 className="text-2xl">{title}</h2>
      {children}
    </section>
  );
}

// Amber box used to mark text that must be checked by a lawyer before launch.
export function ReviewBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="rounded-card bg-warn-bg p-5 text-warn" role="note">
      <p className="label-xs">{title}</p>
      <div className="mt-2 space-y-2 text-[15px] font-medium leading-relaxed">{children}</div>
    </aside>
  );
}
