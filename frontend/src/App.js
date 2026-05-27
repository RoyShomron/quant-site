import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function App() {
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
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 32, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 4 }}>QuantWorld</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Enter a stock ticker and see how a simple moving average strategy performs vs just holding the stock.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="e.g. AAPL"
          style={{ padding: 10, fontSize: 16, width: 150, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          onClick={runBacktest}
          style={{ padding: "10px 24px", fontSize: 16, background: "#2563eb", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          {loading ? "Running..." : "Run Backtest"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h2 style={{ marginBottom: 24 }}>Results for {data.ticker}</h2>

          {/* Chart */}
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 24, marginBottom: 32 }}>
            <h3 style={{ marginBottom: 4 }}>Growth of $1 Invested</h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
              This chart shows how $1 invested at the start of the year would have grown under each approach.
              A higher line means better performance.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${v.toFixed(2)}`}
                />
                <Tooltip
                  formatter={(value, name) => [`$${value.toFixed(4)}`, name === "market" ? "Buy & Hold" : "MA Strategy"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend formatter={(value) => value === "market" ? "Buy & Hold" : "MA Strategy"} />
                <Line type="monotone" dataKey="market" stroke="#2563eb" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="strategy" stroke="#16a34a" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics Table */}
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Performance Metrics</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#e2e8f0" }}>
                  <th style={th}>Metric</th>
                  <th style={th}>Buy & Hold</th>
                  <th style={th}>MA Strategy</th>
                  <th style={th}>What does this mean?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}>Total Return</td>
                  <td style={td}>{fmt(data.market.total_return, "pct")}</td>
                  <td style={td}>{fmt(data.strategy.total_return, "pct")}</td>
                  <td style={td}>How much your $1 grew over the year</td>
                </tr>
                <tr style={{ background: "#f1f5f9" }}>
                  <td style={td}>Annualized Return</td>
                  <td style={td}>{fmt(data.market.annualized_return, "pct")}</td>
                  <td style={td}>{fmt(data.strategy.annualized_return, "pct")}</td>
                  <td style={td}>Your return scaled to a full year</td>
                </tr>
                <tr>
                  <td style={td}>Volatility</td>
                  <td style={td}>{fmt(data.market.volatility, "pct")}</td>
                  <td style={td}>{fmt(data.strategy.volatility, "pct")}</td>
                  <td style={td}>How much the price swings — higher means riskier</td>
                </tr>
                <tr style={{ background: "#f1f5f9" }}>
                  <td style={td}>Sharpe Ratio</td>
                  <td style={td}>{fmt(data.market.sharpe_ratio, "ratio")}</td>
                  <td style={td}>{fmt(data.strategy.sharpe_ratio, "ratio")}</td>
                  <td style={td}>Return earned per unit of risk. Higher is better</td>
                </tr>
                <tr>
                  <td style={td}>Max Drawdown</td>
                  <td style={td}>{fmt(data.market.max_drawdown, "pct")}</td>
                  <td style={td}>{fmt(data.strategy.max_drawdown, "pct")}</td>
                  <td style={td}>The worst peak-to-bottom drop you would have experienced</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #cbd5e1" };
const td = { padding: "10px 14px", borderBottom: "1px solid #e2e8f0" };

export default App;