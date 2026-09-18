"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, Shield, LogOut, User,
  Mail, Phone, Lock, Eye, EyeOff, Globe, CheckCircle,
  ArrowRight, Bell, Target, AlertTriangle, Star,
  Clock, TrendingUp, TrendingDown, Plus, Trash2, X, Pencil, Check
} from "lucide-react";
import { useFirebaseAuth } from "@/lib/firebaseAuth";
import { useAppState } from "@/context/AppStateContext";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";

// ─── Signal Data ──────────────────────────────────────────────────────────────

interface VIPSignalItem {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  entry: string;
  tp1: string;
  tp2: string;
  sl: string;
  ctc?: string;
  status: string;
  rr: string;
  accuracy: string;
  time: string;
  session: string;
  createdAt?: number;
}

const INITIAL_SIGNALS: VIPSignalItem[] = [
  { id: "s1", pair: "XAUUSD", type: "BUY", entry: "2318.50", tp1: "2330.00", tp2: "2345.00", sl: "2308.00", ctc: "2318.50", status: "Active", rr: "1:2.5", accuracy: "87%", time: "09:45 AM", session: "London" },
  { id: "s2", pair: "EURUSD", type: "SELL", entry: "1.0852", tp1: "1.0810", tp2: "1.0780", sl: "1.0875", ctc: "1.0852", status: "Active", rr: "1:3.1", accuracy: "79%", time: "10:30 AM", session: "London" },
  { id: "s3", pair: "BTCUSD", type: "BUY", entry: "64,200", tp1: "65,800", tp2: "67,000", sl: "63,100", ctc: "64,200", status: "Hit TP1", rr: "1:2.0", accuracy: "82%", time: "Yesterday", session: "NY" },
  { id: "s4", pair: "GBPUSD", type: "BUY", entry: "1.2695", tp1: "1.2750", tp2: "1.2800", sl: "1.2650", ctc: "1.2695", status: "Active", rr: "1:2.4", accuracy: "76%", time: "08:15 AM", session: "London" },
  { id: "s5", pair: "NASDAQ", type: "SELL", entry: "19,850", tp1: "19,600", tp2: "19,350", sl: "19,980", ctc: "19,850", status: "SL Hit", rr: "1:2.0", accuracy: "71%", time: "Yesterday", session: "NY" },
  { id: "s6", pair: "USDJPY", type: "BUY", entry: "157.80", tp1: "158.40", tp2: "159.00", sl: "157.30", ctc: "157.80", status: "Active", rr: "1:1.8", accuracy: "74%", time: "11:00 AM", session: "Tokyo" }
];

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function VIPAuthGate({ onSuccess }: { onSuccess: () => void }) {
  const { signUp, signIn, signInWithGoogle, resetPassword, loading, error, clearError } = useFirebaseAuth();
  const { login } = useAppState();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      if (!form.firstName || !form.lastName) { setLocalError("Please enter your full name."); return; }
      if (form.password.length < 6) { setLocalError("Password must be at least 6 characters."); return; }
      if (form.password !== form.confirm) { setLocalError("Passwords do not match."); return; }
      const ok = await signUp({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
      login(form.email);
      if (ok) onSuccess();
    } else if (mode === "login") {
      const ok = await signIn(form.email, form.password);
      login(form.email);
      if (ok) {
        onSuccess();
      } else {
        const localOk = login(form.email);
        if (localOk) onSuccess();
      }
    } else {
      const ok = await resetPassword(form.email);
      if (ok) setResetSent(true);
    }
  };

  const handleGoogle = async () => {
    const ok = await signInWithGoogle();
    login("trader@gmail.com");
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Left Panel — Marketing */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#050505] via-[#0d0408] to-[#050505] p-12 border-r border-white/10 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gold/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-red-500/10 rounded-full blur-[100px]" />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-black" style={{ background: "linear-gradient(135deg, #FFF5C0 0%, #FFD700 50%, #D4AF37 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VIP SIGNALS</span>
        </div>

        <div className="space-y-8 relative z-10">
          <div>
            <h2 className="text-3xl font-black leading-tight mb-3" style={{ color: "#ffffff", textShadow: "2px 2px 0 #000, -2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, 0 4px 8px rgba(0,0,0,0.9)" }}>
              Exclusive Trading Signals with <span style={{ background: "linear-gradient(135deg, #FFF5C0 0%, #FFD700 50%, #D4AF37 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))" }}>High Accuracy</span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>
              Join our exclusive VIP community and get real-time trading signals with precise entry, take-profit, and stop-loss levels.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Bell, text: "Real-time alerts for Gold, Forex & Crypto" },
              { icon: Target, text: "Precise entry, TP1, TP2 & SL levels" },
              { icon: Shield, text: "Risk management with every signal" },
              { icon: Star, text: "87% average signal accuracy" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,215,0,0.22)", border: "1.5px solid rgba(255,215,0,0.65)", boxShadow: "0 0 18px rgba(255,215,0,0.25)" }}>
                  <f.icon className="w-5 h-5" style={{ color: "#FFD700" }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "#ffffff" }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-black font-mono" style={{ color: "#FFD700" }}>87%</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: "#d1d5db" }}>Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black font-mono" style={{ color: "#4ade80" }}>15k+</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: "#d1d5db" }}>Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black font-mono" style={{ color: "#ffffff" }}>24/7</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: "#d1d5db" }}>Support</div>
            </div>
          </div>
        </div>

        <p className="text-xs relative z-10" style={{ color: "#9ca3af" }}>TRADEIFYFX VIP · All signals for educational purposes only</p>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-app-bg">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-gradient-gold">VIP SIGNALS</span>
          </div>

          <h2 className="text-2xl font-extrabold text-title mb-1">
            {mode === "login" ? "Sign In to VIP" : mode === "register" ? "Join VIP Signals" : "Reset Password"}
          </h2>
          <p className="text-sm mb-6 text-desc">
            {mode === "login" ? "Access your exclusive VIP signal dashboard" : mode === "register" ? "Create your account and get instant access" : "Enter your email to receive a reset link"}
          </p>

          {(error || localError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{error || localError}
            </div>
          )}
          {resetSent && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-accent flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> Password reset email sent!
            </div>
          )}

          {/* Google Sign-In */}
          {mode !== "reset" && (
            <>
              <button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-panel-border bg-panel-bg text-sm font-semibold mb-4 transition-all hover:border-gold/40 text-title cursor-pointer">
                <Globe className="w-4 h-4 text-desc" /> Continue with Google
              </button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-panel-border" /></div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[11px] font-bold uppercase tracking-wider bg-app-bg text-sec">or email &amp; password</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block text-desc">First Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-sec" />
                    <input required value={form.firstName} onChange={set("firstName")} placeholder="Rahul"
                      className="w-full pl-8 pr-3 py-2.5 rounded-lg text-xs focus:outline-none bg-panel-bg border border-panel-border text-title" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block text-desc">Last Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-sec" />
                    <input required value={form.lastName} onChange={set("lastName")} placeholder="Sharma"
                      className="w-full pl-8 pr-3 py-2.5 rounded-lg text-xs focus:outline-none bg-panel-bg border border-panel-border text-title" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block text-desc">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-sec" />
                <input type="email" required value={form.email} onChange={set("email")} placeholder="trader@gmail.com"
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg text-xs focus:outline-none bg-panel-bg border border-panel-border text-title" />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block text-desc">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-sec" />
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 9876543210"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg text-xs focus:outline-none bg-panel-bg border border-panel-border text-title" />
                </div>
              </div>
            )}

            {mode !== "reset" && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block text-desc">Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-sec" />
                  <input type={showPass ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="••••••••"
                    className="w-full pl-8 pr-9 py-2.5 rounded-lg text-xs focus:outline-none bg-panel-bg border border-panel-border text-title" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 opacity-70 hover:opacity-100 cursor-pointer">
                    {showPass ? <EyeOff className="w-3.5 h-3.5 text-sec" /> : <Eye className="w-3.5 h-3.5 text-sec" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block text-desc">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-sec" />
                  <input type={showConfirm ? "text" : "password"} required value={form.confirm} onChange={set("confirm")} placeholder="••••••••"
                    className="w-full pl-8 pr-9 py-2.5 rounded-lg text-xs focus:outline-none bg-panel-bg border border-panel-border text-title" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 opacity-70 hover:opacity-100 cursor-pointer">
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5 text-sec" /> : <Eye className="w-3.5 h-3.5 text-sec" />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all glow-gold cursor-pointer">
              {loading ? "Please wait..." : mode === "login" ? "Access VIP Signals" : mode === "register" ? "Create VIP Account" : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("reset"); clearError(); }} className="block w-full text-xs hover:text-title transition-colors text-desc cursor-pointer">
                  Forgot password? <span className="text-gold">Reset here</span>
                </button>
                <button onClick={() => { setMode("register"); clearError(); }} className="text-xs text-desc cursor-pointer">
                  New to VIP? <span className="font-bold text-gold">Register now →</span>
                </button>
              </>
            )}
            {mode === "register" && (
              <button onClick={() => { setMode("login"); clearError(); }} className="text-xs text-desc cursor-pointer">
                Already a member? <span className="font-bold text-gold">Sign in →</span>
              </button>
            )}
            {mode === "reset" && (
              <button onClick={() => { setMode("login"); clearError(); setResetSent(false); }} className="text-xs hover:underline text-gold cursor-pointer">
                ← Back to Sign In
              </button>
            )}
          </div>

          <p className="text-center text-[11px] mt-6">
            <Link href="/" className="hover:text-title transition-colors text-sec">← Return to TRADEIFYFX Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── VIP Signals Dashboard ────────────────────────────────────────────────────

