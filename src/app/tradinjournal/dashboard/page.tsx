"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Brain, BarChart3, Play, FileText, LineChart,
  Share2, Trophy, TrendingUp, RefreshCw,
  LogOut, Menu, X, User, Send, Bot, Check,
  ChevronUp, ChevronDown, Zap, ArrowRight,
  Download, Globe, Maximize2, Minimize2, Search,
  Copy
} from "lucide-react";
import { useFirebaseAuth, type FBUser, type Trade } from "@/lib/firebaseAuth";
import { createChart, ColorType, CandlestickSeries, createSeriesMarkers } from "lightweight-charts";
import type { IChartApi, ISeriesApi, IPriceLine, Time, SeriesMarker } from "lightweight-charts";

interface ChatMsg {
  role: "ai" | "user";
  text: string;
  time: string;
}

interface Position {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  openPrice: number;
  openTime: string;
  lots: number;
  sl?: number;
  tp?: number;
}

// ─── Simulated trade generation for prepopulating ──────────────────────────
function generateTrades(): Trade[] {
  const symbols = ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD", "USDJPY", "NASDAQ"];
  const now = Date.now();
  
  return Array.from({ length: 10 }, (_, i) => {
    // Distribute trades across different days of the week, pre-selecting Tuesday as best day
    const dateOffset = (i + 1) * 86400000;
    const tradeDate = new Date(now - dateOffset);
    const dayIndex = tradeDate.getDay();
    const isTuesday = dayIndex === 2;
    
    // Tuesdays have a high win probability, Fridays have a low win probability
    const isWin = isTuesday ? Math.random() > 0.15 : dayIndex === 5 ? Math.random() > 0.75 : Math.random() > 0.4;
    const profit = isWin
      ? +(Math.random() * 1200 + 200).toFixed(2)
      : -(Math.random() * 400 + 50).toFixed(2);
      
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const openPrice = sym === "XAUUSD" ? 2310 + Math.random() * 40
      : sym === "BTCUSD" ? 64000 + Math.random() * 3000
      : sym === "NASDAQ" ? 19800 + Math.random() * 300
      : 1.08 + Math.random() * 0.02;
      
    return {
      id: "t-init-" + (i + 1),
      symbol: sym,
      type: Math.random() > 0.5 ? "BUY" : "SELL",
      openTime: new Date(now - dateOffset - 3600000).toISOString().substring(0, 16).replace("T", " "),
      closeTime: new Date(now - dateOffset).toISOString().substring(0, 16).replace("T", " "),
      openPrice: +openPrice.toFixed(sym === "XAUUSD" || sym === "NASDAQ" ? 2 : sym === "BTCUSD" ? 0 : 5),
      closePrice: +(openPrice + (isWin ? 1 : -1) * Math.random() * 8).toFixed(2),
      lots: +(Math.random() * 0.8 + 0.1).toFixed(2),
      profit,
      pips: +(Math.random() * 100 + 10).toFixed(1),
      status: isWin ? "WIN" : "LOSS",
      notes: isWin ? "Great SMC setup, followed rules." : "FOMO entry, did not wait for setup."
    };
  });
}

const ALL_SYMBOLS = [
  // Forex
  { id: "EURUSD", name: "EURUSD (Euro / US Dollar)", category: "Forex" },
  { id: "GBPUSD", name: "GBPUSD (Pound / US Dollar)", category: "Forex" },
  { id: "USDJPY", name: "USDJPY (US Dollar / Yen)", category: "Forex" },
  { id: "AUDUSD", name: "AUDUSD (Aussie / US Dollar)", category: "Forex" },
  { id: "USDCAD", name: "USDCAD (US Dollar / Loonie)", category: "Forex" },
  { id: "USDCHF", name: "USDCHF (US Dollar / Swiss Franc)", category: "Forex" },
  { id: "NZDUSD", name: "NZDUSD (Kiwi / US Dollar)", category: "Forex" },
  { id: "EURGBP", name: "EURGBP (Euro / Pound)", category: "Forex" },
  { id: "EURJPY", name: "EURJPY (Euro / Yen)", category: "Forex" },
  { id: "GBPJPY", name: "GBPJPY (Pound / Yen)", category: "Forex" },

  // Crypto
  { id: "BTCUSD", name: "BTCUSD (Bitcoin / US Dollar)", category: "Crypto" },
  { id: "ETHUSD", name: "ETHUSD (Ethereum / US Dollar)", category: "Crypto" },
  { id: "SOLUSD", name: "SOLUSD (Solana / US Dollar)", category: "Crypto" },
  { id: "XRPUSD", name: "XRPUSD (Ripple / US Dollar)", category: "Crypto" },
  { id: "ADAUSD", name: "ADAUSD (Cardano / US Dollar)", category: "Crypto" },
  { id: "DOGEUSD", name: "DOGEUSD (Dogecoin / US Dollar)", category: "Crypto" },
  { id: "LTCUSD", name: "LTCUSD (Litecoin / US Dollar)", category: "Crypto" },

  // Commodities
  { id: "XAUUSD", name: "XAUUSD (Gold / US Dollar)", category: "Commodities" },
  { id: "XAGUSD", name: "XAGUSD (Silver / US Dollar)", category: "Commodities" },
  { id: "USOIL", name: "USOIL (Crude Oil)", category: "Commodities" },
  { id: "UKOIL", name: "UKOIL (Brent Crude Oil)", category: "Commodities" },

  // Indices
  { id: "NASDAQ", name: "NASDAQ (US Tech 100)", category: "Indices" },
  { id: "SPX500", name: "SPX500 (S&P 500 Index)", category: "Indices" },
  { id: "DOW30", name: "DOW30 (Dow Jones 30)", category: "Indices" },
  { id: "GER30", name: "GER30 (DAX 30 Index)", category: "Indices" },
  { id: "UK100", name: "UK100 (FTSE 100 Index)", category: "Indices" },

  // Stocks
  { id: "AAPL", name: "AAPL (Apple Inc.)", category: "Stocks" },
  { id: "MSFT", name: "MSFT (Microsoft Corp.)", category: "Stocks" },
  { id: "GOOGL", name: "GOOGL (Alphabet Inc.)", category: "Stocks" },
  { id: "AMZN", name: "AMZN (Amazon.com Inc.)", category: "Stocks" },
  { id: "TSLA", name: "TSLA (Tesla Inc.)", category: "Stocks" },
  { id: "NVDA", name: "NVDA (NVIDIA Corp.)", category: "Stocks" },
  { id: "META", name: "META (Meta Platforms)", category: "Stocks" },
  { id: "NFLX", name: "NFLX (Netflix Inc.)", category: "Stocks" }
];

function getSymbolPrecision(symbol: string): number {
  if (symbol === "BTCUSD") return 0;
  if (
    symbol === "EURUSD" ||
    symbol === "GBPUSD" ||
    symbol === "AUDUSD" ||
    symbol === "NZDUSD" ||
    symbol === "EURGBP" ||
    symbol === "USDCAD" ||
    symbol === "USDCHF"
  ) {
    return 5;
  }
  if (symbol === "XRPUSD" || symbol === "ADAUSD" || symbol === "DOGEUSD") {
    return 4;
  }
  return 2;
}

function getSymbolVolatility(sym: string): number {
  if (sym.startsWith("BTC")) return 18;
  if (sym.startsWith("ETH")) return 1.5;
  if (sym === "USDJPY" || sym === "EURJPY" || sym === "GBPJPY") return 0.05;
  if (
    sym === "EURUSD" ||
    sym === "GBPUSD" ||
    sym === "AUDUSD" ||
    sym === "NZDUSD" ||
    sym === "EURGBP" ||
    sym === "USDCAD" ||
    sym === "USDCHF"
  ) {
    return 0.00012;
  }
  if (sym === "XAUUSD") return 0.35;
  if (sym === "XAGUSD") return 0.05;
  if (sym === "USOIL" || sym === "UKOIL") return 0.08;
  if (sym === "NASDAQ") return 5.0;
  if (sym === "SPX500") return 1.5;
  if (sym === "DOW30") return 10.0;
  if (sym === "GER30") return 5.0;
  if (sym === "UK100") return 2.0;
  if (sym === "SOLUSD") return 0.15;
  if (sym === "XRPUSD" || sym === "ADAUSD" || sym === "DOGEUSD") return 0.0015;
  if (sym === "LTCUSD") return 0.12;
  if (sym === "TSLA" || sym === "NVDA") return 0.35;
  return 0.20;
}

