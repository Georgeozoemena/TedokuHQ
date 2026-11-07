import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/config";
import { Wordmark } from "./Logo";

// Section 11: footer
export function Footer() {
  return (
    <footer className="border-t border-line bg-bg py-10">
      <div className="container-x flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" aria-label="Tedoku home" className="rounded-lg"><Wordmark /></Link>
          <p className="mt-4 max-w-sm text-sm font-semibold text-ink">Tedoku does not replace emergency care. In an emergency call 112.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link href="/privacy" className="rounded-md text-purple hover:underline">Privacy</Link>
          <Link href="/terms" className="rounded-md text-purple hover:underline">Terms</Link>
          {/* PLACEHOLDER email: change CONTACT_EMAIL in lib/config.ts */}
          <a href={`mailto:${CONTACT_EMAIL}`} className="rounded-md text-purple hover:underline">{CONTACT_EMAIL}</a>
        </nav>
      </div>
    </footer>
  );
}
