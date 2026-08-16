import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "./useWindowSize";
import { useAuth } from "./AuthContext";
import { MathExpr } from "./MathRenderer";
import Navbar from "./Navbar";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
      { type: "intro", text: "Quantitative trading — or 'quant trading' — is the use of **mathematical models, statistical analysis, and algorithms** to make trading decisions. Instead of a human saying 'Apple looks good,' a quant system says 'based on 10 years of data, there's a 62% probability this trade is profitable.'" },
      { type: "tldr", points: ["Quant trading replaces gut instinct with math and rules", "Renaissance Technologies' Medallion Fund averaged 66% returns — using 100% algorithms", "The strategies on QuantWorld are the same building blocks every quant researcher starts from"] },
      { type: "heading", text: "How it started" },
      { type: "text", text: "**Before the 1970s, all trading was gut instinct.** Then Ed Thorp — a math professor — proved you could beat blackjack with probability. He applied the same logic to markets and made a fortune. By the 1990s, Renaissance Technologies was staffed entirely by physicists and astronomers. Not a single finance person." },
      { type: "stat", stats: [{ value: "66%", label: "Avg annual return", sub: "Renaissance Medallion Fund since 1988", color: "#22c55e" }, { value: "$150B+", label: "Top quant firm AUM", sub: "Two Sigma, Citadel, D.E. Shaw combined", color: "#0ea5e9" }] },
      { type: "myth", myth: "You need a finance degree to understand quant trading.", reality: "Renaissance Technologies hired mathematicians, linguists, and astronomers. The edge is in **pattern recognition and statistics** — not memorising accounting textbooks." },
      { type: "heading", text: "How it works today" },
      { type: "text", text: "**Quant trading works in layers.** At the base: data — prices, earnings, even satellite images of parking lots to predict retail sales. Above that: signals — patterns that suggest a trade might work. At the top: risk management — how much to bet, and when to stop." },
      { type: "heading", text: "The two fundamental bets" },
      { type: "text", text: "**Trend following** bets that momentum continues — buy when short-term average crosses above the long-term one. **Mean reversion** bets the opposite — prices stretched too far will snap back. RSI and Bollinger Bands are both built on this. Every strategy on QuantWorld is one of these two ideas." },
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
      { type: "intro", text: "A moving average takes the **average closing price over a set number of days**, and updates every single day as new prices come in. It smooths out the daily noise so you can see the actual trend." },
      { type: "tldr", points: ["Moving averages smooth out daily price noise to reveal the underlying trend", "MA20 = fast (1 month). MA50 = slow (2.5 months)", "When MA20 crosses above MA50 → buy signal. When it crosses below → sell"] },
      { type: "heading", text: "A simple example" },
      { type: "steps", label: "Worked Example", steps: [
        { label: "Day 1–5 prices",   expr: "\\$10,\\; \\$12,\\; \\$11,\\; \\$13,\\; \\$14" },
        { label: "5-day MA",         expr: "\\frac{10 + 12 + 11 + 13 + 14}{5} = \\$12.00" },
        { label: "Day 6 closes at",  expr: "\\$15 \\quad \\Rightarrow \\quad \\text{oldest price (\\$10) drops off}" },
        { label: "New 5-day MA",     expr: "\\frac{12 + 11 + 13 + 14 + 15}{5} = \\$13.00" },
      ]},
      { type: "formula", label: "Formula", formula: "MA(n) = \\frac{P_1 + P_2 + ... + P_n}{n}", vars: [{ var: "n", desc: "Number of days in the window (e.g. 20 or 50)" }, { var: "P_1 ... P_n", desc: "Closing prices over the last n days" }] },
      { type: "heading", text: "Why 20 and 50 days?" },
      { type: "text", text: "**MA20 = roughly one trading month.** Reacts fast to recent moves. MA50 = 2.5 months — slower, reflects the medium-term trend. When MA20 crosses above MA50, short-term momentum is overtaking the longer trend. That's the buy signal." },
      { type: "tip", text: "The **Golden Cross** — when the 50-day MA crosses above the 200-day MA — is one of the most watched signals on Wall Street. When it happens on SPY, institutional traders take notice." },
      { type: "stat", stats: [{ value: "200", label: "The most-watched number on Wall Street", sub: "Stocks above their 200-day MA = bull trend. Below it = bear trend", color: "#f59e0b" }] },
      { type: "myth", myth: "MA Crossover signals are precise and timely.", reality: "By the time MA20 crosses above MA50, the stock has **already been rising for days or weeks.** You're always late. That's the fundamental trade-off — certainty vs. timing." },
      { type: "callout", text: "Try it yourself", subtext: "Test MA Crossover on TSLA — a volatile stock where the lag becomes very visible", ticker: "TSLA", strategy: "ma_crossover" }
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
      { type: "intro", text: "RSI **measures how fast and how much a stock's price has been moving**, and gives you a number between 0 and 100. Above 70 = moving up too fast, may pull back. Below 30 = falling too fast, may bounce." },
      { type: "tldr", points: ["RSI measures the speed of price movement, not just its direction", "RSI below 30 = oversold → buy. RSI above 70 = overbought → sell", "Works best in choppy, range-bound markets — not strong trends"] },
      { type: "heading", text: "The formula" },
      { type: "formula", label: "Formula", formula: "RSI = 100 - \\frac{100}{1 + RS}", vars: [{ var: "RS", desc: "Average gain over 14 days ÷ average loss over 14 days" }, { var: "Average gain", desc: "Mean of all up days over the last 14 trading days" }, { var: "Average loss", desc: "Mean of all down days over the last 14 trading days" }] },
      { type: "text", text: "**All up days for two weeks straight → RSI near 100. All down days → RSI near 0.** In practice it bounces between 30 and 70 most of the time, which is why the extremes are meaningful." },
      { type: "stat", stats: [{ value: "14", label: "Default period (days)", sub: "Used to calculate average gains and losses", color: "#0ea5e9" }, { value: "30 / 70", label: "The thresholds", sub: "Below 30 = buy signal. Above 70 = sell signal", color: "#22c55e" }] },
      { type: "myth", myth: "RSI below 30 means the stock is guaranteed to bounce.", reality: "In a bear market, **stocks can stay oversold for weeks.** RSI is a probability indicator — it says a bounce is more likely than usual, not that it's certain. Context matters enormously." },
      { type: "highlight", text: "RSI was developed by J. Welles Wilder Jr. and published in 1978. It remains one of the most widely used indicators in trading 45 years later — a rare sign that the underlying idea is genuinely robust." },
      { type: "tip", text: "Professional traders use **RSI + Bollinger Bands together.** RSI confirms the momentum extreme. Bollinger Bands confirm the price is statistically unusual. Two independent signals pointing the same way is far stronger than either alone." },
      { type: "callout", text: "Try it yourself", subtext: "Run RSI on AMZN over 1 year to see how it handles a range-bound period", ticker: "AMZN", strategy: "rsi" }
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
      { type: "intro", text: "Bollinger Bands draw **three lines on a chart: a 20-day average in the middle, and two bands 2 standard deviations above and below it.** Price at the lower band = may have fallen too far. Upper band = may have risen too far." },
      { type: "tldr", points: ["The bands self-adjust — they widen in volatile markets and narrow in calm ones", "Price touching the lower band = potential buy. Upper band = potential sell", "Underperforms badly in strong bull markets — price just drifts up, never touching the lower band"] },
      { type: "formula", label: "Formula", formula: "Upper = MA_{20} + 2\\sigma\nLower = MA_{20} - 2\\sigma", vars: [{ var: "MA_{20}", desc: "20-day simple moving average of closing prices" }, { var: "\\sigma", desc: "Standard deviation of closing prices over the last 20 days" }, { var: "2\\sigma", desc: "Two standard deviations — ~95% of prices fall within this range" }] },
      { type: "stat", stats: [{ value: "95%", label: "Of prices stay inside the bands", sub: "By statistical definition — touches are genuinely rare events worth noticing", color: "#8b5cf6" }] },
      { type: "text", text: "**The bands are dynamic — that's the key insight.** They widen automatically when a stock starts swinging wildly and tighten when it calms down. A lower-band touch on a calm stock is a completely different signal to one on TSLA." },
      { type: "tip", text: "**The Bollinger Squeeze** — when the bands narrow unusually tight — often precedes a big move in either direction. Traders watch for the squeeze as an early warning before a breakout." },
      { type: "myth", myth: "Bollinger Bands work on any stock in any market.", reality: "In a **strong uptrend, price just drifts upward and never touches the lower band.** The strategy sits in cash the whole time the market rallies. Try it on SPY over the past year and you'll see it immediately." },
      { type: "highlight", text: "Bollinger Bands were developed by John Bollinger in the 1980s. He designed them to give relative definitions of 'high' and 'low' — always relative to recent volatility, never an absolute price level." },
      { type: "callout", text: "Try it yourself", subtext: "Test Bollinger Bands on TSLA over 1 year — volatile stocks show this strategy at its best", ticker: "TSLA", strategy: "bollinger" }
    ]
  },
  {
    id: "macd",
    icon: "📉",
    tag: "Strategies",
    tagColor: "#22c55e",
    title: "What is MACD?",
    subtitle: "The momentum indicator used by traders worldwide to spot trend reversals early",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "MACD stands for Moving Average Convergence Divergence — but the idea is simple. **Take two moving averages, subtract one from the other, and watch whether the gap is growing or shrinking.** Growing = momentum building. Shrinking = momentum fading." },
      { type: "tldr", points: ["MACD tracks the gap between a fast and slow moving average", "When the MACD line crosses above the signal line → buy. Below → sell", "Faster signals than MA Crossover — but more false signals in choppy markets"] },
      { type: "formula", label: "The two lines", formula: "MACD = EMA_{12} - EMA_{26}\nSignal = EMA_9(MACD)", vars: [{ var: "EMA_{12}", desc: "12-day exponential moving average — the fast line" }, { var: "EMA_{26}", desc: "26-day exponential moving average — the slow line" }, { var: "Signal", desc: "9-day EMA of the MACD line — generates the actual buy/sell trigger" }] },
      { type: "text", text: "**Both lines hover around zero.** When a stock is trending up, the short-term average pulls ahead — MACD rises above zero. When momentum fades, the gap closes. The actual buy signal fires when the MACD line crosses above the signal line — not when it crosses zero." },
      { type: "stat", stats: [{ value: "12/26/9", label: "The standard MACD settings", sub: "Fast average / Slow average / Signal line — used by traders worldwide", color: "#10b981" }] },
      { type: "tip", text: "MACD uses **exponential** moving averages — they weight recent prices more heavily than older ones. This makes it react faster than plain MA Crossover, which is why it generates signals earlier but also creates more false alarms." },
      { type: "myth", myth: "MACD works in all market conditions.", reality: "In flat, sideways markets, **the lines cross back and forth constantly** — triggering dozens of small losing trades. MACD is a trend-following tool. No trend, no edge." },
      { type: "highlight", text: "MACD was developed by Gerald Appel in the late 1970s. It appears in virtually every charting platform in the world and is used by traders at every level — from retail to institutional desks." },
      { type: "callout", text: "Try it yourself", subtext: "Run MACD on NVDA or TSLA — momentum stocks where it performs well", ticker: "NVDA", strategy: "macd" }
    ]
  },
  {
    id: "volatility",
    icon: "⚡",
    tag: "Foundations",
    tagColor: "#0ea5e9",
    title: "What is Volatility?",
    subtitle: "Why some stocks swing wildly and others barely move — and why it matters for every strategy",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "Volatility is **how much a stock's price swings around**. SPY barely moves day to day. TSLA can drop 10% on a Tuesday for no reason. Neither is better or worse — but it completely changes which strategies you should use." },
      { type: "tldr", points: ["Volatility = how wildly a stock moves day to day", "SPY ≈ 15% annualized. TSLA ≈ 70%. Crypto can hit 100%+", "Mean reversion strategies love high volatility. Trend-following strategies hate it"] },
      { type: "formula", label: "How it's measured", formula: "\\sigma = \\sqrt{\\frac{\\sum (r_i - \\bar{r})^2}{n}}", vars: [{ var: "r_i", desc: "Each individual daily return" }, { var: "\\bar{r}", desc: "The mean (average) daily return over the period" }, { var: "n", desc: "Number of trading days measured" }, { var: "\\sigma", desc: "Volatility — how far returns scatter from the average" }] },
      { type: "stat", stats: [{ value: "~15%", label: "SPY annualized volatility", sub: "Calm, steady — great for trend following", color: "#22c55e" }, { value: "~70%", label: "TSLA annualized volatility", sub: "Wild swings — ideal for mean reversion", color: "#ef4444" }] },
      { type: "heading", text: "Why it matters for strategies" },
      { type: "text", text: "**Bollinger Bands and RSI need big swings to work.** On a calm stock, price never reaches the outer bands and RSI never dips below 30 — the strategy barely trades. Meanwhile, MA Crossover and MACD get wrecked by high volatility — the lines cross back and forth constantly, triggering dozens of small losses." },
      { type: "myth", myth: "High volatility = bad investment.", reality: "Volatility and direction are completely separate. **A volatile stock that doubles is great.** A calm stock that loses 30% slowly is terrible. Volatility just tells you about the ride — not the destination." },
      { type: "highlight", text: "The VIX — the 'fear gauge' — measures expected S&P 500 volatility over the next 30 days. When it spikes above 30, markets are in panic mode. High VIX completely changes which strategies work — the regime has shifted." },
      { type: "callout", text: "See it in action", subtext: "Run RSI on TSLA vs SPY — see how differently the same strategy behaves at different volatility levels", ticker: "TSLA", strategy: "rsi" }
    ]
  },
  {
    id: "backtesting",
    icon: "🔬",
    tag: "Foundations",
    tagColor: "#0ea5e9",
    title: "What is Backtesting?",
    subtitle: "How traders use historical data to test a strategy before risking real money",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "Backtesting means **replaying a trading strategy on historical data** to see what would have happened. Did it make money? How bad was the worst drop? You're time-traveling to stress-test an idea before any real money is at stake." },
      { type: "tldr", points: ["Backtesting simulates a strategy on past prices to measure its real performance", "Good results show return, Sharpe ratio, and max drawdown — not just profit", "Overfitting is the #1 trap — a strategy that looks perfect on history may have just memorized it"] },
      { type: "text", text: "**The concept is simple:** take a stock's historical prices, apply your buy/sell rules day-by-day from the past to today, and track what your portfolio would have been worth at every point. That's exactly what QuantWorld does — every trade simulated, every metric calculated." },
      { type: "stat", stats: [{ value: "Sharpe", label: "Return per unit of risk", sub: "Above 1.0 is good. Above 2.0 is excellent", color: "#0ea5e9" }, { value: "Drawdown", label: "Worst peak-to-trough loss", sub: "The number that makes people panic-sell", color: "#ef4444" }] },
      { type: "myth", myth: "A high return on a backtest means the strategy works.", reality: "A return number alone means nothing. **If a strategy made 80% last year but had a -60% drawdown**, most people would have panic-sold at the bottom and locked in a loss. Sharpe ratio, drawdown, and volatility are what actually matter." },
      { type: "heading", text: "The big catch: overfitting" },
      { type: "text", text: "**If you tweak a strategy until it looks perfect on historical data, you've probably just memorised the past** — not found a real edge. A strategy that made 80% last year might have gotten lucky on three big moves that won't repeat." },
      { type: "tip", text: "This is why QuantWorld uses **well-known, decade-tested strategies** — not custom-built ones that only look good on one specific chart. The ML strategies use walk-forward validation, meaning every signal was generated on data the model genuinely hadn't seen." },
      { type: "highlight", text: "Quant funds run millions of backtests as part of their research process, testing thousands of variations to find signals that are genuinely predictive — not just lucky." },
      { type: "callout", text: "Try it yourself", subtext: "Run any strategy on SPY across 1 year and compare it to buy-and-hold", ticker: "SPY", strategy: "ma_crossover" }
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
      { type: "intro", text: "Two investors both made 20% last year. **Without knowing how much risk each took, you cannot say who did better.** If one had a smooth ride and the other's portfolio dropped 40% before recovering — they didn't perform equally. Risk-adjusted returns measure exactly this." },
      { type: "tldr", points: ["A 20% return means nothing without knowing the risk taken to get it", "Sharpe ratio = return ÷ all volatility. Sortino = return ÷ downside volatility only", "Max drawdown = worst peak-to-trough loss — the number that makes people panic-sell"] },
      { type: "myth", myth: "The strategy with the highest return is always the best.", reality: "**A fund making 15%/year with -8% max drawdown beats one making 20%/year with -40% drawdown.** The second fund loses clients every rough patch. Real performance is return per unit of risk — not raw return." },
      { type: "heading", text: "The Sharpe Ratio" },
      { type: "formula", label: "Formula", formula: "Sharpe = \\frac{R_p - R_f}{\\sigma_p}", vars: [{ var: "R_p", desc: "Portfolio return — your annualised return" }, { var: "R_f", desc: "Risk-free rate — what you'd earn holding Treasury bills" }, { var: "\\sigma_p", desc: "Standard deviation of ALL daily returns — up days and down days" }] },
      { type: "text", text: "**A higher Sharpe means more return earned per unit of risk.** Sharpe of 1.0 = acceptable. 2.0+ = excellent. The best quant funds in the world target 1.5–2.5 consistently." },
      { type: "stat", stats: [{ value: "0.76", label: "Warren Buffett's lifetime Sharpe", sub: "Impressive at scale — but lower than many quant funds", color: "#f59e0b" }, { value: "2.0+", label: "Elite quant fund target", sub: "What the best systematic funds aim for consistently", color: "#22c55e" }] },
      { type: "heading", text: "The Sortino Ratio — Sharpe's smarter cousin" },
      { type: "text", text: "**Sharpe has one flaw: it penalises big up days the same as big down days.** But no investor complains about a 5% gain day. Why should that hurt your score? The Sortino ratio fixes this by only measuring downside volatility." },
      { type: "formula", label: "Formula", formula: "Sortino = \\frac{R_p - R_f}{\\sigma_d}", vars: [{ var: "R_p", desc: "Portfolio return — identical to Sharpe" }, { var: "R_f", desc: "Risk-free rate — identical to Sharpe" }, { var: "\\sigma_d", desc: "Downside deviation — standard deviation of NEGATIVE returns only" }] },
      { type: "text", text: "**The only difference is the denominator.** Sortino ignores positive days entirely when calculating risk. This means a strategy that has big wins but small losses will have a much higher Sortino than Sharpe — correctly reflecting that it's a good strategy." },
      { type: "text", text: "Imagine two strategies both with Sharpe 0.8. **Strategy A has huge winning months but tiny losses. Strategy B swings wildly in both directions.** Sharpe treats them equally. Sortino gives Strategy A a 1.6 and Strategy B a 0.7 — revealing which one you'd actually want to hold." },
      { type: "heading", text: "Maximum Drawdown" },
      { type: "text", text: "**Max drawdown = the worst peak-to-trough decline you'd have experienced.** Portfolio hits $100k, drops to $60k, then recovers → max drawdown is -40%." },
      { type: "text", text: "**Most investors panic-sell during large drawdowns**, locking in losses permanently and missing the recovery. A strategy with a lower max drawdown is psychologically easier to hold — even if total return is slightly lower." },
      { type: "text", text: "**A fund making 15%/year with -8% drawdown beats one making 20%/year with -40% drawdown.** The second fund loses clients every rough patch." },
      { type: "callout", text: "Try it yourself", subtext: "Run Random Forest on AMZN 5y and compare the Sharpe vs Sortino — the gap reveals how well it avoided the 2022 crash", ticker: "AMZN", strategy: "random_forest" }
    ]
  },
  {
    id: "logistic-regression",
    icon: "🤖",
    tag: "ML Strategy",
    tagColor: "#a855f7",
    title: "Logistic Regression in Trading",
    subtitle: "How machine learning learns buy and sell signals directly from price history",
    readTime: "6 min read",
    content: [
      { type: "intro", text: "Logistic Regression doesn't use a fixed rule like 'buy when RSI drops below 30.' Instead, **it learns the rule from data.** Feed it years of price history — RSI, MACD, momentum, volatility — and it figures out which combinations historically predicted an up day. Then it applies those learned weights to generate signals going forward." },
      { type: "tldr", points: ["LR is trained on 80% of historical data, then generates signals on the rest", "It combines RSI, MACD, Bollinger Band position, momentum — all at once", "Unlike rule-based strategies, the signals adapt to what actually worked on that specific stock"] },
      { type: "heading", text: "From rules to learning" },
      { type: "text", text: "**Every strategy you've seen so far uses a fixed rule** — MA20 crosses MA50, buy. RSI below 30, buy. These rules were designed by human traders and tested manually." },
      { type: "text", text: "Logistic Regression takes a different approach. **It looks at historical price data and asks: given these indicators on this day, what usually happened next?** The model learns which indicator combinations tend to precede up days vs. down days." },
      { type: "stat", stats: [{ value: "9", label: "Features used", sub: "RSI, MACD, BB position, momentum (5/10/20d), MA ratio, volume", color: "#a855f7" }, { value: "80/20", label: "Train/test split", sub: "Model learns on first 80% of data, signals tested on remaining 20%", color: "#0ea5e9" }] },
      { type: "heading", text: "Feature engineering" },
      { type: "text", text: "**Raw price data is useless to a model.** A stock being at $150 means nothing — the model can't compare that number across different stocks or different years." },
      { type: "text", text: "**Feature engineering transforms raw prices into meaningful indicators.** RSI normalizes momentum on a 0–100 scale. MACD captures trend direction. Bollinger Band position shows whether price is statistically extreme. These numbers are comparable across stocks and time periods." },
      { type: "heading", text: "How the model generates signals" },
      { type: "text", text: "**The model learns a weight for each feature.** Maybe it discovers that RSI below 35 combined with positive 5-day momentum historically preceded up days 62% of the time on AAPL. Those weights get stored." },
      { type: "text", text: "On each new day, it takes the current indicator values, applies the learned weights, and **outputs a probability: 70% chance tomorrow is an up day.** If above 50%, the signal is Buy. Below 50%, stay in cash." },
      { type: "highlight", text: "Logistic Regression was first used for medical diagnosis — predicting whether a patient had a disease based on symptoms. The same math applies perfectly to trading: given these market 'symptoms,' what does the stock do next?" },
      { type: "heading", text: "Why it's better than a single indicator" },
      { type: "text", text: "**RSI alone misses trend context. MACD alone misses volatility context. LR uses all of them simultaneously** — weighting each by how predictive it actually was on this specific stock's history." },
      { type: "myth", myth: "More features always make the model smarter.", reality: "Adding irrelevant features can actually **hurt performance** by introducing noise the model tries to learn patterns from. Feature selection — choosing only genuinely predictive inputs — is as important as the model itself." },
      { type: "callout", text: "Test it live", subtext: "Run Logistic Regression on AAPL or TSLA and compare it to RSI or MACD", ticker: "AAPL", strategy: "logistic_regression" }
    ]
  },
  {
    id: "random-forest",
    icon: "🌲",
    tag: "ML Strategy",
    tagColor: "#a855f7",
    title: "Random Forest in Trading",
    subtitle: "Why 100 imperfect decision trees combined beat any single perfect rule",
    readTime: "6 min read",
    content: [
      { type: "intro", text: "A Random Forest builds **100 decision trees**, each trained on a slightly different random slice of the historical data and features. Each tree votes on tomorrow's direction. The majority wins. This ensemble approach is far more powerful than any single rule — or even Logistic Regression — because it captures complex, non-linear interactions between indicators." },
      { type: "tldr", points: ["100 decision trees each vote — majority decides the Buy/Sell signal", "Captures non-linear patterns that Logistic Regression misses", "More powerful but higher risk of overfitting on short datasets — use 3–5 year timeframes"] },
      { type: "heading", text: "What is a decision tree?" },
      { type: "text", text: "**A decision tree is a series of yes/no questions.** Is RSI below 40? → Yes. Is 5-day momentum positive? → Yes. Is MACD above signal line? → No → Predict: Down Day." },
      { type: "text", text: "**A single decision tree is brittle** — it overfits to the specific historical data it was trained on. **Random Forest fixes this by building 100 different trees**, each seeing a random subset of the training data and a random subset of features. Then averaging their votes." },
      { type: "stat", stats: [{ value: "100", label: "Decision trees per forest", sub: "Each trained on a random data + feature subset to prevent overfitting", color: "#22c55e" }, { value: "6", label: "Max tree depth", sub: "Limits complexity so trees generalize, not just memorize", color: "#a855f7" }] },
      { type: "heading", text: "Why it beats Logistic Regression" },
      { type: "text", text: "**Logistic Regression assumes the relationship between features and predictions is linear.** Random Forest has no such assumption — each tree can carve the feature space any way it wants." },
      { type: "text", text: "**Example:** LR might miss the pattern 'RSI below 30 AND volume spike → strong buy signal' because these two factors interact multiplicatively, not additively. A decision tree naturally captures this: 'If RSI < 30 AND vol_change > 0.5, predict Up.'" },
      { type: "highlight", text: "Random Forests are used by hedge funds for 'factor models' — predicting stock returns from dozens of fundamental and technical signals simultaneously. The ensemble approach mirrors the quant philosophy: no single signal is reliable, but many weak signals combined can be." },
      { type: "heading", text: "The overfitting risk" },
      { type: "text", text: "**More powerful models come with higher overfitting risk.** With only 1 year of daily data (~252 rows), 100 trees have plenty of capacity to memorise noise rather than learn real patterns." },
      { type: "myth", myth: "A more complex model will always find better patterns.", reality: "With 252 rows of data, 100 decision trees can **memorise every trade** rather than learn anything real. More data beats more complexity every time. Use 3–5 year timeframes for RF to see genuine edge." },
      { type: "tip", text: "QuantWorld's Random Forest uses **walk-forward validation** — every signal was generated on data the model had never seen. That 119% on AMZN 5y isn't a memorised backtest. It's a rolling out-of-sample result." },
      { type: "callout", text: "Test it live", subtext: "Run Random Forest on SPY over 3 years — more data gives the ensemble real patterns to learn", ticker: "SPY", strategy: "random_forest" }
    ]
  },
  {
    id: "quant-glossary",
    icon: "📖",
    tag: "Foundations",
    tagColor: "#0ea5e9",
    title: "Key Terms in Quant Finance",
    subtitle: "Alpha, overfitting, regime, signal — the jargon decoded in plain English",
    readTime: "6 min read",
    content: [
      { type: "intro", text: "Quant finance has its own language. **You'll see the same dozen or so terms in virtually every paper, article, and strategy discussion.** Once you know them, you can follow any conversation — and spot when someone doesn't actually know what they're talking about." },
      { type: "tldr", points: ["Alpha = returns above what the market gives for free. That's the whole game.", "Overfitting = a strategy that looks perfect on past data because it memorised it, not because it works", "Regime = the current market environment. Strategies that work in bull markets break in bear markets."] },
      { type: "heading", text: "The Core Concepts" },
      { type: "terms", items: [
        { term: "Alpha", color: "#22c55e", def: "The return you earned above what holding the market would have given you.", example: "Market up 15%, you up 20% → alpha of 5%" },
        { term: "Beta", color: "#0ea5e9", def: "How much your portfolio moves when the market moves. Beta 1.5 = you move 50% more than the index in both directions.", example: "Most retail strategies have high beta — they just ride the market" },
        { term: "Signal", color: "#f59e0b", def: "Any pattern, indicator, or data point that suggests a trade might be profitable. Most signals are weak alone — quant funds combine dozens.", example: "RSI below 30, MACD crossover, ML model outputting 68% probability" },
        { term: "Regime", color: "#a855f7", def: "The current market environment — bull (rising), bear (falling), or choppy (sideways). The same strategy can win in one regime and fail in another.", example: "Trend-following loves bull regimes. Mean reversion shines in choppy ones" }
      ]},
      { type: "heading", text: "The Honesty Terms" },
      { type: "terms", items: [
        { term: "Overfitting", color: "#ef4444", def: "When a strategy has been tuned so precisely to historical data that it just memorised the past. Looks perfect in backtests, fails immediately in live trading.", example: "47 custom rules each catching one specific old move = overfitted" },
        { term: "In-Sample", color: "#64748b", def: "The data a model was trained on. Testing a model on its own training data is like giving a student the exam answers in advance — meaningless.", example: "Training on 2015–2020 then testing on 2015–2020 = dishonest backtest" },
        { term: "Out-of-Sample", color: "#0ea5e9", def: "Data the model genuinely never saw during training. The only honest measure of real performance.", example: "Training on 2015–2020, testing on 2020–2024 = honest result" },
        { term: "Walk-Forward", color: "#10b981", def: "The gold standard — train on the first chunk, test on the next, retrain, test again. Every prediction made on truly unseen data. QuantWorld's ML strategies use this.", example: "Retrain monthly, only predict the next month you haven't seen yet" }
      ]},
      { type: "heading", text: "The Strategy Terms" },
      { type: "terms", items: [
        { term: "Mean Reversion", color: "#8b5cf6", def: "The bet that extreme price moves will reverse back to average. RSI and Bollinger Bands are built on this philosophy.", example: "Stock drops 15% in a week → likely oversold → may bounce" },
        { term: "Momentum", color: "#0ea5e9", def: "The opposite bet — that recent winners keep winning and recent losers keep losing. MA Crossover and MACD are momentum strategies.", example: "Stock has trended up 3 months straight → likely continues" },
        { term: "Feature Engineering", color: "#f59e0b", def: "Transforming raw prices into inputs a model can learn from. Raw price ($150) is meaningless across stocks and time. RSI, MACD, and momentum ratios are comparable.", example: "Where most of the real alpha in ML trading comes from" },
        { term: "Slippage", color: "#f97316", def: "The gap between the price you expected and the price you actually got. Every trade costs a little extra — QuantWorld backtests assume zero cost, so real results are slightly lower.", example: "Buy order sent at $100.00, filled at $100.04 = 4¢ slippage" }
      ]},
      { type: "heading", text: "The Basics" },
      { type: "terms", items: [
        { term: "Long", color: "#22c55e", def: "You own the asset. You profit when the price goes up. All QuantWorld strategies are long-only — you're either invested or in cash.", example: "Buy 100 shares of AAPL = long position" },
        { term: "Short", color: "#ef4444", def: "You borrow shares and sell them, hoping to buy them back cheaper later. Profit when price falls. Requires a margin account — riskier than going long.", example: "Borrow and sell at $100, buy back at $80 = $20 profit" }
      ]},
      { type: "myth", myth: "These terms are just jargon to sound smart.", reality: "**Alpha, beta, regime, overfitting** — each one describes a concept that genuinely changes how you evaluate a strategy. When someone says 'our Sharpe is 1.8 out-of-sample across regimes,' they're saying something specific and verifiable. That's why the language exists." },
      { type: "callout", text: "See these in action", subtext: "Run any strategy and check the Performance Breakdown — alpha, drawdown, and Sharpe all in one place", ticker: "SPY", strategy: "ma_crossover" }
    ]
  },
  {
    id: "win-rate",
    icon: "🎯",
    tag: "Metrics",
    tagColor: "#f59e0b",
    title: "Win Rate & Expectancy",
    subtitle: "Why a strategy that loses 70% of its trades can still make you rich",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "Win rate is the percentage of trades that make money. **It sounds like the most important number — but it's almost meaningless on its own.** A strategy that wins 30% of the time can massively outperform one that wins 80%. The size of the wins and losses is what actually matters." },
      { type: "tldr", points: ["Win rate alone tells you nothing — you need to know the size of wins vs losses", "Expectancy = the average profit per trade, accounting for both outcomes", "Trend-following strategies win rarely but make huge gains when right. Mean reversion wins often but makes small gains each time."] },
      { type: "heading", text: "The maths that breaks the intuition" },
      { type: "steps", label: "Strategy A — 80% win rate", steps: [
        { label: "Win rate",   expr: "W = 80\\%,\\quad \\bar{w} = +1\\%\\text{ per win}" },
        { label: "Loss rate",  expr: "L = 20\\%,\\quad \\bar{l} = -10\\%\\text{ per loss}" },
        { label: "Expectancy", expr: "E = (0.80 \\times 1\\%) + (0.20 \\times -10\\%) = -1.2\\%\\text{ per trade}" },
      ]},
      { type: "steps", label: "Strategy B — 30% win rate", steps: [
        { label: "Win rate",   expr: "W = 30\\%,\\quad \\bar{w} = +15\\%\\text{ per win}" },
        { label: "Loss rate",  expr: "L = 70\\%,\\quad \\bar{l} = -3\\%\\text{ per loss}" },
        { label: "Expectancy", expr: "E = (0.30 \\times 15\\%) + (0.70 \\times -3\\%) = +2.4\\%\\text{ per trade}" },
      ]},
      { type: "formula", label: "Expectancy Formula", formula: "E = (W \\times \\bar{w}) - (L \\times \\bar{l})", vars: [{ var: "W", desc: "Win rate — fraction of trades that are profitable (e.g. 0.40)" }, { var: "\\bar{w}", desc: "Average size of winning trades" }, { var: "L", desc: "Loss rate — equals 1 − W" }, { var: "\\bar{l}", desc: "Average size of losing trades" }] },
      { type: "stat", stats: [{ value: "R/R", label: "Risk / Reward Ratio", sub: "How much you make on wins vs lose on losses — more important than win rate", color: "#f59e0b" }, { value: "E > 0", label: "Positive Expectancy", sub: "The only real requirement for a strategy to be profitable long-term", color: "#22c55e" }] },
      { type: "myth", myth: "A higher win rate always means a better strategy.", reality: "**Trend-following strategies like MA Crossover often win less than 50% of trades** — but the winning trades are large and the losing trades are small and cut early. The rare big wins more than cover all the small losses." },
      { type: "heading", text: "How strategies differ" },
      { type: "text", text: "**Mean reversion strategies (RSI, Bollinger Bands) tend to have high win rates** — 55–70% — but small wins. They collect lots of small gains and occasionally get caught in a large trending move against them." },
      { type: "text", text: "**Trend-following strategies have lower win rates** — often 35–50% — but when a real trend develops, they ride it for large gains. The wins are disproportionately big. Both approaches can work — the expectancy is what matters, not the win rate." },
      { type: "tip", text: "The **Kelly Criterion** is a formula that uses expectancy to calculate the optimal bet size for each trade — maximising long-run growth without risking ruin. Professional quant funds use it (or a fractional version) for position sizing." },
      { type: "callout", text: "Test it yourself", subtext: "Run RSI vs MA Crossover on the same stock — compare their win frequencies vs return sizes", ticker: "AAPL", strategy: "rsi" }
    ]
  },
  {
    id: "calmar-ratio",
    icon: "🛡️",
    tag: "Metrics",
    tagColor: "#f59e0b",
    title: "Calmar Ratio & Drawdown Recovery",
    subtitle: "The metric serious fund allocators use when raw returns aren't enough",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "The Calmar Ratio divides your annualised return by your maximum drawdown. **It answers the most practical question in investing: how much return are you getting for each unit of pain?** A fund making 20% with a -5% drawdown is completely different to one making 20% with a -40% drawdown." },
      { type: "tldr", points: ["Calmar = Annualised Return ÷ Max Drawdown — return per unit of risk taken", "Above 1.0 is solid. Above 3.0 is exceptional.", "Drawdown recovery time is just as important as the depth — a -20% loss takes a 25% gain just to get back to even"] },
      { type: "formula", label: "Formula", formula: "Calmar = \\frac{R_{ann}}{|DD_{max}|}", vars: [{ var: "R_{ann}", desc: "Annualised return — compounded yearly return over the period" }, { var: "DD_{max}", desc: "Maximum drawdown — the worst peak-to-trough loss (as a positive number)" }] },
      { type: "stat", stats: [{ value: "1.0+", label: "Solid Calmar", sub: "Making at least 1% of annual return per 1% of max drawdown", color: "#f59e0b" }, { value: "3.0+", label: "Exceptional", sub: "What elite quant strategies target in risk-managed portfolios", color: "#22c55e" }] },
      { type: "heading", text: "The maths of recovery" },
      { type: "text", text: "**Drawdowns are asymmetric — they hurt more than they look.** Losing 20% feels like a moderate setback. But the maths of recovery is brutally unfair:" },
      { type: "steps", label: "The Asymmetry of Losses", steps: [
        { label: "Loss of −20%",  expr: "\\frac{1}{0.80} - 1 = +25\\%\\text{ gain needed to recover}" },
        { label: "Loss of −40%",  expr: "\\frac{1}{0.60} - 1 = +67\\%\\text{ gain needed to recover}" },
        { label: "Loss of −50%",  expr: "\\frac{1}{0.50} - 1 = +100\\%\\text{ gain needed to recover}" },
        { label: "Loss of −75%",  expr: "\\frac{1}{0.25} - 1 = +300\\%\\text{ gain needed to recover}" },
      ]},
      { type: "tip", text: "**Time underwater matters as much as depth.** A fund can recover from a -30% drawdown in 3 months or take 3 years. The longer a strategy stays below its peak, the more client redemptions hit — creating a death spiral even if the strategy eventually recovers." },
      { type: "myth", myth: "If a strategy recovers fully, the drawdown doesn't matter.", reality: "**Investors don't just care about the end result.** A -50% drawdown that recovered over 5 years means investors spent 5 years underwater, often panic-selling at the bottom. Shallow, fast-recovering drawdowns are worth sacrificing some return for." },
      { type: "heading", text: "Calmar vs Sharpe" },
      { type: "text", text: "**Sharpe ratio uses daily volatility.** This penalises a strategy that has big up days — even though big up days are exactly what you want. **Calmar only cares about the worst sustained loss** — the most investor-relevant measure of risk." },
      { type: "text", text: "In practice, **professional fund allocators look at Sharpe, Sortino, and Calmar together.** Each catches different types of risk. A strategy that scores well on all three is genuinely robust." },
      { type: "callout", text: "Check drawdowns live", subtext: "Run any strategy on TSLA 3y — one of the highest drawdown environments to test against", ticker: "TSLA", strategy: "bollinger" }
    ]
  },
  {
    id: "quant-funds",
    icon: "🏛️",
    tag: "Industry",
    tagColor: "#f97316",
    title: "How Do Quant Funds Actually Work?",
    subtitle: "Inside the firms that use math to beat the market",
    readTime: "7 min read",
    content: [
      { type: "intro", text: "Quantitative hedge funds make trading decisions **using mathematical models and algorithms — no human makes individual trade decisions.** They manage hundreds of billions and employ mathematicians, physicists, and engineers, not traditional finance people." },
      { type: "tldr", points: ["Quant funds run on algorithms — humans set the rules, not the trades", "They test thousands of signals; most fail — only statistically proven ones survive", "The edge isn't the idea. It's execution, risk management, and not overfitting"] },
      { type: "heading", text: "The big names" },
      { type: "text", text: "**Renaissance Technologies** is widely considered the most successful investment firm in history. Its Medallion Fund has averaged 66% annual returns before fees since 1988 — no other fund is even close." },
      { type: "text", text: "**Two Sigma, Citadel, D.E. Shaw, and Jane Street** are other major players — each employing thousands of researchers and engineers and trading billions of dollars daily." },
      { type: "stat", stats: [{ value: "66%", label: "Renaissance Medallion avg return", sub: "Before fees, since 1988 — the greatest track record in finance history", color: "#22c55e" }] },
      { type: "heading", text: "The research process" },
      { type: "text", text: "Quant funds hunt for 'alpha' — **returns above what the market normally gives you.** Does the stock rise after earnings? Does high short interest predict drops? Does satellite data on parking lots predict retail sales?" },
      { type: "text", text: "**Most ideas fail.** The ones that survive rigorous statistical testing become signals — inputs into a model that trades automatically." },
      { type: "highlight", text: "Jim Simons: 'We search through historical data looking for anomalous patterns that we would not expect to occur by chance. We then ask whether these patterns might be expected to persist into the future.'" },
      { type: "myth", myth: "Quant funds have secret strategies no one else knows about.", reality: "**The basic ideas are well-known.** Everyone knows moving averages exist. The edge at Renaissance is in execution — handling transaction costs at scale, avoiding overfitting across thousands of signals, and managing risk across 500 simultaneous positions." },
      { type: "tip", text: "**MA Crossover, RSI, Bollinger Bands, MACD** — these are the exact same building blocks quant researchers start from. Understanding why they work, when they fail, and what risk-adjusted return means is the foundation every quant needs." },
      { type: "callout", text: "Start backtesting", subtext: "Apply what you've learned — test a strategy on any stock", ticker: "SPY", strategy: "ma_crossover" }
    ]
  },
  {
    id: "hft",
    icon: "⚡",
    tag: "Industry",
    tagColor: "#f97316",
    title: "What is High-Frequency Trading?",
    subtitle: "The arms race happening in microseconds beneath every trade you make",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "High-frequency trading (HFT) firms execute **millions of trades per day, holding positions for milliseconds.** They don't predict where stocks are going — they profit from tiny inefficiencies in how orders flow through markets, faster than any human could react." },
      { type: "tldr", points: ["HFT firms make fractions of a cent per trade — but execute millions of trades per day", "Speed is the edge: firms spend millions on co-location to shave microseconds off execution", "HFT is not the same as algorithmic trading — most quant strategies hold positions for days or weeks"] },
      { type: "heading", text: "How it actually makes money" },
      { type: "text", text: "**The most common HFT strategy is market making.** A market maker continuously posts both a buy price and a sell price for a stock. The gap between them is the spread — say, $99.99 bid / $100.01 ask. Anyone buying pays $100.01; anyone selling receives $99.99. The market maker pockets the 2¢ difference." },
      { type: "text", text: "**On a single trade, 2¢ is nothing.** But a major HFT firm might execute 10 million trades per day across thousands of stocks. At that scale, fractions of a cent become hundreds of millions of dollars annually." },
      { type: "stat", stats: [{ value: "~50%", label: "Of US equity volume is HFT", sub: "Most of the liquidity you trade against is algorithmic", color: "#f97316" }, { value: "400μs", label: "Typical HFT response time", sub: "400 microseconds — 2,500 times faster than a human blink", color: "#ef4444" }] },
      { type: "heading", text: "The speed arms race" },
      { type: "text", text: "**Co-location** is the practice of placing your servers physically inside the stock exchange's data centre — sometimes just metres from the matching engine. Every extra metre of cable adds nanoseconds of latency. Firms pay millions per year for rack space." },
      { type: "text", text: "Firms have laid **dedicated fibre cables between New York and Chicago** to shave microseconds off data transmission. One firm even used microwave towers — light travels faster through air than through glass fibre. The edge was literally the speed of light." },
      { type: "tip", text: "HFT firms don't care about where Apple stock is heading next week. **They care about order flow** — who is buying, who is selling, and whether the buy orders are outpacing sells right now. It's a completely different game to fundamental or quantitative investing." },
      { type: "myth", myth: "HFT firms manipulate markets and are bad for investors.", reality: "The evidence is mixed but mostly positive for retail investors. **HFT market makers have dramatically reduced bid-ask spreads** — the cost of trading fell 80%+ after HFT became widespread. The concern is fairness to institutional investors, not retail." },
      { type: "callout", text: "See the other side", subtext: "The strategies on QuantWorld hold positions for days — completely different from HFT", ticker: "SPY", strategy: "ma_crossover" }
    ]
  },
  {
    id: "hedge-funds",
    icon: "💰",
    tag: "Industry",
    tagColor: "#f97316",
    title: "How Hedge Funds Make Money",
    subtitle: "2-and-20, alpha vs beta, and why most funds fail to beat a simple index",
    readTime: "6 min read",
    content: [
      { type: "intro", text: "A hedge fund is an investment vehicle that pools capital from wealthy investors and institutions, **charges fees far above any other investment product, and promises to generate alpha** — returns above what the market gives for free. Most fail. A small number generate extraordinary returns. The business model is fascinating either way." },
      { type: "tldr", points: ["The standard fee is '2 and 20' — 2% of assets per year plus 20% of all profits", "Most hedge funds underperform a simple S&P 500 index fund after fees", "The ones that win (Renaissance, Two Sigma) do so through genuine quantitative edge — not luck"] },
      { type: "heading", text: "The fee structure" },
      { type: "text", text: "**'2 and 20'** means the fund charges 2% of assets under management annually — regardless of performance — plus 20% of any profits. On a $1 billion fund earning 15%, that's $20M in management fee plus $30M in performance fee = $50M taken before investors see a dollar." },
      { type: "stat", stats: [{ value: "2%", label: "Management fee", sub: "Charged every year, win or lose — covers salaries, infrastructure, research", color: "#f97316" }, { value: "20%", label: "Performance fee", sub: "20 cents from every dollar of profit — the real upside for fund managers", color: "#f59e0b" }] },
      { type: "myth", myth: "Hedge funds consistently beat the market.", reality: "**Warren Buffett bet $1M that an S&P 500 index fund would beat a basket of hedge funds over 10 years.** He won easily. The average hedge fund, after fees, underperforms the index. The ones that do beat it — Renaissance, Citadel, Two Sigma — are statistical outliers with genuine technological and quantitative edges." },
      { type: "heading", text: "Alpha vs Beta" },
      { type: "text", text: "**Beta is the free return the market provides** — just holding the S&P 500 gives you ~10% annually historically, with no skill required. **Alpha is everything above that**, adjusted for the risk you took. Most hedge funds charge 2-and-20 for returns that are really just beta dressed up in complexity." },
      { type: "text", text: "**Genuine alpha is rare and hard to sustain.** Markets are competitive — as soon as an edge is discovered and capital pours in, it arbitrages itself away. Renaissance constantly researches new signals as old ones decay." },
      { type: "tip", text: "The **high-water mark** protects investors from double-paying fees. If a fund loses 20% one year, it must recover those losses **before** charging performance fees again. Without it, a manager could lose money, then profit on the recovery, collecting performance fees twice on the same capital." },
      { type: "heading", text: "Why quant funds have an edge" },
      { type: "text", text: "**Discretionary funds** rely on human analysts forming views on companies. This is slow, emotional, and limited in scale. **Quant funds** test thousands of signals systematically, hold hundreds of positions simultaneously, and remove human emotion from every decision." },
      { type: "text", text: "**The quant edge is scalable in a way human judgment is not.** Renaissance's Medallion Fund doesn't have 1,000 analysts — it has mathematicians building models that trade thousands of instruments at once. The edge compounds across scale." },
      { type: "callout", text: "Build the foundation", subtext: "The same signals quant funds start from — test them yourself", ticker: "SPY", strategy: "random_forest" }
    ]
  },
  {
    id: "options-basics",
    icon: "📊",
    tag: "Derivatives",
    tagColor: "#10b981",
    title: "What are Options?",
    subtitle: "Calls, puts, strikes, and expiry — the building blocks of the options market",
    readTime: "6 min read",
    content: [
      { type: "intro", text: "An option is a **contract that gives you the right, but not the obligation, to buy or sell a stock at a specific price before a certain date.** You pay a premium for that right. Unlike buying stock, your maximum loss is capped at what you paid." },
      { type: "tldr", points: ["A call option profits when the stock goes up. A put option profits when it goes down.", "You never have to exercise — you can just sell the option itself for a profit", "The premium is what you pay upfront — and your maximum possible loss", "Options expire worthless if they never become profitable — that premium is gone"] },
      { type: "heading", text: "Calls vs Puts" },
      { type: "text", text: "**A call option** gives you the right to *buy* 100 shares at the strike price. If Apple is at $180 and you own a call with strike $170, you can buy shares at $170 — instantly $10 ahead. That's intrinsic value." },
      { type: "text", text: "**A put option** gives you the right to *sell* 100 shares at the strike price. If Apple drops to $150 and you own a put with strike $170, you can sell shares at $170 when they're only worth $150 — $20 of profit per share." },
      { type: "stat", stats: [
        { value: "Call", label: "Right to BUY at strike", sub: "Profits when stock rises above strike price", color: "#10b981" },
        { value: "Put",  label: "Right to SELL at strike", sub: "Profits when stock falls below strike price", color: "#ef4444" }
      ]},
      { type: "heading", text: "Key terms" },
      { type: "steps", label: "Vocabulary", steps: [
        { label: "Strike price (K)", expr: "\\text{The price you can buy/sell at — locked in at purchase}" },
        { label: "Expiry date",      expr: "\\text{The deadline. Option is worthless after this date}" },
        { label: "Premium",          expr: "\\text{What you pay for the option. Your max loss}" },
        { label: "In the money",     expr: "\\text{Call: } S > K \\quad \\text{Put: } S < K \\quad \\text{(has intrinsic value)}" },
      ]},
      { type: "heading", text: "Moneyness — ITM, ATM, OTM" },
      { type: "text", text: "**In the Money (ITM)** — the option has intrinsic value right now. A call is ITM when spot > strike. A put is ITM when spot < strike. **At the Money (ATM)** — spot and strike are equal. **Out of the Money (OTM)** — the option has no intrinsic value yet. Most options expire OTM." },
      { type: "tip", text: "**OTM options are cheaper** — they need the stock to move far before paying off. Professional traders buy OTM options for leverage: small premium, big potential gain if the move happens. But they expire worthless most of the time." },
      { type: "heading", text: "Intrinsic value vs time value" },
      { type: "formula", label: "Option Premium", formula: "Premium = \\text{Intrinsic Value} + \\text{Time Value}", vars: [
        { var: "Intrinsic value", desc: "How much the option is worth if exercised right now (max(S−K, 0) for a call)" },
        { var: "Time value",      desc: "Extra premium for the possibility the stock moves in your favour before expiry" },
      ]},
      { type: "text", text: "**Time value decays to zero at expiry** — this is why option buyers lose money over time even when the stock doesn't move. The more time left, the more time value. Near expiry, only intrinsic value remains." },
      { type: "myth", myth: "Options are extremely risky and only for experts.", reality: "**Buying options limits your downside to the premium paid** — which is often less risky than buying stock. The dangerous strategies (selling naked calls/puts) are different. Understanding what you own is the whole game." },
    ]
  },
  {
    id: "options-greeks",
    icon: "🔢",
    tag: "Derivatives",
    tagColor: "#10b981",
    title: "The Greeks Explained",
    subtitle: "Delta, Gamma, Theta, and Vega — how professionals measure option risk",
    readTime: "5 min read",
    content: [
      { type: "intro", text: "The Greeks are **sensitivity measures** — they tell you exactly how your option's price will change as market conditions change. Every options desk lives and breathes these numbers. You don't need to memorise formulas — you need the intuition." },
      { type: "tldr", points: ["Delta: how much the option moves per $1 move in the stock", "Theta: how much you lose every single day just from time passing", "Vega: how much you gain/lose per 1% change in implied volatility", "Gamma: how fast your delta is changing — dangerous near expiry"] },
      { type: "heading", text: "Delta (Δ) — the most important Greek" },
      { type: "text", text: "**Delta tells you how many dollars your option gains per $1 rise in the stock.** A call with delta 0.5 gains $0.50 when the stock rises $1. A call with delta 0.9 behaves almost like owning the stock. Delta ranges from 0 to 1 for calls, and -1 to 0 for puts." },
      { type: "formula", label: "Delta intuition", formula: "\\Delta = \\frac{\\Delta \\text{ Option Price}}{\\Delta \\text{ Stock Price}}", vars: [
        { var: "ATM option", desc: "Delta ≈ 0.50 — stock rises $2, option gains ~$1" },
        { var: "Deep ITM",   desc: "Delta ≈ 1.0 — option moves dollar-for-dollar with stock" },
        { var: "Deep OTM",   desc: "Delta ≈ 0.0 — barely moves even when stock rises" },
      ]},
      { type: "stat", stats: [
        { value: "0.5",  label: "ATM call delta",    sub: "Roughly 50% chance of expiring in the money", color: "#3b82f6" },
        { value: "−0.5", label: "ATM put delta",     sub: "Symmetric — put profits as call loses", color: "#f472b6" },
      ]},
      { type: "heading", text: "Theta (Θ) — time is your enemy" },
      { type: "text", text: "**Every single day, your option loses value** — even if the stock doesn't move. This is theta. An option worth $5.00 today with theta of -0.03 will be worth about $4.97 tomorrow. The decay accelerates sharply in the last 30 days before expiry." },
      { type: "tip", text: "**Selling options means you collect theta.** Covered calls and cash-secured puts are strategies where you're the one receiving that daily decay. Options desks often run 'short theta' books — selling premium to collect this daily erosion." },
      { type: "heading", text: "Vega (ν) — volatility exposure" },
      { type: "text", text: "**Vega measures how much your option gains or loses per 1% change in implied volatility.** When markets are calm, IV is low and options are cheap. When uncertainty spikes (earnings, macro events), IV rises and options become expensive — even if the stock hasn't moved." },
      { type: "text", text: "**Buying options before high-vol events (earnings, Fed decisions) can be expensive** precisely because IV is already elevated — you need the stock to move *more* than the market expects just to break even. This is called 'buying rich vol.'" },
      { type: "heading", text: "Gamma (Γ) — delta's rate of change" },
      { type: "text", text: "**Gamma measures how fast your delta is changing.** High gamma means your option's behaviour is shifting rapidly. ATM options near expiry have very high gamma — their delta can jump from 0.4 to 0.9 in a single session. Options desks actively manage 'gamma risk' because it can cause P&L to swing violently." },
      { type: "myth", myth: "You only need to watch delta to understand your position.", reality: "**Delta only tells you where you are right now.** Gamma tells you how fast things change. A position with high gamma can go from safe to explosive in hours. Professional traders track both constantly." },
    ]
  }
];
function ArticleCard({ article, onClick, isRead }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isRead ? "rgba(14,165,233,0.06)" : "#1e293b",
        border: isRead ? "1px solid rgba(14,165,233,0.3)" : "1px solid #334155",
        borderRadius: 20, padding: 28, cursor: "pointer", transition: "all 0.2s",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = isRead ? "rgba(14,165,233,0.6)" : "#0ea5e9";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = isRead ? "rgba(14,165,233,0.3)" : "#334155";
      }}
    >
      {isRead && (
        <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 8, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#0ea5e9", letterSpacing: "0.04em" }}>✓ Read</span>
        </div>
      )}
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
        <text x="600" y="55" fill="#ef4444" fontSize="11" fontWeight="600">OVERBOUGHT</text>
        <text x="600" y="230" fill="#22c55e" fontSize="11" fontWeight="600">OVERSOLD</text>
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
    "macd": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {[60,100,140,180,220].map(y => <line key={y} x1="60" y1={y} x2="680" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        <line x1="60" y1="140" x2="680" y2="140" stroke="#334155" strokeWidth="1.5"/>
        <text x="48" y="144" textAnchor="end" fill="#475569" fontSize="11">0</text>
        <polyline points="60,140 100,128 140,112 180,98 220,92 260,100 300,118 340,130 380,138 420,130 460,115 500,105 540,110 580,122 620,132 660,138" fill="none" stroke="#10b981" strokeWidth="2.5"/>
        <polyline points="60,140 100,134 140,122 180,108 220,100 260,104 300,116 340,126 380,136 420,132 460,120 500,110 540,112 580,124 620,133 660,139" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3"/>
        {[
          [287,112,287,112,"sell"],
          [400,134,400,134,"buy"],
        ].map(([x1,y1,x2,y2,type],i) => {
          const cx = (x1+x2)/2, cy = (y1+y2)/2;
          const color = type === "buy" ? "#22c55e" : "#ef4444";
          const label = type === "buy" ? "BUY" : "SELL";
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="8" fill={color}/>
              <text x={cx} y={type === "buy" ? cy+20 : cy-14} textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{label}</text>
              <line x1={cx} y1={cy} x2={cx} y2="240" stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
            </g>
          );
        })}
        <line x1="80" y1="265" x2="110" y2="265" stroke="#10b981" strokeWidth="2.5"/>
        <text x="116" y="269" fill="#10b981" fontSize="12" fontWeight="600">MACD Line</text>
        <line x1="260" y1="265" x2="290" y2="265" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3"/>
        <text x="296" y="269" fill="#f59e0b" fontSize="12" fontWeight="600">Signal Line (9-day EMA)</text>
        <text x="370" y="28" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">MACD — Buy when MACD crosses above Signal, Sell when it crosses below</text>
      </svg>
    ),
    "volatility": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {/* Left panel - Low Volatility */}
        <text x="185" y="30" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="700">Low Volatility</text>
        <text x="185" y="46" textAnchor="middle" fill="#475569" fontSize="11">Calm, steady moves</text>
        {[80,120,160,200].map(y => <line key={y} x1="60" y1={y} x2="320" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        <polyline points="60,200 90,194 120,188 150,178 180,170 210,162 240,154 270,148 300,140 320,135" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
        <text x="185" y="258" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="600">σ ≈ 15% annualized</text>
        <text x="185" y="272" textAnchor="middle" fill="#475569" fontSize="11">e.g. SPY, BRK.B</text>
        {/* Divider */}
        <line x1="360" y1="20" x2="360" y2="245" stroke="#334155" strokeWidth="1"/>
        <text x="360" y="145" textAnchor="middle" fill="#475569" fontSize="18" fontWeight="800">VS</text>
        {/* Right panel - High Volatility */}
        <text x="535" y="30" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="700">High Volatility</text>
        <text x="535" y="46" textAnchor="middle" fill="#475569" fontSize="11">Wild, unpredictable swings</text>
        {[80,120,160,200].map(y => <line key={y} x1="400" y1={y} x2="660" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        <polyline points="400,160 420,130 440,175 460,100 480,190 500,80 520,160 540,110 560,195 580,85 600,155 620,90 640,170 660,110" fill="none" stroke="#ef4444" strokeWidth="2.5"/>
        <text x="535" y="258" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="600">σ ≈ 70% annualized</text>
        <text x="535" y="272" textAnchor="middle" fill="#475569" fontSize="11">e.g. TSLA, NVDA</text>
      </svg>
    ),
    "backtesting": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        <defs>
          <linearGradient id="btGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Historical price line */}
        <text x="200" y="28" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600">Historical Price Data</text>
        {[70,110,150,190].map(y => <line key={y} x1="40" y1={y} x2="370" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        <polyline points="40,190 70,175 100,185 130,155 160,165 190,140 220,150 250,120 280,130 310,105 340,95 370,85" fill="none" stroke="#0ea5e9" strokeWidth="2"/>
        <polygon points="40,190 70,175 100,185 130,155 160,165 190,140 220,150 250,120 280,130 310,105 340,95 370,85 370,210 40,210" fill="url(#btGrad)"/>
        {/* Buy/sell dots */}
        <circle cx="130" cy="155" r="7" fill="#22c55e"/>
        <text x="130" y="145" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">BUY</text>
        <circle cx="250" cy="120" r="7" fill="#ef4444"/>
        <text x="250" y="110" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">SELL</text>
        <circle cx="310" cy="105" r="7" fill="#22c55e"/>
        <text x="310" y="95" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">BUY</text>
        {/* Arrow */}
        <line x1="385" y1="140" x2="420" y2="140" stroke="#334155" strokeWidth="2"/>
        <polygon points="420,136 428,140 420,144" fill="#334155"/>
        <text x="406" y="130" textAnchor="middle" fill="#475569" fontSize="10">simulate</text>
        {/* Results panel */}
        <rect x="430" y="50" width="250" height="175" rx="14" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
        <text x="555" y="78" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Backtest Results</text>
        <line x1="445" y1="88" x2="665" y2="88" stroke="#334155" strokeWidth="1"/>
        {[
          ["Total Return", "+38.4%", "#22c55e"],
          ["Buy & Hold", "+24.1%", "#64748b"],
          ["Sharpe Ratio", "1.42", "#0ea5e9"],
          ["Max Drawdown", "-11.2%", "#f59e0b"],
          ["Win Rate", "58%", "#a855f7"],
        ].map(([label, value, color], i) => (
          <g key={i}>
            <text x="450" y={110 + i * 22} fill="#64748b" fontSize="12">{label}</text>
            <text x="665" y={110 + i * 22} textAnchor="end" fill={color} fontSize="12" fontWeight="700">{value}</text>
          </g>
        ))}
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
    "logistic-regression": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {/* Feature columns */}
        {[["RSI", "#0ea5e9", 72], ["MACD", "#22c55e", 152], ["Bollinger", "#f59e0b", 232], ["Momentum", "#a855f7", 312], ["MA Ratio", "#ef4444", 392]].map(([label, color, x], i) => (
          <g key={i}>
            <rect x={x} y="50" width="60" height="140" rx="8" fill={color + "15"} stroke={color + "40"} strokeWidth="1"/>
            <text x={x + 30} y="44" textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{label}</text>
            {[0,1,2,3,4,5].map(j => (
              <rect key={j} x={x + 8} y={60 + j * 20} width={44} height={12} rx={3} fill={color} opacity={0.1 + Math.random() * 0.5}/>
            ))}
          </g>
        ))}
        {/* Arrow */}
        <line x1="462" y1="120" x2="500" y2="120" stroke="#334155" strokeWidth="2"/>
        <polygon points="500,116 510,120 500,124" fill="#334155"/>
        <text x="486" y="112" textAnchor="middle" fill="#475569" fontSize="10">learn</text>
        {/* Model box */}
        <rect x="515" y="70" width="120" height="100" rx="14" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5"/>
        <text x="575" y="108" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="700">Logistic</text>
        <text x="575" y="124" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="700">Regression</text>
        <text x="575" y="150" textAnchor="middle" fill="#64748b" fontSize="10">P(up) = σ(wᵀx)</text>
        {/* Arrow to output */}
        <line x1="635" y1="120" x2="668" y2="120" stroke="#334155" strokeWidth="2"/>
        <polygon points="668,116 678,120 668,124" fill="#334155"/>
        {/* Output */}
        <rect x="678" y="95" width="36" height="22" rx="6" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" strokeWidth="1"/>
        <text x="696" y="109" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">BUY</text>
        <rect x="678" y="123" width="36" height="22" rx="6" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="1"/>
        <text x="696" y="137" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">SELL</text>
        {/* Train/test annotation */}
        <rect x="40" y="210" width="200" height="28" rx="8" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.2)" strokeWidth="1"/>
        <text x="140" y="228" textAnchor="middle" fill="#0ea5e9" fontSize="11" fontWeight="600">Train on first 80% of data</text>
        <rect x="250" y="210" width="200" height="28" rx="8" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
        <text x="350" y="228" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="600">Signal on remaining 20%</text>
        <text x="370" y="268" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600">9 features → model learns weights → daily Buy/Sell signal</text>
      </svg>
    ),
    "random-forest": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {/* Three example trees */}
        {[[120, "#22c55e", "BUY"], [360, "#a855f7", "SELL"], [600, "#22c55e", "BUY"]].map(([cx, color, vote], i) => (
          <g key={i}>
            {/* Tree trunk lines */}
            <line x1={cx} y1="60" x2={cx - 50} y2="120" stroke="#334155" strokeWidth="1.5"/>
            <line x1={cx} y1="60" x2={cx + 50} y2="120" stroke="#334155" strokeWidth="1.5"/>
            <line x1={cx - 50} y1="120" x2={cx - 75} y2="175" stroke="#334155" strokeWidth="1.5"/>
            <line x1={cx - 50} y1="120" x2={cx - 25} y2="175" stroke="#334155" strokeWidth="1.5"/>
            <line x1={cx + 50} y1="120" x2={cx + 25} y2="175" stroke="#334155" strokeWidth="1.5"/>
            <line x1={cx + 50} y1="120" x2={cx + 75} y2="175" stroke="#334155" strokeWidth="1.5"/>
            {/* Nodes */}
            <circle cx={cx} cy="60" r="14" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
            <text x={cx} y="64" textAnchor="middle" fill="#64748b" fontSize="9">RSI?</text>
            <circle cx={cx - 50} cy="120" r="14" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
            <text x={cx - 50} y="124" textAnchor="middle" fill="#64748b" fontSize="7.5">MACD?</text>
            <circle cx={cx + 50} cy="120" r="14" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
            <text x={cx + 50} y="124" textAnchor="middle" fill="#64748b" fontSize="9">Trend?</text>
            {/* Leaf nodes */}
            {[cx - 75, cx - 25, cx + 25, cx + 75].map((lx, j) => (
              <rect key={j} x={lx - 18} y="164" width="36" height="18" rx="5" fill={j === 1 || j === 2 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"} stroke={j === 1 || j === 2 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"} strokeWidth="1"/>
            ))}
            <text x={cx} y="35" textAnchor="middle" fill="#475569" fontSize="10">Tree {i + 1}</text>
            {/* Vote badge */}
            <rect x={cx - 20} y="200" width="40" height="20" rx="6" fill={color + "20"} stroke={color + "50"} strokeWidth="1"/>
            <text x={cx} y="213" textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{vote}</text>
          </g>
        ))}
        {/* Majority vote */}
        <line x1="240" y1="240" x2="340" y2="255" stroke="#334155" strokeWidth="1.5"/>
        <line x1="360" y1="220" x2="360" y2="255" stroke="#334155" strokeWidth="1.5"/>
        <line x1="480" y1="240" x2="380" y2="255" stroke="#334155" strokeWidth="1.5"/>
        <rect x="310" y="255" width="100" height="22" rx="8" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" strokeWidth="1.5"/>
        <text x="360" y="270" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="700">BUY (2/3)</text>
      </svg>
    ),
    "quant-glossary": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {/* Row 1 */}
        {[["Alpha", "#22c55e", 60], ["Beta", "#0ea5e9", 190], ["Signal", "#f59e0b", 310], ["Regime", "#a855f7", 440], ["Overfitting", "#ef4444", 570]].map(([term, color, x]) => (
          <g key={term}>
            <rect x={x} y="32" width="120" height="52" rx="14" fill={color + "18"} stroke={color + "55"} strokeWidth="1.5"/>
            <text x={x + 60} y="54" textAnchor="middle" fill={color} fontSize="15" fontWeight="800">{term}</text>
            <text x={x + 60} y="72" textAnchor="middle" fill={color + "aa"} fontSize="10" fontWeight="500">
              {term === "Alpha" ? "return above market" : term === "Beta" ? "market sensitivity" : term === "Signal" ? "trade trigger" : term === "Regime" ? "market environment" : "memorised the past"}
            </text>
          </g>
        ))}
        {/* Row 2 */}
        {[["Long", "#22c55e", 60], ["Short", "#ef4444", 190], ["Momentum", "#0ea5e9", 310], ["Mean Reversion", "#8b5cf6", 430], ["Slippage", "#f97316", 580]].map(([term, color, x]) => (
          <g key={term}>
            <rect x={x} y="118" width={term === "Mean Reversion" ? 138 : 120} height="52" rx="14" fill={color + "18"} stroke={color + "55"} strokeWidth="1.5"/>
            <text x={x + (term === "Mean Reversion" ? 69 : 60)} y="140" textAnchor="middle" fill={color} fontSize="15" fontWeight="800">{term}</text>
            <text x={x + (term === "Mean Reversion" ? 69 : 60)} y="158" textAnchor="middle" fill={color + "aa"} fontSize="10" fontWeight="500">
              {term === "Long" ? "own it, profit going up" : term === "Short" ? "bet on price falling" : term === "Momentum" ? "winners keep winning" : term === "Mean Reversion" ? "prices snap back" : "real vs expected price"}
            </text>
          </g>
        ))}
        {/* Row 3 — centered */}
        {[["Walk-Forward", "#10b981", 130], ["Feature Engineering", "#f59e0b", 290], ["In-Sample / Out-of-Sample", "#0ea5e9", 490]].map(([term, color, x]) => (
          <g key={term}>
            <rect x={x} y="204" width={term.length > 18 ? 188 : 148} height="52" rx="14" fill={color + "18"} stroke={color + "55"} strokeWidth="1.5"/>
            <text x={x + (term.length > 18 ? 94 : 74)} y="226" textAnchor="middle" fill={color} fontSize={term.length > 18 ? 11 : 14} fontWeight="800">{term}</text>
            <text x={x + (term.length > 18 ? 94 : 74)} y="244" textAnchor="middle" fill={color + "aa"} fontSize="10" fontWeight="500">
              {term === "Walk-Forward" ? "rolling honest backtest" : term === "Feature Engineering" ? "raw data → model inputs" : "train data vs test data"}
            </text>
          </g>
        ))}
      </svg>
    ),
    "win-rate": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {/* Strategy A — high win rate, bad expectancy */}
        <text x="185" y="28" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Strategy A</text>
        <text x="185" y="44" textAnchor="middle" fill="#22c55e" fontSize="11">80% win rate</text>
        {/* Win trades */}
        {[70,120,170,220,270,320,370].map((x,i) => (
          <g key={i}>
            <rect x={x} y="100" width="28" height="30" rx="4" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth="1"/>
            <text x={x+14} y="119" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">+1%</text>
          </g>
        ))}
        {/* Loss trades */}
        {[420,470].map((x,i) => (
          <g key={i}>
            <rect x={x} y="65" width="28" height="65" rx="4" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" strokeWidth="1"/>
            <text x={x+14} y="105" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">-10%</text>
          </g>
        ))}
        <rect x="60" y="158" width="460" height="24" rx="6" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" strokeWidth="1"/>
        <text x="290" y="174" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">Expectancy: -1.2% per trade ❌</text>
        {/* Divider */}
        <line x1="560" y1="20" x2="560" y2="200" stroke="#1e293b" strokeWidth="1.5"/>
        {/* Strategy B — low win rate, great expectancy */}
        <text x="640" y="28" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Strategy B</text>
        <text x="640" y="44" textAnchor="middle" fill="#ef4444" fontSize="11">30% win rate</text>
        <g>
          <rect x="575" y="55" width="28" height="75" rx="4" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth="1"/>
          <text x="589" y="96" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">+15%</text>
        </g>
        {[618,661].map((x,i) => (
          <g key={i}>
            <rect x={x} y="117" width="28" height="13" rx="4" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" strokeWidth="1"/>
            <text x={x+14} y="127" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="700">-3%</text>
          </g>
        ))}
        <rect x="565" y="158" width="130" height="24" rx="6" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" strokeWidth="1"/>
        <text x="630" y="174" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="700">+2.4%/trade ✓</text>
        <text x="370" y="220" textAnchor="middle" fill="#475569" fontSize="12">Win rate means nothing without knowing how big wins and losses are</text>
      </svg>
    ),
    "calmar-ratio": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[60,100,140,180,220].map(y => <line key={y} x1="40" y1={y} x2="680" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        {/* Portfolio line — rises, crashes, recovers */}
        <polyline points="40,200 100,180 160,155 220,130 280,110 340,90 380,85 400,125 430,170 450,200 470,215 510,195 550,170 600,140 650,110 680,90" fill="none" stroke="#0ea5e9" strokeWidth="2.5"/>
        {/* Drawdown shading */}
        <polygon points="380,85 400,125 430,170 450,200 470,215 510,195 550,170 600,140 650,110 680,85 680,85 380,85" fill="url(#ddGrad)"/>
        {/* Peak marker */}
        <line x1="380" y1="85" x2="380" y2="220" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" opacity="0.6"/>
        <circle cx="380" cy="85" r="6" fill="#f59e0b"/>
        <text x="380" y="72" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">PEAK</text>
        {/* Trough marker */}
        <line x1="470" y1="215" x2="470" y2="220" stroke="#ef4444" strokeWidth="1"/>
        <circle cx="470" cy="215" r="6" fill="#ef4444"/>
        <text x="470" y="238" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">TROUGH</text>
        {/* Recovery marker */}
        <line x1="650" y1="110" x2="650" y2="220" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" opacity="0.6"/>
        <circle cx="650" cy="110" r="6" fill="#22c55e"/>
        <text x="650" y="238" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">RECOVERY</text>
        {/* Drawdown arrow */}
        <line x1="425" y1="85" x2="425" y2="215" stroke="#ef4444" strokeWidth="1.5"/>
        <polygon points="421,210 425,220 429,210" fill="#ef4444"/>
        <polygon points="421,90 425,80 429,90" fill="#ef4444"/>
        <text x="440" y="155" fill="#ef4444" fontSize="11" fontWeight="700">Max DD</text>
        <text x="370" y="265" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600">A -50% drawdown requires a +100% gain just to break even</text>
      </svg>
    ),
    "hft": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {/* Exchange in centre */}
        <rect x="300" y="100" width="120" height="80" rx="14" fill="rgba(249,115,22,0.12)" stroke="rgba(249,115,22,0.5)" strokeWidth="2"/>
        <text x="360" y="135" textAnchor="middle" fill="#f97316" fontSize="12" fontWeight="800">EXCHANGE</text>
        <text x="360" y="153" textAnchor="middle" fill="#f97316" fontSize="10">Matching Engine</text>
        <text x="360" y="168" textAnchor="middle" fill="#64748b" fontSize="9">NYSE / NASDAQ</text>
        {/* HFT firms */}
        {[["HFT FIRM A", 80, 120, "#22c55e"], ["HFT FIRM B", 80, 155, "#0ea5e9"], ["HFT FIRM C", 560, 120, "#a855f7"], ["HFT FIRM D", 560, 155, "#10b981"]].map(([label, x, y, color]) => (
          <g key={label}>
            <rect x={x} y={y - 14} width="110" height="26" rx="8" fill={color + "15"} stroke={color + "40"} strokeWidth="1"/>
            <text x={x + 55} y={y + 2} textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{label}</text>
            <line x1={x > 300 ? x : x + 110} y1={y} x2={x > 300 ? 420 : 300} y2="140" stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
            <text x={x > 300 ? x - 22 : x + 132} y={y - 4} fill={color + "99"} fontSize="8">{x > 300 ? "←" : "→"} 400μs</text>
          </g>
        ))}
        {/* Regular investor */}
        <rect x="295" y="222" width="130" height="30" rx="8" fill="rgba(100,116,139,0.15)" stroke="#334155" strokeWidth="1"/>
        <text x="360" y="241" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">Retail Investor</text>
        <line x1="360" y1="222" x2="360" y2="180" stroke="#475569" strokeWidth="1" strokeDasharray="4,4"/>
        <text x="375" y="212" fill="#475569" fontSize="9">milliseconds</text>
        {/* Speed comparison */}
        <text x="370" y="272" textAnchor="middle" fill="#475569" fontSize="11">HFT responds 2,500× faster than a human blink</text>
      </svg>
    ),
    "hedge-funds": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        {/* Fee breakdown visual */}
        <text x="200" y="28" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">$1B Fund, 15% Year</text>
        <text x="200" y="44" textAnchor="middle" fill="#64748b" fontSize="11">= $150M gross profit</text>
        {/* Bars */}
        <rect x="60" y="60" width="120" height="110" rx="8" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5"/>
        <text x="120" y="108" textAnchor="middle" fill="#f97316" fontSize="13" fontWeight="800">$20M</text>
        <text x="120" y="126" textAnchor="middle" fill="#f97316" fontSize="11">2% Mgmt</text>
        <text x="120" y="141" textAnchor="middle" fill="#64748b" fontSize="10">Win or lose</text>
        <rect x="200" y="60" width="120" height="110" rx="8" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
        <text x="260" y="108" textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="800">$30M</text>
        <text x="260" y="126" textAnchor="middle" fill="#f59e0b" fontSize="11">20% Perf.</text>
        <text x="260" y="141" textAnchor="middle" fill="#64748b" fontSize="10">On profits only</text>
        <rect x="340" y="88" width="120" height="82" rx="8" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5"/>
        <text x="400" y="122" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="800">$100M</text>
        <text x="400" y="140" textAnchor="middle" fill="#22c55e" fontSize="11">To Investors</text>
        <line x1="60" y1="200" x2="460" y2="200" stroke="#334155" strokeWidth="1"/>
        <text x="120" y="220" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="700">$20M</text>
        <text x="260" y="220" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700">$30M</text>
        <text x="400" y="220" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">$100M</text>
        {/* Divider */}
        <line x1="520" y1="20" x2="520" y2="250" stroke="#1e293b" strokeWidth="1.5"/>
        {/* S&P comparison */}
        <text x="620" y="40" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">S&P 500 Index</text>
        <text x="620" y="56" textAnchor="middle" fill="#22c55e" fontSize="11">0.03% fee</text>
        <rect x="570" y="70" width="100" height="90" rx="8" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.4)" strokeWidth="1.5"/>
        <text x="620" y="110" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="800">$149.7M</text>
        <text x="620" y="128" textAnchor="middle" fill="#22c55e" fontSize="11">To Investors</text>
        <text x="620" y="145" textAnchor="middle" fill="#64748b" fontSize="10">Almost all of it</text>
        <text x="370" y="268" textAnchor="middle" fill="#475569" fontSize="11">Why most hedge funds underperform a simple index fund after fees</text>
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
    "options-basics": (
      <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", background: "#0f172a" }}>
        <defs>
          <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="putGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25"/>
          </linearGradient>
        </defs>
        {/* Grid */}
        {[60,110,160,210].map(y => <line key={y} x1="40" y1={y} x2="680" y2={y} stroke="#1e293b" strokeWidth="1"/>)}
        {/* Zero line */}
        <line x1="40" y1="160" x2="680" y2="160" stroke="#334155" strokeWidth="1.5"/>
        <text x="28" y="164" textAnchor="end" fill="#475569" fontSize="11">0</text>
        {/* Strike line */}
        <line x1="360" y1="40" x2="360" y2="240" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,4"/>
        <text x="360" y="34" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700">Strike K</text>
        {/* Spot label */}
        <text x="360" y="255" textAnchor="middle" fill="#64748b" fontSize="11">Stock price at expiry →</text>
        {/* Long Call payoff line: flat left of strike, rising right */}
        <polyline points="40,185 360,185 680,40" fill="none" stroke="#10b981" strokeWidth="3"/>
        <polygon points="40,185 360,185 680,40 680,185 40,185" fill="url(#callGrad)"/>
        {/* Long Put payoff line: falling left of strike, flat right */}
        <polyline points="40,40 360,185 680,185" fill="none" stroke="#ef4444" strokeWidth="3"/>
        <polygon points="40,40 360,185 680,185 680,210 40,210" fill="url(#putGrad)"/>
        {/* Premium paid labels */}
        <text x="50" y="180" fill="#10b981" fontSize="10">Premium paid</text>
        <line x1="80" y1="185" x2="80" y2="160" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
        <text x="80" y="155" textAnchor="middle" fill="#10b981" fontSize="9">max loss</text>
        {/* Call label */}
        <rect x="490" y="65" width="120" height="32" rx="8" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth="1"/>
        <text x="550" y="83" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="700">📈 Long Call</text>
        {/* Put label */}
        <rect x="100" y="55" width="120" height="32" rx="8" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="1"/>
        <text x="160" y="73" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">📉 Long Put</text>
        {/* Unlimited upside arrow */}
        <text x="620" y="52" fill="#10b981" fontSize="11" fontWeight="600">Unlimited upside →</text>
        {/* Unlimited downside arrow for put */}
        <text x="44" y="48" fill="#ef4444" fontSize="11" fontWeight="600">← Profit as stock falls</text>
        {/* Title */}
        <text x="370" y="18" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">Call &amp; Put Payoff at Expiry</text>
      </svg>
    ),
    "options-greeks": (
      <svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", background:"#0f172a" }}>
        {/* 4 clean cards in a row */}
        {[
          { x:20,  color:"#3b82f6", letter:"Δ", name:"Delta",  value:"0 to 1",   tag:"Direction",  line1:"How much the option moves", line2:"per $1 change in the stock" },
          { x:195, color:"#ef4444", letter:"Θ", name:"Theta",  value:"− daily",  tag:"Time",       line1:"Value lost every single day", line2:"even if the stock is flat" },
          { x:370, color:"#f59e0b", letter:"ν", name:"Vega",   value:"+ vol",    tag:"Volatility", line1:"Gain when implied vol rises,", line2:"lose when vol falls" },
          { x:545, color:"#8b5cf6", letter:"Γ", name:"Gamma",  value:"Δ speed",  tag:"Curvature",  line1:"How fast delta is changing —", line2:"highest at ATM near expiry" },
        ].map(({ x, color, letter, name, value, tag, line1, line2 }) => (
          <g key={name}>
            {/* Card background */}
            <rect x={x} y="20" width="160" height="260" rx="16" fill="#1e293b" stroke={color} strokeWidth="1.5" strokeOpacity="0.35"/>
            {/* Top accent bar */}
            <rect x={x} y="20" width="160" height="5" rx="3" fill={color} opacity="0.8"/>
            {/* Greek letter — big and centered */}
            <text x={x+80} y="98" textAnchor="middle" fill={color} fontSize="56" fontWeight="900">{letter}</text>
            {/* Name */}
            <text x={x+80} y="122" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">{name}</text>
            {/* Tag pill */}
            <rect x={x+40} y="132" width="80" height="20" rx="10" fill={color} fillOpacity="0.15"/>
            <text x={x+80} y="146" textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{tag.toUpperCase()}</text>
            {/* Value badge */}
            <rect x={x+30} y="163" width="100" height="26" rx="8" fill="#0f172a"/>
            <text x={x+80} y="181" textAnchor="middle" fill={color} fontSize="14" fontWeight="800" fontFamily="monospace">{value}</text>
            {/* Description lines */}
            <text x={x+80} y="207" textAnchor="middle" fill="#94a3b8" fontSize="11">{line1}</text>
            <text x={x+80} y="222" textAnchor="middle" fill="#94a3b8" fontSize="11">{line2}</text>
          </g>
        ))}
        <text x="360" y="294" textAnchor="middle" fill="#334155" fontSize="11">The four Greeks every options trader monitors daily</text>
      </svg>
    ),
  };
  return illustrations[id] || null;
}

