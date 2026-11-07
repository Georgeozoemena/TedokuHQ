import type { Metadata, Viewport } from "next";
import "./globals.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: "Tedoku: a safe space for your body",
  description: "Private health tools, doctor-reviewed answers and paid chats with verified doctors. Your identity stays yours. Download Tedoku for Android.",
  icons: { icon: "/icon.svg" },
  openGraph: { title: "Tedoku: a safe space for your body", description: "Care within reach. Anonymous health tools and verified doctors for Nigeria.", type: "website", locale: "en_NG", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image", title: "Tedoku", description: "Care within reach.", images: ["/opengraph-image"] },
};
export const viewport: Viewport = { themeColor: "#5B2A86", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
