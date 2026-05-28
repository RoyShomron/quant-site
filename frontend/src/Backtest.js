import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function MetricTabs({ data, fmt }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: "Total Return",
      icon: "💰",
      market: fmt(data.market.total_return, "pct"),
      strategy: fmt(data.strategy.total_return, "pct"),
      formula: "Total Return = (Final Value − Initial Value) / Initial Value",
      formulaSub: "= ($1 × (1 + r₁) × (1 + r₂) × ... × (1 + rₙ)) − 1",
      vars: [{ var: "r₁...rₙ", desc: "Each day's percentage price change" }],
      what: "The simplest performance metric — how much did your investment grow from start to finish?",
      result: "Buy & hold turned $1 into $" + (1 + data.market.total_return).toFixed(4) + ". The strategy turned $1 into $" + (1 + data.strategy.total_return).toFixed(4) + ". Total return alone doesn't tell you about risk — a strategy could have a high return but with terrifying volatility along the way.",
    },
    {
      label: "Sharpe Ratio",
      icon: "⚖️",
      market: fmt(data.market.sharpe_ratio, "ratio"),
      strategy: fmt(data.strategy.sharpe_ratio, "ratio"),
      formula: "Sharpe Ratio = (Rp − Rf) / σp",
      vars: [
        { var: "Rp", desc: "Portfolio return — annualized return of your investment" },
        { var: "Rf", desc: "Risk-free rate — return of US Treasury bills (we use 0%)" },
        { var: "σp", desc: "Portfolio standard deviation — annualized volatility of daily returns" },
      ],
      what: "How much return are you getting per unit of risk? The most widely used risk-adjusted metric in professional finance. Higher is always better.",
      result: (data.market.sharpe_ratio > 2 ? "The market's Sharpe of " + fmt(data.market.sharpe_ratio, "ratio") + " is excellent." : data.market.sharpe_ratio > 1 ? "The market's Sharpe of " + fmt(data.market.sharpe_ratio, "ratio") + " is good — solid risk-adjusted returns." : "The market's Sharpe of " + fmt(data.market.sharpe_ratio, "ratio") + " is below 1 — returns didn't fully compensate for the volatility.") + " The strategy's Sharpe of " + fmt(data.strategy.sharpe_ratio, "ratio") + (data.strategy.sharpe_ratio > data.market.sharpe_ratio ? " is higher — more efficient with risk even if total returns are lower." : " is lower this period."),
      guide: [
        { range: "Below 0", meaning: "Lost money on a risk-adjusted basis", color: "#ef4444" },
        { range: "0 — 1.0", meaning: "Returns don't fully compensate for risk", color: "#f59e0b" },
        { range: "1.0 — 2.0", meaning: "Good — solid risk-adjusted returns", color: "#22c55e" },
        { range: "Above 2.0", meaning: "Excellent — exceptional performance", color: "#0ea5e9" },
      ],
    },
    {
      label: "Volatility",
      icon: "🎢",
      market: fmt(data.market.volatility, "pct"),
      strategy: fmt(data.strategy.volatility, "pct"),
      formula: "σ = std(daily_returns) × √252",
      vars: [
        { var: "std()", desc: "Standard deviation of daily returns" },
        { var: "daily_returns", desc: "(todayPrice − yesterdayPrice) / yesterdayPrice" },
        { var: "√252", desc: "Annualizes daily volatility to a yearly figure" },
      ],
      what: "How bumpy was the ride? Higher means bigger swings — both gains and losses. Lower means a smoother, more predictable experience.",
      result: "Buy & hold volatility of " + fmt(data.market.volatility, "pct") + (data.market.volatility > 0.3 ? " is very high — this stock moves dramatically." : data.market.volatility > 0.2 ? " is moderately high — expect significant daily swings." : data.market.volatility > 0.1 ? " is moderate — typical for a large cap stock." : " is low — stable ride.") + " The strategy reduced this to " + fmt(data.strategy.volatility, "pct") + " by sitting in cash during uncertain periods.",
    },
    {
      label: "Max Drawdown",
      icon: "📉",
      market: fmt(data.market.max_drawdown, "pct"),
      strategy: fmt(data.strategy.max_drawdown, "pct"),
      formula: "Max Drawdown = min((Vt − Vpeak) / Vpeak)",
      vars: [
        { var: "Vt", desc: "Portfolio value at time t" },
        { var: "Vpeak", desc: "Highest value seen up to time t" },
        { var: "min()", desc: "Most negative value across all days" },
      ],
      what: "The worst peak-to-trough decline you would have experienced. The most psychologically important metric — most investors panic-sell during large drawdowns and lock in losses permanently.",
      result: "If you held " + data.ticker + ", your worst drop was " + fmt(data.market.max_drawdown, "pct") + ". " + (Math.abs(data.market.max_drawdown) > 0.2 ? "Severe — watching that in real time tests any investor's conviction." : Math.abs(data.market.max_drawdown) > 0.1 ? "Significant but manageable for a long-term investor." : "Relatively mild — this stock held up well.") + " The strategy's max drawdown was " + fmt(data.strategy.max_drawdown, "pct") + (Math.abs(data.strategy.max_drawdown) < Math.abs(data.market.max_drawdown) ? " — smaller, meaning exit signals helped protect capital." : " — larger, meaning strategy timing increased downside exposure."),
    },
    {
      label: "Annual Return",
      icon: "📅",
      market: fmt(data.market.annualized_return, "pct"),
      strategy: fmt(data.strategy.annualized_return, "pct"),
      formula: "Annualized Return = (1 + avg_daily_return)^252 − 1",
      vars: [
        { var: "avg_daily_return", desc: "Mean of all daily percentage returns" },
        { var: "^252", desc: "Compounding over a full trading year" },
        { var: "− 1", desc: "Converts from growth factor to percentage" },
      ],
      what: "Standardizes performance to a yearly rate using compounding. Makes it comparable across different time periods. The S&P 500 averages ~10% annually over the long run.",
      result: "The market's annualized return of " + fmt(data.market.annualized_return, "pct") + (data.market.annualized_return > 0.2 ? " is exceptional — well above the S&P 500's historical ~10% average." : data.market.annualized_return > 0.1 ? " is above the S&P 500's historical ~10% annual average." : data.market.annualized_return > 0 ? " is below the S&P 500's historical ~10% annual average." : " is negative — a losing year."),
    },
  ];

  const active = tabs[activeTab];

  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, overflow: "hidden" }}>
      {/* Tab Headers */}
      <div style={{ display: "flex", borderBottom: "1px solid #334155" }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "20px 16px", background: activeTab === i ? "#0f172a" : "transparent", border: "none", borderBottom: activeTab === i ? "3px solid #0ea5e9" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{tab.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: activeTab === i ? "#0ea5e9" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>{tab.label}</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>B&H: <span style={{ color: "#0ea5e9", fontWeight: 800, fontSize: 15 }}>{tab.market}</span></div>
            <div style={{ fontSize: 13, color: "#475569" }}>Strat: <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{tab.strategy}</span></div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
          {/* Formula */}
          <div style={{ background: "#0f172a", borderRadius: 14, padding: 24, border: "1px solid #334155" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Formula</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, color: "#e2e8f0", marginBottom: active.formulaSub ? 8 : 0, lineHeight: 1.5 }}>{active.formula}</div>
            {active.formulaSub && <div style={{ fontFamily: "monospace", fontSize: 13, color: "#64748b", marginBottom: 16 }}>{active.formulaSub}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              {active.vars && active.vars.map((v) => (
                <div key={v.var} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: "#0ea5e9", minWidth: 120, flexShrink: 0 }}>{v.var}</span>
                  <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What it measures */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#0f172a", borderRadius: 14, padding: 24, border: "1px solid #334155", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>What it measures</div>
              <p style={{ color: "#e2e8f0", fontSize: 16, lineHeight: 1.8, margin: 0 }}>{active.what}</p>
            </div>
            {active.guide && (
              <div style={{ background: "#0f172a", borderRadius: 14, padding: 24, border: "1px solid #334155" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Interpretation guide</div>
                {active.guide.map((r) => (
                  <div key={r.range} style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: r.color, minWidth: 90 }}>{r.range}</span>
                    <span style={{ fontSize: 14, color: "#64748b" }}>{r.meaning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Your Result */}
        <div style={{ background: "#0f172a", borderRadius: 14, padding: 24, border: "1px solid #0ea5e9" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your result for {data.ticker}</div>
          <p style={{ color: "#e2e8f0", fontSize: 16, lineHeight: 1.8, margin: 0 }}>{active.result}</p>
        </div>
      </div>
    </div>
  );
}
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
    if (t) { setTicker(t); runBacktestFor(t); }
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
      <div style={{ borderBottom: "1px solid #1e293b", padding: "40px 48px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></div>
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live market data</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 8 }}>Strategy Backtester</h1>
          <p style={{ color: "#64748b", fontSize: 16 }}>Test any trading strategy against real historical data. See exactly how it would have performed.</p>
        </div>
      </div>

      {/* Controls Bar — always visible at top */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "20px 48px", background: "#0f172a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Ticker Symbol</label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && runBacktest()}
              placeholder="e.g. AAPL"
              style={{ padding: "12px 20px", fontSize: 18, fontWeight: 700, background: "#1e293b", border: "1.5px solid #334155", borderRadius: 10, outline: "none", color: "#fff", width: 180 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Strategy</label>
            <div style={{ padding: "12px 20px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: 10, color: "#475569", fontSize: 15, minWidth: 260 }}>MA Crossover (20/50) — more coming soon</div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Period</label>
            <div style={{ padding: "12px 20px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: 10, color: "#475569", fontSize: 15, minWidth: 180 }}>1 Year — more coming soon</div>
          </div>
          <button
            onClick={runBacktest}
            style={{ padding: "12px 36px", fontSize: 16, fontWeight: 700, background: loading ? "#334155" : "#0ea5e9", color: loading ? "#64748b" : "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}
          >
            {loading ? "Running..." : "Run Backtest →"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px" }}>

        {/* Empty state */}
        {!data && !loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
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
              <div style={{ marginTop: 24, padding: 16, background: "#0f172a", borderRadius: 10, border: "1px solid #334155" }}>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, margin: 0 }}>💡 In strong bull markets, buy & hold often wins. The MA strategy shines in volatile or bear markets by getting you out before big drops.</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 80, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "4px solid #334155", borderTop: "4px solid #0ea5e9", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }}></div>
            <p style={{ color: "#64748b", fontSize: 17 }}>Fetching market data for {ticker}...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#1e293b", border: "1px solid #ef4444", borderRadius: 20, padding: 24 }}>
            <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 16 }}>{error}</p>
          </div>
        )}

        {/* Results — full width */}
        {data && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>

            {/* Results header with big numbers */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: -1.5, marginBottom: 8 }}>Results for {data.ticker}</h2>
              <p style={{ color: "#64748b", fontSize: 16 }}>MA Crossover (20/50) vs Buy & Hold · Past 12 months</p>
            </div>

            {/* Winner banner */}
            <div style={{ background: data.strategy.total_return > data.market.total_return ? "rgba(34,197,94,0.1)" : "rgba(14,165,233,0.1)", border: `1px solid ${data.strategy.total_return > data.market.total_return ? "#22c55e" : "#0ea5e9"}`, borderRadius: 16, padding: "20px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 32 }}>{data.strategy.total_return > data.market.total_return ? "🏆" : "📈"}</span>
              <div>
                <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 4 }}>
                  {data.strategy.total_return > data.market.total_return
                    ? `MA Strategy won — ${fmt(data.strategy.total_return, "pct")} vs Buy & Hold's ${fmt(data.market.total_return, "pct")}`
                    : `Buy & Hold won — ${fmt(data.market.total_return, "pct")} vs Strategy's ${fmt(data.strategy.total_return, "pct")}`
                  }
                </p>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                  {data.strategy.total_return > data.market.total_return
                    ? "The strategy successfully avoided downturns in this volatile period."
                    : "Common in strong bull markets — consistent uptrend made sitting in cash costly."
                  }
                </p>
              </div>
            </div>

            {/* Chart — full width, large */}
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 36, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontWeight: 800, color: "#fff", marginBottom: 6, fontSize: 22 }}>Growth of $1 Invested</h3>
                  <p style={{ color: "#64748b", fontSize: 15 }}>How $1 invested at the start would have grown. Hover to see exact values on any date.</p>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 16, height: 3, background: "#0ea5e9", borderRadius: 2 }}></div>
                    <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>Buy & Hold</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 16, height: 3, background: "#fff", borderRadius: 2 }}></div>
                    <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>MA Strategy</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#475569" }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 12, fill: "#475569" }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10 }}
                    labelStyle={{ color: "#94a3b8", fontSize: 13 }}
                    formatter={(value, name) => [`$${value.toFixed(4)}`, name === "market" ? "Buy & Hold" : "MA Strategy"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line type="monotone" dataKey="market" stroke="#0ea5e9" dot={false} strokeWidth={3} />
                  <Line type="monotone" dataKey="strategy" stroke="#ffffff" dot={false} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Metric Tabs */}
            <MetricTabs data={data} fmt={fmt} />

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