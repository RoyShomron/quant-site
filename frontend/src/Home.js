import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TICKERS = ["AAPL +1.2%", "TSLA -0.8%", "SPY +0.5%", "NVDA +3.1%", "MSFT +0.9%", "AMZN -0.3%", "GOOGL +1.7%", "UBER +0.8%", "AMD -0.5%", "JPM +0.6%", "V +0.4%", "NFLX +1.9%"];

const TICKER_LOGOS = {
  "AAPL": "https://www.apple.com/favicon.ico",
  "TSLA": "https://www.tesla.com/favicon.ico",
  "SPY": "https://www.ssga.com/favicon.ico",
  "NVDA": "https://www.nvidia.com/favicon.ico",
  "MSFT": "https://www.microsoft.com/favicon.ico",
  "AMZN": "https://www.amazon.com/favicon.ico",
  "GOOGL": "https://www.google.com/favicon.ico",
  "UBER": "https://www.uber.com/favicon.ico",
  "PYPL": "https://www.paypal.com/favicon.ico",
  "JPM": "https://www.jpmorganchase.com/favicon.ico",
  "V": "https://www.visa.com/favicon.ico",
  "NFLX": "https://www.netflix.com/favicon.ico",
};

function Home() {
  const navigate = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".fade-in").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      observerRef.current.observe(el);
    });

    return () => observerRef.current.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#fff", color: "#0f172a", overflowX: "hidden" }}>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e0f2fe", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>
          <span style={{ color: "#0ea5e9", fontSize: 42, fontFamily: "Georgia, serif", verticalAlign: "bottom", lineHeight: 1 }}>Q</span>
          <span style={{ color: "#0f172a" }}>uantWorld</span>
        </span>
        <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
          <span onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })} style={{ color: "#64748b", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Features</span>
          <span onClick={() => document.getElementById("howitworks").scrollIntoView({ behavior: "smooth" })} style={{ color: "#64748b", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>How it works</span>
          <button onClick={() => navigate("/backtest")} style={{ padding: "9px 24px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", background: "linear-gradient(180deg, #f0f9ff 0%, #fff 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 80, left: 0, right: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 0, animation: "scroll 40s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", border: "1px solid #e0f2fe", borderRadius: 12, padding: "10px 20px", margin: "0 8px" }}>
                <img src={TICKER_LOGOS[t.split(" ")[0]]} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{t.split(" ")[0]}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.includes("+") ? "#16a34a" : "#dc2626", fontFamily: "monospace" }}>{t.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 0, animation: "scroll 30s linear infinite reverse", whiteSpace: "nowrap", width: "max-content" }}>
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", border: "1px solid #e0f2fe", borderRadius: 12, padding: "10px 20px", margin: "0 8px" }}>
                <img src={TICKER_LOGOS[t.split(" ")[0]]} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{t.split(" ")[0]}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.includes("+") ? "#16a34a" : "#dc2626", fontFamily: "monospace" }}>{t.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "#e0f2fe", color: "#0369a1", fontSize: 13, fontWeight: 700, padding: "6px 18px", borderRadius: 100, marginBottom: 28, letterSpacing: 0.3 }}>
            Free · No signup required · Beginner friendly
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: -2, maxWidth: 720 }}>
            Learn trading strategies
            <span style={{ color: "#0ea5e9" }}> that actually work</span>
          </h1>
          <p style={{ fontSize: 20, color: "#64748b", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 48px" }}>
            Pick any stock. Pick a strategy. See exactly how it would have performed — with plain English explanations of every single number.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/backtest")} style={{ padding: "16px 40px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 24px rgba(14,165,233,0.3)" }}
              onMouseEnter={e => e.target.style.background = "#0284c7"}
              onMouseLeave={e => e.target.style.background = "#0ea5e9"}>
              Start Backtesting →
            </button>
            <button onClick={() => document.getElementById("howitworks").scrollIntoView({ behavior: "smooth" })} style={{ padding: "16px 40px", background: "#fff", color: "#0f172a", border: "1.5px solid #e0f2fe", borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.target.style.borderColor = "#0ea5e9"}
              onMouseLeave={e => e.target.style.borderColor = "#e0f2fe"}>
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: "#0f172a", padding: "28px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          {[
            { number: "10,000+", label: "Tickers supported" },
            { number: "Real data", label: "No simulations" },
            { number: "5+", label: "Strategies available" },
            { number: "Free", label: "No signup required" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0ea5e9", marginBottom: 4 }}>{s.number}</div>
              <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "100px 48px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>Built for beginners.<br />Powerful enough for everyone.</h2>
            <p style={{ fontSize: 18, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>No finance degree needed. No confusing jargon. Just clear, honest results.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { icon: "📊", title: "Real market data", desc: "Every backtest uses actual historical price data — not simulations. See how strategies performed through real market conditions including crashes and rallies." },
              { icon: "🧠", title: "Plain English explanations", desc: "Every metric comes with a clear explanation of what it means and what your specific result tells you. No more Googling what Sharpe ratio means." },
              { icon: "⚡", title: "Instant results", desc: "Type in any ticker, click run, and get a full analysis in seconds. Compare strategies side by side and see exactly where one outperforms the other." },
            ].map((f, i) => (
              <div key={i} className="fade-in" style={{ background: "#f8fafc", border: "1px solid #e0f2fe", borderRadius: 20, padding: 36, transition: "all 0.3s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.12)"; e.currentTarget.style.borderColor = "#0ea5e9"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e0f2fe"; }}>
                <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>{f.title}</h3>
                <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* What is backtesting */}
      <section style={{ padding: "100px 48px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>What is backtesting?</h2>
            <p style={{ fontSize: 18, color: "#64748b", maxWidth: 540, margin: "0 auto" }}>The concept is simple — and it's how every professional trader evaluates a strategy before risking real money.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div className="fade-in">
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {[
                  { icon: "📅", title: "Take a strategy", desc: "Start with a simple rule — for example: buy when the 20-day average crosses above the 50-day average." },
                  { icon: "📈", title: "Apply it to historical data", desc: "Run that rule against years of real past price data, as if you had actually been trading it at the time." },
                  { icon: "📊", title: "Measure the results", desc: "See exactly how much you would have made or lost, how risky it was, and whether it beat simply holding the stock." },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 28, minWidth: 48, height: 48, background: "#f0f9ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#0f172a" }}>{s.title}</h3>
                      <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: 15, margin: 0 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fade-in" style={{ background: "#f0f9ff", borderRadius: 24, padding: 40, border: "1px solid #e0f2fe" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0369a1", marginBottom: 20 }}>Example — SPY over 1 year</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Strategy", value: "MA Crossover (20/50)", color: "#0f172a" },
                  { label: "Total Return", value: "+15.4%", color: "#16a34a" },
                  { label: "vs Buy & Hold", value: "+28.2%", color: "#0ea5e9" },
                  { label: "Max Drawdown", value: "-5.1%", color: "#dc2626" },
                  { label: "Sharpe Ratio", value: "1.83", color: "#0f172a" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: i < 4 ? "1px solid #e0f2fe" : "none" }}>
                    <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>{r.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => window.location.href = "/backtest?ticker=SPY"} style={{ width: "100%", marginTop: 24, padding: "12px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Try it yourself →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="howitworks" style={{ padding: "100px 48px", background: "#f0f9ff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>How it works</h2>
            <p style={{ fontSize: 18, color: "#64748b" }}>Three steps from zero to understanding your strategy.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { num: "01", title: "Pick a stock", desc: "Enter any ticker symbol — SPY, AAPL, TSLA, anything listed on a major exchange. QuantWorld pulls the last year of real price data automatically." },
              { num: "02", title: "Choose a strategy", desc: "Select from a growing list of strategies like MA Crossover, RSI, and Bollinger Bands. Each one comes with a plain-English explanation of the logic behind it." },
              { num: "03", title: "Read the results", desc: "Get an instant breakdown of returns, risk, and performance — all compared against simply buying and holding. Every number is explained in plain language." },
            ].map((s, i) => (
              <div key={i} className="fade-in" style={{ display: "flex", gap: 28, alignItems: "flex-start", background: "#fff", border: "1px solid #e0f2fe", borderRadius: 20, padding: 32 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#e0f2fe", minWidth: 64, lineHeight: 1 }}>{s.num}</div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>{s.title}</h3>
                  <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: 15, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Snapshot */}
      <section style={{ padding: "100px 48px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>Live market snapshot</h2>
            <p style={{ fontSize: 18, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>Click any stock to instantly run a backtest on it.</p>
          </div>
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { ticker: "SPY", name: "S&P 500 ETF", price: "$584.12", change: "+0.52%", up: true },
              { ticker: "AAPL", name: "Apple Inc.", price: "$211.45", change: "+1.23%", up: true },
              { ticker: "NVDA", name: "NVIDIA Corp.", price: "$1,089.23", change: "+3.12%", up: true },
              { ticker: "TSLA", name: "Tesla Inc.", price: "$182.34", change: "-0.87%", up: false },
              { ticker: "MSFT", name: "Microsoft Corp.", price: "$415.67", change: "+0.91%", up: true },
              { ticker: "AMZN", name: "Amazon.com", price: "$192.45", change: "-0.34%", up: false },
              { ticker: "GOOGL", name: "Alphabet Inc.", price: "$178.23", change: "+1.67%", up: true },
              { ticker: "NFLX", name: "Netflix Inc.", price: "$645.89", change: "+1.92%", up: true },
            ].map((s, i) => (
              <div key={i} style={{ background: "#f8fafc", border: "1px solid #e0f2fe", borderRadius: 16, padding: 24, transition: "all 0.3s", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(14,165,233,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0f2fe"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => window.location.href = `/backtest?ticker=${s.ticker}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{s.ticker}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.name}</div>
                  </div>
                  <div style={{ background: s.up ? "#dcfce7" : "#fee2e2", color: s.up ? "#16a34a" : "#dc2626", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>{s.change}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{s.price}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Click to backtest →</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 24 }}>* Prices shown are illustrative. Click any stock to run a real backtest with live data.</p>
        </div>
      </section>

      {/* About */}
      <section style={{ padding: "100px 48px", background: "#f0f9ff" }}>
        <div className="fade-in" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, background: "#0ea5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>👨‍💻</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>Built by a student, for students</h2>
          <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.8, marginBottom: 24 }}>
            QuantWorld was built by Roy Shomron, a first-year Applied Mathematics and Computer Engineering student at Queen's University with a passion for quantitative finance and making it accessible to everyone.
          </p>
          <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.8, marginBottom: 32 }}>
            Most trading tools are built for experts. This one is built for anyone who's curious about how markets work and wants to learn without being overwhelmed.
          </p>
          <a href="https://github.com/RoyShomron/quant-site" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#0f172a", color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            View on GitHub →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="fade-in" style={{ padding: "100px 48px", background: "#0ea5e9", textAlign: "center" }}>
        <h2 style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: -1.5, marginBottom: 16 }}>Ready to see how strategies really perform?</h2>
        <p style={{ fontSize: 20, color: "rgba(255,255,255,0.8)", marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>Free forever. No signup. Just results.</p>
        <button onClick={() => navigate("/backtest")} style={{ padding: "18px 48px", background: "#fff", color: "#0ea5e9", border: "none", borderRadius: 12, fontSize: 18, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}>
          Launch QuantWorld →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", background: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>QuantWorld</span>
        <span style={{ color: "#475569", fontSize: 13 }}>Built by Roy Shomron · Queen's University · 2025</span>
        <span style={{ color: "#475569", fontSize: 13 }}>For educational purposes only</span>
      </footer>

      <style>{`
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

export default Home;