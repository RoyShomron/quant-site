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
        import threading
        def warm():
            for ticker in ["SPY", "AAPL", "TSLA", "NVDA", "AMZN", "MSFT", "GOOGL"]:
                try:
                    yf.download(ticker, period="1y", auto_adjust=True)
                except:
                    pass
            print("Warmup complete")
        threading.Thread(target=warm, daemon=True).start()
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
def run_backtest(ticker: str = "SPY", strategy: str = "ma_crossover", timeframe: str = "1y", strategy2: str = "none"):
    cache_key = f"{ticker}_{strategy}_{timeframe}_{strategy2}"
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

    elif strategy == "bollinger":
        df["MA20"] = df["Close"].rolling(window=20).mean()
        df["STD20"] = df["Close"].rolling(window=20).std()
        df["UpperBand"] = df["MA20"] + (2 * df["STD20"])
        df["LowerBand"] = df["MA20"] - (2 * df["STD20"])
        position = 0
        signals = []
        for i in range(len(df)):
            if pd.isna(df["MA20"].iloc[i]):
                signals.append(0)
                continue
            price = float(df["Close"].iloc[i])
            lower = float(df["LowerBand"].iloc[i])
            upper = float(df["UpperBand"].iloc[i])
            if price < lower:
                position = 1
            elif price > upper:
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
    if strategy2 != "none":
        df2 = df.copy()
        if strategy2 == "rsi":
            df2["RSI"] = compute_rsi(df2["Close"])
            position2 = 0
            signals2 = []
            for i in range(len(df2)):
                rsi_val = df2["RSI"].iloc[i]
                if pd.isna(rsi_val):
                    signals2.append(0)
                    continue
                if rsi_val < 30:
                    position2 = 1
                elif rsi_val > 70:
                    position2 = 0
                signals2.append(position2)
            df2["Signal2"] = signals2
            df2["Position2"] = pd.Series(signals2).shift(1).values
        elif strategy2 == "bollinger":
            df2["MA20"] = df2["Close"].rolling(window=20).mean()
            df2["STD20"] = df2["Close"].rolling(window=20).std()
            df2["UpperBand"] = df2["MA20"] + (2 * df2["STD20"])
            df2["LowerBand"] = df2["MA20"] - (2 * df2["STD20"])
            position2 = 0
            signals2 = []
            for i in range(len(df2)):
                if pd.isna(df2["MA20"].iloc[i]):
                    signals2.append(0)
                    continue
                price = float(df2["Close"].iloc[i])
                lower = float(df2["LowerBand"].iloc[i])
                upper = float(df2["UpperBand"].iloc[i])
                if price < lower:
                    position2 = 1
                elif price > upper:
                    position2 = 0
                signals2.append(position2)
            df2["Signal2"] = signals2
            df2["Position2"] = pd.Series(signals2).shift(1).values
        else:
            df2["MA20"] = df2["Close"].rolling(window=20).mean()
            df2["MA50"] = df2["Close"].rolling(window=50).mean()
            df2["Signal2"] = (df2["MA20"] > df2["MA50"]).astype(int)
            df2["Position2"] = df2["Signal2"].shift(1)

        df2["StrategyReturn2"] = df2["Return"] * df2["Position2"]
        df2["StrategyCumulative2"] = (1 + df2["StrategyReturn2"]).cumprod()
        df2 = df2.dropna()

        for item in result["chart_data"]:
            date = item["date"]
            matching = df2[df2.index.strftime("%Y-%m-%d") == date]
            if not matching.empty:
                val = float(matching["StrategyCumulative2"].iloc[0])
                item["strategy2"] = round(val, 4)
            else:
                item["strategy2"] = None

        result["strategy2_metrics"] = {
            "total_return": total_return(df2["StrategyCumulative2"]),
            "annualized_return": annualized_return(df2["StrategyReturn2"]),
            "volatility": annualized_vol(df2["StrategyReturn2"]),
            "sharpe_ratio": sharpe_ratio(df2["StrategyReturn2"]),
            "max_drawdown": max_drawdown(df2["StrategyCumulative2"]),
        }
        result["strategy2"] = strategy2

    cache[cache_key] = {"data": result, "timestamp": now}
    return result