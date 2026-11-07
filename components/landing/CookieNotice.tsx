"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const SEEN_KEY = "tdk_notice_seen"; // remembered only in this browser (localStorage), not a cookie

// A plain-words notice about our one visitor cookie. Counting works whether or not the person
// ever taps "Got it": the notice only informs, it does not switch anything on or off.
// NOTE FOR LAWYER REVIEW: whether notice-only is enough under the NDPA 2023 (or whether consent
// is needed) is flagged on the /privacy page.
export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setShow(true);
    } catch {
      setShow(true); // storage blocked: just show the notice
    }
  }, []);

  function dismiss() {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore: the notice will simply show again next visit */ }
    setShow(false);
  }

  if (!show) return null;
  return (
    <section aria-label="Cookie notice" className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-lg rounded-card bg-white p-5 shadow-card ring-1 ring-line">
      <p className="text-[15px] font-extrabold text-ink">One small cookie</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        We use one cookie, called <span className="font-mono font-semibold text-ink">tdk_vid</span>. It is a random number with no name or contact details in it, and it lasts one year. It lets us count how many different people press Download, instead of counting the same person twice. It is not used for ads and nothing is shared with advertisers. If you arrive from a campaign link or another website, we also remember that link&apos;s label and the website&apos;s name (not the full address) for 30 minutes in a second cookie, <span className="font-mono font-semibold text-ink">tdk_utm</span>. You do not need to do anything for the site to work.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="button" onClick={dismiss} className="inline-flex h-11 items-center rounded-btn bg-purple px-5 text-sm font-bold text-white hover:bg-purple-deep">Got it</button>
        <Link href="/privacy#what-we-measure" className="rounded-md text-sm font-bold text-purple underline underline-offset-4">What we measure</Link>
      </div>
    </section>
  );
}
