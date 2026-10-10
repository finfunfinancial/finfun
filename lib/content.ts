// All editable site content lives here so it can move to a headless CMS (Sanity/Strapi)
// without touching page code. Items marked TODO(FinFun) are awaiting confirmation (see PRD "Open decisions").

export const site = {
  name: "FinFun",
  // Explicit URL wins; otherwise use the project's *.vercel.app address on Vercel. `||` so empty env vars fall through.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://www.finfun.club"),
  tagline: "Building the future of financial dignity",
  email: "partnerships@finfun.club",
  phone: "+91 97398 85822",
  whatsapp: "919739885822",
  grades: "Grades 3 to 10",
  loginUrl: process.env.NEXT_PUBLIC_LOGIN_URL ?? "",
  financialPassportUrl: process.env.NEXT_PUBLIC_FINANCIAL_PASSPORT_URL ?? "",
};

// Festive offer button in the homepage hero; it opens Enroll with `code` pre-filled as the coupon.
// Set `active: false` to hide it after the season.
// TODO(FinFun): set the real discount (e.g. "20%") and coupon code.
export const festiveOffer = { active: true, discount: "", code: "FESTIVE" };

// Plain header links; the Courses, Solutions and Resources dropdowns (navMenus) sit after `programs` below.
export const nav = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Help" },
];

// The parent's path from discovery to paying (shown as a step strip on Courses, Trial and Enroll).
export const joinSteps = [
  { title: "Courses", text: "Find the course for your child’s grade", href: "/programs" },
  { title: "Free trial", text: "Try a sample lesson or book a demo class", href: "/try" },
  { title: "Program", text: "Pick the program and class time", href: "/programs#compare" },
  { title: "Payment", text: "Pay securely and start learning", href: "/enrol" },
];

// Gamified learning activities used across courses, workshops and the toolkit.
export const activities = [
  { title: "Finance journal", text: "Children log what they earn, save, spend and share each week — and spot their own habits.", img: "/a/sticker/02-the-budgeter.webp" },
  { title: "Investing basics", text: "Simulated SIPs and market games show why starting early and spreading risk matter.", img: "/a/sticker/08-compound-power.webp" },
  { title: "Mind mapping", text: "Connect earn, save, spend and share into one big picture of how money works.", img: "/a/home-page/method-mind-mapping.webp" },
  { title: "Entrepreneurship", text: "Plan a small stall or service: costs, price, profit — and what to do with it.", img: "/a/sticker/01-the-entrepreneur.webp" },
  { title: "Theatre", text: "Act out the shop, the bank and the scam call — and learn by doing.", img: "/a/home-page/method-theatre.webp" },
  { title: "Quizzes", text: "Fast rounds on needs vs wants, UPI safety and compounding.", img: "/a/home-page/method-quiz.webp" },
  { title: "Story writing", text: "Children write their own money goals and future plans.", img: "/a/home-page/method-story-writing.webp" },
];

// TODO(FinFun): confirm what each toolkit item contains, its price (if sold separately) and photos.
export const toolkit = [
  { title: "Lucky Ledger 2.0", text: "FinFun’s money game, new and improved. Details coming soon.", img: "/a/sticker/12-money-fun.webp", featured: true },
  { title: "Board games", text: "Play-money board games that turn budgeting and saving into a family game night.", img: "/a/sticker/03-budget-boss.webp" },
  { title: "Card games", text: "Money cards for quick games on needs vs wants, prices and scams.", img: "/a/sticker/06-need-or-want.webp" },
  { title: "Finance journal", text: "A child’s own book to track pocket money, goals and savings.", img: "/a/sticker/02-the-budgeter.webp" },
  { title: "Money stories", text: "Short stories that start real conversations about money at home.", img: "/a/sticker/04-dadis-gullak.webp" },
  { title: "Activity sheets", text: "Printable mind maps, budgets and goal trackers for home or class.", img: "/a/sticker/04-goal-set.webp" },
];

