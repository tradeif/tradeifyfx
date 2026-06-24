"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AlertOctagon } from "lucide-react";

export default function RiskDisclaimer() {
  return (
    <>
      <Header />
      
      <main className="flex-1 bg-app-bg py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-accent/30 bg-red-accent/5 text-red-accent text-xs font-semibold uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Risk Warning</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-sans text-red-accent">
              Risk Disclaimer
            </h1>
            <p className="text-xs text-desc font-mono">
              Last Updated: June 19, 2026
            </p>
          </div>

          {/* Legal Content */}
          <div className="glass-panel p-8 sm:p-12 rounded-2xl border-red-accent/15 bg-panel-bg text-sec space-y-6 text-sm sm:text-base leading-relaxed text-justify">
            <p className="font-bold text-title">
              PLEASE READ THIS RISK DISCLAIMER CAREFULLY BEFORE ACCESSING OR UTILIZING THE SIGNAL FEED OR CURRICULUM ON THIS PLATFORM.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">1. Financial Trading High Volatility Risk</h3>
            <p>
              Trading Foreign Exchange (Forex), precious metals (Gold / XAUUSD), Commodities, Cryptocurrencies, and Contracts for Difference (CFDs) involves substantial risk of loss. It is highly speculative and may result in the loss of your entire account balance. Leverage acts as a double-edged sword; it can magnify losses as easily as it can magnify gains.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">2. Educational Purposes Only</h3>
            <p>
              All materials, lessons, technical charts, indicators, and trade signal ideas displayed on TRADEIFYFX are published for **educational purposes only**. None of our signals constitute absolute financial instructions. You are fully responsible for any real capital you deploy on broker accounts.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">3. Hypothetical & Simulated Results</h3>
            <p>
              Any simulated, historical, or hypothetical payouts or win rates shown on the website (e.g., student success stories) do not guarantee future success. Trade results vary. Market conditions change rapidly, and news events (like NFP, FOMC rate statements) can cause massive spreads and slippage on trades.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">4. No Investment Fiduciary Relationship</h3>
            <p>
              Kishan Sharma and the TRADEIFYFX team are educators, not licensed brokers or registered financial advisors. We do not handle retail funds or manage portfolios for clients.
            </p>

            <div className="pt-6 border-t border-panel-border mt-8 flex justify-center">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg bg-gradient-gold text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Return to Home
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
