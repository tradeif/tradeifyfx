"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { BookMarked, TrendingUp, TrendingDown, Trash2, Plus, Percent, DollarSign } from "lucide-react";

export default function TradingJournal() {
  const { journal, addJournalEntry, deleteJournalEntry } = useAppState();

  // Local Form state
  const [pair, setPair] = useState("");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [pnl, setPnl] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Stats calculations
  const totalTrades = journal.length;
  const winTrades = journal.filter((t) => t.status === "WIN").length;
  const lossTrades = journal.filter((t) => t.status === "LOSS").length;
  
  const winRate = totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 0;
  
  const totalPnL = journal.reduce((sum, item) => sum + item.pnl, 0);

  const avgWin = winTrades > 0 
    ? Math.round(journal.filter(t => t.status === "WIN").reduce((sum, t) => sum + t.pnl, 0) / winTrades) 
    : 0;

  const avgLoss = lossTrades > 0 
    ? Math.round(journal.filter(t => t.status === "LOSS").reduce((sum, t) => sum + t.pnl, 0) / lossTrades) 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entryPrice || !exitPrice || !pnl) return;

    const entryNum = parseFloat(entryPrice);
    const exitNum = parseFloat(exitPrice);
    const pnlNum = parseFloat(pnl);

    addJournalEntry({
      pair: pair.toUpperCase(),
      type,
      entryPrice: entryNum,
      exitPrice: exitNum,
      pnl: pnlNum,
      status: pnlNum >= 0 ? "WIN" : "LOSS",
      notes
    });

    // Reset Form
    setPair("");
    setType("BUY");
    setEntryPrice("");
    setExitPrice("");
    setPnl("");
    setNotes("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Overview statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total trades */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Trades</span>
            <BookMarked className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-black text-title font-mono">{totalTrades}</div>
          <span className="text-[9px] text-desc font-semibold font-mono">Win: {winTrades} | Loss: {lossTrades}</span>
        </div>

        {/* Win Rate */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Win Rate</span>
            <Percent className="w-4 h-4 text-green-accent" />
          </div>
          <div className="text-2xl font-black text-green-accent font-mono">{winRate}%</div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-green-accent" style={{ width: `${winRate}%` }} />
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net PnL</span>
            {totalPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-accent" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-accent" />
            )}
          </div>
          <div className={`text-2xl font-black font-mono ${totalPnL >= 0 ? "text-green-accent" : "text-red-400"}`}>
            {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString()}
          </div>
          <span className="text-[9px] text-desc font-semibold font-mono">Total Capital Return</span>
        </div>

        {/* Risk Metrics */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Win/Loss</span>
            <DollarSign className="w-4 h-4 text-gold" />
          </div>
          <div className="text-base font-black text-title font-mono">
            W: <span className="text-green-accent">₹{avgWin}</span> | L: <span className="text-red-400">₹{Math.abs(avgLoss)}</span>
          </div>
          <span className="text-[9px] text-desc font-semibold font-mono">Expectancy Ratio</span>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-gradient-gold uppercase tracking-wider">Trade Journal Entries</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-lg bg-gradient-gold text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:opacity-90 transition-opacity cursor-pointer glow-gold"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel Entry" : "Log Trade"}</span>
        </button>
      </div>

      {/* Add Entry Form drawer */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3">New Trade Logs</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Asset Pair</label>
              <input
                type="text"
                required
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="XAUUSD"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Position Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "BUY" | "SELL")}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title focus:outline-none focus:border-gold"
              >
                <option value="BUY" className="bg-app-bg text-title">BUY</option>
                <option value="SELL" className="bg-app-bg text-title">SELL</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                required
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="2310.50"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Exit Price</label>
              <input
                type="number"
                step="any"
                required
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="2320.00"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">PnL (₹ Amount)</label>
              <input
                type="number"
                required
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                placeholder="E.g., 1500 or -500"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Trade Notes & Setup Reasons</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Liquidity sweep on H4. MSS confirmed entry..."
              className="w-full px-3 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-gold text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity cursor-pointer glow-gold"
          >
            Add Log To Journal
          </button>
        </form>
      )}

      {/* Ledger Table */}
      <div className="glass-panel rounded-2xl border border-panel-border bg-panel-bg overflow-hidden">
        {journal.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-panel-border bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold text-desc uppercase tracking-widest">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Pair</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Entry</th>
                  <th className="px-6 py-4">Exit</th>
                  <th className="px-6 py-4">PnL</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-border">
                {journal.map((item) => (
                  <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold font-mono text-desc">{item.date}</td>
                    <td className="px-6 py-4 font-bold text-title">{item.pair}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        item.type === "BUY" ? "bg-green-500/10 text-green-accent" : "bg-red-500/10 text-red-400"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{item.entryPrice}</td>
                    <td className="px-6 py-4 font-mono">{item.exitPrice}</td>
                    <td className={`px-6 py-4 font-bold font-mono ${item.pnl >= 0 ? "text-green-accent" : "text-red-400"}`}>
                      {item.pnl >= 0 ? "+" : ""}₹{item.pnl.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        item.status === "WIN" 
                          ? "bg-green-500/20 text-green-accent border border-green-500/30" 
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-desc truncate max-w-xs">{item.notes}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteJournalEntry(item.id)}
                        className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 space-y-2">
            <BookMarked className="w-12 h-12 text-desc mx-auto" />
            <h3 className="text-base font-bold text-title">Journal is Empty</h3>
            <p className="text-xs text-desc">Start logging your trades today to identify your high win-rate confluences.</p>
          </div>
        )}
      </div>
    </div>
  );
}