// Ways organisations bring FinFun to more children (outreach pathway).
export const partnerTypes = [
  { title: "Schools", text: "Run FinFun in grades 3–10 with trained teachers, kits and competitions.", href: "/schools#partner", cta: "Bring FinFun to your school" },
  { title: "NGOs and communities", text: "Workshops for children in community centres, libraries and after-school programs.", href: "/partners#enquire", cta: "Partner as an NGO" },
  { title: "CSR partners", text: "Fund FinFun for schools you support and get a measured impact report.", href: "/partners#enquire", cta: "Fund a program" },
  { title: "Government", text: "Integrate FinFun into state school programs, as with Telangana’s life skills book.", href: "/partners#enquire", cta: "Talk to us" },
];

export const impact = [
  { value: "35,000+", label: "Schools", icon: "/a/icons/impact-schools.webp" },
  { value: "20,00,000+", label: "Students", icon: "/a/icons/impact-students.webp" },
  { value: "500+", label: "Hours of training", icon: "/a/icons/impact-hours-of-training.webp" },
  { value: "350+", label: "Teachers trained", icon: "/a/icons/impact-teachers-trained.webp" },
];

export const values = [
  {
    title: "Early Confidence",
    text: "Teens handle UPI, pocket money and online shopping now. We build money confidence before the big decisions arrive.",
    icon: "/a/icons/value-early-confidence.webp",
  },
  {
    title: "Lifelong Habits",
    text: "Save first, budget smart, grow steadily — habits practised in class that stick for life.",
    icon: "/a/icons/value-lifelong-habits.webp",
  },
  {
    title: "Practical Skills",
    text: "Real topics: scams, SIPs, bank accounts, side hustles. No boring theory — skills they use the same week.",
    icon: "/a/icons/value-practical-skills.webp",
  },
];

export const howItWorks = [
  { title: "Learn", text: "Short, story-led lessons on one real money topic at a time.", img: "/a/sticker/07-money-coach.webp" },
  { title: "Play", text: "Games, quizzes, role-play and challenges put every idea into action.", img: "/a/sticker/12-money-fun.webp" },
  { title: "Grow", text: "Badges, leaderboards and real savings goals keep teens coming back.", img: "/a/sticker/02-money-grows.webp" },
];

export const methods = [
  { title: "Mind Mapping", text: "Connect earn, save, spend and share into one big picture.", img: "/a/home-page/method-mind-mapping.webp" },
  { title: "Theatre", text: "Act out the shop, the bank and the scam call — and learn by doing.", img: "/a/home-page/method-theatre.webp" },
  { title: "Quiz", text: "Fast rounds on needs vs wants, UPI safety and compounding.", img: "/a/home-page/method-quiz.webp" },
  { title: "Story Writing", text: "Teens write their own money goals and future plans.", img: "/a/home-page/method-story-writing.webp" },
];

export const journey = [
  { title: "Interactive Activities", icon: "/a/icons/journey-interactive-activities.webp", text: "Hands-on games for every topic." },
  { title: "Competitions", icon: "/a/icons/journey-competitions.webp", text: "Inter-class challenges with prizes." },
  { title: "Rubric Evaluation", icon: "/a/icons/journey-rubric-evaluation.webp", text: "Clear, fair assessment of learning." },
  { title: "Vernacular Version", icon: "/a/icons/journey-vernacular-version.webp", text: "Content in local languages." },
  { title: "Teacher Training", icon: "/a/icons/journey-teacher-training-modules.webp", text: "Ready modules so any teacher can lead." },
  { title: "Hands-on Workshops", icon: "/a/icons/journey-hands-on-workshops.webp", text: "Live sessions by FinFun trainers." },
  { title: "Learning Kits", icon: "/a/icons/journey-learning-kits.webp", text: "Cards, games and money stories." },
  { title: "Personal Finance for Teachers", icon: "/a/icons/journey-personal-finance-training.webp", text: "Money skills for staff, too." },
  { title: "Leader Board", icon: "/a/icons/journey-leader-board.webp", text: "Friendly ranking keeps energy high." },
  { title: "Impact Report", icon: "/a/icons/journey-impact-report.webp", text: "Measured outcomes for your school." },
];

