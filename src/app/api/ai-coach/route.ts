import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";

const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

interface TradeInput {
  symbol: string;
  type: string;
  openTime: string;
  closeTime: string;
  openPrice: number;
  closePrice: number;
  lots: number;
  profit: number;
  pips: number;
  status: string;
  notes?: string;
}

interface MessageInput {
  role: string;
  text: string;
}

interface ExtendedMessage {
  reasoning?: string;
  reasoning_content?: string;
  content?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const { trades, messages } = await req.json() as { trades: TradeInput[]; messages: MessageInput[] };

    if (!trades || !messages) {
      return NextResponse.json({ error: "Missing trades or message history" }, { status: 400 });
    }

    // Format trades for the AI
    const formattedTrades = trades.map((t: TradeInput) => ({
      symbol: t.symbol,
      type: t.type,
      openTime: t.openTime,
      closeTime: t.closeTime,
      openPrice: t.openPrice,
      closePrice: t.closePrice,
      lots: t.lots,
      profit: t.profit,
      pips: t.pips,
      status: t.status,
      notes: t.notes || ""
    }));

    // Compile chat history context
    const chatHistoryContext = messages.map((m: MessageInput) => {
      return `${m.role === "ai" ? "AI Coach" : "Trader"}: ${m.text}`;
    }).join("\n");

    const promptText = `
You are an AI Trading Coach serving as an institutional-grade Quant Analyst, Risk Manager, and Trading Psychologist. You are actively coaching a trader based on their actual trading journal logs.

Here is their complete trading journal data for context:
${JSON.stringify(formattedTrades, null, 2)}

Here is the conversation history:
${chatHistoryContext}

ROLE & BEHAVIOR:
1. Adopt the persona of a warm, articulate, and highly experienced human expert/mentor. Engage in fluid, real-time, two-way dialogue.
2. Address the specific context of the trader's last message directly. If they greet you, ask how you are, or chat casually, respond naturally and warmly as a human coach would—do NOT dump static metrics or trade analyses in response to simple, casual messages.
3. Do NOT paste or regurgitate performance metrics, statistics, or complex analyses unless the trader explicitly asks for them or the current context of the conversation naturally warrants it.
4. Base any mathematical or statistical conclusions ONLY on the actual trade data provided. When the trader asks for specific metrics (such as win rate, expectancy, best trading day, average profit/loss, or risk/reward ratio), calculate them dynamically and quote the exact numbers.
5. Use open-ended questions when appropriate to prompt reflection (e.g., asking about their execution state, psychological hurdles, or trading goals), keeping the conversation highly interactive and personalized.
6. Keep your responses concise (typically 1-3 paragraphs) and highly actionable, avoiding generic advice or textbook definitions.
`;

    // NVIDIA DeepSeek requires vendor-specific params not in the OpenAI types
    const completion = await (openai.chat.completions.create as (...args: unknown[]) => Promise<unknown>)({
      model: "deepseek-ai/deepseek-v4-flash",
      messages: [
        {
          role: "user",
          content: promptText
        }
      ],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 16384,
      chat_template_kwargs: {
        thinking: true,
        reasoning_effort: "high"
      }
    }) as { choices: Array<{ message: ExtendedMessage }> };

    const messageObj = completion.choices[0]?.message;
    const reasoning = messageObj?.reasoning || messageObj?.reasoning_content || "";
    const content = messageObj?.content || "";

    if (content) {
      return NextResponse.json({ text: content, reasoning: reasoning });
    } else {
      console.error("NVIDIA DeepSeek API returned empty content:", JSON.stringify(completion));
      return NextResponse.json({ error: "Failed to generate coaching response" }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("AI Coach API Route Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

