"use client";

import React from "react";
import { Download, FileText, BarChart2, Settings } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "PDF" | "XLS" | "Template";
  size: string;
}

const RESOURCES_LIST: Resource[] = [
  {
    id: "res-1",
    title: "Smart Money Concepts (SMC) Core Cheat Sheet",
    description: "Visual quick reference guide for Order Blocks, mitigation zones, fair value gaps, and liquidity sweeps.",
    type: "PDF",
    size: "4.8 MB"
  },
  {
    id: "res-2",
    title: "Dynamic Position Sizing & Risk Ledger",
    description: "Interactive Excel spreadsheet to calculate lot sizes automatically based on stop loss pips and account capital.",
    type: "XLS",
    size: "1.2 MB"
  },
  {
    id: "res-3",
    title: "Kishan's Custom TradingView Layout Config",
    description: "TXT document containing code parameters and theme colors to copy and import into your TradingView charts.",
    type: "Template",
    size: "24 KB"
  },
  {
    id: "res-4",
    title: "TRADEIFYFX Drawdown Recovery Workbook",
    description: "Mental resilience worksheets and step-by-step checklist plans to recover accounts from negative drawdowns.",
    type: "PDF",
    size: "2.5 MB"
  }
];

export default function Resources() {
  const handleDownload = (title: string) => {
    alert(`[TRADEIFYFX DOWNLOAD MANAGER]\n\nStarting download: ${title}\nFile saved successfully to downloads directory.`);
  };

  return (
    <div className="space-y-8">
      {/* Intro info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gold/10 via-panel-bg to-panel-bg p-6 rounded-2xl border border-panel-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Student Resources & Tools</h1>
          <p className="text-xs text-desc mt-1">Download templates, spreadsheets, and confluences checksheets to accelerate your study.</p>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RESOURCES_LIST.map((res) => {
          return (
            <div
              key={res.id}
              className="glass-panel p-6 rounded-2xl border border-panel-border bg-panel-bg hover:border-panel-border transition-colors flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                  {res.type === "PDF" && <FileText className="w-6 h-6" />}
                  {res.type === "XLS" && <BarChart2 className="w-6 h-6" />}
                  {res.type === "Template" && <Settings className="w-6 h-6" />}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      res.type === "PDF" 
                        ? "bg-red-500/20 text-red-400"
                        : res.type === "XLS"
                          ? "bg-green-500/20 text-green-accent"
                          : "bg-gold/20 text-gold"
                    }`}>
                      {res.type}
                    </span>
                    <span className="text-[10px] text-desc font-mono font-semibold">{res.size}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-title leading-snug">{res.title}</h3>
                  <p className="text-xs text-desc leading-relaxed">{res.description}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-panel-border mt-6">
                <button
                  onClick={() => handleDownload(res.title)}
                  className="w-full py-2.5 rounded-lg bg-gray-100 hover:bg-gray-250 dark:bg-white/5 dark:hover:bg-white/10 border border-panel-border text-title font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resource</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
