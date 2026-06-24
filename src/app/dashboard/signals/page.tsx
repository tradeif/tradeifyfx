"use client";

import React from "react";
import { useAppState } from "@/context/AppStateContext";
import { triggerRazorpayCheckout } from "@/utils/razorpay";
import { Zap, Lock, AlertTriangle } from "lucide-react";

export default function TradingSignals() {
  const { user, signals, upgradeUserTier } = useAppState();

  if (!user) return null;

  const hasAccess = (sigTier: "Basic" | "Pro" | "VIP") => {
    if (user.role === "admin") return true;
    if (sigTier === "Basic") return true;
    if (sigTier === "Pro" && (user.tier === "Pro" || user.tier === "VIP")) return true;
    if (sigTier === "VIP" && user.tier === "VIP") return true;
    return false;
  };

  const handleUpgradeTrigger = (targetTier: "Pro" | "VIP") => {
    const price = 0;
    triggerRazorpayCheckout({
      amount: price,
      itemName: `TRADEIFYFX ${targetTier}`,
      description: `Upgrade to ${targetTier} Signals Mentorship`,
      userEmail: user.email,
      userName: user.displayName,
      onSuccess: () => {
        upgradeUserTier(user.uid, targetTier);
        alert(`Upgraded successfully! You now have full access to ${targetTier} signals.`);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Intro info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gold/10 via-panel-bg to-panel-bg p-6 rounded-2xl border border-panel-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Daily Premium Trade Signals</h1>
          <p className="text-xs text-desc mt-1">High-probability price action configurations published by Kishan Sharma.</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-bold uppercase">
          Current Tier: <span className="font-black text-title">{user.tier}</span>
        </div>
      </div>

      {/* Signals Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {signals.map((sig) => {
          const unlocked = hasAccess(sig.tierRequired);
          
          return (
            <div
              key={sig.id}
              className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between transition-colors relative overflow-hidden bg-panel-bg ${
                unlocked 
                  ? sig.status === "Hit Target" 
                    ? "border-green-500/20 hover:border-green-500/35" 
                    : sig.status === "Stop Loss Hit"
                      ? "border-red-500/20 hover:border-red-500/35"
                      : "border-panel-border hover:border-panel-border"
                  : "border-panel-border opacity-80"
              }`}
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-center pb-3.5 border-b border-panel-border">
                  <div>
                    <h3 className="text-base font-black text-title">{sig.pair}</h3>
                    <span className="text-[10px] text-desc font-mono font-semibold">{sig.timestamp}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      sig.tierRequired === "VIP"
                        ? "bg-red-500/20 text-red-400"
                        : sig.tierRequired === "Pro"
                          ? "bg-gold/20 text-gold"
                          : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {sig.tierRequired}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      sig.status === "Active"
                        ? "bg-gold text-black animate-pulse"
                        : sig.status === "Hit Target"
                          ? "bg-green-500/20 text-green-accent"
                          : "bg-red-500/20 text-red-400"
                    }`}>
                      {sig.status}
                    </span>
                  </div>
                </div>

                {/* Signals Data Box */}
                {unlocked ? (
                  <div className="grid grid-cols-3 gap-4 py-2 font-mono">
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-panel-border text-center">
                      <span className="text-[9px] text-desc font-sans block uppercase font-bold tracking-widest mb-1">Entry Range</span>
                      <span className="text-xs sm:text-sm font-black text-title">{sig.entry}</span>
                    </div>
                    <div className="bg-green-500/5 p-3 rounded-lg border border-green-500/10 text-center">
                      <span className="text-[9px] text-green-accent font-sans block uppercase font-bold tracking-widest mb-1">Take Profit</span>
                      <span className="text-xs sm:text-sm font-black text-green-accent">{sig.tp}</span>
                    </div>
                    <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/10 text-center">
                      <span className="text-[9px] text-red-400 font-sans block uppercase font-bold tracking-widest mb-1">Stop Loss</span>
                      <span className="text-xs sm:text-sm font-black text-red-400">{sig.sl}</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative py-8 bg-gray-100/50 dark:bg-white/5 rounded-xl border border-panel-border overflow-hidden flex flex-col items-center justify-center text-center px-4 space-y-3">
                    {/* Blurr overlay effect */}
                    <div className="absolute inset-0 backdrop-blur-[6px] pointer-events-none" />
                    
                    <Lock className="w-8 h-8 text-gold z-10" />
                    <h4 className="text-xs font-bold text-title uppercase tracking-wider z-10">Signal locked</h4>
                    <p className="text-[10px] text-desc max-w-xs z-10 leading-normal">
                      This high-accuracy trade configuration requires a {sig.tierRequired} membership. Upgrade to view.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!unlocked && (
                <div className="pt-5 border-t border-panel-border mt-5">
                  <button
                    onClick={() => handleUpgradeTrigger(sig.tierRequired as "Pro" | "VIP")}
                    className="w-full py-2.5 rounded-lg bg-gradient-gold text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Unlock with {sig.tierRequired} Membership</span>
                  </button>
                </div>
              )}

              {unlocked && sig.status === "Active" && (
                <div className="pt-4 border-t border-panel-border mt-4 text-[10px] text-desc font-semibold italic flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>Execute order with strict lot-sizes matching your risk plan.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
