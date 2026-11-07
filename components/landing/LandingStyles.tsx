// Small inline stylesheet (kept inline so it is part of the first paint, no extra request).
// The float-in animation for the hero phone. globals.css already switches animations off
// for people who ask their device for reduced motion, and we also guard it here.
export function LandingStyles() {
  return (
    <style>{`
      @keyframes tdk-float-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      .float-in { animation: tdk-float-in .8s cubic-bezier(.2,.7,.2,1) both; }
      @media (prefers-reduced-motion: reduce) { .float-in { animation: none; } }
    `}</style>
  );
}
