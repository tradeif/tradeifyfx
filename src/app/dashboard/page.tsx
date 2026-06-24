"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { BookOpen, CheckSquare, Square, PlayCircle, Award, ArrowRight } from "lucide-react";

interface SyllabusModule {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

const DEFAULT_SYLLABUS: Record<string, SyllabusModule[]> = {
  "forex-mastery": [
    { id: "fm-1", title: "Introduction to Price Action Microstructures", duration: "45 mins", completed: true },
    { id: "fm-2", title: "Identifying Market Structural Trends & Swings", duration: "60 mins", completed: true },
    { id: "fm-3", title: "Institutional Order Blocks & Retest Entries", duration: "75 mins", completed: false },
    { id: "fm-4", title: "Confluence Analysis: High Win-Rate Checklists", duration: "90 mins", completed: false }
  ],
  "gold-strategy": [
    { id: "gs-1", title: "XAUUSD Gold Fundamental Drivers & Interest Rates", duration: "50 mins", completed: false },
    { id: "gs-2", title: "Liquidity Pools & London Breakout Sessions", duration: "65 mins", completed: false },
    { id: "gs-3", title: "Executing Price Action Sweeps on XAUUSD", duration: "80 mins", completed: false }
  ],
  "crypto-masterclass": [
    { id: "cm-1", title: "Crypto Cycles & Funding Rate Metrics", duration: "55 mins", completed: false },
    { id: "cm-2", title: "Leverage Size Management & Liquidation Zones", duration: "70 mins", completed: false }
  ],
  "smart-money": [
    { id: "sm-1", title: "Institutional Orderflow & FVG (Fair Value Gaps)", duration: "60 mins", completed: false },
    { id: "sm-2", title: "Order Blocks, Mitigation Blocks, and Breakers", duration: "80 mins", completed: false },
    { id: "sm-3", title: "Liquidity Runs: Buy Side vs Sell Side Sweeps", duration: "90 mins", completed: false }
  ],
  "risk-blueprint": [
    { id: "rb-1", title: "Trading Drawdowns Recovery Rules", duration: "40 mins", completed: false },
    { id: "rb-2", title: "Psychological Traps: Greed, Revenge & Fomo", duration: "50 mins", completed: false }
  ]
};

export default function MyCourses() {
  const { user, courses } = useAppState();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [syllabusState, setSyllabusState] = useState<Record<string, SyllabusModule[]>>(DEFAULT_SYLLABUS);

  if (!user) return null;

  // Filter courses enrolled by user
  const enrolledCourses = courses.filter((c) => user.enrolledCourses.includes(c.id));

  const handleToggleModule = (courseId: string, moduleId: string) => {
    setSyllabusState((prev) => {
      const updatedSyllabus = prev[courseId]?.map((mod) => 
        mod.id === moduleId ? { ...mod, completed: !mod.completed } : mod
      ) || [];
      return {
        ...prev,
        [courseId]: updatedSyllabus
      };
    });
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedSyllabus = selectedCourseId ? syllabusState[selectedCourseId] || [] : [];
  const completedCount = selectedSyllabus.filter((m) => m.completed).length;
  const progressPercent = selectedSyllabus.length > 0 ? Math.round((completedCount / selectedSyllabus.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gold/10 via-panel-bg to-panel-bg p-6 rounded-2xl border border-panel-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-title">Academy Learning Portal</h1>
          <p className="text-xs text-desc mt-1">Select an active course, view lessons, and track completion progress.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-sec">
          Enrolled: <span className="text-gold font-black">{enrolledCourses.length} Courses</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Enrolled Courses Grid list */}
        <div className={selectedCourseId ? "lg:col-span-6 space-y-4" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => {
              const isActive = selectedCourseId === course.id;
              const syllabus = syllabusState[course.id] || [];
              const completed = syllabus.filter((m) => m.completed).length;
              const progress = syllabus.length > 0 ? Math.round((completed / syllabus.length) * 100) : 0;

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(isActive ? null : course.id)}
                  className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isActive 
                      ? "border-gold bg-panel-bg glow-gold scale-[1.02]" 
                      : "border-panel-border bg-panel-bg hover:border-panel-hover-border"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-gold/15 text-gold text-[9px] font-black uppercase">
                        Active Course
                      </span>
                      <span className="text-[10px] text-desc font-mono font-bold uppercase">{course.duration}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-title">{course.title}</h3>
                    <p className="text-xs text-desc leading-relaxed line-clamp-2">{course.description}</p>
                  </div>

                  {/* Progress bar info */}
                  <div className="pt-4 mt-4 border-t border-panel-border space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-desc font-bold font-mono uppercase">
                      <span>Curriculum Status</span>
                      <span className="text-gold">{progress}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-150 dark:bg-white/5 overflow-hidden">
                      <div className="h-full bg-gradient-gold transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="lg:col-span-12 text-center py-20 bg-panel-bg rounded-2xl border border-panel-border space-y-4">
              <BookOpen className="w-12 h-12 text-desc mx-auto" />
              <h3 className="text-base font-bold text-title">No Enrolled Courses Found</h3>
              <p className="text-xs text-desc max-w-sm mx-auto">
                Unlock curriculum modules by selecting and buying courses on the public homepage.
              </p>
              <Link
                href="/#courses"
                className="inline-flex items-center gap-1 text-xs font-black text-gold uppercase tracking-wider hover:underline"
              >
                <span>Browse Academy Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Selected Course details syllabus modules */}
        {selectedCourseId && selectedCourse && (
          <div className="lg:col-span-6 glass-panel border border-gold/20 p-6 rounded-2xl bg-panel-bg space-y-6 glow-gold">
            <div className="flex items-start justify-between border-b border-panel-border pb-4">
              <div>
                <h3 className="text-lg font-black text-title">{selectedCourse.title}</h3>
                <span className="text-[10px] text-desc uppercase tracking-wider font-bold">Curriculum modules tracker</span>
              </div>
              <button
                onClick={() => setSelectedCourseId(null)}
                className="px-2.5 py-1 rounded bg-gray-100 border border-gray-200 dark:bg-white/5 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-[10px] text-desc hover:text-title uppercase font-bold"
              >
                Close Panel
              </button>
            </div>

            {/* Course Progress status overview */}
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-panel-border flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-desc font-bold uppercase block">Progress Stats</span>
                <span className="text-sm font-black text-title">{completedCount} of {selectedSyllabus.length} Lessons Finished</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold flex items-center justify-center font-mono text-xs font-black text-gold">
                {progressPercent}%
              </div>
            </div>

            {/* Syllabus Modules List */}
            <div className="space-y-3">
              {selectedSyllabus.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => handleToggleModule(selectedCourse.id, mod.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    mod.completed
                      ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-sec"
                      : "border-panel-border bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-title"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-gold focus:outline-none">
                      {mod.completed ? (
                        <CheckSquare className="w-5 h-5 text-green-accent" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold">{mod.title}</h4>
                      <span className="text-[9px] text-desc font-mono font-semibold">{mod.duration} • Video Lesson</span>
                    </div>
                  </div>
                  <PlayCircle className={`w-5 h-5 ${mod.completed ? "text-green-accent/60" : "text-gold"}`} />
                </div>
              ))}
            </div>

            {/* Final Certificate Reward Box */}
            {progressPercent === 100 && (
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 flex items-center gap-3">
                <Award className="w-8 h-8 text-gold flex-shrink-0 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-title uppercase">Congratulations!</h4>
                  <p className="text-[10px] text-desc">You have completed all curriculum modules. Your certificate of completion has been generated!</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
