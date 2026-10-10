import type { Metadata } from "next";
import EnquiryForm from "@/components/lms/EnquiryForm";
import SampleQuiz from "@/components/SampleQuiz";
import { JoinBanner, JoinSteps, PageHero, SectionCta, SectionHead } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Try FinFun free",
  description: "Play a free FinFun money game and quiz right now, or book a free live demo class for your child (grades 3–10).",
  alternates: { canonical: "/try" },
};

// Step 2 of the journey: try before choosing a program — play now, or book a live demo class.
export default function Try() {
  return (
    <>
      <PageHero eyebrow="Free trial" title={<>Try FinFun <span className="mark">free</span></>} art="/a/sticker/05-rupi-approves.webp" tone="bg-sky"
        lead="Play a money game and a quick quiz right now — no sign-up — or book a free live demo class with a FinFun trainer." />
      <section className="section tight">
        <div className="wrap"><JoinSteps current={1} /></div>
      </section>

      <section className="section" aria-labelledby="play-h">
        <div className="wrap">
          <SectionHead eyebrow="Option 1 · Play now" title={<span id="play-h">Pocket Money Manager</span>}>
            Five days, ₹500 of pocket money and five choices. Spend wisely and see your report card. Best for grades 6–7.
          </SectionHead>
          <div className="game-frame card">
            <iframe src="/games/pocket-money/index.html" title="Pocket Money Manager — a FinFun money game" loading="lazy" />
          </div>
          <p className="center fine"><a href="/games/pocket-money/index.html" target="_blank" rel="noreferrer">Open the game full screen</a></p>
          <div style={{ maxWidth: 720, margin: "32px auto 0" }}>
            <SampleQuiz />
          </div>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="demo-h" id="demo">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <SectionHead left eyebrow="Option 2 · Live" title={<span id="demo-h">Book a free demo class</span>}>
              Your child joins a short live session with a FinFun trainer. You see how classes work, then choose the program that fits.
            </SectionHead>
            <ul className="ticks">
              <li>Free, no payment details needed</li>
              <li>We’ll call or WhatsApp you to fix a time</li>
              <li>For grades 3 to 10</li>
            </ul>
            <SectionCta links={[{ label: "See courses & prices", href: "/programs", tone: "white" }]} />
          </div>
          <div className="portal">
            <EnquiryForm title="Book a free demo class" topics={["trial"]} grade preferredTime submitLabel="Book my free demo class"
              done="Your demo class request is in — we’ll call or WhatsApp you within one working day to fix a time." />
          </div>
        </div>
      </section>
      <JoinBanner audience="parents" title="Ready for the full program?" text="Pick your child’s course, choose a class time and pay securely." />
    </>
  );
}
