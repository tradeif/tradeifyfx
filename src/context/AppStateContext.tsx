"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useFirebaseAuth } from "@/lib/firebaseAuth";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "student" | "admin";
  tier: "Basic" | "Pro" | "VIP";
  enrolledCourses: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  features: string[];
  duration: string;
  price: number;
  originalPrice?: number;
  image: string;
}

export interface Signal {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  entry: string;
  tp: string;
  sl: string;
  status: "Active" | "Hit Target" | "Stop Loss Hit";
  timestamp: string;
  tierRequired: "Basic" | "Pro" | "VIP";
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: "Forex Analysis" | "Gold Market Analysis" | "Crypto Insights" | "Trading Psychology" | "Risk Management";
  author: string;
  date: string;
  readTime: string;
  image: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  pair: string;
  type: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  pnl: number; // positive for profit, negative for loss
  status: "WIN" | "LOSS";
  notes: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  timestamp: string;
}

interface AppStateContextType {
  user: User | null;
  courses: Course[];
  signals: Signal[];
  blogs: Blog[];
  journal: JournalEntry[];
  messages: ContactMessage[];
  login: (email: string, role?: "student" | "admin") => boolean;
  register: (name: string, email: string, role?: "student" | "admin") => boolean;
  logout: () => void;
  enrollInCourse: (courseId: string) => void;
  upgradeUserTier: (uid: string, tier: "Basic" | "Pro" | "VIP") => void;
  addCourse: (course: Omit<Course, "id">) => void;
  deleteCourse: (id: string) => void;
  addSignal: (signal: Omit<Signal, "id" | "timestamp">) => void;
  deleteSignal: (id: string) => void;
  addBlog: (blog: Omit<Blog, "id" | "slug" | "date" | "readTime">) => void;
  deleteBlog: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "date">) => void;
  deleteJournalEntry: (id: string) => void;
  sendMessage: (message: Omit<ContactMessage, "id" | "timestamp">) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Initial Static Data
const INITIAL_COURSES: Course[] = [
  {
    id: "tradinjournal",
    title: "TRADINJOURNAL",
    description: "AI-Powered Trading Journal — the smartest way to track, analyze, and improve your trading performance with artificial intelligence.",
    features: [
      "Auto-sync trades from MT5 brokers",
      "AI behavioral scoring & coaching",
      "50+ performance metrics & analytics",
      "Trade replay with chart visualization",
      "Daily/weekly AI summaries",
      "Equity curves & drawdown analysis",
      "Custom strategies & playbooks",
      "Share cards for social media"
    ],
    duration: "Lifetime",
    price: 0,
    image: "/trading_journal.png"
  },
  {
    id: "vip-signals",
    title: "VIP SIGNALS",
    description: "Exclusive trading signals with high accuracy — get real-time alerts, entry & exit points, and risk management from professional traders.",
    features: [
      "Real-time market alerts",
      "Entry & exit points",
      "Risk management",
      "24/7 support"
    ],
    duration: "Monthly",
    price: 0,
    originalPrice: 2999,
    image: "/vip_signals.png"
  },
  {
    id: "master-trader-course",
    title: "MASTER TRADER COURSE",
    description: "Complete trading education from market experts — from stock market basics to advanced SMC, options trading, and professional strategies.",
    features: [
      "Basic of Stock Market",
      "Market Psychology & Setup",
      "Ultimate Options Trading",
      "IBZ 3.0",
      "FTC Strategy",
      "SMC Course"
    ],
    duration: "Lifetime",
    price: 0,
    originalPrice: 9999,
    image: "/master_course.png"
  },
  {
    id: "traders-paradise",
    title: "INDICATOR",
    description: "Join elite traders in our exclusive community — powerful indicator suite with historical backtesting, multiple timeframes, and performance metrics.",
    features: [
      "Historical backtesting",
      "Multiple timeframes",
      "Custom indicators",
      "Performance metrics"
    ],
    duration: "Lifetime",
    price: 0,
    originalPrice: 4999,
    image: "/indicator_setup.png"
  }
];


