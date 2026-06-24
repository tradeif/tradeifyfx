"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight, BookOpen, Clock, Tag, Search } from "lucide-react";

export default function BlogList() {
  const { blogs } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Forex Analysis",
    "Gold Market Analysis",
    "Crypto Insights",
    "Trading Psychology",
    "Risk Management"
  ];

  // Filtering blogs based on category & search query
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      
      <main className="flex-1 bg-app-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>TRADEIFYFX Academy Blog</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-sans text-title">
              Market Analysis & <span className="text-gradient-gold">Trading Education</span>
            </h1>
            <p className="text-desc text-sm max-w-2xl mx-auto">
              Master the financial markets with professional weekly outlooks, Smart Money Concepts (SMC) deep dives, and psychology training templates.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 pb-6 border-b border-panel-border">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-3 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-gradient-gold text-black border-gold glow-gold font-black"
                      : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-sec hover:text-title hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-desc absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-title placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          {/* Grid list */}
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Link
                  href={`/blog/${blog.slug}`}
                  key={blog.id}
                  className="glass-panel border-panel-border rounded-2xl overflow-hidden bg-panel-bg flex flex-col h-full hover:border-gold/40 transition-all duration-300 group"
                >
                  {/* Image wrapper */}
                  <div className="h-48 w-full relative bg-gray-100 dark:bg-gray-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <span className="absolute bottom-4 left-4 px-2 py-0.5 rounded bg-gold text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{blog.category}</span>
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-desc font-semibold uppercase font-mono">
                        <span>{blog.author}</span>
                        <span>{blog.date}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-title group-hover:text-gold transition-colors leading-snug line-clamp-2">
                        {blog.title}
                      </h3>
                      
                      <p className="text-xs text-desc leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-panel-border mt-6 flex items-center justify-between text-[11px] font-bold uppercase">
                      <span className="text-gold flex items-center gap-1">
                        Read Article
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="text-desc flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {blog.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-panel-bg rounded-2xl border border-panel-border">
              <BookOpen className="w-12 h-12 text-desc mx-auto mb-3" />
              <h3 className="text-base font-bold text-title">No Articles Found</h3>
              <p className="text-xs text-desc mt-1">Try modifying your filter categories or search query term.</p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
