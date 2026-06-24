"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { Plus, Trash2 } from "lucide-react";

export default function ManageCourses() {
  const { courses, addCourse, deleteCourse } = useAppState();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures((prev) => [...prev, featureInput.trim()]);
    setFeatureInput("");
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !duration || !price || !image) {
      alert("Please fill in all core fields!");
      return;
    }

    const priceNum = parseInt(price);
    if (isNaN(priceNum)) return;

    addCourse({
      title,
      description,
      duration,
      price: priceNum,
      image,
      features: features.length > 0 ? features : ["Premium Mentorship", "Interactive Live Rooms"]
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setDuration("");
    setPrice("");
    setImage("");
    setFeatures([]);
    setShowAddForm(false);
    alert("New premium course added to TRADEIFYFX database.");
  };

  return (
    <div className="space-y-8">
      {/* Header bar controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Manage Academy Courses</h1>
          <p className="text-xs text-desc mt-1">Publish new course curriculums or delete inactive programs.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel Adding" : "Create Course"}</span>
        </button>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4 max-w-3xl">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3">New Program Schema</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Course Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Smart Money Concepts"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Duration Length</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="E.g., 8 Weeks"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Price (INR ₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="E.g., 5999"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Image Banner URL</label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo..."
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Curriculum Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief summary details..."
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400 resize-none"
            ></textarea>
          </div>

          {/* Features input checklist builder */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Syllabus Highlights / Features</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="E.g., Live weekly Zoom webinars"
                className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 rounded-lg bg-gray-100 border border-panel-border text-title hover:bg-gray-250 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold uppercase cursor-pointer transition-colors"
              >
                Add Bullet
              </button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {features.map((feat, index) => (
                  <span
                    key={index}
                    onClick={() => handleRemoveFeature(index)}
                    className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold cursor-pointer hover:bg-red-500/20 flex items-center gap-1.5"
                    title="Click to remove"
                  >
                    <span>{feat}</span>
                    <span>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-red-500 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
          >
            Add Course To Database
          </button>
        </form>
      )}

      {/* Courses List Table */}
      <div className="glass-panel rounded-2xl border border-panel-border bg-panel-bg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-panel-border bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold text-desc uppercase tracking-widest">
              <th className="px-6 py-4">Course Banner</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-10 rounded overflow-hidden border border-panel-border relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-title">{course.title}</td>
                <td className="px-6 py-4 font-semibold font-mono text-desc">{course.duration}</td>
                <td className="px-6 py-4 font-bold font-mono text-red-400">₹{course.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
