import type { Metadata } from "next";
import Link from "next/link";
import Img from "@/components/Img";
import PostCard from "@/components/PostCard";
import { PageHero, SectionCta, SectionHead } from "@/components/Sections";
import { activities } from "@/lib/content";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Resources: toolkit, games, activities and guides",
  description: "FinFun resources for children, parents and teachers: the FinFun Toolkit, money games, learning activities, contests, well-being support and money guides.",
  alternates: { canonical: "/resources" },
};

const hubs = [
  { title: "Free trial", text: "Play a money game and quiz now, or book a demo class.", href: "/try", img: "/a/sticker/05-rupi-approves.webp" },
  { title: "FinFun Toolkit", text: "Lucky Ledger 2.0, board and card games, journals and activity sheets.", href: "/toolkit", img: "/a/sticker/12-money-fun.webp" },
  { title: "FinFun Fest & contests", text: "Quizzes, mind maps, stories and stalls — compete and win.", href: "/fest", img: "/a/sticker/08-goal-reached.webp" },
  { title: "For parents", text: "Talk about money at home and support your child’s learning.", href: "/parents#assist", img: "/a/sticker/07-family-budget.webp" },
  { title: "For teachers", text: "Training, classroom resources and the train-the-trainer path.", href: "/teachers", img: "/a/sticker/07-money-coach.webp" },
  { title: "Well-being", text: "Money worries, healthy habits and where to get help.", href: "/wellbeing", img: "/a/sticker/06-rupi-thinks.webp" },
  { title: "Gifting", text: "Give a child the gift of money skills.", href: "/gifting", img: "/a/sticker/10-share-give.webp" },
  { title: "Blog", text: "Money tips children and parents actually read.", href: "/blog", img: "/a/sticker/09-scam-alert.webp" },
];

export default function Resources() {
  return (
    <>
      <PageHero eyebrow="Resources" title={<>Learn, play and <span className="mark">grow</span></>} art="/a/sticker/04-goal-set.webp" tone="bg-yellow"
        lead="Games, activities and guides for children, parents and teachers." />

      <section className="section" aria-label="Resource sections">
        <div className="wrap">
          <div className="grid g4">
            {hubs.map((h) => (
              <Link className="card topic-card resource-card" key={h.title} href={h.href}>
                <Img src={h.img} alt="" sizes="96px" loading="lazy" />
                <div>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="act-h" id="activities">
        <div className="wrap">
          <SectionHead eyebrow="Gamified learning" title={<span id="act-h">Activities that make money click</span>}>
            Finance journals, investing games, mind maps, entrepreneurship, theatre, quizzes and story writing.
          </SectionHead>
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
          <SectionCta links={[{ label: "Try a free lesson", href: "/try" }, { label: "See courses", href: "/programs", tone: "white" }]} />
        </div>
      </section>

      <section className="section" aria-labelledby="blog-h">
        <div className="wrap">
          <SectionHead eyebrow="From the blog" title={<span id="blog-h">Latest money guides</span>} />
          <div className="grid g3">
            {posts.slice(0, 3).map((p) => <PostCard key={p.slug} p={p} />)}
          </div>
          <SectionCta links={[{ label: "Read all articles", href: "/blog", tone: "white" }]} />
        </div>
      </section>
    </>
  );
}
