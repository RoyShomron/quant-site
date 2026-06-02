import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "./useWindowSize";

const articles = [
  {
    id: "what-is-quant",
    icon: "🏦",
    tag: "Foundations",
    tagColor: "#0ea5e9",
    title: "What is Quantitative Trading?",
    subtitle: "How math and algorithms replaced gut instinct on Wall Street",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "Quantitative trading — or 'quant trading' — is the use of mathematical models, statistical analysis, and computer algorithms to make trading decisions. Instead of a human saying 'I think Apple looks good right now,' a quant system says 'based on 47 variables and 10 years of historical data, there is a 62% probability this trade is profitable.'" },
      { type: "heading", text: "How it started" },
      { type: "text", text: "Before the 1970s, all trading was discretionary — humans made every decision based on research, intuition, and experience. Then Ed Thorp, a mathematics professor, proved you could beat blackjack using probability theory. He applied the same logic to financial markets and made a fortune. Others followed. By the 1980s and 90s, firms like Renaissance Technologies and D.E. Shaw were building massive quantitative trading operations staffed by mathematicians, physicists, and computer scientists — not traditional finance people." },
      { type: "heading", text: "How it works today" },
      { type: "text", text: "Modern quant trading works in layers. At the bottom is data — price data, earnings data, news sentiment, satellite imagery of parking lots, credit card transaction data, and much more. Above that are signals — mathematical indicators derived from that data that suggest a trade might be profitable. Above that is a strategy — a set of rules for when to buy and sell based on those signals. And at the top is risk management — rules for how much to bet and when to stop." },
      { type: "highlight", text: "Renaissance Technologies' Medallion Fund — the most successful investment fund in history — has averaged 66% annual returns before fees since 1988. It is run entirely by algorithms with no human discretion in individual trades." },
      { type: "heading", text: "The three main approaches" },
      { type: "text", text: "Trend following strategies bet that stocks moving in one direction will continue moving in that direction. The MA Crossover strategy on QuantWorld is a classic trend-following approach. Mean reversion strategies bet the opposite — that prices that have moved too far will snap back. RSI and Bollinger Bands are both mean reversion indicators, though they measure different things: RSI measures momentum speed, while Bollinger Bands measure how far price has deviated from its statistical average." },
      { type: "callout", text: "Try it yourself", subtext: "Run the MA Crossover strategy on SPY to see trend-following in action", ticker: "SPY", strategy: "ma_crossover" }
    ]
  },
  {
    id: "moving-averages",
    icon: "📈",
    tag: "Strategies",
    tagColor: "#22c55e",
    title: "What is a Moving Average?",
    subtitle: "The most widely used indicator in technical analysis — explained simply",
    readTime: "4 min read",
    content: [
      { type: "intro", text: "A moving average takes the average closing price of a stock over a set number of days, and updates every single day as new prices come in. It smooths out the day-to-day noise of price movements so you can see the underlying trend more clearly." },
      { type: "heading", text: "A simple example" },
      { type: "text", text: "Imagine a stock closes at these prices over 5 days: $10, $12, $11, $13, $14. The 5-day moving average on day 5 is (10+12+11+13+14)/5 = $12. On day 6, if the stock closes at $15, the new 5-day average is (12+11+13+14+15)/5 = $13. The window 'moves' forward every day — hence 'moving' average." },
      { type: "formula", label: "Formula", formula: "MA(n) = (P₁ + P₂ + ... + Pₙ) / n", vars: [{ var: "n", desc: "Number of days in the window (e.g. 20 or 50)" }, { var: "P₁...Pₙ", desc: "Closing prices over the last n days" }] },
      { type: "heading", text: "Why 20 and 50 days?" },
      { type: "text", text: "The 20-day moving average (MA20) represents roughly one trading month. It reacts quickly to recent price changes. The 50-day moving average (MA50) represents roughly 2.5 trading months. It moves more slowly and reflects the medium-term trend. Using both together — the MA crossover strategy — gives you a signal: when the fast (MA20) crosses above the slow (MA50), the short-term trend is stronger than the medium-term trend, suggesting upward momentum." },
      { type: "highlight", text: "The 200-day moving average is used by professional investors to determine the overall long-term trend. When a stock is above its 200-day MA, it's considered in a bull trend. Below it — a bear trend. This is one of the most watched levels on Wall Street." },
      { type: "heading", text: "The limitation: lag" },
      { type: "text", text: "Moving averages are lagging indicators — they always react after price has already moved. By the time the MA20 crosses above the MA50, the stock has already been moving up for some time. Compare this to Bollinger Bands, which are also based on moving averages but add a volatility component — the bands widen when price swings are large and narrow when things are calm, making them more dynamic." },
      { type: "callout", text: "Try it yourself", subtext: "Test the MA Crossover on TSLA — a volatile stock where the strategy behaves differently", ticker: "TSLA", strategy: "ma_crossover" }
    ]
  },
  {
    id: "rsi",
    icon: "🔄",
    tag: "Strategies",
    tagColor: "#22c55e",
    title: "What is RSI?",
    subtitle: "The Relative Strength Index — measuring momentum to find overbought and oversold stocks",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "The Relative Strength Index (RSI) is a momentum indicator that measures how fast and how much a stock's price has been moving. It produces a number between 0 and 100. Above 70 means the stock has been moving up very fast and may be overbought. Below 30 means it has been moving down very fast and may be oversold." },
      { type: "heading", text: "The formula" },
      { type: "formula", label: "Formula", formula: "RSI = 100 - (100 / (1 + RS))", vars: [{ var: "RS", desc: "Average gain over 14 days / Average loss over 14 days" }, { var: "Average gain", desc: "Mean of all days with positive returns over the last 14 days" }, { var: "Average loss", desc: "Mean of all days with negative returns over the last 14 days" }] },
      { type: "text", text: "If a stock has been going up every day for 14 days, RS is very high, and RSI approaches 100. If it's been going down every day, RS approaches 0, and RSI approaches 0. Most of the time RSI bounces between 30 and 70, with extremes at either end signaling potential reversals." },
      { type: "heading", text: "The trading rule" },
      { type: "text", text: "The RSI strategy used on QuantWorld is simple: when RSI drops below 30, the stock is considered oversold — it may have fallen too far too fast, and a bounce back is likely, so we buy. When RSI rises above 70, the stock is considered overbought — it may have risen too far too fast, and a pullback is likely, so we sell and hold cash." },
      { type: "highlight", text: "RSI was developed by J. Welles Wilder Jr. and published in his 1978 book 'New Concepts in Technical Trading Systems.' It remains one of the most widely used indicators in trading 45 years later." },
      { type: "heading", text: "RSI vs Bollinger Bands" },
      { type: "text", text: "Both RSI and Bollinger Bands are mean reversion indicators, but they measure different things. RSI measures the speed and magnitude of price movements — it tells you how fast a stock is moving. Bollinger Bands measure statistical deviation — they tell you how far price has moved from its average relative to recent volatility. Professional traders often use both together: RSI to confirm momentum extremes, and Bollinger Bands to confirm that the price has reached a statistically unusual level." },
      { type: "callout", text: "Try it yourself", subtext: "Run the RSI strategy on AMZN over 3 years to see how it handles volatility", ticker: "AMZN", strategy: "rsi" }
    ]
  },
  {
    id: "bollinger-bands",
    icon: "📊",
    tag: "Strategies",
    tagColor: "#22c55e",
    title: "What are Bollinger Bands?",
    subtitle: "Using volatility to identify when a stock has moved too far — and when it might snap back",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "Bollinger Bands are a volatility-based indicator that draws three lines on a price chart: a 20-day moving average in the middle, and two bands placed 2 standard deviations above and below it. When a stock's price touches the lower band, it may have fallen too far too fast. When it touches the upper band, it may have risen too far too fast." },
      { type: "heading", text: "The formula" },
      { type: "formula", label: "Formula", formula: "Upper Band = MA(20) + 2σ\nLower Band = MA(20) − 2σ", vars: [{ var: "MA(20)", desc: "20-day simple moving average of closing prices" }, { var: "σ", desc: "Standard deviation of closing prices over the last 20 days" }, { var: "2σ", desc: "Two standard deviations — statistically, ~95% of prices fall within this range" }] },
      { type: "text", text: "The key insight is that the bands are dynamic — they expand when the stock is volatile and contract when it's calm. A stock that normally trades in a tight range suddenly breaking outside the bands is a much stronger signal than one that regularly swings wildly. This self-adjusting nature makes Bollinger Bands more adaptive than fixed-level indicators." },
      { type: "heading", text: "The trading rule" },
      { type: "text", text: "The Bollinger Bands strategy on QuantWorld uses a mean-reversion approach: when price drops to or below the lower band, the stock is considered statistically oversold — buy in. When price rises to or above the upper band, the stock is considered statistically overbought — sell and hold cash. The idea is that prices tend to revert to their mean over time." },
      { type: "highlight", text: "Bollinger Bands were developed by John Bollinger in the 1980s. He designed them specifically to give relative definitions of high and low — a price is 'high' when it touches the upper band and 'low' when it touches the lower band, always relative to recent volatility, not an absolute level." },
      { type: "heading", text: "How it compares to RSI and MA Crossover" },
      { type: "text", text: "All three strategies on QuantWorld take fundamentally different approaches. The MA Crossover is trend-following — it bets that momentum continues. RSI is a momentum oscillator — it measures how fast prices are moving and flags extremes. Bollinger Bands are volatility-based — they measure how far price has deviated from its recent average. Professional traders often combine all three: use MA Crossover to identify the trend, RSI to time entries, and Bollinger Bands to assess whether the current price is statistically extreme." },
      { type: "heading", text: "Why Bollinger Bands underperform in bull markets" },
      { type: "text", text: "If you test Bollinger Bands on a stock like AAPL or SPY over the past year, you'll notice the strategy often dramatically underperforms buy and hold. This is because in a strong bull market, stocks trend upward without ever touching the lower band — so the strategy barely invests at all, sitting in cash while the market rallies. Try it on TSLA or a volatile stock over 3-5 years and you'll see it perform much better." },
      { type: "callout", text: "Try it yourself", subtext: "Test Bollinger Bands on TSLA over 3 years — volatile stocks show this strategy at its best", ticker: "TSLA", strategy: "bollinger" }
    ]
  },
  {
    id: "risk-adjusted-returns",
    icon: "⚖️",
    tag: "Metrics",
    tagColor: "#f59e0b",
    title: "What are Risk-Adjusted Returns?",
    subtitle: "Why how much risk you took matters just as much as how much you made",
    readTime: "6 min read",
    content: [
      { type: "intro", text: "Imagine two investors. Investor A made 20% last year. Investor B also made 20% last year. Who did better? You can't answer that without knowing how much risk each one took to get there. If Investor A barely felt any volatility and Investor B's portfolio dropped 40% at one point before recovering — they did not perform equally well. Risk-adjusted returns measure exactly this: how much return did you earn per unit of risk?" },
      { type: "heading", text: "The Sharpe Ratio" },
      { type: "formula", label: "Formula", formula: "Sharpe Ratio = (Rp − Rf) / σp", vars: [{ var: "Rp", desc: "Portfolio return — your annualized return" }, { var: "Rf", desc: "Risk-free rate — what you'd earn with zero risk (e.g. US Treasury bills)" }, { var: "σp", desc: "Standard deviation of returns — how much your returns varied (volatility)" }] },
      { type: "text", text: "The Sharpe ratio divides your excess return (return above the risk-free rate) by your volatility. A higher Sharpe means you earned more return per unit of risk. A Sharpe of 1.0 is generally considered acceptable. Above 2.0 is excellent. The best hedge funds in the world target Sharpe ratios of 1.5-2.5 consistently." },
      { type: "highlight", text: "Warren Buffett's Berkshire Hathaway has a lifetime Sharpe ratio of approximately 0.76 — impressive given the scale, but lower than many quant funds because of the concentrated, long-only nature of the portfolio." },
      { type: "heading", text: "Maximum Drawdown" },
      { type: "text", text: "Max drawdown measures the worst peak-to-trough decline you would have experienced. If your portfolio hit $100,000, then dropped to $60,000 before recovering, your max drawdown is -40%. This metric is psychologically critical — most investors panic-sell during large drawdowns, locking in losses permanently and missing the recovery. A strategy with a lower max drawdown is easier to hold through, even if its total return is slightly lower." },
      { type: "text", text: "Professional quant funds obsess over drawdown. A fund that makes 15% per year with a max drawdown of -8% is far more valuable than one that makes 20% per year with a -40% drawdown — because the second fund will lose investors whenever it hits a rough patch. This is why Bollinger Bands and RSI — despite often having lower total returns than buy and hold in bull markets — can still be valuable: they typically produce much smaller drawdowns." },
      { type: "callout", text: "Try it yourself", subtext: "Compare Sharpe ratios between MA Crossover, RSI, and Bollinger Bands on the same ticker", ticker: "SPY", strategy: "ma_crossover" }
    ]
  },
  {
    id: "quant-funds",
    icon: "🏛️",
    tag: "Industry",
    tagColor: "#a855f7",
    title: "How Do Quant Funds Actually Work?",
    subtitle: "Inside the firms that use math to beat the market",
    readTime: "7 min read",
    content: [
      { type: "intro", text: "Quantitative hedge funds — or quant funds — are investment firms that make trading decisions using mathematical models and algorithms rather than human judgment. They manage hundreds of billions of dollars and employ some of the most talented mathematicians, physicists, and computer scientists in the world. Here's how they actually work." },
      { type: "heading", text: "The big names" },
      { type: "text", text: "Renaissance Technologies, founded by mathematician Jim Simons, is widely considered the most successful investment firm in history. Its Medallion Fund has averaged 66% annual returns before fees since 1988 — a record no other fund has come close to matching. Two Sigma, Citadel, D.E. Shaw, and Jane Street are other major quant firms, each employing thousands of researchers and engineers and trading billions of dollars daily." },
      { type: "heading", text: "The research process" },
      { type: "text", text: "Quant funds work by finding 'alpha' — returns above what the market would normally give you. Researchers test thousands of hypotheses: does the stock tend to rise the day after earnings? Does high short interest predict future drops? Does satellite data on store parking lots predict retail sales? Most ideas fail. The ones that survive rigorous statistical testing become signals — inputs into a trading model." },
      { type: "highlight", text: "Jim Simons on finding patterns: 'We search through historical data looking for anomalous patterns that we would not expect to occur by chance. We then ask whether these patterns might be expected to persist into the future.'" },
      { type: "heading", text: "The edge is in the details" },
      { type: "text", text: "What separates elite quant funds from simple algorithmic strategies isn't the basic idea — it's the execution details. How do you handle transaction costs? How do you avoid overfitting your model to historical data? How do you manage correlations between hundreds of simultaneous positions? How do you build systems that remain stable when market conditions change? These are the hard problems, and solving them requires years of research." },
      { type: "heading", text: "How this connects to QuantWorld" },
      { type: "text", text: "The strategies on QuantWorld — MA Crossover, RSI, and Bollinger Bands — are the simplest building blocks of quantitative trading. Professional quant researchers start from these same foundations and layer enormous complexity on top. Understanding why a simple MA crossover works sometimes and fails other times, why RSI and Bollinger Bands are effective in volatile markets but struggle in strong trends, and what risk-adjusted return really means — this is the conceptual foundation that every quant researcher needs." },
      { type: "callout", text: "Start backtesting", subtext: "Apply what you've learned — test a strategy on any stock", ticker: "SPY", strategy: "ma_crossover" }
    ]
  }
];
function ArticleCard({ article, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 28, cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: 36, marginBottom: 16 }}>{article.icon}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ background: article.tagColor + "20", border: `1px solid ${article.tagColor}40`, borderRadius: 6, padding: "3px 10px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: article.tagColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>{article.tag}</span>
        </div>
        <span style={{ fontSize: 12, color: "#475569" }}>{article.readTime}</span>
      </div>
      <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 8, lineHeight: 1.3 }}>{article.title}</h3>
      <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{article.subtitle}</p>
    </div>
  );
}

