import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "./useWindowSize";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";
import Navbar from "./Navbar";

const FREE_FEATURES = [
  { text: "4 trading strategies (MA Crossover, RSI, Bollinger Bands, MACD)" },
  { text: "1-year backtest timeframe" },
  { text: "9 educational guides" },
  { text: "First 2 brainteasers" },
  { text: "Real historical market data" },
  { text: "Simple result explanations" },
];

const PRO_FEATURES = [
  { text: "Everything in Free", sub: null },
  { text: "3 ML strategies", sub: "Logistic Regression, Random Forest, LSTM Neural Network" },
  { text: "Extended backtest timeframes", sub: "Up to 5 years of historical data" },
  { text: "All educational guides", sub: "Every guide we publish, now and in the future" },
  { text: "Full brainteaser library", sub: "Quant interview questions — math, probability & coding" },
  { text: "Unlimited backtest history", sub: "Every run saved to your account automatically" },
  { text: "Portfolio backtesting", sub: "Test a strategy across multiple stocks simultaneously" },
  { text: "Paper trading mode", sub: "Run strategies on live prices with simulated money" },
  { text: "Premium community", sub: "Quant discussions, strategy sharing & early access" },
];

function CheckIcon({ color = "#22c55e" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="10" cy="10" r="10" fill={color} fillOpacity="0.15" />
      <path d="M6 10l3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


export default function Pricing() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const canadianTimezones = [
    "America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg",
    "America/Halifax", "America/St_Johns", "America/Regina", "America/Whitehorse",
    "America/Yellowknife", "America/Dawson", "America/Dawson_Creek", "America/Fort_Nelson",
    "America/Glace_Bay", "America/Goose_Bay", "America/Moncton", "America/Nipigon",
    "America/Pangnirtung", "America/Rainy_River", "America/Rankin_Inlet", "America/Resolute",
    "America/Thunder_Bay", "America/Iqaluit", "America/Swift_Current", "America/Cambridge_Bay",
  ];
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isCanadian = canadianTimezones.includes(userTimezone);
  const price = isCanadian ? 10 : 7;
  const symbol = isCanadian ? "CAD" : "USD";

  if (user === undefined) return null; // still loading auth state

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>

      <Navbar />

      {/* Header */}
      <div style={{ textAlign: "center", padding: isMobile ? "56px 20px 40px" : "80px 48px 56px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 100, padding: "6px 18px", marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>Simple, Transparent Pricing</span>
        </div>
        <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, color: "#fff", letterSpacing: -2, marginBottom: 16, lineHeight: 1.1 }}>
          Start Free.<br />
          <span style={{ color: "#0ea5e9" }}>Go Further With Pro.</span>
        </h1>
        <p style={{ fontSize: isMobile ? 16 : 18, color: "#64748b", maxWidth: 480, margin: "0 auto 0", lineHeight: 1.7 }}>
          The core backtester is free forever. Pro unlocks ML strategies, deeper analysis, and everything being built next.
        </p>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "0 20px 80px" : "0 48px 100px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24, alignItems: "start" }}>

        {/* Free */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 24, padding: isMobile ? 28 : 36 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Free</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1 }}>$0</span>
            </div>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>Free forever. No credit card needed.</p>
          </div>

          <button onClick={() => navigate("/backtest")} style={{ width: "100%", padding: "13px", background: "transparent", color: "#0ea5e9", border: "1.5px solid #0ea5e9", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 28, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            Start backtesting →
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FREE_FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckIcon color="#0ea5e9" />
                <span style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div style={{ background: "linear-gradient(145deg, #0f172a 0%, #0c1a2e 100%)", border: "1.5px solid #0ea5e9", borderRadius: 24, padding: isMobile ? 28 : 36, position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(14,165,233,0.12)" }}>
          {/* Glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "absolute", top: 16, right: 16, background: "#0ea5e9", borderRadius: 100, padding: "4px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>Most Popular</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Pro</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1 }}>${price}</span>
              <span style={{ fontSize: 16, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>{symbol} / month</span>
            </div>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>Cancel anytime. No hidden fees.</p>
          </div>

          <button style={{ width: "100%", padding: "13px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "not-allowed", marginBottom: 20, opacity: 0.7 }}>
            Coming Soon
          </button>

          {/* Flagship feature highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              { icon: "📡", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.2)", label: "Paper Trading", desc: "Run strategies on live prices with zero financial risk" },
              { icon: "📂", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", label: "Portfolio Backtesting", desc: "Test across 10+ stocks simultaneously like a real fund" },
              { icon: "🧠", color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)", label: "Quant Brainteasers", desc: "Real interview questions from quant firms — graded & explained" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: f.bg, border: `1px solid ${f.border}`, borderRadius: 12, padding: "11px 14px" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: f.color, marginBottom: 1 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{f.desc}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 100, padding: "2px 8px", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Soon</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckIcon color="#22c55e" />
                <div>
                  <span style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.5, fontWeight: i === 0 ? 600 : 400 }}>{f.text}</span>
                  {f.sub && <p style={{ color: "#475569", fontSize: 12, margin: "2px 0 0", lineHeight: 1.5 }}>{f.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pro Feature Spotlight */}
      <div style={{ borderTop: "1px solid #1e293b", padding: isMobile ? "56px 20px 64px" : "80px 48px 88px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 100, padding: "6px 18px", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>What Pro Is Really About</span>
            </div>
            <h2 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 14, lineHeight: 1.15 }}>
              The Features That Change<br />How You Actually Learn Trading.
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 17, color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Backtesting history is just the start. These are the features that take you from reading about strategies to actually using them.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* Paper Trading */}
            <div style={{ background: "linear-gradient(160deg, #0f2030 0%, #0f172a 100%)", border: "1px solid #1e4060", borderRadius: 24, padding: isMobile ? 28 : 32, display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 36 }}>📡</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 100, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Coming Soon</span>
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 0 10px", lineHeight: 1.2 }}>Paper Trading</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  This is the real value of learning to trade. Paper trading runs the strategies you've studied against <strong style={{ color: "#94a3b8" }}>live, real-time market prices</strong> — but with simulated money, not yours.
                </p>
              </div>
              <div style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                <p style={{ color: "#7dd3fc", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  Instead of asking "would this strategy have worked in 2022?" you get to ask "is this strategy working <em>right now</em>?" — with zero financial risk.
                </p>
              </div>
              <ul style={{ color: "#475569", fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 18 }}>
                <li>Watch buy/sell signals fire in real time</li>
                <li>Track your simulated P&L day by day</li>
                <li>Build confidence before trading real money</li>
              </ul>
            </div>

            {/* Portfolio Backtesting */}
            <div style={{ background: "linear-gradient(160deg, #0f1a2e 0%, #0f172a 100%)", border: "1px solid #1e3050", borderRadius: 24, padding: isMobile ? 28 : 32, display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 36 }}>📂</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 100, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Coming Soon</span>
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 0 10px", lineHeight: 1.2 }}>Portfolio Backtesting</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  Right now you can test one stock at a time. Portfolio backtesting lets you run a strategy across <strong style={{ color: "#94a3b8" }}>a whole basket of stocks simultaneously</strong> — like a real portfolio manager would.
                </p>
              </div>
              <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                <p style={{ color: "#86efac", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  Does MA Crossover work better on tech stocks or energy stocks? How does a diversified portfolio of strategies compare to a single one? These are the questions professionals ask.
                </p>
              </div>
              <ul style={{ color: "#475569", fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 18 }}>
                <li>Test across 5, 10, or 20 tickers at once</li>
                <li>See correlation between strategy returns</li>
                <li>Measure true diversification benefit</li>
              </ul>
            </div>

            {/* Brainteasers */}
            <div style={{ background: "linear-gradient(160deg, #1a0f2e 0%, #0f172a 100%)", border: "1px solid #301e50", borderRadius: 24, padding: isMobile ? 28 : 32, display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 36 }}>🧠</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 100, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>2 Free</span>
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 0 10px", lineHeight: 1.2 }}>Quant Brainteasers</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  The questions quant firms actually ask in interviews — probability puzzles, mental math, coding challenges, and market logic problems. <strong style={{ color: "#94a3b8" }}>Interactive, graded, and explained.</strong>
                </p>
              </div>
              <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                <p style={{ color: "#d8b4fe", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  Free users get the first 2 problems. Pro unlocks the full library — the closest thing to actual quant interview prep you'll find outside a finance course.
                </p>
              </div>
              <ul style={{ color: "#475569", fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 18 }}>
                <li>Probability & expected value problems</li>
                <li>Python/stats coding challenges</li>
                <li>Real questions from quant firm interviews</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ strip */}
      <div style={{ borderTop: "1px solid #1e293b", padding: isMobile ? "56px 20px 72px" : "72px 48px 96px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: isMobile ? 26 : 32, letterSpacing: -0.5, marginBottom: 10 }}>Good To Know</h3>
            <p style={{ color: "#475569", fontSize: 15, margin: 0 }}>Answers to the most common questions.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid #1e293b", borderRadius: 20, overflow: "hidden" }}>
            {[
              { icon: "🚀", q: "When Will Pro Launch?", a: "We're actively working on it. Drop your email on the home page to be the first to know when it goes live." },
              { icon: "📡", q: "What Is Paper Trading?", a: "Paper trading runs a strategy against live, real-time market prices — but with simulated money instead of yours. It bridges the gap between backtesting history and actually trading. You get to see how a strategy performs right now, in current market conditions, with zero financial risk." },
              { icon: "🔒", q: "Will Free Features Stay Free?", a: "Yes, always. Everything available for free today will remain free forever. Pro is purely additive — it never takes anything away." },
              { icon: "💳", q: "What Currency Will I Be Charged In?", a: "Canadian users are charged in CAD ($10/mo), everyone else in USD ($7/mo). Always a whole number — no rounding surprises, no hidden fees." },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 20, padding: isMobile ? "24px 20px" : "28px 32px", background: i % 2 === 0 ? "#0f172a" : "#0a1120", borderBottom: i < arr.length - 1 ? "1px solid #1e293b" : "none", alignItems: "flex-start" }}>
                <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                <div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.q}</h4>
                  <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
