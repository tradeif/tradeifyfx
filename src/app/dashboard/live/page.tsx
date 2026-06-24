"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, ExternalLink, Play, Lock, ShieldAlert } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

interface LiveArchive {
  id: string;
  title: string;
  date: string;
  duration: string;
  tierRequired: "Basic" | "Pro" | "VIP";
  thumbnail: string;
}

const ARCHIVE_SESSIONS: LiveArchive[] = [
  {
    id: "arch-1",
    title: "New York Session - Gold H4 Liquidity Sweeps Breakdown",
    date: "June 18, 2026",
    duration: "1h 15m",
    tierRequired: "Pro",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "arch-2",
    title: "London Session - EURUSD SMC Fair Value Gap Fills",
    date: "June 17, 2026",
    duration: "55m",
    tierRequired: "Pro",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "arch-3",
    title: "VIP 1-on-1 Strategy - Advanced Breaker Blocks Mastery",
    date: "June 16, 2026",
    duration: "2h 05m",
    tierRequired: "VIP",
    thumbnail: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "arch-4",
    title: "Introductory Class - Core Market Structure Shift (MSS)",
    date: "June 15, 2026",
    duration: "45m",
    tierRequired: "Basic",
    thumbnail: "https://images.unsplash.com/photo-1610375228911-c4ab02298853?q=80&w=400&auto=format&fit=crop"
  }
];

export default function LiveSessions() {
  const { user } = useAppState();
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // reset for simulation
          return { hours: 8, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  // Helper check for tier permissions
  const hasAccess = (itemTier: "Basic" | "Pro" | "VIP") => {
    if (user.role === "admin") return true;
    if (itemTier === "Basic") return true;
    if (itemTier === "Pro" && (user.tier === "Pro" || user.tier === "VIP")) return true;
    if (itemTier === "VIP" && user.tier === "VIP") return true;
    return false;
  };

  return (
    <div className="space-y-8">
      {/* Overview timing and Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Next Live session widget */}
        <div className="lg:col-span-8 glass-panel border border-gold/20 p-6 rounded-2xl bg-panel-bg flex flex-col justify-between relative overflow-hidden glow-gold">
          <div className="space-y-4 z-10 relative">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gold/15 text-gold text-[9px] font-black uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping"></span>
              <span>Next Scheduled Session</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-title font-sans">New York Session live Market Markup</h2>
            <p className="text-xs text-desc max-w-xl leading-relaxed">
              Join founder Kishan Sharma as he scans live charts for institutional order flow setups on Gold (XAUUSD) and BTCUSD before the New York market bell opens.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-sec">
                <Calendar className="w-4 h-4 text-gold" />
                <span>Monday to Friday</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-sec">
                <Clock className="w-4 h-4 text-gold" />
                <span>17:30 (GMT +5:30)</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-panel-border mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between z-10 relative">
            {hasAccess("Pro") ? (
              <a
                href="https://zoom.us"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 glow-gold cursor-pointer"
              >
                <span>Join Zoom Stream</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Pro Membership Required to Stream</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-desc font-semibold font-mono">
              <span>Starts In:</span>
              <span className="text-gold font-black bg-gray-50 dark:bg-white/5 border border-panel-border px-2.5 py-1 rounded text-sm tracking-widest font-mono">
                {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Live status agenda pane */}
        <div className="lg:col-span-4 glass-panel border-panel-border p-6 rounded-2xl bg-panel-bg flex flex-col justify-between">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3">
            Weekly Live Schedule
          </h3>
          <div className="space-y-3.5 my-4">
            <div className="flex justify-between items-center text-xs text-sec">
              <span className="font-semibold">Monday (Asia Open)</span>
              <span className="text-gold text-[10px] font-mono">10:00 AM</span>
            </div>
            <div className="flex justify-between items-center text-xs text-sec">
              <span className="font-semibold">Tuesday (London Run)</span>
              <span className="text-gold text-[10px] font-mono">01:30 PM</span>
            </div>
            <div className="flex justify-between items-center text-xs text-sec">
              <span className="font-semibold">Wednesday (NY Bells)</span>
              <span className="text-gold text-[10px] font-mono">05:30 PM</span>
            </div>
            <div className="flex justify-between items-center text-xs text-sec">
              <span className="font-semibold">Thursday (NY Bells)</span>
              <span className="text-gold text-[10px] font-mono">05:30 PM</span>
            </div>
            <div className="flex justify-between items-center text-xs text-sec">
              <span className="font-semibold">Friday (Market Close)</span>
              <span className="text-gold text-[10px] font-mono">07:00 PM</span>
            </div>
          </div>
          <span className="text-[10px] text-desc text-center font-semibold italic">Note: All sessions are recorded and archived.</span>
        </div>

      </div>

      {/* Archives session section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gradient-gold uppercase tracking-wider">
          Recorded Live Archives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARCHIVE_SESSIONS.map((session) => {
            const unlocked = hasAccess(session.tierRequired);
            return (
              <div
                key={session.id}
                className="glass-panel border-panel-border rounded-2xl overflow-hidden bg-panel-bg flex flex-col justify-between hover:border-panel-border transition-colors relative group"
              >
                {/* Image layout */}
                <div className="h-32 w-full relative bg-gray-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={session.thumbnail}
                    alt={session.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    {unlocked ? (
                      <button 
                        onClick={() => alert(`Playing: ${session.title}`)}
                        className="w-10 h-10 rounded-full bg-gold hover:scale-105 transition-transform flex items-center justify-center text-black cursor-pointer shadow-lg"
                      >
                        <Play className="w-4.5 h-4.5 fill-black ml-0.5" />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-panel-bg/80 border border-panel-border flex items-center justify-center text-desc">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-gray-200">
                    {session.duration}
                  </span>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-desc font-bold font-mono">{session.date}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-wider ${
                        session.tierRequired === "VIP"
                          ? "bg-red-500/20 text-red-400"
                          : session.tierRequired === "Pro"
                            ? "bg-gold/20 text-gold"
                            : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {session.tierRequired}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-title line-clamp-2 leading-snug">
                      {session.title}
                    </h4>
                  </div>

                  {!unlocked && (
                    <button 
                      onClick={() => alert(`This archive is locked. Please upgrade to ${session.tierRequired} plan to unlock.`)}
                      className="w-full py-1.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-panel-border text-center text-[9px] font-black uppercase tracking-widest text-gold cursor-pointer"
                    >
                      Unlock Archive
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
