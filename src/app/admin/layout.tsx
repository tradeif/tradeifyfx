"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { 
  ShieldAlert, 
  BarChart, 
  BookOpen, 
  Radio, 
  Users, 
  PenTool, 
  LogOut, 
  Home, 
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, login, logout } = useAppState();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const adminLinks = [
    { name: "Analytics Overview", href: "/admin", icon: BarChart },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Publish Signals", href: "/admin/signals", icon: Radio },
    { name: "Manage Students", href: "/admin/students", icon: Users },
    { name: "Publish Blogs", href: "/admin/blogs", icon: PenTool },
  ];

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;
    login(adminEmail, "admin");
    setAdminEmail("");
  };

  // Enforce ADMIN role protection
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-app-bg text-app-fg flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing alerts */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md space-y-6 glass-panel border border-red-500/20 p-8 rounded-2xl shadow-2xl relative z-10 bg-panel-bg text-center">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-black text-title uppercase tracking-wider">Access Denied</h2>
          <p className="text-xs text-desc">
            This dashboard is restricted to TRADEIFYFX administrators. Please log in with admin credentials to proceed.
          </p>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 pt-4 border-t border-panel-border">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc text-left mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@tradeifyfx.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400 text-xs sm:text-sm"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-red-500 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
            >
              Authenticate Admin
            </button>
          </form>

          <div className="pt-4 border-t border-panel-border flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="text-xs text-gold hover:underline font-semibold"
            >
              Go to Student Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-desc hover:text-title transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex flex-col md:flex-row text-app-fg">
      {/* Mobile admin header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-panel-bg border-b border-red-500/20 sticky top-0 z-30">
        <span className="text-xl font-black text-red-400 tracking-widest">
          TFX ADMIN
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-desc hover:text-title hover:bg-black/5 dark:hover:bg-white/5"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-panel-bg border-r border-panel-border md:border-red-500/10 transform transition-transform duration-300 md:translate-x-0 md:static flex flex-col justify-between p-6 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          <div>
            <span className="text-2xl font-black text-red-400 tracking-wider">
              TFX CONTROL
            </span>
            <span className="block text-[9px] text-desc font-bold uppercase tracking-widest mt-0.5">Admin Management</span>
          </div>

          <nav className="space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      : "text-desc hover:text-title hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2.5 pt-6 border-t border-panel-border">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/10 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Student Board</span>
          </Link>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-desc hover:text-title hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>Public Home</span>
          </Link>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-desc hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-app-bg md:h-screen md:overflow-y-auto">
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-panel-border md:border-red-500/10 bg-panel-bg backdrop-blur-md">
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">
            {adminLinks.find((l) => l.href === pathname)?.name || "Control Center"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] text-desc font-bold uppercase tracking-wider">ROOT SECURE MODE</span>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
