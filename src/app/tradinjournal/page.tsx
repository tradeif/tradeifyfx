"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp, Brain, BarChart3, Play, FileText,
  LineChart, Calendar, Share2, Trophy, ArrowRight,
  Zap, CheckCircle, Users, RefreshCw
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const FEATURES = [
  {
    icon: RefreshCw,
    title: "Auto-Sync MT5",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    desc: "Connect your MT5 broker account and automatically import all your trades — no manual entry required. Supports all major brokers."
  },
  {
    icon: Brain,
    title: "AI Coach",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    desc: "AI-powered trading analysis and personalized coaching. Get feedback on your entries, exits, risk management, and emotional discipline."
  },
  {
    icon: BarChart3,
    title: "Behavioral Scoring",
    color: "text-gold",
    bg: "bg-gold/10 border-gold/20",
    desc: "Analyze your trading discipline, consistency, risk management adherence, and overall performance with a scientific scoring system."
  },
  {
    icon: Play,
    title: "Trade Replay",
    color: "text-green-accent",
    bg: "bg-green-500/10 border-green-500/20",
    desc: "Replay your historical trades on real price charts. Study exactly what happened at every key moment of your trade lifecycle."
  },
  {
    icon: FileText,
    title: "Weekly AI Summaries",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    desc: "Receive AI-generated weekly performance reports with actionable insights, pattern analysis, and personalized improvement tips."
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    desc: "50+ trading metrics including profit/loss curves, drawdown analysis, win rate by session, instrument performance, and R-multiple stats."
  },
  {
    icon: Calendar,
    title: "Trading Calendar",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    desc: "Visual monthly calendar showing your trading activity, daily P&L heatmap, and performance history at a glance."
  },
  {
    icon: Share2,
    title: "Share Cards",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    desc: "Generate beautiful trading performance cards with your stats and share them directly to social media or trading communities."
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    desc: "Compare your performance with other traders. View global and community rankings based on win rate, R-multiple, and consistency score."
  }
];

const STATS = [
  { value: "50+", label: "Analytics Metrics" },
  { value: "MT5", label: "Broker Sync" },
  { value: "AI", label: "Powered Coach" },
  { value: "Free", label: "To Get Started" }
];

export default function TradinJournalLanding() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-app-bg">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16 pb-24 border-b border-panel-border">
          {/* Glowing BG */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/8 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-bounce">
              <Brain className="w-3.5 h-3.5" />
              <span>AI-Powered Trading Journal</span>
            </div>

            {/* Logo / Title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  TRADIN
                </span>
                <span className="text-title">JOURNAL</span>
              </h1>
            </div>

            <p className="text-desc text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              The world&apos;s smartest trading journal — connect your MT5 broker, let AI analyze every trade,
              and become a consistently profitable trader with data-driven coaching.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/tradinjournal/dashboard"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-purple-500/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Get Started Free
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl bg-panel-bg border border-panel-border text-title font-bold text-sm hover:border-purple-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                See Features
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {STATS.map((s, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl border-panel-border text-center">
                  <div className="text-2xl font-black text-gradient-gold font-mono">{s.value}</div>
                  <div className="text-[10px] text-desc uppercase font-bold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="py-20 border-b border-panel-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-title">How TradinJournal Works</h2>
              <p className="text-desc text-sm mt-2">Three simple steps to transform your trading</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Connect Your Broker", desc: "Enter your MT5 credentials and our system automatically imports all your historical and live trades.", icon: RefreshCw, color: "from-blue-600 to-cyan-600" },
                { step: "02", title: "AI Analyzes Everything", desc: "Our AI coach reviews every trade, detects patterns, identifies mistakes, and generates your behavioral score.", icon: Brain, color: "from-purple-600 to-indigo-600" },
                { step: "03", title: "Grow Consistently", desc: "Follow personalized AI recommendations, track your progress on the leaderboard, and share your wins.", icon: TrendingUp, color: "from-gold-dark to-gold" }
              ].map((s, i) => (
                <div key={i} className="glass-panel p-8 rounded-2xl border-panel-border bg-panel-bg text-center relative overflow-hidden group hover:border-purple-500/30 transition-all">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-purple-500/20 absolute top-4 right-4 font-mono">{s.step}</div>
                  <h3 className="text-lg font-bold text-title mb-2">{s.title}</h3>
                  <p className="text-xs text-desc leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────── */}
        <section id="features" className="py-20 border-b border-panel-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <Zap className="w-3.5 h-3.5" />
                <span>Everything You Need</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
                Powerful Features for <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Serious Traders</span>
              </h2>
              <p className="text-desc text-sm max-w-2xl mx-auto mt-2">
                Every tool you need to analyze, improve, and showcase your trading performance in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg group hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl border ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-title mb-2">{f.title}</h3>
                  <p className="text-xs text-desc leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ───────────────────────────────────────────── */}
        <section className="py-20 border-b border-panel-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-extrabold text-title mb-3">Enterprise-Grade Backend</h2>
            <p className="text-desc text-sm mb-8">Built on production-ready infrastructure for reliability and security</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Firebase Auth", desc: "Secure authentication" },
                { name: "Firestore DB", desc: "Real-time database" },
                { name: "MT5 API", desc: "Broker integration" },
                { name: "DeepSeek AI", desc: "Intelligent coaching" }
              ].map((t, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl border-panel-border bg-panel-bg text-center">
                  <div className="text-sm font-black text-title mb-1">{t.name}</div>
                  <div className="text-[10px] text-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass-panel p-10 rounded-3xl border-purple-500/20 bg-panel-bg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/8 via-transparent to-transparent pointer-events-none" />
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-title mb-3">Start Journaling for Free</h2>
              <p className="text-desc text-sm mb-6 max-w-xl mx-auto">
                Join thousands of traders who are using AI to accelerate their growth.
                No credit card required — get full access instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tradinjournal/dashboard"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Open TradinJournal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-desc">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-accent" />Free forever plan</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-accent" />No credit card</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-green-accent" />Join 5,000+ traders</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
