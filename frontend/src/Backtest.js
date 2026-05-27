import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Backtest() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState("SPY");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/backtest?ticker=${ticker}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.");
    }
    setLoading(false);
  };

  const fmt = (val, type) => {
    if (val === undefined || val === null) return "-";
    if (type === "pct") return (val * 100).toFixed(2) + "%";
    if (type === "ratio") return val.toFixed(2);
    return val;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #e0f2fe", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span onClick={() => navigate("/")} style={{ fontSize: 20, fontWeight: 700, color: "#0ea5e9", cursor: "pointer", letterSpacing: -0.5 }}>
          QuantWorld
        </span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span onClick={() => navigate("/")} style={{ color: "#64748b", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Home</span>
          <span style={{ color: "#0ea5e9", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Backtest</span>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Strategy Backtester</h1>
          <p style={{ color: "#64748b", fontSize: 16 }}>Enter any stock ticker and see how a moving average crossover strategy would have performed over the past year.</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e0f2fe", borderRadius: 16, padding: 28, marginBottom: 32, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ticker Symbol</label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              style={{ padding: "10px 16px", fontSize: 16, width: 160, border: "1.5px solid #e0f2fe", borderRadius: 10, outline: "none", fontWeight: 600, color: "#0f172a" }}
            />
          </div>
          <button
            onClick={runBacktest}
            style={{ padding: "11px 32px", fontSize: 15, fontWeight: 700, background: loading ? "#94a3b8" : "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}
          >
            {loading ? "Running..." : "Run Backtest →"}
          </button>
        </div>

        <div style={{ background: "#e0f2fe", borderRadius: 16, padding: 24, marginBottom: 32, borderLeft: "4px solid #0ea5e9" }}>
          <h3 style={{ color: "#0369a1", fontWeight: 700, marginBottom: 8, fontSize: 16 }}>How does this strategy work?</h3>
          <p style={{ color: "#0c4a6e", lineHeight: 1.7, marginBottom: 10, fontSize: 14 }}>
            This strategy uses two <strong>moving averages</strong> — the MA20 and MA50. A moving average takes the average closing price over the last 20 or 50 days, smoothing out noise so you can see the general trend.
          </p>
          <p style={{ color: "#0c4a6e", lineHeight: 1.7, marginBottom: 10, fontSize: 14 }}>
            <strong>The rule:</strong> when the 20-day average crosses above the 50-day average, the stock is trending up — buy in. When it drops back below — sell and sit in cash. This is called a <strong>moving average crossover</strong>.
          </p>
          <p style={{ color: "#0c4a6e", lineHeight: 1.7, fontSize: 14 }}>
            <strong>Buy & Hold</strong> is the baseline — you buy on day one and hold the whole year. Comparing the two shows whether active trading actually added value.
          </p>
        </div>

        {error && <p style={{ color: "#ef4444", marginBottom: 24, fontWeight: 500 }}>{error}</p>}

        {data && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 24 }}>Results for {data.ticker}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Return", market: fmt(data.market.total_return, "pct"), strategy: fmt(data.strategy.total_return, "pct"), tip: "How much $1 grew over the year" },
                { label: "Annual Return", market: fmt(data.market.annualized_return, "pct"), strategy: fmt(data.strategy.annualized_return, "pct"), tip: "Return scaled to a full year" },
                { label: "Volatility", market: fmt(data.market.volatility, "pct"), strategy: fmt(data.strategy.volatility, "pct"), tip: "How much price swings — lower is smoother" },
                { label: "Sharpe Ratio", market: fmt(data.market.sharpe_ratio, "ratio"), strategy: fmt(data.strategy.sharpe_ratio, "ratio"), tip: "Return per unit of risk. Above 1 is good" },
                { label: "Max Drawdown", market: fmt(data.market.max_drawdown, "pct"), strategy: fmt(data.strategy.max_drawdown, "pct"), tip: "Worst peak-to-bottom drop you'd have felt" },
              ].map((m) => (
                <div key={m.label} style={{ background: "#fff", border: "1px solid #e0f2fe", borderRadius: 14, padding: "18px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>{m.label}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Buy & Hold</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0ea5e9" }}>{m.market}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Strategy</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{m.strategy}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5, borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>{m.tip}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #e0f2fe", borderRadius: 16, padding: 28, marginBottom: 32 }}>
              <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4, fontSize: 17 }}>Growth of $1 Invested</h3>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>A higher line means better performance. Hover over the chart to see exact values.</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip formatter={(value, name) => [`$${value.toFixed(4)}`, name === "market" ? "Buy & Hold" : "MA Strategy"]} labelFormatter={(label) => `Date: ${label}`} />
                  <Legend formatter={(value) => value === "market" ? "Buy & Hold" : "MA Strategy"} />
                  <Line type="monotone" dataKey="market" stroke="#0ea5e9" dot={false} strokeWidth={2.5} />
                  <Line type="monotone" dataKey="strategy" stroke="#0f172a" dot={false} strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default Backtest;