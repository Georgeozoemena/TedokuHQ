// Illustrated app screens used inside the phone mockups. They are pictures made of HTML, not real
// app screenshots. All names, numbers and messages are made-up examples (PLACEHOLDER content).
// Each screen is laid out for the 370 x 824 area inside the 390 x 844 phone frame.
import type { ReactNode } from "react";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pb-2 text-[13px] font-bold">
      <span>9:41</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-2.5 w-4 rounded-sm bg-ink" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink" />
      </span>
    </div>
  );
}

function TabBar({ active }: { active: "Home" | "Ask" | "Doctors" | "Chats" }) {
  return (
    <div className="mt-auto flex justify-around border-t border-line-hair bg-white px-2 pb-6 pt-3">
      {(["Home", "Ask", "Doctors", "Chats"] as const).map((t) => (
        <div key={t} className="flex flex-col items-center gap-1">
          <span className={`h-2 w-8 rounded-full ${t === active ? "bg-purple" : "bg-line"}`} />
          <span className={`text-[12px] font-bold ${t === active ? "text-purple" : "text-muted"}`}>{t}</span>
        </div>
      ))}
    </div>
  );
}

// A circular progress ring drawn as SVG. `pct` is 0 to 100.
function Ring({ pct, color, track, children }: { pct: number; color: string; track: string; children: ReactNode }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[104px] w-[104px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">{children}</div>
    </div>
  );
}

export function HomeScreen() {
  return (
    <>
      <StatusBar />
      <div className="px-5 pt-3">
        <p className="text-[13px] font-semibold text-muted">Your private ID</p>
        <p className="text-[26px] font-extrabold leading-tight tracking-tight">Hello, Luna-4821</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 px-5">
        <div className="rounded-[22px] bg-white p-4 shadow-card">
          <p className="label-xs text-rose">Cycle</p>
          <div className="mt-3 flex justify-center">
            <Ring pct={42} color="#C2415F" track="#FBE3EA">
              <span className="text-[26px] font-extrabold">12</span>
              <span className="text-[11px] font-semibold text-muted">day</span>
            </Ring>
          </div>
          <p className="mt-3 text-center text-[12px] font-semibold text-muted">Example data</p>
        </div>
        <div className="rounded-[22px] bg-white p-4 shadow-card">
          <p className="label-xs text-teal">Water</p>
          <div className="mt-3 flex justify-center">
            <Ring pct={60} color="#1F7A91" track="#DCF0F5">
              <span className="text-[22px] font-extrabold">1.2 L</span>
              <span className="text-[11px] font-semibold text-muted">of 2 L</span>
            </Ring>
          </div>
          <p className="mt-3 text-center text-[12px] font-semibold text-muted">Example data</p>
        </div>
      </div>
      <div className="mx-5 mt-3 rounded-[22px] bg-indigo-bg p-4">
        <div className="flex items-center justify-between">
          <p className="label-xs text-indigo">Sleep</p>
          <p className="text-[13px] font-bold text-indigo">Last night</p>
        </div>
        <p className="mt-1 text-[28px] font-extrabold text-ink">7 h 20 min</p>
        <div className="mt-3 flex h-12 items-end gap-1.5" aria-hidden="true">
          {[40, 62, 48, 80, 70, 90, 58].map((h, i) => (
            <span key={i} className="flex-1 rounded-t-md bg-indigo" style={{ height: `${h}%`, opacity: 0.35 + i * 0.1 }} />
          ))}
        </div>
      </div>
      <div className="mx-5 mt-3 rounded-[22px] bg-lav-1 p-4">
        <p className="text-[15px] font-extrabold">Ask Tedoku</p>
        <p className="text-[13px] text-muted">Answers from doctor-reviewed sources.</p>
      </div>
      <TabBar active="Home" />
    </>
  );
}

