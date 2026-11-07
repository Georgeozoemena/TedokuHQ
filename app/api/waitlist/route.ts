import { NextResponse } from "next/server";

// iPhone waitlist. IMPORTANT: this route stores NOTHING yet. It checks the email and replies with a friendly message.
// TODO: when you are ready to keep the list, save the email here (for example a `waitlist` table in Supabase
// or a mailing-list service), add a short note about it in app/privacy/page.tsx, and have it reviewed
// under the NDPA 2023. Until then the email is deliberately not logged or saved anywhere.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Please enter your email address." }, { status: 400 });
  }
  const { email, company } = (body ?? {}) as { email?: unknown; company?: unknown };

  // Hidden trap field: real people leave it empty. If it is filled, pretend success and do nothing.
  if (typeof company === "string" && company.trim() !== "") {
    return NextResponse.json({ ok: true, message: "Thank you. We will email you when the iPhone version is ready." });
  }

  const value = typeof email === "string" ? email.trim() : "";
  if (value.length === 0 || value.length > 254 || !EMAIL_PATTERN.test(value)) {
    return NextResponse.json({ ok: false, message: "That email address does not look right. Please check it and try again." }, { status: 400 });
  }

  // TODO: store `value` here (see the note at the top of this file).
  return NextResponse.json({ ok: true, message: "Thank you. We will email you when the iPhone version is ready." });
}
