import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/config";
import { LegalSection, LegalShell, ReviewBox } from "@/components/landing/LegalShell";

export const metadata: Metadata = {
  title: "Terms | Tedoku",
  description: "The simple terms for using the Tedoku website and app.",
  alternates: { canonical: "/terms" },
};

// Short plain-language terms. DRAFT: a lawyer must review and complete this before launch.
export default function TermsPage() {
  return (
    <LegalShell
      title="Terms"
      updated="6 November 2026"
      intro="These are the simple terms for using this website and the Tedoku app. We have kept them short and plain."
    >
      <ReviewBox title="Draft: needs legal review">
        <p>This is a plain-language draft, not final legal terms. Before launch, a Nigerian lawyer should review and complete it (including payments and escrow, the doctors&apos; responsibilities, liability, the governing law and how disputes are handled).</p>
      </ReviewBox>

      <LegalSection title="1. What Tedoku is">
        <p>Tedoku is a privacy-first health app. It offers anonymous health tools, an assistant that answers only from doctor-reviewed sources, and paid chats with verified doctors.</p>
      </LegalSection>

      <LegalSection title="2. Not emergency care, not a diagnosis">
        <p>Tedoku does not replace emergency care or your own doctor, and it does not give diagnoses. In an emergency call 112.</p>
      </LegalSection>

      <LegalSection title="3. Who can use it">
        <p>You must be 16 or older to use Tedoku.</p>
      </LegalSection>

      <LegalSection title="4. Installing outside Google Play">
        <p>
          For now Tedoku is installed from a file (an APK) on this website. Android may show a warning for apps installed outside Google Play. Only install Tedoku from the official page, and compare the file&apos;s SHA-256 checksum with the one shown in the install steps.
        </p>
      </LegalSection>

      <LegalSection title="5. Payments">
        <p>
          Paid chats use escrow: your payment is held until you mark the chat complete, and it is refunded automatically if the doctor does not reply. The full payment rules are shown in the app. {/* PLACEHOLDER: add exact payment, refund and fee terms after legal review. */}
        </p>
      </LegalSection>

      <LegalSection title="6. Using Tedoku fairly">
        <p>Please be respectful to doctors and other people, and do not misuse the app or try to get around its safety and payment features.</p>
      </LegalSection>

      <LegalSection title="7. Changes and questions">
        <p>
          We may update these terms and will change the date at the top when we do. Questions? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-purple underline underline-offset-4">{CONTACT_EMAIL}</a>
          {/* PLACEHOLDER email: change CONTACT_EMAIL in lib/config.ts */}
          . {/* PLACEHOLDER: governing law (Nigeria) and company details to be added by a lawyer. */}
        </p>
      </LegalSection>
    </LegalShell>
  );
}
