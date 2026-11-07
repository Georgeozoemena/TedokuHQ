import { PhoneMockup } from "./PhoneMockup";
import { AskScreen, ChatScreen, DoctorsScreen, PrivateIdScreen } from "./screens";

// Section 4: a real sequence, so the steps are numbered 1 to 4. Each step has a small phone illustration.
const STEPS = [
  { title: "Choose a private ID", text: "Pick an alias. No real name needed.", screen: "Private ID", view: <PrivateIdScreen /> },
  { title: "Ask Tedoku or track your health", text: "Get answers from doctor-reviewed sources, and keep track of your cycle, water and sleep.", screen: "Ask", view: <AskScreen /> },
  { title: "Chat with a verified doctor", text: "Choose a doctor whose credentials have been checked, and pay to start a chat.", screen: "Doctors", view: <DoctorsScreen /> },
  { title: "Mark complete and your payment is released", text: "Your payment stays held until you say the chat is done.", screen: "Chat", view: <ChatScreen complete /> },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 py-16 sm:py-20">
      <div className="container-x">
        <p className="label-xs text-purple">How it works</p>
        <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Four steps, at your own pace.</h2>
        <p className="mt-2 text-sm font-semibold text-muted">The phone screens below are illustrations, not real screenshots.</p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card flex flex-col p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple text-base font-extrabold text-white" aria-hidden="true">{i + 1}</span>
              <h3 className="mt-4 text-xl leading-snug"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
              <p className="mt-2 text-[15px] text-muted">{s.text}</p>
              <div className="mt-6 flex flex-1 items-end justify-center">
                <PhoneMockup screen={s.screen} scaleClass="[--s:0.46]" hideCaption>
                  {s.view}
                </PhoneMockup>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
