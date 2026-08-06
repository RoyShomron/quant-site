from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

cache: dict = {}

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

CASH_RATE_ANNUAL = 0.04  # 4% annual — realistic money market / T-bill yield
CASH_RATE_DAILY = (1 + CASH_RATE_ANNUAL) ** (1 / 252) - 1

def total_return(cumulative_series):
    return float(cumulative_series.iloc[-1] - 1)

def annualized_return(daily_returns, trading_days=252):
    # Geometric annualisation: (total_growth) ^ (252/n) - 1
    # Correct formula — arithmetic mean overstates returns due to volatility drag
    clean = daily_returns.dropna()
    n = len(clean)
    if n == 0:
        return 0.0
    total_growth = float((1 + clean).prod())
    if total_growth <= 0:
        return -1.0
    return float(total_growth ** (trading_days / n) - 1)

def annualized_vol(daily_returns, trading_days=252):
    return float(daily_returns.std() * (trading_days ** 0.5))

def sharpe_ratio(daily_returns, trading_days=252, risk_free_rate=0.0):
    excess = daily_returns - (risk_free_rate / trading_days)
    vol = annualized_vol(excess, trading_days)
    return float((excess.mean() * trading_days) / vol) if vol != 0 else 0.0

def sortino_ratio(daily_returns, trading_days=252, risk_free_rate=0.0):
    """Like Sharpe but only penalises downside volatility."""
    try:
        excess = daily_returns - (risk_free_rate / trading_days)
        downside = excess[excess < 0].dropna()
        if len(downside) < 5:
            return sharpe_ratio(daily_returns, trading_days, risk_free_rate)
        downside_std = float(np.std(downside.values, ddof=1)) * (trading_days ** 0.5)
        if downside_std == 0 or not np.isfinite(downside_std):
            return sharpe_ratio(daily_returns, trading_days, risk_free_rate)
        val = float(excess.mean()) * trading_days / downside_std
        return float(val) if np.isfinite(val) else 0.0
    except Exception:
        return 0.0

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

