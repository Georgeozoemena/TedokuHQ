"use client";
import { ANDROID_MIN, APK_SIZE_LABEL, APP_VERSION } from "@/lib/config";
import type { ButtonLocation } from "@/lib/constants";
import { usePlatform } from "./usePlatform";
import { InstallPanel } from "./InstallPanel";
import { QrBlock } from "./QrBlock";
import { WaitlistForm } from "./WaitlistForm";

type Props = {
  /** Which button this is. Sent to /download?from=... so the dashboard can show which button works. */
  loc: ButtonLocation;
  /** "sm" is the small nav button, "lg" is the full-size button. */
  size?: "sm" | "lg";
  /** "light" is a white button for dark purple bands. */
  tone?: "primary" | "light";
  /** true = also show version, install link, QR code (desktop) and iPhone waitlist. Used in the hero. */
  extras?: boolean;
};

// Every download button on the site comes from here. It always links to our own /download route
// (never straight to the APK), so each click can be counted before the redirect.
export function DownloadCta({ loc, size = "lg", tone = "primary", extras = false }: Props) {
  const platform = usePlatform();
  const look = tone === "light" ? "btn-light" : "btn-primary";
  const sizing = size === "sm" ? "h-10 rounded-btn px-4 text-sm" : "w-full sm:w-auto";

  // iPhone: no APK, so no download button.
  if (platform === "ios") {
    if (extras) {
      return (
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-2xl font-extrabold">iPhone version coming soon</p>
          <p className="mt-2 text-muted">Tedoku is Android only for now. Leave your email and we will let you know when the iPhone version is ready.</p>
          <WaitlistForm />
        </div>
      );
    }
    return (
      <a href="#get" className={`inline-flex items-center justify-center rounded-btn font-bold ${tone === "light" ? "bg-white text-purple" : "bg-lav-1 text-purple"} ${size === "sm" ? "h-10 px-4 text-sm" : "h-[54px] px-6"}`}>
        {size === "sm" ? "iPhone coming soon" : "iPhone version coming soon"}
      </a>
    );
  }

  const button = (
    <a href={`/download?from=${loc}`} className={`${look} ${sizing}`} aria-label={size === "sm" ? "Download Tedoku for Android" : undefined}>
      {size === "sm" ? <>Download<span className="hidden sm:inline">&nbsp;for Android</span></> : "Download for Android (APK)"}
    </a>
  );
  if (!extras) return button;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-4">
        {button}
        <InstallPanel />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">Version {APP_VERSION} · {APK_SIZE_LABEL} · {ANDROID_MIN}</p>
      <p className="mt-1 text-sm text-muted">Android only for now. iPhone coming soon.</p>
      <a href="#how-it-works" className="mt-3 rounded-lg px-2 py-1 text-[15px] font-bold text-purple underline decoration-2 underline-offset-4 hover:text-purple-deep">How it works</a>
      {platform === "desktop" && <QrBlock />}
    </div>
  );
}
