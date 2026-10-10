import type { Metadata } from "next";
import Img from "@/components/Img";
import EnquiryForm from "@/components/lms/EnquiryForm";
import { PageHero, SectionHead } from "@/components/Sections";

export const metadata: Metadata = {
  title: "FinFun Fest and money contests",
  description: "FinFun Fest: money quizzes, mind-map, story-writing and young-entrepreneur contests for grades 3–10. Register your interest.",
  alternates: { canonical: "/fest" },
};

// TODO(FinFun): add dates, venues or online format, age groups, prizes and rules for each contest.
const contests = [
  { title: "Money Quiz", text: "Fast rounds on needs vs wants, UPI safety, saving and investing.", img: "/a/home-page/method-quiz.webp" },
  { title: "Mind Map Challenge", text: "Map how earning, saving, spending and sharing connect.", img: "/a/home-page/method-mind-mapping.webp" },
  { title: "Money Story Contest", text: "Write a story about a goal, a choice or a money lesson.", img: "/a/home-page/method-story-writing.webp" },
  { title: "Young Entrepreneurs", text: "Plan a small stall or service: costs, price and profit.", img: "/a/sticker/01-the-entrepreneur.webp" },
];

export default function Fest() {
  return (
    <>
      <PageHero eyebrow="FinFun Fest" title={<>Compete, play and <span className="mark">win</span></>} art="/a/sticker/08-goal-reached.webp" tone="bg-yellow"
        lead="Money contests for children in grades 3 to 10 — at school, in communities and online." />

      <section className="section" aria-labelledby="c-h">
        <div className="wrap">
          <SectionHead eyebrow="Contests" title={<span id="c-h">Pick a challenge</span>}>Dates and rules for the next FinFun Fest will be announced here.</SectionHead>
          <div className="grid g4">
            {contests.map((c) => (
              <div className="card method" key={c.title}>
                <Img src={c.img} alt="" sizes="(max-width: 800px) 90vw, 280px" loading="lazy" />
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="reg-h" id="register">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <SectionHead title={<span id="reg-h">Register your interest</span>}>Parents, schools and community groups: we’ll tell you first when entries open.</SectionHead>
          <div className="portal">
            <EnquiryForm title="FinFun Fest interest" topics={["contest"]} organisation submitLabel="Keep me posted" done="You’re on the list — we’ll email you when entries open." />
          </div>
        </div>
      </section>
    </>
  );
}
