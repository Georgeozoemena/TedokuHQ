import type { Metadata } from "next";

// Keep every admin page out of search engines (robots.txt also blocks /admin).
export const metadata: Metadata = {
  title: "Tedoku",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-admin-bg">{children}</div>;
}
