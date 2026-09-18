"use client";

import React, { use, useEffect } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  ShieldAlert, 
  TrendingUp, 
  Landmark, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Target, 
  CheckCircle2, 
  BarChart3,
  Layers
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetail({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const { blogs } = useAppState();

  const blog = blogs.find((b) => b.slug === slug);

  useEffect(() => {
    if (blog) {
      document.title = `${blog.seoTitle || blog.title} | TRADEIFYFX`;

      // Update meta description dynamically for SEO
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", blog.metaDescription || blog.excerpt);

      // Update keywords dynamically for SEO
      if (blog.keywords && blog.keywords.length > 0) {
        let metaKw = document.querySelector('meta[name="keywords"]');
        if (!metaKw) {
          metaKw = document.createElement("meta");
          metaKw.setAttribute("name", "keywords");
          document.head.appendChild(metaKw);
        }
        metaKw.setAttribute("content", blog.keywords.join(", "));
      }
    }
  }, [blog]);

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

  // Get recent blogs for sidebar
  const recentBlogs = blogs.filter((b) => b.id !== blog.id).slice(0, 3);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.seoTitle || blog.title,
    "description": blog.metaDescription || blog.excerpt,
    "image": `https://tradeifyfx.com${blog.image}`,
    "author": {
      "@type": "Person",
      "name": blog.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "TRADEIFYFX",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tradeifyfx.com/favicon.ico"
      }
    },
    "datePublished": blog.date,
    "keywords": blog.keywords ? blog.keywords.join(", ") : ""
  };

  return (
    <>
      <Header />

      {/* Structured JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

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
            <article className="lg:col-span-8 space-y-8">
              
              {/* Category tag */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>{blog.category}</span>
              </span>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-title font-sans leading-tight">
                {blog.seoTitle || blog.title}
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
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-panel-border relative shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.image}
                  alt={blog.seoTitle || blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Excerpt */}
              <div className="p-5 rounded-xl bg-gold/5 border-l-4 border-gold border-panel-border space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-gold" /> Executive Summary
                </h3>
                <p className="text-base text-title font-semibold leading-relaxed italic">
                  {blog.excerpt}
                </p>
              </div>

              {/* Main Intro Paragraphs */}
              <div className="text-sec space-y-4 text-sm sm:text-base leading-relaxed">
                {blog.content.split("\n\n").map((para, idx) => (
                  <p key={idx} className="text-justify">{para}</p>
                ))}
              </div>

              {/* Fundamental Drivers Section */}
              {blog.fundamentals && blog.fundamentals.length > 0 && (
                <section className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 border-b border-panel-border pb-3">
                    <Landmark className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-bold text-title">{blog.fundamentalsTitle || "Market Fundamentals"}</h2>
                  </div>
                  <div className={`grid grid-cols-1 ${blog.fundamentals.length === 2 ? "sm:grid-cols-2" : "md:grid-cols-3"} gap-4`}>
                    {blog.fundamentals.map((fund, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-panel-bg border border-panel-border space-y-2 hover:border-gold/30 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-bold text-xs">
                          0{idx + 1}
                        </div>
                        <h3 className="text-sm font-bold text-title">{fund.title}</h3>
                        <p className="text-xs text-desc leading-relaxed">{fund.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Technical Levels Table Section */}
              {blog.tableData && blog.tableData.length > 0 && (
                <section className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 border-b border-panel-border pb-3">
                    <BarChart3 className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-bold text-title">{blog.tableTitle || "Key Technical Levels"}</h2>
                  </div>
                  {blog.tableSubtitle && (
                    <p className="text-xs text-desc">
                      {blog.tableSubtitle}
                    </p>
                  )}
                  <div className="overflow-x-auto rounded-xl border border-panel-border bg-panel-bg">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-black/40 text-title border-b border-panel-border uppercase font-mono text-[11px]">
                        <tr>
                          <th className="py-3.5 px-4 font-extrabold">{blog.tableHeaderCol1 || "Level Type"}</th>
                          <th className="py-3.5 px-4 font-extrabold">{blog.tableHeaderCol2 || "Price Zone"}</th>
                          <th className="py-3.5 px-4 font-extrabold">{blog.tableHeaderCol3 || "Significance"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-panel-border text-sec">
                        {blog.tableData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-title flex items-center gap-2">
                              {(row.levelType.includes("Resistance") || row.levelType.includes("Amateur")) && <span className="w-2 h-2 rounded-full bg-red-accent inline-block" />}
                              {(row.levelType.includes("Pivot") || row.levelType.includes("LVN") || row.levelType.includes("Buy-Side")) && <span className="w-2 h-2 rounded-full bg-gold inline-block" />}
                              {(row.levelType.includes("Support") || row.levelType.includes("Sell-Side") || row.levelType.includes("Professional")) && <span className="w-2 h-2 rounded-full bg-green-accent inline-block" />}
                              <span>{row.levelType}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-black text-gold whitespace-nowrap">
                              {row.priceZone}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-desc leading-relaxed">
                              {row.significance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Setups Section */}
              {blog.keySetups && blog.keySetups.length > 0 && (
                <section className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 border-b border-panel-border pb-3">
                    <Target className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-bold text-title">{blog.setupsTitle || "Key Trading Setups"}</h2>
                  </div>
                  <div className="space-y-3">
                    {blog.keySetups.map((setup, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-panel-bg border border-panel-border flex items-start gap-3 hover:border-gold/30 transition-all">
                        <div className="px-2.5 py-1 rounded bg-gold/10 text-gold font-mono font-extrabold text-xs mt-0.5">
                          #{idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-title">{setup.title}</h3>
                          <p className="text-xs text-desc leading-relaxed">{setup.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Risk Management Rules Section */}
              {blog.riskRules && blog.riskRules.length > 0 && (
                <section className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 border-b border-panel-border pb-3">
                    <ShieldCheck className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-bold text-title">{blog.rulesTitle || "Essential Risk Rules"}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {blog.riskRules.map((rule, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-panel-bg border border-panel-border space-y-2">
                        <CheckCircle2 className="w-5 h-5 text-gold" />
                        <h3 className="text-sm font-bold text-title">{rule.title}</h3>
                        <p className="text-xs text-desc leading-relaxed">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Concluding Remarks & Disclaimer */}
              <section className="space-y-4 pt-6 border-t border-panel-border">
                {blog.conclusionText ? (
                  <p className="text-sm text-sec leading-relaxed font-medium">
                    {blog.conclusionText}
                  </p>
                ) : (
                  <p className="text-sm text-sec leading-relaxed font-medium">
                    Gold&apos;s broader structure continues to reward patience over impulse. Keep your focus on price action around the <strong className="text-gold">$4,255.99 – $4,265</strong> support base and the <strong className="text-gold">$4,434 – $4,448</strong> overhead resistance, letting market confirmation guide your entries.
                  </p>
                )}

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-desc flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-accent flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-title">Disclaimer:</strong> {blog.disclaimerText || "This analysis is published strictly for educational purposes and does not constitute financial or investment advice. Always evaluate personal risk tolerance before entering trades."}
                  </p>
                </div>
              </section>

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
                        {b.seoTitle || b.title}
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
