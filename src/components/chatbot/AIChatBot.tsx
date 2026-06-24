"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

interface Message {
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! Welcome to TRADEIFYFX. 📊 I am your AI Trading Assistant powered by DeepSeek AI. How can I help you master the markets today? Ask me about SMC, Gold strategy, signals, or courses!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const currentInput = inputText;
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText("");
    setIsTyping(true);

    try {
      // Build history for multi-turn context (skip the initial greeting)
      const history = messages.slice(1).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          history,
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        sender: "bot",
        text:
          data.text ??
          "Sorry, I couldn't process that. Please try again or contact support at +91 9799450432.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops! Something went wrong. Please try again or contact support at +91 9799450432.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] glass-panel border border-panel-border rounded-2xl flex flex-col shadow-2xl overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-gold px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black leading-none">TRADEIFYFX Bot</h4>
                <span className="text-[10px] text-black/70 font-semibold">Powered by DeepSeek AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-black/10 text-black/80 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-panel-bg/30">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                    msg.sender === "user"
                      ? "bg-gold text-black"
                      : "bg-gray-100 dark:bg-white/10 text-title"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gold text-black rounded-tr-none font-medium"
                        : "bg-gray-50 dark:bg-white/5 border border-panel-border text-title rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-desc block mt-1 px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%] mr-auto">
                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 text-title flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-gray-50 dark:bg-white/5 border border-panel-border rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-desc animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-desc animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-desc animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-panel-border bg-panel-bg flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question..."
              disabled={isTyping}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-panel-border text-xs sm:text-sm text-title placeholder-gray-450 dark:placeholder-gray-500 focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="p-2 rounded-lg bg-gradient-gold text-black hover:opacity-90 transition-opacity flex-shrink-0 glow-gold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-gold text-black flex items-center justify-center shadow-2xl transition-all hover:scale-105 glow-gold border border-gold/20 cursor-pointer animate-pulse"
        aria-label="Open support chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
