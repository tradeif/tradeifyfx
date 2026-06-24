"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { Plus, Trash2, Send } from "lucide-react";

export default function PublishSignals() {
  const { signals, addSignal, deleteSignal } = useAppState();

  // Form states
  const [pair, setPair] = useState("");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [entry, setEntry] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [tierRequired, setTierRequired] = useState<"Basic" | "Pro" | "VIP">("Pro");
  const [status, setStatus] = useState<"Active" | "Hit Target" | "Stop Loss Hit">("Active");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entry || !tp || !sl) {
      alert("Please fill in all core fields!");
      return;
    }

    addSignal({
      pair: pair.toUpperCase(),
      type,
      entry,
      tp,
      sl,
      tierRequired,
      status
    });

    // Reset Form
    setPair("");
    setType("BUY");
    setEntry("");
    setTp("");
    setSl("");
    setTierRequired("Pro");
    setStatus("Active");
    setShowAddForm(false);
    alert("Trade Signal published successfully. Broadcast completed.");
  };

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Publish Trading Signals</h1>
          <p className="text-xs text-desc mt-1">Broadcast new trade configurations or delete completed trades.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel Adding" : "Publish Signal"}</span>
        </button>
      </div>

      {/* Add Signal Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4 max-w-3xl">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3">New Setup Configuration</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Asset Pair</label>
              <input
                type="text"
                required
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="XAUUSD"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Position Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "BUY" | "SELL")}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title focus:outline-none focus:border-red-400"
              >
                <option value="BUY" className="bg-app-bg text-title">BUY</option>
                <option value="SELL" className="bg-app-bg text-title">SELL</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Entry Range</label>
              <input
                type="text"
                required
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="2312 - 2315"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Take Profit (TP)</label>
              <input
                type="text"
                required
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                placeholder="2330.00"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Stop Loss (SL)</label>
              <input
                type="text"
                required
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                placeholder="2304.00"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Required Tier</label>
              <select
                value={tierRequired}
                onChange={(e) => setTierRequired(e.target.value as "Basic" | "Pro" | "VIP")}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title focus:outline-none focus:border-red-400"
              >
                <option value="Basic" className="bg-app-bg text-title">Basic (Free)</option>
                <option value="Pro" className="bg-app-bg text-title">Pro Tier</option>
                <option value="VIP" className="bg-app-bg text-title">VIP Tier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Signal Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Hit Target" | "Stop Loss Hit")}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title focus:outline-none focus:border-red-400"
              >
                <option value="Active" className="bg-app-bg text-title">Active / Running</option>
                <option value="Hit Target" className="bg-app-bg text-title">Take Profit Hit (Target)</option>
                <option value="Stop Loss Hit" className="bg-app-bg text-title">Stop Loss Hit (Loss)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-red-500 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-red-600 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Publish Trade Setup</span>
          </button>
        </form>
      )}

      {/* Signals List Table */}
      <div className="glass-panel rounded-2xl border border-panel-border bg-panel-bg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-panel-border bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold text-desc uppercase tracking-widest">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Pair</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Entry</th>
              <th className="px-6 py-4">Target / Stop</th>
              <th className="px-6 py-4">Required Tier</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border">
            {signals.map((sig) => (
              <tr key={sig.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-semibold font-mono text-desc">{sig.timestamp}</td>
                <td className="px-6 py-4 font-bold text-title">{sig.pair}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    sig.type === "BUY" ? "bg-green-500/10 text-green-accent" : "bg-red-500/10 text-red-400"
                  }`}>
                    {sig.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono">{sig.entry}</td>
                <td className="px-6 py-4 font-mono">
                  TP: <span className="text-green-accent">{sig.tp}</span> | SL: <span className="text-red-400">{sig.sl}</span>
                </td>
                <td className="px-6 py-4 font-semibold uppercase">{sig.tierRequired}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    sig.status === "Active"
                      ? "bg-gold text-black animate-pulse"
                      : sig.status === "Hit Target"
                        ? "bg-green-500/20 text-green-accent"
                        : "bg-red-500/20 text-red-400"
                  }`}>
                    {sig.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteSignal(sig.id)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete signal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
