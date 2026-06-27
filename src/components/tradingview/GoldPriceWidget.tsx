"use client";

import React, { useEffect, useRef } from "react";

export default function GoldPriceWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = ""; // Clean container first

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FX_IDC:XAUUSD", title: "Gold (XAU/USD)" },
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin (BTC)" },
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "FX:GBPUSD", title: "GBP/USD" },
        { proName: "INDEX:DXY", title: "US Dollar Index" },
        { proName: "FOREXCOM:SPX500", title: "S&P 500 Index" }
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "regular",
      locale: "en"
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="ticker-wrapper border-y border-white/5 bg-black/80 py-1 h-[46px] no-scrollbar">
      <div className="tradingview-widget-container ticker-content">
        <div ref={container} className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
