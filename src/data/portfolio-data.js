// ════════════════════════════════════════════════════════════════════════════════
//  📁  PORTFOLIO-DATA.JS  —  YOUR VISUAL PORTFOLIO DATA
//
//  Edit this file to update:
//   - Your profile header & contact info
//   - Skills with levels
//   - Projects with links & screenshots
//   - Manager / colleague testimonials with photos
//   - Work experience timeline
//   - Certifications & achievements
//
//  Photo tips:
//   - For manager photos: paste a direct image URL (LinkedIn photo, Gravatar, etc.)
//   - Or use a placeholder like: "https://i.pravatar.cc/150?u=name"
//   - For project screenshots: use a direct image URL or leave "" for no image
// ════════════════════════════════════════════════════════════════════════════════


// ── YOUR HEADER INFO ──────────────────────────────────────────────────────────
export const PROFILE_HEADER = {
  name:       "Adarsh K P",                    // ← YOUR NAME
  title:      "Software Developer & AI Engineer",  // ← YOUR TITLE
  location:   "Chennai, India",              // ← YOUR LOCATION
  email:      "kpadarsh6801@gmail.com",            // ← YOUR EMAIL
  phone:      "+91 8157020182",              // ← YOUR PHONE (or "" to hide)
  linkedin:   "www.linkedin.com/in/adarsh-kp-developer6801",    // ← YOUR LINKEDIN URL
  github:     "https://github.com/Adarsh6801",         // ← YOUR GITHUB URL
  portfolio:  "",                            // ← YOUR PORTFOLIO URL (or "")
  avatar:     "",                            // ← YOUR PHOTO URL (or "" for initials)
  resumeUrl:  "",                            // ← Direct PDF URL to your resume (Google Drive share link, etc.)
  tagline:    "I build things that work — and make them look good too.",
  available:  false,                          // true = shows "Open to Work" badge
  notice:     "Immediate",                   // notice period
  ctc:        "₹X LPA",                     // expected CTC
}


// ── SKILLS ────────────────────────────────────────────────────────────────────
// level: 0–100 (shown as progress bar)
// category: groups skills into sections
export const SKILLS = [
  // Frontend
  { name: "React.js",       level: 90, category: "Frontend",  icon: "⚛️" },
  { name: "JavaScript",     level: 88, category: "Frontend",  icon: "🟨" },
  { name: "TypeScript",     level: 75, category: "Frontend",  icon: "🔷" },
  { name: "HTML / CSS",     level: 92, category: "Frontend",  icon: "🎨" },
  { name: "Tailwind CSS",   level: 85, category: "Frontend",  icon: "💨" },

  // Backend
  { name: "Python",         level: 88, category: "Backend",   icon: "🐍" },
  { name: "FastAPI",        level: 85, category: "Backend",   icon: "⚡" },
  { name: "Node.js",        level: 72, category: "Backend",   icon: "🟢" },
  { name: "REST APIs",      level: 90, category: "Backend",   icon: "🔗" },

  // AI / ML
  { name: "LLM Integration",level: 80, category: "AI / ML",   icon: "🤖" },
  { name: "OpenAI API",     level: 78, category: "AI / ML",   icon: "🧠" },
  { name: "NVIDIA NIM",     level: 75, category: "AI / ML",   icon: "🔮" },

  // Database
  { name: "PostgreSQL",     level: 72, category: "Database",  icon: "🐘" },
  { name: "MongoDB",        level: 70, category: "Database",  icon: "🍃" },

  // DevOps / Tools
  { name: "Git / GitHub",   level: 88, category: "Tools",     icon: "🐙" },
  { name: "Docker",         level: 60, category: "Tools",     icon: "🐳" },
  { name: "Linux",          level: 70, category: "Tools",     icon: "🐧" },
]