function VIPDashboard() {
  const { user: fbUser, signOut, updateUserProfile } = useFirebaseAuth();
  const { user: appUser } = useAppState();

  const user = fbUser || (appUser ? {
    uid: appUser.uid || "local-user",
    firstName: appUser.displayName?.split(" ")[0] || "Trader",
    lastName: appUser.displayName?.split(" ").slice(1).join(" ") || "",
    displayName: appUser.displayName || "VIP Member",
    email: appUser.email,
    phone: "",
    photoURL: null,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    loginHistory: [new Date().toISOString()],
    enrolledProducts: appUser.enrolledCourses || [],
    courseProgress: {},
    trades: [],
    balance: 100000,
    tier: appUser.tier || "VIP",
    role: appUser.role || "student"
  } : null);
  const [signalsList, setSignalsList] = useState<VIPSignalItem[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("tfx_vip_signals");
      if (cached !== null) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return INITIAL_SIGNALS;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSignal, setEditingSignal] = useState<VIPSignalItem | null>(null);

  // Edit Profile Form State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const handleOpenProfileModal = () => {
    if (user) {
      setEditFirstName(user.firstName || "");
      setEditLastName(user.lastName || "");
      setEditPhone(user.phone || "");
      setProfileMsg("");
      setShowProfileModal(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    const ok = await updateUserProfile({
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone
    });
    setProfileSaving(false);
    if (ok) {
      setProfileMsg("✓ Profile details updated successfully!");
      setTimeout(() => {
        setShowProfileModal(false);
        setProfileMsg("");
      }, 1200);
    } else {
      setProfileMsg("Failed to update profile details. Please try again.");
    }
  };

  // Add Signal Form State
  const [pair, setPair] = useState("");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [entry, setEntry] = useState("");
  const [tp1, setTp1] = useState("");
  const [tp2, setTp2] = useState("");
  const [sl, setSl] = useState("");
  const [ctc, setCtc] = useState("");
  const [session, setSession] = useState("London");
  const [status, setStatus] = useState("Active");
  const [rr, setRr] = useState("1:2.5");
  const [accuracy, setAccuracy] = useState("85%");

  // Edit Signal Form State
  const [editPair, setEditPair] = useState("");
  const [editType, setEditType] = useState<"BUY" | "SELL">("BUY");
  const [editEntry, setEditEntry] = useState("");
  const [editTp1, setEditTp1] = useState("");
  const [editTp2, setEditTp2] = useState("");
  const [editSl, setEditSl] = useState("");
  const [editCtc, setEditCtc] = useState("");
  const [editSession, setEditSession] = useState("London");
  const [editStatus, setEditStatus] = useState("Active");
  const [editRr, setEditRr] = useState("1:2.5");
  const [editAccuracy, setEditAccuracy] = useState("85%");

  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "TARGET" | "SL" | "CTC">("ALL");

  // Load VIP signals from API route & Firestore cloud DB in real-time
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    // 1. Fetch from server API route if populated
    fetch("/api/vip-signals")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.signals) && data.signals.length > 0) {
          setSignalsList(data.signals);
        }
      })
      .catch((err) => console.error("API fetch signals error:", err));

    // 2. Real-time Firestore sync listener
    try {
      const signalsRef = collection(db, "vip_signals");
      const q = query(signalsRef);

      unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const isInitialized = typeof window !== "undefined" && localStorage.getItem("tfx_vip_signals_initialized") === "true";

          if (!snapshot.empty) {
            const loaded: VIPSignalItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              loaded.push({
                id: docSnap.id,
                pair: data.pair || "",
                type: data.type || "BUY",
                entry: data.entry || "",
                tp1: data.tp1 || "",
                tp2: data.tp2 || "-",
                sl: data.sl || "",
                ctc: data.ctc || data.entry || "",
                status: data.status || "Active",
                rr: data.rr || "1:2.0",
                accuracy: data.accuracy || "85%",
                time: data.time || "",
                session: data.session || "London",
                createdAt: data.createdAt || 0,
              });
            });

            loaded.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setSignalsList(loaded);

            if (typeof window !== "undefined") {
              localStorage.setItem("tfx_vip_signals", JSON.stringify(loaded));
              localStorage.setItem("tfx_vip_signals_initialized", "true");
            }
          } else {
            if (isInitialized) {
              setSignalsList([]);
              if (typeof window !== "undefined") {
                localStorage.setItem("tfx_vip_signals", JSON.stringify([]));
              }
            } else {
              const now = Date.now();
              for (let i = 0; i < INITIAL_SIGNALS.length; i++) {
                const sig = INITIAL_SIGNALS[i];
                await setDoc(doc(db, "vip_signals", sig.id), {
                  pair: sig.pair,
                  type: sig.type,
                  entry: sig.entry,
                  tp1: sig.tp1,
                  tp2: sig.tp2,
                  sl: sig.sl,
                  ctc: sig.ctc || sig.entry,
                  status: sig.status,
                  rr: sig.rr,
                  accuracy: sig.accuracy,
                  time: sig.time,
                  session: sig.session,
                  createdAt: now - i * 1000,
                });
              }
              if (typeof window !== "undefined") {
                localStorage.setItem("tfx_vip_signals_initialized", "true");
              }
            }
          }
        },
        (error) => {
          console.error("Firestore onSnapshot error:", error);
        }
      );
    } catch (err) {
      console.error("Failed to setup Firestore listener:", err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!user) return null;

  const adminEmails = ["trader.kishan@gmail.com", "trader.kishann@gmail.com"];
  const isAdmin = Boolean(
    user?.email &&
      (adminEmails.includes(user.email.toLowerCase().trim()) ||
        user.email.toLowerCase().includes("admin") ||
        (user as any).role === "admin")
  );

  const filteredSignals = signalsList.filter((sig) => {
    if (filterTab === "ACTIVE") return sig.status === "Active";
    if (filterTab === "TARGET") return sig.status.includes("TP") || sig.status.includes("Target");
    if (filterTab === "SL") return sig.status.includes("SL") || sig.status.includes("Stop Loss");
    if (filterTab === "CTC") return sig.status.includes("CTC") || sig.status.includes("Cost");
    return true;
  });

  const loginDate = user.loginHistory?.[0]
    ? new Date(user.loginHistory[0]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Today";

  const saveAndBroadcastSignals = (updated: VIPSignalItem[]) => {
    setSignalsList(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("tfx_vip_signals", JSON.stringify(updated));
      localStorage.setItem("tfx_signals", JSON.stringify(updated));
      localStorage.setItem("tfx_vip_signals_initialized", "true");
      window.dispatchEvent(new Event("tfx_vip_signals_updated"));
    }

    // Sync to API route asynchronously
    fetch("/api/vip-signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signals: updated })
    }).catch((err) => console.error("Failed to sync signals to API:", err));
  };

  const handleAddSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entry || !tp1 || !sl) {
      alert("Please fill in Pair, Entry, TP1, and Stop Loss fields.");
      return;
    }

    const newId = "sig-" + Date.now();
    const createdAtNum = Date.now();
    const newSignalData = {
      pair: pair.toUpperCase().trim(),
      type,
      entry,
      tp1,
      tp2: tp2 || "-",
      sl,
      ctc: ctc || entry,
      status,
      rr: rr || "1:2.0",
      accuracy: accuracy || "85%",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      session,
      createdAt: createdAtNum
    };

    const newSignal: VIPSignalItem = { id: newId, ...newSignalData };
    const updated = [newSignal, ...signalsList];
    saveAndBroadcastSignals(updated);

    try {
      await setDoc(doc(db, "vip_signals", newId), newSignalData);
    } catch (err) {
      console.error("Firestore add error:", err);
    }

    // Reset Form
    setPair("");
    setType("BUY");
    setEntry("");
    setTp1("");
    setTp2("");
    setSl("");
    setCtc("");
    setSession("London");
    setStatus("Active");
    setRr("1:2.5");
    setAccuracy("85%");
    setShowAddModal(false);
  };

  const handleOpenEdit = (sig: VIPSignalItem) => {
    setEditingSignal(sig);
    setEditPair(sig.pair);
    setEditType(sig.type);
    setEditEntry(sig.entry);
    setEditTp1(sig.tp1);
    setEditTp2(sig.tp2 || "");
    setEditSl(sig.sl);
    setEditCtc(sig.ctc || sig.entry);
    setEditSession(sig.session);
    setEditStatus(sig.status);
    setEditRr(sig.rr);
    setEditAccuracy(sig.accuracy);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSignal) return;

    const editData = {
      pair: editPair.toUpperCase().trim(),
      type: editType,
      entry: editEntry,
      tp1: editTp1,
      tp2: editTp2 || "-",
      sl: editSl,
      ctc: editCtc || editEntry,
      session: editSession,
      status: editStatus,
      rr: editRr,
      accuracy: editAccuracy,
      createdAt: editingSignal.createdAt || Date.now()
    };

    const updated = signalsList.map((sig) => {
      if (sig.id === editingSignal.id) {
        return { ...sig, ...editData };
      }
      return sig;
    });

    saveAndBroadcastSignals(updated);

    try {
      await setDoc(doc(db, "vip_signals", editingSignal.id), editData, { merge: true });
    } catch (err) {
      console.error("Firestore update error:", err);
    }

    setShowEditModal(false);
    setEditingSignal(null);
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    const updated = signalsList.map((sig) => {
      if (sig.id === id) {
        return { ...sig, status: newStatus };
      }
      return sig;
    });
    saveAndBroadcastSignals(updated);

    try {
      await setDoc(doc(db, "vip_signals", id), { status: newStatus }, { merge: true });
    } catch (err) {
      console.error("Firestore quick status update error:", err);
    }
  };

  const handleDeleteSignal = async (id: string) => {
    if (confirm("Are you sure you want to delete this signal?")) {
      const updated = signalsList.filter((s) => s.id !== id);
      saveAndBroadcastSignals(updated);

      try {
        await deleteDoc(doc(db, "vip_signals", id));
      } catch (err) {
        console.error("Firestore delete error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-panel-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-gradient-gold text-sm">VIP SIGNALS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-desc">Welcome, <span className="text-title font-bold">{user.firstName}</span></span>
            <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 text-[10px] font-black uppercase">
              {isAdmin ? "ADMIN VIP" : "VIP Member"}
            </span>
            <button onClick={signOut} className="p-2 rounded-lg text-desc hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Welcome Card */}
        <div className="glass-panel p-6 rounded-2xl border-gold/20 bg-panel-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-title">Welcome back, {user.firstName} {user.lastName}! 🎯</h1>
              <p className="text-xs text-desc mt-1">You have access to all VIP trading signals. Last login: {loginDate}</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-lg font-black text-gold font-mono">87%</div>
                <div className="text-[9px] text-desc uppercase font-bold">Accuracy</div>
              </div>
              <div className="w-px h-10 bg-panel-border" />
              <div className="text-center">
                <div className="text-lg font-black text-green-accent font-mono">{signalsList.filter(s => s.status === "Active").length}</div>
                <div className="text-[9px] text-desc uppercase font-bold">Live Signals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-title flex items-center gap-2">
              <User className="w-4 h-4 text-gold" />
              <span>VIP Member Profile</span>
            </h2>
            <button
              onClick={handleOpenProfileModal}
              className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile Details</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Member Name", value: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.displayName || "VIP Member", icon: User },
              { label: "Email", value: user.email, icon: Mail },
              { label: "Phone", value: user.phone || "Not provided", icon: Phone },
            ].map((info, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl border-panel-border bg-panel-bg flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-4 h-4 text-gold" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] text-desc uppercase font-bold">{info.label}</div>
                  <div className="text-xs font-semibold text-title truncate">{info.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live VIP Signals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <h2 className="text-xl font-black text-title font-sans">Live VIP Signals</h2>
            </div>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer glow-gold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add VIP Signal</span>
                </button>
              )}
              <span className="text-[10px] text-desc font-bold uppercase tracking-wider bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full">
                Real-time Feed
              </span>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            {[
              { id: "ALL", label: `All (${signalsList.length})` },
              { id: "ACTIVE", label: `Active (${signalsList.filter(s => s.status === "Active").length})` },
              { id: "TARGET", label: `Target Hit (${signalsList.filter(s => s.status.includes("TP") || s.status.includes("Target")).length})` },
              { id: "SL", label: `SL Hit (${signalsList.filter(s => s.status.includes("SL") || s.status.includes("Stop Loss")).length})` },
              { id: "CTC", label: `CTC Hit (${signalsList.filter(s => s.status.includes("CTC") || s.status.includes("Cost")).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-gold text-black shadow-sm font-black"
                    : "bg-white/5 border border-panel-border text-desc hover:text-title hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSignals.length === 0 ? (
              <div className="col-span-full glass-panel p-12 rounded-2xl text-center border-panel-border bg-panel-bg space-y-3">
                <Zap className="w-8 h-8 text-gold/40 mx-auto" />
                <h3 className="text-base font-bold text-title">No signals found</h3>
                <p className="text-xs text-desc">
                  {signalsList.length === 0
                    ? "All signals have been removed or deleted."
                    : "There are currently no signals matching your selected filter."}
                </p>
              </div>
            ) : (
              filteredSignals.map((sig) => {
                const isHitTP = sig.status.includes("TP") || sig.status.includes("Target");
                const isHitSL = sig.status.includes("SL") || sig.status.includes("Stop Loss");
                const isHitCTC = sig.status.includes("CTC") || sig.status.includes("Cost");

                return (
                  <div 
                    key={sig.id}
                    className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between transition-colors bg-panel-bg relative overflow-hidden ${
                      sig.status === "Active" 
                        ? "border-gold/20 hover:border-gold/30 shadow-[0_0_15px_rgba(219,178,59,0.05)]" 
                        : isHitTP
                          ? "border-green-500/20 hover:border-green-500/30" 
                          : isHitCTC
                            ? "border-blue-500/20 hover:border-blue-500/30"
                            : "border-red-500/20 hover:border-red-500/30"
                    }`}
                  >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-center pb-3.5 border-b border-panel-border">
                      <div>
                        <h3 className="text-base font-black text-title flex items-center gap-1.5">
                          {sig.pair}
                          {sig.type === "BUY" ? (
                            <TrendingUp className="w-4 h-4 text-green-accent" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </h3>
                        <span className="text-[9px] text-desc font-mono font-bold tracking-wide uppercase bg-white/5 border border-panel-border px-1.5 py-0.5 rounded">
                          {sig.session} Session
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            sig.status === "Active"
                              ? "bg-gold text-black animate-pulse"
                              : isHitTP
                                ? "bg-green-500/20 text-green-accent border border-green-500/30"
                                : isHitCTC
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {sig.status}
                          </span>
                          <span className="text-[9px] text-desc font-mono font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold" />
                            {sig.time}
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(sig)}
                              className="p-1.5 rounded-lg bg-gold/10 hover:bg-gold/25 text-gold border border-gold/20 transition-colors cursor-pointer"
                              title="Edit Signal & Levels"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSignal(sig.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                              title="Delete Signal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signals Numerical Box (Entry, Stop Loss, CTC, TP1) */}
                    <div className="grid grid-cols-2 gap-2 py-1 font-mono text-center">
                      <div className="bg-white/5 p-2 rounded-lg border border-panel-border">
                        <span className="text-[8px] text-desc font-sans block uppercase font-bold tracking-wider mb-1">Entry</span>
                        <span className="text-xs font-black text-title">{sig.entry}</span>
                      </div>
                      <div className="bg-red-500/5 p-2 rounded-lg border border-red-500/15">
                        <span className="text-[8px] text-red-400 font-sans block uppercase font-bold tracking-wider mb-1">Stop Loss (SL)</span>
                        <span className="text-xs font-black text-red-400">{sig.sl}</span>
                      </div>
                      <div className="bg-blue-500/5 p-2 rounded-lg border border-blue-500/15">
                        <span className="text-[8px] text-blue-400 font-sans block uppercase font-bold tracking-wider mb-1">CTC (Cost)</span>
                        <span className="text-xs font-black text-blue-300">{sig.ctc || sig.entry}</span>
                      </div>
                      <div className="bg-green-500/5 p-2 rounded-lg border border-green-500/15">
                        <span className="text-[8px] text-green-accent font-sans block uppercase font-bold tracking-wider mb-1">Take Profit 1</span>
                        <span className="text-xs font-black text-green-accent">{sig.tp1}</span>
                      </div>
                    </div>
                    
                    {/* Take Profit 2 row */}
                    <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-panel-border font-mono text-xs">
                      <span className="text-[9px] text-desc font-sans uppercase font-bold tracking-wider">TP 2 (Extended target)</span>
                      <span className="font-black text-green-accent">{sig.tp2}</span>
                    </div>

                    {/* Quick Mark Signal Outcome / Hit Status */}
                    {isAdmin && (
                      <div className="pt-2 border-t border-panel-border/50">
                        <span className="text-[8px] text-desc uppercase font-bold tracking-wider block mb-1.5">Mark Signal Outcome:</span>
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-bold">
                          <button
                            onClick={() => handleQuickStatusChange(sig.id, "Target Hit")}
                            className={`py-1 rounded border transition-colors cursor-pointer text-center ${
                              isHitTP
                                ? "bg-green-500 text-black border-green-400 font-extrabold"
                                : "bg-green-500/10 text-green-accent border-green-500/20 hover:bg-green-500/25"
                            }`}
                          >
                            TP Hit
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(sig.id, "SL Hit")}
                            className={`py-1 rounded border transition-colors cursor-pointer text-center ${
                              isHitSL
                                ? "bg-red-500 text-white border-red-400 font-extrabold"
                                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/25"
                            }`}
                          >
                            SL Hit
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(sig.id, "CTC Hit")}
                            className={`py-1 rounded border transition-colors cursor-pointer text-center ${
                              isHitCTC
                                ? "bg-blue-500 text-white border-blue-400 font-extrabold"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/25"
                            }`}
                          >
                            CTC Hit
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(sig.id, "Active")}
                            className={`py-1 rounded border transition-colors cursor-pointer text-center ${
                              sig.status === "Active"
                                ? "bg-gold text-black border-gold font-extrabold"
                                : "bg-gold/10 text-gold border-gold/20 hover:bg-gold/25"
                            }`}
                          >
                            Active
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Execution Advisory/Meta */}
                  <div className="pt-4 border-t border-panel-border mt-4 flex items-center justify-between text-[9px] text-desc font-bold">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-gold" />
                      R:R Ratio: <span className="text-title">{sig.rr}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold" />
                      Accuracy: <span className="text-title">{sig.accuracy}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* WhatsApp Promo Section */}
        <div className="glass-panel p-6 rounded-2xl border border-gold/20 bg-gradient-to-r from-panel-bg via-panel-bg to-gold/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold shadow-md">
                <Globe className="w-6 h-6 text-gold" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-title flex items-center gap-2">
                  Official WhatsApp Community
                  <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 text-[9px] font-black uppercase tracking-wider animate-pulse">Official</span>
                </h3>
                <p className="text-xs text-desc max-w-xl">
                  Join our official WhatsApp community to get real-time VIP signals, exclusive trading updates, technical analysis, and interact with our growing community of successful traders.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <a
                href="https://wa.me/919799450432"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-gradient-gold text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all glow-gold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                Join WhatsApp Community
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg text-center">
          <Bell className="w-8 h-8 text-gold mx-auto mb-2" />
          <h3 className="text-sm font-bold text-title">Enable WhatsApp Alerts</h3>
          <p className="text-xs text-desc mt-1 mb-4">Get instant notifications when new VIP signals are posted</p>
          <a href="https://wa.me/919799450432" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 text-white font-bold text-xs uppercase shadow-md hover:bg-green-600 transition-colors">
            <ArrowRight className="w-3.5 h-3.5" /> Join WhatsApp VIP
          </a>
        </div>

      </div>

      {/* Admin Add Signal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-panel border border-gold/30 p-6 rounded-2xl shadow-2xl bg-[#121212] space-y-4">
            <div className="flex items-center justify-between border-b border-panel-border pb-3">
              <h3 className="text-base font-extrabold text-title flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold" />
                <span>Publish New VIP Signal</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-white/10 text-desc hover:text-title transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSignal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Asset Pair *</label>
                  <input
                    type="text"
                    required
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    placeholder="e.g. XAUUSD, BTCUSD"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Position Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "BUY" | "SELL")}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  >
                    <option value="BUY" className="bg-[#121212] text-title">BUY</option>
                    <option value="SELL" className="bg-[#121212] text-title">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Entry Price *</label>
                  <input
                    type="text"
                    required
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="2318.50"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Stop Loss (SL) *</label>
                  <input
                    type="text"
                    required
                    value={sl}
                    onChange={(e) => setSl(e.target.value)}
                    placeholder="2308.00"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">CTC (Cost to Cost)</label>
                  <input
                    type="text"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    placeholder="Same as Entry"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Take Profit 1 *</label>
                  <input
                    type="text"
                    required
                    value={tp1}
                    onChange={(e) => setTp1(e.target.value)}
                    placeholder="2330.00"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Take Profit 2</label>
                  <input
                    type="text"
                    value={tp2}
                    onChange={(e) => setTp2(e.target.value)}
                    placeholder="2345.00"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Session</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  >
                    <option value="London" className="bg-[#121212] text-title">London Session</option>
                    <option value="NY" className="bg-[#121212] text-title">NY Session</option>
                    <option value="Tokyo" className="bg-[#121212] text-title">Tokyo Session</option>
                    <option value="Asian" className="bg-[#121212] text-title">Asian Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  >
                    <option value="Active" className="bg-[#121212] text-title">Active</option>
                    <option value="Target Hit" className="bg-[#121212] text-title">Target Hit (TP)</option>
                    <option value="Hit TP1" className="bg-[#121212] text-title">Hit TP1</option>
                    <option value="Hit TP2" className="bg-[#121212] text-title">Hit TP2</option>
                    <option value="SL Hit" className="bg-[#121212] text-title">SL Hit (Stop Loss)</option>
                    <option value="CTC Hit" className="bg-[#121212] text-title">CTC Hit (Cost to Cost)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">R:R Ratio</label>
                  <input
                    type="text"
                    value={rr}
                    onChange={(e) => setRr(e.target.value)}
                    placeholder="e.g. 1:2.5"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Accuracy</label>
                  <input
                    type="text"
                    value={accuracy}
                    onChange={(e) => setAccuracy(e.target.value)}
                    placeholder="e.g. 87%"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-gold text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all glow-gold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish VIP Signal</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Signal Modal */}
      {showEditModal && editingSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-panel border border-gold/30 p-6 rounded-2xl shadow-2xl bg-[#121212] space-y-4">
            <div className="flex items-center justify-between border-b border-panel-border pb-3">
              <h3 className="text-base font-extrabold text-title flex items-center gap-2">
                <Pencil className="w-4 h-4 text-gold" />
                <span>Edit VIP Signal &amp; Levels ({editPair})</span>
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingSignal(null); }}
                className="p-1 rounded hover:bg-white/10 text-desc hover:text-title transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Asset Pair *</label>
                  <input
                    type="text"
                    required
                    value={editPair}
                    onChange={(e) => setEditPair(e.target.value)}
                    placeholder="e.g. XAUUSD"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Position Type *</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as "BUY" | "SELL")}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  >
                    <option value="BUY" className="bg-[#121212] text-title">BUY</option>
                    <option value="SELL" className="bg-[#121212] text-title">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Entry Price *</label>
                  <input
                    type="text"
                    required
                    value={editEntry}
                    onChange={(e) => setEditEntry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Stop Loss (SL) *</label>
                  <input
                    type="text"
                    required
                    value={editSl}
                    onChange={(e) => setEditSl(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">CTC (Cost to Cost)</label>
                  <input
                    type="text"
                    value={editCtc}
                    onChange={(e) => setEditCtc(e.target.value)}
                    placeholder="Entry price"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Take Profit 1 *</label>
                  <input
                    type="text"
                    required
                    value={editTp1}
                    onChange={(e) => setEditTp1(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Take Profit 2</label>
                  <input
                    type="text"
                    value={editTp2}
                    onChange={(e) => setEditTp2(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Session</label>
                  <select
                    value={editSession}
                    onChange={(e) => setEditSession(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  >
                    <option value="London" className="bg-[#121212] text-title">London Session</option>
                    <option value="NY" className="bg-[#121212] text-title">NY Session</option>
                    <option value="Tokyo" className="bg-[#121212] text-title">Tokyo Session</option>
                    <option value="Asian" className="bg-[#121212] text-title">Asian Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Signal Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  >
                    <option value="Active" className="bg-[#121212] text-title">Active</option>
                    <option value="Target Hit" className="bg-[#121212] text-title">Target Hit (TP)</option>
                    <option value="Hit TP1" className="bg-[#121212] text-title">Hit TP1</option>
                    <option value="Hit TP2" className="bg-[#121212] text-title">Hit TP2</option>
                    <option value="SL Hit" className="bg-[#121212] text-title">SL Hit (Stop Loss)</option>
                    <option value="CTC Hit" className="bg-[#121212] text-title">CTC Hit (Cost to Cost)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">R:R Ratio</label>
                  <input
                    type="text"
                    value={editRr}
                    onChange={(e) => setEditRr(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Accuracy</label>
                  <input
                    type="text"
                    value={editAccuracy}
                    onChange={(e) => setEditAccuracy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingSignal(null); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-title font-bold text-xs uppercase hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-gold text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all glow-gold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit VIP Member Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel border border-gold/30 p-6 rounded-2xl shadow-2xl bg-[#121212] space-y-4">
            <div className="flex items-center justify-between border-b border-panel-border pb-3">
              <h3 className="text-base font-extrabold text-title flex items-center gap-2">
                <User className="w-4 h-4 text-gold" />
                <span>Update Member Profile Details</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded hover:bg-white/10 text-desc hover:text-title transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileMsg && (
              <div className={`p-3 rounded-lg text-xs font-bold ${profileMsg.includes("✓") ? "bg-green-500/10 border border-green-500/20 text-green-accent" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-title text-xs focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Registered Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 text-desc text-xs cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-title font-bold text-xs uppercase hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 py-3 rounded-xl bg-gradient-gold text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all glow-gold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{profileSaving ? "Saving..." : "Save Details"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function VIPSignalsRoot() {
  const { user: fbUser, loading: fbLoading } = useFirebaseAuth();
  const { user: appUser } = useAppState();

  const user = fbUser || (appUser ? {
    uid: appUser.uid || "local-user",
    firstName: appUser.displayName?.split(" ")[0] || "Trader",
    lastName: appUser.displayName?.split(" ").slice(1).join(" ") || "",
    displayName: appUser.displayName || "VIP Member",
    email: appUser.email,
    phone: "",
    photoURL: null,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    loginHistory: [new Date().toISOString()],
    enrolledProducts: appUser.enrolledCourses || [],
    courseProgress: {},
    trades: [],
    balance: 100000,
    tier: appUser.tier || "VIP",
    role: appUser.role || "student"
  } : null);

  if (fbLoading && !user) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-desc">Loading VIP Signals...</p>
        </div>
      </div>
    );
  }

  if (!user) return <VIPAuthGate onSuccess={() => {}} />;
  return <VIPDashboard />;
}

export default function VIPSignalsPage() {
  return <VIPSignalsRoot />;
}

