"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useFirebaseAuth } from "@/lib/firebaseAuth";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

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

export interface BlogTableData {
  levelType: string;
  priceZone: string;
  significance: string;
}

export interface BlogItem {
  title: string;
  description: string;
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
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  fundamentalsTitle?: string;
  fundamentals?: BlogItem[];
  tableTitle?: string;
  tableSubtitle?: string;
  tableHeaderCol1?: string;
  tableHeaderCol2?: string;
  tableHeaderCol3?: string;
  tableData?: BlogTableData[];
  setupsTitle?: string;
  keySetups?: BlogItem[];
  rulesTitle?: string;
  riskRules?: BlogItem[];
  conclusionText?: string;
  disclaimerText?: string;
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
    description: "Complete trading education from market experts — from Forex trading basics to advanced SMC, options trading, and professional strategies.",
    features: [
      "Basics of Forex Trading",
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
    title: "Understanding Smart Money Concepts: The Liquidity Hunt Explained",
    slug: "understanding-smart-money-concepts",
    excerpt: "Learn how the Smart Money liquidity hunt works in trading. Discover buy-side vs sell-side liquidity, stop hunts, and how to trade alongside institutions.",
    category: "Forex Analysis",
    author: "Founder, TRADEIFYFX",
    date: "June 18, 2026",
    readTime: "5 min read",
    image: "/blog_smc.png",
    seoTitle: "Understanding Smart Money Concepts: The Liquidity Hunt Explained",
    metaDescription: "Learn how the Smart Money liquidity hunt works in trading. Discover buy-side vs sell-side liquidity, stop hunts, and how to trade alongside institutions.",
    keywords: [
      "smart money concepts",
      "liquidity hunt",
      "SMC trading",
      "buy-side liquidity",
      "sell-side liquidity",
      "forex liquidity sweep"
    ],
    content: "Have you ever entered a trade, placed your stop-loss just above a high or below a low, and watched the market spike right through your stop before reversing in your planned direction?\n\nThis is not bad luck—it is a Liquidity Hunt.\n\nIn Smart Money Concepts (SMC), institutional traders (banks, hedge funds, algorithms) need massive order volume to enter their multi-million-dollar positions. Understanding how these entities source that volume keeps you from becoming their exit liquidity.",
    fundamentalsTitle: "What Is Liquidity in Trading?",
    fundamentals: [
      {
        title: "Retail Thinking",
        description: "Retail traders look at support and resistance as hard walls where prices must bounce."
      },
      {
        title: "Smart Money Reality",
        description: "Large institutions view those exact same levels as pools of resting stop orders. To fill a massive buy order, smart money needs sellers. To fill a massive sell order, they need buyers."
      }
    ],
    tableTitle: "Buy-Side vs. Sell-Side Liquidity",
    tableSubtitle: "Understanding where institutional liquidity pools sit in the market structure:",
    tableHeaderCol1: "Liquidity Type",
    tableHeaderCol2: "Where It Sits",
    tableHeaderCol3: "What Rests There",
    tableData: [
      {
        levelType: "Buy-Side Liquidity (BSL)",
        priceZone: "Above equal highs & resistance",
        significance: "Breakout buy orders and short-sellers' stop-losses (buy stops)."
      },
      {
        levelType: "Sell-Side Liquidity (SSL)",
        priceZone: "Below equal lows & support",
        significance: "Breakdown sell orders and buyers' stop-losses (sell stops)."
      }
    ],
    setupsTitle: "How the Liquidity Hunt Unfolds (3 Stages)",
    keySetups: [
      {
        title: "1. The Trap (Accumulation)",
        description: "The market creates clear, obvious highs or lows. Retail traders place stops just behind these boundaries, stacking high-volume liquidity pools."
      },
      {
        title: "2. The Sweep (Liquidity Grab)",
        description: "Price pushes aggressively beyond the high or low. Wicks punch through the level, triggering stops and baiting breakout traders."
      },
      {
        title: "3. The Shift (Market Structure Shift)",
        description: "Immediately after taking the liquidity, price snaps back inside the original range, leaving behind a long wick and initiating the real move."
      }
    ],
    rulesTitle: "How to Trade Liquidity Hunts Instead of Getting Trapped",
    riskRules: [
      {
        title: "Stop Entering on Breakouts",
        description: "Treat obvious swing levels as target zones for manipulation rather than automatic trend-continuation triggers."
      },
      {
        title: "Wait for the Rejection Wick",
        description: "Look for a fake breakout that closes back within the key range on higher timeframes (1-Hour or 4-Hour)."
      },
      {
        title: "Confirm the Structure Break",
        description: "Enter only after lower timeframes (e.g., 5-minute or 15-minute) break structure in the reversal direction, confirming institutional participation."
      }
    ],
    conclusionText: "Trade where the market is forced to move, not where retail sentiment expects it to stop. Once you identify liquidity pools, you shift your mindset from chasing breakouts to anticipating institutional rebalances.",
    disclaimerText: "Disclaimer: This article is strictly for educational purposes and should not be taken as direct financial or investment advice. Always practice prudent risk management."
  },
  {
    id: "blog-2",
    title: "Gold Price Prediction & XAUUSD Outlook: Key Support & Resistance Levels",
    slug: "gold-xauusd-outlook-levels-watch",
    excerpt: "Simple Gold (XAUUSD) forecast and trading strategy. Learn the critical support at $4,255.99–$4,265, major resistance at $4,434–$4,448, and what moves next.",
    category: "Gold Market Analysis",
    author: "Gold Strategist, TRADEIFYFX",
    date: "June 17, 2026",
    readTime: "7 min read",
    image: "/blog_gold.png",
    seoTitle: "Gold Price Prediction & XAUUSD Outlook: Key Support & Resistance Levels",
    metaDescription: "Simple Gold (XAUUSD) forecast and trading strategy. Learn the critical support at $4,255.99–$4,265, major resistance at $4,434–$4,448, and what moves next.",
    keywords: [
      "Gold price prediction",
      "XAUUSD analysis",
      "Gold trading strategy",
      "Gold support and resistance",
      "XAUUSD outlook"
    ],
    content: "Gold (XAUUSD) remains the most heavily traded asset in the financial markets. After sweeping price action across recent sessions, traders are focused on one core question: Will gold sustain its bullish momentum, or are we set for a consolidation pull-back?\n\nTrading gold does not require over-complicated indicators. Tracking the primary macro catalysts alongside exact structural boundaries gives you the clearest roadmap.",
    fundamentals: [
      {
        title: "US Dollar & Interest Rate Expectations",
        description: "Gold moves inversely to the US Dollar. Weakness in the greenback or market anticipation of interest rate cuts lowers yields, making gold far more attractive to hold."
      },
      {
        title: "Central Bank Accumulation",
        description: "Global central banks continue to absorb bullion for reserve diversification, keeping long-term institutional bids active under the market."
      },
      {
        title: "Safe-Haven Positioning",
        description: "Escalating global uncertainties and sovereign debt concerns consistently redirect hedge funds and institutional liquidity into gold."
      }
    ],
    tableData: [
      {
        levelType: "Major Resistance (The Ceiling)",
        priceZone: "$4,434 – $4,448",
        significance: "Heavy seller liquidity and profit-taking zone. A confirmed breakout here clears the path for brand-new highs."
      },
      {
        levelType: "LVN (Low Volume Node)",
        priceZone: "$4,400",
        significance: "Low Volume Node (LVN) is a price zone where very few trades took place. Price moves through it rapidly without pausing because the market rejects that level."
      },
      {
        levelType: "Key Support (The Floor)",
        priceZone: "$4,255.99 – $4,265",
        significance: "High-demand buyer shelf. As long as this base holds, the primary bullish trend remains structurally intact."
      }
    ],
    keySetups: [
      {
        title: "The Resistance Breakout",
        description: "A clean 4-hour or daily candle close above $4,448 confirms buyer dominance, opening immediate upside expansion."
      },
      {
        title: "The Pullback Bounce",
        description: "If price retraces into the $4,255.99 – $4,265 support band, watch for bullish reversal patterns (such as hammer wicks or engulfing candles) for favorable risk-to-reward long entries."
      },
      {
        title: "The Breakdown Risk",
        description: "A daily close below $4,255.99 invalidates short-term bullish momentum, opening the door for a deeper correction toward psychological liquidity lower down."
      }
    ],
    riskRules: [
      {
        title: "Avoid Trading During High-Impact News",
        description: "Releases such as US CPI, Non-Farm Payrolls (NFP), and FOMC statements trigger unpredictable slippage and wide spreads. Wait 15–30 minutes after the release before taking entries."
      },
      {
        title: "Never Skip a Stop-Loss",
        description: "High volatility requires an automatic exit plan. Place stops beyond the defined support and resistance invalidation zones."
      },
      {
        title: "Cap Your Risk",
        description: "Never risk more than 1% to 2% of your total account equity on any single position."
      }
    ]
  },
  {
    id: "blog-3",
    title: "Trading Psychology Secrets: Why You Fail to Hold Winning Trades",
    slug: "psychology-secrets-winning-trades",
    excerpt: "Struggling to let your winners run? Discover the real trading psychology secrets behind closing trades too early and how to fix your fear of losing profit.",
    category: "Trading Psychology",
    author: "Psychology Coach, TRADEIFYFX",
    date: "June 15, 2026",
    readTime: "4 min read",
    image: "/blog_psychology.png",
    seoTitle: "Trading Psychology Secrets: Why You Fail to Hold Winning Trades",
    metaDescription: "Struggling to let your winners run? Discover the real trading psychology secrets behind closing trades too early and how to fix your fear of losing profit.",
    keywords: [
      "trading psychology secrets",
      "holding winning trades",
      "fear in trading",
      "trading discipline",
      "let winners run",
      "forex trading psychology"
    ],
    content: "Here is a painful pattern almost every trader experiences:\n\nYou hold your losing trades for hours, praying they bounce back to break-even. But the moment a trade turns green, your heart starts racing. You grab a tiny $20 profit and close the position. Ten minutes later, that exact trade rallies without you, hitting what would have been a $500 win.\n\nWhy does this happen? The problem is rarely your technical analysis or your indicators. The real barrier is trading psychology.",
    fundamentalsTitle: "The Psychology Trap: Loss Aversion",
    fundamentals: [
      {
        title: "When You Are Losing (Risk-Seeking)",
        description: "You accept massive risk and hold the loss because closing it turns paper loss into real pain."
      },
      {
        title: "When You Are Winning (Fear-Driven)",
        description: "You fear the profit will vanish. You rush to close the trade just to lock in relief, not because the chart gave you an exit signal."
      }
    ],
    tableTitle: "Trader Mindset Comparison Matrix",
    tableSubtitle: "How amateurs and professionals handle red vs. green trades:",
    tableHeaderCol1: "Trader Mindset",
    tableHeaderCol2: "Reaction to Red Trades",
    tableHeaderCol3: "Reaction to Green Trades & Result",
    tableData: [
      {
        levelType: "Amateur Trader",
        priceZone: "Holds & hopes (Risk-seeking)",
        significance: "Cuts profits instantly (Fear-driven) ➔ Small wins, giant losses."
      },
      {
        levelType: "Professional Trader",
        priceZone: "Cuts losses quickly without emotion",
        significance: "Lets winners reach targets patiently ➔ Small losses, giant wins."
      }
    ],
    setupsTitle: "Real Reasons You Cut Winners Too Early",
    keySetups: [
      {
        title: "Watching the P&L Instead of the Chart",
        description: "Staring at fluctuating dollar amounts triggers emotional survival instincts. The moment the balance ticks downward by $10, fear takes over and forces an impulse exit."
      },
      {
        title: "Trading Too Large (Over-Leverage)",
        description: "When position sizes are too big for your account equity, normal market breathing feels catastrophic. Proper risk sizing removes trade anxiety."
      },
      {
        title: "No Defined Exit Strategy",
        description: "Most traders spend 90% of their energy finding the perfect entry, but have zero concrete plan for trade management once they are inside the market."
      }
    ],
    rulesTitle: "4 Step-by-Step Rules to Hold Winning Trades",
    riskRules: [
      {
        title: "Switch to Points/Pips, Hide Dollar Balance",
        description: "Cover or minimize the live open profit window while a trade is active. Focus purely on technical market structure, not fluctuating account cash."
      },
      {
        title: "Use the Trailing Stop Technique",
        description: "Instead of manually closing the trade, trail your stop-loss behind valid higher lows or lower highs. Let the market take you out when trend momentum breaks."
      },
      {
        title: "Scale Out (Take Partial Profits)",
        description: "Secure 50% of your position at a clean 1:2 Risk-to-Reward ratio and shift the stop-loss to entry. Holding the remaining 50% for larger targets becomes emotionally effortless."
      },
      {
        title: "Walk Away from the Screen",
        description: "Once your entry, stop-loss, and take-profit targets are set, close the trading terminal. Micromanaging 1-minute candles ruins sound 4-hour setups."
      }
    ],
    conclusionText: "You do not need an 80% win rate to build sustained profitability in financial markets. You only need the discipline to keep losses small and the patience to let your winning setups hit their intended targets.",
    disclaimerText: "Disclaimer: This post is for educational and informational purposes only and does not constitute financial advice. Always trade with a structured risk management plan."
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

const ADMIN_EMAILS = ["trader.kishan@gmail.com", "trader.kishann@gmail.com"];
const isAdminEmail = (email: string): boolean => {
  if (!email) return false;
  const norm = email.toLowerCase().trim();
  return norm.includes("admin") || ADMIN_EMAILS.includes(norm);
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { user: fbUser, signOut: fbSignOut } = useFirebaseAuth();

  useEffect(() => {
    Promise.resolve().then(() => {
      if (fbUser) {
        const isAdmin = isAdminEmail(fbUser.email);
        const updatedUser: User = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || `${fbUser.firstName} ${fbUser.lastName}`.trim() || fbUser.email.split("@")[0].toUpperCase(),
          role: isAdmin ? "admin" : (fbUser.role || "student"),
          tier: isAdmin ? "VIP" : (fbUser.tier || "VIP"),
          enrolledCourses: fbUser.enrolledProducts || []
        };
        setUser(updatedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("tfx_user", JSON.stringify(updatedUser));
        }
      } else if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("tfx_user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
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
      if (storedSignals !== null) {
        try {
          const parsed = JSON.parse(storedSignals);
          if (Array.isArray(parsed)) setSignals(parsed);
        } catch (e) {
          console.error("Failed to parse stored signals", e);
        }
      } else {
        localStorage.setItem("tfx_signals", JSON.stringify(INITIAL_SIGNALS));
      }
      if (storedBlogs) {
        const parsed = JSON.parse(storedBlogs) as Blog[];
        const migrated = parsed.map(b => {
          if (b.id === "blog-1") return { ...INITIAL_BLOGS[0], ...b, title: INITIAL_BLOGS[0].title, excerpt: INITIAL_BLOGS[0].excerpt, content: INITIAL_BLOGS[0].content, seoTitle: INITIAL_BLOGS[0].seoTitle, metaDescription: INITIAL_BLOGS[0].metaDescription, keywords: INITIAL_BLOGS[0].keywords, fundamentalsTitle: INITIAL_BLOGS[0].fundamentalsTitle, fundamentals: INITIAL_BLOGS[0].fundamentals, tableTitle: INITIAL_BLOGS[0].tableTitle, tableSubtitle: INITIAL_BLOGS[0].tableSubtitle, tableHeaderCol1: INITIAL_BLOGS[0].tableHeaderCol1, tableHeaderCol2: INITIAL_BLOGS[0].tableHeaderCol2, tableHeaderCol3: INITIAL_BLOGS[0].tableHeaderCol3, tableData: INITIAL_BLOGS[0].tableData, setupsTitle: INITIAL_BLOGS[0].setupsTitle, keySetups: INITIAL_BLOGS[0].keySetups, rulesTitle: INITIAL_BLOGS[0].rulesTitle, riskRules: INITIAL_BLOGS[0].riskRules, conclusionText: INITIAL_BLOGS[0].conclusionText, disclaimerText: INITIAL_BLOGS[0].disclaimerText, image: "/blog_smc.png" };
          if (b.id === "blog-2") return { ...INITIAL_BLOGS[1], ...b, title: INITIAL_BLOGS[1].title, excerpt: INITIAL_BLOGS[1].excerpt, content: INITIAL_BLOGS[1].content, seoTitle: INITIAL_BLOGS[1].seoTitle, metaDescription: INITIAL_BLOGS[1].metaDescription, keywords: INITIAL_BLOGS[1].keywords, fundamentals: INITIAL_BLOGS[1].fundamentals, tableData: INITIAL_BLOGS[1].tableData, keySetups: INITIAL_BLOGS[1].keySetups, riskRules: INITIAL_BLOGS[1].riskRules, image: "/blog_gold.png" };
          if (b.id === "blog-3") return { ...INITIAL_BLOGS[2], ...b, title: INITIAL_BLOGS[2].title, excerpt: INITIAL_BLOGS[2].excerpt, content: INITIAL_BLOGS[2].content, seoTitle: INITIAL_BLOGS[2].seoTitle, metaDescription: INITIAL_BLOGS[2].metaDescription, keywords: INITIAL_BLOGS[2].keywords, fundamentalsTitle: INITIAL_BLOGS[2].fundamentalsTitle, fundamentals: INITIAL_BLOGS[2].fundamentals, tableTitle: INITIAL_BLOGS[2].tableTitle, tableSubtitle: INITIAL_BLOGS[2].tableSubtitle, tableHeaderCol1: INITIAL_BLOGS[2].tableHeaderCol1, tableHeaderCol2: INITIAL_BLOGS[2].tableHeaderCol2, tableHeaderCol3: INITIAL_BLOGS[2].tableHeaderCol3, tableData: INITIAL_BLOGS[2].tableData, setupsTitle: INITIAL_BLOGS[2].setupsTitle, keySetups: INITIAL_BLOGS[2].keySetups, rulesTitle: INITIAL_BLOGS[2].rulesTitle, riskRules: INITIAL_BLOGS[2].riskRules, conclusionText: INITIAL_BLOGS[2].conclusionText, disclaimerText: INITIAL_BLOGS[2].disclaimerText, image: "/blog_psychology.png" };
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

    if (isAdminEmail(normalizedEmail) || role === "admin") {
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
    const isAdmin = isAdminEmail(normalizedEmail) || role === "admin";
    const simulatedUser: User = {
      uid: "usr-" + Math.floor(Math.random() * 10000),
      email: normalizedEmail,
      displayName: name,
      role: isAdmin ? "admin" : (role || "student"),
      tier: isAdmin ? "VIP" : "Basic",
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

  const addSignal = async (signal: Omit<Signal, "id" | "timestamp">) => {
    const newId = "sig-" + Date.now();
    const createdAtNum = Date.now();
    const timeStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newSignal: Signal = {
      ...signal,
      id: newId,
      timestamp: timeStr
    };
    const updated = [newSignal, ...signals];
    setSignals(updated);
    syncStorage("tfx_signals", updated);
    syncStorage("tfx_vip_signals", updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("tfx_vip_signals_initialized", "true");
      window.dispatchEvent(new Event("tfx_vip_signals_updated"));
    }

    try {
      await setDoc(doc(db, "vip_signals", newId), {
        pair: signal.pair,
        type: signal.type,
        entry: signal.entry,
        tp1: signal.tp,
        tp2: "-",
        sl: signal.sl,
        ctc: signal.entry,
        status: signal.status,
        rr: "1:2.0",
        accuracy: "85%",
        time: timeStr,
        session: "London",
        createdAt: createdAtNum
      });

      fetch("/api/vip-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals: updated })
      }).catch((err) => console.error("Failed sync to API:", err));
    } catch (err) {
      console.error("Error adding signal to Firestore:", err);
    }
  };

  const deleteSignal = async (id: string) => {
    const updated = signals.filter(s => s.id !== id);
    setSignals(updated);
    syncStorage("tfx_signals", updated);
    syncStorage("tfx_vip_signals", updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("tfx_vip_signals_initialized", "true");
      window.dispatchEvent(new Event("tfx_vip_signals_updated"));
    }

    try {
      await deleteDoc(doc(db, "vip_signals", id));

      fetch("/api/vip-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals: updated })
      }).catch((err) => console.error("Failed sync to API:", err));
    } catch (err) {
      console.error("Error deleting signal from Firestore:", err);
    }
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
