import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/Img";
import { JoinBanner, JsonLd } from "@/components/Sections";
import { site } from "@/lib/content";
import { fmtDate, getPost, posts } from "@/lib/posts";

export const dynamicParams = false;
export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", images: [p.cover], publishedTime: p.date },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const url = `${site.url}/blog/${p.slug}`;
  const share = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${p.title} ${url}`)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, datePublished: p.date, image: site.url + p.cover, publisher: { "@type": "Organization", name: "FinFun" } }} />
      <article className="section">
        <div className="wrap article">
          <p>
            <Link href="/blog" className="link-arrow">← All articles</Link>
          </p>
          <span className="chip">{p.category}</span> <span className="muted">· {fmtDate(p.date)}</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginTop: 16 }}>{p.title}</h1>
          <p className="muted" style={{ fontSize: "1.2rem" }}>{p.excerpt}</p>
          <Img className="cover" src={p.cover} alt="" priority sizes="(max-width: 800px) 95vw, 740px" />
          {p.body.map((b, i) => (
            <div key={i}>
              {b.h && <h2>{b.h}</h2>}
              {b.p && <p>{b.p}</p>}
              {b.list && (
                <ul>
                  {b.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="share">
            <strong>Share:</strong>
            {share.map((s) => (
              <a key={s.label} className="btn btn-white btn-sm" href={s.href} target="_blank" rel="noopener" data-track="share_click">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </article>
      <JoinBanner audience="parents" title="Want your teen to learn this properly?" text="FinFun turns money lessons like this into games and challenges. Enroll in minutes." />
    </>
  );
}