const INITIAL_SIGNALS: Signal[] = [
  {
    id: "sig-1",
    pair: "XAUUSD (GOLD)",
    type: "BUY",
    entry: "2315.50",
    tp: "2335.00",
    sl: "2305.00",
    status: "Active",
    timestamp: "2026-06-19 10:00",
    tierRequired: "Pro"
  },
  {
    id: "sig-2",
    pair: "BTCUSD (BITCOIN)",
    type: "BUY",
    entry: "64200.00",
    tp: "66000.00",
    sl: "63000.00",
    status: "Hit Target",
    timestamp: "2026-06-18 14:00",
    tierRequired: "Basic"
  },
  {
    id: "sig-3",
    pair: "EURUSD",
    type: "SELL",
    entry: "1.0850",
    tp: "1.0780",
    sl: "1.0890",
    status: "Active",
    timestamp: "2026-06-19 09:30",
    tierRequired: "VIP"
  },
  {
    id: "sig-4",
    pair: "GBPUSD",
    type: "BUY",
    entry: "1.2680",
    tp: "1.2780",
    sl: "1.2630",
    status: "Stop Loss Hit",
    timestamp: "2026-06-18 08:00",
    tierRequired: "Pro"
  }
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Understanding Smart Money Concepts: The Liquidity Hunt",
    slug: "understanding-smart-money-concepts",
    excerpt: "Learn how market makers target retail stop losses and how you can position yourself with the institutional order flow.",
    category: "Forex Analysis",
    author: "Founder, TRADEIFYFX",
    date: "June 18, 2026",
    readTime: "5 min read",
    content: "Retail traders often place their stop losses at obvious support and resistance levels. Institutional algorithms, or 'Smart Money,' target these zones to accumulate large positions without shifting the price against themselves. This process is known as a liquidity sweep. In this article, we explain how to identify order blocks, avoid liquidity traps, and entry techniques using fair value gaps.",
    image: "/blog_smc.png"
  },
  {
    id: "blog-2",
    title: "Gold (XAUUSD) Mid-Year Outlook: Key Levels to Watch",
    slug: "gold-xauusd-outlook-levels-watch",
    excerpt: "With inflation pressures and changing interest rates, Gold is holding key support. Here is our technical and fundamental breakdown.",
    category: "Gold Market Analysis",
    author: "Gold Strategist, TRADEIFYFX",
    date: "June 17, 2026",
    readTime: "7 min read",
    content: "Gold (XAUUSD) has remained highly volatile in 2026. Following macroeconomic policies and rate statements, precious metals are building a solid accumulation range. Technically, the 2300 level is acting as a major historical pivot. A sustained break above 2360 could trigger a run to the all-time high, while a failure at 2280 could open the door to a correction towards the 2200 range.",
    image: "/blog_gold.png"
  },
  {
    id: "blog-3",
    title: "Psychology Secrets: Why You Fail to Hold Winning Trades",
    slug: "psychology-secrets-winning-trades",
    excerpt: "Cutting wins short and letting losses run is the #1 trading trap. Discover the cognitive biases behind this and how to rewrite your rules.",
    category: "Trading Psychology",
    author: "Psychology Coach, TRADEIFYFX",
    date: "June 15, 2026",
    readTime: "4 min read",
    content: "Loss aversion is a cognitive bias where the pain of losing is twice as powerful as the pleasure of gaining. This leads retail traders to close profitable trades prematurely to secure the gain (fear of losing profit) while holding losing positions for too long hoping they will bounce back (unwillingness to accept a loss). To overcome this, traders must adopt strict execution checklists and transition to automated stop-loss/take-profit management.",
    image: "/blog_psychology.png"
  }
];

