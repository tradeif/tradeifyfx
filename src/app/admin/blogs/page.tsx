"use client";

import React, { useState } from "react";
import { useAppState, Blog } from "@/context/AppStateContext";
import { Plus, Trash2, PenTool } from "lucide-react";

export default function PublishBlogs() {
  const { blogs, addBlog, deleteBlog } = useAppState();

  // Form states
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"Forex Analysis" | "Gold Market Analysis" | "Crypto Insights" | "Trading Psychology" | "Risk Management">("Forex Analysis");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("Founder, TRADEIFYFX");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !content || !image || !author) {
      alert("Please fill in all core fields!");
      return;
    }

    addBlog({
      title,
      excerpt,
      content,
      category,
      image,
      author
    });

    // Reset Form
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("Forex Analysis");
    setImage("");
    setAuthor("Founder, TRADEIFYFX");
    setShowAddForm(false);
    alert("New educational article published on TRADEIFYFX blog feed.");
  };

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-title font-sans">Publish Market Analysis</h1>
          <p className="text-xs text-desc mt-1">Publish new market newsletters, SMC study articles, or delete entries.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel Adding" : "Write Article"}</span>
        </button>
      </div>

      {/* Add Blog Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-4 max-w-3xl">
          <h3 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3">New Article details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Article Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Gold Strategy pivots watch"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Author Name</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Founder, TRADEIFYFX"
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Category Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Blog["category"])}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title focus:outline-none focus:border-red-400"
              >
                <option value="Forex Analysis" className="bg-app-bg text-title">Forex Analysis</option>
                <option value="Gold Market Analysis" className="bg-app-bg text-title">Gold Market Analysis</option>
                <option value="Crypto Insights" className="bg-app-bg text-title">Crypto Insights</option>
                <option value="Trading Psychology" className="bg-app-bg text-title">Trading Psychology</option>
                <option value="Risk Management" className="bg-app-bg text-title">Risk Management</option>
              </select>
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
            <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Short Excerpt (Summary)</label>
            <input
              type="text"
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short 1-2 sentence description summarizing the insights..."
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-desc mb-1">Full Article Content</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full educational contents..."
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-red-500 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-red-600 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PenTool className="w-4 h-4" />
            <span>Publish Article Feed</span>
          </button>
        </form>
      )}

      {/* Blogs List Table */}
      <div className="glass-panel rounded-2xl border border-panel-border bg-panel-bg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-panel-border bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold text-desc uppercase tracking-widest">
              <th className="px-6 py-4">Image Banner</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-10 rounded overflow-hidden border border-panel-border relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-title max-w-xs truncate">{blog.title}</td>
                <td className="px-6 py-4 font-semibold text-desc">{blog.category}</td>
                <td className="px-6 py-4 font-semibold text-desc">{blog.author}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteBlog(blog.id)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete blog"
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