// TODO(FinFun): confirm rubric skills and level descriptions with the curriculum team.
export const rubricLevels = [
  { name: "Bronze", label: "Getting started", medal: "/a/gamification/medal-3-bronze.webp" },
  { name: "Silver", label: "Getting there", medal: "/a/gamification/medal-2-silver.webp" },
  { name: "Gold", label: "Money champ", medal: "/a/gamification/medal-1-gold.webp" },
];

export const rubric = [
  {
    skill: "Money basics",
    badge: "/a/gamification/badge-money-smart.webp",
    levels: ["Recognises coins, notes and prices with help.", "Explains what money is for and compares prices.", "Explains where money comes from and how it grows."],
  },
  {
    skill: "Saving & goals",
    badge: "/a/gamification/badge-super-saver.webp",
    levels: ["Knows why saving matters.", "Sets a saving goal and tracks it.", "Plans and reaches goals, and saves first."],
  },
  {
    skill: "Smart spending",
    badge: "/a/gamification/badge-budget-boss.webp",
    levels: ["Sorts needs from wants with help.", "Makes a simple budget and sticks to it.", "Compares choices and spots impulse buys and fake deals."],
  },
  {
    skill: "Staying safe",
    badge: "/a/sticker/09-pin-secret.webp",
    levels: ["Knows PINs and OTPs are secret.", "Spots common scams and tells an adult.", "Checks before paying and helps others stay safe."],
  },
];

export const partnershipSteps = [
  { title: "Partner", text: "Sign up and we plan the program around your timetable.", icon: "/a/icons/impact-schools.webp" },
  { title: "Train", text: "Your teachers get trained with ready-to-run modules.", icon: "/a/icons/journey-teacher-training-modules.webp" },
  { title: "Play", text: "Kits reach classrooms; students learn through games.", icon: "/a/icons/journey-learning-kits.webp" },
  { title: "Measure", text: "Rubric-based evaluation and an impact report for you.", icon: "/a/icons/journey-impact-report.webp" },
];

export type Program = {
  slug: "basic" | "pro" | "advantage";
  name: string;
  grades: string;
  price: number;
  focus: string;
  sticker: string;
  topics: { title: string; text: string; sticker: string }[];
  format: string[];
  checkoutUrl: string;
};

