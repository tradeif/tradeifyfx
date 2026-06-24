"use client";

import React, { useEffect, useRef } from "react";

export default function Heatmap() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      currencies: ["EUR", "USD", "GBP", "JPY", "AUD", "CAD", "CHF"],
      isTransparent: true,
      colorTheme: "dark",
      locale: "en"
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10 h-[500px] flex flex-col">
      <h3 className="text-sm font-bold text-gradient-gold uppercase tracking-wider mb-3">
        Currency Heatmap
      </h3>
      <div className="flex-1 overflow-hidden">
        <div ref={container} className="tradingview-widget-container__widget h-full"></div>
      </div>
    </div>
  );
}
