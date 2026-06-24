"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoldPriceWidget from "@/components/tradingview/GoldPriceWidget";
import LiveChart from "@/components/tradingview/LiveChart";
import EconomicCalendar from "@/components/tradingview/EconomicCalendar";
import AIChatBot from "@/components/chatbot/AIChatBot";
import GoldenChargingBull from "@/components/tradingview/GoldenChargingBull";
import Image from "next/image";
import { triggerRazorpayCheckout } from "@/utils/razorpay";
import {
  Award,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Phone,
  MessageSquare,
  Sparkles,
  MapPin,
  Mail,
  Send,
  Star,
  Check,
  Zap
} from "lucide-react";

export default function Home() {
  const { 
    user, 
    courses, 
    blogs, 
    upgradeUserTier, 
    sendMessage 
  } = useAppState();

  // Membership Billing cycle toggle
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Animated counters simulation
  const [membersCount, setMembersCount] = useState(14000);
  const [sessionsCount, setSessionsCount] = useState(400);
  const [studentsCount, setStudentsCount] = useState(2100);

  useEffect(() => {
    const interval = setInterval(() => {
      setMembersCount((prev) => (prev < 15420 ? prev + 15 : 15420));
      setSessionsCount((prev) => (prev < 480 ? prev + 1 : 480));
      setStudentsCount((prev) => (prev < 2500 ? prev + 4 : 2500));
    }, 40);

    return () => clearInterval(interval);
  }, []);



  // Handle Membership tier purchase checkout
  const handleMembershipPurchase = (tierName: "Pro" | "VIP", price: number) => {
    if (!user) {
      alert("Please login first using the Login button in the navigation header!");
      return;
    }

    const itemDesc = billingCycle === "monthly" ? `${tierName} Monthly Membership` : `${tierName} Yearly Membership`;

    triggerRazorpayCheckout({
      amount: price,
      itemName: `TRADEIFYFX ${tierName}`,
      description: itemDesc,
      userEmail: user.email,
      userName: user.displayName,
      onSuccess: () => {
        upgradeUserTier(user.uid, tierName);
        alert(`Congratulations! You have upgraded to ${tierName} Tier. Your premium benefits are unlocked.`);
      }
    });
  };

  // Handle Contact Form Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactEmail || !contactMessage) return;

    sendMessage({
      name: contactName,
      phone: contactPhone,
      email: contactEmail,
      message: contactMessage
    });

    setFormSubmitted(true);
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setContactMessage("");

    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <>
      {/* Ticker Tape */}
      <GoldPriceWidget />

      {/* Navigation Header */}
      <Header />

      <main className="flex-1 bg-app-bg">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-panel-border">
          {/* Animated Background Grids */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-white/40 to-white dark:from-gold/10 dark:via-black/40 dark:to-black pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-accent/5 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Info */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>#1 Trading Education Community</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans leading-tight text-title">
                  Master Forex, Gold & <br />
                  <span className="text-gradient-gold">Crypto Trading</span> <br />
                  Like a Professional
                </h1>
                
                <p className="text-desc text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Join TRADEIFYFX and learn real trading strategies, live market analysis, risk management, and professional mentorship.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <a
                    href="#courses"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-gold text-black font-extrabold text-sm text-center shadow-lg hover:opacity-95 glow-gold transition-all duration-300 cursor-pointer"
                  >
                    Start Learning
                  </a>
                  <a
                    href="https://wa.me/919799450432"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-sec border border-gray-200 dark:border-white/10 text-center font-bold text-sm transition-all duration-300 cursor-pointer"
                  >
                    Join Community
                  </a>
                  <a
                    href="#contact"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-black/60 dark:hover:bg-black text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-white/5 text-center font-bold text-sm transition-all cursor-pointer"
                  >
                    Contact Us
                  </a>
                </div>

                {/* Fast Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-panel-border max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                  <div>
                    <h4 className="text-xl font-bold text-gold">{studentsCount}+</h4>
                    <p className="text-[10px] text-desc uppercase font-semibold">Trained Students</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-green-accent">92%</h4>
                    <p className="text-[10px] text-desc uppercase font-semibold">Success Rate</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-title">4.9/5</h4>
                    <p className="text-[10px] text-desc uppercase font-semibold">Google Rating</p>
                  </div>
                </div>
              </div>

              {/* Photorealistic 3D Gold Charging Bull */}
              <div className="lg:col-span-5 relative flex items-center justify-center w-full h-[400px] md:h-[480px]">
                <GoldenChargingBull />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-panel-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Founder Photo Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full max-w-sm mx-auto">
                {/* Outer glow ring */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-gold/40 via-gold/10 to-green-accent/20 blur-md opacity-70" />

                {/* Card */}
                <div className="relative rounded-3xl overflow-hidden glass-panel border border-gold/20 shadow-2xl">
                  {/* TRADEIFYFX Logo badge — top-left */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-gold/30 text-gold text-[11px] font-black tracking-widest uppercase">
                      TRADEIFYFX
                    </span>
                  </div>

                  {/* Founder badge — top-right */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-2.5 py-1 rounded-full bg-gold text-black text-[9px] font-black uppercase tracking-wider shadow-md">
                      Founder
                    </span>
                  </div>

                  {/* Photo */}
                  <div className="relative w-full aspect-[3/4]">
                    <Image
                      src="/founder.png"
                      alt="Kishan Sharma - Founder of TRADEIFYFX"
                      fill
                      className="object-cover object-top"
                      priority
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    {/* Gradient overlay at bottom for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  </div>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className="text-xl font-black text-white font-sans">Kishan Sharma</h3>
                    <p className="text-xs text-gold font-semibold mt-0.5">Head Trader &amp; Mentor</p>
                    <p className="text-[11px] text-white/70 mt-2 leading-relaxed italic">
                      &quot;We don&apos;t trade indicators; we trade institutional footprints.&quot;
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-sm font-black text-gold">2500+</p>
                        <p className="text-[9px] text-white/50 uppercase tracking-wider">Students</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <p className="text-sm font-black text-green-accent">92%</p>
                        <p className="text-[9px] text-white/50 uppercase tracking-wider">Win Rate</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <p className="text-sm font-black text-white">4.9★</p>
                        <p className="text-[9px] text-white/50 uppercase tracking-wider">Rated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Who We Are</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
                Unlocking Elite Knowledge For Consistent Retail Profitability
              </h2>
              <p className="text-desc text-sm sm:text-base leading-relaxed">
                TRADEIFYFX is a premier fintech trading education and signal platform. We are dedicated to coaching traders globally on how to identify high-probability institutional order blocks, liquidity flows, and price actions.
              </p>

              {/* Grid factors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gold">
                    <CheckCircle className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-title">Our Mission</h4>
                  </div>
                  <p className="text-xs text-desc leading-relaxed">
                    To train and mentor 10,000+ traders into independent consistency by removing confusing retail indicators.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gold">
                    <CheckCircle className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-title">Our Vision</h4>
                  </div>
                  <p className="text-xs text-desc leading-relaxed">
                    Building a secure ecosystem of institutional-level analytics, verified trade signals, and elite risk calculations.
                  </p>
                </div>
              </div>

              {/* Bullet checklist trust */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Why Traders Trust TRADEIFYFX</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-desc">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-accent flex-shrink-0" />
                    <span>6+ Years of Proven Market Experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-accent flex-shrink-0" />
                    <span>Real-time XAUUSD Gold Focus Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-accent flex-shrink-0" />
                    <span>Highly Interactive Live Market Rooms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-accent flex-shrink-0" />
                    <span>Strict Account Capital Protection Rules</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* COURSES SECTION */}
        <section id="courses" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-panel-border">
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Our Products</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
              Elite Tools to Fast-Track Your Trading Growth
            </h2>
            <p className="text-desc text-sm max-w-2xl mx-auto">
              Powerful products designed for serious traders — from AI-powered journaling to expert signals and complete trading education.
            </p>
          </div>

          {/* Cards Grid — 2x2 on large, 1-col on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => {
              // Determine product-specific route and button label
              const productConfig: Record<string, { href: string; label: string; badge?: string }> = {
                "tradinjournal":       { href: "/tradinjournal",   label: "Open Journal",  badge: "FREE" },
                "vip-signals":         { href: "/vip-signals",     label: "Get Access" },
                "master-trader-course":{ href: "/master-course",   label: "Get Access" },
                "traders-paradise":    { href: "https://wa.me/919799450432", label: "Get Access" },
              };
              const cfg = productConfig[course.id] ?? { href: "#courses", label: "Get Access" };
              const isExternal = cfg.href.startsWith("http");
              const isFree = course.price === 0;

              return (
                <div
                  key={course.id}
                  className="glass-panel border-panel-border rounded-2xl overflow-hidden flex flex-col h-full bg-panel-bg transition-transform duration-300 hover:-translate-y-2 hover:border-gold/40 group"
                >
                  {/* Course Image */}
                  <div className="h-48 w-full relative bg-gray-100 dark:bg-gray-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-black/80 border border-panel-border text-xs text-gold font-bold">
                      {course.duration}
                    </span>
                    {cfg.badge && (
                      <span className="absolute top-4 left-4 px-2.5 py-1 rounded bg-green-500 text-white text-xs font-black uppercase tracking-wider">
                        {cfg.badge}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-black text-title group-hover:text-gold transition-colors tracking-wide">
                        {course.title}
                      </h3>
                      <p className="text-xs text-desc leading-relaxed line-clamp-3">
                        {course.description}
                      </p>

                      {/* Features list */}
                      <div className="space-y-1.5 pt-2">
                        {course.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-sec">
                            <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-panel-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-desc font-semibold uppercase">Pricing</span>
                        <div className="flex items-center gap-2">
                          {course.originalPrice && course.originalPrice > 0 && (
                            <span className="text-sm text-desc/50 line-through font-mono">
                              ₹{course.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xl font-black text-title font-mono">
                            {isFree ? (
                              <span className="text-green-accent">₹0 (FREE)</span>
                            ) : (
                              `₹${course.price.toLocaleString()}`
                            )}
                          </span>
                        </div>
                      </div>

                      {isExternal ? (
                        <a
                          href={cfg.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-lg bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>{cfg.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <Link
                          href={cfg.href}
                          className="w-full py-3 rounded-lg bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>{cfg.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* LIVE TRADING ROOM */}
        <section id="live" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-panel-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Live Trading Room</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
                Interactive Analysis & Live Market Execution
              </h2>
              <p className="text-desc text-sm max-w-3xl">
                Observe live price action trading directly. We break down the XAUUSD Gold and Bitcoin market structure setups during New York/London sessions, highlighting entry triggers and economic events.
              </p>
            </div>
            <div className="lg:col-span-4 flex items-end lg:justify-end">
              <Link
                href="/live"
                className="px-6 py-3 rounded-lg border border-gold text-gold text-xs font-bold uppercase tracking-wider hover:bg-gold/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Enter Trading Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Embed dynamic widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LiveChart />
            </div>
            <div>
              <EconomicCalendar />
            </div>
          </div>
        </section>

        {/* MEMBERSHIP PLANS */}
        <section id="membership" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-panel-border">
          <div className="text-center space-y-4 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Membership Tiers</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
              Choose Your Level of Mentorship
            </h2>
            <p className="text-desc text-sm max-w-2xl mx-auto">
              Get access to daily premium trading signals, weekly webinars, and personal direct coaching.
            </p>

            {/* Toggle monthly/yearly */}
            <div className="flex items-center justify-center gap-3 pt-6">
              <span className={`text-sm ${billingCycle === "monthly" ? "text-gold font-bold" : "text-desc"}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-14 h-7 rounded-full bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 p-1 transition-colors relative cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-gold absolute top-1 transition-all ${
                    billingCycle === "yearly" ? "left-8" : "left-1"
                  }`}
                />
              </button>
              <span className={`text-sm flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-gold font-bold" : "text-desc"}`}>
                <span>Yearly</span>
                <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-accent text-[9px] font-black uppercase">
                  Save 33%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Basic Plan */}
            <div className="glass-panel border-panel-border p-8 rounded-2xl flex flex-col justify-between bg-panel-bg hover:border-panel-hover-border transition-colors">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-title">Basic Plan</h3>
                  <p className="text-xs text-desc mt-1">For beginner traders testing the waters.</p>
                </div>
                
                <div className="text-3xl font-black text-title font-mono">₹0</div>

                <ul className="space-y-3.5 text-xs text-sec">
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>WhatsApp Community Access</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Daily Broad Market Updates</span>
                  </li>
                  <li className="flex gap-2 text-desc line-through">
                    <span>Premium Gold/Crypto Signals</span>
                  </li>
                  <li className="flex gap-2 text-desc line-through">
                    <span>Weekly Live Session Entry</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                {user ? (
                  <button className="w-full py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-desc text-xs font-bold uppercase cursor-not-allowed">
                    Active Free Tier
                  </button>
                ) : (
                  <button 
                    onClick={() => alert("Please register/login using the top navigation header to unlock the basic level!")}
                    className="w-full py-3 rounded-lg bg-gray-150 hover:bg-gray-200 dark:bg-white/5 border border-gray-250 dark:border-white/10 dark:hover:bg-white/10 text-title text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Get Started Free
                  </button>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="glass-panel border-gold/40 p-8 rounded-2xl flex flex-col justify-between bg-panel-bg glow-gold relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-gold text-black font-black text-[9px] tracking-wider uppercase px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-title text-gradient-gold">Pro Plan</h3>
                  <p className="text-xs text-desc mt-1">For active traders seeking regular profits.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-desc/50 line-through font-mono">
                      ₹{billingCycle === "monthly" ? "2,999" : "23,999"}
                    </span>
                    <span className="text-3xl font-black text-title font-mono text-green-accent">
                      ₹0 <span className="text-xs uppercase font-bold">(FREE)</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-desc uppercase tracking-widest block font-bold">
                    {billingCycle === "monthly" ? "Billed Monthly" : "Billed Yearly (Save ₹12,000)"}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-sec">
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Daily Premium Signals (Forex, Gold, BTC)</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Weekly Live Trading & Strategy Rooms</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Access to Private Discord Server</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleMembershipPurchase("Pro", 0)}
                  className="w-full py-3 rounded-lg bg-gradient-gold text-black font-black text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                  {user && user.tier === "Pro" ? "Already Pro" : "Upgrade to Pro"}
                </button>
              </div>
            </div>

            {/* VIP Plan */}
            <div className="glass-panel border-panel-border p-8 rounded-2xl flex flex-col justify-between bg-panel-bg hover:border-panel-hover-border transition-colors">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-title">VIP Mentorship</h3>
                  <p className="text-xs text-desc mt-1">For serious traders wanting 1-on-1 guidance.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-desc/50 line-through font-mono">
                      ₹{billingCycle === "monthly" ? "9,999" : "79,999"}
                    </span>
                    <span className="text-3xl font-black text-title font-mono text-green-accent">
                      ₹0 <span className="text-xs uppercase font-bold">(FREE)</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-desc uppercase tracking-widest block font-bold">
                    {billingCycle === "monthly" ? "Billed Monthly" : "Billed Yearly (Save ₹40,000)"}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-sec">
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex gap-2 flex-wrap items-center">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="text-gold font-bold">Personal 1-on-1 Direct Mentorship</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Advanced Custom Indicator / Trading Systems</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>Direct WhatsApp Call Access to Founder</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleMembershipPurchase("VIP", 0)}
                  className="w-full py-3 rounded-lg bg-gray-150 border border-gray-250 hover:border-gold/40 dark:bg-white/5 dark:border-white/10 text-title hover:text-gold text-xs font-black tracking-wider uppercase transition-colors cursor-pointer"
                >
                  {user && user.tier === "VIP" ? "Already VIP" : "Upgrade to VIP"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STUDENT SUCCESS STORIES */}
        <section id="stories" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-panel-border">
          <div className="text-center space-y-3 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Testimonials</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
              Real Results From Our Students
            </h2>
            <p className="text-desc text-sm max-w-2xl mx-auto">
              See verified profit screenshots and stories from students who transitioned from losing retail accounts to consistent payouts.
            </p>
          </div>

          {/* Testimonial slider layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold" />)}
                </div>
                <p className="text-xs sm:text-sm text-sec italic leading-relaxed">
                  &quot;I was struggling for 2 years with indicators. Kishan&apos;s SMC course simplified market structure for me. Last week I hit a 1:8 risk-reward trade on XAUUSD and withdrew my first payout!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-panel-border mt-6">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center font-bold text-gold text-sm border border-gold/20">
                  AP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-title">Aniket Patel</h4>
                  <span className="text-[10px] text-green-accent font-semibold font-mono">Profit: +₹1,24,000 (XAUUSD)</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-gold/30 bg-panel-bg flex flex-col justify-between glow-gold">
              <div className="space-y-4">
                <div className="flex gap-1 text-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold" />)}
                </div>
                <p className="text-xs sm:text-sm text-sec italic leading-relaxed">
                  &quot;The daily Signals in the Pro plan are exceptionally high accuracy. I risk exactly 1% per signal. The Gold trades are spectacular. Highly recommend the VIP mentorship if you want custom feedback!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-panel-border mt-6">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center font-bold text-gold text-sm border border-gold/20">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-title">Rahul Singh</h4>
                  <span className="text-[10px] text-green-accent font-semibold font-mono">Profit: +₹3,40,000 (Signals)</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold" />)}
                </div>
                <p className="text-xs sm:text-sm text-sec italic leading-relaxed">
                  &quot;Before TRADEIFYFX, I had no risk plan. The Risk Blueprint course completely transformed my psychology. I no longer panic during drawdown. The journal tool is a game changer.&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-panel-border mt-6">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center font-bold text-gold text-sm border border-gold/20">
                  MK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-title">Meera K.</h4>
                  <span className="text-[10px] text-green-accent font-semibold font-mono">Drawdown Recovered</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BLOG SNIPPET SECTION */}
        <section id="blogs" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-panel-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Market Insights</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
                Latest Analysis & Lessons
              </h2>
              <p className="text-desc text-sm max-w-2xl">
                Stay updated with macroeconomic parameters, technical levels, and trading psychology rules.
              </p>
            </div>
            <Link
              href="/blog"
              className="px-5 py-2.5 rounded-lg bg-gray-150 border border-gray-250 hover:border-gold/30 dark:bg-white/5 dark:border-white/10 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-title"
            >
              View All Articles
            </Link>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.slice(0, 3).map((blog) => (
              <Link
                href={`/blog/${blog.slug}`}
                key={blog.id}
                className="glass-panel border-panel-border rounded-2xl overflow-hidden bg-panel-bg flex flex-col h-full hover:border-gold/30 transition-all duration-300 group"
              >
                <div className="h-44 w-full relative bg-gray-100 dark:bg-gray-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <span className="absolute top-4 left-4 px-2 py-0.5 rounded bg-gold text-black text-[9px] font-black uppercase tracking-wider">
                    {blog.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-desc font-semibold uppercase font-mono">
                      <span>{blog.author}</span>
                      <span>{blog.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-title group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-desc leading-relaxed line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-panel-border mt-4 flex items-center gap-1 text-[11px] text-gold font-bold uppercase">
                    <span>Read Full Post</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* COMMUNITY SECTION */}
        <section id="community" className="py-24 bg-gradient-to-b from-app-bg to-app-bg border-b border-panel-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-panel border-panel-border p-8 md:p-12 rounded-3xl glow-gold bg-panel-bg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>Join the community</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-title">
                    Never Trade Alone. Connect with 15k+ Traders!
                  </h2>
                  <p className="text-desc text-sm sm:text-base leading-relaxed">
                    Access free daily chart updates, gold price movements, instant economic alerts, and live trading webinars. Our Telegram and WhatsApp feeds are 100% free to join.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-panel-border">
                      <h4 className="text-2xl font-black text-gold font-mono">{membersCount.toLocaleString()}+</h4>
                      <p className="text-[10px] text-desc font-semibold uppercase mt-0.5">Active Members</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-panel-border">
                      <h4 className="text-2xl font-black text-green-accent font-mono">{sessionsCount}+</h4>
                      <p className="text-[10px] text-desc font-semibold uppercase mt-0.5">Live Sessions</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-panel-border">
                      <h4 className="text-2xl font-black text-title font-mono">24/7</h4>
                      <p className="text-[10px] text-desc font-semibold uppercase mt-0.5">Support & Chat</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="https://wa.me/919799450432"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-green-accent hover:bg-green-500/5 transition-all text-center group cursor-pointer"
                  >
                    <MessageSquare className="w-8 h-8 text-green-accent mx-auto mb-3 group-hover:scale-105 transition-transform" />
                    <h4 className="text-sm font-bold text-title">WhatsApp Community</h4>
                    <p className="text-[10px] text-desc mt-1 leading-relaxed">Free daily signals, alerts & chart analysis updates</p>
                  </a>

                  <a
                    href="https://t.me/tradeifyfx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-400 hover:bg-blue-400/5 transition-all text-center group cursor-pointer"
                  >
                    <Send className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-105 transition-transform" />
                    <h4 className="text-sm font-bold text-title">Telegram Channel</h4>
                    <p className="text-[10px] text-desc mt-1 leading-relaxed">Economic calendar breakdowns & instant alerts</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Contact Info & Map */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Get In Touch</span>
                </span>
                <h2 className="text-3xl font-extrabold text-title">Ready to Elevate Your Trading?</h2>
                <p className="text-desc text-sm leading-relaxed">
                  Have questions about our training courses, custom indicator setup, or VIP private mentorship? Give us a call or send a message. Our team is here to assist.
                </p>
              </div>

              {/* Contact list details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-desc uppercase font-bold tracking-widest block">Direct Call / WhatsApp</span>
                    <a href="tel:+919799450432" className="text-sm sm:text-base font-black hover:text-gold transition-colors text-title">+91 9799450432</a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-desc uppercase font-bold tracking-widest block">Email Support</span>
                    <a href="mailto:support@tradeifyfx.com" className="text-sm sm:text-base font-black hover:text-gold transition-colors text-title">support@tradeifyfx.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-desc uppercase font-bold tracking-widest block">Head Office</span>
                    <span className="text-sm sm:text-base font-bold text-sec">Jaipur, Rajasthan, India</span>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="w-full h-48 rounded-2xl overflow-hidden border border-panel-border relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14234.629080757917!2d75.76634591782298!3d26.882650050860578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db450a8b945d9%3A0x3c71be391df130a0!2sMansarovar%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1718804561000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="TRADEIFYFX Head Office Location"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 glass-panel border-panel-border p-8 rounded-3xl bg-panel-bg flex flex-col justify-center">
              <h3 className="text-lg font-black text-title mb-6">Send Us a Direct Message</h3>

              {formSubmitted ? (
                <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-accent mx-auto" />
                  <h4 className="text-sm font-bold text-title">Message Sent Successfully!</h4>
                  <p className="text-xs text-desc">Our trading desk will contact you shortly on your provided mobile number.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Enter name"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Enter mobile number"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="trader@gmail.com"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="How can we help you? E.g., course details, membership upgrade..."
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-lg bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 glow-gold"
                  >
                    <span>Submit Query</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919799450432"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform border border-green-600/20 cursor-pointer animate-pulse"
        title="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6 fill-white text-green-500" />
      </a>

      {/* AI Chat Support */}
      <AIChatBot />

      {/* Footer */}
      <Footer />
    </>
  );
}
