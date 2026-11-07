import type { Config } from "tailwindcss";

// Tedoku design tokens (from the brand files). Change colours here and everything follows.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FBF7F4", ink: "#231B2E", muted: "#5E5870",
        purple: { DEFAULT: "#5B2A86", deep: "#3F1D5E", night: "#2A1342", dusk: "#3A1A57" },
        lav: { 1: "#EFE6F5", 2: "#F1EAF5", 3: "#F6F1F8", wash: "#F3E9F7" },
        line: { DEFAULT: "#E6DFE9", input: "#CFC6D6", hair: "#EDE6F0" },
        ok: { DEFAULT: "#0F6B4F", bg: "#E3F3EC", text: "#0B5640" },
        warn: { DEFAULT: "#5C3D00", bg: "#FFF4DC" },
        rose: { DEFAULT: "#C2415F", bg: "#FBE3EA" },
        teal: { DEFAULT: "#1F7A91", bg: "#DCF0F5", bg2: "#E8F5F9" },
        indigo: { DEFAULT: "#4B50C8", bg: "#ECEDFB" },
        admin: { bg: "#F6F2F8" },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"] },
      borderRadius: { card: "22px", btn: "16px", adm: "16px" },
      boxShadow: {
        card: "0 1px 2px rgba(35,27,46,.05), 0 8px 24px rgba(35,27,46,.06)",
        adm: "0 1px 2px rgba(35,27,46,.05), 0 6px 18px rgba(35,27,46,.05)",
      },
      backgroundImage: {
        "hero-wash": "linear-gradient(180deg,#F3E9F7 0%,#FBF7F4 45%)",
        "night-band": "linear-gradient(160deg,#5B2A86 0%,#3A1A57 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
