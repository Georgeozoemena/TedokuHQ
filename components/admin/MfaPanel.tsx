"use client";
// Two-step sign-in (authenticator app code). Two modes:
//  - the account already has a verified factor: ask for the 6-digit code (this raises the session to "aal2")
//  - no factor yet: show a QR code to set one up, then confirm with a first code
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

type Mode = "loading" | "verify" | "enroll" | "done";

export function MfaPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowser();
    const [{ data: factors }, { data: aal }] = await Promise.all([supabase.auth.mfa.listFactors(), supabase.auth.mfa.getAuthenticatorAssuranceLevel()]);
    const verified = factors?.totp?.[0];
    if (verified) {
      setFactorId(verified.id);
      setMode(aal?.currentLevel === "aal2" ? "done" : "verify");
    } else {
      setMode("enroll");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function startEnroll() {
    setError("");
    setBusy(true);
    const supabase = createSupabaseBrowser();
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Tedoku admin ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (err || !data) { setError("Could not start set-up. Is MFA enabled in Supabase?"); return; }
    setFactorId(data.id);
    setSecret(data.totp.secret);
    setQr(await QRCode.toString(data.totp.uri, { type: "svg", margin: 1, width: 180 }));
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const supabase = createSupabaseBrowser();
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr || !challenge) { setBusy(false); setError("Could not start the check. Try again."); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: code.trim() });
    setBusy(false);
    if (vErr) { setError("That code was not right. Wait for a fresh one and try again."); setCode(""); return; }
    router.replace("/admin");
    router.refresh();
  }

  if (mode === "loading") return <p className="text-sm text-muted">Loading...</p>;
  if (mode === "done") return <p className="rounded-xl bg-ok-bg p-3 text-sm text-ok-text">Two-step sign-in is on and verified for this session.</p>;

  const codeForm = (
    <form onSubmit={confirm} className="space-y-3">
      <label htmlFor="code" className="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">6-digit code</label>
      <input
        id="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className="h-[54px] w-full rounded-btn border border-line-input px-4 text-center text-xl font-bold tracking-[0.4em]"
      />
      <button type="submit" disabled={busy || code.length !== 6} className="btn-primary w-full disabled:opacity-60">Verify</button>
    </form>
  );

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-warn-bg p-3 text-sm text-warn">{error}</p>}
      {mode === "verify" && (<><p className="text-sm text-muted">Enter the code from your authenticator app to continue.</p>{codeForm}</>)}
      {mode === "enroll" && !qr && (
        <>
          <p className="text-sm text-muted">Add a second step to your sign-in with an authenticator app (Google Authenticator, 1Password, Authy).</p>
          <button type="button" onClick={startEnroll} disabled={busy} className="btn-primary w-full disabled:opacity-60">Set up two-step sign-in</button>
        </>
      )}
      {mode === "enroll" && qr && (
        <>
          <p className="text-sm text-muted">Scan this with your authenticator app, then enter the code it shows.</p>
          <div className="mx-auto w-[180px]" role="img" aria-label="QR code for your authenticator app" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="break-all text-center text-xs text-muted">Can not scan? Enter this key: <span className="font-mono font-semibold text-ink">{secret}</span></p>
          {codeForm}
        </>
      )}
    </div>
  );
}
