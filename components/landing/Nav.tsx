import Link from "next/link";
import { Wordmark } from "./Logo";
import { DownloadCta } from "./DownloadCta";

// Section anchors on the home page. Change the labels or ids here.
const LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Privacy", href: "#privacy" },
  { label: "Doctors", href: "#doctors" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line-hair bg-bg/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <Link href="/" aria-label="Tedoku home" className="rounded-lg"><Wordmark /></Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-md text-sm font-semibold text-muted hover:text-purple">{l.label}</a>
          ))}
        </nav>
        <DownloadCta loc="nav" size="sm" />
      </div>
      {/* On phones the links sit in a slim second row (no menu button needed). */}
      <nav aria-label="Main (small screens)" className="container-x flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap border-t border-line-hair py-2 md:hidden">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="rounded-md px-1 py-1 text-sm font-semibold text-muted hover:text-purple">{l.label}</a>
        ))}
      </nav>
    </header>
  );
}
