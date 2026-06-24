"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { useFirebaseAuth } from "@/lib/firebaseAuth";
import { 
  Menu, X, LogOut, Shield, Compass, Sun, Moon, Phone, 
  Lock, Eye, EyeOff, Mail, Loader2, AlertTriangle 
} from "lucide-react";

export default function Header() {
  const { user, logout, theme, toggleTheme } = useAppState();
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    resetPassword, 
    loading: authLoading, 
    error: authError, 
    clearError 
  } = useFirebaseAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">("login");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [localError, setLocalError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pathname = usePathname();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setLocalError("");
    clearError();
  };

  const resetFormFields = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
    setLocalError("");
    clearError();
    setResetSent(false);
    setShowPass(false);
    setShowConfirm(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    
    if (isAdminLogin) {
      if (!form.email || !form.password) {
        setLocalError("Please enter admin email and password.");
        return;
      }
      const ok = await signIn(form.email, form.password);
      if (ok) {
        setShowAuthModal(false);
        resetFormFields();
      }
      return;
    }

    if (authMode === "register") {
      if (!form.firstName || !form.lastName) {
        setLocalError("Please enter your first and last name.");
        return;
      }
      if (form.password.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirm) {
        setLocalError("Passwords do not match.");
        return;
      }
      const ok = await signUp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password
      });
      if (ok) {
        setShowAuthModal(false);
        resetFormFields();
      }
    } else if (authMode === "login") {
      if (!form.email || !form.password) {
        setLocalError("Please enter both email and password.");
        return;
      }
      const ok = await signIn(form.email, form.password);
      if (ok) {
        setShowAuthModal(false);
        resetFormFields();
      }
    } else {
      if (!form.email) {
        setLocalError("Please enter your email address.");
        return;
      }
      const ok = await resetPassword(form.email);
      if (ok) {
        setResetSent(true);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError("");
    clearError();
    const ok = await signInWithGoogle();
    if (ok) {
      setShowAuthModal(false);
      resetFormFields();
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/#courses" },
    { name: "Live Trading", href: "/#live" },
    { name: "Membership", href: "/#membership" },
    { name: "Stories", href: "/#stories" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/#contact" }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-panel-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-wider text-gradient-gold font-sans group-hover:scale-105 transition-transform duration-300">
                  TRADEIFYFX
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-1 lg:space-x-4 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href || (link.href.startsWith("/#") && pathname === "/")
                      ? "text-gold font-semibold"
                      : "text-sec hover:text-title hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs / Auth */}
            <div className="hidden md:flex items-center gap-4">
              {/* Phone CTA */}
              <a
                href="tel:+919799450432"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold hover:bg-gold/15 transition-all"
              >
                <Phone className="w-3 h-3" />
                <span>+91 9799450432</span>
              </a>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-sec hover:text-title transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-indigo-400" />}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  {/* Role/Tier Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.role === "admin" 
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : user.tier === "VIP" 
                        ? "bg-gold/20 text-gold border border-gold/40 shadow-[0_0_10px_rgba(255,215,0,0.15)]"
                        : user.tier === "Pro"
                          ? "bg-green-500/20 text-green-accent border border-green-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {user.role === "admin" ? "ADMIN" : `${user.tier}`}
                  </span>

                  {/* Dashboard link */}
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gold/40 text-sm font-semibold transition-all dark:hover:bg-white/10 text-title"
                  >
                    {user.role === "admin" ? <Shield className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                    <span>Dashboard</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-500 dark:text-gray-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      resetFormFields();
                      setIsAdminLogin(false);
                      setAuthMode("login");
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-sec hover:text-title transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      resetFormFields();
                      setIsAdminLogin(false);
                      setAuthMode("register");
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-gold text-black hover:opacity-90 transition-opacity font-medium glow-gold shadow-md"
                  >
                    Start Learning
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-sec"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-title hover:bg-black/5 dark:hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-panel-border px-2 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-sec hover:text-title hover:bg-black/5 dark:hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Auth Actions */}
            <div className="pt-4 pb-2 border-t border-panel-border px-4 space-y-3">
              {/* Phone Button */}
              <a
                href="tel:+919799450432"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gold/30 bg-gold/5 text-gold font-semibold text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>+91 9799450432</span>
              </a>

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-sec">Account Tier:</span>
                    <span className="text-sm font-bold text-gold uppercase">{user.role === "admin" ? "ADMIN" : user.tier}</span>
                  </div>
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-title font-semibold text-sm"
                  >
                    {user.role === "admin" ? <Shield className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      resetFormFields();
                      setIsAdminLogin(false);
                      setAuthMode("login");
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center text-sm font-semibold text-title"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      resetFormFields();
                      setIsAdminLogin(false);
                      setAuthMode("register");
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="py-2 px-4 rounded-lg bg-gradient-gold text-black text-center text-sm font-bold shadow-md"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel border border-panel-border p-8 rounded-2xl shadow-2xl bg-[#121212]">
            <button
              onClick={() => { setShowAuthModal(false); resetFormFields(); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-title transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gradient-gold font-sans tracking-wide">
                {isAdminLogin ? "ADMIN ACCESS" : authMode === "reset" ? "RESET PASSWORD" : "JOIN TRADEIFYFX"}
              </h2>
              <p className="text-xs text-desc mt-1">
                {isAdminLogin 
                  ? "Enter admin credentials to manage the platform" 
                  : authMode === "reset"
                    ? "Enter your email to receive a password reset link"
                    : "Start your journey to consistent trading profits"}
              </p>
            </div>

            {/* Switch Tabs (only for non-admin and non-reset modes) */}
            {!isAdminLogin && authMode !== "reset" && (
              <div className="flex border-b border-panel-border mb-6">
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => { setAuthMode("login"); clearError(); setLocalError(""); }}
                  className={`w-1/2 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                    authMode === "login" ? "border-gold text-gold" : "border-transparent text-desc hover:text-title"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => { setAuthMode("register"); clearError(); setLocalError(""); }}
                  className={`w-1/2 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                    authMode === "register" ? "border-gold text-gold" : "border-transparent text-desc hover:text-title"
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Error Message alert block */}
            {(localError || authError) && (
              <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold flex items-start gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{localError || authError}</span>
              </div>
            )}

            {resetSent && authMode === "reset" ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400 font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-title">Reset Link Sent!</h3>
                <p className="text-xs text-desc">We have sent a password reset link to your email address.</p>
                <button 
                  onClick={() => { setAuthMode("login"); setResetSent(false); }} 
                  className="px-4 py-2 bg-gradient-gold text-black rounded-lg text-xs font-bold shadow-md cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Registration Only Fields */}
                {!isAdminLogin && authMode === "register" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          disabled={authLoading}
                          value={form.firstName}
                          onChange={set("firstName")}
                          placeholder="First"
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-title placeholder-gray-500 focus:border-gold focus:outline-none transition-colors text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          disabled={authLoading}
                          value={form.lastName}
                          onChange={set("lastName")}
                          placeholder="Last"
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-title placeholder-gray-500 focus:border-gold focus:outline-none transition-colors text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        disabled={authLoading}
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="Phone Number (Optional)"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-title placeholder-gray-500 focus:border-gold focus:outline-none transition-colors text-xs"
                      />
                    </div>
                  </>
                )}

                {/* Email (Always Needed) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      disabled={authLoading}
                      value={form.email}
                      onChange={set("email")}
                      placeholder={isAdminLogin ? "admin@tradeifyfx.com" : "trader@gmail.com"}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-title placeholder-gray-500 focus:border-gold focus:outline-none transition-colors text-xs"
                    />
                  </div>
                </div>

                {/* Password (Needed for login, registration, and admin) */}
                {authMode !== "reset" && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          disabled={authLoading}
                          value={form.password}
                          onChange={set("password")}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/5 border border-white/10 text-title placeholder-gray-500 focus:border-gold focus:outline-none transition-colors text-xs"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          disabled={authLoading}
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-3.5 text-gray-500 hover:text-title transition-colors"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password (Registration Only) */}
                    {!isAdminLogin && authMode === "register" && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                          <input
                            type={showConfirm ? "text" : "password"}
                            required
                            disabled={authLoading}
                            value={form.confirm}
                            onChange={set("confirm")}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/5 border border-white/10 text-title placeholder-gray-500 focus:border-gold focus:outline-none transition-colors text-xs"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            disabled={authLoading}
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-3.5 text-gray-500 hover:text-title transition-colors"
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-lg bg-gradient-gold text-black font-bold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all glow-gold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isAdminLogin 
                      ? "Access Admin Panel" 
                      : authMode === "login" 
                        ? "Sign In to Account" 
                        : authMode === "register"
                          ? "Create Account"
                          : "Send Reset Link"}
                  </span>
                </button>
              </form>
            )}

            {/* Forgot password link */}
            {!isAdminLogin && authMode === "login" && (
              <div className="mt-3 text-right">
                <button
                  onClick={() => { setAuthMode("reset"); clearError(); setLocalError(""); }}
                  className="text-[10px] font-bold text-desc hover:text-gold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Back to Login link */}
            {!isAdminLogin && authMode === "reset" && !resetSent && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => { setAuthMode("login"); clearError(); setLocalError(""); }}
                  className="text-xs text-gold/80 hover:text-gold hover:underline transition-colors cursor-pointer font-bold"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}

            {/* Divider and Google Authentication (only in Login / Register modes) */}
            {!isAdminLogin && authMode !== "reset" && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-panel-border"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#121212] px-2.5 text-desc font-black tracking-widest">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 rounded-lg border border-panel-border bg-white/5 hover:bg-white/10 text-title font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.45 1.76 14.92 1 12 1 7.37 1 3.42 3.66 1.48 7.56l3.8 2.94C6.18 7.37 8.85 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.37-4.88 3.37-8.54z" />
                    <path fill="#FBBC05" d="M5.28 14.78a6.97 6.97 0 0 1 0-4.14L1.48 7.56A11.96 11.96 0 0 0 0 12c0 1.59.31 3.11.88 4.5l4.4-3.72z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.1.74-2.5 1.18-4.3 1.18-3.15 0-5.82-2.33-6.77-5.46L1.43 16.68C3.37 20.48 7.35 23 12 23z" />
                  </svg>
                  <span>Google Account</span>
                </button>
              </>
            )}

            <div className="mt-5 text-center border-t border-panel-border pt-4">
              <button
                disabled={authLoading}
                onClick={() => {
                  setIsAdminLogin(!isAdminLogin);
                  resetFormFields();
                  setAuthMode("login");
                }}
                className="text-[10px] font-bold text-gold/80 hover:text-gold hover:underline transition-colors uppercase tracking-wider cursor-pointer"
              >
                {isAdminLogin ? "Switch to Student Login" : "Are you an Admin? Access here"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
