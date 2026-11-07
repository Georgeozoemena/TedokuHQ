"use client";
import { useEffect } from "react";
import { UTM_COOKIE } from "@/lib/constants";

// Invisible helper. If the page address has utm_source / utm_medium / utm_campaign
// (for example from a campaign link), it keeps them for 30 minutes in the `tdk_utm` cookie
// so that /download can record where the visit came from. It also keeps the host (only) of the site that
// linked here, because by the time someone presses Download the browser's own referrer is just our site.
// It writes nothing if there is nothing to keep.
// Cookie format (shared with the tracking code): encodeURIComponent(JSON.stringify({ s, m, c, r })).
export function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const clean = (v: string | null) => (v ? v.trim().slice(0, 100) : "");
      const s = clean(params.get("utm_source"));
      const m = clean(params.get("utm_medium"));
      const c = clean(params.get("utm_campaign"));
      // Host (only) of the site that sent the visitor here, if it is not our own site. Never the full address.
      let r = "";
      try {
        const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
        if (ref && ref !== window.location.hostname.replace(/^www\./, "")) r = ref.slice(0, 100);
      } catch { /* bad referrer: ignore */ }
      if (!s && !m && !c && !r) return;
      const value: { s?: string; m?: string; c?: string; r?: string } = {};
      if (r) value.r = r;
      if (s) value.s = s;
      if (m) value.m = m;
      if (c) value.c = c;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${UTM_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=1800; Path=/; SameSite=Lax${secure}`;
    } catch {
      // Cookies blocked: tracking just loses the campaign label. The download still works.
    }
  }, []);
  return null;
}
