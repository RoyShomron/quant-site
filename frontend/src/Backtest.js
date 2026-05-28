import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function Backtest() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState("SPY");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://quantworld-backend.onrender.com/backtest?ticker=SPY`).catch(() => {});
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("ticker");
    if (t) {
      setTicker(t);
      runBacktestFor(t);
    }
  }, []);

  const runBacktestFor = async (t) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://quantworld-backend.onrender.com/backtest?ticker=${t}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.");
    }
    setLoading(false);
  };

  const runBacktest = () => runBacktestFor(ticker);

  const fmt = (val, type) => {
    if (val === undefined || val === null) return "-";
    if (type === "pct") return (val * 100).toFixed(2) + "%";
    if (type === "ratio") return val.toFixed(2);
    return val;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e293b", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span onClick={() => navigate("/")} style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, cursor: "pointer" }}>
          <span style={{ color: "#0ea5e9", fontSize: 42, fontFamily: "Georgia, serif", verticalAlign: "bottom", lineHeight: 1 }}>Q</span>
          <span style={{ color: "#fff" }}>uantWorld</span>
        </span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span onClick={() => navigate("/")} style={{ color: "#64748b", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Home</span>
          <span style={{ color: "#0ea5e9", fontSize: 14, fontWeight: 600 }}>Backtest</span>
        </div>
      </nav>

      {/* Page Header */}
      <div style={{ background: "linear-gradient(180deg, #0f172a 0%, #0f172a 100%)", borderBottom: "1px solid #1e293b", padding: "40px 48px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></div>
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live market data</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 8 }}>Strategy Backtester</h1>
          <p style={{ color: "#64748b", fontSize: 16 }}>Test any trading strategy against real historical data. See exactly how it would have performed.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 48px", display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>

        {/* Left Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Controls Card */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Configure Backtest</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Ticker Symbol</label>
                <input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && runBacktest()}
                  placeholder="e.g. AAPL"
                  style={{ width: "100%", padding: "12px 16px", fontSize: 16, fontWeight: 700, background: "#0f172a", border: "1.5px solid #334155", borderRadius: 10, outline: "none", color: "#fff", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Strategy</label>
                <div style={{ padding: "12px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 10, color: "#94a3b8", fontSize: 14 }}>
                  MA Crossover (20/50) — more coming soon
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Time Period</label>
                <div style={{ padding: "12px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 10, color: "#94a3b8", fontSize: 14 }}>
                  1 Year — more coming soon
                </div>
              </div>
              <button
                onClick={runBacktest}
                style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, background: loading ? "#334155" : "#0ea5e9", color: loading ? "#64748b" : "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", marginTop: 4 }}
              >
                {loading ? "Running..." : "Run Backtest →"}
              </button>
            </div>
          </div>

          {/* Strategy Explanation Card */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: "#0ea5e9", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>How this strategy works</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { num: "1", text: "Calculate the 20-day and 50-day moving averages every day" },
                { num: "2", text: "When MA20 crosses above MA50 — stock is trending up, buy in" },
                { num: "3", text: "When MA20 drops below MA50 — momentum fading, sell and sit in cash" },
                { num: "4", text: "Compare result against simply holding the stock all year" },
              ].map((s) => (
                <div key={s.num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: 1 }}>{s.num}</div>
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "#0f172a", borderRadius: 8, border: "1px solid #334155" }}>
              <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                💡 In strong bull markets, buy & hold often wins. The MA strategy shines in volatile or bear markets by getting you out before big drops.
              </p>
            </div>
          </div>
        </div>
        {/* Right — Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {!data && !loading && !error && (
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 64, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Ready to backtest</h3>
              <p style={{ color: "#64748b", fontSize: 15 }}>Enter a ticker symbol on the left and click Run Backtest to see results.</p>
            </div>
          )}

          {loading && (
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 64, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #334155", borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}></div>
              <p style={{ color: "#64748b", fontSize: 15 }}>Fetching market data for {ticker}...</p>
            </div>
          )}

          {error && (
            <div style={{ background: "#1e293b", border: "1px solid #ef4444", borderRadius: 16, padding: 24 }}>
              <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {data && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>

              {/* Results Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginBottom: 4 }}>Results for {data.ticker}</h2>
                  <p style={{ color: "#64748b", fontSize: 14 }}>MA Crossover (20/50) vs Buy & Hold · Past 12 months</p>
                </div>
              </div>

              {/* Dynamic Insights */}
              <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, background: "#0ea5e9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💡</div>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>What do your results mean?</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Winner */}
                  <div style={{ padding: 16, background: "#0f172a", borderRadius: 12, border: `1px solid ${data.strategy.total_return > data.market.total_return ? "#22c55e" : "#0ea5e9"}` }}>
                    <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      {data.strategy.total_return > data.market.total_return
                        ? <span>🏆 <strong style={{ color: "#22c55e" }}>The MA strategy won this time.</strong> It returned <strong style={{ color: "#22c55e" }}>{fmt(data.strategy.total_return, "pct")}</strong> vs buy & hold's <strong style={{ color: "#fff" }}>{fmt(data.market.total_return, "pct")}</strong>. This usually happens in volatile or choppy markets where the strategy successfully avoided some downturns.</span>
                        : <span>📈 <strong style={{ color: "#0ea5e9" }}>Buy & hold won this time.</strong> It returned <strong style={{ color: "#0ea5e9" }}>{fmt(data.market.total_return, "pct")}</strong> vs the strategy's <strong style={{ color: "#fff" }}>{fmt(data.strategy.total_return, "pct")}</strong>. This is common in strong bull markets — the stock trended upward so consistently that sitting in cash during crossover signals cost more than it saved.</span>
                      }
                    </p>
                  </div>

                  {/* Sharpe interpretation */}
                  <div style={{ padding: 16, background: "#0f172a", borderRadius: 12, border: "1px solid #334155" }}>
                    <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      📊 <strong style={{ color: "#fff" }}>Risk-adjusted performance:</strong> The market's Sharpe ratio was <strong style={{ color: "#0ea5e9" }}>{fmt(data.market.sharpe_ratio, "ratio")}</strong>
                      {data.market.sharpe_ratio > 1.5
                        ? " — excellent. You were rewarded well for the risk you took."
                        : data.market.sharpe_ratio > 1
                        ? " — good. Returns were solid relative to the volatility."
                        : data.market.sharpe_ratio > 0
                        ? " — below 1, meaning the returns didn't fully compensate for the risk involved."
                        : " — negative, meaning the investment lost money on a risk-adjusted basis."
                      }
                      {" "}The strategy's Sharpe was <strong style={{ color: "#fff" }}>{fmt(data.strategy.sharpe_ratio, "ratio")}</strong>
                      {data.strategy.sharpe_ratio > data.market.sharpe_ratio
                        ? " — actually better than buy & hold, meaning the strategy was more efficient with risk even if total returns were lower."
                        : " — lower than buy & hold."
                      }
                    </p>
                  </div>

                  {/* Drawdown interpretation */}
                  <div style={{ padding: 16, background: "#0f172a", borderRadius: 12, border: "1px solid #334155" }}>
                    <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      📉 <strong style={{ color: "#fff" }}>Worst case scenario:</strong> If you had bought and held, the worst drop you would have experienced was <strong style={{ color: "#ef4444" }}>{fmt(data.market.max_drawdown, "pct")}</strong>. 
                      {Math.abs(data.market.max_drawdown) > 0.2
                        ? " That's a significant drawdown — watching your portfolio drop that much is psychologically very difficult for most investors."
                        : Math.abs(data.market.max_drawdown) > 0.1
                        ? " That's a moderate drawdown — uncomfortable but manageable for most long-term investors."
                        : " That's a relatively mild drawdown — this stock had a fairly smooth ride this year."
                      }
                      {" "}The strategy's worst drop was <strong style={{ color: "#ef4444" }}>{fmt(data.strategy.max_drawdown, "pct")}</strong>
                      {Math.abs(data.strategy.max_drawdown) < Math.abs(data.market.max_drawdown)
                        ? " — smaller than buy & hold, meaning the strategy protected you better during the worst periods."
                        : " — actually larger, meaning the strategy's timing didn't help during downturns this period."
                      }
                    </p>
                  </div>

                  {/* Volatility interpretation */}
                  <div style={{ padding: 16, background: "#0f172a", borderRadius: 12, border: "1px solid #334155" }}>
                    <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      🎢 <strong style={{ color: "#fff" }}>How bumpy was the ride?</strong> Buy & hold had annualized volatility of <strong style={{ color: "#0ea5e9" }}>{fmt(data.market.volatility, "pct")}</strong>
                      {data.market.volatility > 0.3
                        ? " — very high. This stock moved around a lot, which means big gains but also big losses were possible."
                        : data.market.volatility > 0.2
                        ? " — moderately high. Expect significant day-to-day price swings."
                        : data.market.volatility > 0.1
                        ? " — moderate. Typical for a large-cap stock."
                        : " — low. This stock had a relatively stable price this year."
                      }
                      {" "}The strategy reduced volatility to <strong style={{ color: "#fff" }}>{fmt(data.strategy.volatility, "pct")}</strong> by sitting in cash during uncertain periods.
                    </p>
                  </div>

                </div>
              </div>

              {/* Metric Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                {[
                  { label: "Total Return", market: fmt(data.market.total_return, "pct"), strategy: fmt(data.strategy.total_return, "pct"), tip: "How much $1 grew over the year", marketVal: data.market.total_return, stratVal: data.strategy.total_return },
                  { label: "Annual Return", market: fmt(data.market.annualized_return, "pct"), strategy: fmt(data.strategy.annualized_return, "pct"), tip: "Return scaled to a full year", marketVal: data.market.annualized_return, stratVal: data.strategy.annualized_return },
                  { label: "Volatility", market: fmt(data.market.volatility, "pct"), strategy: fmt(data.strategy.volatility, "pct"), tip: "How much price swings — lower is smoother", marketVal: data.market.volatility, stratVal: data.strategy.volatility },
                  { label: "Sharpe Ratio", market: fmt(data.market.sharpe_ratio, "ratio"), strategy: fmt(data.strategy.sharpe_ratio, "ratio"), tip: "Return per unit of risk. Above 1 is good", marketVal: data.market.sharpe_ratio, stratVal: data.strategy.sharpe_ratio },
                  { label: "Max Drawdown", market: fmt(data.market.max_drawdown, "pct"), strategy: fmt(data.strategy.max_drawdown, "pct"), tip: "Worst peak-to-bottom drop", marketVal: data.market.max_drawdown, stratVal: data.strategy.max_drawdown },
                ].map((m) => (
                  <div key={m.label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "18px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>{m.label}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>Buy & Hold</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#0ea5e9" }}>{m.market}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>Strategy</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{m.strategy}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.5, borderTop: "1px solid #334155", paddingTop: 8 }}>{m.tip}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: "#fff", marginBottom: 4, fontSize: 17 }}>Growth of $1 Invested</h3>
                    <p style={{ color: "#64748b", fontSize: 13 }}>A higher line means better performance. Hover to see exact values.</p>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 3, background: "#0ea5e9", borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Buy & Hold</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 3, background: "#fff", borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>MA Strategy</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={data.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#475569" }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                      labelStyle={{ color: "#94a3b8", fontSize: 12 }}
                      formatter={(value, name) => [`$${value.toFixed(4)}`, name === "market" ? "Buy & Hold" : "MA Strategy"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line type="monotone" dataKey="market" stroke="#0ea5e9" dot={false} strokeWidth={2.5} />
                    <Line type="monotone" dataKey="strategy" stroke="#ffffff" dot={false} strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Backtest;