function renderText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: "#e2e8f0", fontWeight: 700 }}>{part}</strong> : part
  );
}

function ArticleView({ article, onBack }) {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [article.id]);

  const previewBlocks = article.content;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "32px 20px" : "48px 32px" }}>
      {/* Reading progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#1e293b", zIndex: 999 }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #0ea5e9, #22c55e)", width: `${progress}%`, transition: "width 0.1s linear" }} />
      </div>
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

      {/* Preview content (always visible) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {previewBlocks.map((block, i) => {
          if (block.type === "intro") return (
            <p key={i} style={{ fontSize: 18, color: "#e2e8f0", lineHeight: 1.9, borderLeft: "3px solid #0ea5e9", paddingLeft: 20, margin: 0 }}>
              {renderText(block.text)}
            </p>
          );
          if (block.type === "heading") return (
            <h2 key={i} style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5, margin: 0, marginTop: 8 }}>{block.text}</h2>
          );
          if (block.type === "text") return (
            <p key={i} style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.9, margin: 0 }}>
              {renderText(block.text)}
            </p>
          );
          if (block.type === "tldr") return (
            <div key={i} style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 16, padding: "18px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>TL;DR</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {block.points.map((pt, j) => (
                  <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: "#0ea5e9", fontWeight: 700, fontSize: 15, lineHeight: 1.6, flexShrink: 0 }}>→</span>
                    <span style={{ color: "#7dd3fc", fontSize: 15, lineHeight: 1.6 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          );
          if (block.type === "stat") return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${block.stats.length}, 1fr)`, gap: 14 }}>
              {block.stats.map((s, j) => (
                <div key={j} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: isMobile ? "16px 12px" : "22px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: isMobile ? 26 : 38, fontWeight: 900, color: s.color || "#0ea5e9", lineHeight: 1, marginBottom: 8, letterSpacing: -1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{s.sub}</div>}
                </div>
              ))}
            </div>
          );
          if (block.type === "highlight") return (
            <div key={i} style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 14, padding: 24 }}>
              <p style={{ fontSize: 15, color: "#7dd3fc", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>"{block.text}"</p>
            </div>
          );
          if (block.type === "formula") return (
            <div key={i} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: "20px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>{block.label}</div>
              <div style={{ color: "#e2e8f0", borderBottom: "1px solid #1e293b", paddingBottom: 20, marginBottom: 20 }}>
                <MathExpr display>{block.formula}</MathExpr>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {block.vars.map((v) => (
                  <div key={v.var} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                    <span style={{ flexShrink: 0, minWidth: 110, color: "#7dd3fc" }}>
                      <MathExpr>{v.var}</MathExpr>
                    </span>
                    <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          );
          if (block.type === "steps") return (
            <div key={i} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 14, overflow: "hidden" }}>
              {block.label && (
                <div style={{ padding: "10px 20px", borderBottom: "1px solid #1e293b", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>{block.label}</div>
              )}
              {block.steps.map((step, si) => (
                <div key={si} style={{ display: "flex", borderBottom: si < block.steps.length - 1 ? "1px solid #1e293b" : "none" }}>
                  <div style={{ padding: "13px 20px", width: 180, flexShrink: 0, borderRight: "1px solid #1e293b", color: "#475569", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>
                    {step.label}
                  </div>
                  <div style={{ padding: "13px 24px", color: "#e2e8f0", display: "flex", alignItems: "center", flex: 1, fontSize: 15 }}>
                    <MathExpr>{step.expr}</MathExpr>
                  </div>
                </div>
              ))}
            </div>
          );
          if (block.type === "myth") return (
            <div key={i} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #334155" }}>
              <div style={{ background: "rgba(239,68,68,0.08)", borderBottom: "1px solid #334155", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15 }}>❌</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>Common Myth</span>
              </div>
              <div style={{ background: "#0f172a", padding: "14px 20px", borderBottom: "1px solid #1e293b" }}>
                <p style={{ fontSize: 15, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>"{block.myth}"</p>
              </div>
              <div style={{ background: "rgba(34,197,94,0.06)", borderTop: "1px solid rgba(34,197,94,0.15)", padding: "12px 20px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>✅</span>
                <p style={{ fontSize: 15, color: "#86efac", margin: 0, lineHeight: 1.6 }}>{renderText(block.reality)}</p>
              </div>
            </div>
          );
          if (block.type === "tip") return (
            <div key={i} style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>💡</span>
              <p style={{ fontSize: 15, color: "#6ee7b7", margin: 0, lineHeight: 1.7 }}>{renderText(block.text)}</p>
            </div>
          );
          if (block.type === "terms") return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {block.label && <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{block.label}</div>}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                {block.items.map((item, j) => (
                  <div key={j} style={{ background: "#0f172a", border: `1px solid ${item.color}30`, borderLeft: `3px solid ${item.color}`, borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: item.color, marginBottom: 5 }}>{item.term}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: item.example ? 6 : 0 }}>{item.def}</div>
                    {item.example && <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic" }}>e.g. {item.example}</div>}
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

const CATEGORIES = [
  { label: "All", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.25)" },
  { label: "Foundations", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)", border: "rgba(14,165,233,0.3)" },
  { label: "Strategies", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
  { label: "Metrics", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  { label: "ML Strategy", color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)" },
  { label: "Industry",     color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)" },
  { label: "Derivatives",  color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
];

function Learn() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const { user } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Read progress — persisted to localStorage always, Firestore when logged in
  const [readArticles, setReadArticles] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("qw_read") || "[]")); }
    catch { return new Set(); }
  });

  // Sync from Firestore on login
  useEffect(() => {
    if (!user || !db) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (!snap.exists()) return;
      const saved = snap.data().readArticles || [];
      setReadArticles(prev => {
        const merged = new Set([...prev, ...saved]);
        localStorage.setItem("qw_read", JSON.stringify([...merged]));
        return merged;
      });
    }).catch(() => {});
  }, [user]);

  const markRead = useCallback((articleId) => {
    setReadArticles(prev => {
      if (prev.has(articleId)) return prev;
      const next = new Set([...prev, articleId]);
      localStorage.setItem("qw_read", JSON.stringify([...next]));
      if (user && db) {
        setDoc(doc(db, "users", user.uid), { readArticles: [...next] }, { merge: true }).catch(() => {});
      }
      return next;
    });
  }, [user]);

  const openArticle = (article) => {
    setSelectedArticle(article);
    markRead(article.id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      {selectedArticle ? (
        <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "40px 20px" : "60px 48px" }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>Free · Early Access</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, color: "#fff", letterSpacing: -2, marginBottom: 16, lineHeight: 1.1 }}>
              Learn quant finance.<br />
              <span style={{ color: "#0ea5e9" }}>Simply.</span>
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 20, color: "#64748b", maxWidth: 560, lineHeight: 1.7 }}>
              From moving averages to hedge fund strategies — everything explained simply with real examples you can test yourself.
            </p>
          </div>
          {/* Category filter tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 100,
                    border: `1.5px solid ${isActive ? cat.color : "rgba(51,65,85,0.8)"}`,
                    background: isActive ? cat.bg : "transparent",
                    color: isActive ? cat.color : "#64748b",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: isActive ? `0 0 12px ${cat.color}30` : "none",
                    letterSpacing: isActive ? "0.01em" : 0,
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = cat.border; e.currentTarget.style.color = cat.color; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)"; e.currentTarget.style.color = "#64748b"; }}}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Article grid */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
            {[...articles]
              .sort((a, b) => {
                const order = { "Foundations": 0, "Strategies": 1, "ML Strategy": 2, "Metrics": 3, "Industry": 4 };
                return (order[a.tag] ?? 99) - (order[b.tag] ?? 99);
              })
              .filter(a => activeCategory === "All" || a.tag === activeCategory)
              .map((article) => (
                <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} isRead={readArticles.has(article.id)} />
              ))}
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