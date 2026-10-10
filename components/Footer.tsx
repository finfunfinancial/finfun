import Link from "next/link";
import { site } from "@/lib/content";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="stack">
            <Logo />
            <p>Gamified money skills for grades 3 to 10. {site.tagline}.</p>
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <br />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            </p>
          </div>
          <div>
            <h2>Get started</h2>
            <ul>
              <li><Link href="/programs">Courses</Link></li>
              <li><Link href="/try">Free trial</Link></li>
              <li><Link href="/enrol">Enroll</Link></li>
              <li><Link href="/parents">Parents</Link></li>
              <li><Link href="/schools">Schools</Link></li>
              <li><Link href="/teachers">Teachers</Link></li>
              <li><Link href="/partners">Partners</Link></li>
            </ul>
          </div>
          <div>
            <h2>Resources</h2>
            <ul>
              <li><Link href="/toolkit">FinFun Toolkit</Link></li>
              <li><Link href="/fest">FinFun Fest & contests</Link></li>
              <li><Link href="/resources#activities">Learning activities</Link></li>
              <li><Link href="/wellbeing">Well-being</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/gifting">Gifting</Link></li>
            </ul>
          </div>
          <div>
            <h2>Help</h2>
            <ul>
              <li><Link href="/contact">Contact us</Link></li>
              <li><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener">WhatsApp</a></li>
              <li><Link href="/login">Log in / Sign up</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/impact">Impact</Link></li>
            </ul>
          </div>
          <div>
            <h2>Legal</h2>
            <ul>
              <li><Link href="/privacy">Privacy policy</Link></li>
              <li><Link href="/terms">Terms of use</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FinFun. All rights reserved.</span>
          <span>No ads. No public photos of children without parent consent.</span>
        </div>
      </div>
    </footer>
  );
}
