"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, Minimize2, Pencil, Type, Trash2, Eye, Check } from "lucide-react";

interface Point {
  x: number; // 0 to 1 relative to canvas width
  y: number; // 0 to 1 relative to canvas height
}

interface LineDrawing {
  type: "line";
  points: Point[];
  color: string;
  width: number;
}

interface TextDrawing {
  type: "text";
  point: Point;
  text: string;
  color: string;
}

type Drawing = LineDrawing | TextDrawing;

export default function LiveChart() {
  const container = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedPair, setSelectedPair] = useState("FX_IDC:XAUUSD");
  
  // Fullscreen and Drawing States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [tool, setTool] = useState<"pen" | "text">("pen");
  const [color, setColor] = useState("#FFD700"); // default Gold
  const [lineWidth, setLineWidth] = useState(4);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    pctX: number;
    pctY: number;
  } | null>(null);

  const pairs = [
    { name: "Gold (XAUUSD)", value: "FX_IDC:XAUUSD" },
    { name: "Bitcoin (BTCUSD)", value: "BINANCE:BTCUSDT" },
    { name: "EURUSD", value: "FX:EURUSD" },
    { name: "GBPUSD", value: "FX:GBPUSD" }
  ];

  // Persist body overflow when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Load drawings from localStorage based on selected pair
  useEffect(() => {
    const saved = localStorage.getItem(`tradeifyfx_drawings_${selectedPair}`);
    if (saved) {
      try {
        setDrawings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved drawings:", e);
        setDrawings([]);
      }
    } else {
      setDrawings([]);
    }
    setActiveTextInput(null);
  }, [selectedPair]);

  // Save drawings helper
  const saveDrawings = (list: Drawing[]) => {
    localStorage.setItem(`tradeifyfx_drawings_${selectedPair}`, JSON.stringify(list));
  };

  // Canvas Redraw Logic
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Synchronize canvas internal width/height to display sizes to avoid stretching (rounded to prevent subpixel scroll changes)
    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved drawings
    drawings.forEach((d) => {
      ctx.strokeStyle = d.color;
      ctx.fillStyle = d.color;
      
      if (d.type === "line") {
        if (d.points.length < 1) return;
        ctx.lineWidth = d.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        const startX = d.points[0].x * canvas.width;
        const startY = d.points[0].y * canvas.height;
        ctx.moveTo(startX, startY);
        for (let i = 1; i < d.points.length; i++) {
          ctx.lineTo(d.points[i].x * canvas.width, d.points[i].y * canvas.height);
        }
        ctx.stroke();
      } else if (d.type === "text") {
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.fillText(d.text, d.point.x * canvas.width, d.point.y * canvas.height);
      }
    });

    // Draw active drawing stroke
    if (currentPoints.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const startX = currentPoints[0].x * canvas.width;
      const startY = currentPoints[0].y * canvas.height;
      ctx.moveTo(startX, startY);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x * canvas.width, currentPoints[i].y * canvas.height);
      }
      ctx.stroke();
    }
  }, [drawings, currentPoints, color, lineWidth]);

  // Redraw when states change
  useEffect(() => {
    redrawCanvas();
  }, [drawings, currentPoints, isFullscreen, selectedPair, redrawCanvas]);

  // Handle Resize triggers
  useEffect(() => {
    const handleResize = () => {
      redrawCanvas();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [redrawCanvas]);

  // Translate client mouse/touch to relative percentage bounds
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
      pixelX: clientX - rect.left,
      pixelY: clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    
    const coords = getCanvasCoords(e);
    if (!coords) return;
    
    if (tool === "text") {
      setActiveTextInput({ 
        x: coords.pixelX, 
        y: coords.pixelY, 
        pctX: coords.x, 
        pctY: coords.y 
      });
    } else {
      setIsDrawing(true);
      setCurrentPoints([{ x: coords.x, y: coords.y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || tool !== "pen") return;
    
    const coords = getCanvasCoords(e);
    if (!coords) return;
    
    setCurrentPoints((prev) => [...prev, { x: coords.x, y: coords.y }]);
  };

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentPoints.length > 1) {
      const newLine: LineDrawing = {
        type: "line",
        points: currentPoints,
        color,
        width: lineWidth
      };
      setDrawings((prev) => {
        const next = [...prev, newLine];
        saveDrawings(next);
        return next;
      });
    }
    setCurrentPoints([]);
  }, [isDrawing, currentPoints, color, lineWidth, selectedPair]);

  // Register mouseup/touchend globally to capture releases outside of the canvas bounding box
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseUp]);

  const handleAddText = (textVal: string) => {
    if (!textVal.trim() || !activeTextInput) {
      setActiveTextInput(null);
      return;
    }
    
    const newText: TextDrawing = {
      type: "text",
      point: { x: activeTextInput.pctX, y: activeTextInput.pctY },
      text: textVal.trim(),
      color
    };
    
    setDrawings((prev) => {
      const next = [...prev, newText];
      saveDrawings(next);
      return next;
    });
    
    setActiveTextInput(null);
  };

  const handleClearCanvas = () => {
    if (confirm("Are you sure you want to clear all custom drawings for this symbol?")) {
      setDrawings([]);
      localStorage.removeItem(`tradeifyfx_drawings_${selectedPair}`);
    }
  };

  // TradingView Iframe Widget lifecycle
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.id = "tradingview_live_chart_widget";
    widgetDiv.className = "w-full h-full";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      const tv = (window as Window & { TradingView?: { widget: new (options: unknown) => unknown } }).TradingView;
      if (tv) {
        new tv.widget({
          width: "100%",
          height: "100%",
          symbol: selectedPair,
          interval: "H4",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_live_chart_widget",
          hide_side_toolbar: false,
          save_image: false,
          calendar: true
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [selectedPair, isFullscreen]);

  return (
    <div className={`w-full h-full flex flex-col transition-all duration-300 ${
      isFullscreen ? "fixed inset-0 z-50 bg-app-bg p-6 w-screen h-screen overflow-hidden" : ""
    }`}>
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {/* Trading Pairs selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {pairs.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedPair(p.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-300 border flex-shrink-0 cursor-pointer ${
                selectedPair === p.value
                  ? "bg-gradient-gold text-black border-gold glow-gold scale-105"
                  : "bg-gray-150 border-panel-border text-desc hover:text-title hover:bg-gray-200 dark:bg-white/5 dark:border-white/10"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Floating control buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto bg-panel-bg border border-panel-border rounded-xl px-3 py-1.5 backdrop-blur-md z-20">
          {/* Toggle drawing mode */}
          <button
            onClick={() => {
              setIsDrawingMode(!isDrawingMode);
              setActiveTextInput(null);
            }}
            title={isDrawingMode ? "View Mode (Disable Drawings)" : "Draw / Annotate"}
            className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              isDrawingMode 
                ? "bg-gold text-black glow-gold" 
                : "text-desc hover:text-title hover:bg-white/5"
            }`}
          >
            {isDrawingMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Chart"}
            className="p-2 rounded-lg text-desc hover:text-title hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-gold" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawing mode sub-toolbar (when drawing mode is enabled) */}
      {isDrawingMode && (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-xl border border-panel-border bg-panel-bg/50 backdrop-blur-md text-xs animate-fade-in z-20">
          {/* Tool selectors */}
          <div className="flex items-center gap-1.5 border-r border-panel-border pr-4">
            <button
              onClick={() => { setTool("pen"); setActiveTextInput(null); }}
              className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 font-bold uppercase transition-colors cursor-pointer ${
                tool === "pen" ? "bg-gold/25 text-gold border border-gold/30" : "text-desc hover:text-title"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Pen</span>
            </button>
            <button
              onClick={() => setTool("text")}
              className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 font-bold uppercase transition-colors cursor-pointer ${
                tool === "text" ? "bg-gold/25 text-gold border border-gold/30" : "text-desc hover:text-title"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
          </div>

          {/* Color pickers */}
          <div className="flex items-center gap-2 border-r border-panel-border pr-4">
            <span className="text-[10px] text-desc font-bold uppercase tracking-wider">Color:</span>
            <div className="flex gap-1.5">
              {[
                { name: "Gold", value: "#FFD700" },
                { name: "Green", value: "#00E676" },
                { name: "Red", value: "#FF1744" },
                { name: "Purple", value: "#c084fc" },
                { name: "White", value: "#ffffff" }
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                    color === c.value ? "scale-125 border-title ring-2 ring-gold/40" : "border-transparent hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thickness select (for pen) */}
          {tool === "pen" && (
            <div className="flex items-center gap-2 border-r border-panel-border pr-4">
              <span className="text-[10px] text-desc font-bold uppercase tracking-wider">Size:</span>
              <div className="flex gap-1.5">
                {[
                  { label: "S", value: 2 },
                  { label: "M", value: 4 },
                  { label: "L", value: 8 }
                ].map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setLineWidth(size.value)}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] transition-colors cursor-pointer border ${
                      lineWidth === size.value 
                        ? "bg-gold/25 text-gold border-gold/40" 
                        : "bg-white/5 border-panel-border text-desc hover:text-title"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] text-green-accent/80 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Auto-saved
            </span>
            <button
              onClick={handleClearCanvas}
              className="px-2.5 py-1.5 rounded bg-red-500/10 border border-red-500/25 text-red-accent hover:bg-red-500/20 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Drawings</span>
            </button>
          </div>
        </div>
      )}

      {/* Chart container */}
      <div className={`glass-panel p-2 rounded-xl overflow-hidden border border-panel-border flex-1 relative ${
        isFullscreen ? "h-full w-full" : "h-[516px]"
      }`}>
        {/* TradingView Widget Div */}
        <div ref={container} className="w-full h-full" />

        {/* Canvas Overlay for Drawings */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] rounded-lg"
          style={{
            pointerEvents: isDrawingMode ? "auto" : "none",
            cursor: isDrawingMode ? (tool === "text" ? "text" : "crosshair") : "default",
            zIndex: 10
          }}
        />

        {/* Floating text input */}
        {activeTextInput && (
          <input
            autoFocus
            type="text"
            placeholder="Type note & press Enter..."
            className="absolute bg-[#0f0f15] border border-gold/50 rounded-lg px-3 py-1.5 text-xs text-title focus:outline-none focus:ring-1 focus:ring-gold/30 z-30 shadow-2xl min-w-[200px]"
            style={{
              left: activeTextInput.x,
              top: activeTextInput.y,
              transform: "translate(-50%, -50%)"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddText(e.currentTarget.value);
              } else if (e.key === "Escape") {
                setActiveTextInput(null);
              }
            }}
            onBlur={(e) => {
              handleAddText(e.target.value);
            }}
          />
        )}

        {/* Instructions banner */}
        {isDrawingMode && (
          <div className="absolute bottom-4 left-4 bg-black/85 border border-panel-border px-3 py-1.5 rounded-lg z-20 text-[10px] text-desc font-bold flex items-center gap-1.5 select-none backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>Annotation active. Switch to View Mode (Eye icon) to navigate chart.</span>
          </div>
        )}
      </div>
    </div>
  );
}
