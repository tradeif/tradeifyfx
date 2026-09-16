import { NextResponse } from "next/server";

// Server memory cache for VIP signals across all devices (null until set or requested)
let globalVIPSignals: any[] | null = null;

export async function GET() {
  return NextResponse.json({ signals: globalVIPSignals });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.signals && Array.isArray(body.signals)) {
      globalVIPSignals = body.signals;
      return NextResponse.json({ success: true, count: body.signals.length });
    }
    return NextResponse.json({ error: "Invalid signals array" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update signals" }, { status: 500 });
  }
}

