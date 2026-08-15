import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { useWindowSize } from "./useWindowSize";
import Navbar from "./Navbar";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const TICKER_LOGOS = {
  AAPL: "https://www.apple.com/favicon.ico",
  TSLA: "https://www.tesla.com/favicon.ico",
  SPY:  "https://www.ssga.com/favicon.ico",
  NVDA: "https://www.nvidia.com/favicon.ico",
  MSFT: "https://www.microsoft.com/favicon.ico",
  AMZN: "https://www.amazon.com/favicon.ico",
  GOOGL: "https://www.google.com/favicon.ico",
  UBER: "https://www.uber.com/favicon.ico",
  JPM:  "https://www.jpmorganchase.com/favicon.ico",
  V:    "https://www.visa.com/favicon.ico",
  NFLX: "https://www.netflix.com/favicon.ico",
  META: "https://www.facebook.com/favicon.ico",
};

const STRATEGY_LABELS = {
  ma_crossover: "MA Crossover",
  rsi: "RSI Strategy",
  bollinger: "Bollinger Bands",
  macd: "MACD",
  logistic_regression: "Logistic Regression",
  random_forest: "Random Forest",
};

const TIMEFRAME_LABELS = { "1y": "1 Year", "3y": "3 Years", "5y": "5 Years" };

