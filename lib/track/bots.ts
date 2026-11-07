// Bot detection for /download clicks.
// Rule (from the brief): a hit is a bot when
//   1) the user agent belongs to a known crawler or link-preview bot, OR
//   2) the request has no visitor cookie AND no referrer AND the user agent looks automated.
// Bot hits are still saved (so you can see them) but the dashboard hides them by default.

// Crawlers, search engines, SEO tools, uptime monitors, AI crawlers and chat-app link previews.
// Add a new name here if you see one in the "Include bots" view that should have been flagged.
const KNOWN_BOT_PATTERN = new RegExp(
  [
    "googlebot", "google-inspectiontool", "storebot-google", "adsbot", "mediapartners",
    "bingbot", "bingpreview", "msnbot", "duckduckbot", "baiduspider", "yandex", "sogou",
    "applebot", "slurp", "petalbot", "bytespider", "semrush", "ahrefs", "mj12bot", "dotbot",
    "gptbot", "chatgpt-user", "oai-searchbot", "claudebot", "claude-web", "anthropic-ai",
    "perplexitybot", "ccbot", "amazonbot", "facebookexternalhit", "facebot", "meta-externalagent",
    "twitterbot", "linkedinbot", "slackbot", "slack-imgproxy", "telegrambot", "discordbot",
    "whatsapp", "skypeuripreview", "pinterestbot", "redditbot", "embedly", "vkshare", "quora link preview",
    "uptimerobot", "pingdom", "statuscake", "site24x7", "datadog", "newrelic", "lighthouse",
    "pagespeed", "gtmetrix", "headlesschrome", "phantomjs", "crawler", "spider", "scraper",
    "link preview", "linkpreview", "\\bbot\\b", "bot/\\d", "bot\\)", "bot;",
  ].join("|"),
  "i",
);

// Tools and libraries that make web requests without a browser.
const AUTOMATED_PATTERN =
  /curl|wget|python|java\/|go-http-client|okhttp|libwww|httpie|\bnode(-fetch|js)?\b|undici|axios|postman|insomnia|powershell|scrapy|aiohttp|http-?client|headless|phantom|selenium|puppeteer|playwright|\bhttp\b/i;

export function isKnownBot(userAgent: string | null | undefined): boolean {
  return !!userAgent && KNOWN_BOT_PATTERN.test(userAgent);
}

/** True when the user agent is empty, very short, not browser-shaped, or names a scripting tool. */
export function looksAutomated(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  if (ua.length < 10) return true;
  if (AUTOMATED_PATTERN.test(ua)) return true;
  return !ua.startsWith("Mozilla/");
}

export interface BotSignals {
  userAgent: string | null | undefined;
  hasCookie: boolean;   // did the request carry the tdk_vid visitor cookie?
  hasReferrer: boolean; // did the request carry a Referer header?
}

export function isBot({ userAgent, hasCookie, hasReferrer }: BotSignals): boolean {
  if (isKnownBot(userAgent)) return true;
  return !hasCookie && !hasReferrer && looksAutomated(userAgent);
}
