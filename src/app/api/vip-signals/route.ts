import { NextResponse } from "next/server";

// Server memory cache for VIP signals across all devices
let globalVIPSignals: any[] = [
  { id: "s1", pair: "XAUUSD", type: "BUY", entry: "2318.50", tp1: "2330.00", tp2: "2345.00", sl: "2308.00", ctc: "2318.50", status: "Active", rr: "1:2.5", accuracy: "87%", time: "09:45 AM", session: "London", createdAt: Date.now() },
  { id: "s2", pair: "EURUSD", type: "SELL", entry: "1.0852", tp1: "1.0810", tp2: "1.0780", sl: "1.0875", ctc: "1.0852", status: "Active", rr: "1:3.1", accuracy: "79%", time: "10:30 AM", session: "London", createdAt: Date.now() - 1000 },
  { id: "s3", pair: "BTCUSD", type: "BUY", entry: "64,200", tp1: "65,800", tp2: "67,000", sl: "63,100", ctc: "64,200", status: "Hit TP1", rr: "1:2.0", accuracy: "82%", time: "Yesterday", session: "NY", createdAt: Date.now() - 2000 },
  { id: "s4", pair: "GBPUSD", type: "BUY", entry: "1.2695", tp1: "1.2750", tp2: "1.2800", sl: "1.2650", ctc: "1.2695", status: "Active", rr: "1:2.4", accuracy: "76%", time: "08:15 AM", session: "London", createdAt: Date.now() - 3000 },
  { id: "s5", pair: "NASDAQ", type: "SELL", entry: "19,850", tp1: "19,600", tp2: "19,350", sl: "19,980", ctc: "19,850", status: "SL Hit", rr: "1:2.0", accuracy: "71%", time: "Yesterday", session: "NY", createdAt: Date.now() - 4000 },
  { id: "s6", pair: "USDJPY", type: "BUY", entry: "157.80", tp1: "158.40", tp2: "159.00", sl: "157.30", ctc: "157.80", status: "Active", rr: "1:1.8", accuracy: "74%", time: "11:00 AM", session: "Tokyo", createdAt: Date.now() - 5000 }
];

export async function GET() {
  return NextResponse.json({ signals: globalVIPSignals });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.signals && Array.isArray(body.signals)) {
      globalVIPSignals = body.signals;
      return NextResponse.json({ success: true, count: globalVIPSignals.length });
    }
    return NextResponse.json({ error: "Invalid signals array" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update signals" }, { status: 500 });
  }
}
