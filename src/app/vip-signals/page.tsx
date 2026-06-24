"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap, Shield, LogOut, User,
  Mail, Phone, Lock, Eye, EyeOff, Globe, CheckCircle,
  ArrowRight, Bell, Target, AlertTriangle, Star,
  Clock, TrendingUp, TrendingDown
} from "lucide-react";
import { useFirebaseAuth } from "@/lib/firebaseAuth";

// ─── Signal Data ──────────────────────────────────────────────────────────────

const SIGNALS = [
  { id: "s1", pair: "XAUUSD", type: "BUY" as const, entry: "2318.50", tp1: "2330.00", tp2: "2345.00", sl: "2308.00", status: "Active" as const, rr: "1:2.5", accuracy: "87%", time: "09:45 AM", session: "London" },
  { id: "s2", pair: "EURUSD", type: "SELL" as const, entry: "1.0852", tp1: "1.0810", tp2: "1.0780", sl: "1.0875", status: "Active" as const, rr: "1:3.1", accuracy: "79%", time: "10:30 AM", session: "London" },
  { id: "s3", pair: "BTCUSD", type: "BUY" as const, entry: "64,200", tp1: "65,800", tp2: "67,000", sl: "63,100", status: "Hit TP1" as const, rr: "1:2.0", accuracy: "82%", time: "Yesterday", session: "NY" },
  { id: "s4", pair: "GBPUSD", type: "BUY" as const, entry: "1.2695", tp1: "1.2750", tp2: "1.2800", sl: "1.2650", status: "Active" as const, rr: "1:2.4", accuracy: "76%", time: "08:15 AM", session: "London" },
  { id: "s5", pair: "NASDAQ", type: "SELL" as const, entry: "19,850", tp1: "19,600", tp2: "19,350", sl: "19,980", status: "SL Hit" as const, rr: "1:2.0", accuracy: "71%", time: "Yesterday", session: "NY" },
  { id: "s6", pair: "USDJPY", type: "BUY" as const, entry: "157.80", tp1: "158.40", tp2: "159.00", sl: "157.30", status: "Active" as const, rr: "1:1.8", accuracy: "74%", time: "11:00 AM", session: "Tokyo" }
];

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function VIPAuthGate({ onSuccess }: { onSuccess: () => void }) {
  const { signUp, signIn, signInWithGoogle, resetPassword, loading, error, clearError } = useFirebaseAuth();
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
  const { user, signOut } = useFirebaseAuth();

  if (!user) return null;

  const loginDate = user.loginHistory?.[0] ? new Date(user.loginHistory[0]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Today";

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
            <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 text-[10px] font-black uppercase">VIP Member</span>
            <button onClick={signOut} className="p-2 rounded-lg text-desc hover:text-red-400 hover:bg-red-500/5 transition-colors" title="Sign Out">
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
                <div className="text-lg font-black text-green-accent font-mono">{SIGNALS.filter(s => s.status === "Active").length}</div>
                <div className="text-[9px] text-desc uppercase font-bold">Live Signals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Email", value: user.email, icon: Mail },
            { label: "Phone", value: user.phone || "Not provided", icon: Phone },
            { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: Shield }
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

        {/* Live VIP Signals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <h2 className="text-xl font-black text-title font-sans">Live VIP Signals</h2>
            </div>
            <span className="text-[10px] text-desc font-bold uppercase tracking-wider bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full">
              Real-time Feed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SIGNALS.map((sig) => (
              <div 
                key={sig.id}
                className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between transition-colors bg-panel-bg relative overflow-hidden ${
                  sig.status === "Active" 
                    ? "border-gold/20 hover:border-gold/30 shadow-[0_0_15px_rgba(219,178,59,0.05)]" 
                    : sig.status.includes("TP") 
                      ? "border-green-500/20 hover:border-green-500/30" 
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

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        sig.status === "Active"
                          ? "bg-gold text-black animate-pulse"
                          : sig.status.includes("TP")
                            ? "bg-green-500/20 text-green-accent border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {sig.status}
                      </span>
                      <span className="text-[9px] text-desc font-mono font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold" />
                        {sig.time}
                      </span>
                    </div>
                  </div>

                  {/* Signals Numerical Box */}
                  <div className="grid grid-cols-3 gap-2 py-2 font-mono text-center">
                    <div className="bg-white/5 p-2 rounded-lg border border-panel-border">
                      <span className="text-[8px] text-desc font-sans block uppercase font-bold tracking-wider mb-1">Entry</span>
                      <span className="text-xs font-black text-title">{sig.entry}</span>
                    </div>
                    <div className="bg-red-500/5 p-2 rounded-lg border border-red-500/15">
                      <span className="text-[8px] text-red-400 font-sans block uppercase font-bold tracking-wider mb-1">Stop Loss</span>
                      <span className="text-xs font-black text-red-400">{sig.sl}</span>
                    </div>
                    <div className="bg-green-500/5 p-2 rounded-lg border border-green-500/15 col-span-1">
                      <span className="text-[8px] text-green-accent font-sans block uppercase font-bold tracking-wider mb-1">TP 1</span>
                      <span className="text-xs font-black text-green-accent">{sig.tp1}</span>
                    </div>
                  </div>
                  
                  {/* Take Profit 2 row */}
                  <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-panel-border font-mono text-xs">
                    <span className="text-[9px] text-desc font-sans uppercase font-bold tracking-wider">TP 2 (Extended target)</span>
                    <span className="font-black text-green-accent">{sig.tp2}</span>
                  </div>
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
            ))}
          </div>
        </div>

        {/* Telegram Promo Section */}
        <div className="glass-panel p-6 rounded-2xl border border-gold/20 bg-gradient-to-r from-panel-bg via-panel-bg to-gold/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-title flex items-center gap-2">
                  Official Telegram Group
                  <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 text-[9px] font-black uppercase tracking-wider animate-pulse">Official</span>
                </h3>
                <p className="text-xs text-desc max-w-xl">
                  Join our official Telegram group to get real-time VIP signals, exclusive trading updates, technical analysis, and interact with our growing community of successful traders.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-panel-border bg-black/30 text-xs font-mono text-sec select-all">
                <Globe className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>t.me/Tradeifyfx_1</span>
              </div>
              <a
                href="https://t.me/Tradeifyfx_1"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-gradient-gold text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all glow-gold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                Join Channel
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
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function VIPSignalsRoot() {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
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
