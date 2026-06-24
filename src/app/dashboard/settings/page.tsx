"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/AppStateContext";
import { User, Key, Moon, Sun } from "lucide-react";

export default function ProfileSettings() {
  const { user, theme, toggleTheme } = useAppState();
  
  // Local settings form state
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(user.displayName);
    }
  }, [user]);

  if (!user) return null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) return;

    // Simulate save by updating state context
    const updatedUser = {
      ...user,
      displayName
    };
    // Sync storage
    localStorage.setItem("tfx_user", JSON.stringify(updatedUser));
    // Reload state context hook simulation by simply refreshing (or state is synced locally)
    alert("Profile display name updated successfully!");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    alert("Security settings updated! Password changed successfully.");
    setPassword("");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Overview */}
      <div className="bg-gradient-to-r from-gold/10 via-panel-bg to-panel-bg p-6 rounded-2xl border border-panel-border">
        <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Account & Profile Settings</h1>
        <p className="text-xs text-desc mt-1">Configure your personal credentials, view your active tier, and manage notification feeds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile details */}
        <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-gold" />
            <span>Profile Data</span>
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-muted-dark cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            {savedSuccess && (
              <p className="text-xs text-green-accent font-bold">
                ✓ Display name saved locally.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-gold text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Update Profile Name
            </button>
          </form>
        </div>

        {/* Security Details */}
        <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-gold" />
            <span>Security & Passwords</span>
          </h3>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 text-title font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Global theme controls */}
        <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4 col-span-1 md:col-span-2">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3 flex items-center gap-2">
            <Moon className="w-4 h-4 text-gold" />
            <span>App Interface Theme</span>
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-title">Theme Mode</h4>
              <p className="text-[10px] text-desc mt-0.5">Toggle between luxury dark mode or high-readability light mode.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2.5 rounded-lg border border-gray-250 dark:border-white/10 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-title flex items-center gap-2 cursor-pointer transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-gold" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