// ── PROJECTS ──────────────────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: 1,
    name: "AI Clone Chatbot",
    tagline: "My digital twin — built with React + FastAPI + Llama 4",
    description:
      "A full-stack AI chatbot that acts as my digital twin. Features real-time chat with personality, a Guess Who game with 25 AI questions, idle nudges, earthquake Easter egg, and a Hire Me section for recruiters.",
    tech: ["React", "FastAPI", "Python", "NVIDIA NIM", "Llama 4", "Vite"],
    image: "",
    github: "github.com/adarshk/ai-clone",
    live: "",
    highlights: [
      "Built entire system architecture solo",
      "Integrated Llama 4 via NVIDIA NIM API",
      "25-question binary search AI game engine",
    ],
    featured: true,
  },
  {
    id: 2,
    name: "Hyperstop E-commerce Platform",
    tagline: "Full-featured e-commerce system with payment integration",
    description:
      "Developed a scalable e-commerce platform with complete product, order, and payment management. Integrated payment gateways and built APIs to support mobile applications.",
    tech: ["Angular", "Node.js", "Express.js", "MongoDB", "Razorpay", "Excel.js"],
    image: "",
    github: "",
    live: "",
    highlights: [
      "Integrated Razorpay payment gateway",
      "Built APIs for mobile app support",
      "Handled product, order, and analytics modules",
    ],
    featured: true,
  },
  {
    id: 3,
    name: "MyTaxApp (US Tax Platform)",
    tagline: "Tax management platform with CI/CD pipeline",
    description:
      "Built a tax management web application with CI/CD pipelines using TeamCity, improving deployment speed and scalability.",
    tech: ["React", "Redux", ".NET", "CI/CD", "TeamCity", "Bitbucket"],
    image: "",
    github: "",
    live: "",
    highlights: [
      "Implemented CI/CD pipelines",
      "Improved deployment efficiency",
      "Handled scalable tax workflows",
    ],
    featured: true,
  },
  {
    id: 4,
    name: "Indust B2B Application",
    tagline: "Requirement-based B2B platform with admin control",
    description:
      "Developed a requirement-based B2B platform with optimized APIs for mobile applications and a powerful React-based admin panel for full system control.",
    tech: ["React", "Redux", ".NET", "REST APIs", "Bitbucket"],
    image: "",
    github: "",
    live: "",
    highlights: [
      "Built optimized APIs for mobile apps",
      "Developed complete admin panel",
      "Improved system performance and usability",
    ],
    featured: false,
  },
  {
    id: 5,
    name: "Glamourbae Delivery App",
    tagline: "Fast cosmetic delivery platform like Zepto",
    description:
      "Worked on a fast-delivery cosmetic platform enabling quick store-to-customer delivery. Built admin panel and backend APIs supporting real-time operations.",
    tech: ["React", "Redux", ".NET", "REST APIs"],
    image: "",
    github: "",
    live: "",
    highlights: [
      "Developed admin panel for store operations",
      "Built APIs for mobile team",
      "Optimized delivery workflow system",
    ],
    featured: false,
  },
  {
    id: 6,
    name: "Bafl B2B E-commerce Platform",
    tagline: "B2B commerce system with analytics and reporting",
    description:
      "Designed and developed a B2B e-commerce platform with admin dashboard, mobile support, and Excel-based reporting for business analytics.",
    tech: ["Angular", "Node.js", "MongoDB", "Excel.js", "Razorpay"],
    image: "",
    github: "",
    live: "",
    highlights: [
      "Built admin dashboard with full control",
      "Implemented Excel-based reporting system",
      "Handled analytics and business insights",
    ],
    featured: false,
  },
  {
    id: 7,
    name: "Parry Food Subscription App",
    tagline: "Subscription-based delivery and management system",
    description:
      "Developed RESTful APIs for user, dealer, and delivery management. Integrated SMS notifications and payment gateways for seamless subscription operations.",
    tech: ["Angular", "Node.js", "MongoDB", "SMS Gateway", "HDFC Payment", "Puppeteer"],
    image: "",
    github: "",
    live: "",
    highlights: [
      "Built scalable REST APIs",
      "Integrated SMS notification system",
      "Handled subscription and delivery workflows",
    ],
    featured: false,
  },
];


// ── WORK EXPERIENCE ───────────────────────────────────────────────────────────
export const EXPERIENCE = [
  {
    id: 1,
    company: "TeamTweaks Technologies",
    role: "Software Developer",
    duration: "October 2023 – Present",
    type: "Full-time",
    location: "Chennai",
    logo: "",
    color: "#7c6dfa",
    points: [
      "Upgraded Angular and Node.js versions improving performance and security",
      "Built real-time chat features using Socket.io",
      "Implemented push notifications increasing user retention by 15%",
      "Handled multiple projects with timely delivery",
      "Contributed to code reviews and quality assurance",
    ],
    tech: ["Angular", "Node.js", "React", "MongoDB", "Socket.io"],
  },
  {
    id: 2,
    company: "Freelance / Project Based",
    role: "Full-Stack Developer",
    duration: "2022 – 2023",
    type: "Contract",
    location: "Remote",
    logo: "",
    color: "#f06292",
    points: [
      "Built multiple B2B and e-commerce platforms",
      "Developed REST APIs for mobile applications",
      "Integrated payment gateways like Razorpay and HDFC",
    ],
    tech: ["JavaScript", "Node.js", "MongoDB", "Angular"],
  },
];

// ── TESTIMONIALS ─────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: 1,
    name: "Engineering Manager",
    role: "Manager at TeamTweaks",
    company: "TeamTweaks Technologies",
    photo: "",
    initials: "EM",
    color: "#7c6dfa",
    quote:
      "Adarsh is a highly dependable developer who consistently delivers scalable solutions. His ability to handle multiple projects and quickly adapt to new technologies makes him a valuable asset to the team.",
    relation: "Direct Manager",
    verified: true,
  },
  {
    id: 2,
    name: "Team Lead",
    role: "Senior Developer",
    company: "TeamTweaks Technologies",
    photo: "",
    initials: "TL",
    color: "#f06292",
    quote:
      "Working with Adarsh has been seamless. His problem-solving skills and ownership mindset ensure projects are completed efficiently and with high quality.",
    relation: "Team Lead",
    verified: true,
  },
  {
    id: 3,
    name: "Colleague",
    role: "Frontend Developer",
    company: "TeamTweaks Technologies",
    photo: "",
    initials: "CL",
    color: "#26d4b0",
    quote:
      "Adarsh is always ready to help and brings strong technical knowledge across frontend and backend. A great team player.",
    relation: "Peer / Colleague",
    verified: false,
  },
];

// ── CERTIFICATIONS ───────────────────────────────────────────────────────────
export const CERTIFICATIONS = [
  {
    name: "Node.js Certification",
    issuer: "freeCodeCamp",
    year: "2024",
    icon: "🏆",
    link: "",
  },
  {
    name: "Problem Solving",
    issuer: "HackerRank",
    year: "2023",
    icon: "📜",
    link: "",
  },
  {
    name: "Frontend Developer (React)",
    issuer: "HackerRank",
    year: "2023",
    icon: "📜",
    link: "",
  },
];

// ── EDUCATION ─────────────────────────────────────────────────────────────────
export const EDUCATION = {
  degree: "BSc",
  field: "Electronics",
  college: "Government Arts and Science College, Tanur",
  location: "Tanur",
  year: "2022",
  grade: "",
  logo: "",
};
