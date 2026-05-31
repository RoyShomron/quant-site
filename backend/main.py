from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

cache = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yf.download("SPY", period="1y", auto_adjust=True)
        print("Warmup complete")
    except:
        pass
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def total_return(cumulative_series):
    return float(cumulative_series.iloc[-1] - 1)

def annualized_return(daily_returns, trading_days=252):
    return float((1 + daily_returns.mean()) ** trading_days - 1)

def annualized_vol(daily_returns, trading_days=252):
    return float(daily_returns.std() * (trading_days ** 0.5))

def sharpe_ratio(daily_returns, trading_days=252, risk_free_rate=0.0):
    excess = daily_returns - (risk_free_rate / trading_days)
    vol = annualized_vol(excess, trading_days)
    return float((excess.mean() * trading_days) / vol) if vol != 0 else 0.0

def max_drawdown(cumulative_series):
    running_max = cumulative_series.cummax()
    drawdown = cumulative_series / running_max - 1
    return float(drawdown.min())

def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def get_period_string(timeframe: str) -> str:
    if timeframe == "3y":
        return "3y"
    elif timeframe == "5y":
        return "5y"
    return "1y"

@app.get("/backtest")
def run_backtest(ticker: str = "SPY", strategy: str = "ma_crossover", timeframe: str = "1y"):
    cache_key = f"{ticker}_{strategy}_{timeframe}"
    now = datetime.now()
    if cache_key in cache and now - cache[cache_key]["timestamp"] < timedelta(minutes=30):
        return cache[cache_key]["data"]

    period = get_period_string(timeframe)
    df = yf.download(ticker, period=period, auto_adjust=True)

    if df.empty:
        return {"error": f"No data found for ticker {ticker}"}

    # Flatten MultiIndex columns if present
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df["Return"] = df["Close"].pct_change()
    df["Cumulative"] = (1 + df["Return"]).cumprod()

    if strategy == "rsi":
        df["RSI"] = compute_rsi(df["Close"])
        df["Signal"] = 0
        position = 0
        signals = []
        for i in range(len(df)):
            rsi_val = df["RSI"].iloc[i]
            if pd.isna(rsi_val):
                signals.append(0)
                continue
            if rsi_val < 30:
                position = 1
            elif rsi_val > 70:
                position = 0
            signals.append(position)
        df["Signal"] = signals
        df["Position"] = df["Signal"].shift(1)
    else:
        df["MA20"] = df["Close"].rolling(window=20).mean()
        df["MA50"] = df["Close"].rolling(window=50).mean()
        df["Signal"] = (df["MA20"] > df["MA50"]).astype(int)
        df["Position"] = df["Signal"].shift(1)

    df["StrategyReturn"] = df["Return"] * df["Position"]
    df["StrategyCumulative"] = (1 + df["StrategyReturn"]).cumprod()
    df = df.dropna()

    chart_data = []
    for date, row in df.iterrows():
        market_val = row["Cumulative"]
        strategy_val = row["StrategyCumulative"]
        if hasattr(market_val, 'iloc'):
            market_val = market_val.iloc[0]
        if hasattr(strategy_val, 'iloc'):
            strategy_val = strategy_val.iloc[0]
        chart_data.append({
            "date": str(date)[:10],
            "market": round(float(market_val), 4),
            "strategy": round(float(strategy_val), 4),
        })

    result = {
        "ticker": ticker.upper(),
        "strategy": strategy,
        "timeframe": timeframe,
        "market": {
            "total_return": total_return(df["Cumulative"]),
            "annualized_return": annualized_return(df["Return"]),
            "volatility": annualized_vol(df["Return"]),
            "sharpe_ratio": sharpe_ratio(df["Return"]),
            "max_drawdown": max_drawdown(df["Cumulative"]),
        },
        "strategy_metrics": {
            "total_return": total_return(df["StrategyCumulative"]),
            "annualized_return": annualized_return(df["StrategyReturn"]),
            "volatility": annualized_vol(df["StrategyReturn"]),
            "sharpe_ratio": sharpe_ratio(df["StrategyReturn"]),
            "max_drawdown": max_drawdown(df["StrategyCumulative"]),
        },
        "chart_data": chart_data,
    }

    cache[cache_key] = {"data": result, "timestamp": now}
    return result