def build_ml_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer features for ML strategies."""
    f = pd.DataFrame(index=df.index)

    close = df["Close"]

    # RSI (normalised to 0-1)
    f["rsi"] = compute_rsi(close) / 100.0

    # MACD — normalise by price so it's comparable across tickers
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    f["macd"] = macd_line / (close + 1e-9)
    f["macd_hist"] = (macd_line - macd_line.ewm(span=9, adjust=False).mean()) / (close + 1e-9)

    # Bollinger Band position: 0 = at lower band, 1 = at upper band
    ma20 = close.rolling(20).mean()
    std20 = close.rolling(20).std()
    f["bb_pos"] = (close - (ma20 - 2 * std20)) / (4 * std20 + 1e-9)

    # Price position within recent high-low range (0 = 20d low, 1 = 20d high)
    high20 = close.rolling(20).max()
    low20 = close.rolling(20).min()
    f["hl_pos"] = (close - low20) / (high20 - low20 + 1e-9)

    # Short and medium-term momentum
    f["ret_1d"] = close.pct_change(1)
    f["ret_3d"] = close.pct_change(3)
    f["ret_5d"] = close.pct_change(5)
    f["ret_10d"] = close.pct_change(10)
    f["ret_20d"] = close.pct_change(20)

    # Trend context: where price sits relative to its moving averages
    ma50 = close.rolling(50).mean()
    f["price_vs_ma20"] = close / (ma20 + 1e-9) - 1
    f["price_vs_ma50"] = close / (ma50 + 1e-9) - 1
    f["ma20_vs_ma50"] = ma20 / (ma50 + 1e-9) - 1
    # 200-day MA only when we have enough history — on 1y data it would
    # wipe out ~80% of rows via dropna, leaving almost no training samples
    if len(close) >= 350:
        ma200 = close.rolling(200).mean()
        f["price_vs_ma200"] = close / (ma200 + 1e-9) - 1

    # ATR-based volatility (normalised): how choppy is price right now?
    if "High" in df.columns and "Low" in df.columns:
        tr = pd.concat([
            df["High"] - df["Low"],
            (df["High"] - close.shift(1)).abs(),
            (df["Low"] - close.shift(1)).abs()
        ], axis=1).max(axis=1)
        f["atr_pct"] = tr.rolling(14).mean() / (close + 1e-9)
    else:
        f["atr_pct"] = std20 / (close + 1e-9)

    # Volume momentum (if available)
    if "Volume" in df.columns:
        vol = df["Volume"].replace(0, np.nan)
        vol_ma = vol.rolling(20).mean()
        f["vol_ratio"] = vol / (vol_ma + 1e-9)  # > 1 = above-average volume

    # Label: 1 if price is higher 5 days from now.
    # Must use float then dropna — pandas returns False (not NaN) when
    # comparing NaN > value, which would silently label the last 5 rows
    # as "down" and bias the model. Setting to NaN then dropping is correct.
    future_close = close.shift(-5)
    f["label"] = (future_close > close).astype(float)
    f.loc[future_close.isna(), "label"] = np.nan

    return f.dropna()


def get_period_string(timeframe: str) -> str:
    if timeframe == "3y":
        return "3y"
    elif timeframe == "5y":
        return "5y"
    return "1y"

@app.get("/backtest")
def run_backtest(ticker: str = "AAPL", strategy: str = "ma_crossover", timeframe: str = "1y"):
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
        # Classic RSI mean-reversion: buy oversold (< 30), sell overbought (> 70).
        # In cash otherwise — earns 4%/yr cash yield while waiting for signals.
        df["RSI"] = compute_rsi(df["Close"])
        position = 0
        signals = []
        for i in range(len(df)):
            rsi_val = df["RSI"].iloc[i]
            if pd.isna(rsi_val):
                signals.append(0)
                continue
            if rsi_val < 30:
                position = 1
            elif position == 1 and rsi_val > 70:
                position = 0
            signals.append(position)
        df["Signal"] = signals
        df["Position"] = df["Signal"].shift(1)

    elif strategy == "macd":
        df["EMA12"] = df["Close"].ewm(span=12, adjust=False).mean()
        df["EMA26"] = df["Close"].ewm(span=26, adjust=False).mean()
        df["MACD"] = df["EMA12"] - df["EMA26"]
        df["MACDSignal"] = df["MACD"].ewm(span=9, adjust=False).mean()
        df["Signal"] = (df["MACD"] > df["MACDSignal"]).astype(int)
        df["Position"] = df["Signal"].shift(1)

    elif strategy == "bollinger":
        # Bollinger with one-day bounce confirmation on entry: only buy the lower
        # band touch when price is already moving back up (close > prev close).
        # Avoids buying into stocks still in freefall. Exit stays at upper band.
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
            prev_price = float(df["Close"].iloc[i - 1]) if i > 0 else price
            lower = float(df["LowerBand"].iloc[i])
            upper = float(df["UpperBand"].iloc[i])
            bouncing = price > prev_price
            if price < lower and bouncing:
                position = 1
            elif price > upper:
                position = 0
            signals.append(position)
        df["Signal"] = signals
        df["Position"] = df["Signal"].shift(1)

    elif strategy in ("logistic_regression", "random_forest"):
        feat_df = build_ml_features(df)
        feature_cols = [c for c in feat_df.columns if c != "label"]
        X = feat_df[feature_cols].values
        y = feat_df["label"].values

        # Walk-forward validation — the honest approach.
        # Instead of training on 80% and predicting all 100% (which lets the
        # model "predict" data it already memorised), we retrain monthly and
        # only ever predict days the model has never seen.
        #
        # Example on 5-year data:
        #   Train on year 1 → predict month 13
        #   Train on years 1-13m → predict month 14
        #   ... and so on until the end
        #
        # Every single prediction is genuinely out-of-sample.

        # Need at least 6 months (126 days) to train the first model
        INITIAL_TRAIN = max(126, len(X) // 3)
        if INITIAL_TRAIN >= len(X) - 10:
            return {"error": "Not enough data to train ML model. Try a longer timeframe."}

        RETRAIN_EVERY = 21   # retrain once per month of new data

        # Start everything at 0.5 (no signal) — the warmup period stays in cash
        probs = np.full(len(X), 0.5)

        for train_end in range(INITIAL_TRAIN, len(X), RETRAIN_EVERY):
            pred_end = min(train_end + RETRAIN_EVERY, len(X))

            # Fit scaler only on training data seen so far
            scaler_wf = StandardScaler()
            X_train_wf = scaler_wf.fit_transform(X[:train_end])
            X_pred_wf  = scaler_wf.transform(X[train_end:pred_end])

            if strategy == "logistic_regression":
                model = LogisticRegression(max_iter=500, C=0.5, random_state=42)
            else:
                # Fewer trees than a one-shot fit — we retrain many times so
                # keep it fast; 50 trees is plenty for monthly retraining
                model = RandomForestClassifier(
                    n_estimators=50, max_depth=5, random_state=42,
                    n_jobs=-1, min_samples_leaf=8, max_features="sqrt"
                )

            model.fit(X_train_wf, y[:train_end])
            probs[train_end:pred_end] = model.predict_proba(X_pred_wf)[:, 1]

        # Align RSI to feat_df index for the overbought filter
        rsi_series = compute_rsi(df["Close"]).reindex(feat_df.index)
        prices = df["Close"].reindex(feat_df.index)

        # Position management:
        #   NORMAL ENTRY:  confidence > 0.57 AND RSI not overbought (< 68)
        #   NORMAL EXIT:   confidence < 0.46 (hysteresis) AND held >= 5 days
        #   STOP-LOSS:     price drops 5% below entry → exit immediately
        #   RECOVERY ENTRY (post stop-loss only):
        #     After a stop-loss, we track the lowest price seen while in cash.
        #     If price bounces >= 3% off that low AND confidence > 0.50,
        #     re-enter with a lower bar — catching the recovery rally that
        #     stop-loss exits would otherwise miss entirely.
        ENTRY_THRESH    = 0.54   # enough conviction without sitting out most of the market
        EXIT_THRESH     = 0.45
        RECOVERY_THRESH = 0.50   # lower bar — recovery entries need less conviction
        RSI_OB          = 72     # only block entry on clearly extreme overbought readings
        STOP_LOSS       = 0.07   # 7% — tighter than buy & hold but won't trigger on normal daily swings
        RECOVERY_BOUNCE = 0.03   # 3% bounce off the post-stop low triggers re-entry
        MIN_HOLD        = 5

        final_preds = []
        pos = 0
        hold_days = 0
        entry_price = None
        stopped_out = False   # True while watching for a recovery bounce
        post_stop_low = None  # lowest price seen since the stop-loss fired

        prices_arr = prices.values

        for i, (prob, rsi_val, price) in enumerate(
            zip(probs, rsi_series.values, prices_arr)
        ):
            if np.isnan(price):
                final_preds.append(0)
                continue

            price = float(price)

            if pos == 0:
                if stopped_out:
                    # Track the lowest point after being stopped out
                    if post_stop_low is None or price < post_stop_low:
                        post_stop_low = price

                    # Recovery re-entry: bounced off the low + model agrees
                    bounced = post_stop_low and price >= post_stop_low * (1 + RECOVERY_BOUNCE)
                    rsi_ok  = np.isnan(rsi_val) or (rsi_val < RSI_OB)
                    if bounced and prob > RECOVERY_THRESH and rsi_ok:
                        pos = 1
                        hold_days = 1
                        entry_price = price
                        stopped_out = False
                        post_stop_low = None
                else:
                    # Normal entry: high conviction + not overbought
                    rsi_ok = np.isnan(rsi_val) or (rsi_val < RSI_OB)
                    if prob > ENTRY_THRESH and rsi_ok:
                        pos = 1
                        hold_days = 1
                        entry_price = price
            else:
                hold_days += 1
                # Hard stop-loss
                if entry_price and price < entry_price * (1 - STOP_LOSS):
                    pos = 0
                    hold_days = 0
                    entry_price = None
                    stopped_out = True
                    post_stop_low = price
                # Normal exit: conviction gone, minimum hold elapsed
                elif hold_days >= MIN_HOLD and prob < EXIT_THRESH:
                    pos = 0
                    hold_days = 0
                    entry_price = None
                    # Normal exit — not a stop-loss, don't use recovery mode

            final_preds.append(pos)

        preds = np.array(final_preds)
        signal_series = pd.Series(preds, index=feat_df.index, dtype=float)
        df["Signal"] = signal_series.reindex(df.index).fillna(0)
        df["Position"] = df["Signal"].shift(1)

    else:
        df["MA20"] = df["Close"].rolling(window=20).mean()
        df["MA50"] = df["Close"].rolling(window=50).mean()
        df["Signal"] = (df["MA20"] > df["MA50"]).astype(int)
        df["Position"] = df["Signal"].shift(1)

    # When the strategy is in cash (position=0), earn the risk-free cash rate
    # (realistic: money market fund / T-bills at ~4% annual). This is the honest
    # comparison — idle cash isn't sitting under a mattress.
    df["StrategyReturn"] = (
        df["Return"] * df["Position"] +
        CASH_RATE_DAILY * (1 - df["Position"])
    )
    df["StrategyCumulative"] = (1 + df["StrategyReturn"]).cumprod()
    df = df.dropna()

    # Rolling drawdown series for both approaches
    market_peak = df["Cumulative"].cummax()
    df["MarketDD"] = (df["Cumulative"] / market_peak - 1) * 100
    strategy_peak = df["StrategyCumulative"].cummax()
    df["StrategyDD"] = (df["StrategyCumulative"] / strategy_peak - 1) * 100

    chart_data = []
    for date, row in df.iterrows():
        market_val = row["Cumulative"]
        strategy_val = row["StrategyCumulative"]
        position_val = row["Position"]
        market_dd = row["MarketDD"]
        strategy_dd = row["StrategyDD"]
        for col in [market_val, strategy_val, position_val, market_dd, strategy_dd]:
            if hasattr(col, 'iloc'):
                col = col.iloc[0]
        if hasattr(market_val, 'iloc'): market_val = market_val.iloc[0]
        if hasattr(strategy_val, 'iloc'): strategy_val = strategy_val.iloc[0]
        if hasattr(position_val, 'iloc'): position_val = position_val.iloc[0]
        if hasattr(market_dd, 'iloc'): market_dd = market_dd.iloc[0]
        if hasattr(strategy_dd, 'iloc'): strategy_dd = strategy_dd.iloc[0]
        chart_data.append({
            "date": str(date)[:10],
            "market": round(float(market_val), 4),
            "strategy": round(float(strategy_val), 4),
            "in_cash": float(position_val) == 0,
            "market_dd": round(float(market_dd), 2),
            "strategy_dd": round(float(strategy_dd), 2),
        })

    def safe(v):
        """Replace NaN/Inf with 0 so JSON serialisation never breaks."""
        try:
            return v if np.isfinite(v) else 0.0
        except Exception:
            return 0.0

    result = {
        "ticker": ticker.upper(),
        "strategy": strategy,
        "timeframe": timeframe,
        "market": {
            "total_return": safe(total_return(df["Cumulative"])),
            "annualized_return": safe(annualized_return(df["Return"])),
            "volatility": safe(annualized_vol(df["Return"])),
            "sharpe_ratio": safe(sharpe_ratio(df["Return"])),
            "sortino_ratio": safe(sortino_ratio(df["Return"])),
            "max_drawdown": safe(max_drawdown(df["Cumulative"])),
        },
        "strategy_metrics": {
            "total_return": safe(total_return(df["StrategyCumulative"])),
            "annualized_return": safe(annualized_return(df["StrategyReturn"])),
            "volatility": safe(annualized_vol(df["StrategyReturn"])),
            "sharpe_ratio": safe(sharpe_ratio(df["StrategyReturn"])),
            "sortino_ratio": safe(sortino_ratio(df["StrategyReturn"])),
            "max_drawdown": safe(max_drawdown(df["StrategyCumulative"])),
        },
        "chart_data": chart_data,
    }

    cache[cache_key] = {"data": result, "timestamp": now}
    return result