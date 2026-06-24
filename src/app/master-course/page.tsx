"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap, BookOpen, Play, Check, Lock, Award,
  LogOut, User, Mail, Phone, Eye, EyeOff, Globe,
  ChevronDown, ChevronRight, AlertTriangle, Download,
  CheckCircle, BarChart3, ArrowRight, Star,
  Clock, Target, Trophy
} from "lucide-react";
import { useFirebaseAuth } from "@/lib/firebaseAuth";

// ─── Course Data ──────────────────────────────────────────────────────────────

const COURSE_MODULES = [
  {
    id: "m1", title: "Basics of Stock Market",
    lessons: [
      { id: "l1", title: "What is the Stock Market?", duration: "12 min" },
      { id: "l2", title: "How Markets Work & Key Participants", duration: "18 min" },
      { id: "l3", title: "Types of Financial Instruments", duration: "15 min" },
      { id: "l4", title: "Stock Exchanges & Trading Hours", duration: "10 min" },
    ]
  },
  {
    id: "m2", title: "Market Psychology & Trading Mindset",
    lessons: [
      { id: "l5", title: "Fear, Greed & Emotional Discipline", duration: "20 min" },
      { id: "l6", title: "Developing a Trader's Mindset", duration: "17 min" },
      { id: "l7", title: "Building Consistency & Patience", duration: "14 min" },
    ]
  },
  {
    id: "m3", title: "Technical Analysis",
    lessons: [
      { id: "l8", title: "Reading Candlestick Charts", duration: "22 min" },
      { id: "l9", title: "Support & Resistance Levels", duration: "19 min" },
      { id: "l10", title: "Trend Analysis & Market Structure", duration: "25 min" },
      { id: "l11", title: "Volume Analysis", duration: "16 min" },
    ]
  },
  {
    id: "m4", title: "Risk Management",
    lessons: [
      { id: "l12", title: "Position Sizing & Lot Size Calculation", duration: "18 min" },
      { id: "l13", title: "Stop Loss Strategies", duration: "15 min" },
      { id: "l14", title: "Risk-to-Reward Ratios", duration: "12 min" },
      { id: "l15", title: "Portfolio Protection Techniques", duration: "14 min" },
    ]
  },
  {
    id: "m5", title: "Price Action Trading",
    lessons: [
      { id: "l16", title: "Pin Bars, Engulfing & Doji Patterns", duration: "24 min" },
      { id: "l17", title: "Chart Pattern Recognition", duration: "28 min" },
      { id: "l18", title: "Price Action Entry Strategies", duration: "22 min" },
    ]
  },
  {
    id: "m6", title: "Smart Money Concepts (SMC)",
    lessons: [
      { id: "l19", title: "Institutional Order Flow", duration: "30 min" },
      { id: "l20", title: "Order Blocks & Breaker Blocks", duration: "27 min" },
      { id: "l21", title: "Fair Value Gaps (FVG)", duration: "22 min" },
      { id: "l22", title: "Liquidity Sweeps & Stop Hunts", duration: "25 min" },
    ]
  },
  {
    id: "m7", title: "ICT Concepts",
    lessons: [
      { id: "l23", title: "Market Maker Models (MMM)", duration: "28 min" },
      { id: "l24", title: "Kill Zones & Trading Sessions", duration: "20 min" },
      { id: "l25", title: "Power of 3 (AMD) Framework", duration: "24 min" },
    ]
  },
  {
    id: "m8", title: "Futures & Options Trading",
    lessons: [
      { id: "l26", title: "Introduction to Derivatives", duration: "18 min" },
      { id: "l27", title: "Understanding Futures Contracts", duration: "22 min" },
      { id: "l28", title: "Options Basics: Calls & Puts", duration: "25 min" },
    ]
  },
  {
    id: "m9", title: "Ultimate Options Trading",
    lessons: [
      { id: "l29", title: "Options Greeks Explained", duration: "30 min" },
      { id: "l30", title: "Advanced Options Strategies", duration: "35 min" },
      { id: "l31", title: "Options Chain Analysis", duration: "24 min" },
      { id: "l32", title: "Live Options Trade Examples", duration: "40 min" },
    ]
  },
  {
    id: "m10", title: "IBZ 3.0 Strategy",
    lessons: [
      { id: "l33", title: "IBZ 3.0 Framework Introduction", duration: "20 min" },
      { id: "l34", title: "Setup Identification Rules", duration: "28 min" },
      { id: "l35", title: "Live Trade Walkthroughs with IBZ 3.0", duration: "45 min" },
    ]
  },
  {
    id: "m11", title: "FTC Strategy",
    lessons: [
      { id: "l36", title: "FTC Strategy Core Rules", duration: "22 min" },
      { id: "l37", title: "Entry, TP & SL for FTC", duration: "18 min" },
      { id: "l38", title: "FTC Live Examples", duration: "35 min" },
    ]
  },
  {
    id: "m12", title: "Live Trade Examples",
    lessons: [
      { id: "l39", title: "XAUUSD Live Trade Review", duration: "30 min" },
      { id: "l40", title: "EURUSD Trade Analysis", duration: "28 min" },
      { id: "l41", title: "BTCUSD Breakdown", duration: "32 min" },
    ]
  },
  {
    id: "m13", title: "Trading Journal Setup",
    lessons: [
      { id: "l42", title: "Why Journaling Matters", duration: "12 min" },
      { id: "l43", title: "Building Your Trading Journal", duration: "18 min" },
      { id: "l44", title: "Performance Review Process", duration: "15 min" },
    ]
  },
  {
    id: "m14", title: "Advanced Risk-to-Reward Techniques",
    lessons: [
      { id: "l45", title: "Maximizing R-Multiple", duration: "20 min" },
      { id: "l46", title: "Trailing Stops & Partial Profits", duration: "16 min" },
      { id: "l47", title: "Building a Consistent Trading Edge", duration: "25 min" },
    ]
  }
];

