"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Filter, RefreshCw, Search, Calendar, Bell, BellOff } from "lucide-react";

interface CalendarEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  CAD: "ca",
  CHF: "ch",
  AUD: "au",
  NZD: "nz",
  CNY: "cn",
};

const POPULAR_CURRENCIES = ["ALL", "USD", "EUR", "GBP", "AUD", "CAD", "JPY"];

export default function EconomicCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  
  // Filters
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedImpact, setSelectedImpact] = useState("ALL"); // ALL, HIGH, HIGH_MEDIUM
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAlerts, setActiveAlerts] = useState<Record<string, boolean>>({});

  const listContainerRef = useRef<HTMLDivElement>(null);

  // Fetch events function
  const fetchEvents = async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const res = await fetch("/api/economic-calendar");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching economic events:", err);
      setError("Failed to sync live Forex Factory calendar. Using cached data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Set stable timestamp on client-side mount and handle periodic updates asynchronously
  useEffect(() => {
    // Defer initial updates to the next tick to avoid synchronous setState inside the effect body
    const timeoutId = setTimeout(() => {
      setCurrentTime(Date.now());
      fetchEvents();
    }, 0);

    const intervalId = setInterval(() => {
      fetchEvents(true);
      setCurrentTime(Date.now());
    }, 120000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // Format event time to Indian Standard Time (IST)
  const formatEventTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "--:--";
    }
  };

  // Check if event is upcoming using stable state time
  const isEventUpcoming = (dateStr: string) => {
    if (!currentTime) return false;
    try {
      const eventTime = new Date(dateStr).getTime();
      return eventTime > currentTime && eventTime - currentTime < 3 * 60 * 60 * 1000; // 3 hours window
    } catch {
      return false;
    }
  };

  // Toggle notifications alert mock
  const toggleAlert = (eventTitle: string) => {
    setActiveAlerts((prev) => {
      const updated = { ...prev, [eventTitle]: !prev[eventTitle] };
      if (updated[eventTitle]) {
        // Simple client notification alert mock
        alert(`🔔 Alert Set: You will be notified 5 minutes before "${eventTitle}"!`);
      }
      return updated;
    });
  };

  // Custom 3-bar impact indicator matching Forex Factory/TradingView visual styling
  const renderImpactIndicator = (impact: string) => {
    const lower = impact.toLowerCase();
    let title = "Low Impact";
    let bars = (
      <div className="flex gap-0.5 items-end h-3" title={title}>
        <div className="w-1 h-1.5 bg-green-500/80 rounded-sm" />
        <div className="w-1 h-2.5 bg-white/10 rounded-sm" />
        <div className="w-1 h-3.5 bg-white/10 rounded-sm" />
      </div>
    );

    if (lower === "high") {
      title = "High Impact (High Market Volatility)";
      bars = (
        <div className="flex gap-0.5 items-end h-3" title={title}>
          <div className="w-1 h-1.5 bg-red-accent rounded-sm animate-pulse" />
          <div className="w-1 h-2.5 bg-red-accent rounded-sm animate-pulse" />
          <div className="w-1 h-3.5 bg-red-accent rounded-sm animate-pulse" />
        </div>
      );
    } else if (lower === "medium") {
      title = "Medium Impact";
      bars = (
        <div className="flex gap-0.5 items-end h-3" title={title}>
          <div className="w-1 h-1.5 bg-amber-500 rounded-sm" />
          <div className="w-1 h-2.5 bg-amber-500 rounded-sm" />
          <div className="w-1 h-3.5 bg-white/10 rounded-sm" />
        </div>
      );
    } else if (lower === "holiday") {
      title = "Bank Holiday";
      bars = (
        <div className="flex gap-0.5 items-end h-3" title={title}>
          <div className="w-1 h-1.5 bg-purple-500 rounded-sm" />
          <div className="w-1 h-2.5 bg-purple-500 rounded-sm" />
          <div className="w-1 h-3.5 bg-purple-500 rounded-sm" />
        </div>
      );
    }

    return bars;
  };

  // Group events by local date string
  const groupedEvents = useMemo(() => {
    const filtered = events.filter((e) => {
      // 1. Currency filter
      const matchesCurrency = selectedCurrency === "ALL" || e.country === selectedCurrency;
      
      // 2. Impact filter
      let matchesImpact = true;
      if (selectedImpact === "HIGH") {
        matchesImpact = e.impact.toLowerCase() === "high";
      } else if (selectedImpact === "HIGH_MEDIUM") {
        matchesImpact = e.impact.toLowerCase() === "high" || e.impact.toLowerCase() === "medium";
      }

      // 3. Search text
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            e.country.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCurrency && matchesImpact && matchesSearch;
    });

    const groups: Record<string, CalendarEvent[]> = {};
    filtered.forEach((e) => {
      try {
        const dateObj = new Date(e.date);
        const dayStr = dateObj.toLocaleDateString("en-US", {
          timeZone: "Asia/Kolkata",
          weekday: "long",
          month: "short",
          day: "numeric",
        });
        if (!groups[dayStr]) {
          groups[dayStr] = [];
        }
        groups[dayStr].push(e);
      } catch {
        const fallbackDay = "This Week";
        if (!groups[fallbackDay]) groups[fallbackDay] = [];
        groups[fallbackDay].push(e);
      }
    });

    return groups;
  }, [events, selectedCurrency, selectedImpact, searchQuery]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-panel-border h-[520px] flex flex-col relative select-none">
      
      {/* Title Header with status */}
      <div className="flex items-center justify-between mb-4 border-b border-panel-border pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gold animate-pulse" />
          <div>
            <h3 className="text-xs font-black text-title uppercase tracking-widest leading-none">
              Economic Calendar
            </h3>
            <span className="text-[9px] text-green-accent flex items-center gap-1 mt-1 font-semibold uppercase font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-accent animate-ping inline-block" />
              Forex Factory Live Feed
            </span>
          </div>
        </div>
        <button
          onClick={() => fetchEvents()}
          disabled={loading || refreshing}
          className="p-1.5 rounded-lg border border-panel-border bg-panel-bg hover:border-gold hover:text-gold text-sec hover:scale-105 transition-all shadow cursor-pointer"
          title="Sync Calendar Feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? "animate-spin text-gold" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-semibold leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      {/* Dynamic Filters panel */}
      <div className="space-y-3 mb-4">
        {/* Search */}
        <div className="relative flex items-center bg-black/30 border border-panel-border rounded-lg px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-desc mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search economic releases..."
            className="bg-transparent text-xs text-title focus:outline-none w-full placeholder-gray-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] text-desc hover:text-title font-bold px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Currency Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px]">
          {POPULAR_CURRENCIES.map((curr) => {
            const countryCode = CURRENCY_TO_COUNTRY[curr];
            const isSelected = selectedCurrency === curr;
            return (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 rounded-full font-bold uppercase border flex items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-gold border-gold text-black glow-gold shadow-sm"
                    : "bg-panel-bg border-panel-border text-desc hover:text-title hover:border-panel-hover-border"
                }`}
              >
                {countryCode && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://flagcdn.com/16x12/${countryCode}.png`}
                    alt={curr}
                    className="w-3.5 h-2.5 object-cover rounded-sm"
                  />
                )}
                <span>{curr}</span>
              </button>
            );
          })}
        </div>

        {/* Impact Level Dropdowns/Pills */}
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-desc pt-1 border-t border-panel-border/40">
          <span className="flex items-center gap-1"><Filter className="w-3 h-3 text-gold" /> Filter Impact:</span>
          <div className="flex gap-2">
            {[
              { id: "ALL", label: "All" },
              { id: "HIGH_MEDIUM", label: "High/Med" },
              { id: "HIGH", label: "High Only" },
            ].map((imp) => {
              const active = selectedImpact === imp.id;
              return (
                <button
                  key={imp.id}
                  onClick={() => setSelectedImpact(imp.id)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    active ? "bg-gold/15 text-gold border border-gold/30" : "hover:text-title"
                  }`}
                >
                  {imp.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Scrollable Box */}
      <div 
        ref={listContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pr-1"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
            <p className="text-xs text-desc font-medium">Syncing live Forex Factory data...</p>
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
            <Search className="w-8 h-8 text-desc opacity-50" />
            <h4 className="text-xs font-bold text-title">No Events Match Filters</h4>
            <p className="text-[10px] text-desc max-w-[200px] leading-relaxed">
              Try modifying your currency tab, impact selector, or search text.
            </p>
          </div>
        ) : (
          Object.keys(groupedEvents).map((dayStr) => (
            <div key={dayStr} className="space-y-1.5">
              {/* Day Header */}
              <div className="text-[9px] font-black uppercase tracking-widest text-gold sticky top-0 bg-[#0d0d0d]/90 backdrop-blur-sm z-10 py-1 border-b border-panel-border/30">
                {dayStr}
              </div>

              {/* Day's Events List */}
              <div className="space-y-1">
                {groupedEvents[dayStr].map((event, idx) => {
                  const countryCode = CURRENCY_TO_COUNTRY[event.country];
                  const localTime = formatEventTime(event.date);
                  const isUpcoming = isEventUpcoming(event.date);
                  const alertActive = activeAlerts[event.title];

                  return (
                    <div
                      key={`${event.title}-${idx}`}
                      className={`group p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isUpcoming
                          ? "bg-purple-600/5 border-purple-500/30 shadow shadow-purple-500/5 scale-[1.01]"
                          : "bg-black/10 border-panel-border hover:bg-white/5 hover:border-panel-hover-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Event Left Panel: Time & Currency */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-mono font-bold leading-none ${
                            isUpcoming ? "text-purple-400 font-extrabold" : "text-desc"
                          }`}>
                            {localTime}
                          </span>
                          <div className="flex items-center gap-1 font-bold text-[10px] text-title leading-none">
                            {countryCode && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`https://flagcdn.com/16x12/${countryCode}.png`}
                                alt={event.country}
                                className="w-3.5 h-2.5 object-cover rounded-sm"
                              />
                            )}
                            <span className="font-mono font-black">{event.country}</span>
                          </div>
                        </div>

                        {/* Impact Bars */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isUpcoming && (
                            <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded-full border border-purple-500/30 animate-pulse font-bold">
                              UPCOMING
                            </span>
                          )}
                          {renderImpactIndicator(event.impact)}
                        </div>
                      </div>

                      {/* Event Title and alert toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[11px] font-bold text-title group-hover:text-gold leading-tight transition-colors">
                          {event.title}
                        </span>
                        
                        <button
                          onClick={() => toggleAlert(event.title)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-desc hover:text-gold cursor-pointer flex-shrink-0"
                          title={alertActive ? "Disable Alert" : "Set Alert Reminder"}
                        >
                          {alertActive ? <Bell className="w-3.5 h-3.5 text-gold" /> : <BellOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Forecast and Previous release figures */}
                      <div className="flex gap-4 text-[9px] font-mono text-desc border-t border-white/5 pt-1.5">
                        {event.forecast ? (
                          <span>
                            Forecast: <strong className="text-title font-bold">{event.forecast}</strong>
                          </span>
                        ) : (
                          <span>Forecast: <span className="opacity-40">--</span></span>
                        )}
                        {event.previous ? (
                          <span>
                            Previous: <strong className="text-title font-bold">{event.previous}</strong>
                          </span>
                        ) : (
                          <span>Previous: <span className="opacity-40">--</span></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Status Warning if Fallback used */}
      {events.length > 0 && !loading && events[0]?.forecast === "3.45%" && (
        <div className="absolute bottom-2 left-2 right-2 bg-amber-500/10 border border-amber-500/25 rounded-lg py-1 px-2 flex justify-between items-center text-[8px] text-amber-400 font-bold uppercase tracking-wider pointer-events-none select-none">
          <span>⚠️ Server Rate-Limited · Offline Mode Active</span>
          <span className="text-[7px] text-amber-500/70 font-mono font-bold">Forex Factory</span>
        </div>
      )}
    </div>
  );
}
