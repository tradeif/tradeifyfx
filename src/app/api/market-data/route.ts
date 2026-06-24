import { NextRequest, NextResponse } from "next/server";

const SYMBOL_MAP: Record<string, string> = {
  XAUUSD: "GC=F",
  BTCUSD: "BTC-USD",
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "JPY=X",
  NASDAQ: "^NDX",
  US100: "^NDX",

  // Additional Forex
  AUDUSD: "AUDUSD=X",
  USDCAD: "CAD=X",
  USDCHF: "CHF=X",
  NZDUSD: "NZDUSD=X",
  EURGBP: "EURGBP=X",
  EURJPY: "EURJPY=X",
  GBPJPY: "GBPJPY=X",

  // Additional Crypto
  ETHUSD: "ETH-USD",
  SOLUSD: "SOL-USD",
  XRPUSD: "XRP-USD",
  ADAUSD: "ADA-USD",
  DOGEUSD: "DOGE-USD",
  LTCUSD: "LTC-USD",

  // Additional Commodities
  XAGUSD: "SI=F",
  USOIL: "CL=F",
  UKOIL: "BZ=F",

  // Additional Indices
  SPX500: "^GSPC",
  DOW30: "^DJI",
  GER30: "^GDAXI",
  UK100: "^FTSE"
};

function getSymbolPrecision(symbol: string): number {
  if (symbol === "BTCUSD") return 0;
  if (
    symbol === "EURUSD" ||
    symbol === "GBPUSD" ||
    symbol === "AUDUSD" ||
    symbol === "NZDUSD" ||
    symbol === "EURGBP" ||
    symbol === "USDCAD" ||
    symbol === "USDCHF"
  ) {
    return 5;
  }
  if (symbol === "XRPUSD" || symbol === "ADAUSD" || symbol === "DOGEUSD") {
    return 4;
  }
  return 2;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientSymbol = searchParams.get("symbol") || "XAUUSD";
    const interval = searchParams.get("interval") || "5m";
    const range = searchParams.get("range") || "5d";

    const yahooSymbol = SYMBOL_MAP[clientSymbol] || clientSymbol;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${interval}&range=${range}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch data from Yahoo Finance: ${res.statusText}` }, { status: res.status });
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];

    if (!result || !result.timestamp) {
      return NextResponse.json({ error: "No chart data found in Yahoo Finance response" }, { status: 404 });
    }

    const quotes = result.indicators?.quote?.[0];
    if (!quotes) {
      return NextResponse.json({ error: "No quote indicators found in response" }, { status: 404 });
    }

    // Parse into candles format
    const candles = result.timestamp
      .map((t: number, idx: number): Candle | null => {
        const open = quotes.open?.[idx];
        const high = quotes.high?.[idx];
        const low = quotes.low?.[idx];
        const close = quotes.close?.[idx];

        if (open === null || high === null || low === null || close === null ||
            open === undefined || high === undefined || low === undefined || close === undefined) {
          return null;
        }

        const prec = getSymbolPrecision(clientSymbol);
        return {
          time: t,
          open: +open.toFixed(prec),
          high: +high.toFixed(prec),
          low: +low.toFixed(prec),
          close: +close.toFixed(prec)
        };
      })
      .filter((c: Candle | null): c is Candle => c !== null)
      .sort((a: Candle, b: Candle) => a.time - b.time);

    const latestPrice = result.meta?.regularMarketPrice || (candles.length > 0 ? candles[candles.length - 1].close : null);

    return NextResponse.json({
      symbol: clientSymbol,
      latestPrice,
      candles
    });
  } catch (error: unknown) {
    console.error("Market Data Proxy Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