function BacktestHistory({ history, onRerun }) {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>🕐</span>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>Your History</h3>
        <span style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>{history.length} test{history.length !== 1 ? "s" : ""}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {history.map((h) => {
          const ret = h.totalReturn;
          const retPct = ret !== undefined && ret !== null ? (ret * 100).toFixed(1) : null;
          const positive = retPct !== null && parseFloat(retPct) >= 0;
          const isHovered = hoveredId === h.id;
          return (
            <div
              key={h.id}
              onClick={() => onRerun(h)}
              onMouseEnter={() => setHoveredId(h.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isHovered ? "rgba(14,165,233,0.06)" : "#0f172a",
                border: isHovered ? "1px solid rgba(14,165,233,0.35)" : "1px solid #1e293b",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                transition: "all 0.18s", transform: isHovered ? "translateY(-2px)" : "translateY(0)",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <img src={TICKER_LOGOS[h.ticker]} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  <span style={{ display: "none", color: "#64748b", fontSize: 12, fontWeight: 700 }}>{h.ticker[0]}</span>
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{h.ticker}</div>
                  <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>{TIMEFRAME_LABELS[h.timeframe] || h.timeframe}</div>
                </div>
                {retPct !== null && (
                  <div style={{ marginLeft: "auto", color: positive ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 700 }}>
                    {positive ? "+" : ""}{retPct}%
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#64748b", background: "#1e293b", borderRadius: 6, padding: "3px 8px" }}>{STRATEGY_LABELS[h.strategy] || h.strategy}</span>
                <span style={{ fontSize: 10, color: "#334155" }}>
                  {new Date(h.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Backtest() {
  const { isMobile } = useWindowSize();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [ticker, setTicker] = useState("AAPL");
  const [strategy, setStrategy] = useState("ma_crossover");
  const [timeframe, setTimeframe] = useState("1y");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProGate, setShowProGate] = useState(false);
  const [mlLoadingStep, setMlLoadingStep] = useState(0);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "https://quantworld-backend.onrender.com"}/backtest?ticker=AAPL`).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("ticker");
    const s = urlParams.get("strategy");
    if (t) {
      setTicker(t);
      if (s) setStrategy(s);
      setTimeout(() => runBacktestFor(t, s || strategy, timeframe), 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isMLStrategy = (s) => s === "logistic_regression" || s === "random_forest";
  const isUserPro = true;

  // Backtest history
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qw_backtest_history") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    if (!user || !db) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (!snap.exists()) return;
      const saved = snap.data().backtestHistory || [];
      setHistory(prev => {
        const ids = new Set(prev.map(h => h.id));
        const merged = [...prev, ...saved.filter(h => !ids.has(h.id))];
        merged.sort((a, b) => b.ts - a.ts);
        const trimmed = merged.slice(0, 20);
        localStorage.setItem("qw_backtest_history", JSON.stringify(trimmed));
        return trimmed;
      });
    }).catch(() => {});
  }, [user]);

  const saveHistory = useCallback((t, s, tf, result) => {
    const entry = {
      id: `${t}-${s}-${tf}-${Date.now()}`,
      ticker: t,
      strategy: s,
      timeframe: tf,
      totalReturn: result?.strategy_metrics?.total_return,
      ts: Date.now(),
    };
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 20);
      localStorage.setItem("qw_backtest_history", JSON.stringify(next));
      if (user && db) {
        setDoc(doc(db, "users", user.uid), { backtestHistory: next }, { merge: true }).catch(() => {});
      }
      return next;
    });
  }, [user]);

  const runBacktestFor = async (t, s = strategy, tf = timeframe) => {
    if (isMLStrategy(s) && !isUserPro) {
      setShowProGate(true);
      setData(null);
      setError(null);
      return;
    }
    setShowProGate(false);
    setLoading(true);
    setError(null);
    setData(null);
    setMlLoadingStep(0);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

    // For ML strategies, cycle through loading steps to set expectations
    let stepInterval = null;
    if (isMLStrategy(s)) {
      stepInterval = setInterval(() => {
        setMlLoadingStep(prev => Math.min(prev + 1, 2));
      }, 2500);
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://quantworld-backend.onrender.com"}/backtest?ticker=${t}&strategy=${s}&timeframe=${tf}`);
      const result = await response.json();
      setData(result);
      saveHistory(t, s, tf, result);
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.");
    }

    if (stepInterval) clearInterval(stepInterval);
    setLoading(false);
  };

  const runBacktest = () => runBacktestFor(ticker, strategy, timeframe);

  const fmt = (val, type) => {
    if (val === undefined || val === null || (typeof val === "number" && isNaN(val))) return "-";
    if (type === "pct") return (val * 100).toFixed(2) + "%";
    if (type === "ratio") return Number(val).toFixed(2);
    return val;
  };

  const strategyName = strategy === "rsi" ? "RSI Strategy" : strategy === "bollinger" ? "Bollinger Bands" : strategy === "macd" ? "MACD Strategy" : strategy === "logistic_regression" ? "Logistic Regression" : strategy === "random_forest" ? "Random Forest" : "MA Strategy";

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Fixed loading toast — visible immediately without scrolling */}
      {loading && (
        <div style={{ position: "fixed", top: 76, left: "50%", transform: "translateX(-50%)", zIndex: 500, background: isMLStrategy(strategy) ? "#7c3aed" : "#0284c7", borderRadius: 100, padding: "10px 22px", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 28px ${isMLStrategy(strategy) ? "rgba(124,58,237,0.45)" : "rgba(2,132,199,0.45)"}`, animation: "fadeIn 0.25s ease", pointerEvents: "none" }}>
          <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.75s linear infinite", flexShrink: 0 }} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
            {isMLStrategy(strategy)
              ? ["Engineering features…", "Training model…", "Generating predictions…"][mlLoadingStep]
              : `Fetching ${ticker} data…`}
          </span>
        </div>
      )}

      <Navbar />

      {/* Page Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: isMobile ? "24px 20px 20px" : "40px 48px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></div>
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live market data</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 8 }}>Strategy Backtester</h1>
          <p style={{ color: "#64748b", fontSize: isMobile ? 14 : 16 }}>Test any trading strategy against real historical data. See exactly how it would have performed.</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: isMobile ? "20px 20px" : "20px 48px", background: "#0f172a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 16, alignItems: isMobile ? "flex-start" : "flex-end", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Ticker Symbol</label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && runBacktest()}
              placeholder="e.g. AAPL"
              style={{ padding: "12px 20px", fontSize: 18, fontWeight: 700, background: "#1e293b", border: "1.5px solid #334155", borderRadius: 10, outline: "none", color: "#fff", width: isMobile ? "100%" : 180 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Strategy</label>
            <select value={strategy} onChange={(e) => { setStrategy(e.target.value); if (!isMLStrategy(e.target.value)) setShowProGate(false); }} style={{ padding: "12px 20px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: 10, color: "#fff", fontSize: 15, width: isMobile ? "100%" : "auto", minWidth: isMobile ? "unset" : 260, outline: "none", cursor: "pointer" }}>
              <option value="ma_crossover">〽️ MA Crossover (20/50)</option>
              <option value="rsi">⚡ RSI Strategy (30/70)</option>
              <option value="bollinger">🎯 Bollinger Bands (20, 2σ)</option>
              <option value="macd">📉 MACD (12/26/9)</option>
              <option disabled>── Pro ML Strategies ──</option>
              <option value="logistic_regression">🤖 Logistic Regression (ML) ✦ Pro</option>
              <option value="random_forest">🌲 Random Forest (ML) ✦ Pro</option>
              <option disabled>📡 LSTM Neural Network — Coming Soon</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Period</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={{ padding: "12px 20px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: 10, color: "#fff", fontSize: 15, width: isMobile ? "100%" : "auto", minWidth: isMobile ? "unset" : 180, outline: "none", cursor: "pointer" }}>
              <option value="1y">1 Year</option>
              <option value="3y">3 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>

          <button onClick={runBacktest} style={{ padding: "12px 36px", fontSize: 16, fontWeight: 700, background: loading ? "#334155" : "#0ea5e9", color: loading ? "#64748b" : "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", width: isMobile ? "100%" : "auto" }}>
            {loading ? "Running..." : "Run Backtest →"}
          </button>
        </div>
      </div>

      {/* Dynamic Strategy Explanation */}
      <div style={{ borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 20px" : "32px 48px" }}>
          {strategy === "macd" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ background: "#10b981", borderRadius: 10, padding: "6px 16px" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>MACD (12/26/9)</span>
                </div>
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Momentum trend-following</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>📉</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>How it works</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Take two moving averages of a stock's price — a <strong style={{ color: "#10b981" }}>fast one (12 days)</strong> and a <strong style={{ color: "#10b981" }}>slow one (26 days)</strong> — and subtract one from the other. That gap is the MACD line. A separate <strong style={{ color: "#10b981" }}>signal line</strong> smooths it out. When MACD crosses above the signal line <strong style={{ color: "#22c55e" }}>and the histogram confirms</strong> — buy in. When it crosses below — sell and hold cash.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
                  <h4 style={{ color: "#22c55e", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Best conditions</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Trending markets where a stock is clearly moving in one direction for weeks at a time. MACD tends to react faster than a plain MA Crossover, making it better at catching momentum shifts early. Widely used by traders at every level.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                  <h4 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Limitation</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>In flat, choppy markets where prices bounce around without a clear direction, the two lines cross back and forth constantly — triggering lots of small trades that each lose a little. Same weakness as MA Crossover, just a faster version of it.</p>
                </div>
              </div>
            </div>
          ) : strategy === "bollinger" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ background: "#8b5cf6", borderRadius: 10, padding: "6px 16px" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bollinger Bands (20, 2σ)</span>
                </div>
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Volatility-based mean reversion</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>How it works</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Calculate a 20-day moving average and plot two bands <strong style={{ color: "#8b5cf6" }}>2 standard deviations</strong> above and below it. When price touches the lower band <strong style={{ color: "#22c55e" }}>while already bouncing upward and above the 100-day trend</strong> — buy in. When price touches the upper band — sell and hold cash.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
                  <h4 style={{ color: "#22c55e", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Best conditions</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Range-bound or mean-reverting markets. Works well when a stock oscillates around a stable average. The bands automatically widen during high volatility and narrow during calm periods — making them adaptive.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                  <h4 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Limitation</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>In strong trending markets, price can "walk the band" — hugging the upper band and continuing to rise for months. Selling every time price touches the upper band in a bull market means missing massive gains.</p>
                </div>
              </div>
            </div>
          ) : strategy === "ma_crossover" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ background: "#0ea5e9", borderRadius: 10, padding: "6px 16px" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>MA Crossover (20/50)</span>
                </div>
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Trend-following strategy</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>📈</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>How it works</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Calculate the 20-day and 50-day moving averages daily. When MA20 crosses <strong style={{ color: "#22c55e" }}>above</strong> MA50 with a small buffer — the stock is trending up with conviction, buy in. When MA20 drops <strong style={{ color: "#ef4444" }}>below</strong> MA50 — momentum is fading, sell and hold cash.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
                  <h4 style={{ color: "#22c55e", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Best conditions</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Trending markets with clear upswings and downswings. Protects well during bear markets and crashes by getting you out early. Used by institutional traders as a simple trend filter.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                  <h4 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Limitation</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Always lags — reacts after price moves happen, never before. In strong bull markets, buy & hold often wins because the strategy spends time in cash missing gains.</p>
                </div>
              </div>
            </div>
          ) : strategy === "logistic_regression" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 10, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>Logistic Regression</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fde68a", background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "2px 7px", letterSpacing: "0.06em" }}>PRO · ML</span>
                </div>
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Supervised machine learning</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🤖</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>How it works</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Instead of a fixed rule, the model is <strong style={{ color: "#a855f7" }}>trained on price history</strong>. It ingests RSI, MACD, Bollinger Band position, momentum, and MA ratios as features, then learns which combinations historically preceded a <strong style={{ color: "#a855f7" }}>higher price 5 days later</strong>. Positions are held a minimum of 5 days to avoid getting shaken out by short-term noise.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
                  <h4 style={{ color: "#22c55e", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Best conditions</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Works best when the market has <strong style={{ color: "#22c55e" }}>consistent statistical patterns</strong> that linear relationships can capture — steady trends or mean-reverting stocks. Logistic Regression is fast, interpretable, and avoids overfitting better than more complex models on limited data.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                  <h4 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Limitation</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Assumes the future looks like the past. In regime changes — market crashes, sudden macro shifts — patterns the model learned break down. It also assumes <strong style={{ color: "#f59e0b" }}>linear relationships</strong> between features, which may miss complex non-linear dynamics in volatile stocks.</p>
                </div>
              </div>
            </div>
          ) : strategy === "random_forest" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", borderRadius: 10, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>Random Forest</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fde68a", background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "2px 7px", letterSpacing: "0.06em" }}>PRO · ML</span>
                </div>
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Ensemble machine learning</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🌲</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>How it works</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Builds <strong style={{ color: "#22c55e" }}>100 decision trees</strong>, each trained on a random subset of features and data. Each tree votes on whether the stock will be <strong style={{ color: "#22c55e" }}>higher in 5 days</strong>. The majority wins. Positions are held a minimum of 5 days — preventing the model from exiting winners on 1-day dips. Captures non-linear patterns no single rule can.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
                  <h4 style={{ color: "#22c55e", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Best conditions</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Shines in complex, noisy markets where no single indicator tells the full story. Random Forest can discover interactions between RSI, momentum, and volume that are invisible to human analysis. Generally more robust than Logistic Regression on stocks with non-linear price dynamics.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                  <h4 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Limitation</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>More prone to <strong style={{ color: "#f59e0b" }}>overfitting</strong> on short datasets — the model can memorize past patterns that don't repeat. A 1-year backtest gives relatively few training samples for 100 trees. Results are more reliable with 3–5 years of data. Also slower to run than rule-based strategies.</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ background: "#f59e0b", borderRadius: 10, padding: "6px 16px" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>RSI Strategy (30/70)</span>
                </div>
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Mean-reversion strategy</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🔄</div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>How it works</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>RSI measures price momentum on a scale of 0-100. When RSI drops below <strong style={{ color: "#22c55e" }}>30 and the stock is above its 100-day trend</strong> — oversold in an uptrend, high-quality buy signal. When RSI rises above <strong style={{ color: "#ef4444" }}>70</strong> — overbought, sell and hold cash.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
                  <h4 style={{ color: "#22c55e", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Best conditions</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Range-bound or volatile markets where stocks oscillate up and down. Buys during panic selloffs and sells into rallies. Used by swing traders and contrarian investors worldwide.</p>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                  <h4 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Limitation</h4>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>In strong trends, RSI can stay above 70 or below 30 for months. A stock can be "overbought" and keep rising — RSI doesn't predict when a reversal will happen, only that momentum is extreme.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div ref={resultsRef} style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 20px" : "40px 48px" }}>

        {/* Empty state */}
        {!data && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
              <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>📊</div>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Ready to backtest</h3>
                <p style={{ color: "#64748b", fontSize: 16, lineHeight: 1.7 }}>Enter any ticker symbol above and click Run Backtest to see a full analysis with plain English explanations of every metric.</p>
              </div>
              <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 36 }}>
                <h3 style={{ color: "#0ea5e9", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>How this strategy works</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { num: "1", text: "Calculate the 20-day and 50-day moving averages every day" },
                    { num: "2", text: "When MA20 crosses above MA50 — stock is trending up, buy in" },
                    { num: "3", text: "When MA20 drops below MA50 — momentum fading, sell and hold cash" },
                    { num: "4", text: "Compare result against simply holding the stock all year" },
                  ].map((s) => (
                    <div key={s.num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{s.num}</div>
                      <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Your History */}
            {history.length > 0 && <BacktestHistory history={history} onRerun={(h) => { setTicker(h.ticker); setStrategy(h.strategy); setTimeframe(h.timeframe); setTimeout(() => runBacktestFor(h.ticker, h.strategy, h.timeframe), 50); }} />}
          </div>
        )}

        {/* Pro Gate */}
        {showProGate && !loading && (
          <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 20, padding: isMobile ? 32 : 56, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✦</div>
            <h3 style={{ color: "#f59e0b", fontWeight: 800, fontSize: 24, marginBottom: 12, letterSpacing: -0.5 }}>Pro Feature</h3>
            <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 8px" }}>
              ML strategies use real machine learning models trained on historical price data — a step up from rule-based indicators.
            </p>
            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, maxWidth: 440, margin: "0 auto 32px" }}>
              The model learns patterns from the first 80% of the data, then generates signals for the remaining period — just like a quant fund would test a new strategy.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setShowAuth(true); setShowProGate(false); }} style={{ padding: "12px 28px", background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Sign in to upgrade →
              </button>
              <button onClick={() => { setStrategy("ma_crossover"); setShowProGate(false); }} style={{ padding: "12px 28px", background: "transparent", color: "#64748b", border: "1px solid #334155", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Back to free strategies
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 80, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "4px solid #334155", borderTop: isMLStrategy(strategy) ? "4px solid #a855f7" : "4px solid #0ea5e9", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }}></div>
            {isMLStrategy(strategy) ? (
              <>
                <p style={{ color: "#a855f7", fontSize: 17, fontWeight: 600 }}>
                  {["📊 Engineering features from price history...", "🤖 Training model on 80% of data...", "🔮 Generating predictions on full dataset..."][mlLoadingStep]}
                </p>
                <p style={{ color: "#475569", fontSize: 13, marginTop: 10, maxWidth: 400, margin: "10px auto 0" }}>
                  ML strategies take 15–30 seconds — the model is actually learning from {ticker}'s historical price patterns before making any predictions. This is real machine learning, not just a formula.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                  {["Features", "Training", "Predicting"].map((step, i) => (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: i <= mlLoadingStep ? "#a855f7" : "#334155", transition: "background 0.5s" }}></div>
                      <span style={{ fontSize: 11, color: i <= mlLoadingStep ? "#a855f7" : "#475569", fontWeight: i <= mlLoadingStep ? 700 : 400 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "#64748b", fontSize: 17 }}>Fetching market data for {ticker}...</p>
                <p style={{ color: "#334155", fontSize: 13, marginTop: 8 }}>First load for a new ticker may take up to 30 seconds while we pull historical data from Yahoo Finance.</p>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#1e293b", border: "1px solid #ef4444", borderRadius: 20, padding: 24 }}>
            <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 16 }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {data && data.strategy_metrics && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>

            {/* Enrich chart_data with client-side drawdown fallback (handles old cached responses) */}
            {(() => {
              let mPeak = -Infinity, sPeak = -Infinity;
              data.chart_data.forEach(d => {
                mPeak = Math.max(mPeak, d.market);
                sPeak = Math.max(sPeak, d.strategy);
                if (d.market_dd === undefined) d.market_dd = parseFloat(((d.market / mPeak - 1) * 100).toFixed(2));
                if (d.strategy_dd === undefined) d.strategy_dd = parseFloat(((d.strategy / sPeak - 1) * 100).toFixed(2));
              });
              return null;
            })()}

            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, color: "#fff", letterSpacing: -1.5, marginBottom: 8 }}>Results for {data.ticker}</h2>
              <p style={{ color: "#64748b", fontSize: 16 }}>{strategyName} vs Buy & Hold · Past {data.timeframe === "3y" ? "3 years" : data.timeframe === "5y" ? "5 years" : "12 months"}</p>
            </div>

            {/* Scorecard — side-by-side comparison, no winners declared */}
            {(() => {
              // Compute Sortino client-side (standard formula: MAR=0) as fallback when backend omits it
              const computeSortino = (field) => {
                const cd = data.chart_data;
                if (!cd || cd.length < 20) return null;
                const rets = [];
                for (let i = 1; i < cd.length; i++) {
                  const p = cd[i-1][field], c = cd[i][field];
                  if (p > 0 && c > 0) rets.push(c / p - 1);
                }
                if (rets.length < 20) return null;
                const mean = rets.reduce((a,b) => a+b, 0) / rets.length;
                // downside deviation: penalise only negative returns, averaged over all N days
                const dsVar = rets.reduce((a, r) => a + Math.pow(Math.min(r, 0), 2), 0) / rets.length;
                const dsDev = Math.sqrt(dsVar) * Math.sqrt(252);
                if (dsDev === 0) return null;
                return (mean * 252) / dsDev;
              };
              const mSortino = (data.market.sortino_ratio != null && data.market.sortino_ratio !== 0) ? data.market.sortino_ratio : computeSortino("market");
              const sSortino = (data.strategy_metrics.sortino_ratio != null && data.strategy_metrics.sortino_ratio !== 0) ? data.strategy_metrics.sortino_ratio : computeSortino("strategy");

              const metrics = [
                { label: "Total Return", mVal: data.market.total_return, sVal: data.strategy_metrics.total_return, fmt: "pct", lowerBetter: false, explain: "How much $1 grew over the whole period. Shaded cash periods earn 4%/yr." },
                { label: "Ann. Return", mVal: data.market.annualized_return, sVal: data.strategy_metrics.annualized_return, fmt: "pct", lowerBetter: false, explain: "Yearly compounded return. Normalises different timeframes." },
                { label: "Volatility", mVal: data.market.volatility, sVal: data.strategy_metrics.volatility, fmt: "pct", lowerBetter: true, explain: "Annualised daily swings. Lower = smoother, less stressful." },
                { label: "Max Drawdown", mVal: data.market.max_drawdown, sVal: data.strategy_metrics.max_drawdown, fmt: "pct", lowerBetter: true, explain: "Worst peak-to-trough loss. Closer to 0% = better capital protection.", absCompare: true },
                { label: "Sharpe Ratio", mVal: data.market.sharpe_ratio, sVal: data.strategy_metrics.sharpe_ratio, fmt: "ratio", lowerBetter: false, explain: "Return ÷ total risk. Higher = more return per unit of risk." },
                { label: "Sortino Ratio", mVal: mSortino, sVal: sSortino, fmt: "ratio", lowerBetter: false, explain: "Like Sharpe, but only penalises downside swings — not gains." },
              ];

              const isBullRun = data.market.total_return > 0.25;
              const strategyWonReturn = data.strategy_metrics.total_return > data.market.total_return;
              const showBullWarning = isBullRun && !strategyWonReturn;
              const hasCashPeriods = data.chart_data.some(d => d.in_cash);

              return (
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: isMobile ? 20 : 32, marginBottom: 28 }}>

                  {/* Verdict banner — one of three outcomes */}
                  {strategyWonReturn ? (
                    <div style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", border: "1.5px solid rgba(34,197,94,0.45)", borderRadius: 16, padding: "22px 28px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 28 }}>🏆</span>
                        <div>
                          <div style={{ fontSize: 19, fontWeight: 900, color: "#22c55e", letterSpacing: -0.3 }}>Strategy beat buy & hold</div>
                          <div style={{ fontSize: 13, color: "#86efac", marginTop: 2 }}>
                            <strong style={{ color: "#4ade80" }}>{fmt(data.strategy_metrics.total_return, "pct")}</strong> vs <strong style={{ color: "#38bdf8" }}>{fmt(data.market.total_return, "pct")}</strong> — edge of <strong style={{ color: "#4ade80" }}>+{fmt(data.strategy_metrics.total_return - data.market.total_return, "pct")}</strong>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                        {strategyName} identified patterns in {data.ticker}'s price history that a passive investor would have missed. Check the Sharpe and drawdown numbers below to see if the risk-adjusted picture is equally strong.
                      </p>
                    </div>
                  ) : showBullWarning ? (
                    <div style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))", border: "1.5px solid rgba(245,158,11,0.5)", borderRadius: 16, padding: "22px 28px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 28 }}>📈</span>
                        <div>
                          <div style={{ fontSize: 19, fontWeight: 900, color: "#f59e0b", letterSpacing: -0.3 }}>Buy & hold won — strong bull market</div>
                          <div style={{ fontSize: 13, color: "#fcd34d", marginTop: 2 }}>
                            Market returned <strong style={{ color: "#fbbf24" }}>{fmt(data.market.total_return, "pct")}</strong> vs strategy's <strong style={{ color: "#94a3b8" }}>{fmt(data.strategy_metrics.total_return, "pct")}</strong>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                        In a sustained uptrend, any time spent in cash is a missed gain. Strategies show their real value during corrections and crashes — try a <strong style={{ color: "#f59e0b" }}>3–5 year window</strong> that includes a downturn for a fairer test.
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(239,68,68,0.13), rgba(239,68,68,0.04))", border: "1.5px solid rgba(239,68,68,0.4)", borderRadius: 16, padding: "22px 28px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 28 }}>📉</span>
                        <div>
                          <div style={{ fontSize: 19, fontWeight: 900, color: "#f87171", letterSpacing: -0.3 }}>Buy & hold outperformed this strategy</div>
                          <div style={{ fontSize: 13, color: "#fca5a5", marginTop: 2 }}>
                            Strategy returned <strong style={{ color: "#fca5a5" }}>{fmt(data.strategy_metrics.total_return, "pct")}</strong> vs market's <strong style={{ color: "#38bdf8" }}>{fmt(data.market.total_return, "pct")}</strong>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                        This strategy didn't beat passive investing over this period — but check the <strong style={{ color: "#e2e8f0" }}>drawdown and volatility</strong> rows below. A lower max drawdown can still make a strategy worth using if you can't stomach large losses.
                      </p>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: 0 }}>Performance Breakdown</h3>
                    {hasCashPeriods && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "6px 12px" }}>
                        <span style={{ fontSize: 13 }}>💵</span>
                        <span style={{ fontSize: 12, color: "#86efac", fontWeight: 600 }}>Cash periods earn 4%/yr</span>
                      </div>
                    )}
                  </div>

                  {/* Header row */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 4, padding: "0 8px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>Metric</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Buy & Hold</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>{strategyName}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {metrics.map((m) => {
                      const mBetter = m.absCompare ? Math.abs(m.mVal) < Math.abs(m.sVal) : m.lowerBetter ? m.mVal < m.sVal : m.mVal > m.sVal;
                      const sBetter = m.absCompare ? Math.abs(m.sVal) < Math.abs(m.mVal) : m.lowerBetter ? m.sVal < m.mVal : m.sVal > m.mVal;
                      return (
                        <div key={m.label} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, padding: "14px 8px", borderBottom: "1px solid #0f172a", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>{m.label}</div>
                            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{m.explain}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: mBetter ? "#38bdf8" : "#64748b" }}>{fmt(m.mVal, m.fmt)}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: sBetter ? "#4ade80" : "#64748b" }}>{fmt(m.sVal, m.fmt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Chart — Growth of $1 */}
            {(() => {
              const cashRegions = [];
              let start = null;
              data.chart_data.forEach((d, i) => {
                if (d.in_cash && start === null) start = d.date;
                if (!d.in_cash && start !== null) {
                  cashRegions.push({ x1: start, x2: data.chart_data[i - 1]?.date || d.date });
                  start = null;
                }
              });
              if (start !== null) cashRegions.push({ x1: start, x2: data.chart_data[data.chart_data.length - 1].date });
              const endMarket = data.chart_data[data.chart_data.length - 1]?.market ?? 1;
              const endStrategy = data.chart_data[data.chart_data.length - 1]?.strategy ?? 1;
              return (
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: isMobile ? 20 : 36, marginBottom: 28 }}>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12 }}>
                    <div>
                      <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 6, fontSize: 22 }}>Growth of $1 Invested</h3>
                      <p style={{ color: "#64748b", fontSize: 14 }}>If you invested $1 at the start, this is what each approach turned it into. Shaded areas = strategy in cash earning 4%/yr.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 14, height: 3, background: "#0ea5e9", borderRadius: 2 }}></div>
                          <span style={{ fontSize: 12, color: "#64748b" }}>Buy & Hold</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0ea5e9" }}>${endMarket.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 14, height: 3, background: "#22c55e", borderRadius: 2 }}></div>
                          <span style={{ fontSize: 12, color: "#64748b" }}>{strategyName.split(" ")[0]}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>${endStrategy.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
                    <LineChart data={data.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#475569" }} tickFormatter={(d) => d.slice(5)} />
                      <YAxis tick={{ fontSize: 12, fill: "#475569" }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                      <Tooltip
                        contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10 }}
                        labelStyle={{ color: "#94a3b8", fontSize: 13 }}
                        formatter={(value, name) => [`$${value.toFixed(3)}`, name === "market" ? "Buy & Hold" : strategyName]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      {cashRegions.map((r, i) => (
                        <ReferenceArea key={i} x1={r.x1} x2={r.x2} fill="rgba(100,116,139,0.12)" strokeOpacity={0} />
                      ))}
                      <Line type="monotone" dataKey="market" stroke="#0ea5e9" dot={false} strokeWidth={2.5} />
                      <Line type="monotone" dataKey="strategy" stroke="#22c55e" dot={false} strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            {/* Key Takeaway */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 4, height: 32, background: "#0ea5e9", borderRadius: 2 }}></div>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 24, margin: 0, letterSpacing: -0.5 }}>Key Takeaway</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", border: "1px solid #0ea5e9", borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.04 }}>📊</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>What happened</div>
                  <p style={{ color: "#e2e8f0", fontSize: 17, lineHeight: 1.9, margin: 0, position: "relative", zIndex: 1 }}>
                    {strategyName} returned <strong style={{ color: "#22c55e", fontSize: 19 }}>{fmt(data.strategy_metrics.total_return, "pct")}</strong> vs buy & hold's <strong style={{ color: "#0ea5e9", fontSize: 19 }}>{fmt(data.market.total_return, "pct")}</strong>.
                    {" "}The strategy's volatility was <strong style={{ color: data.strategy_metrics.volatility < data.market.volatility ? "#22c55e" : "#f59e0b" }}>{fmt(data.strategy_metrics.volatility, "pct")}</strong> vs buy & hold's <strong style={{ color: "#0ea5e9" }}>{fmt(data.market.volatility, "pct")}</strong> —
                    {data.strategy_metrics.volatility < data.market.volatility
                      ? <strong style={{ color: "#22c55e" }}> a smoother, less stressful ride</strong>
                      : <span> similar volatility profiles this period</span>
                    }.
                    {" "}
                    {data.market.total_return > 0.25
                      ? "In bull markets, buy & hold is hard to beat on raw returns. Strategies protect you when things go wrong — test a longer or more volatile period to see that in action."
                      : data.strategy_metrics.total_return > data.market.total_return
                        ? "The strategy successfully timed its exits and entries to outperform this period."
                        : "Strategies tend to shine during corrections and bear markets — periods where sitting out actually protects capital."
                    }
                  </p>
                </div>
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Volatility profile</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>Buy & Hold</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#0ea5e9" }}>{fmt(data.market.volatility, "pct")}</span>
                      </div>
                      <div style={{ height: 6, background: "#0f172a", borderRadius: 3 }}>
                        <div style={{ height: 6, background: "#0ea5e9", borderRadius: 3, width: `${Math.min(data.market.volatility * 200, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{strategyName.split(" ")[0]}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#22c55e" }}>{fmt(data.strategy_metrics.volatility, "pct")}</span>
                      </div>
                      <div style={{ height: 6, background: "#0f172a", borderRadius: 3 }}>
                        <div style={{ height: 6, background: "#22c55e", borderRadius: 3, width: `${Math.min(data.strategy_metrics.volatility * 200, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.6, margin: "16px 0 0" }}>
                    {data.strategy_metrics.volatility < data.market.volatility
                      ? `Strategy swings ${((1 - data.strategy_metrics.volatility / data.market.volatility) * 100).toFixed(0)}% less than buy & hold — the cash periods are doing their job.`
                      : "Similar volatility — the strategy stayed invested through most of this period."
                    }
                  </p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 28 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>What to learn</div>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>No strategy wins in all conditions. The best quant traders look for strategies with strong <strong style={{ color: "#fff" }}>risk-adjusted returns</strong> across many market environments — not strategies that always maximize profit.</p>
                </div>
                <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 28 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⚖️</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Risk efficiency</div>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                    {data.strategy_metrics.sharpe_ratio > data.market.sharpe_ratio
                      ? <span>The strategy's Sharpe of <strong style={{ color: "#22c55e" }}>{fmt(data.strategy_metrics.sharpe_ratio, "ratio")}</strong> beats the market's <strong style={{ color: "#fff" }}>{fmt(data.market.sharpe_ratio, "ratio")}</strong> — more return per unit of risk. This is the metric professional quant funds care about most.</span>
                      : <span>The market's Sharpe of <strong style={{ color: "#0ea5e9" }}>{fmt(data.market.sharpe_ratio, "ratio")}</strong> beats the strategy's <strong style={{ color: "#fff" }}>{fmt(data.strategy_metrics.sharpe_ratio, "ratio")}</strong> — buy & hold was more risk-efficient this period.</span>
                    }
                  </p>
                </div>
                <div style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", borderRadius: 20, padding: 28 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Try next</div>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                    {strategy === "logistic_regression"
                      ? "Compare against Random Forest on the same ticker — it captures non-linear patterns. Extend to 3 or 5 years to give the model more training data and more reliable signals."
                      : strategy === "random_forest"
                      ? "Compare against Logistic Regression to see if the non-linear power helps. Try SPY for a more stable training set, or TSLA for a high-volatility challenge."
                      : strategy === "bollinger"
                      ? "Try RSI or MACD on the same ticker. Feeling ambitious? Upgrade to Pro and try the ML strategies to see how a trained model compares."
                      : strategy === "rsi"
                      ? "Switch to MACD to compare a faster trend-following approach. Upgrade to Pro to run Logistic Regression or Random Forest on the same ticker."
                      : strategy === "macd"
                      ? "Switch to RSI or Bollinger Bands to compare mean-reversion approaches. Upgrade to Pro to see how ML strategies handle the same conditions."
                      : "Switch to MACD or RSI to compare momentum and mean-reversion. Upgrade to Pro to test ML strategies — they learn directly from this ticker's history."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Backtest;