// TODO(FinFun): confirm grade split, prices, session count and timings.
export const programs: Program[] = [
  {
    slug: "basic",
    name: "FinFun Basic",
    grades: "Grades 3–5",
    price: 999,
    focus: "Coins and notes, needs vs wants, saving in a gullak, earning and sharing.",
    sticker: "/a/sticker/04-dadis-gullak.webp",
    // TODO(FinFun): confirm Basic topics and format.
    topics: [
      { title: "Know your money", text: "Coins, notes and what things really cost.", sticker: "/a/sticker/12-money-fun.webp" },
      { title: "Needs vs wants", text: "Tell what you need from what you just want.", sticker: "/a/sticker/06-need-or-want.webp" },
      { title: "Save in a gullak", text: "Watch small savings grow into something big.", sticker: "/a/sticker/04-dadis-gullak.webp" },
      { title: "Set a goal", text: "Pick something to save for and reach it.", sticker: "/a/sticker/04-goal-set.webp" },
      { title: "Earn it", text: "Learn that money comes from work and effort.", sticker: "/a/sticker/11-earn-it.webp" },
      { title: "Share and give", text: "Why sharing with others feels good too.", sticker: "/a/sticker/10-share-give.webp" },
    ],
    format: ["Weekly live sessions with a FinFun trainer", "Stories, games and play-money activities every session", "Printable activity kit", "Badges and a completion certificate"],
    checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_BASIC ?? "",
  },
  {
    slug: "pro",
    name: "FinFun Pro",
    grades: "Grades 6–7",
    price: 1499,
    focus: "Needs vs wants, budgeting, saving goals, UPI and scam safety.",
    sticker: "/a/sticker/06-need-or-want.webp",
    topics: [
      { title: "Needs vs wants", text: "The one question to ask before every purchase.", sticker: "/a/sticker/06-need-or-want.webp" },
      { title: "Budgeting", text: "Split pocket money with the 50-30-20 rule.", sticker: "/a/sticker/03-budget-boss.webp" },
      { title: "Saving goals", text: "Plan for the laptop, the shoes, the trip.", sticker: "/a/sticker/04-goal-set.webp" },
      { title: "UPI and scan safety", text: "Pay smart, check the name, never rush.", sticker: "/a/sticker/04-smart-spender.webp" },
      { title: "Scam safety", text: "Spot fake prizes and never share an OTP.", sticker: "/a/sticker/09-scam-alert.webp" },
      { title: "Sale is not saving", text: "See through discounts and impulse buys.", sticker: "/a/sticker/03-wait-24-hours.webp" },
    ],
    format: ["Weekly live sessions with a FinFun trainer", "Games, quizzes and challenges every session", "Printable activity kit", "Badges and a completion certificate"],
    checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_PRO ?? "",
  },
  {
    slug: "advantage",
    name: "FinFun Advantage",
    grades: "Grades 8–10",
    price: 2499,
    focus: "Banking, SIPs and compounding, inflation, investing basics, side hustles.",
    sticker: "/a/sticker/03-the-investor.webp",
    topics: [
      { title: "My first bank account", text: "Savings accounts, debit cards and staying safe.", sticker: "/a/sticker/04-bank-buddy.webp" },
      { title: "SIPs and compounding", text: "Why starting early beats starting big.", sticker: "/a/sticker/01-sip-every-month.webp" },
      { title: "Inflation is real", text: "What ₹100 buys today vs in ten years.", sticker: "/a/sticker/03-prices-rise.webp" },
      { title: "Investing basics", text: "Stocks, funds, risk and why we diversify.", sticker: "/a/sticker/12-spread-it-out.webp" },
      { title: "Side hustles", text: "Earning your first income, the smart way.", sticker: "/a/sticker/11-earn-it.webp" },
      { title: "Avoid the EMI trap", text: "How loans and ‘no-cost EMI’ really work.", sticker: "/a/sticker/06-borrow-smart.webp" },
    ],
    format: ["Weekly live sessions with a FinFun trainer", "Case studies and market simulation games", "Printable activity kit", "Badges and a completion certificate"],
    checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_ADVANTAGE ?? "",
  },
];

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);

// Header menu: Courses, Solutions and Resources open dropdowns; the rest are plain links.
// Every href points at a page (or section) that exists — add new pages here once they're live.
export type NavLink = { label: string; href: string; text?: string; tag?: string };
export type NavMenu = { label: string; groups: { title?: string; links: NavLink[] }[]; more: NavLink };

