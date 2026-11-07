import type { Metadata } from "next";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AskTedoku, ClosingBand, Escrow, ForDoctors, Identity, Promises } from "@/components/landing/Sections";
import { Faq } from "@/components/landing/Faq";
import { FAQ_ITEMS } from "@/components/landing/faq-data";
import { Footer } from "@/components/landing/Footer";
import { CookieNotice } from "@/components/landing/CookieNotice";
import { UtmCapture } from "@/components/landing/UtmCapture";
import { LandingStyles } from "@/components/landing/LandingStyles";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Search-engine FAQ data, built from the same text as the visible FAQ so they never disagree.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

// The home page. Sections follow the brief: nav, hero, promises, how it works, identity,
// payment, doctors, Ask Tedoku, FAQ, closing band, footer.
export default function HomePage() {
  return (
    <>
      <LandingStyles />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-purple">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Promises />
        <HowItWorks />
        <Identity />
        <Escrow />
        <ForDoctors />
        <AskTedoku />
        <Faq />
        <ClosingBand />
      </main>
      <Footer />
      <CookieNotice />
      <UtmCapture />
      {/* The "<" is escaped so the data can never close the script tag early. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
