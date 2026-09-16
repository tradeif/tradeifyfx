import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history?: { sender: string; text: string }[];
    };

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NVIDIA_API_KEY || "";
    const isGemini = !!process.env.GEMINI_API_KEY;

    const openai = new OpenAI({
      apiKey,
      baseURL: isGemini
        ? "https://generativelanguage.googleapis.com/v1beta/openai/"
        : "https://integrate.api.nvidia.com/v1",
    });

    const model = isGemini ? "gemini-2.5-flash" : "deepseek-ai/deepseek-v4-pro";

    // Build chat history for multi-turn context
    const chatHistory = (history ?? []).map((m: { sender: string; text: string }) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    const systemPrompt = `You are TRADEIFYFX Bot, a friendly and expert AI Trading Assistant for the TRADEIFYFX platform.
Your role is to help traders with questions about:
- Smart Money Concepts (SMC), Order Blocks, Liquidity, Fair Value Gaps (FVG)
- Gold (XAUUSD) and Forex trading strategies
- Risk management (use strict 1-2% risk per trade rule)
- TRADEIFYFX courses: Forex Mastery, Gold Strategy, Crypto Masterclass, Smart Money Concepts, Risk Management Blueprint
- Membership plans: Basic (Free), Pro (₹2,999/mo - signals & weekly live trading), VIP (₹9,999/mo - 1-on-1 mentorship)
- Daily trade signals available in the Member Dashboard
- Contact/Support: WhatsApp or call +91 9799450432 (24/7 during market hours)

Keep responses concise (2-4 sentences), professional, and highly actionable. 
If you don't know something specific to TRADEIFYFX, guide the user to contact support.
Do not discuss topics unrelated to trading or the platform.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || "";

    if (content) {
      return NextResponse.json({ text: content });
    } else {
      console.error("Chatbot error: Empty response content", JSON.stringify(completion));
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("Chatbot API error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


