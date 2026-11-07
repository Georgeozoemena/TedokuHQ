// The text sections of the home page, in page order. All are plain server components.
// To change wording, edit the text here. Keep the voice calm, warm and plain.
import { DownloadCta } from "./DownloadCta";
import { BadgeCheckIcon, KeyIcon, LockIcon } from "./icons";

// Section 3: three promises
export function Promises() {
  const items = [
    { icon: <LockIcon />, title: "Private by design", text: "An alias, never your name. You choose a private ID, and that is who doctors see." },
    { icon: <BadgeCheckIcon />, title: "Verified doctors only", text: "Every credential is checked before a doctor can take a chat." },
    { icon: <KeyIcon />, title: "Your data stays yours", text: "Never sold, never used for ads." },
  ];
  return (
    <section id="privacy" className="scroll-mt-28 py-16 sm:py-20">
      <div className="container-x">
        <p className="label-xs text-purple">Our promises</p>
        <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Care that respects your privacy.</h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <li key={it.title} className="card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lav-1 text-purple">{it.icon}</span>
              <h3 className="mt-5 text-xl">{it.title}</h3>
              <p className="mt-2 text-[15px] text-muted">{it.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Section 5: private ID and the choice to reveal your name
export function Identity() {
  return (
    <section className="bg-lav-3 py-16 sm:py-20">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="label-xs text-purple">Your identity, your choice</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">An alias, never your name.</h2>
          <p className="mt-4 text-lg text-muted">
            When you join, you choose a private ID. Doctors only see that ID. If you want a doctor to know your name, you can reveal it to that doctor, and only if you choose. You decide for how long.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Example of what a doctor sees (illustration)" role="group">
          <div className="card p-5">
            <p className="label-xs text-muted">By default</p>
            <p className="mt-3 text-sm text-muted">The doctor sees</p>
            <p className="text-2xl font-extrabold text-purple-deep">Luna-4821</p>
            <p className="mt-3 text-sm text-muted">Nothing else about who you are.</p>
          </div>
          <div className="card p-5">
            <p className="label-xs text-muted">Only if you choose</p>
            <p className="mt-3 text-sm text-muted">You can reveal</p>
            <p className="text-2xl font-extrabold text-purple-deep">Your name</p>
            <p className="mt-3 text-sm text-muted">To one doctor, for as long as you choose.</p>
          </div>
          <p className="text-xs font-semibold text-muted sm:col-span-2">Example cards. Illustration only.</p>
        </div>
      </div>
    </section>
  );
}

// Section 6: escrow in three steps, how to pay, automatic refund
export function Escrow() {
  const steps = [
    { n: 1, title: "You pay", text: "You pay to start the chat." },
    { n: 2, title: "Held safely", text: "Your payment is held until the chat is complete." },
    { n: 3, title: "Released", text: "You mark the chat complete, and the doctor is paid." },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <p className="label-xs text-purple">Payment</p>
        <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Your money is safe until the chat ends.</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="card p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-base font-extrabold text-white" aria-hidden="true">{s.n}</span>
              <h3 className="mt-4 text-xl">{s.title}</h3>
              <p className="mt-2 text-[15px] text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-card bg-teal-bg2 p-6">
            <h3 className="text-xl text-ink">Pay the way that suits you</h3>
            <p className="mt-2 text-[15px] text-ink">In naira by card, bank transfer or USSD. Or with USDC on Base.</p>
          </div>
          <div className="rounded-card bg-ok-bg p-6">
            <h3 className="text-xl text-ink">Automatic refund</h3>
            <p className="mt-2 text-[15px] text-ink">If the doctor does not reply, you are refunded automatically.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 7: band for doctors
export function ForDoctors() {
  const steps = ["Get verified", "Set your price and hours", "Get paid to your bank or wallet"];
  return (
    <section id="doctors" className="scroll-mt-28 py-16 sm:py-20">
      <div className="container-x">
        <div className="rounded-card bg-lav-1 p-6 sm:p-10">
          <p className="label-xs text-purple">For doctors</p>
          <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Are you a doctor? Help people who want privacy.</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple text-sm font-extrabold text-white" aria-hidden="true">{i + 1}</span>
                <span className="font-bold">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <DownloadCta loc="doctors" />
            <p className="text-[15px] text-muted">Doctors apply inside the app.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 8: Ask Tedoku
export function AskTedoku() {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="container-x">
        <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="label-xs text-purple">Ask Tedoku</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Ask anything. Get answers you can trust.</h2>
            <p className="mt-4 text-lg text-muted">
              Ask Tedoku answers only from doctor-reviewed sources. It never diagnoses, and it does not replace a doctor.
            </p>
          </div>
          <div className="rounded-card bg-warn-bg p-6">
            <p className="label-xs text-warn">If it is urgent</p>
            <p className="mt-2 text-lg font-bold text-warn">When a situation sounds urgent, Tedoku shows emergency help first. In Nigeria, call 112.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 10: closing band (night gradient)
export function ClosingBand() {
  return (
    <section className="bg-night-band py-16 text-center text-white sm:py-24">
      <div className="container-x flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl">Care within reach.</h2>
        <p className="mt-4 max-w-md text-lg text-white/85">Download Tedoku for Android and start with a private ID.</p>
        <div className="mt-8">
          <DownloadCta loc="closing" tone="light" />
        </div>
        <p className="mt-4 text-sm text-white/80">Android only for now. iPhone coming soon.</p>
      </div>
    </section>
  );
}