function isMarketClosedForSymbol(symbol: string): boolean {
  const cryptoSuffixes = ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD", "ADAUSD", "DOGEUSD", "LTCUSD"];
  if (cryptoSuffixes.includes(symbol)) return false;
  
  const now = new Date();
  const utcDay = now.getUTCDay();
  const utcHours = now.getUTCHours();
  if (utcDay === 6) return true;
  if (utcDay === 5 && utcHours >= 22) return true;
  if (utcDay === 0 && utcHours < 22) return true;
  return false;
}

// ─── Searchable Dropdown for Simulator Assets ──────────────────────────────
interface SearchableDropdownProps {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  marketPrices: Record<string, number>;
}

function SearchableDropdown({ selectedSymbol, onSelect, marketPrices }: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = ALL_SYMBOLS.filter(
    s =>
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const categories = Array.from(new Set(ALL_SYMBOLS.map(s => s.category)));

  const currentAsset = ALL_SYMBOLS.find(s => s.id === selectedSymbol) || ALL_SYMBOLS[0];
  const currentPrice = marketPrices[selectedSymbol] || 0;
  const currentPrec = getSymbolPrecision(selectedSymbol);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch(""); // Reset search on open
        }}
        type="button"
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0e0e16]/80 border border-panel-border dropdown-forced-title text-xs text-left focus:outline-none focus:border-purple-500 hover:border-purple-500/40 transition-colors cursor-pointer select-none"
      >
        <span className="font-semibold dropdown-forced-title truncate pr-2">
          {currentAsset.name} - <span className="font-mono text-purple-400 font-bold">${currentPrice.toFixed(currentPrec)}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 dropdown-forced-desc transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-xl border border-panel-border bg-[#0e0e16]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-72">
          {/* Search Box */}
          <div className="p-2 border-b border-panel-border flex items-center gap-2 bg-black/20">
            <Search className="w-3.5 h-3.5 dropdown-forced-desc flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search assets (e.g. BTC, Gold, Stock)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent dropdown-forced-title text-xs outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="dropdown-forced-desc hover:dropdown-forced-title text-[10px] font-bold px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin py-1 select-none">
            {filtered.length > 0 ? (
              categories.map(cat => {
                const catItems = filtered.filter(item => item.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="mb-2">
                    {/* Category Label */}
                    <div
                      className="px-3 py-1 text-[8px] font-black uppercase tracking-widest dropdown-forced-gold sticky top-0 backdrop-blur-sm z-10"
                      style={{ backgroundColor: "rgba(255, 215, 0, 0.08)" }}
                    >
                      {cat}
                    </div>

                    {/* Category Items */}
                    <div className="mt-1 space-y-0.5">
                      {catItems.map(item => {
                        const price = marketPrices[item.id] || 0;
                        const prec = getSymbolPrecision(item.id);
                        const isSelected = item.id === selectedSymbol;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onSelect(item.id);
                              setIsOpen(false);
                            }}
                            type="button"
                            className={`w-full px-3 py-2 flex items-center justify-between text-xs transition-colors hover:bg-white/5 cursor-pointer text-left ${isSelected ? "bg-purple-600/20 dropdown-forced-title font-bold border-l-2 border-purple-500" : "dropdown-forced-sec"}`}
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="font-bold dropdown-forced-title">{item.id}</span>
                              <span className="text-[9px] dropdown-forced-desc truncate max-w-[180px]">{item.name}</span>
                            </div>
                            <span className="font-mono font-extrabold text-[10px] text-purple-400 flex-shrink-0">
                              ${price.toFixed(prec)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-xs dropdown-forced-desc">
                No matching asset pairs found
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Auth Gate ───────────────────────────────────────────────────────────────
function AuthGate({ onSuccess }: { onSuccess: () => void }) {
  const { signUp, signIn, signInWithGoogle, resetPassword, loading, error, clearError } = useFirebaseAuth();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [validationError, setValidationError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setValidationError("");
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      if (!form.firstName || !form.lastName) { setValidationError("Please enter your full name."); return; }
      if (form.password !== form.confirm) { setValidationError("Passwords do not match."); return; }
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
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md glass-panel border border-panel-border p-8 rounded-2xl shadow-2xl relative z-10 bg-panel-bg">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">TRADINJOURNAL</span>
          </div>
          <h2 className="text-lg font-extrabold text-title">
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Your Account" : "Reset Password"}
          </h2>
          <p className="text-xs text-desc mt-1">
            {mode === "login" ? "Sign in to access your trading journal" : mode === "register" ? "Start your AI-powered trading journey" : "We'll send a reset link to your email"}
          </p>
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error || validationError}
          </div>
        )}
        {resetSent && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-accent">
            Password reset link sent! Check your email inbox.
          </div>
        )}

        {mode !== "reset" && (
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-panel-border bg-panel-bg hover:border-purple-500/40 text-title text-sm font-semibold mb-4 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        )}

        {mode !== "reset" && (
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-panel-border" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-panel-bg text-[10px] text-desc uppercase font-bold">or continue with email</span></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">First Name</label>
                <input required value={form.firstName} onChange={set("firstName")} placeholder="Rahul" className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Last Name</label>
                <input required value={form.lastName} onChange={set("lastName")} placeholder="Sharma" className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-purple-500" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Email Address</label>
            <input type="email" required value={form.email} onChange={set("email")} placeholder="trader@gmail.com" className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-purple-500" />
          </div>
          {mode === "register" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Phone Number</label>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 9876543210" className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-purple-500" />
            </div>
          )}
          {mode !== "reset" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Password</label>
              <input type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-purple-500" />
            </div>
          )}
          {mode === "register" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Confirm Password</label>
              <input type="password" required value={form.confirm} onChange={set("confirm")} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-purple-500" />
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer">
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("reset"); clearError(); }} className="text-xs text-purple-400 hover:underline block w-full cursor-pointer">Forgot password?</button>
              <button onClick={() => { setMode("register"); clearError(); }} className="text-xs text-desc hover:text-title cursor-pointer">Don&apos;t have an account? <span className="text-purple-400 font-bold">Register Free</span></button>
            </>
          )}
          {mode === "register" && (
            <button onClick={() => { setMode("login"); clearError(); }} className="text-xs text-desc hover:text-title cursor-pointer">Already have an account? <span className="text-purple-400 font-bold">Sign In</span></button>
          )}
          {mode === "reset" && (
            <button onClick={() => { setMode("login"); clearError(); setResetSent(false); }} className="text-xs text-purple-400 hover:underline cursor-pointer">← Back to Sign In</button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Candle {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const generateFallbackData = (symbol: string): Candle[] => {
  const count = 100;
  const data: Candle[] = [];
  let currentPrice = symbol === "BTCUSD" ? 65120 : symbol === "XAUUSD" ? 2324 : symbol === "US100" ? 19850 : symbol === "USDJPY" ? 157.85 : 1.08450;
  const volatility = symbol === "BTCUSD" ? 80 : symbol === "XAUUSD" ? 2.5 : symbol === "US100" ? 25 : symbol === "USDJPY" ? 0.15 : 0.0006;
  const time = new Date();
  time.setMinutes(time.getMinutes() - (count * 5));
  
  for (let i = 0; i < count; i++) {
    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.4);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.4);
    time.setMinutes(time.getMinutes() + 5);
    
    data.push({
      time: Math.floor(time.getTime() / 1000) as Time,
      open: +open.toFixed(symbol === "BTCUSD" ? 0 : symbol === "USDJPY" ? 2 : 5),
      high: +high.toFixed(symbol === "BTCUSD" ? 0 : symbol === "USDJPY" ? 2 : 5),
      low: +low.toFixed(symbol === "BTCUSD" ? 0 : symbol === "USDJPY" ? 2 : 5),
      close: +close.toFixed(symbol === "BTCUSD" ? 0 : symbol === "USDJPY" ? 2 : 5)
    });
    currentPrice = close;
  }
  return data;
};



// ─── Charting Component (TradingView Lightweight Charts Renderer) ────────────
function SimulatorChart({
  symbol,
  openPositions = [],
  marketPrices = {},
  updatePositionSL,
  updatePositionTP
}: {
  symbol: string;
  openPositions: Position[];
  marketPrices: Record<string, number>;
  updatePositionSL: (id: string, sl: number | undefined) => void;
  updatePositionTP: (id: string, tp: number | undefined) => void;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const priceLinesMap = useRef<Record<string, IPriceLine>>({});
  const markersPluginRef = useRef<{ detach: () => void } | null>(null);
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"Yahoo Finance API" | "Alpha Vantage API" | "Simulator Fallback">("Simulator Fallback");
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const isMaximizedRef = useRef(isMaximized);
  useEffect(() => {
    isMaximizedRef.current = isMaximized;
  }, [isMaximized]);

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  useEffect(() => {
    if (chartRef.current && chartContainerRef.current) {
      const height = isMaximized ? window.innerHeight - 100 : 380;
      chartRef.current.resize(chartContainerRef.current.clientWidth, height);
    }
  }, [isMaximized]);

  // Initialize Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Clear old chart markup
    chartContainerRef.current.innerHTML = "";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0f" },
        textColor: "#9ca3af",
        fontSize: 10,
        fontFamily: "var(--font-sans, Inter, sans-serif)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
        vertLine: {
          color: "rgba(255, 255, 255, 0.2)",
          style: 3, // Dashed
          labelBackgroundColor: "#1e1b4b",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.2)",
          style: 3,
          labelBackgroundColor: "#1e1b4b",
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      width: chartContainerRef.current.clientWidth || 800,
      height: 380,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    // Legend on hover
    chart.subscribeCrosshairMove(param => {
      if (param.point === undefined || !param.time) {
        setHoveredCandle(null);
      } else {
        const data = param.seriesData.get(candleSeries) as Candle | undefined;
        if (data) {
          setHoveredCandle(data);
        }
      }
    });

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const height = isMaximizedRef.current ? window.innerHeight - 100 : 380;
        chartRef.current.resize(chartContainerRef.current.clientWidth, height);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (markersPluginRef.current) {
        markersPluginRef.current.detach();
        markersPluginRef.current = null;
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol]);

  // Load Historical Data
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/market-data?symbol=${symbol}&interval=5m&range=5d`);
        const json = await res.json();
        
        if (!active) return;

        if (json.error || !json.candles || json.candles.length === 0) {
          const fallback = generateFallbackData(symbol);
          setCandles(fallback);
          setDataSource("Simulator Fallback");
          if (seriesRef.current) seriesRef.current.setData(fallback);
        } else {
          setCandles(json.candles);
          setDataSource("Yahoo Finance API");
          if (seriesRef.current) seriesRef.current.setData(json.candles);
        }
      } catch (err) {
        console.error("Market data fetch error, using fallback data", err);
        if (active) {
          const fallback = generateFallbackData(symbol);
          setCandles(fallback);
          setDataSource("Simulator Fallback");
          if (seriesRef.current) seriesRef.current.setData(fallback);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [symbol]);

  // Real-Time Price Streaming Update
  useEffect(() => {
    const currentPrice = marketPrices[symbol === "US100" ? "NASDAQ" : symbol];
    if (currentPrice === undefined || currentPrice === null) return;
    
    const timer = setTimeout(() => {
      setCandles(prev => {
        if (!prev.length) return prev;
        const lastIdx = prev.length - 1;
        const lastCandle = prev[lastIdx];
        
        const updatedCandle = {
          ...lastCandle,
          close: currentPrice,
          high: Math.max(lastCandle.high, currentPrice),
          low: Math.min(lastCandle.low, currentPrice)
        };
        
        if (seriesRef.current) {
          seriesRef.current.update(updatedCandle);
        }
        
        const copy = [...prev];
        copy[lastIdx] = updatedCandle;
        return copy;
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [marketPrices, symbol]);

  // Visualize Positions & Markers
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !candles.length) return;

    // 1. Remove existing price lines
    priceLinesRef.current.forEach(line => {
      series.removePriceLine(line);
    });
    priceLinesRef.current = [];
    priceLinesMap.current = {};

    // 2. Remove existing markers plugin
    if (markersPluginRef.current) {
      markersPluginRef.current.detach();
      markersPluginRef.current = null;
    }

    // 3. Filter open positions matching this symbol
    const activePositions = openPositions.filter(
      pos => pos.symbol === (symbol === "US100" ? "NASDAQ" : symbol)
    );

    // 4. Create active position lines
    activePositions.forEach(pos => {
      const isBuy = pos.type === "BUY";
      const color = isBuy ? "#22c55e" : "#ef4444";
      
      const line = series.createPriceLine({
        price: pos.openPrice,
        color: color,
        lineWidth: 1,
        lineStyle: 1, // Dashed
        axisLabelVisible: true,
        title: `${pos.type} ${pos.lots} Lots @ ${pos.openPrice}`,
      });
      priceLinesRef.current.push(line);

      const prec = getSymbolPrecision(symbol);

      // Draw SL line if set
      if (pos.sl !== undefined) {
        const slLine = series.createPriceLine({
          price: pos.sl,
          color: "#ef4444",
          lineWidth: 2,
          lineStyle: 2, // Dotted
          axisLabelVisible: true,
          title: `SL: ${pos.sl.toFixed(prec)} (Drag to set)`,
        });
        priceLinesRef.current.push(slLine);
        priceLinesMap.current[`${pos.id}_sl`] = slLine;
      }

      // Draw TP line if set
      if (pos.tp !== undefined) {
        const tpLine = series.createPriceLine({
          price: pos.tp,
          color: "#22c55e",
          lineWidth: 2,
          lineStyle: 2, // Dotted
          axisLabelVisible: true,
          title: `TP: ${pos.tp.toFixed(prec)} (Drag to set)`,
        });
        priceLinesRef.current.push(tpLine);
        priceLinesMap.current[`${pos.id}_tp`] = tpLine;
      }
    });

    // 5. Create visual markers on candles for positions
    const markers: SeriesMarker<Time>[] = activePositions.map(pos => {
      const isBuy = pos.type === "BUY";
      const posTime = Math.floor(new Date(pos.openTime).getTime() / 1000);
      
      let markerTime = candles[candles.length - 1].time;
      for (let i = candles.length - 1; i >= 0; i--) {
        if (Math.abs((candles[i].time as unknown as number) - posTime) < 300) {
          markerTime = candles[i].time;
          break;
        }
      }

      return {
        time: markerTime,
        position: (isBuy ? "belowBar" : "aboveBar") as "belowBar" | "aboveBar",
        color: isBuy ? "#22c55e" : "#ef4444",
        shape: (isBuy ? "arrowUp" : "arrowDown") as "arrowUp" | "arrowDown",
        text: `${pos.type} ${pos.lots} Lots`,
      };
    });

    if (markers.length > 0) {
      markersPluginRef.current = createSeriesMarkers(series, markers);
    }
  }, [openPositions, symbol, candles]);

  // Interactive SL/TP Dragging on Chart
  useEffect(() => {
    const container = chartContainerRef.current;
    const series = seriesRef.current;
    if (!container || !chartRef.current || !series) return;

    let dragInfo: { posId: string; type: "sl" | "tp"; originalPrice: number } | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      if (!chartRef.current || !series) return;
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;

      // Find active positions for the current symbol
      const activePositions = openPositions.filter(
        pos => pos.symbol === (symbol === "US100" ? "NASDAQ" : symbol)
      );

      for (const pos of activePositions) {
        if (pos.sl !== undefined) {
          const y = series.priceToCoordinate(pos.sl);
          if (y !== null && Math.abs(mouseY - y) < 12) {
            dragInfo = { posId: pos.id, type: "sl", originalPrice: pos.sl };
            container.style.cursor = "ns-resize";
            e.preventDefault();
            e.stopPropagation();
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return;
          }
        }
        if (pos.tp !== undefined) {
          const y = series.priceToCoordinate(pos.tp);
          if (y !== null && Math.abs(mouseY - y) < 12) {
            dragInfo = { posId: pos.id, type: "tp", originalPrice: pos.tp };
            container.style.cursor = "ns-resize";
            e.preventDefault();
            e.stopPropagation();
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return;
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfo || !series || !container) return;
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const priceVal = series.coordinateToPrice(mouseY);
      if (priceVal !== null) {
        const prec = getSymbolPrecision(symbol);
        const price = +priceVal.toFixed(prec);

        const lineKey = `${dragInfo.posId}_${dragInfo.type}`;
        const line = priceLinesMap.current[lineKey];
        if (line) {
          line.applyOptions({
            price: price as import("lightweight-charts").BarPrice,
            title: `${dragInfo.type.toUpperCase()}: ${price.toFixed(prec)} (Dragging)`
          });
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragInfo || !series || !container) return;
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const priceVal = series.coordinateToPrice(mouseY);
      
      container.style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (priceVal !== null) {
         const prec = getSymbolPrecision(symbol);
         const price = +priceVal.toFixed(prec);
        
        if (dragInfo.type === "sl") {
          updatePositionSL(dragInfo.posId, price);
        } else {
          updatePositionTP(dragInfo.posId, price);
        }
      }
      dragInfo = null;
    };

    container.addEventListener("mousedown", handleMouseDown);
    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [openPositions, symbol, updatePositionSL, updatePositionTP]);

  // Format Helper for legend
  const formatTime = (timeVal: Time) => {
    const timeNum = typeof timeVal === "number" ? timeVal : Number(timeVal);
    if (isNaN(timeNum)) return String(timeVal);
    const d = new Date(timeNum * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`w-full flex flex-col select-none ${isMaximized ? "fixed inset-0 z-50 bg-[#0a0a0f] p-6 h-screen flex flex-col animate-fade-in" : ""}`}>
      {/* Chart Legend HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-panel-border bg-panel-bg/45 text-[10px] text-desc font-mono">
        <div className="flex items-center gap-4">
          <span className="font-bold text-title">{symbol} 5m</span>
          {hoveredCandle ? (
            <>
              <span>T: <span className="text-title">{formatTime(hoveredCandle.time)}</span></span>
              <span>O: <span className={hoveredCandle.close >= hoveredCandle.open ? "text-green-accent" : "text-red-accent"}>{hoveredCandle.open}</span></span>
              <span>H: <span className="text-title">{hoveredCandle.high}</span></span>
              <span>L: <span className="text-title">{hoveredCandle.low}</span></span>
              <span>C: <span className={hoveredCandle.close >= hoveredCandle.open ? "text-green-accent" : "text-red-accent"}>{hoveredCandle.close}</span></span>
            </>
          ) : (
            candles.length > 0 && (
              <>
                {(() => {
                  const last = candles[candles.length - 1];
                  return (
                    <>
                      <span>T: <span className="text-title">{formatTime(last.time)}</span></span>
                      <span>O: <span className={last.close >= last.open ? "text-green-accent" : "text-red-accent"}>{last.open}</span></span>
                      <span>H: <span className="text-title">{last.high}</span></span>
                      <span>L: <span className="text-title">{last.low}</span></span>
                      <span>C: <span className={last.close >= last.open ? "text-green-accent" : "text-red-accent"}>{last.close}</span></span>
                    </>
                  );
                })()}
              </>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${dataSource === "Yahoo Finance API" ? "bg-green-500/10 text-green-accent" : "bg-purple-500/10 text-purple-400"}`}
            style={{ display: 'none' }}
          >
            {dataSource}
          </span>
          <button
            onClick={toggleMaximize}
            className="p-1 rounded bg-panel-bg border border-panel-border hover:border-gold hover:text-gold text-sec hover:scale-105 transition-all shadow flex items-center justify-center cursor-pointer animate-pulse-slow"
            title={isMaximized ? "Close Fullscreen" : "Maximize Chart"}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Lightweight Chart Container */}
      <div className={`w-full bg-[#0a0a0f] relative overflow-hidden p-2 rounded-b-2xl ${isMaximized ? "flex-1 min-h-0" : ""}`}>
        {loading && candles.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0f]/80 gap-2">
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
            <p className="text-xs text-desc">Loading Financial Chart...</p>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" style={{ minHeight: isMaximized ? "auto" : "380px" }} />
      </div>
    </div>
  );
}

// ─── Trading Simulator View ──────────────────────────────────────────────────
interface SimulatorPanelProps {
  marketPrices: Record<string, number>;
  openPositions: Position[];
  executeMarketOrder: (type: "BUY" | "SELL", sl?: number, tp?: number) => void;
  closePosition: (id: string, triggerReason?: string, customPrice?: number) => void;
  updatePositionSL: (id: string, sl: number | undefined) => void;
  updatePositionTP: (id: string, tp: number | undefined) => void;
  simSymbol: string;
  setSimSymbol: (symbol: string) => void;
  simLots: string;
  setSimLots: (lots: string) => void;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  openPL: number;
}

function SimulatorPanel({
  marketPrices,
  openPositions,
  executeMarketOrder,
  closePosition,
  updatePositionSL,
  updatePositionTP,
  simSymbol,
  setSimSymbol,
  simLots,
  setSimLots,
  balance,
  equity,
  margin,
  freeMargin,
  openPL
}: SimulatorPanelProps) {
  const getGoChartingSymbol = (symbol: string): string => {
    if (symbol === "NASDAQ") return "US100";
    return symbol;
  };

  const [simSL, setSimSL] = useState<string>("");
  const [simTP, setSimTP] = useState<string>("");

  const calculatePositionPL = (pos: Position, currentPrice: number) => {
    const difference = pos.type === "BUY" ? (currentPrice - pos.openPrice) : (pos.openPrice - currentPrice);
    let multiplier = 100000;
    if (pos.symbol === "XAUUSD") multiplier = 100;
    if (pos.symbol === "BTCUSD") multiplier = 1;
    if (pos.symbol === "NASDAQ") multiplier = 10;
    
    let profit = difference * pos.lots * multiplier;
    if (pos.symbol === "USDJPY") {
      profit = profit / currentPrice;
    }
    return +profit.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart and Active Positions */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-4 rounded-2xl border-panel-border bg-panel-bg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-title flex items-center gap-1.5"><LineChart className="w-4 h-4 text-purple-400" /> Backtest Simulator Chart</h3>
            <p className="text-[10px] text-desc mt-0.5">Place virtual buy/sell trades with dynamic live feeds</p>
          </div>
          <div className="w-full sm:w-64">
            <SearchableDropdown
              selectedSymbol={simSymbol}
              onSelect={setSimSymbol}
              marketPrices={marketPrices}
            />
          </div>
        </div>
          <SimulatorChart
            symbol={getGoChartingSymbol(simSymbol)}
            openPositions={openPositions}
            marketPrices={marketPrices}
            updatePositionSL={updatePositionSL}
            updatePositionTP={updatePositionTP}
          />
        </div>

        {/* Active Open Positions */}
        <div className="glass-panel rounded-2xl border-panel-border bg-panel-bg overflow-hidden">
          <div className="p-4 border-b border-panel-border">
            <h3 className="text-sm font-bold text-title">Open Positions ({openPositions.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-panel-border bg-panel-bg/30">
                  {["Asset", "Type", "Lots", "Entry Price", "Stop Loss (SL)", "Take Profit (TP)", "Market Price", "Profit", "Action"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold text-desc uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-border font-mono">
                {openPositions.length > 0 ? (
                  openPositions.map((pos: Position) => {
                    const price = marketPrices[pos.symbol];
                    const profit = calculatePositionPL(pos, price);
                    const prec = getSymbolPrecision(pos.symbol);
                    return (
                      <tr key={pos.id} className="hover:bg-panel-bg/40 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-title">{pos.symbol}</td>
                        <td className="px-4 py-2.5 font-bold">
                          <span className={`${pos.type === "BUY" ? "text-green-accent" : "text-red-accent"}`}>{pos.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-title">{pos.lots}</td>
                        <td className="px-4 py-2.5">${pos.openPrice.toFixed(prec)}</td>
                        {/* Stop Loss (SL) Column */}
                        <td className="px-4 py-2.5 font-sans">
                          <input
                            type="number"
                            step="any"
                            value={pos.sl !== undefined ? pos.sl : ""}
                            onChange={e => {
                              const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                              updatePositionSL(pos.id, val);
                            }}
                            placeholder="Not Set"
                            className="w-20 px-1.5 py-1 rounded bg-black/40 border border-panel-border text-center text-title text-xs font-mono focus:outline-none focus:border-red-500/50"
                          />
                        </td>
                        {/* Take Profit (TP) Column */}
                        <td className="px-4 py-2.5 font-sans">
                          <input
                            type="number"
                            step="any"
                            value={pos.tp !== undefined ? pos.tp : ""}
                            onChange={e => {
                              const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                              updatePositionTP(pos.id, val);
                            }}
                            placeholder="Not Set"
                            className="w-20 px-1.5 py-1 rounded bg-black/40 border border-panel-border text-center text-title text-xs font-mono focus:outline-none focus:border-green-500/50"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-title font-semibold">${price.toFixed(prec)}</td>
                        <td className={`px-4 py-2.5 font-black ${profit >= 0 ? "text-green-accent" : "text-red-accent"}`}>
                          {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 font-sans">
                          {(() => {
                            const isClosed = isMarketClosedForSymbol(pos.symbol);
                            return (
                              <button
                                onClick={() => !isClosed && closePosition(pos.id)}
                                disabled={isClosed}
                                className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${isClosed ? "bg-gray-500/10 text-desc border border-panel-border opacity-50 cursor-not-allowed" : "bg-red-500/20 text-red-accent border border-red-500/30 hover:bg-red-500 hover:text-white cursor-pointer"}`}
                                title={isClosed ? "Cannot close position: Market is closed (Weekends)" : "Close Position"}
                              >
                                Close
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-desc font-sans">No active positions. Execute a mock order to start simulation!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Simulator Side Control Panel */}
      <div className="space-y-6">
        {/* Virtual Account Balance and Metrics */}
        <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4">
          <h4 className="text-sm font-bold text-title border-b border-panel-border pb-2 flex items-center gap-1.5"><Globe className="w-4 h-4 text-gold" /> Simulator Accounts</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-desc uppercase font-bold block">Balance</span>
              <span className="text-base font-black font-mono text-title">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-[10px] text-desc uppercase font-bold block">Equity</span>
              <span className="text-base font-black font-mono text-title">${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-[10px] text-desc uppercase font-bold block">Margin</span>
              <span className="text-xs font-black font-mono text-sec">${margin.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-desc uppercase font-bold block">Free Margin</span>
              <span className="text-xs font-black font-mono text-sec">${freeMargin.toLocaleString()}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-panel-border">
            <span className="text-[10px] text-desc uppercase font-bold block">Unrealized profit</span>
            <span className={`text-xl font-black font-mono ${openPL >= 0 ? "text-green-accent" : "text-red-accent"}`}>
              {openPL >= 0 ? "+" : ""}${openPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Order Form */}
        <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4">
          <h4 className="text-sm font-bold text-title flex items-center gap-1.5"><Zap className="w-4 h-4 text-purple-400" /> Simulator Terminal</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Asset Pair</label>
              <SearchableDropdown
                selectedSymbol={simSymbol}
                onSelect={setSimSymbol}
                marketPrices={marketPrices}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Position Size (Lots)</label>
              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={simLots}
                onChange={e => setSimLots(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Stop Loss (SL)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Optional"
                  value={simSL}
                  onChange={e => setSimSL(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs font-mono focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Take Profit (TP)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Optional"
                  value={simTP}
                  onChange={e => setSimTP(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs font-mono focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>

            {(() => {
              const isClosed = isMarketClosedForSymbol(simSymbol);
              return (
                <>
                  {isClosed && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 text-center font-semibold mb-2 animate-fade-in">
                      ⚠️ Market is closed for {simSymbol} (Weekends). Trading is paused.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (!isClosed) {
                          const slVal = simSL ? parseFloat(simSL) : undefined;
                          const tpVal = simTP ? parseFloat(simTP) : undefined;
                          executeMarketOrder("BUY", slVal, tpVal);
                          setSimSL("");
                          setSimTP("");
                        }
                      }}
                      disabled={isClosed}
                      className={`py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all ${isClosed ? "bg-gray-600 text-title/40 opacity-40 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"}`}
                    >
                      BUY MARKET
                    </button>
                    <button
                      onClick={() => {
                        if (!isClosed) {
                          const slVal = simSL ? parseFloat(simSL) : undefined;
                          const tpVal = simTP ? parseFloat(simTP) : undefined;
                          executeMarketOrder("SELL", slVal, tpVal);
                          setSimSL("");
                          setSimTP("");
                        }
                      }}
                      disabled={isClosed}
                      className={`py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all ${isClosed ? "bg-gray-600 text-title/40 opacity-40 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"}`}
                    >
                      SELL MARKET
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MT5 Sync Panel ───────────────────────────────────────────────────────────
function MT5SyncPanel({ onSync, syncing }: { onSync: () => void; syncing: boolean }) {
  const [server, setServer] = useState("MetaQuotes-Demo");
  const [login, setLogin] = useState("12345678");

  return (
    <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-bold text-title">MT5 Auto-Sync</h3>
      </div>
      <p className="text-xs text-desc mb-4">Connect your MT5 account to automatically import all trades.</p>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">MT5 Server</label>
          <input value={server} onChange={e => setServer(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">MT5 Login ID</label>
          <input value={login} onChange={e => setLogin(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-blue-500" />
        </div>
        <button onClick={onSync} disabled={syncing} className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing Trades..." : "Sync Now"}
        </button>
      </div>
    </div>
  );
}

// ─── AI Coach Panel ───────────────────────────────────────────────────────────
function AICoachPanel({ user }: { user: FBUser }) {
  const trades = user.trades || [];
  const total = trades.length;

  const wins = trades.filter(t => t.status === "WIN");
  const losses = trades.filter(t => t.status === "LOSS");
  const winRate = total ? Math.round((wins.length / total) * 100) : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.profit, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.profit, 0)) / losses.length : 0;
  const rewardRiskRatio = avgLoss ? +(avgWin / avgLoss).toFixed(2) : 0;
  
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayStats: Record<string, { count: number; profit: number; wins: number }> = {};
  daysOfWeek.forEach(d => { dayStats[d] = { count: 0, profit: 0, wins: 0 }; });
  
  trades.forEach(t => {
    const dayName = daysOfWeek[new Date(t.openTime).getDay()];
    if (dayStats[dayName]) {
      dayStats[dayName].count += 1;
      dayStats[dayName].profit += t.profit;
      if (t.status === "WIN") dayStats[dayName].wins += 1;
    }
  });
  
  let bestDay = "None";
  let bestDayWinRate = 0;
  let bestDayProfit = -Infinity;
  
  Object.keys(dayStats).forEach(day => {
    const d = dayStats[day];
    if (d.count > 0) {
      const avgProfit = d.profit / d.count;
      const wr = (d.wins / d.count) * 100;
      if (avgProfit > bestDayProfit) {
        bestDayProfit = avgProfit;
        bestDay = day;
        bestDayWinRate = Math.round(wr);
      }
    }
  });

  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    { 
      role: "ai", 
      text: `Hi ${user.firstName}! I'm your AI trading coach. I've synced with your trading journal and reviewed your session history.\n\nI'm ready to dive into your stats, discuss risk management strategies, or help you unpack any emotional patterns like FOMO or over-trading that might be affecting your consistency.\n\nWhat's on your mind today? Are we looking at a specific set of trades, or should we talk general strategy?`, 
      time: new Date().toLocaleTimeString() 
    }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMsg = async () => {
    if (!input.trim() || typing) return;
    const currentInput = input;
    const userMsg: ChatMsg = { role: "user", text: currentInput, time: new Date().toLocaleTimeString() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const updatedMessages = [...messages, userMsg];
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trades: trades,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.text) {
        const aiReply: ChatMsg = {
          role: "ai",
          text: data.text,
          time: new Date().toLocaleTimeString()
        };
        setMessages(m => [...m, aiReply]);
      } else {
        throw new Error(data.error || "Failed to generate coaching response");
      }
    } catch (err: unknown) {
      console.error("AI Coach API call failed:", err);
      const errMessage = err instanceof Error ? err.message : "Unknown error";
      const errorReply: ChatMsg = {
        role: "ai",
        text: `Sorry, I encountered an issue analyzing your trading logs. Details: ${errMessage}. Please try again.`,
        time: new Date().toLocaleTimeString()
      };
      setMessages(m => [...m, errorReply]);
    } finally {
      setTyping(false);
    }
  };

  const disciplineScore = total ? +(Math.min(10, 5 + (winRate / 20) + (rewardRiskRatio * 1.5))).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Columns - Chat panel */}
      <div className="lg:col-span-2">
        <div className="glass-panel rounded-2xl border-panel-border bg-panel-bg flex flex-col h-[520px]">
          <div className="flex items-center gap-2 p-4 border-b border-panel-border">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-title">AI Trading Coach</h3>
              <span className="text-[10px] text-green-accent flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-accent inline-block animate-pulse" />Online · Powered by DeepSeek AI</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "ai" ? "bg-purple-500/20" : "bg-gold/20"}`}>
                  {m.role === "ai" ? <Bot className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-gold" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${m.role === "ai" ? "bg-panel-bg border border-panel-border text-sec rounded-tl-none" : "bg-gold text-black rounded-tr-none font-medium"}`}>
                  {m.text}
                  <div className={`text-[9px] mt-1 ${m.role === "ai" ? "text-desc" : "text-black/60"}`}>{m.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-purple-400" /></div>
                <div className="bg-panel-bg border border-panel-border rounded-2xl rounded-tl-none px-3 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-desc animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-desc animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-desc animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>
          <form onSubmit={e => { e.preventDefault(); sendMsg(); }} className="p-3 border-t border-panel-border flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your trades, risk management..." className="flex-1 px-3 py-2 rounded-lg bg-panel-bg border border-panel-border text-title text-xs focus:outline-none focus:border-purple-500" />
            <button type="submit" disabled={typing} className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - Stats Overview */}
      <div className="space-y-4">
        <div className="glass-panel p-5 rounded-2xl border-panel-border bg-panel-bg space-y-4">
          <h3 className="text-sm font-bold text-title flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-gold" /> Behavioral Analysis</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-desc uppercase mb-1">
                <span>Discipline</span>
                <span>{disciplineScore}/10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-panel-border overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: `${disciplineScore * 10}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-desc uppercase mb-1">
                <span>Win Ratio</span>
                <span>{winRate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-panel-border overflow-hidden">
                <div className="h-full bg-green-accent rounded-full" style={{ width: `${winRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-desc uppercase mb-1">
                <span>Reward/Risk Adherence</span>
                <span>{Math.min(10, Math.round(rewardRiskRatio * 3.3))}/10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-panel-border overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${Math.min(100, rewardRiskRatio * 33)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-panel-border bg-panel-bg space-y-3">
          <h3 className="text-sm font-bold text-title flex items-center gap-1.5"><Trophy className="w-4 h-4 text-purple-400" /> Best Trading Day</h3>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
            <span className="text-2xl font-black text-purple-300 uppercase tracking-wider block font-mono">{bestDay}</span>
            <span className="text-[10px] text-desc font-semibold uppercase mt-1 inline-block">Win Rate: {bestDayWinRate}%</span>
          </div>
          <p className="text-[11px] text-desc leading-relaxed">
            Your trading logs show high focus and quality trade confirmation setups on {bestDay !== "None" ? bestDay : "trading sessions"}. Maintain this discipline!
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ trades }: { trades: Trade[] }) {
  const totalPL = trades.reduce((s, t) => s + t.profit, 0);
  const wins = trades.filter(t => t.status === "WIN");
  const losses = trades.filter(t => t.status === "LOSS");
  const winRate = trades.length ? Math.round((wins.length / trades.length) * 100) : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.profit, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.profit, 0) / losses.length : 0;
  const expectancy = ((winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss).toFixed(2);

  const absAvgLoss = Math.abs(avgLoss);
  const rewardRiskRatio = absAvgLoss ? +(avgWin / absAvgLoss).toFixed(2) : 0;
  const disciplineScore = trades.length ? +(Math.min(10, 5 + (winRate / 20) + (rewardRiskRatio * 1.5))).toFixed(1) : 0;

  // Equity curve points
  const reversedTrades = trades.slice().reverse();
  const eqPoints = reversedTrades.reduce<number[]>((acc, t) => {
    const lastEquity = acc.length > 0 ? acc[acc.length - 1] : 100000;
    acc.push(lastEquity + t.profit);
    return acc;
  }, []);
  const eqMin = Math.min(...eqPoints, 100000);
  const eqMax = Math.max(...eqPoints, 100000);
  const toSvgY = (v: number) => 80 - ((v - eqMin) / (eqMax - eqMin + 1)) * 70;

  const stats = [
    { label: "Total P&L", value: `${totalPL >= 0 ? "+" : ""}$${totalPL.toFixed(2)}`, color: totalPL >= 0 ? "text-green-accent" : "text-red-accent" },
    { label: "Win Rate", value: `${winRate}%`, color: "text-gold" },
    { label: "Total Trades", value: trades.length.toString(), color: "text-title" },
    { label: "Avg Win", value: `+$${avgWin.toFixed(0)}`, color: "text-green-accent" },
    { label: "Avg Loss", value: `$${avgLoss.toFixed(0)}`, color: "text-red-accent" },
    { label: "Expectancy", value: `$${expectancy}`, color: +expectancy >= 0 ? "text-green-accent" : "text-red-accent" }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl border-panel-border bg-panel-bg">
            <div className="text-[10px] text-desc uppercase font-bold mb-1">{s.label}</div>
            <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg">
        <h4 className="text-sm font-bold text-title mb-4">Equity Curve</h4>
        <svg viewBox="0 0 300 90" className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
            </linearGradient>
          </defs>
          {eqPoints.length > 0 ? (
            <>
              <polyline
                points={[100000, ...eqPoints].map((v, i) => `${(i / eqPoints.length) * 300},${toSvgY(v)}`).join(" ")}
                fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <polygon
                points={`0,80 ${[100000, ...eqPoints].map((v, i) => `${(i / eqPoints.length) * 300},${toSvgY(v)}`).join(" ")} 300,80`}
                fill="url(#eqGrad)"
              />
            </>
          ) : (
            <text x="150" y="45" fill="var(--text-desc)" className="text-xs" textAnchor="middle">Execute simulator trades to plot equity curve</text>
          )}
        </svg>
      </div>

      {/* Behavioral Score */}
      <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg">
        <h4 className="text-sm font-bold text-title mb-4">AI Behavioral Score</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Discipline", score: trades.length ? +(disciplineScore * 0.95 + 1).toFixed(1) : 0, color: "#FFD700" },
            { label: "Risk Mgmt", score: trades.length ? +(Math.min(10, rewardRiskRatio * 4 + 1.2)).toFixed(1) : 0, color: "#00E676" },
            { label: "Consistency", score: trades.length ? +(disciplineScore * 1.05).toFixed(1) : 0, color: "#818cf8" },
            { label: "Psychology", score: trades.length ? +(disciplineScore * 0.9).toFixed(1) : 0, color: "#fb923c" }
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-full">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={s.color} strokeWidth="3"
                    strokeDasharray={`${s.score * 10} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-title">{s.score}</div>
              </div>
              <div className="text-[10px] text-desc font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Trade Journal Table ───────────────────────────────────────────────────────
function TradeJournalPanel({ trades }: { trades: Trade[] }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? trades : trades.filter(t => t.status === filter);

  return (
    <div className="glass-panel rounded-2xl border-panel-border bg-panel-bg overflow-hidden">
      <div className="p-4 border-b border-panel-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-title">Trade Journal</h3>
        <div className="flex gap-2">
          {["ALL", "WIN", "LOSS"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${filter === f ? "bg-gradient-gold text-black" : "bg-panel-bg border border-panel-border text-sec hover:text-title"}`}
            >{f}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-panel-border">
              {["Symbol", "Type", "Open Time", "P&L", "Pips", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-desc uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border font-mono">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-panel-bg/50 transition-colors">
                <td className="px-4 py-3 font-bold text-title">{t.symbol}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 font-bold ${t.type === "BUY" ? "text-green-accent" : "text-red-accent"}`}>
                    {t.type === "BUY" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-desc">{t.openTime}</td>
                <td className={`px-4 py-3 font-black ${t.profit >= 0 ? "text-green-accent" : "text-red-accent"}`}>
                  {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-desc">{t.pips}</td>
                <td className="px-4 py-3 font-sans">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${t.status === "WIN" ? "bg-green-500/20 text-green-accent" : "bg-red-500/20 text-red-accent"}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Leaderboard Panel ────────────────────────────────────────────────────────
function LeaderboardPanel({ user }: { user: FBUser }) {
  const leaderboard = [
    { rank: 1, name: "Kishan S.", winRate: 82, pnl: "+$24,500", score: 9.4 },
    { rank: 2, name: "Rahul M.", winRate: 78, pnl: "+$18,200", score: 8.9 },
    { rank: 3, name: "Priya K.", winRate: 74, pnl: "+$15,700", score: 8.5 },
    { rank: 4, name: user.displayName, winRate: 68, pnl: "+$9,800", score: 7.8 },
    { rank: 5, name: "Arjun V.", winRate: 65, pnl: "+$8,100", score: 7.4 },
    { rank: 6, name: "Sneha R.", winRate: 61, pnl: "+$6,500", score: 7.0 },
    { rank: 7, name: "Dev P.", winRate: 58, pnl: "+$4,900", score: 6.6 },
  ];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="glass-panel rounded-2xl border-panel-border bg-panel-bg overflow-hidden">
      <div className="p-4 border-b border-panel-border flex items-center gap-2">
        <Trophy className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-bold text-title">Global Leaderboard</h3>
        <span className="ml-auto text-[10px] text-desc px-2 py-0.5 rounded-full border border-panel-border">This Month</span>
      </div>
      <div className="divide-y divide-panel-border">
        {leaderboard.map((entry, i) => {
          const isCurrentUser = entry.name === user.displayName;
          return (
            <div key={i} className={`flex items-center gap-4 px-4 py-3 ${isCurrentUser ? "bg-purple-500/10 border-l-2 border-purple-500" : "hover:bg-panel-bg/50"} transition-colors`}>
              <span className="w-8 text-center text-sm font-black">
                {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
              </span>
              <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center font-bold text-gold text-xs flex-shrink-0">
                {entry.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-title flex items-center gap-1">
                  {entry.name}
                  {isCurrentUser && <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">YOU</span>}
                </div>
                <div className="text-[10px] text-desc font-mono">Win Rate: {entry.winRate}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-green-accent font-mono">{entry.pnl}</div>
                <div className="text-[10px] text-gold">Score: {entry.score}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Custom Social Icons ──────────────────────────────────────────────────────
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// ─── Share Card ───────────────────────────────────────────────────────────────
function ShareCardPanel({ user, trades }: { user: FBUser; trades: Trade[] }) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const winRate = trades.length ? Math.round((trades.filter(t => t.status === "WIN").length / trades.length) * 100) : 0;
  const totalPL = trades.reduce((s, t) => s + t.profit, 0);

  const shareUrl = "https://tradinjournal.ai/dashboard";
  const shareText = `Check out my TradinJournal performance! Win Rate: ${winRate}%, Trades: ${trades.length}, Net P&L: $${totalPL.toFixed(0)}. Analyzed by AI Coach.`;

  const handleShareToggle = () => {
    setShowShareMenu(!showShareMenu);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg">
        <h3 className="text-sm font-bold text-title mb-4">Performance Share Card</h3>
        <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-[#0d0d14] to-[#1a0d2e] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center font-black text-purple-300 text-sm">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold dropdown-forced-title">{user.displayName}</div>
                <div className="text-[9px] text-purple-300/80 font-sans">TradinJournal Member</div>
              </div>
            </div>
            <div className="text-[9px] text-purple-400 font-mono font-semibold">TRADINJOURNAL.AI</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-black text-green-400 font-mono">{winRate}%</div>
              <div className="text-[9px] dropdown-forced-desc font-medium">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black dropdown-forced-gold font-mono">{trades.length}</div>
              <div className="text-[9px] dropdown-forced-desc font-medium">Trades</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-black font-mono ${totalPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${totalPL.toFixed(0)}
              </div>
              <div className="text-[9px] dropdown-forced-desc font-medium">Net P&L</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={handleShareToggle}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                showShareMenu
                  ? "bg-purple-700 text-white shadow-inner"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/10"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> {showShareMenu ? "Close Menu" : "Share Card"}
            </button>
            <button className="py-2.5 px-4 rounded-lg border border-panel-border text-desc hover:text-title transition-colors text-xs font-bold uppercase flex items-center gap-1 cursor-pointer">
              <Download className="w-3.5 h-3.5" /> PNG
            </button>
          </div>

          {/* Social Sharing Intent Menu */}
          {showShareMenu && (
            <div className="p-4 rounded-xl border border-panel-border bg-black/25 mt-1 space-y-3 animate-fade-in">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-desc">Share to Social Networks</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#0e0e16]/60 border border-panel-border dropdown-forced-title hover:bg-white/5 hover:border-purple-500/40 transition-all text-[11px] font-semibold cursor-pointer"
                >
                  <TwitterIcon className="w-3.5 h-3.5 text-sky-400" />
                  X / Twitter
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#0e0e16]/60 border border-panel-border dropdown-forced-title hover:bg-white/5 hover:border-purple-500/40 transition-all text-[11px] font-semibold cursor-pointer"
                >
                  <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />
                  Facebook
                </a>

                {/* Instagram */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    alert("Card copy & share URL copied to clipboard! You can paste this as your Instagram post caption.");
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#0e0e16]/60 border border-panel-border dropdown-forced-title hover:bg-white/5 hover:border-purple-500/40 transition-all text-[11px] font-semibold cursor-pointer"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                  Instagram
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#0e0e16]/60 border border-panel-border dropdown-forced-title hover:bg-white/5 hover:border-purple-500/40 transition-all text-[11px] font-semibold cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-purple-400" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




// ─── Main Dashboard ───────────────────────────────────────────────────────────
type Tab = "overview" | "simulator" | "ai-coach" | "journal" | "leaderboard" | "share";

function Dashboard() {
  const { user, signOut, saveTrade, updateBalance } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Market Prices State for Simulation
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({
    EURUSD: 1.08450, GBPUSD: 1.27210, USDJPY: 157.85, AUDUSD: 0.66500, USDCAD: 1.36800, USDCHF: 0.89500, NZDUSD: 0.61200, EURGBP: 0.85200, EURJPY: 171.20, GBPJPY: 200.80,
    BTCUSD: 65120.00, ETHUSD: 3450.00, SOLUSD: 135.50, XRPUSD: 0.4850, ADAUSD: 0.3850, DOGEUSD: 0.1250, LTCUSD: 72.50,
    XAUUSD: 2324.50, XAGUSD: 29.50, USOIL: 81.20, UKOIL: 85.30,
    NASDAQ: 19850.00, SPX500: 5460.00, DOW30: 39150.00, GER30: 18180.00, UK100: 8250.00,
    AAPL: 214.30, MSFT: 450.20, GOOGL: 178.50, AMZN: 189.10, TSLA: 187.40, NVDA: 118.20, META: 498.80, NFLX: 685.50
  });

  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const closingPositionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const ids = new Set(openPositions.map(p => p.id));
    closingPositionsRef.current.forEach(id => {
      if (!ids.has(id)) {
        closingPositionsRef.current.delete(id);
      }
    });
  }, [openPositions]);

  const trades = user?.trades || [];
  const balance = user?.balance ?? 100000;

  const calculatePositionPL = useCallback((pos: Position, currentPrice: number) => {
    const difference = pos.type === "BUY" ? (currentPrice - pos.openPrice) : (pos.openPrice - currentPrice);
    let multiplier = 100000;
    if (pos.symbol === "XAUUSD") multiplier = 100;
    if (pos.symbol === "BTCUSD") multiplier = 1;
    if (pos.symbol === "NASDAQ") multiplier = 10;
    let profit = difference * pos.lots * multiplier;
    if (pos.symbol === "USDJPY") profit = profit / currentPrice;
    return +profit.toFixed(2);
  }, []);

  const closePosition = useCallback(async (posId: string, triggerReason?: string, customPrice?: number) => {
    const pos = openPositions.find(p => p.id === posId);
    if (!pos) return;
    if (!triggerReason && isMarketClosedForSymbol(pos.symbol)) {
      alert(`Cannot close position. The market for ${pos.symbol} is currently closed (Weekends).`);
      return;
    }
    const currentPrice = customPrice ?? marketPrices[pos.symbol];
    const profit = calculatePositionPL(pos, currentPrice);
    const difference = pos.type === "BUY" ? (currentPrice - pos.openPrice) : (pos.openPrice - currentPrice);
    let pipMultiplier = 10000;
    if (pos.symbol === "XAUUSD" || pos.symbol === "NASDAQ" || pos.symbol === "USDJPY") pipMultiplier = 10;
    if (pos.symbol === "BTCUSD") pipMultiplier = 1;
    const pips = +(difference * pipMultiplier).toFixed(1);
    const closedTrade: Trade = {
      id: "t-" + Date.now(),
      symbol: pos.symbol,
      type: pos.type,
      openTime: pos.openTime,
      closeTime: new Date().toISOString().substring(0, 19).replace("T", " "),
      openPrice: pos.openPrice,
      closePrice: currentPrice,
      lots: pos.lots,
      profit,
      pips: Math.abs(pips),
      status: profit >= 0 ? "WIN" : "LOSS",
      notes: triggerReason ? `Auto-closed (Hit ${triggerReason}) at ${currentPrice}.` : `Closed simulated trade at ${currentPrice}.`
    };
    await saveTrade(closedTrade);
    await updateBalance(+(balance + profit).toFixed(2));
    setOpenPositions(prev => prev.filter(p => p.id !== posId));
  }, [openPositions, marketPrices, balance, saveTrade, updateBalance, calculatePositionPL]);

  const updatePositionSL = useCallback((posId: string, val: number | undefined) => {
    setOpenPositions(prev => prev.map(p => p.id === posId ? { ...p, sl: val } : p));
  }, []);

  const updatePositionTP = useCallback((posId: string, val: number | undefined) => {
    setOpenPositions(prev => prev.map(p => p.id === posId ? { ...p, tp: val } : p));
  }, []);

  useEffect(() => {
    if (openPositions.length === 0) return;
    openPositions.forEach((pos) => {
      const currentPrice = marketPrices[pos.symbol];
      if (currentPrice === undefined || currentPrice === null || closingPositionsRef.current.has(pos.id)) return;
      let hitSL = false, hitTP = false;
      if (pos.type === "BUY") {
        if (pos.sl !== undefined && currentPrice <= pos.sl) hitSL = true;
        if (pos.tp !== undefined && currentPrice >= pos.tp) hitTP = true;
      } else {
        if (pos.sl !== undefined && currentPrice >= pos.sl) hitSL = true;
        if (pos.tp !== undefined && currentPrice <= pos.tp) hitTP = true;
      }
      if (hitSL || hitTP) {
        closingPositionsRef.current.add(pos.id);
        closePosition(pos.id, hitSL ? "Stop Loss" : "Take Profit", currentPrice);
      }
    });
  }, [marketPrices, openPositions, closePosition]);

  const [simSymbol, setSimSymbol] = useState("XAUUSD");
  const [simLots, setSimLots] = useState<string>("1.0");

  useEffect(() => {
    const fetchRealPrices = async () => {
      const symbolsToFetch = ["XAUUSD", "BTCUSD", "EURUSD", "GBPUSD", "USDJPY", "NASDAQ"];
      try {
        const results = await Promise.all(symbolsToFetch.map(async (sym) => {
          const res = await fetch(`/api/market-data?symbol=${sym}&interval=5m&range=1d`);
          return res.ok ? { symbol: sym, price: (await res.json()).latestPrice } : null;
        }));
        setMarketPrices(prev => {
          const next = { ...prev };
          results.forEach(res => { if (res && res.price) next[res.symbol] = res.price; });
          return next;
        });
      } catch (err) { console.error(err); }
    };
    fetchRealPrices();
  }, []);

  useEffect(() => {
    const syncPrices = async () => {
      try {
        const res = await fetch(`/api/market-data?symbol=${simSymbol}&interval=5m&range=1d`);
        if (res.ok) {
          const data = await res.json();
          if (data.latestPrice) setMarketPrices(prev => ({ ...prev, [simSymbol]: data.latestPrice }));
        }
      } catch (err) { console.error(err); }
    };
    syncPrices();
    const interval = setInterval(syncPrices, 10000);
    return () => clearInterval(interval);
  }, [simSymbol]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMarketPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(sym => {
          if (isMarketClosedForSymbol(sym)) return;
          const change = (Math.random() - 0.5) * getSymbolVolatility(sym);
          next[sym] = +(next[sym] + change).toFixed(getSymbolPrecision(sym));
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    const initialTrades = generateTrades();
    for (const t of initialTrades) await saveTrade(t);
    setSyncing(false);
  };

  const openPL = openPositions.reduce((sum, pos) => sum + calculatePositionPL(pos, marketPrices[pos.symbol]), 0);
  const equity = +(balance + openPL).toFixed(2);
  const marginUsed = openPositions.reduce((sum, pos) => {
    let contractSize = 100000;
    if (pos.symbol === "XAUUSD") contractSize = 100;
    if (pos.symbol === "BTCUSD") contractSize = 1;
    if (pos.symbol === "NASDAQ") contractSize = 10;
    return sum + (pos.lots * contractSize * pos.openPrice) / 100;
  }, 0);
  const margin = +marginUsed.toFixed(2);
  const freeMargin = +(equity - margin).toFixed(2);

  const executeMarketOrder = (type: "BUY" | "SELL", sl?: number, tp?: number) => {
    if (isMarketClosedForSymbol(simSymbol)) {
      alert(`Order execution failed. The market for ${simSymbol} is currently closed (Weekends).`);
      return;
    }
    const parsedLots = parseFloat(simLots);
    if (isNaN(parsedLots) || parsedLots <= 0) {
      alert("Please enter a valid Position Size (Lots) greater than 0.");
      return;
    }
    const openPrice = marketPrices[simSymbol];
    const newPos = {
      id: "pos-" + Date.now(),
      symbol: simSymbol,
      type,
      openPrice,
      openTime: new Date().toISOString().substring(0, 19).replace("T", " "),
      lots: parsedLots,
      sl,
      tp
    };
    setOpenPositions(prev => [newPos, ...prev]);
  };

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "simulator", label: "Simulator", icon: Play },
    { id: "ai-coach", label: "AI Coach", icon: Brain },
    { id: "journal", label: "Trade Journal", icon: FileText },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "share", label: "Share Cards", icon: Share2 }
  ];

  return (
    <div className="min-h-screen bg-app-bg flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-app-bg border-b border-panel-border sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">TRADINJOURNAL</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-desc hover:text-title">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-app-bg border-r border-panel-border transform transition-transform duration-300 md:translate-x-0 md:static flex flex-col justify-between p-5 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-6">
          <div className="hidden md:flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">TRADINJOURNAL</span>
          </div>

          {/* User Card */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-panel-border flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-300 text-sm flex-shrink-0">
              {user.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-title truncate">{user.displayName}</div>
              <div className="text-[9px] text-desc truncate">{user.email}</div>
            </div>
          </div>

          {/* Sync Status */}
          {trades.length > 0 ? (
            <div className="flex items-center gap-2 text-[10px] text-green-accent px-2">
              <Check className="w-3 h-3" /> Live Backend Synced · {trades.length} trades
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-desc px-2">
              <RefreshCw className="w-3 h-3" /> No trade logs on backend
            </div>
          )}

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === item.id ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20" : "text-sec hover:text-title hover:bg-panel-bg"}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-panel-border">
          <Link href="/tradinjournal" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-desc hover:text-title transition-colors">
            <ArrowRight className="w-3.5 h-3.5" /> Back to Landing
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-desc hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 min-w-0 bg-gray-50 dark:bg-app-bg md:h-screen md:overflow-y-auto">
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-panel-border bg-panel-bg">
          <h2 className="text-sm font-bold text-desc uppercase tracking-widest">{navItems.find(n => n.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-3">
            {trades.length > 0 && <span className="text-[10px] text-green-accent flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-accent animate-pulse inline-block" />Backend Synced</span>}
            <span className="text-xs text-desc">{user.displayName}</span>
          </div>
        </header>

        <div className="p-5 md:p-7 space-y-6">

          {/* Welcome Banner */}
          {activeTab === "overview" && (
            <>
              <div className="glass-panel p-5 rounded-2xl border-panel-border bg-panel-bg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-title">Welcome back, {user.firstName}! 👋</h1>
                  <p className="text-xs text-desc mt-1">{trades.length > 0 ? `You have ${trades.length} simulator trades synced to your profile.` : "Start using the simulator and place trades to begin AI coaching."}</p>
                </div>
                {trades.length === 0 && (
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase border border-orange-500/30 flex items-center gap-1 select-none">
                    <Zap className="w-3 h-3" /> Data Sync Needed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1" style={{ display: 'none' }}>
                  <MT5SyncPanel onSync={handleSync} syncing={syncing} />
                </div>
                <div className="lg:col-span-3">
                  {trades.length > 0 ? (
                    <AnalyticsPanel trades={trades} />
                  ) : (
                    <div className="glass-panel p-10 rounded-2xl border-panel-border bg-panel-bg text-center">
                      <BarChart3 className="w-12 h-12 text-desc mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-title">No Trade Logs Available</h3>
                      <p className="text-xs text-desc mt-1">Connect demo broker or place orders in the Simulator tab to pre-populate charts.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "simulator" && (
            <SimulatorPanel
              marketPrices={marketPrices}
              openPositions={openPositions}
              executeMarketOrder={executeMarketOrder}
              closePosition={closePosition}
              updatePositionSL={updatePositionSL}
              updatePositionTP={updatePositionTP}
              simSymbol={simSymbol}
              setSimSymbol={setSimSymbol}
              simLots={simLots}
              setSimLots={setSimLots}
              balance={balance}
              equity={equity}
              margin={margin}
              freeMargin={freeMargin}
              openPL={openPL}
            />
          )}

          {activeTab === "ai-coach" && <AICoachPanel user={user} />}
          {activeTab === "journal" && trades.length > 0 && <TradeJournalPanel trades={trades} />}
          {activeTab === "journal" && trades.length === 0 && (
            <div className="glass-panel p-10 rounded-2xl border-panel-border bg-panel-bg text-center">
              <FileText className="w-12 h-12 text-desc mx-auto mb-3" />
              <h3 className="text-sm font-bold text-title">Empty Journal</h3>
              <p className="text-xs text-desc mt-1">Place simulator trades or pre-populate via demo broker.</p>
              <button onClick={() => setActiveTab("simulator")} className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold uppercase cursor-pointer">Open Simulator</button>
            </div>
          )}
          {activeTab === "leaderboard" && <LeaderboardPanel user={user} />}
          {activeTab === "share" && <ShareCardPanel user={user} trades={trades} />}
        </div>
      </div>
    </div>
  );
}

// ─── Root with Auth ───────────────────────────────────────────────────────────
function DashboardWithAuth() {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-desc">Loading TradinJournal...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthGate onSuccess={() => {}} />;
  return <Dashboard />;
}

export default function TradinJournalDashboardPage() {
  return <DashboardWithAuth />;
}
