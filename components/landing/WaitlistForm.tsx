"use client";
import { useState, type FormEvent } from "react";

type State = "idle" | "sending" | "done" | "error";

// iPhone waitlist: one email field. It posts to /api/waitlist, which currently stores nothing
// (see the TODO in app/api/waitlist/route.ts), but the person sees a friendly confirmation.
export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const honeypot = (new FormData(e.currentTarget).get("company") as string | null) ?? "";
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, company: honeypot }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      setMessage(data.message);
      setState(data.ok ? "done" : "error");
    } catch {
      setMessage("Something went wrong. Please check your connection and try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="mt-5 rounded-btn bg-ok-bg px-4 py-4 text-left text-[15px] font-semibold text-ok-text">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 text-left" noValidate>
      <label htmlFor="waitlist-email" className="mb-1.5 block text-sm font-semibold text-ink">Email address</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="waitlist-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-describedby="waitlist-msg"
          className="h-[54px] w-full min-w-0 rounded-btn border border-line-input bg-white px-4 text-base text-ink placeholder:text-muted"
        />
        {/* Hidden trap field: people never see it, simple bots fill it in. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" disabled={state === "sending"} className="btn-primary shrink-0 disabled:opacity-60">
          {state === "sending" ? "Sending..." : "Join the waitlist"}
        </button>
      </div>
      <p id="waitlist-msg" role="status" className={`mt-2 min-h-5 text-sm ${state === "error" ? "font-semibold text-rose" : "text-muted"}`}>
        {state === "error" ? message : "We will only use your email to tell you when the iPhone version is ready."}
      </p>
    </form>
  );
}
