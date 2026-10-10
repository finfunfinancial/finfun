// Small line icons for the admin sidebar (24×24, drawn with currentColor).
const paths: Record<string, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="8" height="10" rx="1.5" /><rect x="13" y="3" width="8" height="6" rx="1.5" /><rect x="3" y="15" width="8" height="6" rx="1.5" /><rect x="13" y="11" width="8" height="10" rx="1.5" /></>,
  students: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M16 14.2c2.8.3 5 2.6 5 5.8" /></>,
  enrollments: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 9h8M8 12h5" /><path d="M10 16v5l2-1.5 2 1.5v-5" /></>,
  waitlist: <><path d="M6 3h12M6 21h12" /><path d="M7 3c0 4 5 5.5 5 9s-5 5-5 9M17 3c0 4-5 5.5-5 9s5 5 5 9" /></>,
  courses: <><rect x="6" y="3" width="14" height="16" rx="2" /><path d="M10 8h6M10 11h6M10 14h3" /><path d="M4 7v12a2 2 0 0 0 2 2h11" /></>,
  batches: <><circle cx="12" cy="7" r="2.6" /><circle cx="5.5" cy="10" r="2.1" /><circle cx="18.5" cy="10" r="2.1" /><path d="M7 20c0-2.8 2.2-5 5-5s5 2.2 5 5M2 19c0-2 1.6-3.6 3.5-3.6M22 19c0-2-1.6-3.6-3.5-3.6" /></>,
  live: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10.5 21 7.5v9l-5-3" /><circle cx="9.5" cy="11" r="2" /><path d="M6.5 16c.6-1.4 1.6-2 3-2s2.4.6 3 2" /></>,
  orders: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  coupons: <><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z" /><circle cx="8" cy="8" r="1.5" /></>,
  users: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
  audit: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  site: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  contacts: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6 8.5-6" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4M6 12h10" /></>,
};

export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
