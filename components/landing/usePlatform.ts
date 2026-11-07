"use client";
import { useEffect, useState } from "react";

export type Platform = "android" | "ios" | "desktop";

// Works out what kind of device is looking at the page.
// The server HTML (and the first render in the browser) always says "android", so the page
// loads with the Android download button. After the page mounts we read navigator.userAgent
// and switch to the iPhone waitlist or the desktop QR code if needed.
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("android");
  useEffect(() => {
    const ua = navigator.userAgent;
    // iPadOS can pretend to be a Mac, so we also check for a touch screen on "Macintosh".
    const isIos = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (isIos) setPlatform("ios");
    else if (/Android/i.test(ua)) setPlatform("android");
    else setPlatform("desktop");
  }, []);
  return platform;
}
