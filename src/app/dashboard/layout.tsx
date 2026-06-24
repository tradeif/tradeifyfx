"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { 
  BookOpen, 
  Video, 
  Zap, 
  BookMarked, 
  FileText, 
  Settings, 
  LogOut, 
  Shield, 
  Home, 
  Menu, 
  X
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, login, logout, register } = useAppState();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Local Auth Gate inputs
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const sidebarLinks = [
    { name: "My Courses", href: "/dashboard", icon: BookOpen },
    { name: "Live Sessions", href: "/dashboard/live", icon: Video },
    { name: "Trading Signals", href: "/dashboard/signals", icon: Zap },
    { name: "Trading Journal", href: "/dashboard/journal", icon: BookMarked },
    { name: "Resources", href: "/dashboard/resources", icon: FileText },
    { name: "Profile Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Auth gate submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (isRegisterMode) {
      if (!name) return;
      register(name, email);
    } else {
      login(email);
    }
  };

  // If user is not logged in, show Auth Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing shapes */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 glass-panel border border-panel-border p-8 rounded-2xl shadow-2xl relative z-10 bg-panel-bg">
          <div className="text-center">
            <Link href="/" className="text-2xl font-black text-gradient-gold tracking-widest uppercase">
              TRADEIFYFX
            </Link>
            <h2 className="mt-6 text-xl sm:text-2xl font-extrabold text-title">
              {isRegisterMode ? "Create Your Trading Account" : "Access Member Dashboard"}
            </h2>
            <p className="mt-2 text-xs text-desc">
              {isRegisterMode 
                ? "Gain instant access to SMC guides and journal tools" 
                : "Enter email to view your courses, live signals, and logs"}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-8 space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kishan Sharma"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold text-xs sm:text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@gmail.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-gradient-gold text-black font-extrabold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all glow-gold cursor-pointer"
            >
              {isRegisterMode ? "Create Free Account" : "Access Dashboard"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-gold/80 hover:text-gold hover:underline transition-colors"
            >
              {isRegisterMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up Free"}
            </button>
            <div className="pt-2 border-t border-panel-border">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-desc hover:text-title transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex flex-col md:flex-row text-app-fg">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-app-bg border-b border-panel-border sticky top-0 z-30">
        <span className="text-xl font-black text-gradient-gold tracking-widest">
          TRADEIFYFX
        </span>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-desc hover:text-title hover:bg-black/5 dark:hover:bg-white/5"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-app-bg border-r border-panel-border transform transition-transform duration-300 md:translate-x-0 md:static flex flex-col justify-between p-6 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-2xl font-black text-gradient-gold tracking-wider font-sans">
              TRADEIFYFX
            </span>
          </div>

          {/* User profile capsule info */}
          <div className="p-3.5 bg-gray-50 dark:bg-white/5 border border-panel-border rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center font-bold text-gold text-sm border border-gold/20 flex-shrink-0">
              {user.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-title truncate leading-none mb-1">
                {user.displayName}
              </h4>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                user.role === "admin" 
                  ? "bg-red-500/20 text-red-400"
                  : user.tier === "VIP" 
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : user.tier === "Pro"
                      ? "bg-green-500/20 text-green-accent"
                      : "bg-blue-500/20 text-blue-400"
              }`}>
                {user.role === "admin" ? "ADMIN" : user.tier}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-gold text-black glow-gold"
                      : "text-sec hover:text-title hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2.5 pt-6 border-t border-panel-border">
          {user.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Admin Panel</span>
            </Link>
          )}

          <Link
            href="/"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-sec hover:text-title hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>Public Home</span>
          </Link>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-sec hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-app-bg md:h-screen md:overflow-y-auto">
        {/* Desktop Header bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-panel-border bg-panel-bg backdrop-blur-md">
          <h2 className="text-sm font-bold text-desc uppercase tracking-widest">
            {sidebarLinks.find((l) => l.href === pathname)?.name || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-desc font-semibold">Active Desk: GMT+5:30</span>
            <div className="h-4 w-px bg-panel-border" />
            <a
              href="tel:+919799450432"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-[10px] font-bold tracking-wider hover:bg-gold/15"
            >
              <Zap className="w-3 h-3 animate-pulse" />
              <span>SUPPORT</span>
            </a>
          </div>
        </header>

        {/* Content view injection */}
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
