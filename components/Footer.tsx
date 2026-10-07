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
            <p>Gamified money skills for grades 6 to 10. {site.tagline}.</p>
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <br />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            </p>
          </div>
          <div>
            <h2>Get started</h2>
            <ul>
              <li><Link href="/schools">For Schools</Link></li>
              <li><Link href="/parents">For Parents</Link></li>
              <li><Link href="/programs">Programs</Link></li>
              <li><Link href="/enrol">Enroll</Link></li>
            </ul>
          </div>
          <div>
            <h2>FinFun</h2>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/impact">Impact</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/contact">Contact</Link></li>
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
