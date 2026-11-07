import { ImageResponse } from "next/og";

// Purple share image (1200x630) for link previews. Built with the system's built-in font, so no
// font file is downloaded. Colours are the Tedoku brand purple gradient.
export const alt = "Tedoku: a safe space for your body";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, color: "#FFFFFF", background: "linear-gradient(160deg,#5B2A86 0%,#3A1A57 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="84" height="84" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#FFFFFF" />
            <path d="M16 6.5c0 0-6.5 7.1-6.5 11.6a6.5 6.5 0 0 0 13 0C22.5 13.6 16 6.5 16 6.5z" fill="#5B2A86" />
          </svg>
          <div style={{ display: "flex", marginLeft: 24, fontSize: 52, fontWeight: 800, letterSpacing: "0.18em" }}>TEDOKU</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>A safe space for your body.</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 36, color: "#EFE6F5" }}>Private health tools and verified doctors, for Nigeria.</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#EFE6F5" }}>Download for Android</div>
      </div>
    ),
    { ...size },
  );
}
