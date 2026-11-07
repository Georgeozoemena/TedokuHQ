import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/config";
import { RETENTION_MONTHS } from "@/lib/constants";
import { LegalSection, LegalShell, ReviewBox } from "@/components/landing/LegalShell";

export const metadata: Metadata = {
  title: "Privacy | Tedoku",
  description: "How Tedoku's website counts download clicks, which cookie it uses and what it never stores.",
  alternates: { canonical: "/privacy" },
};

// Plain-language privacy page for the website. The app's own privacy policy is separate (see section 1).
// Everything on this page is a DRAFT until a Nigerian data-protection lawyer has reviewed it (see the amber box).
export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy"
      updated="6 November 2026"
      intro="Tedoku is a privacy-first health app, and we try to treat this website the same way. This page explains in plain words what we measure here, and what we never keep."
    >
      <ReviewBox title="Draft: needs legal review">
        <p>
          This page is a plain-language draft. Before launch it should be reviewed by a Nigerian data-protection lawyer against the Nigeria Data Protection Act 2023 (NDPA 2023). We treat the information described below as personal data under the NDPA 2023, even though we cannot tell who you are from it.
        </p>
        <p>Points for the lawyer to check:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Whether the visitor cookie, the daily scrambled IP code and the country and device details count as personal data, and which lawful basis applies (legitimate interests, or consent).</li>
          <li>Whether a notice-only cookie banner is enough, or whether people must be able to say no before the cookie is set.</li>
          <li>Whether Tedoku must register with the Nigeria Data Protection Commission, and whether it needs a data protection officer.</li>
          <li>Sending data outside Nigeria: our hosting and database providers may run servers abroad.</li>
          <li>The {RETENTION_MONTHS}-month keeping period, and how we answer access or deletion requests for data we cannot link to a person.</li>
          <li>The optional install signal sent by the app on first launch (section 2).</li>
          <li>The minimum age of 16, and the separate rules for health data inside the app, which is a more sensitive kind of data and is not covered by this page.</li>
        </ul>
      </ReviewBox>

      <LegalSection title="1. What this page covers">
        <p>
          This page is about this website only (the page where you download Tedoku). The app has its own privacy policy, which explains what the app does with your health information. {/* PLACEHOLDER: add the link to the app privacy policy here once it exists. */}
        </p>
      </LegalSection>

      <LegalSection id="what-we-measure" title="2. What we measure">
        <p>We want to know how many people press Download, and roughly where they come from, so we can tell whether the page is doing its job. That is all.</p>
        <p className="font-bold">When you press a Download button, we count:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>That a click happened, and when.</li>
          <li>The country (and region, if your network shares it) your visit seems to come from.</li>
          <li>Your kind of device (phone, tablet or computer), your operating system (for example Android) and your browser.</li>
          <li>The website you came from, by name only (for example the site of a link you tapped), and any campaign label in the link (utm_source, utm_medium, utm_campaign).</li>
          <li>Which button you pressed (for example the top button or the bottom one).</li>
          <li>The app version you downloaded.</li>
          <li>A random visitor number from our one cookie (see section 3), so that one person pressing the button twice is not counted as two people.</li>
          <li>A scrambled code made from your internet address (see below).</li>
        </ul>
        <p className="font-bold">We do not store:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your IP address. We read it for a moment to guess your country and to stop abuse. We then mix it with a secret salt and the date and keep only the scrambled result. The result changes every day, so we cannot follow you from one day to the next with it.</li>
          <li>Your name, phone number or email address.</li>
          <li>The raw text your browser sends to describe itself (the user agent). We keep only the device, system and browser names listed above.</li>
          <li>The full address of the page you came from.</li>
        </ul>
        <p>
          <span className="font-bold">Optional install signal.</span> When it is switched on, the Tedoku app can send us one anonymous message the first time it is opened: a random install number, the app version and the type of phone system. It has no name and is not linked to any account. It lets us compare how many people open the app with how many pressed Download.
        </p>
        <p>Our website host may also keep ordinary technical server logs for security. Those are governed by the host&apos;s own terms.</p>
        <p>We use these numbers only to understand how the page performs. We do not sell them, and we do not share them with advertisers.</p>
      </LegalSection>

      <LegalSection id="cookies" title="3. Cookies">
        <p>
          The website uses one cookie that matters for tracking: <span className="font-mono font-semibold">tdk_vid</span>. It is a random number with no personal information in it. It lasts one year, belongs to Tedoku only (it is a first-party cookie), and is not used for advertising or shared with anyone.
        </p>
        <p>
          If you arrive from a link that has campaign labels, or from another website, we also keep those labels and the name of that website (not the full address) for 30 minutes in a short-lived cookie called <span className="font-mono font-semibold">tdk_utm</span>, so the click can be counted against the right campaign. It is deleted by your browser after 30 minutes.
        </p>
        <p>
          The notice on the site remembers that you dismissed it using your browser&apos;s local storage, not a cookie. You can delete cookies and site data at any time in your browser settings. If you do, you will simply get a new random number the next time you visit.
        </p>
      </LegalSection>

      <LegalSection title="4. How long we keep it">
        <p>Download records are deleted automatically after {RETENTION_MONTHS} months.</p>
      </LegalSection>

      <LegalSection title="5. Who can see it">
        <p>
          Only the Tedoku team members we have approved can open the private dashboard, and they must sign in first. The dashboard shows totals and summaries, and never shows a visitor number or any scrambled code next to a person. Our hosting and database providers store the data for us and may only use it to provide that service.
        </p>
      </LegalSection>

      <LegalSection title="6. Your choices">
        <p>
          Under the NDPA 2023 you have rights over your personal data, including the right to ask what we hold, to ask us to correct or delete it, and to object to how it is used. Because the website records do not contain your name or contact details, we may not be able to find your records. If you want to ask anything, write to us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-purple underline underline-offset-4">{CONTACT_EMAIL}</a>
          {/* PLACEHOLDER email: change CONTACT_EMAIL in lib/config.ts */}
          . You can also complain to the Nigeria Data Protection Commission.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes">
        <p>If we change what we measure, we will change this page first and update the date at the top.</p>
      </LegalSection>
    </LegalShell>
  );
}