export const navMenus: NavMenu[] = [
  {
    label: "Courses",
    groups: [
      {
        title: "Courses by grade",
        links: programs.map((p) => ({ label: p.name, tag: p.grades, text: p.focus, href: `/programs/${p.slug}` })),
      },
      {
        title: "Learning tools",
        links: [
          { label: "Lucky Ledger 2.0", tag: "New", text: "FinFun’s money game, new and improved.", href: "/toolkit#lucky-ledger" },
          { label: "FinFun Toolkit", text: "Board games, card games and activity sheets.", href: "/toolkit#kit" },
          { label: "Finance Journal", text: "Track pocket money, goals and savings.", href: "/toolkit#kit" },
          { label: "Investing & Entrepreneurship", text: "Market games and planning a small stall.", href: "/resources#activities" },
        ],
      },
    ],
    more: { label: "Compare all courses", href: "/programs" },
  },
  {
    label: "Solutions",
    groups: [
      {
        links: [
          { label: "For Parents", text: "Financial literacy support and activities for families.", href: "/parents" },
          { label: "For Teachers", text: "Teacher training and classroom resources.", href: "/teachers" },
          { label: "For Schools", text: "Curriculum integration and school partnerships.", href: "/schools" },
          { label: "For NGOs & Communities", text: "Community financial education initiatives.", href: "/partners" },
          { label: "For Government & CSR", text: "Large-scale financial literacy partnerships.", href: "/partners#enquire" },
        ],
      },
    ],
    more: { label: "Partner with FinFun", href: "/partners#enquire" },
  },
  {
    label: "Resources",
    groups: [
      {
        links: [
          { label: "Blogs", text: "Financial literacy articles and money guides.", href: "/blog" },
          { label: "Train-the-Trainer", text: "Training path for educators and facilitators.", href: "/teachers#trainer" },
          { label: "FinFun Fest", text: "Events, competitions and money challenges.", href: "/fest" },
          { label: "Evaluation Resources", text: "Rubrics and learning-outcome measurement.", href: "/teachers#rubric" },
          { label: "Parent Assist", text: "Teaching children about money at home.", href: "/parents#assist" },
          { label: "Wellness Centre", text: "Healthy financial habits and well-being.", href: "/wellbeing" },
        ],
      },
    ],
    more: { label: "All resources", href: "/resources" },
  },
];

/** The course for a school grade (3–10), read from each program's "Grades a–b" label. */
export const programForGrade = (grade: number) =>
  programs.find((p) => {
    const [lo, hi] = (p.grades.match(/\d+/g) ?? []).map(Number);
    return grade >= lo && grade <= hi;
  });

export const parentTopics = [
  { title: "Budgeting", grade: "Grade 6+", sticker: "/a/sticker/02-the-budgeter.webp" },
  { title: "Saving goals", grade: "Grade 6+", sticker: "/a/sticker/08-goal-reached.webp" },
  { title: "UPI and scam safety", grade: "Grade 6+", sticker: "/a/sticker/02-scam-spotter.webp" },
  { title: "First bank account", grade: "Grade 8+", sticker: "/a/sticker/04-bank-buddy.webp" },
  { title: "SIPs and investing basics", grade: "Grade 8+", sticker: "/a/sticker/08-compound-power.webp" },
  { title: "Side hustles", grade: "Grade 8+", sticker: "/a/sticker/01-the-entrepreneur.webp" },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  group: "school" | "official" | "parent" | "teacher";
};

