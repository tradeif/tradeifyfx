"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Scale } from "lucide-react";

export default function TermsOfService() {
  return (
    <>
      <Header />
      
      <main className="flex-1 bg-app-bg py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Document</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-sans text-gradient-gold">
              Terms of Service
            </h1>
            <p className="text-xs text-desc font-mono">
              Last Updated: June 19, 2026
            </p>
          </div>

          {/* Legal Content */}
          <div className="glass-panel p-8 sm:p-12 rounded-2xl border-panel-border bg-panel-bg text-sec space-y-6 text-sm sm:text-base leading-relaxed text-justify">
            <p>
              Welcome to <strong>TRADEIFYFX</strong>. By accessing or using our website, courses, tools, or member signals, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">1. Educational Services Only</h3>
            <p>
              All materials, courses, indicators, videos, and trading signals provided by TRADEIFYFX are for <strong>educational and informational purposes only</strong>. We do not provide personalized financial, investment, tax, or legal advice. Trading financial instruments carries high risk and should only be undertaken with capital you can afford to lose.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">2. Account Registration & Security</h3>
            <p>
              When you create an account on our platform, you are responsible for maintaining the confidentiality of your login credentials and simulating checkout operations. You agree to notify us immediately of any unauthorized account activity.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">3. Member Conduct & Intellectual Property</h3>
            <p>
              All content on TRADEIFYFX, including curriculum designs, Smart Money Concepts (SMC) study guides, custom TradingView configurations, and signals, is the intellectual property of TRADEIFYFX. Sharing, distributing, or reselling our premium materials, signal feeds, or course files without written permission is strictly prohibited.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">4. Simulated Checkout & Payment Policies</h3>
            <p>
              All premium program upgrades are structured as recurring or one-time licensing fees for digital access. Refunds are handled in accordance with our refund schedule. Simulated checkouts are used to verify database role upgrades.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">5. Limitation of Liability</h3>
            <p>
              TRADEIFYFX, its founder Kishan Sharma, and its coaching team shall not be held liable for any direct, indirect, or consequential financial losses incurred from executing trade signals, studying our price action templates, or utilizing our indicators. Past performance is not indicative of future results.
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
