import { DownloadCta } from "./DownloadCta";
import { PhoneMockup } from "./PhoneMockup";
import { HomeScreen } from "./screens";

// Section 2: centred hero. Headline, short text, the main download button and a phone illustration.
export function Hero() {
  return (
    <section className="bg-hero-wash">
      <div className="container-x flex flex-col items-center pb-14 pt-10 text-center sm:pt-16">
        <p className="label-xs text-purple">A privacy-first health app for Nigeria</p>
        <h1 className="mt-3 max-w-3xl text-[40px] leading-[1.05] sm:text-6xl">A safe space for your body.</h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Track your cycle, water and sleep. Ask anything. Talk to verified doctors without giving up your identity.
        </p>
        <div id="get" className="mt-8 w-full scroll-mt-32">
          <DownloadCta loc="hero" extras />
        </div>
        <div className="float-in mt-12">
          <PhoneMockup screen="Home" scaleClass="[--s:0.66] sm:[--s:0.8]">
            <HomeScreen />
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}
