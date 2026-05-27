QuantWorld 🌍
> **Making quantitative finance accessible to everyone.**
QuantWorld is a free, beginner-friendly backtesting platform that lets anyone test algorithmic trading strategies on real market data — with plain English explanations of every single metric.
Most trading tools are built for experts. QuantWorld is built for anyone who's curious about how markets work.
Live Site →
---
What it does
Enter any stock ticker, select a strategy, and instantly see:
How the strategy would have performed over the past year
A full breakdown of returns, risk, and performance metrics
A visual equity curve showing growth of $1 invested
A side-by-side comparison against simply buying and holding
Plain English explanations of every number — no finance degree required
---
Tech Stack
Layer	Technology
Frontend	React, Recharts
Backend	Python, FastAPI, Uvicorn
Data	yfinance (Yahoo Finance)
Deployment	Vercel (frontend), Render (backend)
---
Features
Real market data — every backtest uses actual historical price data, not simulations
Interactive charts — equity curve with hover tooltips
Educational tooltips — every metric explained in plain English
Animated homepage — live ticker tape with real company logos
Multi-page routing — clean separation between landing page and app
Instant results — full backtest in seconds on any ticker
---
Strategies
Currently available
MA Crossover (20/50) — buy when the 20-day moving average crosses above the 50-day, sell when it drops below
Coming soon
RSI (Relative Strength Index)
Bollinger Bands
MACD Crossover
ML-based signals (Logistic Regression, Random Forest, LSTM)
---
Getting Started
Prerequisites
Python 3.8+
Node.js 18+
Backend
```bash
cd backend
pip install fastapi uvicorn yfinance pandas
python -m uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`
Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`
---
Project Structure
```
quant-site/
├── backend/
│   └── main.py          # FastAPI server, strategy logic, metrics
└── frontend/
    └── src/
        ├── App.js        # Routing
        ├── Home.js       # Landing page
        └── Backtest.js   # Backtesting tool
```
---
Metrics Explained
Metric	What it means
Total Return	How much $1 invested at the start grew
Annualized Return	Return scaled to a full year
Volatility	How much the price swings — lower is smoother
Sharpe Ratio	Return earned per unit of risk. Above 1.0 is good
Max Drawdown	The worst peak-to-bottom drop you would have experienced
---
Roadmap
[x] MA Crossover strategy
[x] Interactive equity curve chart
[x] Metrics with plain English explanations
[x] Live deployment
[ ] RSI, Bollinger Bands, MACD strategies
[ ] Strategy comparison mode
[ ] 3Y and 5Y historical periods
[ ] ML-based strategies (Phase 3)
[ ] Freemium model
[ ] iOS app
---
About
Built by Roy Shomron, first-year Applied Mathematics & Computer Engineering student at Queen's University.
Passionate about quantitative finance, AI/ML, and building tools that make complex fields accessible to everyone.
LinkedIn
Live Site
---
For educational purposes only. Not financial advice.
