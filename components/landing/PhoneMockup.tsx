import type { ReactNode } from "react";

type Props = {
  /** Name of the screen, used in the accessible description and caption. */
  screen: string;
  /** Tailwind classes that set the size, e.g. "[--s:0.62] md:[--s:0.8]". --s is the scale: 1 = full 390x844. */
  scaleClass: string;
  children: ReactNode;
  /** Hide the "Illustration" caption (only when a nearby caption already says it). */
  hideCaption?: boolean;
};

// A phone frame built in HTML and CSS. The frame is 390 x 844 px and is scaled down with CSS
// so one design fits every screen width. The screens inside are illustrations, not real screenshots,
// and are labelled as such.
export function PhoneMockup({ screen, scaleClass, children, hideCaption = false }: Props) {
  return (
    <figure className={`m-0 ${scaleClass}`}>
      <div
        role="img"
        aria-label={`Illustration of the Tedoku ${screen} screen`}
        className="relative mx-auto"
        style={{ width: "calc(390px * var(--s))", height: "calc(844px * var(--s))" }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-[48px] border-[10px] border-purple-night bg-bg shadow-card"
          style={{ width: 390, height: 844, transform: "scale(var(--s))" }}
        >
          <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-purple-night" />
          <div className="flex h-full flex-col pt-11 text-ink">{children}</div>
        </div>
      </div>
      {!hideCaption && (
        <figcaption className="mt-3 text-center text-xs font-semibold text-muted">Illustration, not a real screenshot</figcaption>
      )}
    </figure>
  );
}
