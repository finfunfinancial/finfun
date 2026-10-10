import Link from "next/link";
import { site } from "@/lib/content";

export default function WhatsApp() {
  const text = encodeURIComponent("Hi FinFun! I'd like to know more.");
  return (
    <>
      <Link className="contest-pill" href="/fest" data-track="contest_click">🏆 Contests</Link>
      <a className="wa" href={`https://wa.me/${site.whatsapp}?text=${text}`} target="_blank" rel="noopener" aria-label="Chat with FinFun on WhatsApp" data-track="whatsapp_click">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path fill="#fff" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6Zm5.8-7.9c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    </a>
    </>
  );
}