const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: "j-1",
    date: "2026-06-18",
    pair: "XAUUSD",
    type: "BUY",
    entryPrice: 2310.5,
    exitPrice: 2322.0,
    pnl: 1150.0,
    status: "WIN",
    notes: "Followed the H4 liquidity sweep. Good structure breakout on M15. Closed at local resistance."
  },
  {
    id: "j-2",
    date: "2026-06-17",
    pair: "EURUSD",
    type: "SELL",
    entryPrice: 1.0870,
    exitPrice: 1.0830,
    pnl: 400.0,
    status: "WIN",
    notes: "Entered on FVG retest during London session. Perfect risk-reward ratio."
  },
  {
    id: "j-3",
    date: "2026-06-16",
    pair: "BTCUSD",
    type: "BUY",
    entryPrice: 65100.0,
    exitPrice: 64600.0,
    pnl: -500.0,
    status: "LOSS",
    notes: "Fakeout above range high. Triggered my stop loss before moving back up. Need to give trades more room."
  }
];

const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: "msg-1",
    name: "Aarav Sharma",
    phone: "9876543210",
    email: "aarav@gmail.com",
    message: "Interested in the Gold Trading Strategy course. Do we get live support?",
    timestamp: "2026-06-19 11:00"
  }
];

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { user: fbUser, signOut: fbSignOut } = useFirebaseAuth();

  useEffect(() => {
    Promise.resolve().then(() => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || `${fbUser.firstName} ${fbUser.lastName}`.trim() || fbUser.email.split("@")[0].toUpperCase(),
          role: fbUser.email.toLowerCase().includes("admin") ? "admin" : "student",
          tier: fbUser.email.toLowerCase().includes("admin") ? "VIP" : "Basic",
          enrolledCourses: fbUser.enrolledProducts || []
        });
      } else {
        setUser(null);
      }
    });
  }, [fbUser]);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [blogs, setBlogs] = useState<Blog[]>(INITIAL_BLOGS);
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Sync state with localStorage on client mount
  useEffect(() => {
    const storedUser = localStorage.getItem("tfx_user");
    const storedCourses = localStorage.getItem("tfx_courses");
    const storedSignals = localStorage.getItem("tfx_signals");
    const storedBlogs = localStorage.getItem("tfx_blogs");
    const storedJournal = localStorage.getItem("tfx_journal");
    const storedMessages = localStorage.getItem("tfx_messages");
    const storedTheme = localStorage.getItem("tfx_theme") as "dark" | "light" | null;

    Promise.resolve().then(() => {
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedCourses) {
        const parsed = JSON.parse(storedCourses) as Course[];
        const migrated = parsed.map(c => {
          if (c.id === "traders-paradise") {
            return { ...c, title: "INDICATOR", price: 0, originalPrice: 4999, image: "/indicator_setup.png" };
          }
          if (c.id === "vip-signals") {
            return { ...c, price: 0, originalPrice: 2999, image: "/vip_signals.png" };
          }
          if (c.id === "master-trader-course") {
            return { ...c, price: 0, originalPrice: 9999, image: "/master_course.png" };
          }
          if (c.id === "tradinjournal") {
            return { ...c, price: 0, image: "/trading_journal.png" };
          }
          return c;
        });
        setCourses(migrated);
      }
      if (storedSignals) setSignals(JSON.parse(storedSignals));
      if (storedBlogs) {
        const parsed = JSON.parse(storedBlogs) as Blog[];
        const migrated = parsed.map(b => {
          if (b.id === "blog-1") return { ...b, image: "/blog_smc.png" };
          if (b.id === "blog-2") return { ...b, image: "/blog_gold.png" };
          if (b.id === "blog-3") return { ...b, image: "/blog_psychology.png" };
          return b;
        });
        setBlogs(migrated);
      }
      if (storedJournal) setJournal(JSON.parse(storedJournal));
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.className = storedTheme;
      } else {
        document.documentElement.className = "dark";
      }
    });
  }, []);

  // Sync state back to local storage helper
  const syncStorage = (key: string, data: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const login = (email: string, role?: "student" | "admin") => {
    const normalizedEmail = email.toLowerCase().trim();
    let simulatedUser: User;

    if (normalizedEmail.includes("admin") || role === "admin") {
      simulatedUser = {
        uid: "usr-admin",
        email: normalizedEmail,
        displayName: "Admin Trader",
        role: "admin",
        tier: "VIP",
        enrolledCourses: INITIAL_COURSES.map(c => c.id)
      };
    } else {
      simulatedUser = {
        uid: "usr-" + Math.floor(Math.random() * 10000),
        email: normalizedEmail,
        displayName: normalizedEmail.split("@")[0].toUpperCase(),
        role: "student",
        tier: "Basic",
        enrolledCourses: ["forex-mastery"]
      };
    }

    setUser(simulatedUser);
    syncStorage("tfx_user", simulatedUser);
    return true;
  };

  const register = (name: string, email: string, role?: "student" | "admin") => {
    const normalizedEmail = email.toLowerCase().trim();
    const simulatedUser: User = {
      uid: "usr-" + Math.floor(Math.random() * 10000),
      email: normalizedEmail,
      displayName: name,
      role: role || "student",
      tier: "Basic",
      enrolledCourses: ["forex-mastery"]
    };

    setUser(simulatedUser);
    syncStorage("tfx_user", simulatedUser);
    return true;
  };

  const logout = () => {
    fbSignOut();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("tfx_user");
    }
  };

  const enrollInCourse = (courseId: string) => {
    if (!user) return;
    if (user.enrolledCourses.includes(courseId)) return;

    const updatedUser = {
      ...user,
      enrolledCourses: [...user.enrolledCourses, courseId]
    };
    setUser(updatedUser);
    syncStorage("tfx_user", updatedUser);
  };

  const upgradeUserTier = (uid: string, tier: "Basic" | "Pro" | "VIP") => {
    if (user && user.uid === uid) {
      const updatedUser = { ...user, tier };
      setUser(updatedUser);
      syncStorage("tfx_user", updatedUser);
    }
  };

  const addCourse = (course: Omit<Course, "id">) => {
    const newCourse = {
      ...course,
      id: "course-" + Math.floor(Math.random() * 10000)
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    syncStorage("tfx_courses", updated);
  };

  const deleteCourse = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    syncStorage("tfx_courses", updated);
  };

  const addSignal = (signal: Omit<Signal, "id" | "timestamp">) => {
    const newSignal: Signal = {
      ...signal,
      id: "sig-" + Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    const updated = [newSignal, ...signals];
    setSignals(updated);
    syncStorage("tfx_signals", updated);
  };

  const deleteSignal = (id: string) => {
    const updated = signals.filter(s => s.id !== id);
    setSignals(updated);
    syncStorage("tfx_signals", updated);
  };

  const addBlog = (blog: Omit<Blog, "id" | "slug" | "date" | "readTime">) => {
    const newBlog: Blog = {
      ...blog,
      id: "blog-" + Math.floor(Math.random() * 10000),
      slug: blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      readTime: Math.max(1, Math.ceil(blog.content.split(" ").length / 200)) + " min read"
    };
    const updated = [newBlog, ...blogs];
    setBlogs(updated);
    syncStorage("tfx_blogs", updated);
  };

  const deleteBlog = (id: string) => {
    const updated = blogs.filter(b => b.id !== id);
    setBlogs(updated);
    syncStorage("tfx_blogs", updated);
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id" | "date">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: "j-" + Math.floor(Math.random() * 10000),
      date: new Date().toISOString().substring(0, 10)
    };
    const updated = [newEntry, ...journal];
    setJournal(updated);
    syncStorage("tfx_journal", updated);
  };

  const deleteJournalEntry = (id: string) => {
    const updated = journal.filter(j => j.id !== id);
    setJournal(updated);
    syncStorage("tfx_journal", updated);
  };

  const sendMessage = (message: Omit<ContactMessage, "id" | "timestamp">) => {
    const newMessage: ContactMessage = {
      ...message,
      id: "msg-" + Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    const updated = [newMessage, ...messages];
    setMessages(updated);
    syncStorage("tfx_messages", updated);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("tfx_theme", nextTheme);
      document.documentElement.className = nextTheme;
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        user,
        courses,
        signals,
        blogs,
        journal,
        messages,
        login,
        register,
        logout,
        enrollInCourse,
        upgradeUserTier,
        addCourse,
        deleteCourse,
        addSignal,
        deleteSignal,
        addBlog,
        deleteBlog,
        addJournalEntry,
        deleteJournalEntry,
        sendMessage,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