export function PrivateIdScreen() {
  return (
    <>
      <StatusBar />
      <div className="px-6 pt-6">
        <p className="label-xs text-purple">Step 1</p>
        <p className="mt-2 text-[28px] font-extrabold leading-tight">Choose your private ID</p>
        <p className="mt-2 text-[15px] text-muted">This is what doctors see. An alias, never your name.</p>
      </div>
      <div className="mx-6 mt-8 rounded-[22px] bg-lav-1 p-6 text-center">
        <p className="label-xs text-muted">Your private ID</p>
        <p className="mt-2 text-[36px] font-extrabold tracking-tight text-purple-deep">Luna-4821</p>
        <span className="mt-4 inline-flex h-[38px] items-center rounded-full bg-white px-4 text-[14px] font-bold text-purple">Shuffle</span>
      </div>
      <ul className="mx-6 mt-6 space-y-3 text-[15px]">
        {["No real name needed", "You choose if a doctor ever sees your name", "Never sold, never used for ads"].map((t) => (
          <li key={t} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ok-bg text-[13px] font-extrabold text-ok">&#10003;</span>
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-auto px-6 pb-8">
        <div className="flex h-[54px] items-center justify-center rounded-btn bg-purple text-[16px] font-bold text-white">Use this ID</div>
      </div>
    </>
  );
}

export function AskScreen() {
  return (
    <>
      <StatusBar />
      <div className="px-5 pt-3">
        <p className="text-[26px] font-extrabold">Ask Tedoku</p>
        <span className="mt-2 inline-flex h-[38px] items-center rounded-full bg-ok-bg px-4 text-[13px] font-bold text-ok-text">Doctor-reviewed sources only</span>
      </div>
      <div className="mt-5 space-y-3 px-5">
        <div className="ml-10 rounded-[20px] rounded-br-md bg-purple p-4 text-[15px] font-medium text-white">What helps with staying hydrated in hot weather?</div>
        <div className="mr-6 rounded-[20px] rounded-bl-md bg-white p-4 text-[15px] shadow-card">
          <p>Needs differ from person to person. Here is what doctor-reviewed sources say about drinking enough through the day.</p>
          <p className="mt-3 text-[12px] font-bold text-teal">Source: doctor-reviewed article</p>
        </div>
        <div className="rounded-[18px] bg-warn-bg p-3 text-[13px] font-semibold text-warn">Tedoku does not diagnose. If this is urgent, call 112.</div>
      </div>
      <div className="mt-auto px-5 pb-8">
        <div className="flex h-[54px] items-center rounded-btn border border-line-input bg-white px-4 text-[15px] text-muted">Ask a health question</div>
      </div>
    </>
  );
}

export function DoctorsScreen() {
  const docs = [
    { initial: "A", name: "Sample doctor A", spec: "General practice" },
    { initial: "B", name: "Sample doctor B", spec: "Women's health" },
    { initial: "C", name: "Sample doctor C", spec: "Mental wellbeing" },
  ];
  return (
    <>
      <StatusBar />
      <div className="px-5 pt-3">
        <p className="text-[26px] font-extrabold">Verified doctors</p>
        <p className="mt-1 text-[14px] text-muted">Every credential is checked.</p>
        <div className="mt-3 flex gap-2">
          <span className="inline-flex h-[38px] items-center rounded-full bg-purple px-4 text-[13px] font-bold text-white">All</span>
          <span className="inline-flex h-[38px] items-center rounded-full bg-lav-1 px-4 text-[13px] font-bold text-purple">General</span>
          <span className="inline-flex h-[38px] items-center rounded-full bg-lav-1 px-4 text-[13px] font-bold text-purple">Women</span>
        </div>
      </div>
      <div className="mt-4 space-y-3 px-5">
        {docs.map((d) => (
          <div key={d.name} className="flex items-center gap-3 rounded-[22px] bg-white p-4 shadow-card">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lav-1 text-[18px] font-extrabold text-purple">{d.initial}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold">{d.name}</p>
              <p className="text-[13px] text-muted">{d.spec}</p>
              <p className="text-[12px] font-semibold text-muted">Price set by the doctor</p>
            </div>
            <span className="rounded-full bg-ok-bg px-2.5 py-1 text-[11px] font-bold text-ok-text">Verified</span>
          </div>
        ))}
      </div>
      <TabBar active="Doctors" />
    </>
  );
}

// `complete` = true shows the last step: the "Mark complete" button that releases payment.
export function ChatScreen({ complete = false }: { complete?: boolean }) {
  return (
    <>
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-3">
        <div>
          <p className="text-[18px] font-extrabold">Sample doctor A</p>
          <p className="text-[12px] font-bold text-ok-text">Verified doctor</p>
        </div>
        <span className="rounded-full bg-lav-1 px-3 py-1.5 text-[12px] font-bold text-purple">You: Luna-4821</span>
      </div>
      <div className="mx-5 mt-3 rounded-[18px] bg-teal-bg2 p-3 text-[13px] font-semibold text-teal">Payment is held safely until you mark this chat complete.</div>
      <div className="mt-4 space-y-3 px-5">
        <div className="mr-10 rounded-[20px] rounded-bl-md bg-white p-4 text-[15px] shadow-card">Hello Luna-4821. What would you like to talk about today?</div>
        <div className="ml-10 rounded-[20px] rounded-br-md bg-purple p-4 text-[15px] font-medium text-white">I would like to ask about my sleep.</div>
        <div className="mr-10 rounded-[20px] rounded-bl-md bg-white p-4 text-[15px] shadow-card">Of course. Tell me a little about your usual evening.</div>
      </div>
      <div className="mt-auto px-5 pb-8">
        {complete ? (
          <>
            <div className="flex h-[54px] items-center justify-center rounded-btn bg-purple text-[16px] font-bold text-white">Mark complete</div>
            <p className="mt-2 text-center text-[13px] font-semibold text-ok-text">Your payment is then released to the doctor.</p>
          </>
        ) : (
          <div className="flex h-[54px] items-center rounded-btn border border-line-input bg-white px-4 text-[15px] text-muted">Write a message</div>
        )}
      </div>
    </>
  );
}
