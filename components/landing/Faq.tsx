"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { FAQ_ITEMS } from "./faq-data";

// Section 9: accordion. Each question is a real <button> (Enter and Space work).
// Extra keys: Arrow Up/Down move between questions, Home and End jump to the first and last.
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = FAQ_ITEMS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowUp") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      buttons.current[next]?.focus();
    }
  }

  return (
    <section id="faq" className="scroll-mt-28 py-16 sm:py-20">
      <div className="container-x max-w-3xl">
        <p className="label-xs text-purple">FAQ</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Questions, answered.</h2>
        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="card">
                <h3 className="text-base">
                  <button
                    ref={(el) => { buttons.current[i] = el; }}
                    type="button"
                    id={`faq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 rounded-card px-5 py-4 text-left font-bold"
                  >
                    <span>{item.q}</span>
                    <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lav-1 text-xl font-bold text-purple transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                </h3>
                <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} hidden={!isOpen} className="px-5 pb-5 text-[16px] leading-relaxed text-muted">
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
