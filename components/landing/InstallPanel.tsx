"use client";
import { useRef } from "react";
import { ANDROID_MIN, APK_SHA256, APK_SIZE_LABEL, APP_VERSION } from "@/lib/config";

// "How to install" link plus the panel it opens. The panel is a native <dialog>, so the browser
// gives us a keyboard focus trap, the Escape key and a dimmed background for free.
export function InstallPanel() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="rounded-lg px-2 py-2 text-[15px] font-bold text-purple underline decoration-2 underline-offset-4 hover:text-purple-deep">
        How to install
      </button>
      <dialog
        ref={ref}
        aria-labelledby="install-title"
        onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }} // click on the dimmed background closes it
        className="m-auto max-h-[90vh] w-[calc(100%-32px)] max-w-lg overflow-y-auto rounded-card bg-white p-0 text-left text-ink shadow-card backdrop:bg-purple-night/60"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="install-title" className="text-2xl">How to install Tedoku</h2>
            <button type="button" onClick={() => ref.current?.close()} className="-mr-2 -mt-1 rounded-lg px-3 py-2 text-sm font-bold text-purple">Close</button>
          </div>
          <p className="mt-1 text-sm text-muted">Version {APP_VERSION} · {APK_SIZE_LABEL} · {ANDROID_MIN}</p>

          <ol className="mt-5 space-y-3">
            {[
              "Tap Download and open the file.",
              "If asked, allow installs from this browser.",
              "Tap Install.",
              "Open Tedoku.",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lav-1 text-sm font-extrabold text-purple">{i + 1}</span>
                <span className="pt-0.5 text-[16px]">{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-5 rounded-2xl bg-warn-bg px-4 py-3 text-sm font-semibold text-warn">
            Android may show a warning for apps installed outside Google Play. Only install Tedoku from this page.
          </p>

          <div className="mt-5">
            <p className="label-xs text-muted">File checksum (SHA-256)</p>
            <code className="mt-1.5 block break-all rounded-2xl bg-lav-3 px-3 py-2.5 text-[13px] leading-relaxed text-ink">{APK_SHA256}</code>
            <p className="mt-1.5 text-sm text-muted">To check your download, compare this with the checksum of the file (on a computer: <span className="font-mono">sha256sum tedoku.apk</span>). They should match exactly.</p>
          </div>

          <a href="/download?from=install" className="btn-primary mt-6 w-full">Download for Android (APK)</a>
        </div>
      </dialog>
    </>
  );
}