const ALL_LESSON_IDS = COURSE_MODULES.flatMap(m => m.lessons.map(l => l.id));

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function CourseAuthGate({ onSuccess }: { onSuccess: () => void }) {
  const { signUp, signIn, signInWithGoogle, resetPassword, loading, error, clearError } = useFirebaseAuth();
  const [mode, setMode] = useState<"login" | "register" | "reset">("register");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [localError, setLocalError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setLocalError(""); clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      if (!form.firstName || !form.lastName) { setLocalError("Full name required."); return; }
      if (form.password.length < 6) { setLocalError("Password must be at least 6 characters."); return; }
      if (form.password !== form.confirm) { setLocalError("Passwords do not match."); return; }
      const ok = await signUp({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
      if (ok) onSuccess();
    } else if (mode === "login") {
      const ok = await signIn(form.email, form.password);
      if (ok) onSuccess();
    } else {
      const ok = await resetPassword(form.email);
      if (ok) setResetSent(true);
    }
  };

  const handleGoogle = async () => {
    const ok = await signInWithGoogle();
    if (ok) onSuccess();
  };

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Left — Marketing */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-[#050505] via-[#080505] to-[#050505] p-10 border-r border-panel-border relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gold/8 rounded-full blur-[100px]" />
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-wide" style={{ color: "#ffffff" }}>MASTER TRADER</span>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black leading-snug mb-3" style={{ color: "#ffffff", textShadow: "2px 2px 0 #000, -2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, 0 4px 8px rgba(0,0,0,0.9)" }}>
              Complete Trading Education from <span style={{ background: "linear-gradient(135deg, #FFF5C0 0%, #FFD700 50%, #D4AF37 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))" }}>Market Experts</span>
            </h2>
            <p className="text-sm" style={{ color: "#d1d5db" }}>
              From stock market basics to advanced SMC, options trading, and professional strategies — all in one program.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: BookOpen, text: "14 comprehensive modules" },
              { icon: Play, text: "47 video lessons with live examples" },
              { icon: Award, text: "Completion certificate on finish" },
              { icon: Target, text: "Progress tracking & quizzes" },
              { icon: Download, text: "Downloadable study materials" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <f.icon className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="text-sm" style={{ color: "#d1d5db" }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: "#FFD700" }}>14</div>
              <div className="text-[10px] uppercase font-bold" style={{ color: "#9ca3af" }}>Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: "#ffffff" }}>47</div>
              <div className="text-[10px] uppercase font-bold" style={{ color: "#9ca3af" }}>Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: "#4ade80" }}>∞</div>
              <div className="text-[10px] uppercase font-bold" style={{ color: "#9ca3af" }}>Access</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 relative z-10">
          {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-gold fill-current" />)}
          <span className="text-xs ml-2" style={{ color: "#9ca3af" }}>Rated 4.9/5 by 2,800+ students</span>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-title text-sm">MASTER TRADER COURSE</span>
          </div>

          <h2 className="text-2xl font-extrabold text-title mb-1">
            {mode === "register" ? "Enroll in Master Trader" : mode === "login" ? "Access Your Course" : "Reset Password"}
          </h2>
          <p className="text-xs text-desc mb-6">
            {mode === "register" ? "Register to unlock all 14 modules instantly" : mode === "login" ? "Sign in to continue your learning journey" : "We'll send a reset link to your email"}
          </p>

          {(error || localError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />{error || localError}
            </div>
          )}
          {resetSent && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-accent flex items-center gap-2">
              <CheckCircle className="w-3 h-3" /> Reset link sent — check your inbox.
            </div>
          )}

          {mode !== "reset" && (
            <>
              <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-panel-border bg-panel-bg hover:border-gold/30 text-title text-sm font-semibold mb-4 transition-all">
                <Globe className="w-4 h-4" /> Continue with Google
              </button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-panel-border" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-app-bg text-[10px] text-desc uppercase font-bold">or email & password</span></div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-desc mb-1 block">First Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-desc absolute left-3 top-3" />
                    <input required value={form.firstName} onChange={set("firstName")} placeholder="Rahul" className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-gold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-desc mb-1 block">Last Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-desc absolute left-3 top-3" />
                    <input required value={form.lastName} onChange={set("lastName")} placeholder="Sharma" className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-gold" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-desc mb-1 block">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-desc absolute left-3 top-3" />
                <input type="email" required value={form.email} onChange={set("email")} placeholder="trader@gmail.com" className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-gold" />
              </div>
            </div>
            {mode === "register" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-desc mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-desc absolute left-3 top-3" />
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 9876543210" className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-gold" />
                </div>
              </div>
            )}
            {mode !== "reset" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-desc mb-1 block">Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-desc absolute left-3 top-3" />
                  <input type={showPass ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="••••••••" className="w-full pl-8 pr-9 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-gold" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-desc hover:text-title cursor-pointer">
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
            {mode === "register" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-desc mb-1 block">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-desc absolute left-3 top-3" />
                  <input type="password" required value={form.confirm} onChange={set("confirm")} placeholder="••••••••" className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-gold" />
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer">
              {loading ? "Please wait..." : mode === "register" ? "Enroll Now — Free Access" : mode === "login" ? "Access My Course" : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            {mode === "register" && (
              <button onClick={() => { setMode("login"); clearError(); }} className="text-xs text-desc">
                Already enrolled? <span className="text-amber-500 font-bold">Sign In →</span>
              </button>
            )}
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("reset"); clearError(); }} className="block w-full text-xs text-desc hover:text-title">
                  Forgot password? <span className="text-amber-500">Reset here</span>
                </button>
                <button onClick={() => { setMode("register"); clearError(); }} className="text-xs text-desc">
                  New student? <span className="text-amber-500 font-bold">Enroll Free →</span>
                </button>
              </>
            )}
            {mode === "reset" && (
              <button onClick={() => { setMode("login"); clearError(); setResetSent(false); }} className="text-xs text-amber-500 hover:underline">← Back to Sign In</button>
            )}
          </div>
          <p className="text-center text-[10px] text-desc mt-6">
            <Link href="/" className="hover:text-title">← Back to TRADEIFYFX Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Course Dashboard ─────────────────────────────────────────────────────────

function CourseDashboard() {
  const { user, updateLessonProgress, enrollProduct, signOut } = useFirebaseAuth();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["m1"]));
  const [activeLesson, setActiveLesson] = useState<string | null>("l1");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Auto-enroll on mount
    if (user && !user.enrolledProducts.includes("master-trader-course")) {
      enrollProduct("master-trader-course");
    }
  }, [user, enrollProduct]);

  if (!user) return null;

  const progress = user.courseProgress?.["master-trader-course"] || {};
  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalLessons = ALL_LESSON_IDS.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);
  const enrolledDate = new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    const current = progress[lessonId] ?? false;
    updateLessonProgress("master-trader-course", lessonId, !current);
  };

  const activeModule = COURSE_MODULES.find(m => m.lessons.some(l => l.id === activeLesson));
  const activeLessonData = activeModule?.lessons.find(l => l.id === activeLesson);

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-panel-bg border-b border-panel-border backdrop-blur-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1.5 rounded-lg text-desc hover:text-title mr-1">
              {sidebarOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-sm text-title hidden sm:block">MASTER TRADER COURSE</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress Bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-28 h-1.5 rounded-full bg-panel-border overflow-hidden">
                <div className="h-full bg-gradient-gold rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-[10px] text-desc font-bold">{progressPct}%</span>
            </div>
            <span className="hidden sm:block text-xs text-title font-bold">{user.firstName}</span>
            <button onClick={signOut} className="p-2 rounded-lg text-desc hover:text-red-400 hover:bg-red-500/5 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Course Outline */}
        <aside className={`fixed inset-y-14 left-0 z-20 w-72 bg-app-bg border-r border-panel-border overflow-y-auto transition-transform duration-300 md:translate-x-0 md:static md:h-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Progress Summary */}
          <div className="p-4 border-b border-panel-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-desc uppercase">Your Progress</span>
              <span className="text-xs font-black text-gold">{completedCount}/{totalLessons} lessons</span>
            </div>
            <div className="w-full h-2 rounded-full bg-panel-border overflow-hidden">
              <div className="h-full bg-gradient-gold rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            {progressPct === 100 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gold">
                <Award className="w-3.5 h-3.5" /> Course Complete! Certificate Earned 🎓
              </div>
            )}
          </div>

          {/* Module List */}
          <div className="py-2">
            {COURSE_MODULES.map((mod, mi) => {
              const modCompleted = mod.lessons.filter(l => progress[l.id]).length;
              const modExpanded = expandedModules.has(mod.id);
              return (
                <div key={mod.id}>
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-panel-bg/50 transition-colors group"
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[9px] font-black ${modCompleted === mod.lessons.length ? "bg-gold border-gold text-black" : "border-panel-border text-desc"}`}>
                      {modCompleted === mod.lessons.length ? <Check className="w-3 h-3" /> : mi + 1}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[11px] font-bold text-title truncate">{mod.title}</div>
                      <div className="text-[9px] text-desc">{modCompleted}/{mod.lessons.length} done</div>
                    </div>
                    {modExpanded ? <ChevronDown className="w-3.5 h-3.5 text-desc flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-desc flex-shrink-0" />}
                  </button>
                  {modExpanded && (
                    <div className="pl-9 pr-4 pb-1 space-y-0.5">
                      {mod.lessons.map(lesson => {
                        const done = progress[lesson.id] ?? false;
                        const isActive = activeLesson === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => { setActiveLesson(lesson.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all text-[11px] ${isActive ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : done ? "text-green-accent hover:bg-panel-bg" : "text-sec hover:bg-panel-bg hover:text-title"}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500/20 border-green-500/30" : "border-panel-border"}`}>
                              {done ? <Check className="w-2.5 h-2.5 text-green-accent" /> : <Play className="w-2 h-2 text-desc" />}
                            </div>
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <span className="text-[9px] text-desc flex-shrink-0 font-mono">{lesson.duration}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {activeLessonData && activeModule ? (
            <div className="max-w-4xl mx-auto p-5 md:p-8 space-y-6">
              {/* Video Player Mock */}
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#0d0d14] to-[#1a1225] border border-amber-500/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/30 cursor-pointer transition-all hover:scale-110">
                    <Play className="w-7 h-7 text-amber-400 fill-current ml-1" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{activeLessonData.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{activeModule.title} · {activeLessonData.duration}</p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 text-[9px] text-amber-400 font-mono bg-black/60 px-2 py-0.5 rounded">{activeLessonData.duration}</div>
              </div>

              {/* Lesson Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-desc font-bold uppercase mb-1">{activeModule.title}</div>
                  <h1 className="text-xl font-extrabold text-title">{activeLessonData.title}</h1>
                </div>
                <button
                  onClick={() => toggleLesson(activeLessonData.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${progress[activeLessonData.id] ? "bg-green-500/20 border border-green-500/30 text-green-accent hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20" : "bg-gradient-gold text-black glow-gold hover:opacity-90"}`}
                >
                  {progress[activeLessonData.id] ? <><Check className="w-3.5 h-3.5" /> Completed</> : <><Play className="w-3.5 h-3.5" /> Mark Complete</>}
                </button>
              </div>

              {/* Lesson Notes */}
              <div className="glass-panel p-5 rounded-2xl border-panel-border bg-panel-bg space-y-3">
                <h3 className="text-sm font-bold text-title flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-400" /> Lesson Overview</h3>
                <p className="text-xs text-desc leading-relaxed">
                  This lesson covers {activeLessonData.title.toLowerCase()} as part of the {activeModule.title} module.
                  Watch the full video, take notes, and mark it complete when you&apos;re ready to move on.
                  Each module builds on the previous one, so we recommend completing lessons in order.
                </p>
                <div className="flex gap-3 pt-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-panel-border text-desc hover:text-title transition-colors text-xs font-bold uppercase">
                    <Download className="w-3.5 h-3.5" /> Notes PDF
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-panel-border text-desc hover:text-title transition-colors text-xs font-bold uppercase">
                    <BarChart3 className="w-3.5 h-3.5" /> Quiz
                  </button>
                </div>
              </div>

              {/* Next Lesson CTA */}
              {(() => {
                const allLessons = COURSE_MODULES.flatMap(m => m.lessons);
                const currentIdx = allLessons.findIndex(l => l.id === activeLessonData.id);
                const next = allLessons[currentIdx + 1];
                if (!next) return null;
                return (
                  <div className="flex items-center justify-between glass-panel p-4 rounded-xl border-panel-border bg-panel-bg">
                    <div>
                      <div className="text-[10px] text-desc font-bold uppercase">Next Lesson</div>
                      <div className="text-xs font-bold text-title">{next.title}</div>
                    </div>
                    <button onClick={() => setActiveLesson(next.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-gold text-black text-xs font-bold uppercase">
                      Continue <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Welcome Screen */
            <div className="max-w-3xl mx-auto p-8 space-y-8">
              {/* Welcome Banner */}
              <div className="glass-panel p-7 rounded-2xl border-amber-500/20 bg-panel-bg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px]" />
                <GraduationCap className="w-12 h-12 text-amber-400 mb-4" />
                <h1 className="text-2xl font-black text-title mb-2">Welcome, {user.firstName}! 🎓</h1>
                <p className="text-sm text-desc mb-4">
                  You are now enrolled in the <span className="text-title font-bold">Master Trader Course</span>. Enrollment date: {enrolledDate}.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: BookOpen, label: "14 Modules", color: "text-amber-400" },
                    { icon: Play, label: "47 Lessons", color: "text-blue-400" },
                    { icon: Clock, label: `${progressPct}% Done`, color: "text-green-accent" },
                    { icon: Trophy, label: "Certificate", color: "text-gold" },
                  ].map((s, i) => (
                    <div key={i} className="glass-panel p-3 rounded-xl border-panel-border bg-panel-bg text-center">
                      <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                      <div className="text-[10px] font-bold text-sec">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Preview */}
              {progressPct === 100 && (
                <div className="glass-panel p-6 rounded-2xl border-gold/30 bg-panel-bg text-center">
                  <Award className="w-16 h-16 text-gold mx-auto mb-3" />
                  <h2 className="text-lg font-black text-gradient-gold mb-2">Course Completed!</h2>
                  <p className="text-xs text-desc mb-4">Congratulations {user.displayName} — you have completed the Master Trader Course.</p>
                  <button className="px-6 py-3 rounded-xl bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase shadow-lg hover:opacity-90 flex items-center gap-2 mx-auto">
                    <Download className="w-4 h-4" /> Download Certificate
                  </button>
                </div>
              )}

              {/* Start Button */}
              <button onClick={() => setActiveLesson("l1")} className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold tracking-wider uppercase shadow-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm">
                <Play className="w-5 h-5 fill-white" /> Start Learning Now
              </button>

              {/* Module Quick Access */}
              <div>
                <h3 className="text-sm font-bold text-title mb-3">Course Modules</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COURSE_MODULES.map((mod, i) => {
                    const done = mod.lessons.filter(l => progress[l.id]).length;
                    const complete = done === mod.lessons.length;
                    return (
                      <button key={mod.id} onClick={() => { setActiveLesson(mod.lessons[0].id); setExpandedModules(prev => new Set([...prev, mod.id])); }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${complete ? "border-green-500/30 bg-green-500/5" : "border-panel-border bg-panel-bg hover:border-amber-500/30"}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs ${complete ? "bg-green-500/20 text-green-accent" : "bg-amber-500/10 text-amber-400"}`}>
                          {complete ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-[11px] font-bold text-title truncate">{mod.title}</div>
                          <div className="text-[9px] text-desc">{done}/{mod.lessons.length} lessons</div>
                        </div>
                        {!complete && <Lock className="w-3 h-3 text-desc flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function MasterCourseRoot() {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-desc">Loading course platform...</p>
        </div>
      </div>
    );
  }

  if (!user) return <CourseAuthGate onSuccess={() => {}} />;
  return <CourseDashboard />;
}

export default function MasterCoursePage() {
  return <MasterCourseRoot />;
}
