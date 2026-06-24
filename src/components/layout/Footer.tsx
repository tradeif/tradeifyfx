"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-app-bg border-t border-panel-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <span className="text-2xl font-black text-gradient-gold tracking-wider">
              TRADEIFYFX
            </span>
            <p className="text-sm text-sec font-medium">
              &quot;Trade Smart. Trade Consistently. TradeifyFX.&quot;
            </p>
            <p className="text-xs text-desc leading-relaxed">
              We empower retail traders with institutional price action strategies, Smart Money Concepts (SMC), and professional gold, crypto, and forex mentorship.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-sec hover:text-title transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="text-sm text-sec hover:text-title transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/#live" className="text-sm text-sec hover:text-title transition-colors">
                  Live Trading Room
                </Link>
              </li>
              <li>
                <Link href="/#membership" className="text-sm text-sec hover:text-title transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-sec hover:text-title transition-colors">
                  Market Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Communities */}
          <div>
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4">
              Join Communities
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/919799450432"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-sec hover:text-green-accent transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Community</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/tradeifyfx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-sec hover:text-blue-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram Channel</span>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@tradeifyfx1?si=aZ7QlJ6rMFPlmB3f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-sec hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.002 3.002 0 0 0 .503 6.163C0 8.03 0 12 0 12s0 3.97.503 5.837a3.002 3.002 0 0 0 2.11 2.107C4.482 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.005 3.005 0 0 0 2.11-2.107C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube Channel</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/tradeifyfx?igsh=emIzc2Ryem5mZ3gz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-sec hover:text-pink-500 transition-colors"
                >
                  <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  <span>Instagram Profile</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support Contacts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4">
              Contact Info
            </h3>
            <a
              href="tel:+919799450432"
              className="flex items-center gap-2.5 text-sm text-sec hover:text-title transition-colors"
            >
              <Phone className="w-4 h-4 text-gold" />
              <span>+91 9799450432</span>
            </a>
            <a
              href="mailto:support@tradeifyfx.com"
              className="flex items-center gap-2.5 text-sm text-sec hover:text-title transition-colors"
            >
              <Mail className="w-4 h-4 text-gold" />
              <span>support@tradeifyfx.com</span>
            </a>
            <div className="flex items-start gap-2.5 text-sm text-sec">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <span>Jaipur, Rajasthan, India</span>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="border-t border-panel-border pt-8 pb-4">
          <p className="text-[10px] text-desc leading-relaxed text-justify mb-6">
            <strong>RISK WARNING:</strong> Trading Foreign Exchange (Forex), Gold (XAUUSD), Cryptocurrencies, and CFDs carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose. All content, trade signals, analysis, and materials published by TRADEIFYFX are for educational purposes only and do not constitute financial advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-desc">
            <span>© {currentYear} TRADEIFYFX. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:underline hover:text-title">Terms of Service</Link>
              <Link href="/privacy" className="hover:underline hover:text-title">Privacy Policy</Link>
              <Link href="/disclaimer" className="hover:underline hover:text-title">Risk Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
