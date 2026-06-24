"use client";

import React, { useState } from "react";
import { useAppState, User } from "@/context/AppStateContext";


// Mock student roster database
const INITIAL_STUDENT_ROSTER: User[] = [
  { uid: "usr-1", email: "vivek.patel@gmail.com", displayName: "Vivek Patel", role: "student", tier: "Pro", enrolledCourses: ["forex-mastery", "gold-strategy"] },
  { uid: "usr-2", email: "priyal.jain@gmail.com", displayName: "Priyal Jain", role: "student", tier: "Basic", enrolledCourses: ["forex-mastery"] },
  { uid: "usr-3", email: "sharma.amit@outlook.com", displayName: "Amit Sharma", role: "student", tier: "VIP", enrolledCourses: ["forex-mastery", "gold-strategy", "smart-money"] },
  { uid: "usr-4", email: "singh.pooja@gmail.com", displayName: "Pooja Singh", role: "student", tier: "Pro", enrolledCourses: ["forex-mastery", "risk-blueprint"] }
];

export default function ManageStudents() {
  const { user, upgradeUserTier } = useAppState();
  const [students, setStudents] = useState<User[]>(INITIAL_STUDENT_ROSTER);

  const handleTierChange = (uid: string, newTier: "Basic" | "Pro" | "VIP") => {
    // Update local roster
    setStudents((prev) => 
      prev.map((student) => 
        student.uid === uid ? { ...student, tier: newTier } : student
      )
    );

    // If upgrading current active session user, update active state context
    if (user && user.uid === uid) {
      upgradeUserTier(uid, newTier);
    }

    alert(`Student membership tier updated successfully to ${newTier}.`);
  };

  // Combine roster with currently logged-in user if not already present
  const allStudents = [...students];
  if (user && !allStudents.some(s => s.uid === user.uid)) {
    allStudents.push(user);
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Manage Academy Students</h1>
        <p className="text-xs text-desc mt-1">Review student profiles, enrollments, and adjust their subscription levels.</p>
      </div>

      {/* Students list table */}
      <div className="glass-panel rounded-2xl border border-panel-border bg-panel-bg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-panel-border bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold text-desc uppercase tracking-widest">
              <th className="px-6 py-4">UID</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Enrolled Courses</th>
              <th className="px-6 py-4">Active Tier</th>
              <th className="px-6 py-4 text-center">Modify Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border">
            {allStudents.map((stud) => (
              <tr key={stud.uid} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-500">{stud.uid}</td>
                <td className="px-6 py-4 font-bold text-title flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black flex items-center justify-center">
                    {stud.displayName.substring(0,2).toUpperCase()}
                  </div>
                  <span>{stud.displayName}</span>
                </td>
                <td className="px-6 py-4 font-mono text-desc">{stud.email}</td>
                <td className="px-6 py-4 font-semibold text-xs text-sec">
                  {stud.enrolledCourses.join(", ") || "None"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    stud.role === "admin"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : stud.tier === "VIP" 
                        ? "bg-gold/20 text-gold border border-gold/40 shadow-[0_0_10px_rgba(255,215,0,0.15)]"
                        : stud.tier === "Pro"
                          ? "bg-green-500/20 text-green-accent border border-green-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {stud.role === "admin" ? "ADMIN" : stud.tier}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {stud.role !== "admin" ? (
                    <select
                      value={stud.tier}
                      onChange={(e) => handleTierChange(stud.uid, e.target.value as "Basic" | "Pro" | "VIP")}
                      className="px-2 py-1 rounded bg-gray-50 dark:bg-white/5 border border-panel-border text-xs text-title focus:outline-none focus:border-red-400"
                    >
                      <option value="Basic" className="bg-app-bg text-title">Basic (Free)</option>
                      <option value="Pro" className="bg-app-bg text-title">Pro Tier</option>
                      <option value="VIP" className="bg-app-bg text-title">VIP Tier</option>
                    </select>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-semibold italic">System Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
