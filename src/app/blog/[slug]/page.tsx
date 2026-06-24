"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Clock, User, Calendar, Tag, ShieldAlert } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetail({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const { blogs } = useAppState();

  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-app-bg py-24 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-4">
            <ShieldAlert className="w-16 h-16 text-red-accent mx-auto" />
            <h1 className="text-2xl font-black text-title">Article Not Found</h1>
            <p className="text-sm text-desc">
              The analysis article or educational post you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/blog"
              className="inline-block px-5 py-2.5 rounded-lg bg-gradient-gold text-black text-xs font-bold uppercase cursor-pointer shadow-md"
            >
              Back to Blog Feed
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Get some recent blogs for sidebar
  const recentBlogs = blogs.filter((b) => b.id !== blog.id).slice(0, 3);

  return (
    <>
      <Header />

      <main className="flex-1 bg-app-bg py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-desc hover:text-gold uppercase tracking-wider mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Blogs</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Main content body */}
            <article className="lg:col-span-8 space-y-6">
              
              {/* Category tag */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>{blog.category}</span>
              </span>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-title font-sans leading-tight">
                {blog.title}
              </h1>

              {/* Author & date details */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-desc border-y border-panel-border py-4 font-semibold uppercase font-mono">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gold" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span>{blog.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold" />
                  <span>{blog.readTime}</span>
                </div>
              </div>

              {/* Image banner */}
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-panel-border relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Excerpt */}
              <p className="text-lg text-sec font-semibold leading-relaxed border-l-2 border-gold pl-4 py-1 italic">
                {blog.excerpt}
              </p>

              {/* Main Content */}
              <div className="text-sec space-y-6 text-sm sm:text-base leading-relaxed text-justify">
                <p>{blog.content}</p>
                
                <h3 className="text-xl font-bold text-title pt-4">Technical Breakdown & Key Market Structuring</h3>
                <p>
                  When reviewing these price levels fundamental analysis plays a large role. In addition to daily charts, monitoring geopolitical news, central bank statements, and macroeconomic indicators is vital. Professional risk mitigation dictates that we look for confirmations on multiple timeframes (H4 structural pivot aligned with M15 market structure shift) before committing capital.
                </p>

                <h3 className="text-xl font-bold text-title pt-4">Risk Rules & Implementation</h3>
                <p>
                  Remember, even the highest probability SMC setup can fail. This is why position sizing is the core blueprint. Never risk more than 1% to 2% of your equity. If you are trading Gold (XAUUSD), be mindful of spreads and increased volatility during major data releases (like NFP or CPI) and adjust your targets accordingly.
                </p>
              </div>
            </article>

            {/* Sidebar pane */}
            <aside className="lg:col-span-4 space-y-8">
              
              {/* Premium Academy CTA Card */}
              <div className="glass-panel p-6 rounded-2xl border-gold/30 bg-gold/5 space-y-4 glow-gold">
                <h4 className="text-sm font-bold text-gold uppercase tracking-wider">TRADEIFYFX ACADEMY</h4>
                <h3 className="text-base sm:text-lg font-black text-title leading-snug">
                  Want to learn SMC and Price Action step-by-step?
                </h3>
                <p className="text-xs text-desc leading-relaxed">
                  Join our complete Forex Mastery or Gold Strategy course. Learn exact rules, live examples, and risk size management guides.
                </p>
                <Link
                  href="/#courses"
                  className="block w-full py-3 rounded-lg bg-gradient-gold text-black font-extrabold text-xs uppercase text-center tracking-wider shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Explore Premium Courses
                </Link>
              </div>

              {/* Recent Articles */}
              <div className="glass-panel p-6 rounded-2xl border-panel-border bg-panel-bg space-y-6">
                <h4 className="text-xs font-bold text-title uppercase tracking-widest border-b border-panel-border pb-3">
                  Recent Insights
                </h4>
                <div className="space-y-4">
                  {recentBlogs.map((b) => (
                    <Link
                      key={b.id}
                      href={`/blog/${b.slug}`}
                      className="block space-y-1.5 group"
                    >
                      <span className="text-[9px] font-bold text-gold uppercase tracking-wider block">
                        {b.category}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-sec group-hover:text-title group-hover:underline transition-all line-clamp-2 leading-snug">
                        {b.title}
                      </h5>
                      <span className="text-[10px] text-desc font-mono block">
                        {b.date}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

            </aside>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
