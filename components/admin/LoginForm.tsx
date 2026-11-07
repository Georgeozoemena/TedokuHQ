"use client";
// Sign-in options: email magic link (sent by our server after it checks the allowlist) or Google.
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm({ initialMessage }: { initialMessage?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState(initialMessage ?? "");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/admin/login/magic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error("bad response");
      setState("sent"); // always the same answer, so nobody can use this form to learn which emails are allowed
    } catch {
      setState("error");
      setMessage("That did not work. Check the email address and try again.");
    }
  }

  async function google() {
    setMessage("");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    if (error) {
      setState("error");
      setMessage("Google sign-in is not available right now.");
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-xl bg-ok-bg p-4 text-sm text-ok-text">
        If that address can sign in, a link is on its way. Open it in this same browser. It works once and expires soon.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && <p role="alert" className="rounded-xl bg-warn-bg p-3 text-sm text-warn">{message}</p>}
      <form onSubmit={sendLink} className="space-y-3">
        <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted" htmlFor="email">Email</label>
        <input
          id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="h-[54px] w-full rounded-btn border border-line-input px-4 text-base text-ink"
        />
        <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-60">
          {state === "sending" ? "Sending..." : "Email me a sign-in link"}
        </button>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <button type="button" onClick={google} className="inline-flex h-[54px] w-full items-center justify-center rounded-btn border border-line-input bg-white text-base font-bold text-ink hover:bg-lav-3">
        Continue with Google
      </button>
    </div>
  );
}
