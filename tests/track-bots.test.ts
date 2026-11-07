import { describe, expect, it } from "vitest";
import { isBot, isKnownBot, looksAutomated } from "@/lib/track/bots";
import { parseUserAgent } from "@/lib/track/ua";

const CHROME_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const CHROME_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const WHATSAPP = "WhatsApp/2.23.20.0 A";
const FACEBOOK_PREVIEW = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

describe("known bots", () => {
  it.each([GOOGLEBOT, WHATSAPP, FACEBOOK_PREVIEW, "Slackbot-LinkExpanding 1.0", "Mozilla/5.0 (compatible; GPTBot/1.0)", "Twitterbot/1.0"])(
    "flags %s", (ua) => expect(isKnownBot(ua)).toBe(true),
  );
  it("does not flag normal browsers", () => {
    for (const ua of [CHROME_ANDROID, CHROME_WINDOWS, IPHONE]) expect(isKnownBot(ua)).toBe(false);
  });
  it("does not flag a phone brand that merely contains the letters 'bot'", () => {
    expect(isKnownBot("Mozilla/5.0 (Linux; Android 10; CUBOT_X30) Chrome/120 Mobile Safari/537.36")).toBe(false);
  });
});

describe("looks automated", () => {
  it("flags empty, short and script-like agents", () => {
    for (const ua of [undefined, null, "", "curl/8.4.0", "python-requests/2.31", "Go-http-client/1.1", "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"])
      expect(looksAutomated(ua)).toBe(true);
  });
  it("does not flag real browsers", () => {
    expect(looksAutomated(CHROME_ANDROID)).toBe(false);
    expect(looksAutomated(IPHONE)).toBe(false);
  });
});

describe("isBot rule", () => {
  it("known bot is a bot even with a cookie and referrer", () => {
    expect(isBot({ userAgent: GOOGLEBOT, hasCookie: true, hasReferrer: true })).toBe(true);
  });
  it("no cookie + no referrer + automated agent is a bot", () => {
    expect(isBot({ userAgent: "curl/8.4.0", hasCookie: false, hasReferrer: false })).toBe(true);
    expect(isBot({ userAgent: "", hasCookie: false, hasReferrer: false })).toBe(true);
  });
  it("an automated-looking agent is not a bot if it has a cookie or a referrer", () => {
    expect(isBot({ userAgent: "curl/8.4.0", hasCookie: true, hasReferrer: false })).toBe(false);
    expect(isBot({ userAgent: "curl/8.4.0", hasCookie: false, hasReferrer: true })).toBe(false);
  });
  it("a real browser without a cookie or referrer is NOT a bot (someone who opened the link directly)", () => {
    expect(isBot({ userAgent: CHROME_ANDROID, hasCookie: false, hasReferrer: false })).toBe(false);
  });
});

describe("user agent parsing", () => {
  it("Android phone", () => {
    expect(parseUserAgent(CHROME_ANDROID)).toEqual({ device_type: "mobile", os: "Android", browser: "Chrome" });
  });
  it("Windows desktop", () => {
    expect(parseUserAgent(CHROME_WINDOWS)).toEqual({ device_type: "desktop", os: "Windows", browser: "Chrome" });
  });
  it("iPhone", () => {
    expect(parseUserAgent(IPHONE)).toEqual({ device_type: "mobile", os: "iOS", browser: "Safari" });
  });
  it("Android tablet has no 'Mobile' in the agent", () => {
    const ua = "Mozilla/5.0 (Linux; Android 12; SM-X200) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36";
    expect(parseUserAgent(ua).device_type).toBe("tablet");
  });
  it("empty agent gives safe defaults", () => {
    expect(parseUserAgent("")).toEqual({ device_type: "desktop", os: "other", browser: "other" });
  });
});
