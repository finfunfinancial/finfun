import type { MetadataRoute } from "next";
import { programs, site } from "@/lib/content";
import { posts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/programs", "/try", "/parents", "/schools", "/teachers", "/partners", "/resources", "/toolkit", "/fest", "/wellbeing", "/about", "/impact", "/blog", "/contact", "/enrol", "/gifting", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: site.url + p, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...programs.map((p) => ({ url: `${site.url}/programs/${p.slug}`, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, priority: 0.5 })),
  ];
}