function ArticleIllustration({ id }) {
  const illustrations = {
    "what-is-quant": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[60,110,160,210].map(y => <line key={y} x1="60" y1={y} x2="680" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        <polyline points="60,200 120,180 180,190 240,150 300,160 360,130 420,140 480,100 540,80 600,90 660,60" fill="none" stroke="#0ea5e9" strokeWidth="2.5"/>
        <polygon points="60,200 120,180 180,190 240,150 300,160 360,130 420,140 480,100 540,80 600,90 660,60 660,240 60,240" fill="url(#chartGrad)"/>
        {[[240,150],[480,100]].map(([x,y],i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="8" fill="#22c55e" opacity="0.9"/>
            <text x={x} y={y-16} textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">BUY</text>
            <line x1={x} y1={y+8} x2={x} y2="240" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>
          </g>
        ))}
        {[[360,130],[660,60]].map(([x,y],i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="8" fill="#ef4444" opacity="0.9"/>
            <text x={x} y={y-16} textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">SELL</text>
            <line x1={x} y1={y+8} x2={x} y2="240" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>
          </g>
        ))}
        <text x="60" y="260" fill="#475569" fontSize="11">Aug</text>
        <text x="180" y="260" fill="#475569" fontSize="11">Sep</text>
        <text x="300" y="260" fill="#475569" fontSize="11">Oct</text>
        <text x="420" y="260" fill="#475569" fontSize="11">Nov</text>
        <text x="540" y="260" fill="#475569" fontSize="11">Dec</text>
        <text x="650" y="260" fill="#475569" fontSize="11">Jan</text>
        <text x="370" y="30" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">Algorithmic Trading Signals</text>
      </svg>
    ),
    "moving-averages": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {[60,110,160,210].map(y => <line key={y} x1="60" y1={y} x2="680" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        <polyline points="60,200 90,210 120,195 150,205 180,185 210,195 240,170 270,165 300,155 330,145 360,130 390,125 420,110 450,115 480,100 510,105 540,90 570,95 600,80 630,85 660,70" fill="none" stroke="#334155" strokeWidth="1.5"/>
        <polyline points="60,195 120,192 180,188 240,182 300,170 360,155 420,138 480,118 540,98 600,82 660,68" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,3"/>
        <polyline points="60,210 120,205 180,198 240,188 300,165 360,140 420,118 480,95 540,75 600,62 660,50" fill="none" stroke="#0ea5e9" strokeWidth="2.5"/>
        <line x1="300" y1="40" x2="300" y2="240" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
        <circle cx="300" cy="165" r="10" fill="none" stroke="#22c55e" strokeWidth="2"/>
        <circle cx="300" cy="165" r="4" fill="#22c55e"/>
        <text x="310" y="180" fill="#22c55e" fontSize="11" fontWeight="700">CROSSOVER</text>
        <text x="310" y="194" fill="#22c55e" fontSize="10">MA20 crosses above MA50</text>
        <text x="150" y="50" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="600">BEFORE</text>
        <text x="150" y="64" textAnchor="middle" fill="#64748b" fontSize="10">MA50 above MA20</text>
        <text x="150" y="76" textAnchor="middle" fill="#64748b" fontSize="10">(downtrend)</text>
        <text x="450" y="50" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="600">AFTER</text>
        <text x="450" y="64" textAnchor="middle" fill="#64748b" fontSize="10">MA20 above MA50</text>
        <text x="450" y="76" textAnchor="middle" fill="#64748b" fontSize="10">(uptrend — buy signal)</text>
        <line x1="80" y1="255" x2="110" y2="255" stroke="#0ea5e9" strokeWidth="2.5"/>
        <text x="116" y="259" fill="#0ea5e9" fontSize="12" fontWeight="600">MA20 (Fast)</text>
        <line x1="240" y1="255" x2="270" y2="255" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,3"/>
        <text x="276" y="259" fill="#f59e0b" fontSize="12" fontWeight="600">MA50 (Slow)</text>
        <line x1="400" y1="255" x2="430" y2="255" stroke="#334155" strokeWidth="1.5"/>
        <text x="436" y="259" fill="#475569" fontSize="12">Price</text>
      </svg>
    ),
    "rsi": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        <rect x="60" y="60" width="620" height="40" fill="#ef444410" rx="4"/>
        <rect x="60" y="180" width="620" height="40" fill="#22c55e10" rx="4"/>
        <text x="48" y="85" textAnchor="end" fill="#ef4444" fontSize="11" fontWeight="700">70</text>
        <text x="48" y="205" textAnchor="end" fill="#22c55e" fontSize="11" fontWeight="700">30</text>
        <text x="48" y="140" textAnchor="end" fill="#475569" fontSize="11">50</text>
        <text x="660" y="55" fill="#ef4444" fontSize="11" fontWeight="600">OVERBOUGHT</text>
        <text x="640" y="230" fill="#22c55e" fontSize="11" fontWeight="600">OVERSOLD</text>
        <line x1="60" y1="80" x2="680" y2="80" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>
        <line x1="60" y1="130" x2="680" y2="130" stroke="#334155" strokeWidth="1"/>
        <line x1="60" y1="180" x2="680" y2="180" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>
        <polyline points="60,130 110,110 160,85 210,70 260,90 310,130 360,170 410,195 460,210 510,190 560,150 610,110 660,90" fill="none" stroke="#0ea5e9" strokeWidth="2.5"/>
        <circle cx="460" cy="210" r="8" fill="#22c55e"/>
        <text x="460" y="230" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">BUY</text>
        <circle cx="210" cy="70" r="8" fill="#ef4444"/>
        <text x="210" y="58" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">SELL</text>
        <text x="370" y="30" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">RSI Oscillator — Buy when oversold (&lt;30), Sell when overbought (&gt;70)</text>
      </svg>
    ),
    "bollinger-bands": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {[60,110,160,210].map(y => <line key={y} x1="60" y1={y} x2="680" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        <polyline points="60,80 120,75 180,70 240,85 300,90 360,80 420,65 480,60 540,70 600,65 660,55" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5,3"/>
        <polyline points="60,200 120,205 180,210 240,195 300,190 360,200 420,215 480,220 540,210 600,215 660,225" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5,3"/>
        <polygon points="60,80 120,75 180,70 240,85 300,90 360,80 420,65 480,60 540,70 600,65 660,55 660,225 600,215 540,210 480,220 420,215 360,200 300,190 240,195 180,210 120,205 60,200" fill="#8b5cf6" fillOpacity="0.05"/>
        <polyline points="60,140 120,140 180,140 240,140 300,140 360,140 420,140 480,140 540,140 600,140 660,140" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4"/>
        <polyline points="60,150 100,130 140,160 180,210 220,195 260,140 300,110 340,130 380,80 420,65 460,90 500,140 540,170 580,220 620,200 660,175" fill="none" stroke="#0ea5e9" strokeWidth="2.5"/>
        <circle cx="180" cy="210" r="8" fill="#22c55e"/>
        <text x="180" y="235" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">BUY</text>
        <circle cx="580" cy="220" r="8" fill="#22c55e"/>
        <text x="580" y="245" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">BUY</text>
        <circle cx="380" cy="80" r="8" fill="#ef4444"/>
        <text x="380" y="65" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">SELL</text>
        <circle cx="420" cy="65" r="8" fill="#ef4444"/>
        <text x="460" y="50" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">SELL</text>
        <text x="690" y="58" fill="#8b5cf6" fontSize="11" fontWeight="600">Upper</text>
        <text x="690" y="228" fill="#8b5cf6" fontSize="11" fontWeight="600">Lower</text>
        <text x="690" y="143" fill="#475569" fontSize="11">MA20</text>
        <line x1="80" y1="265" x2="110" y2="265" stroke="#0ea5e9" strokeWidth="2.5"/>
        <text x="116" y="269" fill="#0ea5e9" fontSize="12" fontWeight="600">Price</text>
        <line x1="200" y1="265" x2="230" y2="265" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="236" y="269" fill="#8b5cf6" fontSize="12" fontWeight="600">Bollinger Bands (±2σ)</text>
        <text x="370" y="20" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">Bollinger Bands — Buy at lower band, Sell at upper band</text>
      </svg>
    ),
    "risk-adjusted-returns": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        <text x="200" y="35" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">Portfolio A</text>
        <text x="200" y="52" textAnchor="middle" fill="#22c55e" fontSize="12">+40% return</text>
        <polyline points="60,200 90,160 120,190 150,120 180,170 210,100 240,150 270,80 300,130 330,100 340,90" fill="none" stroke="#22c55e" strokeWidth="2"/>
        <text x="200" y="240" textAnchor="middle" fill="#ef4444" fontSize="12">-35% drawdown</text>
        <text x="200" y="258" textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="700">Sharpe: 0.8</text>
        <line x1="380" y1="20" x2="380" y2="270" stroke="#334155" strokeWidth="1"/>
        <text x="380" y="145" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="800">VS</text>
        <text x="550" y="35" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">Portfolio B</text>
        <text x="550" y="52" textAnchor="middle" fill="#22c55e" fontSize="12">+25% return</text>
        <polyline points="420,200 450,185 480,175 510,165 540,155 570,145 600,135 630,125 660,115 680,110" fill="none" stroke="#0ea5e9" strokeWidth="2"/>
        <text x="550" y="240" textAnchor="middle" fill="#22c55e" fontSize="12">-8% drawdown</text>
        <text x="550" y="258" textAnchor="middle" fill="#0ea5e9" fontSize="13" fontWeight="700">Sharpe: 1.9 ✓</text>
        <text x="370" y="280" textAnchor="middle" fill="#64748b" fontSize="11">Portfolio B wins on risk-adjusted basis despite lower total return</text>
      </svg>
    ),
    "quant-funds": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {[[360,55,180,135],[360,55,540,135],[180,135,100,215],[180,135,260,215],[540,135,460,215],[540,135,620,215],[260,215,460,215]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1.5"/>
        ))}
        {[[360,55,"#0ea5e9","DATA"],[180,135,"#22c55e","SIGNALS"],[540,135,"#f59e0b","RISK MGT"],[100,215,"#a855f7","STRATEGY"],[260,215,"#0ea5e9","BACKTEST"],[460,215,"#22c55e","EXECUTION"],[620,215,"#ef4444","P&L"]].map(([x,y,color,label],i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="30" fill="#0f172a" stroke={color} strokeWidth="2"/>
            <circle cx={x} cy={y} r="28" fill={color+"15"}/>
            <text x={x} y={y+4} textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{label}</text>
          </g>
        ))}
        <text x="370" y="270" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600">How a quantitative trading system is structured</text>
      </svg>
    ),
  };
  return illustrations[id] || null;
}

