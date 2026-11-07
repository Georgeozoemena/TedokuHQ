"use client";
import { useEffect, useState } from "react";

// Shape of the part of the `qrcode` package that we use.
type QrLib = { toDataURL: (text: string, opts?: object) => Promise<string> };

// Shown on desktop browsers only. The QR code is made in the browser (the library is loaded
// only when this block appears) from this page's own address, so scanning it opens the same page on a phone.
export function QrBlock() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // The package is old-style (CommonJS), so depending on the bundler the functions
        // sit on the module itself or on its `default` export. Handle both.
        const mod = (await import("qrcode")) as unknown as Partial<QrLib> & { default?: QrLib };
        const lib = typeof mod.toDataURL === "function" ? (mod as QrLib) : mod.default;
        if (!lib) return;
        const pageUrl = window.location.href.split("#")[0]; // this page, without any #anchor
        const dataUrl = await lib.toDataURL(pageUrl, {
          margin: 1,
          width: 240,
          errorCorrectionLevel: "M",
          color: { dark: "#231B2E", light: "#FFFFFF" },
        });
        if (!cancelled) setSrc(dataUrl);
      } catch {
        // If the QR code cannot be made, the text below still tells people what to do.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="card mt-8 flex w-full max-w-md items-center gap-4 p-4 text-left">
      <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-2xl bg-lav-3">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} width={120} height={120} alt="QR code that opens this page on your phone" className="rounded-xl" />
        ) : (
          <span className="px-2 text-center text-xs text-muted">Making QR code...</span>
        )}
      </div>
      <p className="text-[15px] font-semibold leading-snug text-ink">Open this page on your Android phone to download.</p>
    </div>
  );
}
