export type Category = "Parents" | "Teachers" | "Money basics";

export type Block = { h?: string; p?: string; list?: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  date: string;
  cover: string;
  art?: string; // card illustration from the redesign; the cover is used when there isn't one
  body: Block[];
};

// TODO(FinFun): blog covers still show younger kids — redo with teen art per PRD.
export const posts: Post[] = [
  {
    slug: "upi-scams-every-teen-should-know",
    title: "5 UPI scams every teen should know",
    excerpt: "Fake prizes, ‘wrong’ payments and OTP requests — how to spot them and what to do.",
    category: "Parents",
    date: "2026-09-18",
    cover: "/a/blog-covers/blog-5-keep-kids-safe-online.webp",
    art: "/a/redesign/blog-upi.webp",
    body: [
      { p: "Most teens will use UPI before they turn 16. That’s great for independence — and it makes them a target. These are the five scams we see most often in FinFun classrooms." },
      { h: "1. The “you won a prize” message", p: "A message says you’ve won ₹10,000 and asks you to click a link or scan a code to claim it. Real prizes never ask you to pay or scan anything." },
      { h: "2. The collect request", p: "A stranger sends a UPI ‘collect’ request that looks like money coming in. Approving it with your PIN sends money out. Remember: you never enter a PIN to receive money." },
      { h: "3. The “sent by mistake” call", p: "Someone claims they paid you by mistake and asks you to send it back — often with a fake screenshot. Always check your actual bank balance, not a screenshot." },
      { h: "4. The OTP ask", p: "Anyone asking for an OTP — even someone claiming to be from a bank or app — is a scammer. Nobody genuine will ever ask." },
      { h: "5. The fake QR at a shop", p: "Check the name that appears after scanning before you pay. If it doesn’t match the shop, stop." },
      { h: "Talk about it at home", list: ["Agree a rule: never share OTP or PIN, with anyone.", "Set a daily UPI limit on your teen’s account.", "Make it safe to say “I think I got scammed” — speed matters."] },
    ],
  },
  {
    slug: "what-is-a-budget",
    title: "What is a budget? A teen’s guide to the 50-30-20 rule",
    excerpt: "A budget is just a plan for your money. Here’s the simplest one that actually works.",
    category: "Money basics",
    date: "2026-09-10",
    cover: "/a/blog-covers/blog-1-what-is-a-budget.webp",
    art: "/a/redesign/blog-budget.webp",
    body: [
      { p: "A budget isn’t a punishment. It’s a plan that tells your money where to go — instead of wondering where it went." },
      { h: "The 50-30-20 rule", list: ["50% for needs — travel, school supplies, phone recharge.", "30% for wants — snacks, games, outings.", "20% for savings — your goals and emergencies."] },
      { h: "Try it with ₹1,000", p: "₹500 for needs, ₹300 for wants, ₹200 saved. Do that for five months and you’ve got ₹1,000 saved without feeling it." },
      { h: "Track it for one month", p: "Write every spend in a notes app for 30 days. Most teens are surprised by where their ‘wants’ money really goes." },
    ],
  },
  {
    slug: "needs-vs-wants",
    title: "Needs vs wants: the one question to ask before you buy",
    excerpt: "“Do I really need it?” is the most powerful money habit a teen can build.",
    category: "Money basics",
    date: "2026-08-28",
    cover: "/a/blog-covers/blog-2-needs-vs-wants.webp",
    art: "/a/redesign/blog-needs.webp",
    body: [
      { p: "A need is something you can’t do without. A want makes life nicer. Both are fine — the trick is knowing which is which before you pay." },
      { h: "The 24-hour rule", p: "For any want over ₹500, wait a day. If you still want it tomorrow, buy it happily. Most impulse buys don’t survive the wait." },
      { h: "Sale is not saving", p: "Spending ₹700 on a ‘50% off’ item you didn’t plan to buy isn’t saving ₹700 — it’s spending ₹700." },
    ],
  },
  {
    slug: "ways-teens-can-save",
    title: "5 ways teens can save (without feeling broke)",
    excerpt: "Small, practical habits that turn pocket money into real savings goals.",
    category: "Parents",
    date: "2026-08-14",
    cover: "/a/blog-covers/blog-3-5-ways-kids-can-save.webp",
    body: [
      { list: ["Save first, spend later — move savings out the day money arrives.", "Give every goal a name and a number: “Laptop — ₹25,000”.", "Track subscriptions and cancel the ones you forgot about.", "Earn a little extra with a skill: tutoring, design, reselling.", "Celebrate milestones — 25%, 50%, 75% of the goal."] },
      { h: "For parents", p: "Matching your teen’s savings (say ₹1 for every ₹5 saved) is a simple way to teach how interest works." },
    ],
  },
  {
    slug: "pocket-money-to-first-sip",
    title: "From pocket money to a first SIP: teaching compounding at home",
    excerpt: "How to explain compounding to a teen — and why starting early beats starting big.",
    category: "Teachers",
    date: "2026-07-30",
    cover: "/a/blog-covers/blog-4-pocket-money-tips.webp",
    body: [
      { p: "Compounding means your money earns money, and then that money earns money too. It’s slow at first, then surprisingly fast." },
      { h: "A classroom activity", p: "Give two teams a ‘SIP’ of ₹500 a month. Team A starts at 15, Team B at 25. Use a simple calculator to compare their totals at 40. The gap starts the best conversation of the term." },
      { h: "Key ideas to land", list: ["Time matters more than amount.", "Inflation quietly shrinks money that sits still.", "Diversify — don’t put all your eggs in one basket."] },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