// TODO(FinFun): replace illustrated avatars with real photos (with consent).
export const testimonials: Testimonial[] = [
  {
    name: "Shirisha",
    role: "Department of Education Commissionerate, Government of Telangana",
    quote:
      "As part of our life skills book, we have integrated FinFun activities for all students from 6th to 10th grade, across 35,000 schools, empowering 20 lakh+ students. This intervention is the need of the hour.",
    avatar: "/a/testimonials-and-team/avatar-official-senior.webp",
    group: "official",
  },
  {
    name: "Keshav Murthy",
    role: "CSR, Bengaluru Airport",
    quote:
      "FinFun’s 2-year pilot at Government Aradeshanahalli school has been transformational for our 6th and 7th graders. Children have started saving Rs. 2,000–6,000, and spending now has a lens of need and want.",
    avatar: "/a/testimonials-and-team/avatar-csr-professional.webp",
    group: "school",
  },
  {
    name: "Krutika’s mother",
    role: "Parent",
    quote:
      "Very happy that our children are thinking about saving at an early stage and learning how to plan money for future college education. We are very happy that my child is learning financial literacy.",
    avatar: "/a/testimonials-and-team/avatar-parent-mother.webp",
    group: "parent",
  },
  {
    name: "Ranjitha",
    role: "Teacher",
    quote:
      "The trainers have high energy and plan the class minute by minute. The way it is taught is very simple and fun. Children wait for Saturdays for the FinFun classes.",
    avatar: "/a/testimonials-and-team/avatar-teacher-woman.webp",
    group: "teacher",
  },
  {
    name: "Sri Vijayendra Prasad",
    role: "Member of Parliament, Rajya Sabha",
    quote:
      "It is very good to see that team FinFun is working on a nation-building exercise. A right understanding about finances at an early age can change the way many underserved families live.",
    avatar: "/a/testimonials-and-team/avatar-official-senior.webp",
    group: "official",
  },
  {
    name: "Andrew Collister",
    role: "Australian Consulate",
    quote:
      "Happy to partner with FinFun, along with KIAF, as part of the Directorate program. The children’s enthusiasm shows how child-friendly the program is.",
    avatar: "/a/testimonials-and-team/avatar-csr-professional.webp",
    group: "official",
  },
  {
    name: "Archana Devi",
    role: "MLA PTR Office, Madurai",
    quote:
      "We piloted FinFun sessions in two schools in Madurai Municipal Corporation. Government school children can comfortably understand the curriculum, yet all the topics are covered.",
    avatar: "/a/testimonials-and-team/avatar-teacher-woman.webp",
    group: "school",
  },
  {
    name: "Kalavathy",
    role: "Shadow teacher",
    quote:
      "It inspired me to start my own savings journey. I saved around ₹70,000 during this tenure — and part of it helped in a medical emergency.",
    avatar: "/a/testimonials-and-team/avatar-teacher-woman.webp",
    group: "teacher",
  },
  {
    name: "Supriya",
    role: "Journalist, Times Group",
    quote:
      "This was not like any other class. I was amazed by how children were understanding banking at an early age — and actually enjoying it.",
    avatar: "/a/testimonials-and-team/avatar-journalist.webp",
    group: "school",
  },
  {
    name: "Aravind Devarmane",
    role: "Community volunteer, Gandaghatta Government School, Sringeri",
    quote: "We never thought that in 45 minutes children could be engaged with a financial literacy class that is fun and memorable.",
    avatar: "/a/testimonials-and-team/avatar-volunteer.webp",
    group: "school",
  },
];

// TODO(FinFun): swap for logo files (with permission).
export const partners = [
  { name: "Government of Telangana", note: "Dept. of School Education" },
  { name: "Bengaluru Airport", note: "CSR partner" },
  { name: "Australian Consulate", note: "with KIAF" },
  { name: "Madurai Corporation", note: "School pilot" },
  { name: "Prakruti Shala", note: "Sir CV Raman House" },
];

// TODO(FinFun): replace with real classroom photos (grades 6–10, with written consent).
export const classroom = [
  { caption: "Scam-spotting challenge", sticker: "/a/sticker/09-scam-alert.webp", bg: "var(--pink-soft)" },
  { caption: "UPI role-play", sticker: "/a/sticker/09-pin-secret.webp", bg: "var(--sky-soft)" },
  { caption: "Budget battle", sticker: "/a/sticker/03-budget-boss.webp", bg: "var(--yellow-soft)" },
  { caption: "Money quiz finals", sticker: "/a/sticker/12-money-fun.webp", bg: "var(--green-soft)" },
  { caption: "Investing 101", sticker: "/a/sticker/02-own-a-slice.webp", bg: "var(--lavender-soft)" },
  { caption: "Goal-setting letters", sticker: "/a/sticker/04-goal-set.webp", bg: "var(--pink-soft)" },
];

export const parentFaq = [
  { q: "What grades is FinFun for?", a: "FinFun is for students in grades 3 to 10 (about 8 to 16 years old). Basic is for grades 3–5, Pro for grades 6–7 and Advantage for grades 8–10." },
  { q: "When are the sessions?", a: "Sessions run weekly, outside school hours. You’ll get the exact batch timings when you enroll, and can pick the batch that suits your teen." },
  { q: "Is it online or offline?", a: "Parent enrollments are live online sessions led by a FinFun trainer. Schools can also run FinFun offline in class with trained teachers." },
  { q: "Is it safe for my child?", a: "Yes. Only parents enroll and pay. Your teen gets a login created by you, we collect only their name and grade, we never show children’s names or photos publicly without your written consent, and there are no ads." },
  { q: "Does my teen need a bank account or real money?", a: "No. All activities use play money and simulations. Real accounts are explained, never required." },
];

