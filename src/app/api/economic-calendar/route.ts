import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CalendarEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

// Memory cache store
let cachedEvents: CalendarEvent[] | null = null;
let lastCacheFetch = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

// High-quality mock events generator for fallback
function generateFallbackEvents(): CalendarEvent[] {
  const baseDate = new Date();
  // Get start of the current week (Monday) in UTC
  const monday = new Date(baseDate);
  const day = monday.getUTCDay();
  const diff = monday.getUTCDate() - day + (day === 0 ? -6 : 1);
  monday.setUTCDate(diff);
  monday.setUTCHours(0, 0, 0, 0);

  const createDate = (daysOffset: number, hoursEDT: number, minutesEDT: number) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + daysOffset);
    // Forex Factory times are in Eastern Time (EDT = UTC-4).
    // We add 4 hours to convert Eastern Time to UTC.
    d.setUTCHours(hoursEDT + 4, minutesEDT, 0, 0);
    return d.toISOString();
  };

  return [
    // Monday
    {
      title: "PBOC Loan Prime Rate",
      country: "CNY",
      date: createDate(0, 9, 15),
      impact: "Medium",
      forecast: "3.45%",
      previous: "3.45%"
    },
    {
      title: "German Buba Monthly Report",
      country: "EUR",
      date: createDate(0, 12, 0),
      impact: "Low",
      forecast: "",
      previous: ""
    },
    // Tuesday
    {
      title: "Monetary Policy Meeting Minutes",
      country: "AUD",
      date: createDate(1, 9, 30),
      impact: "High",
      forecast: "",
      previous: ""
    },
    {
      title: "CPI y/y",
      country: "CAD",
      date: createDate(1, 14, 30),
      impact: "High",
      forecast: "2.6%",
      previous: "2.7%"
    },
    {
      title: "Existing Home Sales",
      country: "USD",
      date: createDate(1, 16, 0),
      impact: "Low",
      forecast: "3.86M",
      previous: "3.92M"
    },
    // Wednesday
    {
      title: "Flash Manufacturing PMI",
      country: "EUR",
      date: createDate(2, 9, 30),
      impact: "High",
      forecast: "47.2",
      previous: "47.3"
    },
    {
      title: "Flash Services PMI",
      country: "GBP",
      date: createDate(2, 10, 0),
      impact: "High",
      forecast: "52.8",
      previous: "52.9"
    },
    {
      title: "Flash Manufacturing PMI",
      country: "USD",
      date: createDate(2, 15, 45),
      impact: "Medium",
      forecast: "51.0",
      previous: "51.3"
    },
    {
      title: "Crude Oil Inventories",
      country: "USD",
      date: createDate(2, 16, 30),
      impact: "Medium",
      forecast: "-1.2M",
      previous: "-2.5M"
    },
    // Thursday
    {
      title: "SNB Policy Rate",
      country: "CHF",
      date: createDate(3, 9, 30),
      impact: "High",
      forecast: "1.25%",
      previous: "1.50%"
    },
    {
      title: "Unemployment Claims",
      country: "USD",
      date: createDate(3, 14, 30),
      impact: "High",
      forecast: "235K",
      previous: "238K"
    },
    {
      title: "Philly Fed Manufacturing Index",
      country: "USD",
      date: createDate(3, 14, 30),
      impact: "Medium",
      forecast: "4.8",
      previous: "1.8"
    },
    // Friday
    {
      title: "Retail Sales m/m",
      country: "GBP",
      date: createDate(4, 8, 0),
      impact: "High",
      forecast: "1.6%",
      previous: "-2.3%"
    },
    {
      title: "Flash Services PMI",
      country: "USD",
      date: createDate(4, 15, 45),
      impact: "Medium",
      forecast: "54.8",
      previous: "54.8"
    },
    {
      title: "Existing Home Sales",
      country: "USD",
      date: createDate(4, 16, 0),
      impact: "Low",
      forecast: "3.90M",
      previous: "3.88M"
    }
  ];
}

export async function GET() {
  const now = Date.now();

  // If memory cache is valid, return it
  if (cachedEvents && (now - lastCacheFetch < CACHE_TTL)) {
    return NextResponse.json(cachedEvents, {
      headers: {
        "x-cache": "HIT"
      }
    });
  }

  try {
    // Fetch live feed from faireconomy.media
    const response = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 60 } // Next.js ISR level caching
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from faireconomy: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      cachedEvents = data;
      lastCacheFetch = now;
      return NextResponse.json(data, {
        headers: {
          "x-cache": "MISS"
        }
      });
    }

    throw new Error("Invalid response data format from faireconomy");
  } catch (error) {
    console.error("Error fetching Forex Factory economic calendar:", error);
    
    // Serve fallback mock events in case of failures (e.g. rate limit, server downtime)
    const fallback = generateFallbackEvents();
    return NextResponse.json(fallback, {
      headers: {
        "x-cache": "FALLBACK",
        "x-error": error instanceof Error ? error.message : "unknown"
      }
    });
  }
}
