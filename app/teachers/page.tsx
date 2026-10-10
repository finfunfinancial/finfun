import type { Metadata } from "next";
import Img from "@/components/Img";
import EnquiryForm from "@/components/lms/EnquiryForm";
import { JoinBanner, PageHero, Rubric, SectionCta, SectionHead } from "@/components/Sections";
import Testimonials from "@/components/Testimonials";
import { activities, impact } from "@/lib/content";

export const metadata: Metadata = {
  title: "Teacher training and classroom resources",
  description: "FinFun trains teachers to run game-based money lessons for grades 3–10, with ready-to-run modules, classroom kits, rubric evaluation and personal finance training for staff.",
  alternates: { canonical: "/teachers" },
};

const perks = [
  { title: "Ready-to-run modules", text: "Lesson plans timed minute by minute, so any teacher can lead a FinFun class.", icon: "/a/icons/journey-teacher-training-modules.webp" },
  { title: "Classroom kits", text: "Money cards, board games and story sheets for every session.", icon: "/a/icons/journey-learning-kits.webp" },
  { title: "Rubric evaluation", text: "Assess four money skills at three levels, with a class report.", icon: "/a/icons/journey-rubric-evaluation.webp" },
  { title: "Personal finance for you", text: "Money skills for teachers themselves — saving, insurance, investing.", icon: "/a/icons/journey-personal-finance-training.webp" },
  { title: "Local languages", text: "A vernacular version for partner schools.", icon: "/a/icons/journey-vernacular-version.webp" },
  { title: "Hands-on workshops", text: "Live sessions by FinFun trainers alongside your classes.", icon: "/a/icons/journey-hands-on-workshops.webp" },
];

// TODO(FinFun): confirm the train-the-trainer stages, duration and certification.
const trainer = [
  { title: "Learn", text: "Training on the FinFun method, the modules and the rubric." },
  { title: "Practise", text: "Run sessions with a FinFun trainer alongside you." },
  { title: "Lead", text: "Teach your own classes and assess children with the rubric." },
  { title: "Train others", text: "Become a FinFun trainer for other teachers and facilitators." },
];

const teachersTrained = impact.find((s) => s.label === "Teachers trained")?.value;

export default function Teachers() {
  return (
    <>
      <PageHero eyebrow="For teachers" title={<>Teach money with <span className="mark">confidence</span></>} art="/a/sticker/07-money-coach.webp" tone="bg-green"
        lead={`Training, ready-to-run lessons and classroom kits so any teacher can make money lessons fun.${teachersTrained ? ` ${teachersTrained} teachers trained so far.` : ""}`}>
        <div className="btn-row">
          <a className="btn btn-blue btn-lg" href="#training">Request training</a>
          <a className="btn btn-white btn-lg" href="#resources">Classroom resources</a>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="get-h">
        <div className="wrap">
          <SectionHead eyebrow="What teachers get" title={<span id="get-h">Everything you need to run FinFun</span>} />
          <div className="grid g3">
            {perks.map((p) => (
              <div className="card icon-card" key={p.title}>
                <Img src={p.icon} alt="" sizes="120px" loading="lazy" />
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="ttt-h" id="trainer">
        <div className="wrap">
          <SectionHead eyebrow="Train the trainer" title={<span id="ttt-h">From teacher to FinFun trainer</span>}>
            A pathway for teachers, NGO facilitators and volunteers to bring FinFun to more children.
          </SectionHead>
          <div className="steps">
            {trainer.map((s, i) => (
              <div className="card step" key={s.title}>
                <span className="step-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="res-h" id="resources">
        <div className="wrap">
          <SectionHead eyebrow="Classroom resources" title={<span id="res-h">Gamified activities for your class</span>} />
          <div className="grid g4">
            {activities.map((a) => (
              <div className="card topic-card" key={a.title}>
                <Img src={a.img} alt="" sizes="96px" loading="lazy" />
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              </div>
            ))}
          </div>
          <SectionCta links={[{ label: "See the FinFun Toolkit", href: "/toolkit" }]} />
        </div>
      </section>

      <Rubric />

      <section className="section bg-white" aria-labelledby="tt-h">
        <div className="wrap">
          <SectionHead eyebrow="From teachers" title={<span id="tt-h">What teachers say</span>} />
          <Testimonials groups={["teacher", "school"]} />
        </div>
      </section>

      <section className="section" aria-labelledby="train-h" id="training">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <SectionHead title={<span id="train-h">Request teacher training</span>}>Tell us about your school or group and we’ll plan training around your timetable.</SectionHead>
          <div className="portal">
            <EnquiryForm title="Teacher training enquiry" topics={["teacher"]} organisation submitLabel="Request training" />
          </div>
        </div>
      </section>
      <JoinBanner audience="schools" />
    </>
  );
}
