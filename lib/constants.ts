// Shared names and allowlists used by the landing page, the tracking route and the admin dashboard.
export const VISITOR_COOKIE = "tdk_vid";            // random anonymous visitor id, 1 year
export const UTM_COOKIE = "tdk_utm";                // short-lived (30 min) JSON: {s,m,c} = utm_source/medium/campaign
export const BUTTON_LOCATIONS = ["nav", "hero", "doctors", "closing", "install", "other"] as const;
export type ButtonLocation = (typeof BUTTON_LOCATIONS)[number];
export const DEFAULT_BUTTON_LOCATION: ButtonLocation = "other";
export const RATE_LIMIT_PER_MINUTE = 30;
export const RETENTION_MONTHS = 13;
export const ADMIN_SESSION_HOURS = 8;
export const DEVICE_TYPES = ["mobile", "tablet", "desktop"] as const;
export const OS_NAMES = ["Android", "iOS", "Windows", "macOS", "Linux", "other"] as const;
