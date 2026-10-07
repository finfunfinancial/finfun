"use client";

import { useEffect, useRef } from "react";
import { spotlight, testimonials, type Testimonial } from "@/lib/content";
import Img from "./Img";

const SPEED = 40; // px per second, drifting right

export default function Testimonials({ groups }: { groups?: Testimonial["group"][] }) {
  // the spotlight quote is shown on its own, so never repeat it in the slider
  const list = testimonials.filter((t) => t.name !== spotlight.name && (!groups || groups.includes(t.group)));
  const ref = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const hovering = useRef(false);

  // Auto-scroll: the list is rendered twice, so jumping by one copy's width when we reach the start is invisible.
  useEffect(() => {
    const el = ref.current;
    if (!el || list.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("auto");
    const half = () => (el.children[list.length] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
    let pos = (el.scrollLeft = half());
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      if (hovering.current || now < pausedUntil.current) {
        pos = el.scrollLeft; // pick up wherever the user or the arrows left it
      } else {
        pos -= SPEED * dt;
        if (pos <= 0) pos += half();
        if (pos >= 2 * half()) pos -= half();
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [list.length]);

  const move = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    pausedUntil.current = performance.now() + 1500;
    const card = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 400) + 24), behavior: "smooth" });
  };
  const hold = (on: boolean) => () => {
    hovering.current = on;
  };

  return (
    <div className="slider">
      <div
        className="slides"
        ref={ref}
        tabIndex={0}
        role="region"
        aria-label="Testimonials, scroll sideways for more"
        onPointerEnter={hold(true)}
        onPointerLeave={hold(false)}
        onFocus={hold(true)}
        onBlur={hold(false)}
        onTouchStart={hold(true)}
        onTouchEnd={() => {
          hovering.current = false;
          pausedUntil.current = performance.now() + 3000;
        }}
      >
        {[...list, ...(list.length > 1 ? list : [])].map((t, i) => (
          <figure className="card quote" key={i} aria-hidden={i >= list.length || undefined}>
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <Img src={t.avatar} alt="" sizes="58px" loading="lazy" />
              <div>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      {list.length > 1 && (
        <div className="slider-ctrl">
          <button className="round-btn" onClick={() => move(-1)} aria-label="Previous testimonial">←</button>
          <button className="round-btn" onClick={() => move(1)} aria-label="Next testimonial">→</button>
        </div>
      )}
    </div>
  );
}
