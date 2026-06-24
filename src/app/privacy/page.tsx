"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      
      <main className="flex-1 bg-app-bg py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-sans text-gradient-gold">
              Privacy Policy
            </h1>
            <p className="text-xs text-desc font-mono">
              Last Updated: June 19, 2026
            </p>
          </div>

          {/* Legal Content */}
          <div className="glass-panel p-8 sm:p-12 rounded-2xl border-panel-border bg-panel-bg text-sec space-y-6 text-sm sm:text-base leading-relaxed text-justify">
            <p>
              At <strong>TRADEIFYFX</strong>, we respect your privacy and are committed to protecting the personal details you share with us. This Privacy Policy details how we collect, store, and utilize your account details.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">1. Data We Collect</h3>
            <p>
              We collect minimal personal parameters necessary to manage your student account. This includes your name, email address, password hash, and simulated checkout history. We also store local settings like display name modifications and theme preferences in your local browser storage.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">2. Support Query Data</h3>
            <p>
              When you submit a query via our home page Contact Form, we collect your name, mobile number, email, and description of your support needs. This data is transmitted to the admin control desk to facilitate client relationship callbacks.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">3. Local Browser Storage</h3>
            <p>
              Our application uses <code>localStorage</code> to store state variables (like active courses, logs, and theme state) to sync interfaces between updates without requiring heavy database roundtrips. You can clear this data at any time by clearing your browser cache.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">4. Third-Party Embeds & Services</h3>
            <p>
              We embed scripts and tools from trusted third parties like Razorpay (payment processing), Google Maps (office location), and TradingView (financial charts). These providers may track basic metadata like IP address or referrers. We do not sell or lease student emails to external marketing sites.
            </p>

            <h3 className="text-lg font-bold text-title pt-4">5. Security Rules</h3>
            <p>
              We implement industry-standard encryption practices to protect your emails and passwords. However, no electronic transmission over the internet can be guaranteed 100% secure. You are encouraged to maintain a unique password for your TRADEIFYFX access.
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
