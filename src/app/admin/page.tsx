"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { BarChart, BookOpen, Radio, Users, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function AdminOverview() {
  const { courses, signals, messages } = useAppState();
  const [repliedMessages, setRepliedMessages] = useState<string[]>([]);

  const handleMarkAsReplied = (id: string) => {
    setRepliedMessages((prev) => [...prev, id]);
    alert("Query marked as resolved. Confirmation notification simulated.");
  };

  // Mock Admin Dashboard Analytics counters
  const totalStudents = 1420; // Simulated database count
  const activeSignals = signals.filter((s) => s.status === "Active").length;
  const totalCourses = courses.length;
  const mockRevenue = courses.reduce((sum, c) => sum + (c.price * 8), 0); // Simulated calculations

  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-red-500/10 via-panel-bg to-panel-bg p-6 rounded-2xl border border-red-500/20">
        <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Admin Control Dashboard</h1>
        <p className="text-xs text-desc mt-1">Monitor enrollment analytics, manage signals, publish announcements, and resolve student support tickets.</p>
      </div>

      {/* Grid of Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Enrolled Students Counter */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-title font-mono">{totalStudents}</div>
          <span className="text-[9px] text-green-accent font-semibold font-mono">+12% new this week</span>
        </div>

        {/* Active Signals counter */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Signals</span>
            <Radio className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-title font-mono">{activeSignals}</div>
          <span className="text-[9px] text-desc font-semibold font-mono">Out of {signals.length} total signals</span>
        </div>

        {/* Premium Courses Counter */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Courses</span>
            <BookOpen className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-title font-mono">{totalCourses}</div>
          <span className="text-[9px] text-desc font-semibold font-mono">Mentorship curriculum</span>
        </div>

        {/* Estimated Revenue generated */}
        <div className="glass-panel p-5 rounded-2xl bg-panel-bg border-panel-border space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales (Est)</span>
            <BarChart className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">₹{mockRevenue.toLocaleString()}</div>
          <span className="text-[9px] text-desc font-semibold font-mono">From all premium checkouts</span>
        </div>

      </div>

      {/* Support Queries Inbox */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>Support & Leads Inbox ({messages.length})</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isReplied = repliedMessages.includes(msg.id);
              return (
                <div
                  key={msg.id}
                  className={`glass-panel p-6 rounded-2xl border transition-colors flex flex-col md:flex-row justify-between md:items-center gap-6 ${
                    isReplied 
                      ? "border-panel-border bg-panel-bg/50 opacity-60" 
                      : "border-red-500/20 bg-panel-bg"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-sm font-bold text-title">{msg.name}</h4>
                      <span className="text-[9px] text-desc font-mono font-semibold uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {msg.timestamp}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-desc">
                      <span>Phone: <a href={`tel:${msg.phone}`} className="text-gold hover:underline">{msg.phone}</a></span>
                      <span className="hidden sm:inline opacity-20">•</span>
                      <span>Email: <a href={`mailto:${msg.email}`} className="text-gold hover:underline">{msg.email}</a></span>
                    </div>

                    <p className="text-xs text-sec bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-panel-border leading-relaxed">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2.5 justify-end">
                    {!isReplied ? (
                      <button
                        onClick={() => handleMarkAsReplied(msg.id)}
                        className="px-4 py-2 rounded bg-gradient-gold text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer glow-gold"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve Ticket</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded bg-green-500/10 text-green-accent text-[9px] font-black uppercase text-center border border-green-500/20">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-panel-bg rounded-2xl border border-panel-border">
              <MessageSquare className="w-12 h-12 text-desc mx-auto mb-3" />
              <h3 className="text-sm font-bold text-title">No Messages In Inbox</h3>
              <p className="text-xs text-desc">Contact form submissions from the homepage will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