function ArticleView({ article, onBack }) {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "32px 20px" : "48px 32px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "1px solid #334155", borderRadius: 10, padding: "8px 16px", color: "#64748b", fontSize: 14, cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
        ← Back to Learn
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ background: article.tagColor + "20", border: `1px solid ${article.tagColor}40`, borderRadius: 6, padding: "3px 10px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: article.tagColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>{article.tag}</span>
        </div>
        <span style={{ fontSize: 13, color: "#475569" }}>{article.readTime}</span>
      </div>
      <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 12, lineHeight: 1.2 }}>{article.title}</h1>
      <p style={{ fontSize: 18, color: "#64748b", lineHeight: 1.6, marginBottom: 40 }}>{article.subtitle}</p>
      <div style={{ marginBottom: 40, borderRadius: 20, overflow: "hidden", border: "1px solid #334155" }}>
        <ArticleIllustration id={article.id} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {article.content.map((block, i) => {
          if (block.type === "intro") return <p key={i} style={{ fontSize: 18, color: "#e2e8f0", lineHeight: 1.9, borderLeft: "3px solid #0ea5e9", paddingLeft: 20, margin: 0 }}>{block.text}</p>;
          if (block.type === "heading") return <h2 key={i} style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5, margin: 0, marginTop: 8 }}>{block.text}</h2>;
          if (block.type === "text") return <p key={i} style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.9, margin: 0 }}>{block.text}</p>;
          if (block.type === "highlight") return (
            <div key={i} style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 14, padding: 24 }}>
              <p style={{ fontSize: 15, color: "#7dd3fc", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>"{block.text}"</p>
            </div>
          );
          if (block.type === "formula") return (
            <div key={i} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{block.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: isMobile ? 14 : 18, color: "#e2e8f0", marginBottom: 16, whiteSpace: "pre-line" }}>{block.formula}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {block.vars.map((v) => (
                  <div key={v.var} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 13, color: "#0ea5e9", minWidth: 120, flexShrink: 0 }}>{v.var}</span>
                    <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          );
          if (block.type === "callout") return (
            <div key={i} style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", borderRadius: 16, padding: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h4 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0, marginBottom: 6 }}>{block.text}</h4>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: 0 }}>{block.subtext}</p>
              </div>
              <button onClick={() => navigate(`/backtest?ticker=${block.ticker}&strategy=${block.strategy}`)} style={{ padding: "12px 24px", background: "#fff", color: "#0ea5e9", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Launch Backtester →
              </button>
            </div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

function Learn() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const [selectedArticle, setSelectedArticle] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      <nav style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e293b", padding: isMobile ? "0 20px" : "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span onClick={() => navigate("/")} style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, cursor: "pointer" }}>
          <span style={{ color: "#0ea5e9", fontSize: 42, fontFamily: "Georgia, serif", verticalAlign: "bottom", lineHeight: 1 }}>Q</span>
          <span style={{ color: "#fff" }}>uantWorld</span>
        </span>
        <div style={{ display: "flex", gap: isMobile ? 12 : 24, alignItems: "center" }}>
          {!isMobile && <span onClick={() => navigate("/")} style={{ color: "#64748b", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Home</span>}
          {!isMobile && <span style={{ color: "#0ea5e9", fontSize: 14, fontWeight: 600 }}>Learn</span>}
          <button onClick={() => navigate("/backtest")} style={{ padding: isMobile ? "7px 14px" : "8px 20px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, fontSize: isMobile ? 13 : 14, fontWeight: 700, cursor: "pointer" }}>
            {isMobile ? "Backtest →" : "Backtest →"}
          </button>
        </div>
      </nav>
      {selectedArticle ? (
        <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "40px 20px" : "60px 48px" }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>Free education</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, color: "#fff", letterSpacing: -2, marginBottom: 16, lineHeight: 1.1 }}>
              Learn quant finance.<br />
              <span style={{ color: "#0ea5e9" }}>Simply.</span>
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 20, color: "#64748b", maxWidth: 560, lineHeight: 1.7 }}>
              From moving averages to hedge fund strategies — everything explained in plain English with real examples you can test yourself.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
            ))}
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(14,165,233,0.1) 100%)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 20, padding: 28, marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ fontSize: 40 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ background: "#8b5cf6", borderRadius: 6, padding: "3px 10px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>Coming Soon</span>
                </div>
              </div>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 6px" }}>Machine Learning Strategies</h3>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                We're building ML-powered trading strategies — Logistic Regression, Random Forest, and LSTM Neural Networks. Learn how algorithms trained on historical data generate buy/sell signals, and test them against traditional strategies.
              </p>
            </div>
          </div>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 36, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Ready to put it into practice?</h3>
              <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Test any strategy on real market data — free, no signup required.</p>
            </div>
            <button onClick={() => navigate("/backtest")} style={{ padding: "14px 32px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              Launch Backtester →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Learn;