export const schoolFaq = [
  { q: "How does FinFun fit our timetable?", a: "We plan sessions around your existing periods — life skills, activity or club hours work well. Teachers get ready-to-run modules." },
  { q: "Which grades can join?", a: "The program is designed for grades 6 to 10, with separate content tracks for middle and high school." },
  { q: "Is FinFun available in local languages?", a: "Yes. A vernacular version is part of the FinFun Journey for partner schools." },
  { q: "What does it cost?", a: "Pricing depends on the number of students and the model (trainer-led or teacher-led). CSR-funded options are available. Fill the form and we’ll send a proposal." },
];

// TODO(FinFun): real dates for the story timeline.
export const story = [
  { title: "The idea", text: "FinFun starts with a simple belief: every child deserves money skills, not just rich kids." },
  { title: "First classrooms", text: "Pilots in government schools in Karnataka prove teens love learning money through games." },
  { title: "Partners join", text: "CSR partners, consulates and local governments back FinFun to reach more schools." },
  { title: "35,000 schools", text: "Telangana integrates FinFun activities into its life skills book for grades 6 to 10." },
  { title: "Next: every teen", text: "Now FinFun opens to parents directly, so any teen can become money smart." },
];

export const team = [
  { name: "Founding team", role: "Program & curriculum", avatar: "/a/testimonials-and-team/avatar-teacher-woman.webp" },
  { name: "Trainers", role: "Classroom sessions", avatar: "/a/testimonials-and-team/avatar-teacher-man.webp" },
  { name: "Partnerships", role: "Schools & CSR", avatar: "/a/testimonials-and-team/avatar-csr-professional.webp" },
  { name: "Volunteers", role: "Community outreach", avatar: "/a/testimonials-and-team/avatar-volunteer.webp" },
];

export const spotlight = {
  headline: "Children have started saving ₹2,000–6,000",
  quote:
    "FinFun’s 2-year pilot at Government Aradeshanahalli school has been transformational for our 6th and 7th graders. Spending now has a lens of need and want.",
  name: "Keshav Murthy",
  role: "CSR, Bengaluru Airport",
  avatar: "/a/testimonials-and-team/avatar-csr-professional.webp",
};

export const comparison = {
  rows: [
    { aspect: "Focus", old: "Memorising definitions", fun: "Using money in real situations" },
    { aspect: "Method", old: "Lectures and textbooks", fun: "Games, role-play, quizzes and stories" },
    { aspect: "Student role", old: "Listen and copy notes", fun: "Play, compete and decide" },
    { aspect: "Topics", old: "Abstract theory", fun: "UPI, scams, SIPs, side hustles" },
    { aspect: "Result", old: "Forgotten after the exam", fun: "Habits — and real savings" },
    { aspect: "Measured by", old: "Nothing", fun: "Rubric evaluation and an impact report" },
  ],
};

export const waysToJoin = [
  { kicker: "Schools", title: "Partner School", who: "For principals & trustees", text: "Run FinFun in grades 6–10 with trained teachers, kits and competitions.", cta: "Book a demo", href: "/schools#partner", color: "sky" },
  { kicker: "CSR & Government", title: "Impact Partner", who: "For CSR heads & education departments", text: "Fund FinFun at scale and get measured outcomes in an impact report.", cta: "Get the report", href: "/schools#report", color: "lavender" },
  { kicker: "Teachers", title: "FinFun Teacher", who: "For teachers in partner schools", text: "Get trained to lead sessions — plus personal finance training for you.", cta: "Ask about training", href: "/contact", color: "green" },
  { kicker: "Parents", title: "FinFun Family", who: "For parents of grades 3–10", text: "Enroll your child in Basic, Pro or Advantage — live, online, game-based.", cta: "Enroll your child", href: "/enrol", color: "pink" },
];
