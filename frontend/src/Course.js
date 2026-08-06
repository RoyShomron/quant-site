import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useWindowSize } from "./useWindowSize";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";
import { MathExpr } from "./MathRenderer";

// ─── CONTENT ────────────────────────────────────────────────────────────────

const modules = [
  // ─── MODULE 1: What Is Quant Finance? ────────────────────────────────────────
  {
    id: "what-is-quant",
    number: 1,
    title: "What Is Quant Finance?",
    description: "The big picture — what quants do, how they find edge, and what you'll be able to build by the end of this course.",
    color: "#0ea5e9",
    free: true,
    lessons: [
      {
        id: "quant-overview",
        title: "From Trading Floors to Algorithms",
        duration: "6 min",
        free: true,
        content: [
          { type: "cinematic",
            lines: [
              { text: "1988.", size: 80, weight: 900, accent: true, pause: 1400 },
              { text: "A mathematician quits his job.", size: 28, weight: 700, pause: 1100 },
              { text: "He's never traded a single stock.", size: 22, pause: 900 },
              { text: "He hires physicists.", size: 20, pause: 600 },
              { text: "Astronomers.", size: 20, pause: 600 },
              { text: "Computer scientists.", size: 20, pause: 1000 },
              { text: "Zero Wall Street analysts. Ever.", size: 20, dim: true, pause: 1200 },
              { text: "His fund returns 66% per year.", size: 36, weight: 900, accent: true, pause: 900 },
              { text: "For 30 consecutive years.", size: 36, weight: 900, accent: true, pause: 1000 },
              { text: "No fund in history has come close.", size: 14, dim: true, pause: 0 },
            ]
          },
          { type: "visual", variant: "return-counter",
            title: "What $10,000 became",
            desc: "Same starting amount. Same 30 years. Different approach."
          },
          { type: "visual", variant: "equity-curve",
            title: "The curve that broke finance",
            desc: "One line is the entire S&P 500. The other is a team of mathematicians.",
            note: "The gap is so extreme that a **log scale** is needed just to show both lines on the same chart."
          },
          { type: "visual", variant: "trader-vs-quant",
            title: "Why emotions destroy returns",
            desc: "Watch what happens to the same portfolio under two different decision-making systems."
          },
          { type: "interactive", variant: "coin-flip",
            title: "The secret: a tiny, consistent edge",
            desc: "This coin lands heads 52% of the time — just a 2% edge. Flip it 1,000 times and watch what that small advantage compounds into."
          },
          { type: "quiz",
            question: "What do Jim Simons, Ed Thorp, and David Shaw have in common?",
            options: ["They all started as stockbrokers", "They're all mathematicians who entered finance later", "They all worked at the same hedge fund", "They predicted the 2008 crash"],
            correct: 1,
            explanation: "Simons was a code-breaking mathematician. Ed Thorp beat blackjack with probability theory before moving to markets. David Shaw (DE Shaw) was a computer scientist. The most successful quants were almost never trained in finance — they brought outside rigour to a field driven by gut feeling."
          },
          { type: "insight", text: "The maths that powers Renaissance Technologies, DE Shaw, and Two Sigma — Python, statistics, open data — is **completely free and available to you right now**. That's what this course teaches." },
        ]
      },
      {
        id: "how-quants-make-money",
        title: "How Quants Find Edge",
        duration: "7 min",
        free: true,
        content: [
          { type: "cinematic",
            lines: [
              { text: "Every trade has two outcomes.", size: 26, weight: 700, pause: 1100 },
              { text: "You're right.", size: 44, weight: 900, pause: 700 },
              { text: "Or you're wrong.", size: 44, weight: 900, dim: true, pause: 1200 },
              { text: "Most traders try to be right more often.", size: 20, pause: 900 },
              { text: "Quants play a different game entirely.", size: 20, accent: true, pause: 1200 },
              { text: "Find a tiny edge.", size: 32, weight: 800, accent: true, pause: 700 },
              { text: "Apply it thousands of times.", size: 32, weight: 800, accent: true, pause: 900 },
              { text: "Let the maths do the rest.", size: 18, dim: true, pause: 0 },
            ]
          },
          { type: "interactive", variant: "edge-types",
            title: "The 4 Sources of Quant Edge",
            desc: "Click each approach. Watch how it looks on real chart data."
          },
          { type: "interactive", variant: "edge-calc",
            title: "What Makes a Strategy Profitable?",
            desc: "Drag the sliders. Watch exactly when expected value crosses from negative to positive. This is the maths behind every trading decision."
          },
          { type: "quiz",
            question: "A strategy wins only 40% of trades. Average win: $300. Average loss: $100. What happens over 1,000 trades?",
            options: ["It loses money — 40% win rate is too low", "It makes $60,000 profit — EV is positive", "It breaks even — 40% isn't enough to overcome losses", "Impossible to say without more information"],
            correct: 1,
            explanation: "EV = (0.40 × $300) − (0.60 × $100) = $120 − $60 = +$60 per trade. Over 1,000 trades: +$60,000. A 40% win rate is perfectly profitable if wins are large enough. Edge is not about being right often — it's about being right enough, and being paid well when you are."
          },
          { type: "insight", text: "The greatest quant funds don't win 70% of their trades. Medallion Fund wins roughly **52–55%** of trades. The edge is tiny. The mathematics compounds it into something extraordinary." },
        ]
      },
      {
        id: "tools-of-the-trade",
        title: "What You'll Actually Build",
        duration: "5 min",
        free: true,
        content: [
          { type: "cinematic",
            lines: [
              { text: "By the end of this course,", size: 22, weight: 600, pause: 1000 },
              { text: "you will have built things", size: 30, weight: 800, pause: 900 },
              { text: "that most finance professionals", size: 30, weight: 800, pause: 700 },
              { text: "cannot build.", size: 44, weight: 900, accent: true, pause: 1400 },
              { text: "A backtester. An RSI strategy. An ML predictor.", size: 18, pause: 900 },
              { text: "All from scratch. All on real data.", size: 18, dim: true, pause: 0 },
            ]
          },
          { type: "visual", variant: "build-preview",
            title: "Here's exactly what you'll build",
            desc: "These are the actual outputs from the final lessons. Click through each one."
          },
          { type: "visual", variant: "roadmap",
            title: "Your path through the course",
            desc: "Six modules. Each one unlocks the next. You are at the beginning."
          },
          { type: "quiz",
            question: "Why does this course teach Python before quant maths — not the other way around?",
            options: ["Python is easier than maths", "So you can run code while learning the maths — seeing it move makes it click", "Quant maths isn't important", "The course author prefers programming"],
            correct: 1,
            explanation: "Learning standard deviation from a formula is abstract. Running it on Apple's actual return series and watching the number change as you add data — that's when it becomes intuition. The code module comes first so the maths module has something to run on."
          },
          { type: "insight", text: "The tools that power Renaissance Technologies, DE Shaw, and Two Sigma are **completely free and available to you right now**. Python, open financial data, the same mathematics. The only thing separating you from using them is this course." },
        ]
      },
    ]
  },

  // ─── MODULE 2: Python From Scratch ──────────────────────────────────────────
  {
    id: "python-basics",
    number: 2,
    title: "Python From Scratch",
    description: "Learn to code from zero — no prior experience needed. Clear examples, no jargon.",
    color: "#22c55e",
    free: false,
    lessons: [
      {
        id: "variables-numbers",
        title: "Variables, Numbers, and Arithmetic",
        duration: "8 min",
        free: true,
        content: [
          { type: "intro",
            hook: "Your first superpower",
            text: "Python is **free**, runs in your browser, and is used by every major hedge fund on the planet.",
            sub: "You don't need to install anything. Open replit.com in a new tab and run every example in this lesson right now."
          },
          { type: "walkthrough",
            title: "Variables — Storing Values",
            code: `# A variable is a named box that holds a value\nage = 25\nprice = 149.95\ntemperature = -3.5\n\n# Do arithmetic with variables\ndoubled_price = price * 2\nprint(doubled_price)\n\n# Update — overwrites the old value\nprice = 155.00`,
            steps: [
              { lines: [0,1,2,3], title: "Name your boxes", icon: "📦",
                explain: "Type a name, then = then a value. Python creates a slot in memory and stores the number. No spaces in names — use underscores like daily_return or stock_price.",
                output: null },
              { lines: [5,6,7], title: "Do arithmetic", icon: "🔢",
                explain: "Use variables in calculations just like algebra. Python evaluates the right side first, stores the result in the left. price * 2 = 299.9.",
                output: "299.9" },
              { lines: [9,10], title: "Update a value", icon: "🔄",
                explain: "Assign again to overwrite. price was 149.95 — now it's 155.00. The old value is gone. This is how strategies update prices tick by tick.",
                output: null },
            ]
          },
          { type: "walkthrough",
            title: "The Five Operators",
            code: `a = 20\nb = 6\n\nprint(a + b)    # addition\nprint(a - b)    # subtraction\nprint(a * b)    # multiplication\nprint(a / b)    # division\nprint(a ** b)   # power\nprint(a % b)    # remainder\n\nresult = (a + b) * 2`,
            steps: [
              { lines: [0,1], title: "Two numbers to work with", icon: "🔧",
                explain: "a = 20, b = 6. We'll use these to explore all five operators. Nothing special — just setup.",
                output: null },
              { lines: [3,4,5,6], title: "+  −  ×  ÷", icon: "➕",
                explain: "The basics. Note: / always gives a decimal (20/6 = 3.333…, not 3). If you only want the whole-number part, use // instead.",
                output: "26  14  120  3.333" },
              { lines: [7,8], title: "Power and Remainder", icon: "⚡",
                explain: "** = 'to the power of'. 20**6 = 64 million. % gives the remainder after division — 20 ÷ 6 = 3 remainder 2, so 20 % 6 = 2.",
                output: "64000000  2" },
              { lines: [10], title: "Brackets — same as maths", icon: "🧮",
                explain: "Python respects BODMAS. Brackets first, then *, then +. (20+6) × 2 = 52. Always use brackets when you're not sure of the order.",
                output: "52" },
            ]
          },
          { type: "walkthrough",
            title: "Your First Return Calculator",
            code: `# Apple — June 12 2024\nopening_price = 142.30\nclosing_price = 148.75\n\n# How much did it move in dollars?\ndaily_change = closing_price - opening_price\n\n# Convert to a percentage\npct_change = daily_change / opening_price * 100\nprint(pct_change)`,
            steps: [
              { lines: [0,1,2], title: "Real stock data", icon: "📈",
                explain: "These are actual Apple prices. Every strategy starts exactly like this — two numbers: where the price opened, and where it closed.",
                output: null },
              { lines: [4,5], title: "Calculate the dollar move", icon: "💵",
                explain: "Simple subtraction. 148.75 − 142.30 = 6.45. Apple moved up $6.45 that day. We store it as daily_change.",
                output: "6.45" },
              { lines: [7,8,9], title: "Convert to a %", icon: "💯",
                explain: "Divide by the opening price, multiply by 100. Result: 4.53%. Repeat this across 5 years of daily data and you have a full return series — the backbone of a backtester.",
                output: "4.53" },
            ]
          },
          { type: "insight", text: "That last walkthrough is **the heart of every backtester ever written** — open price, close price, compute return. Repeat it thousands of times and you have quant research." },
        ]
      },
      {
        id: "strings-booleans",
        title: "Text, True/False, and Printing Results",
        duration: "7 min",
        free: true,
        content: [
          { type: "intro", text: "Numbers aren't the only thing Python works with. Text (called 'strings') and true/false values (called 'booleans') are equally important — and knowing how to print things clearly is one of the most useful skills in Python." },
          { type: "heading", text: "Strings — Working With Text" },
          { type: "text", text: "A string is any piece of text wrapped in quotes. Single or double quotes both work. Strings are used for things like stock ticker names, labels, and messages." },
          { type: "code", language: "python", code: `# Strings — wrap text in quotes
ticker   = "AAPL"
exchange = 'NASDAQ'

# Join two strings together with +
full_name = ticker + " on " + exchange
print(full_name)    # AAPL on NASDAQ

# String methods — built-in tools for text
print(ticker.lower())    # aapl
print(ticker.upper())    # AAPL (already uppercase)
print(len(ticker))       # 4 — number of characters` },
          { type: "heading", text: "f-strings — Mix Variables Into Text" },
          { type: "text", text: "The most useful way to print results: **f-strings**. Put an `f` before the opening quote, then wrap any variable in `{}` and it gets inserted automatically." },
          { type: "code", language: "python", code: `ticker        = "AAPL"
closing_price = 187.42
daily_return  = 0.0234   # 2.34%

# f-string: f"..." with {variable} inside
print(f"{ticker} closed at $" + str(closing_price))  # e.g. AAPL closed at $187.42
# AAPL closed at $187.42

# :.2f means "show 2 decimal places"
print(f"{ticker} moved {daily_return * 100:.2f}% today")
# AAPL moved 2.34% today

# :.1% means "format as a percentage with 1 decimal place"
print(f"Return: {daily_return:.1%}")
# Return: 2.3%` },
          { type: "heading", text: "Booleans — True and False" },
          { type: "text", text: "A boolean holds exactly one of two values: `True` or `False`. They're the result of comparisons — and they're how every strategy decides whether to buy or sell." },
          { type: "code", language: "python", code: `price = 150
rsi   = 28

# Comparison operators return True or False
print(price > 100)    # True
print(price == 200)   # False  (== means "is equal to?")
print(price != 200)   # True   (!= means "is not equal to?")
print(rsi < 30)       # True   (RSI below 30 = oversold)

# Store a boolean in a variable
is_oversold = rsi < 30
print(is_oversold)    # True

# Check type of any variable
print(type(price))        # <class 'int'>
print(type("AAPL"))       # <class 'str'>
print(type(is_oversold))  # <class 'bool'>` },
          { type: "insight", text: "Booleans feel simple but they're the core of every trading signal. 'Is RSI below 30?' — that's a boolean question. 'Is the 20-day average above the 50-day average?' — boolean again. Every buy and sell decision in code ultimately comes down to True or False." },
        ]
      },
      {
        id: "lists-loops",
        title: "Lists and Loops — Handling Many Values",
        duration: "10 min",
        free: false,
        content: [
          { type: "intro", text: "A single price isn't very useful. A year's worth of prices is. Lists let you store many values in one place; loops let you process every item without repeating yourself. Together they're how you work with real data." },
          { type: "heading", text: "Lists — Multiple Values in One Variable" },
          { type: "code", language: "python", code: `# Square brackets, values separated by commas
scores      = [88, 72, 95, 61, 100]
weekdays    = ["Mon", "Tue", "Wed", "Thu", "Fri"]
mixed       = [42, "AAPL", True, 3.14]   # lists can mix types

# Access items by position — Python counts from 0
print(scores[0])    # 88  — first item
print(scores[2])    # 95  — third item
print(scores[-1])   # 100 — last item (negative = count from end)

# How many items?
print(len(scores))  # 5

# Add an item to the end
scores.append(77)
print(scores)       # [88, 72, 95, 61, 100, 77]` },
          { type: "heading", text: "Loops — Do Something for Every Item" },
          { type: "code", language: "python", code: `prices = [142.00, 145.50, 143.20, 148.80, 147.30]

# For loop: runs the indented code once for each item
for price in prices:
    print(price)
# Prints each price on its own line

# More useful: calculate what each item is as a percentage of the first
first = prices[0]
for price in prices:
    pct = (price / first - 1) * 100
    print(f"{pct:+.2f}%")
# +0.00%, +2.46%, +0.85%, +4.79%, +3.73%` },
          { type: "heading", text: "Building a New List From a Loop" },
          { type: "code", language: "python", code: `prices  = [142.00, 145.50, 143.20, 148.80, 147.30]
returns = []    # start with an empty list

# range(1, len(prices)) gives us 1, 2, 3, 4 — we skip 0 because
# we need a "previous" price, and day 0 has no previous day
for i in range(1, len(prices)):
    prev  = prices[i - 1]
    today = prices[i]
    ret   = (today - prev) / prev
    returns.append(ret)    # add this return to our list

print(returns)
# [0.0246, -0.0158, 0.0390, -0.0101]

# Useful shortcuts
print(sum(returns))            # total of all values
print(sum(returns) / len(returns))  # average return` },
          { type: "insight", text: "That loop is literally the core of any returns calculator. Every performance metric — Sharpe ratio, drawdown, volatility — starts from a list of daily returns built exactly like this." },
        ]
      },
      {
        id: "conditionals",
        title: "If, Elif, Else — Making Decisions in Code",
        duration: "8 min",
        free: false,
        content: [
          { type: "intro", text: "Almost every trading strategy can be described as a set of rules: 'if the RSI drops below 30, buy; if it goes above 70, sell; otherwise, do nothing.' In Python, those rules are written with if, elif, and else. This is how strategies make decisions." },
          { type: "heading", text: "The Basic Structure" },
          { type: "code", language: "python", code: `# if: run this block only when the condition is True
temperature = 25

if temperature > 30:
    print("It's hot")

# Nothing printed — 25 is not greater than 30` },
          { type: "code", language: "python", code: `# if / else: two options — one when True, one when False
rsi = 28

if rsi < 30:
    print("Oversold — consider buying")
else:
    print("Not oversold")

# Prints: Oversold — consider buying` },
          { type: "code", language: "python", code: `# if / elif / else: multiple conditions, checked in order
# elif = "else if" — only checked if the previous condition was False
rsi = 55

if rsi < 30:
    signal = "BUY"
elif rsi > 70:
    signal = "SELL"
else:
    signal = "HOLD"

print(signal)    # HOLD — neither condition above was True` },
          { type: "heading", text: "Combining Conditions" },
          { type: "code", language: "python", code: `price    = 148.50
volume   = 2_500_000    # underscore just makes big numbers readable
avg_vol  = 1_000_000

# and: BOTH must be True
if price > 145 and volume > avg_vol:
    print("Price up on high volume — strong signal")

# or: AT LEAST ONE must be True
rsi   = 28
macd  = -0.5

if rsi < 30 or macd < -0.3:
    print("At least one indicator is bearish")

# not: flips True to False and vice versa
in_position = False
if not in_position:
    print("We're currently in cash")` },
          { type: "heading", text: "A Mini Strategy in Code" },
          { type: "code", language: "python", code: `def get_signal(rsi, price, ma_50):
    """
    A simple signal function.
    Returns "BUY", "SELL", or "HOLD".
    """
    if rsi < 30 and price > ma_50:
        # Oversold but price is still above long-term average
        return "BUY"
    elif rsi > 70:
        return "SELL"
    else:
        return "HOLD"

# Test it
print(get_signal(rsi=27, price=155, ma_50=140))   # BUY
print(get_signal(rsi=74, price=180, ma_50=140))   # SELL
print(get_signal(rsi=50, price=155, ma_50=140))   # HOLD` },
          { type: "insight", text: "Every professional trading strategy, no matter how sophisticated, is ultimately a function that takes in market data and returns a signal. You just wrote one. The ML strategies in the final module do the same thing — they're just better at finding the right conditions." },
        ]
      },
      {
        id: "functions",
        title: "Functions — Writing Reusable Code",
        duration: "10 min",
        free: false,
        content: [
          { type: "intro", text: "A function is a reusable block of code with a name. Instead of writing the same calculation 10 times, you write it once as a function and call it whenever you need it. Every strategy in quant finance is built as a collection of functions." },
          { type: "heading", text: "Defining and Calling a Function" },
          { type: "code", language: "python", code: `# def means "define a new function"
# square_area is the name we choose
# side_length is the input (called a "parameter")

def square_area(side_length):
    area = side_length ** 2
    return area       # return sends the result back to the caller

# Call the function — give it a value for side_length
result = square_area(5)
print(result)    # 25

# Call it again with a different value
print(square_area(12))    # 144` },
          { type: "heading", text: "Multiple Parameters and Default Values" },
          { type: "code", language: "python", code: `# Multiple inputs, separated by commas
def daily_return(price_today, price_yesterday):
    return (price_today - price_yesterday) / price_yesterday

print(daily_return(152.40, 148.50))   # 0.02626...

# Default values — used when the caller doesn't supply a value
def moving_average(prices, n=20):
    """Calculate the n-day moving average of a list of prices."""
    if len(prices) < n:
        return None    # not enough data yet

    recent = prices[-n:]                # take the last n items
    return sum(recent) / n             # return the average

prices = [140, 142, 145, 143, 148, 150, 152, 149, 153, 155,
          157, 154, 158, 161, 163, 160, 164, 166, 168, 165]

print(moving_average(prices))        # uses default n=20
print(moving_average(prices, n=5))   # override with 5-day MA` },
          { type: "heading", text: "A Function That Returns a Signal" },
          { type: "code", language: "python", code: `def should_buy(prices):
    """
    MA crossover signal:
    Return True when 5-day MA crosses above 10-day MA.
    """
    if len(prices) < 10:
        return False    # not enough history

    fast_ma = moving_average(prices, n=5)
    slow_ma = moving_average(prices, n=10)

    return fast_ma > slow_ma    # True = buy, False = stay out

# Test it
print(should_buy(prices))   # True or False

# Now we can use it for any list of prices:
another_stock = [200, 198, 197, 201, 205, 210, 208, 215, 218, 222]
print(should_buy(another_stock))` },
          { type: "insight", text: "Notice how `should_buy` calls `moving_average` inside it — functions calling other functions. This is how all real software is structured: small, focused functions that each do one thing, combined into larger systems. The strategies in QuantWorld's backtester follow exactly this pattern." },
        ]
      },
    ]
  },

  // ─── MODULE 3: Working With Data ─────────────────────────────────────────────
  {
    id: "working-with-data",
    number: 3,
    title: "Working With Data",
    description: "Load, explore, and slice real stock data using pandas — the quant's essential tool.",
    color: "#a855f7",
    free: false,
    lessons: [
      {
        id: "pandas-intro",
        title: "Pandas — Spreadsheets in Python",
        duration: "12 min",
        free: false,
        content: [
          { type: "intro", text: "Python lists work fine for small examples. But real stock data has thousands of rows, dates, and multiple columns. Pandas is the library built specifically for this — and it's what every quant uses. Think of it as Excel, but programmable." },
          { type: "heading", text: "DataFrames and Series" },
          { type: "text", text: "Pandas has two key structures. A **Series** is like a single column — a list of values with an index (usually dates). A **DataFrame** is a table — multiple Series side by side, each sharing the same index. Real stock data is a DataFrame: rows are dates, columns are Open, High, Low, Close, Volume." },
          { type: "code", language: "python", code: `# Install once: pip install pandas yfinance
# yfinance downloads real data from Yahoo Finance

import pandas as pd
import yfinance as yf

# Download 1 year of Apple data
aapl = yf.download("AAPL", period="1y", auto_adjust=True)

print(aapl.head())      # first 5 rows
print(aapl.shape)       # (252, 5) — 252 days, 5 columns
print(aapl.columns)     # Index(['Close', 'High', 'Low', 'Open', 'Volume'])` },
          { type: "heading", text: "Selecting and Calculating" },
          { type: "code", language: "python", code: `# Get just the closing prices — a Series
prices = aapl["Close"].squeeze()

# Calculate daily returns in one line
daily_returns = prices.pct_change()    # pct_change = percentage change

# Rolling average — pandas slides a window along for you
ma20 = prices.rolling(20).mean()    # 20-day moving average
ma50 = prices.rolling(50).mean()    # 50-day moving average

# Compare — True where MA20 is above MA50
signal = ma20 > ma50

print(signal.tail(5))    # last 5 signals (True/False)` },
          { type: "code", language: "python", code: `# Summary statistics at a glance
total_return = (prices.iloc[-1] / prices.iloc[0]) - 1
print(f"AAPL 1-year return: {total_return:.1%}")

# How volatile?
annual_vol = daily_returns.std() * (252 ** 0.5)
print(f"Annual volatility: {annual_vol:.1%}")

# .describe() gives you min, max, mean, percentiles in one go
print(daily_returns.describe())` },
          { type: "insight", text: "Everything QuantWorld shows you in the backtester — returns, volatility, Sharpe — is calculated in 10-20 lines of pandas code like this. You now understand what's happening under the hood." },
        ]
      },
      {
        id: "exploring-data",
        title: "Exploring a Real Dataset",
        duration: "10 min",
        free: false,
        content: [
          { type: "intro", text: "Downloading data is step one. Understanding what you have before you try to model it is step two — and most beginners skip it. A few simple exploration steps catch errors, outliers, and gaps before they quietly corrupt your backtest." },
          { type: "heading", text: "First Steps With Any New Dataset" },
          { type: "code", language: "python", code: `import pandas as pd
import yfinance as yf

df = yf.download("SPY", period="5y", auto_adjust=True)
prices = df["Close"].squeeze()
returns = prices.pct_change().dropna()

# How many rows and columns?
print(df.shape)          # (1259, 5) — about 5 years of trading days

# First and last dates in the data
print(df.index[0])       # e.g. 2020-06-09
print(df.index[-1])      # e.g. 2025-06-06

# Quick summary — count, mean, std, min, max, percentiles
print(returns.describe())` },
          { type: "heading", text: "Checking for Missing Data" },
          { type: "text", text: "Missing values (shown as `NaN` in pandas) are common — trading halts, weekends accidentally included, data provider gaps. If you don't catch them they'll silently produce wrong results." },
          { type: "code", language: "python", code: `# Count missing values in each column
print(df.isnull().sum())

# The first return is always NaN (no "previous" price on day 1)
print(returns.isnull().sum())   # should be 1

# Drop NaN rows — common practice before calculating metrics
clean_returns = returns.dropna()

# Check for any extreme outliers
print(returns.sort_values().head(5))    # worst 5 days
print(returns.sort_values().tail(5))    # best 5 days` },
          { type: "heading", text: "Visualising Quickly" },
          { type: "code", language: "python", code: `import matplotlib.pyplot as plt

# Price history — is the data continuous?
prices.plot(title="SPY Closing Price", figsize=(12, 4))
plt.show()

# Return distribution — is it roughly bell-shaped?
returns.hist(bins=60, figsize=(8, 4))
plt.title("Daily Return Distribution")
plt.show()

# Rolling 20-day volatility — periods of calm and panic
rolling_vol = returns.rolling(20).std() * (252**0.5)
rolling_vol.plot(title="Annualised Volatility (20-day rolling)")
plt.show()` },
          { type: "insight", text: "Data exploration is boring — which is exactly why it catches the bugs that matter. A gap in the data, a stock split that doubled prices overnight, a bad download — all of these will completely distort a backtest. Spending 5 minutes here saves hours of confusion later." },
        ]
      },
      {
        id: "filtering-data",
        title: "Filtering, Sorting, and Comparing",
        duration: "9 min",
        free: false,
        content: [
          { type: "intro", text: "Most real analysis involves finding specific rows, comparing multiple assets, and slicing data by date. These are the pandas operations you'll use in every strategy you build." },
          { type: "heading", text: "Filtering With Conditions" },
          { type: "code", language: "python", code: `import pandas as pd
import yfinance as yf

df = yf.download("AAPL", period="2y", auto_adjust=True)
prices = df["Close"].squeeze()
returns = prices.pct_change().dropna()

# Boolean filter: keep only days with a large positive return
big_up_days = returns[returns > 0.03]       # more than +3%
print(f"Days up more than 3%: {len(big_up_days)}")
print(big_up_days.sort_values(ascending=False).head(5))

# Filter rows where volume was above average
avg_volume = df["Volume"].mean()
high_volume_days = df[df["Volume"] > avg_volume * 2]
print(f"High-volume days: {len(high_volume_days)}")` },
          { type: "heading", text: "Slicing by Date" },
          { type: "code", language: "python", code: `# Slice by date range — pandas accepts string dates
prices_2024 = prices["2024-01-01":"2024-12-31"]
print(f"2024 trading days: {len(prices_2024)}")

# Just the last 60 trading days
last_60 = prices.tail(60)

# .loc selects by label (date), .iloc selects by integer position
print(prices.loc["2024-06-01"])        # price on a specific date
print(prices.iloc[0])                  # very first price in the dataset` },
          { type: "heading", text: "Comparing Two Assets" },
          { type: "code", language: "python", code: `# Download multiple tickers at once
data = yf.download(["AAPL", "MSFT", "SPY"], period="2y", auto_adjust=True)
prices = data["Close"]    # DataFrame with 3 columns

# Normalise to 100 at start — easy visual comparison
normalised = prices / prices.iloc[0] * 100
print(normalised.tail(3))

# Correlation — how similarly do they move?
returns_all = prices.pct_change().dropna()
print(returns_all.corr())    # correlation matrix

# Best and worst performing over the period
total_returns = prices.iloc[-1] / prices.iloc[0] - 1
print(total_returns.sort_values(ascending=False))` },
          { type: "insight", text: "Normalising prices to 100 at the start is a simple but powerful trick for comparing assets with different price levels — it makes relative performance instantly visible. You'll use this pattern constantly when evaluating strategy performance against a benchmark." },
        ]
      },
    ]
  },

  // ─── MODULE 4: The Math Behind Finance ───────────────────────────────────────
  {
    id: "math-foundations",
    number: 4,
    title: "The Math Behind Finance",
    description: "The core mathematical ideas every quant needs — intuition first, formulas second.",
    color: "#f97316",
    free: false,
    lessons: [
      {
        id: "log-returns",
        title: "Why +50% then -50% Doesn't Break Even",
        duration: "7 min",
        free: true,
        content: [
          { type: "intro", text: "If you make 50% and then lose 50%, most people assume you're back where you started. You're not — you're down 25%. This broken arithmetic is exactly why quants use a different way of measuring returns." },
          { type: "heading", text: "The Problem, With Real Numbers" },
          { type: "text", text: "Start with $100. You gain 50% — now you have $150. Great. Then you lose 50% of $150 — that's $75 lost, leaving you with $75. You're down 25%, not zero." },
          { type: "text", text: "**Why?** Because the 50% loss is applied to a bigger number ($150) than the original gain was applied to ($100). Percentages don't cancel cleanly when the base keeps changing." },
          { type: "formula", formula: "r = \\frac{P_t - P_{t-1}}{P_{t-1}}", vars: [{ var: "P_t", desc: "Price today" }, { var: "P_{t-1}", desc: "Price yesterday" }, { var: "Problem", desc: "Chain two simple returns together and they don't add up correctly" }] },
          { type: "heading", text: "The Fix: Log Returns" },
          { type: "text", text: "A log return is calculated using the natural logarithm of the price ratio. The key property: **log returns add up perfectly across time.** Day 1 log return + Day 2 log return = total log return, always, exactly." },
          { type: "formula", formula: "r_{log} = \\ln \\frac{P_t}{P_{t-1}}", vars: [{ var: "\\ln", desc: "Natural logarithm — a mathematical function built into every calculator" }, { var: "P_t", desc: "Price today" }, { var: "P_{t-1}", desc: "Price yesterday" }, { var: "Key property", desc: "Log returns add up perfectly across time — simple returns do not" }] },
          { type: "steps", label: "Worked Example", steps: [
            { label: "Start",           expr: "Price = \\$100" },
            { label: "Gain +50%",       expr: "100 \\times 1.50 = \\$150,  \\quad r_1 = \\ln\\frac{150}{100} = +0.405" },
            { label: "Loss −50%",       expr: "150 \\times 0.50 = \\$75,   \\quad r_2 = \\ln\\frac{75}{150}  = -0.693" },
            { label: "Sum log returns", expr: "r_1 + r_2 = 0.405 + (-0.693) = -0.288" },
            { label: "Convert back",    expr: "e^{-0.288} - 1 = -25\\%" },
          ]},
          { type: "text", text: "The same −25% answer — but calculated with simple addition, not multiplication. That's why models use log returns when working across thousands of trading days at once." },
          { type: "insight", text: "You'll never need to calculate a log return by hand. The point is understanding *why* quant models use them — and now you do. Every return series in QuantWorld's backtester is log-based under the hood." },
        ]
      },
      {
        id: "standard-deviation",
        title: "Standard Deviation: The Language of Risk",
        duration: "8 min",
        free: true,
        content: [
          { type: "intro", text: "Every risk metric in finance — Sharpe ratio, Bollinger Bands, volatility — is built on one idea: standard deviation. It sounds intimidating. It isn't. It's just a measure of how much something bounces around." },
          { type: "heading", text: "What It Measures — No Jargon" },
          { type: "text", text: "Imagine two people commuting to work. Person A takes 30 minutes every single day. Person B takes anywhere from 10 to 50 minutes — sometimes fast, sometimes stuck in traffic. Both average 30 minutes. But Person B has much higher 'standard deviation' — their commute is unpredictable." },
          { type: "text", text: "For stocks: SPY moves about 0.5% on a typical day. TSLA might move 3%. Both could average the same overall return. But TSLA has far higher standard deviation — the ride is much bumpier." },
          { type: "formula", formula: "\\sigma = \\sqrt{\\frac{\\sum (r_i - \\bar{r})^2}{n}}", vars: [{ var: "\\sigma", desc: "Standard deviation — the volatility number you're calculating" }, { var: "r_i", desc: "Each individual day's return" }, { var: "\\bar{r}", desc: "The average daily return over the period" }, { var: "n", desc: "How many days you're measuring" }] },
          { type: "heading", text: "Step By Step With Real Numbers" },
          { type: "steps", label: "Worked Example — 5 daily returns: +2%, −1%, +3%, −2%, +1%", steps: [
            { label: "Step 1 — Mean",        expr: "\\bar{r} = \\frac{2 - 1 + 3 - 2 + 1}{5} = 0.6\\%" },
            { label: "Step 2 — Deviations",  expr: "+1.4\\%,\\; -1.6\\%,\\; +2.4\\%,\\; -2.6\\%,\\; +0.4\\%" },
            { label: "Step 3 — Square each", expr: "1.96,\\; 2.56,\\; 5.76,\\; 6.76,\\; 0.16" },
            { label: "Step 4 — Average",     expr: "\\frac{1.96 + 2.56 + 5.76 + 6.76 + 0.16}{5} = 3.44" },
            { label: "Step 5 — Square root", expr: "\\sigma = \\sqrt{3.44} = 1.85\\% \\text{ per day}" },
          ]},
          { type: "heading", text: "From Daily to Annual" },
          { type: "text", text: "A daily volatility of 1.85% sounds small. To convert to annual, multiply by √252 (there are 252 trading days in a year, and volatility scales with the square root of time — not time itself). 1.85% × √252 ≈ 29%. That's an annual volatility of 29% — a moderately volatile stock." },
          { type: "insight", text: "**Why square root of time, not time itself?** Because gains and losses partially cancel each other out over longer periods. A stock with 1% daily vol doesn't have 252% annual vol — it has 1% × √252 ≈ 16%. This is one of the most fundamental facts in quantitative finance." },
        ]
      },
      {
        id: "normal-distribution",
        title: "The Bell Curve — And Why Markets Break It",
        duration: "8 min",
        free: true,
        content: [
          { type: "intro", text: "Almost every model in finance assumes that daily returns follow a bell curve. They don't. This assumption has caused some of the biggest blowups in financial history — and understanding why it fails makes you a sharper thinker than most." },
          { type: "heading", text: "The Bell Curve Assumption" },
          { type: "text", text: "A normal distribution (bell curve) is perfectly symmetrical. Most outcomes cluster near the average. Extreme outcomes become exponentially rarer the further you get from the centre. It's described completely by just two numbers: the mean and standard deviation." },
          { type: "text", text: "In a normal distribution with 1% daily volatility, a −5% day (5 standard deviations from average) should happen roughly once every 3.5 million trading days — about 14,000 years. In reality, −5% days happen every few years on almost any stock." },
          { type: "formula", formula: "P(-5\\% \\text{ day}) \\approx \\frac{1}{3{,}500{,}000} \\quad \\text{(model)}\nP(-5\\% \\text{ day}) \\approx \\frac{1}{500} \\quad \\text{(reality)}", vars: [{ var: "The gap", desc: "Extreme moves are 7,000× more likely in reality than the normal model predicts" }, { var: "Why", desc: "Markets have fat tails — fear and greed cause clustering of extreme events" }] },
          { type: "heading", text: "What Fat Tails Look Like" },
          { type: "text", text: "Think of it this way: a bell curve says big surprises are incredibly rare. But in markets, panics, crashes, and euphoric rallies happen all the time. Fear and greed create clustering — bad days follow bad days, good days follow good days. That clustering makes the tails 'fatter' than the pure maths predicts." },
          { type: "text", text: "The 2008 financial crisis was supposedly a '25-sigma event' under normal distribution models — so unlikely it shouldn't happen in the lifetime of the universe. It happened in 18 months. The model wasn't wrong about the maths. It was wrong about the assumption." },
          { type: "insight", text: "This doesn't make quantitative finance useless — it means you have to use the right models. Professional risk systems use fat-tailed distributions and stress tests that explicitly ask 'what if today is a 2008?' rather than trusting the bell curve to tell them it can't happen." },
        ]
      },
      {
        id: "correlation",
        title: "Correlation — What Moves Together",
        duration: "8 min",
        free: false,
        content: [
          { type: "intro", text: "Correlation tells you how closely two things move together. It's one of the most used — and most misused — numbers in finance. Understanding it properly explains why diversification works, why some strategies fail in crashes, and why 'correlation doesn't mean causation' is more than just a cliché." },
          { type: "heading", text: "What the Number Means" },
          { type: "text", text: "Correlation ranges from −1 to +1. A correlation of +1 means two assets move in perfect lockstep — when one goes up 1%, the other goes up 1%. A correlation of −1 means they move perfectly opposite. A correlation of 0 means they move completely independently — knowing what one does tells you nothing about the other." },
          { type: "text", text: "Real examples: SPY and QQQ (S&P 500 vs Nasdaq) have correlation around +0.9 — very similar. SPY and GLD (S&P 500 vs gold) are around +0.1 to +0.3 — nearly uncorrelated, which is why gold is considered a 'safe haven.' Long and short positions in the same stock have correlation −1.0 — they're perfect opposites by design." },
          { type: "formula", formula: "\\rho = \\frac{\\sum (r_A - \\bar{r}_A)(r_B - \\bar{r}_B)}{\\sqrt{\\sum (r_A - \\bar{r}_A)^2 \\cdot \\sum (r_B - \\bar{r}_B)^2}}", vars: [{ var: "\\rho", desc: "Correlation — always between −1 and +1" }, { var: "r_A, r_B", desc: "Daily returns of asset A and asset B" }, { var: "\\bar{r}_A, \\bar{r}_B", desc: "Average (mean) daily return of each asset" }] },
          { type: "heading", text: "Computing It in Python" },
          { type: "code", language: "python", code: `import pandas as pd
import yfinance as yf

# Download 2 years of data for several assets
data    = yf.download(["SPY", "QQQ", "GLD", "BTC-USD"], period="2y", auto_adjust=True)
prices  = data["Close"]
returns = prices.pct_change().dropna()

# Pairwise correlation matrix — one line
corr = returns.corr()
print(corr.round(2))

#         SPY   QQQ   GLD  BTC-USD
# SPY    1.00  0.92  0.12     0.21
# QQQ    0.92  1.00  0.08     0.25
# GLD    0.12  0.08  1.00     0.05
# BTC   0.21  0.25  0.05     1.00

# Single pair correlation
spy_btc_corr = returns["SPY"].corr(returns["BTC-USD"])
print(f"SPY vs BTC: {spy_btc_corr:.2f}")` },
          { type: "heading", text: "Why It Matters for Strategies" },
          { type: "text", text: "**Diversification** only works when assets are uncorrelated — or negatively correlated. If you build a 'diversified' portfolio of 10 stocks that all move together (correlation +0.8), a market crash hits all of them simultaneously. Real diversification means low-correlation assets." },
          { type: "text", text: "**The crash problem:** correlations that look stable in normal markets often spike to 0.9+ during crashes. In a crisis, almost everything falls together. This is when diversification offers the least protection — exactly when you need it most. Good risk management accounts for this." },
          { type: "insight", text: "**Correlation ≠ causation.** Ice cream sales and drowning deaths are correlated — not because ice cream causes drowning, but because both go up in summer. Always ask: is there a real mechanism connecting these two things, or is this just a coincidence in the data? In finance, spurious correlations (especially in small datasets) are extremely common and extremely dangerous." },
        ]
      },
    ]
  },
  // ─── MODULE 5: Building Strategies ──────────────────────────────────────────
  {
    id: "building-strategies",
    number: 5,
    title: "Building Strategies",
    description: "Design, code, and test real trading strategies — from moving averages to a full backtester.",
    color: "#f59e0b",
    free: false,
    lessons: [
      {
        id: "moving-averages",
        title: "Moving Averages — The Simplest Signal",
        duration: "9 min",
        free: false,
        content: [
          { type: "intro", text: "Moving averages are the oldest and most widely used signal in systematic trading. They're not magic — they simply smooth out noise so you can see the underlying trend. Understanding them deeply also reveals their key weakness: they always lag." },
          { type: "heading", text: "What a Moving Average Is" },
          { type: "text", text: "A 20-day moving average is just the average closing price over the last 20 trading days, recalculated every day as new data comes in. The 'moving' part means the window slides forward — always the most recent 20 days, not the same 20 days fixed in time." },
          { type: "text", text: "A **short moving average** (5–20 days) reacts quickly to price changes — good for catching turns early, but noisier. A **long moving average** (50–200 days) is smoother and more stable — better at identifying major trends, but slower to react." },
          { type: "code", language: "python", code: `import pandas as pd
import yfinance as yf

df     = yf.download("AAPL", period="2y", auto_adjust=True)
prices = df["Close"].squeeze()

# Rolling mean — pandas slides the window for us
ma20  = prices.rolling(20).mean()    # 20-day: short-term trend
ma50  = prices.rolling(50).mean()    # 50-day: medium-term trend
ma200 = prices.rolling(200).mean()   # 200-day: long-term trend

# The first 19 values of ma20 are NaN — not enough history yet
print(ma20.head(25))` },
          { type: "heading", text: "The Crossover Signal" },
          { type: "text", text: "The most common MA strategy: when the short-term average crosses **above** the long-term average, it signals an uptrend — buy. When it crosses **below**, it signals a downtrend — sell. This is called a 'golden cross' (bullish) and 'death cross' (bearish) in the press." },
          { type: "code", language: "python", code: `# Simple crossover signal: 1 = hold, 0 = cash
signal = (ma20 > ma50).astype(int)

# How many days were we in the market?
days_in = signal.sum()
total   = len(signal.dropna())
print(f"In market {days_in/total:.0%} of the time")

# Calculate strategy vs buy-and-hold returns
daily_ret     = prices.pct_change()
strategy_ret  = daily_ret * signal.shift(1)   # shift(1) = no look-ahead

# Cumulative performance
buyhold_equity  = (1 + daily_ret).cumprod()
strategy_equity = (1 + strategy_ret).cumprod()

print(f"Buy & hold:  {buyhold_equity.iloc[-1] - 1:.1%}")
print(f"MA strategy: {strategy_equity.iloc[-1] - 1:.1%}")` },
          { type: "heading", text: "Exponential Moving Average (EMA)" },
          { type: "text", text: "A simple moving average treats all 20 days equally. An **EMA** gives more weight to recent days — so it reacts faster when prices start moving. Most modern implementations use EMA rather than SMA for this reason." },
          { type: "code", language: "python", code: `# EMA with span = number of periods
ema20 = prices.ewm(span=20, adjust=False).mean()
ema50 = prices.ewm(span=50, adjust=False).mean()

# EMA crossover signal — same logic as SMA
ema_signal = (ema20 > ema50).astype(int)` },
          { type: "insight", text: "Moving averages always lag — they can only tell you where the price *was*, not where it's going. In trending markets they work well. In sideways, choppy markets they generate false signals constantly. This is why no serious strategy uses MAs alone — they're a starting point, not a complete edge." },
        ]
      },
      {
        id: "implement-rsi",
        title: "Implement RSI From Scratch",
        duration: "12 min",
        free: false,
        content: [
          { type: "intro", text: "Libraries give you RSI in one line. But building it yourself means you understand every edge case — and can adapt it when a library gives you a wrong answer." },
          { type: "heading", text: "Step 1: Separate Gains and Losses" },
          { type: "code", language: "python", code: `import pandas as pd
import numpy as np

def compute_rsi(prices, period=14):
    # Daily price changes
    delta = prices.diff()    # today minus yesterday, for every day

    # Separate: keep only gains (set losses to 0), and vice versa
    gains  = delta.clip(lower=0)    # negative days become 0
    losses = (-delta).clip(lower=0) # flip sign, positive days become 0

    # Smoothed average gain and loss (Wilder's method)
    avg_gain = gains.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = losses.ewm(alpha=1/period, min_periods=period, adjust=False).mean()

    # RS = ratio of average gain to average loss
    rs = avg_gain / avg_loss.replace(0, np.nan)   # avoid dividing by zero

    # RSI formula
    rsi = 100 - (100 / (1 + rs))
    return rsi` },
          { type: "heading", text: "Step 2: Turn RSI Into Buy/Sell Signals" },
          { type: "code", language: "python", code: `def rsi_signals(prices, oversold=30, overbought=70):
    rsi = compute_rsi(prices)

    in_position = False    # track whether we're currently holding
    positions = []         # build a list of 1s (holding) and 0s (cash)

    for i in range(len(rsi)):
        if pd.isna(rsi.iloc[i]):
            positions.append(0)    # not enough data yet
            continue

        if not in_position and rsi.iloc[i] < oversold:
            in_position = True     # RSI went below 30 — buy

        elif in_position and rsi.iloc[i] > overbought:
            in_position = False    # RSI went above 70 — sell

        positions.append(1 if in_position else 0)

    return pd.Series(positions, index=prices.index)` },
          { type: "insight", text: "The `.shift(1)` you'll see in the backtest step is crucial — it means 'use yesterday's signal to decide today's trade.' Without it, you'd be trading on information you couldn't have had yet. That's called look-ahead bias, and it makes backtests lie." },
        ]
      },
      {
        id: "full-backtest",
        title: "Build a Complete Backtester",
        duration: "14 min",
        free: false,
        content: [
          { type: "intro", text: "A backtester combines prices, signals, and performance metrics into one clean pipeline. This is the structure every professional quant framework is built on." },
          { type: "code", language: "python", code: `import pandas as pd
import numpy as np
import yfinance as yf

def backtest(ticker, strategy_fn, period="3y"):
    # 1. Get data
    df = yf.download(ticker, period=period, auto_adjust=True)
    prices = df["Close"].squeeze()

    # 2. Generate signals using the strategy function
    signals = strategy_fn(prices)    # 1 = hold, 0 = cash

    # 3. Calculate daily returns
    market_ret   = prices.pct_change()
    strategy_ret = market_ret * signals.shift(1)   # shift(1) = no look-ahead

    # 4. Build equity curves (how $1 grows over time)
    market_equity   = (1 + market_ret).cumprod()
    strategy_equity = (1 + strategy_ret).cumprod()

    # 5. Calculate metrics
    n = len(strategy_ret.dropna())
    total_growth = strategy_equity.iloc[-1]
    ann_return   = total_growth ** (252 / n) - 1     # geometric

    excess = strategy_ret - 0.04 / 252               # vs 4% risk-free
    sharpe = excess.mean() / excess.std() * np.sqrt(252)

    peak = strategy_equity.cummax()
    max_dd = ((strategy_equity - peak) / peak).min()

    return {
        "total_return":  f"{total_growth - 1:.1%}",
        "ann_return":    f"{ann_return:.1%}",
        "sharpe":        f"{sharpe:.2f}",
        "max_drawdown":  f"{max_dd:.1%}",
    }

# Run it
results = backtest("AAPL", rsi_signals)
for k, v in results.items():
    print(f"{k}: {v}")` },
          { type: "insight", text: "This is essentially the code running inside QuantWorld. The real version adds more metrics, handles cash interest, and uses walk-forward validation for ML strategies — but the structure is identical." },
        ]
      },
      {
        id: "reading-results",
        title: "Reading Your Backtest Results",
        duration: "8 min",
        free: false,
        content: [
          { type: "intro", text: "Running a backtest is the easy part. Knowing what the numbers actually mean — and which ones to trust — is where most beginners go wrong. A high total return is meaningless without context. This lesson gives you the framework to read results honestly." },
          { type: "heading", text: "Total Return vs Annualised Return" },
          { type: "text", text: "Total return is how much the strategy made over the whole test period. Annualised return converts that into a 'per year' rate so you can compare strategies tested over different time periods. A 50% total return over 2 years is roughly 22.5% annualised — much better than 50% over 10 years (~4% annualised)." },
          { type: "code", language: "python", code: `# Total return — what $1 grew to, minus 1
total_return = equity.iloc[-1] - 1

# Annualised return — geometric, not arithmetic
n_days  = len(equity)
ann_ret = equity.iloc[-1] ** (252 / n_days) - 1

print(f"Total: {total_return:.1%}")
print(f"Annualised: {ann_ret:.1%}")` },
          { type: "heading", text: "Sharpe Ratio — Return Per Unit of Risk" },
          { type: "text", text: "A strategy that makes 20% but swings wildly is worse than one that makes 15% smoothly. The Sharpe ratio measures return relative to risk — specifically, how much excess return (above the risk-free rate) you earn per unit of volatility. Higher is better. Anything above 1.0 is decent, above 1.5 is strong, above 2.0 is exceptional." },
          { type: "code", language: "python", code: `risk_free = 0.04 / 252       # daily 4% risk-free rate
excess_returns = daily_ret - risk_free

sharpe = (excess_returns.mean() / excess_returns.std()) * (252 ** 0.5)
print(f"Sharpe: {sharpe:.2f}")

# Rule of thumb:
# < 0.5  — poor, likely not worth trading
# 0.5–1.0 — marginal, check if it beats buy-and-hold after costs
# 1.0–1.5 — decent
# 1.5+   — strong (and worth being suspicious of — recheck for look-ahead bias)` },
          { type: "heading", text: "Maximum Drawdown — The Gut-Check Metric" },
          { type: "text", text: "Maximum drawdown is the largest peak-to-trough fall in the strategy's equity curve. A strategy that dropped 60% at some point in history will almost certainly cause you to abandon it in real trading — even if it eventually recovered. Drawdown tells you the most you'd have lost if you had the worst timing." },
          { type: "code", language: "python", code: `peak   = equity.cummax()                    # running peak
drawdown = (equity - peak) / peak           # current drawdown at each point
max_dd   = drawdown.min()                   # worst single drawdown

print(f"Max drawdown: {max_dd:.1%}")

# Also useful: how long did it take to recover from the worst drawdown?
dd_start  = (equity == peak).idxmax()      # where the peak was
underwater = drawdown[drawdown < -0.20]    # days more than 20% underwater
print(f"Days >20% underwater: {len(underwater)}")` },
          { type: "insight", text: "A backtest that shows 40% annualised returns with a Sharpe of 3.0 is almost certainly overfitted — either look-ahead bias, too few trades, or parameters optimised on the same data they're tested on. Real edges are more modest. A Sharpe of 1.2 and 15% annualised return, consistent across multiple tickers and time periods, is genuinely exciting." },
        ]
      },
    ]
  },

  // ─── MODULE 6: Machine Learning in Trading ───────────────────────────────────
  {
    id: "ml-in-practice",
    number: 6,
    title: "Machine Learning in Trading",
    description: "Build ML strategies the honest way — with genuine out-of-sample results.",
    color: "#ec4899",
    free: false,
    lessons: [
      {
        id: "feature-engineering",
        title: "Feature Engineering for Trading Models",
        duration: "13 min",
        free: false,
        content: [
          { type: "intro", text: "A model is only as good as its features. Raw prices are nearly useless as model inputs — but the right transformations reveal patterns that predict future returns. This is where most real alpha in ML trading comes from." },
          { type: "heading", text: "Why Raw Prices Don't Work" },
          { type: "text", text: "A stock price of $150 is meaningless to a model. Is that high or low for this stock? Was it $50 a year ago or $300? The model has no context. But RSI between 0 and 100, or how far the price has strayed from its 20-day average — those are normalised, comparable numbers the model can actually learn from." },
          { type: "code", language: "python", code: `import pandas as pd
import numpy as np

def build_features(prices, volumes):
    f = pd.DataFrame(index=prices.index)

    # Momentum: how much has price moved recently?
    f["ret_1d"]  = prices.pct_change(1)     # yesterday to today
    f["ret_5d"]  = prices.pct_change(5)     # last week
    f["ret_10d"] = prices.pct_change(10)    # last 2 weeks

    # RSI: are we overbought or oversold?
    delta = prices.diff()
    gain  = delta.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
    loss  = (-delta).clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
    f["rsi"] = 100 - (100 / (1 + gain / loss))

    # Where is price relative to its moving averages?
    f["vs_ma20"] = prices / prices.rolling(20).mean() - 1   # 0 = at average
    f["vs_ma50"] = prices / prices.rolling(50).mean() - 1

    # Is volume higher or lower than usual?
    f["vol_ratio"] = volumes / volumes.rolling(20).mean()

    return f.dropna()    # remove rows where we don't have enough history` },
          { type: "insight", text: "Notice that every feature is a ratio or a bounded number — not a raw price. This is what makes the model's patterns generalise across different stocks and different time periods." },
        ]
      },
      {
        id: "walk-forward",
        title: "Walk-Forward Validation — Honest ML Backtests",
        duration: "14 min",
        free: false,
        content: [
          { type: "intro", text: "The most common ML backtesting mistake: train the model on historical data, then measure its performance on that same data. It looks incredible. It's completely dishonest. Walk-forward validation is the fix." },
          { type: "heading", text: "The Problem With a Simple Split" },
          { type: "text", text: "Imagine splitting your 5 years of data into 80% training and 20% test. That's better than nothing — but the model still saw 4 years of data all at once, in a mixed order. It learned patterns that only existed in those specific 4 years. In reality, you'd have started with less data, learned as new data came in, and made predictions month by month." },
          { type: "code", language: "python", code: `from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import numpy as np

def walk_forward(X, y, retrain_every=21):
    """
    The honest approach:
    - Start with the first 6 months of data
    - Predict the next month (data we haven't seen yet)
    - Add that month to training data, retrain, repeat
    """
    n = len(X)
    initial_train = max(126, n // 3)    # start with ~6 months minimum
    predictions = np.full(n, 0.5)       # default: no signal

    for train_end in range(initial_train, n, retrain_every):
        pred_end = min(train_end + retrain_every, n)

        # IMPORTANT: scale using only past data
        # If you use future data to scale, you're cheating
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X[:train_end])
        X_pred  = scaler.transform(X[train_end:pred_end])

        # Train on everything seen so far
        model = LogisticRegression(max_iter=500)
        model.fit(X_train, y[:train_end])

        # Predict only the unseen window
        predictions[train_end:pred_end] = model.predict_proba(X_pred)[:, 1]

    return predictions` },
          { type: "insight", text: "This is exactly how QuantWorld's ML strategies work. Every prediction you see was made on data the model had genuinely never seen — which is why the numbers are realistic rather than inflated. Honest backtesting is the foundation of real alpha." },
        ]
      },
    ]
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

// Group heading + following text blocks into one "section" slide.
// All other block types become their own slides.
function buildSlides(content) {
  const slides = [];
  let i = 0;
  while (i < content.length) {
    const b = content[i];
    if (b.type === "heading") {
      const texts = [];
      let j = i + 1;
      while (j < content.length && content[j].type === "text") {
        texts.push(content[j]);
        j++;
      }
      slides.push({ type: "section", heading: b.text, texts });
      i = j;
    } else {
      slides.push(b);
      i++;
    }
  }
  return slides;
}

function renderLessonText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: "#e2e8f0", fontWeight: 700 }}>{part}</strong> : part
  );
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlighting
  const highlight = (code, lang) => {
    if (lang === "python" || lang === "cpp") {
      const keywords = lang === "python"
        ? ["import", "from", "def", "return", "for", "in", "if", "elif", "else", "not", "and", "or", "True", "False", "None", "class", "print", "range", "len", "float", "int", "str", "list", "dict"]
        : ["#include", "int", "double", "void", "return", "for", "if", "else", "const", "auto", "size_t", "std", "cout", "endl", "include", "main"];

      const lines = code.split("\n");
      return lines.map((line, li) => {
        const parts = [];
        let remaining = line;
        let key = 0;

        // Comments
        const commentIdx = lang === "python" ? remaining.indexOf("#") : remaining.indexOf("//");
        if (commentIdx !== -1) {
          const before = remaining.slice(0, commentIdx);
          const comment = remaining.slice(commentIdx);
          remaining = before;
          parts.push(<span key={key++} style={{ color: "#7090a8", fontStyle: "italic" }}>{comment}</span>);
        }

        // Strings
        const strMatch = remaining.match(/(["'`])(.*?)\1/);
        if (strMatch) {
          const si = remaining.indexOf(strMatch[0]);
          parts.unshift(<span key={key++} style={{ color: "#f59e0b" }}>{strMatch[0]}</span>);
          const afterStr = remaining.slice(si + strMatch[0].length);
          remaining = remaining.slice(0, si);
          if (afterStr) parts.push(<span key={key++}>{afterStr}</span>);
        }

        // Keywords and numbers in remaining text
        const tokens = remaining.split(/(\s+|\b)/);
        const processedTokens = tokens.map((token, ti) => {
          if (keywords.includes(token)) return <span key={ti} style={{ color: "#0ea5e9", fontWeight: 600 }}>{token}</span>;
          if (/^-?\d+\.?\d*$/.test(token)) return <span key={ti} style={{ color: "#a855f7" }}>{token}</span>;
          return token;
        });

        return (
          <div key={li} style={{ minHeight: "1.5em" }}>
            {processedTokens}
            {parts}
          </div>
        );
      });
    }
    return <pre>{code}</pre>;
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e293b", marginBottom: 4 }}>
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{language}</span>
        <button onClick={handleCopy} style={{ background: "transparent", border: "none", color: copied ? "#22c55e" : "#475569", fontSize: 12, cursor: "pointer", padding: "2px 8px", borderRadius: 6, transition: "color 0.2s" }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div style={{ background: "#0a0f1a", padding: "20px 20px", overflowX: "auto" }}>
        <code style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: 13, lineHeight: 1.7, color: "#e2e8f0", display: "block", whiteSpace: "pre" }}>
          {highlight(code, language)}
        </code>
      </div>
    </div>
  );
}

// ─── ANIMATIONS ─────────────────────────────────────────────────────────────

const COURSE_CSS = `
  @keyframes qw-up    { from { opacity:0; transform:translateY(26px) } to { opacity:1; transform:translateY(0) } }
  @keyframes qw-in    { from { opacity:0; transform:scale(0.78) }      to { opacity:1; transform:scale(1) }      }
  @keyframes qw-left  { from { opacity:0; transform:translateX(-26px) } to { opacity:1; transform:translateX(0) } }
  @keyframes qw-right { from { opacity:0; transform:translateX(26px) }  to { opacity:1; transform:translateX(0) } }
  @keyframes qw-coin  { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(1080deg)} }
  @keyframes qw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes qw-pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.08)} }
  .qw-up    { animation: qw-up    0.5s  cubic-bezier(.22,1,.36,1) both }
  .qw-in    { animation: qw-in    0.45s cubic-bezier(.34,1.56,.64,1) both }
  .qw-left  { animation: qw-left  0.45s cubic-bezier(.22,1,.36,1) both }
  .qw-right { animation: qw-right 0.45s cubic-bezier(.22,1,.36,1) both }
  .qw-float { animation: qw-float 3s ease-in-out infinite }
  .qw-pulse { animation: qw-pulse 2.5s ease-in-out infinite }
`;
function CourseStyles() { return <style>{COURSE_CSS}</style>; }

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function seedRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}


// ─── CINEMATIC SLIDE ─────────────────────────────────────────────────────────

function CinematicSlide({ slide, color }) {
  const [shown, setShown] = useState(0);
  const lines = slide.lines || [];
  useEffect(() => {
    setShown(0);
    const timers = [];
    let cum = 500;
    lines.forEach((line, i) => {
      timers.push(setTimeout(() => setShown(s => Math.max(s, i + 1)), cum));
      cum += (line.pause || 900);
    });
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide]);
  const waiting = shown < lines.length;
  return (
    <div style={{ padding: "70px 0 50px", display: "flex", flexDirection: "column", gap: 20, minHeight: 380 }}>
      {lines.map((line, i) => (
        <div key={i} style={{
          opacity: i < shown ? 1 : 0,
          transform: `translateY(${i < shown ? 0 : 22}px)`,
          transition: "opacity 0.75s ease, transform 0.75s cubic-bezier(.22,1,.36,1)",
          fontSize: line.size || 20,
          fontWeight: line.weight || 400,
          color: line.accent ? color : (line.dim ? "#3a6070" : "#d0e8f4"),
          lineHeight: 1.25,
          letterSpacing: (line.size || 20) > 44 ? -2 : 0,
          textShadow: line.accent ? `0 0 80px ${color}55` : "none",
        }}>
          {line.text}
        </div>
      ))}
      {waiting && (
        <div style={{ marginTop: 8, display: "flex", gap: 7, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%", background: color,
              opacity: 0.3 + i * 0.2,
              animation: `qw-pulse ${0.8 + i * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TRADER VS QUANT ANIMATED CHART ──────────────────────────────────────────

function TraderVsQuantViz({ color }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t0 = performance.now(); let raf;
    const tick = now => { const p = Math.min((now - t0) / 2800, 1); setProg(p); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const W = 300, H = 150;
  const xs = x => (x / 100) * W;

  // Emotional: panic sells at wrong time, FOMO buys at tops, revenge trades
  const emo = [[0,50],[10,62],[18,58],[25,74],[31,60],[34,42],[40,36],
               [46,50],[52,45],[58,62],[63,54],[68,44],[74,34],[80,28],[88,32],[100,22]];
  // Quant: steady, small drawdowns, systematic
  const qnt = [[0,50],[10,56],[20,64],[28,60],[34,62],[42,72],[52,80],
               [58,74],[65,84],[74,94],[80,88],[90,100],[100,110]];

  const minE = Math.min(...emo.map(p=>p[1])), maxE = Math.max(...emo.map(p=>p[1]));
  const minQ = Math.min(...qnt.map(p=>p[1])), maxQ = Math.max(...qnt.map(p=>p[1]));
  const yE = y => H - 10 - ((y-minE)/(maxE-minE))*(H-24);
  const yQ = y => H - 10 - ((y-minQ)/(maxQ-minQ))*(H-24);

  const pathOf = (pts, yFn) => pts.map(([x,y],i)=>`${i===0?"M":"L"}${xs(x).toFixed(1)},${yFn(y).toFixed(1)}`).join(" ");
  const ELEN=1100, QLEN=1100;

  const emoLabels = [
    { pct: 0.35, x: 34, y: 42, txt: "😱 Panic sell!", dy: -13 },
    { pct: 0.60, x: 58, y: 62, txt: "🤑 FOMO buy", dy: -13 },
    { pct: 0.75, x: 74, y: 34, txt: "😤 Revenge trade", dy: 16 },
  ];
  const qntLabels = [
    { pct: 0.42, x: 42, y: 72, txt: "✓ Signal: Buy", dy: -13 },
    { pct: 0.65, x: 65, y: 84, txt: "✓ Stop hit: Exit", dy: -13 },
    { pct: 0.90, x: 90, y: 100, txt: "✓ Re-entry", dy: -13 },
  ];

  const Panel = ({ pts, stroke, pathStr, pathLen, yFn, title, labels, endLabel }) => (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:11, fontWeight:900, color:stroke, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, textAlign:"center" }}>{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
        <line x1={0} y1={yFn(pts[0][1])} x2={W} y2={yFn(pts[0][1])} stroke="#1e3048" strokeWidth={1} strokeDasharray="3 3"/>
        <path d={pathStr} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={pathLen} strokeDashoffset={pathLen*(1-prog)}/>
        {labels.filter(l=>prog>l.pct).map((l,i)=>(
          <text key={i} x={xs(l.x)} y={yFn(l.y)+l.dy} fill={stroke+"cc"} fontSize={8.5} fontWeight={700} textAnchor="middle" className="qw-in">{l.txt}</text>
        ))}
        {prog>0.96&&(
          <text x={W-4} y={yFn(pts[pts.length-1][1])-7} fill={stroke} fontSize={13} fontWeight={900} textAnchor="end" className="qw-in">{endLabel}</text>
        )}
      </svg>
    </div>
  );

  return (
    <div style={{ padding:"8px 0 4px" }}>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <Panel pts={emo} stroke="#ef4444" pathStr={pathOf(emo,yE)} pathLen={ELEN} yFn={yE}
          title="🧠 Gut Feeling Trader" labels={emoLabels} endLabel="−56%" />
        <Panel pts={qnt} stroke={color} pathStr={pathOf(qnt,yQ)} pathLen={QLEN} yFn={yQ}
          title="⚙️ Systematic Algorithm" labels={qntLabels} endLabel="+120%" />
      </div>
      <p style={{ fontSize:12, color:"#3a6070", textAlign:"center", margin:"10px 0 0", fontStyle:"italic" }}>
        Same market. Same starting capital. Same time period.
      </p>
    </div>
  );
}

// ─── RETURN COUNTER VIZ ───────────────────────────────────────────────────────

function ReturnCounterViz({ color }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t0 = performance.now(); let raf;
    const tick = now => { const p = Math.min((now-t0)/2600,1); setPct(p); if(p<1) raf=requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ease = p => 1 - Math.pow(1-p, 3);
  const ep = ease(pct);

  // $10,000 compounding at 66%/yr for 30 years = 10000 * 1.66^30 ≈ 27,000,000
  const medallion = Math.round(10000 * Math.pow(1.66, ep*30));
  const sp500 = Math.round(10000 * Math.pow(1.10, ep*30));
  const buffett = Math.round(10000 * Math.pow(1.20, ep*30));

  const fmt = n => n >= 1000000
    ? `$${(n/1000000).toFixed(1)}M`
    : n >= 1000 ? `$${Math.round(n/1000)}K` : `$${n}`;

  const bars = [
    { label: "Medallion Fund", rate: "66%/yr", val: medallion, max: 27000000, color },
    { label: "Warren Buffett", rate: "20%/yr", val: buffett, max: 27000000, color: "#f59e0b" },
    { label: "S&P 500", rate: "10%/yr", val: sp500, max: 27000000, color: "#64748b" },
  ];

  return (
    <div style={{ padding:"16px 0 8px", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ fontSize:13, color:"#4a7090", textAlign:"center" }}>
        $10,000 invested in 1988 · compounding over {Math.round(ep*30)} years
      </div>
      {bars.map((b,i) => (
        <div key={i}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#c8dce8" }}>{b.label} <span style={{ color:b.color, fontSize:12 }}>{b.rate}</span></span>
            <span style={{ fontSize:22, fontWeight:900, color:b.color, letterSpacing:-1, textShadow:`0 0 30px ${b.color}50` }}>{fmt(b.val)}</span>
          </div>
          <div style={{ height:12, background:"#0a1628", borderRadius:6, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:6,
              background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`,
              width:`${(b.val/b.max)*100}%`,
              boxShadow:`0 0 12px ${b.color}60`,
              transition:"width 0.04s",
            }}/>
          </div>
        </div>
      ))}
      {ep > 0.95 && (
        <div className="qw-up" style={{ background:`${color}12`, border:`1.5px solid ${color}30`, borderRadius:14, padding:"16px 20px", textAlign:"center" }}>
          <span style={{ fontSize:15, color:"#c8dce8", fontWeight:600 }}>
            The S&P 500 turned $10K into <strong style={{color:"#64748b"}}>$175K</strong>.{" "}
            The Medallion Fund turned $10K into <strong style={{color}}>$27 million</strong>.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── VISUAL: Animated equity curve ──────────────────────────────────────────

function EquityCurveViz({ color }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t0 = performance.now(); let raf;
    const tick = (now) => { const p = Math.min((now-t0)/2200,1); setProg(p); if(p<1) raf=requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const N=80, rng=seedRng(7);
  let m=1, r=1; const mD=[1], rD=[1];
  for(let i=1;i<=N;i++){ m*=1+(0.10+(rng()-0.5)*0.22)/4; r*=1+(0.66+(rng()-0.5)*0.35)/4; mD.push(m); rD.push(r); }

  const W=580,H=200,pL=4,pR=96,pT=10,pB=28,iW=W-pL-pR,iH=H-pT-pB;
  const maxLog=Math.log(rD[N]);
  const px=i=>pL+(i/N)*iW;
  const py=v=>pT+iH-(Math.log(Math.max(v,0.01))/maxLog)*iH;
  const pathOf=data=>data.map((v,i)=>`${i===0?"M":"L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const mPath=pathOf(mD), rPath=pathOf(rD), MLEN=1800, RLEN=4000;

  return (
    <div style={{padding:"8px 0 0"}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
        <defs>
          <linearGradient id="renGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0.25,0.5,0.75].map(t=>(
          <line key={t} x1={pL} y1={pT+iH*(1-t)} x2={W-pR+4} y2={pT+iH*(1-t)} stroke="#253a52" strokeWidth={1} strokeDasharray="4 4"/>
        ))}
        <path d={mPath} fill="none" stroke="#3d6070" strokeWidth={2}
          strokeDasharray={MLEN} strokeDashoffset={MLEN*(1-prog)} style={{transition:"stroke-dashoffset 0.04s"}}/>
        <path d={rPath} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={RLEN} strokeDashoffset={RLEN*(1-prog)} style={{transition:"stroke-dashoffset 0.04s"}}/>
        {prog>0.88&&<>
          <circle cx={px(N)} cy={py(rD[N])} r={5} fill={color} className="qw-in"/>
          <text x={px(N)+10} y={py(rD[N])+4} fill={color} fontSize={12} fontWeight={800}>{`$${Math.round(rD[N])}  Medallion`}</text>
          <circle cx={px(N)} cy={py(mD[N])} r={4} fill="#3d6070"/>
          <text x={px(N)+10} y={py(mD[N])+4} fill="#6b8fa8" fontSize={11}>{`$${mD[N].toFixed(1)}  S&P 500`}</text>
        </>}
        <text x={pL} y={H-6} fill="#4a7090" fontSize={10}>1988</text>
        <text x={pL+iW/2} y={H-6} fill="#2d3f52" fontSize={10} textAnchor="middle">2003</text>
        <text x={pL+iW} y={H-6} fill="#2d3f52" fontSize={10} textAnchor="end">2018</text>
      </svg>
      <p style={{fontSize:11,color:"#6b8fa8",textAlign:"center",margin:"4px 0 0",fontStyle:"italic"}}>
        Starting value: $1 &nbsp;·&nbsp; Log scale &nbsp;·&nbsp; 30 years
      </p>
    </div>
  );
}

// ─── INTERACTIVE: Coin flip ──────────────────────────────────────────────────

function CoinFlipBlock({ color }) {
  const [flips,setFlips]=useState([]);
  const [spinning,setSpinning]=useState(false);
  const [face,setFace]=useState(null);
  const iRef=useRef(null);

  const run=(n)=>{
    if(spinning)return;
    setFlips([]); setSpinning(true);
    let res=[];
    const delay=n<=20?80:n<=100?30:n<=500?12:5;
    iRef.current=setInterval(()=>{
      const win=Math.random()<0.52;
      res=[...res,win]; setFace(win); setFlips([...res]);
      if(res.length>=n){clearInterval(iRef.current);setSpinning(false);}
    },delay);
  };
  useEffect(()=>()=>clearInterval(iRef.current),[]);

  const wins=flips.filter(Boolean).length, total=flips.length;
  const profit=wins-(total-wins), pct=total>0?(wins/total*100):52;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,padding:"4px 0"}}>
      <div style={{
        width:130,height:130,borderRadius:"50%",
        background:`radial-gradient(circle at 38% 35%, ${color}ff, ${color}88)`,
        border:`5px solid ${color}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:58,fontWeight:900,color:"#fff",userSelect:"none",
        boxShadow:`0 0 0 10px ${color}15, 0 12px 40px ${color}40, 0 4px 20px rgba(0,0,0,0.6)`,
        animation:spinning?"qw-coin 0.38s linear infinite":"none",
      }}>
        {face===null?"?":face?"H":"T"}
      </div>

      <div style={{width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:15,color:"#22c55e",fontWeight:800}}>✓ {wins}</span>
          <span style={{fontSize:28,fontWeight:900,color,letterSpacing:-1}}>{pct.toFixed(1)}%</span>
          <span style={{fontSize:15,color:"#ef4444",fontWeight:800}}>{total-wins} ✗</span>
        </div>
        <div style={{height:14,background:"#0a1220",borderRadius:8,overflow:"hidden",border:"1px solid #1a2535"}}>
          <div style={{display:"flex",height:"100%"}}>
            <div style={{width:`${pct}%`,background:"linear-gradient(90deg,#22c55e,#16a34a)",transition:"width 0.08s",borderRadius:"8px 0 0 8px"}}/>
            <div style={{flex:1,background:"linear-gradient(90deg,#ef4444,#dc2626)",borderRadius:"0 8px 8px 0"}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
          <span style={{fontSize:11,color:"#4a8f60"}}>wins</span>
          <span style={{fontSize:11,color:"#7090a8"}}>{total} flips · true edge 52%</span>
          <span style={{fontSize:11,color:"#8f4a4a"}}>losses</span>
        </div>
      </div>

      <div style={{display:"flex",gap:10,width:"100%"}}>
        {[10,100,1000].map(n=>(
          <button key={n} onClick={()=>run(n)} disabled={spinning} style={{
            flex:1,padding:"13px 0",
            background:spinning?"#0a1220":`linear-gradient(135deg,${color}28,${color}12)`,
            border:`1.5px solid ${spinning?"#1a2535":color+"55"}`,
            borderRadius:12,color:spinning?"#2d4057":color,
            fontSize:15,fontWeight:800,cursor:spinning?"default":"pointer",letterSpacing:0.5,
          }}>
            {spinning?"…":`${n}×`}
          </button>
        ))}
      </div>

      {total>0&&(
        <div className="qw-up" style={{
          width:"100%",textAlign:"center",padding:"16px 12px",
          background:profit>=0?"#0a1e10":"#1e0a0a",
          border:`1.5px solid ${profit>=0?"#22c55e44":"#ef444444"}`,borderRadius:14,
        }}>
          <span style={{fontSize:30,fontWeight:900,color:profit>=0?"#22c55e":"#ef4444"}}>
            {profit>=0?"+":""}{profit} units
          </span>
          <span style={{fontSize:13,color:"#7090a8",display:"block",marginTop:4}}>
            from {total} flips with a 2% edge
          </span>
        </div>
      )}
    </div>
  );
}

// ─── INTERACTIVE: Edge calculator ───────────────────────────────────────────

function EdgeCalcBlock({ color }) {
  const [wr,setWr]=useState(55);
  const [rr,setRr]=useState(1.5);
  const ev=(wr/100)*rr-((100-wr)/100);
  const isPos=ev>0;
  const per1k=(ev*1000).toFixed(0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      {[{label:"Win Rate",val:wr,set:setWr,min:10,max:90,step:1,fmt:v=>`${v}%`},
        {label:"Win ÷ Loss size",val:rr,set:setRr,min:0.2,max:5,step:0.1,fmt:v=>`${v.toFixed(1)}×`}
      ].map(({label,val,set,min,max,step,fmt})=>(
        <div key={label}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:14,color:"#8fafc4",fontWeight:600}}>{label}</span>
            <span style={{fontSize:26,fontWeight:900,color,letterSpacing:-0.5}}>{fmt(val)}</span>
          </div>
          <div style={{position:"relative",height:14}}>
            <div style={{position:"absolute",inset:"4px 0",background:"#0c1830",borderRadius:6,border:"1px solid #1a2535"}}/>
            <div style={{position:"absolute",top:4,left:0,borderRadius:6,height:6,
              width:`${(val-min)/(max-min)*100}%`,
              background:`linear-gradient(90deg,${color},${color}80)`,pointerEvents:"none"}}/>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e=>set(+e.target.value)}
              style={{position:"absolute",inset:0,width:"100%",opacity:0,cursor:"pointer",height:14}}/>
          </div>
        </div>
      ))}

      <div style={{
        background:isPos?"#071a0f":"#1a0707",
        border:`2px solid ${isPos?"#22c55e55":"#ef444455"}`,
        borderRadius:18,padding:"28px 20px",textAlign:"center",position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,
          background:isPos?"linear-gradient(90deg,#22c55e,#16a34a)":"linear-gradient(90deg,#ef4444,#dc2626)"}}/>
        <div style={{fontSize:11,color:"#6b8fa8",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>
          Expected value per $1 bet
        </div>
        <div style={{fontSize:62,fontWeight:900,color:isPos?"#22c55e":"#ef4444",letterSpacing:-3,lineHeight:1}}>
          {ev>=0?"+":""}{(ev*100).toFixed(1)}¢
        </div>
        <div style={{fontSize:14,color:"#8fafc4",marginTop:12}}>
          {isPos?<><strong style={{color:"#22c55e"}}>+${per1k}</strong> profit over 1,000 trades</>
               :<span style={{color:"#ef4444"}}>losing strategy</span>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[{l:"High win %",wr:72,rr:0.7},{l:"High reward",wr:38,rr:3.2},{l:"Balanced",wr:55,rr:1.5}].map(p=>(
          <button key={p.l} onClick={()=>{setWr(p.wr);setRr(p.rr);}} style={{
            padding:"9px 6px",background:"#070e18",border:"1px solid #141f2e",borderRadius:10,
            color:"#7090a8",fontSize:11,cursor:"pointer",lineHeight:1.5,transition:"all 0.15s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"60";e.currentTarget.style.color="#94a3b8";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#141f2e";e.currentTarget.style.color="#334155";}}>
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );
}


// ─── INTERACTIVE: Code Walkthrough ──────────────────────────────────────────

function CodeWalkthrough({ slide, color }) {
  const [step, setStep] = useState(0);
  const steps = slide.steps || [];
  const cur = steps[step] || steps[0];
  const lines = slide.code.split("\n");

  const highlight = (line, i) => {
    const active = cur.lines && cur.lines.includes(i);
    // basic python coloring
    const KEYWORDS = ["import","from","def","return","for","in","if","elif","else","not","and","or","True","False","None","class","print","range","len","float","int","str","list","dict"];
    let parts = [];
    let rest = line;
    const commentIdx = rest.indexOf("#");
    let commentPart = null;
    if (commentIdx !== -1) {
      commentPart = rest.slice(commentIdx);
      rest = rest.slice(0, commentIdx);
    }
    const tokens = rest.split(/(\b|\s+)/);
    tokens.forEach((tok, ti) => {
      if (KEYWORDS.includes(tok)) parts.push(<span key={ti} style={{color: active ? "#60c8f0" : "#3a6070", fontWeight:600}}>{tok}</span>);
      else if (/^-?\d+\.?\d*$/.test(tok)) parts.push(<span key={ti} style={{color: active ? "#c084fc" : "#4a3a60"}}>{tok}</span>);
      else if (/^["'`].*["'`]$/.test(tok)) parts.push(<span key={ti} style={{color: active ? "#fbbf24" : "#5a4a20"}}>{tok}</span>);
      else parts.push(<span key={ti} style={{color: active ? "#e2e8f0" : "#2a3f52"}}>{tok}</span>);
    });
    if (commentPart) parts.push(<span key="cmt" style={{color: active ? "#6b8fa8" : "#1e3040", fontStyle:"italic"}}>{commentPart}</span>);
    return parts;
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,padding:"8px 0"}}>
      {/* Title */}
      {slide.title && <h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:0,letterSpacing:-0.5}}>{slide.title}</h3>}

      {/* Step indicator */}
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {steps.map((_,i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            width: i===step ? 28 : 8, height:8, borderRadius:4,
            background: i<step ? color+"90" : i===step ? color : "#1e3048",
            cursor:"pointer", transition:"all 0.2s"
          }}/>
        ))}
        <span style={{fontSize:12,color:"#4a7090",marginLeft:8}}>Step {step+1} of {steps.length}</span>
      </div>

      {/* Code panel */}
      <div style={{borderRadius:14,overflow:"hidden",border:"1.5px solid #1e3048"}}>
        <div style={{background:"#0a1628",borderBottom:"1px solid #1e3048",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"#4a7090",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>python</span>
          {cur.output && <span style={{fontSize:11,color:color,fontWeight:700,background:color+"15",border:`1px solid ${color}30`,borderRadius:6,padding:"2px 10px"}}>→ {cur.output}</span>}
        </div>
        <div style={{background:"#060e1c",padding:"18px 20px",overflowX:"auto"}}>
          <code style={{fontFamily:"'Fira Code','Cascadia Code',Consolas,monospace",fontSize:13,lineHeight:2,display:"block",whiteSpace:"pre"}}>
            {lines.map((line, i) => {
              const active = cur.lines && cur.lines.includes(i);
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:12,
                  background: active ? color+"18" : "transparent",
                  borderLeft: active ? `3px solid ${color}` : "3px solid transparent",
                  paddingLeft: active ? 10 : 10,
                  borderRadius: active ? "0 6px 6px 0" : 0,
                  marginBottom:1, transition:"all 0.3s",
                }}>
                  <span style={{fontSize:10,color: active ? color+"90" : "#1e3048",minWidth:20,userSelect:"none",textAlign:"right"}}>{i+1}</span>
                  <span style={{flex:1}}>{highlight(line, i)}</span>
                </div>
              );
            })}
          </code>
        </div>
      </div>

      {/* Explanation panel */}
      <div className="qw-up" key={step} style={{
        background:`linear-gradient(135deg, ${color}18, ${color}08)`,
        border:`2px solid ${color}35`, borderRadius:18,
        padding:"22px 24px", display:"flex", gap:16, alignItems:"flex-start",
      }}>
        <div style={{width:40,height:40,borderRadius:12,background:color+"30",border:`2px solid ${color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
          {cur.icon || "→"}
        </div>
        <div>
          {cur.title && <div style={{fontSize:17,fontWeight:800,color:"#fff",marginBottom:8}}>{cur.title}</div>}
          <p style={{fontSize:15,color:"#c8dce8",margin:0,lineHeight:1.8}}>{cur.explain}</p>
          {cur.output && (
            <div style={{marginTop:14,padding:"10px 16px",background:"#060e1c",border:`1px solid ${color}30`,borderRadius:10,fontFamily:"monospace",fontSize:14,color:color}}>
              Output: <strong>{cur.output}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
        <button onClick={() => setStep(s => Math.max(0,s-1))} disabled={step===0} style={{
          padding:"10px 22px", background:"transparent", border:`1.5px solid ${step===0?"#1e3048":color+"50"}`,
          borderRadius:10, color: step===0 ? "#2a3f52" : color,
          fontSize:14, fontWeight:700, cursor: step===0 ? "default" : "pointer", transition:"all 0.2s",
        }}>← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length-1,s+1))} disabled={step===steps.length-1} style={{
          padding:"10px 22px", background: step===steps.length-1 ? "transparent" : color,
          border:`1.5px solid ${step===steps.length-1?"#1e3048":color}`,
          borderRadius:10, color: step===steps.length-1 ? "#2a3f52" : "#fff",
          fontSize:14, fontWeight:700, cursor: step===steps.length-1 ? "default" : "pointer", transition:"all 0.2s",
        }}>Next →</button>
      </div>
    </div>
  );
}


// ─── EDGE TYPES VISUALIZER ───────────────────────────────────────────────────

function EdgeTypesViz({ color }) {
  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    setProg(0);
    const t0 = performance.now(); let raf;
    const tick = now => { const p = Math.min((now-t0)/2000,1); setProg(p); if(p<1) raf=requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const TABS = [
    { name:"Momentum", icon:"📈", c:"#22c55e",
      tagline:"Rising assets tend to keep rising",
      desc:"Markets trend for months or years. A stock up 20% this quarter is statistically more likely to continue than to reverse. Momentum strategies don't predict tops — they ride the signal and exit when it breaks." },
    { name:"Mean Reversion", icon:"↩️", c:"#0ea5e9",
      tagline:"Stretched too far, it snaps back",
      desc:"Prices oscillate around fair value. When a stock drops 15% in a week with no fundamental news, that's oversold sellers — not reality changing. RSI below 30 is the classic signal: the market has overreacted, and the bounce is statistically likely." },
    { name:"Statistical Arb", icon:"⚖️", c:"#a855f7",
      tagline:"Two correlated assets drift apart — then reunite",
      desc:"Find two assets that normally move together. When one outperforms for no structural reason, short the winner and buy the loser. Both legs profit when they converge — as they statistically must." },
    { name:"Machine Learning", icon:"🤖", c:"#f59e0b",
      tagline:"Patterns invisible to the human eye",
      desc:"Feed a model 200 features — price, volume, sentiment, macro. It finds non-linear patterns no human could hand-code. The danger is overfitting. Rigorous out-of-sample testing separates real edge from illusion." },
  ];
  const cur = TABS[active];
  const W=480, H=155;

  const rngM=seedRng(31); let mp=100; const mPts=[];
  for(let i=0;i<=60;i++){mp+=0.65+(rngM()-0.25)*3.2; mPts.push([i,mp]);}
  const mMa=mPts.map((_,i)=>i<20?null:[mPts[i][0],mPts.slice(i-20,i).reduce((s,[,y])=>s+y,0)/20]).filter(Boolean);

  const rngR=seedRng(59); let rp=50; const rPts=[];
  for(let i=0;i<=60;i++){rp+=(rngR()-0.5)*7;rp=Math.max(18,Math.min(82,rp+(50-rp)*0.14));rPts.push([i,rp]);}

  const rngS=seedRng(41); let aP=100,bP=100; const saPts=[],sbPts=[];
  for(let i=0;i<=60;i++){
    const sh=(rngS()-0.5)*2; aP+=sh+(i>18&&i<38?0.9:0)+(rngS()-0.5)*1.2;
    bP+=sh+(rngS()-0.5)*1.2; saPts.push([i,aP]); sbPts.push([i,bP]);
  }

  const rngML=seedRng(97); const cl1=[],cl2=[];
  for(let i=0;i<20;i++) cl1.push([rngML()*0.38+0.05, rngML()*0.45+0.45]);
  for(let i=0;i<18;i++) cl2.push([rngML()*0.38+0.52, rngML()*0.45+0.05]);

  const xsc=(x,mn,mx)=>((x-mn)/(mx-mn))*(W-16)+8;
  const ysc=(y,mn,mx)=>H-8-((y-mn)/(mx-mn))*(H-22);
  const LEN=1600;

  const mMin=Math.min(...mPts.map(p=>p[1])),mMax=Math.max(...mPts.map(p=>p[1]));
  const mXs=x=>xsc(x,0,60), mYs=y=>ysc(y,mMin,mMax);
  const mPath=mPts.map(([x,y],i)=>`${i===0?"M":"L"}${mXs(x).toFixed(1)},${mYs(y).toFixed(1)}`).join(" ");
  const mMaPath=mMa.map(([x,y],i)=>`${i===0?"M":"L"}${mXs(x).toFixed(1)},${mYs(y).toFixed(1)}`).join(" ");

  const rXs=x=>xsc(x,0,60), rYs=y=>ysc(y,18,82);
  const rPath=rPts.map(([x,y],i)=>`${i===0?"M":"L"}${rXs(x).toFixed(1)},${rYs(y).toFixed(1)}`).join(" ");

  const saAll=[...saPts.map(p=>p[1]),...sbPts.map(p=>p[1])];
  const saMin=Math.min(...saAll),saMax=Math.max(...saAll);
  const saXs=x=>xsc(x,0,60), saYs=y=>ysc(y,saMin,saMax);
  const saPath=saPts.map(([x,y],i)=>`${i===0?"M":"L"}${saXs(x).toFixed(1)},${saYs(y).toFixed(1)}`).join(" ");
  const sbPath=sbPts.map(([x,y],i)=>`${i===0?"M":"L"}${saXs(x).toFixed(1)},${saYs(y).toFixed(1)}`).join(" ");

  const charts = [
    <svg key={0} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      <path d={mPath} fill="none" stroke="#22c55e55" strokeWidth={2} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)}/>
      <path d={mMaPath} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)} strokeLinecap="round"/>
      {prog>0.55&&<text x={mXs(34)} y={mYs(mPts[34][1])-14} fill="#22c55e" fontSize={10} fontWeight={800} textAnchor="middle" className="qw-in">↑ Trend signal ON</text>}
      {prog>0.92&&<text x={W-10} y={mYs(mPts[60][1])-12} fill="#22c55e" fontSize={15} fontWeight={900} textAnchor="end" className="qw-in">+{Math.round(mPts[60][1]-100)}%</text>}
      <text x={10} y={H-3} fill="#22c55e80" fontSize={9}>Price</text>
      <text x={48} y={H-3} fill="#22c55e" fontSize={9}>— MA20 signal line</text>
    </svg>,
    <svg key={1} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      <rect x={0} y={rYs(82)} width={W} height={rYs(70)-rYs(82)} fill="#ef444414"/>
      <rect x={0} y={rYs(30)} width={W} height={rYs(18)-rYs(30)} fill="#22c55e14"/>
      <line x1={0} y1={rYs(50)} x2={W} y2={rYs(50)} stroke="#ffffff18" strokeWidth={1} strokeDasharray="6 4"/>
      <text x={8} y={rYs(76)} fill="#ef4444cc" fontSize={8.5} fontWeight={800}>OVERBOUGHT — SELL</text>
      <text x={8} y={rYs(22)+9} fill="#22c55ecc" fontSize={8.5} fontWeight={800}>OVERSOLD — BUY ↑</text>
      <path d={rPath} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)} strokeLinecap="round"/>
      {rPts.filter(([x,y])=>y<28&&prog>x/60).filter((_,i,a)=>i===0||a[i-1][1]>=28).map(([x,y],i)=>(
        <text key={i} x={rXs(x)} y={rYs(y)-10} fill="#22c55e" fontSize={15} textAnchor="middle">▲</text>
      ))}
    </svg>,
    <svg key={2} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      {prog>0.22&&<rect x={saXs(18)} y={5} width={saXs(38)-saXs(18)} height={H-12} fill="#a855f713" className="qw-in"/>}
      {prog>0.32&&<text x={(saXs(18)+saXs(38))/2} y={18} fill="#a855f7cc" fontSize={9} fontWeight={700} textAnchor="middle" className="qw-in">← Divergence zone →</text>}
      <path d={sbPath} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)}/>
      <path d={saPath} fill="none" stroke="#a855f7" strokeWidth={2.5} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)} strokeLinecap="round"/>
      {prog>0.35&&<text x={saXs(26)} y={saYs(saPts[26][1])-12} fill="#a855f7" fontSize={9} fontWeight={700} textAnchor="middle" className="qw-in">Short A ↓</text>}
      {prog>0.35&&<text x={saXs(26)} y={saYs(sbPts[26][1])+14} fill="#94a3b8" fontSize={9} fontWeight={700} textAnchor="middle" className="qw-in">Long B ↑</text>}
      {prog>0.93&&<text x={W-10} y={22} fill="#22c55e" fontSize={12} fontWeight={800} textAnchor="end" className="qw-in">Converged ✓  Profit</text>}
      <text x={10} y={H-3} fill="#a855f7" fontSize={9}>— Asset A (overperforming)</text>
      <text x={200} y={H-3} fill="#94a3b8" fontSize={9}>— Asset B (lagging)</text>
    </svg>,
    <svg key={3} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      {cl1.filter((_,i)=>prog>i/cl1.length*0.75).map(([x,y],i)=>(
        <circle key={"a"+i} cx={x*W*0.9+18} cy={y*(H-20)+5} r={7} fill="#22c55e" opacity={0.75} className="qw-in"/>
      ))}
      {cl2.filter((_,i)=>prog>0.12+i/cl2.length*0.7).map(([x,y],i)=>(
        <circle key={"b"+i} cx={x*W*0.85+22} cy={y*(H-22)+8} r={7} fill="#ef4444" opacity={0.75} className="qw-in"/>
      ))}
      {prog>0.87&&<>
        <line x1={155} y1={8} x2={305} y2={H-5} stroke="#f59e0b" strokeWidth={2} strokeDasharray="7 4" className="qw-in"/>
        <text x={W/2-20} y={H/2-6} fill="#f59e0b" fontSize={9.5} fontWeight={800} textAnchor="middle" className="qw-in">Decision boundary</text>
        <text x={38} y={26} fill="#22c55e" fontSize={10} fontWeight={700} className="qw-in">Bullish pattern</text>
        <text x={305} y={H-10} fill="#ef4444" fontSize={10} fontWeight={700} className="qw-in">Bearish pattern</text>
      </>}
    </svg>,
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,padding:"8px 0"}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setActive(i)} style={{
            padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",
            background:active===i?t.c+"22":"#080f1c",
            border:`2px solid ${active===i?t.c:"#1e3048"}`,
            borderRadius:12,color:active===i?t.c:"#4a7090",transition:"all 0.2s",
          }}>{t.icon} {t.name}</button>
        ))}
      </div>
      <div className="qw-up" key={"tg"+active} style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:-0.4,lineHeight:1.3}}>
        {cur.tagline}
      </div>
      <div style={{background:"#060e1c",border:`1.5px solid ${cur.c}30`,borderRadius:14,padding:"16px 14px 10px",overflow:"hidden"}}>
        {charts[active]}
      </div>
      <p className="qw-up" key={"ds"+active} style={{fontSize:15,color:"#c8dce8",margin:0,lineHeight:1.8}}>
        {cur.desc}
      </p>
    </div>
  );
}

// ─── BUILD PREVIEW VIZ ────────────────────────────────────────────────────────

function BuildPreviewViz({ color }) {
  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0);
  useEffect(()=>{
    setProg(0);
    const t0=performance.now(); let raf;
    const tick=now=>{const p=Math.min((now-t0)/2200,1);setProg(p);if(p<1)raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[active]);

  const PROJECTS=[
    { name:"The Backtester", icon:"📊", c:"#0ea5e9",
      tagline:"Test any strategy on 5 years of real price data",
      stats:[{l:"Total Return",v:"+47%",c:"#22c55e"},{l:"vs S&P 500",v:"+25%",c:"#0ea5e9"},{l:"Sharpe Ratio",v:"1.84",c:"#a855f7"},{l:"Max Drawdown",v:"-11%",c:"#f59e0b"}] },
    { name:"RSI Strategy", icon:"📉", c:"#22c55e",
      tagline:"Mean-reversion signals coded from scratch — not copied",
      stats:[{l:"Trades taken",v:"147",c:"#0ea5e9"},{l:"Win rate",v:"62%",c:"#22c55e"},{l:"Avg hold",v:"4.2d",c:"#f59e0b"},{l:"Sharpe",v:"1.6",c:"#a855f7"}] },
    { name:"ML Predictor", icon:"🤖", c:"#a855f7",
      tagline:"Trained on real features, honestly validated out-of-sample",
      stats:[{l:"Features",v:"23",c:"#0ea5e9"},{l:"Train acc",v:"71%",c:"#f59e0b"},{l:"Test acc",v:"57%",c:"#22c55e"},{l:"Honest?",v:"Yes",c:"#22c55e"}] },
  ];
  const cur=PROJECTS[active];
  const W=480,H=148;
  const LEN=1400;

  const btRng=seedRng(13); let sp=100,bp=100; const sPts=[],bPts2=[];
  for(let i=0;i<=50;i++){const r=(btRng()-0.44)*3.2;sp+=r+(btRng()-0.34)*1.8;bp+=r+(btRng()-0.5)*1.2;sPts.push([i,sp]);bPts2.push([i,bp]);}
  const btAll=[...sPts.map(p=>p[1]),...bPts2.map(p=>p[1])];
  const btMin=Math.min(...btAll),btMax=Math.max(...btAll);
  const btXs=x=>(x/50)*(W-20)+10,btYs=y=>H-8-((y-btMin)/(btMax-btMin))*(H-22);
  const sPath2=sPts.map(([x,y],i)=>`${i===0?"M":"L"}${btXs(x).toFixed(1)},${btYs(y).toFixed(1)}`).join(" ");
  const bPath3=bPts2.map(([x,y],i)=>`${i===0?"M":"L"}${btXs(x).toFixed(1)},${btYs(y).toFixed(1)}`).join(" ");

  const rsRng=seedRng(27); let rp2=100; const rsPts=[];
  for(let i=0;i<=50;i++){rp2+=(rsRng()-0.46)*3.5;rsPts.push([i,rp2]);}
  const rsMin=Math.min(...rsPts.map(p=>p[1])),rsMax=Math.max(...rsPts.map(p=>p[1]));
  const rsXs=x=>(x/50)*(W-20)+10,rsYs=y=>H-8-((y-rsMin)/(rsMax-rsMin))*(H-22);
  const rsPath=rsPts.map(([x,y],i)=>`${i===0?"M":"L"}${rsXs(x).toFixed(1)},${rsYs(y).toFixed(1)}`).join(" ");
  const buys=[7,18,31,42],sells2=[12,24,37,47];

  const features=[
    {n:"RSI (14-day)",v:0.82},{n:"Volume spike",v:0.71},{n:"MA crossover",v:0.65},
    {n:"Price momentum",v:0.55},{n:"Earnings delta",v:0.42},
  ];

  const charts=[
    <svg key={0} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      <path d={bPath3} fill="none" stroke="#475569" strokeWidth={2} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)} opacity={0.7}/>
      <path d={sPath2} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)} strokeLinecap="round"/>
      {prog>0.9&&<>
        <text x={W-10} y={btYs(sPts[50][1])-10} fill="#0ea5e9" fontSize={13} fontWeight={900} textAnchor="end" className="qw-in">Your Strategy +47%</text>
        <text x={W-10} y={btYs(bPts2[50][1])+16} fill="#475569" fontSize={10} textAnchor="end" className="qw-in">S&P 500 +22%</text>
      </>}
      <text x={12} y={H-3} fill="#0ea5e9" fontSize={9}>— Your strategy</text>
      <text x={110} y={H-3} fill="#475569" fontSize={9}>— Buy and hold</text>
    </svg>,
    <svg key={1} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      <path d={rsPath} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray={LEN} strokeDashoffset={LEN*(1-prog)} strokeLinecap="round"/>
      {buys.filter(b=>prog>b/50).map((b,i)=>(
        <g key={"b"+i} className="qw-in">
          <text x={rsXs(b)} y={rsYs(rsPts[b][1])+18} fill="#22c55e" fontSize={15} textAnchor="middle">▲</text>
          <text x={rsXs(b)} y={rsYs(rsPts[b][1])+30} fill="#22c55e" fontSize={8} textAnchor="middle">BUY</text>
        </g>
      ))}
      {sells2.filter(s=>prog>s/50).map((s,i)=>(
        <g key={"s"+i} className="qw-in">
          <text x={rsXs(s)} y={rsYs(rsPts[s][1])-12} fill="#ef4444" fontSize={15} textAnchor="middle">▼</text>
          <text x={rsXs(s)} y={rsYs(rsPts[s][1])-2} fill="#ef4444" fontSize={8} textAnchor="middle">SELL</text>
        </g>
      ))}
      {prog>0.65&&<text x={W/2} y={H-2} fill="#22c55e80" fontSize={9} textAnchor="middle" className="qw-in">▲ RSI below 30 · ▼ RSI above 70</text>}
    </svg>,
    <svg key={2} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      {features.map((f,i)=>{
        const barW=Math.max(0,(f.v*(W-130))*Math.min(1,Math.max(0,prog*2.5-i*0.18)));
        return <g key={i}>
          <text x={8} y={18+i*27} fill="#c8dce8" fontSize={11} fontWeight={600} dominantBaseline="middle">{f.n}</text>
          <rect x={124} y={9+i*27} width={barW} height={14} rx={4} fill="#a855f7" opacity={0.65+(i*0.06)}/>
          {barW>28&&<text x={128+barW} y={18+i*27} fill="#a855f7cc" fontSize={10} fontWeight={700} dominantBaseline="middle">{Math.round(f.v*100)}%</text>}
        </g>;
      })}
      {prog>0.95&&<text x={W/2} y={H-4} fill="#22c55e" fontSize={11} fontWeight={800} textAnchor="middle" className="qw-in">Out-of-sample accuracy: 57%  ✓ honest, not overfit</text>}
    </svg>,
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,padding:"8px 0"}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {PROJECTS.map((p,i)=>(
          <button key={i} onClick={()=>setActive(i)} style={{
            padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",
            background:active===i?p.c+"22":"#080f1c",
            border:`2px solid ${active===i?p.c:"#1e3048"}`,
            borderRadius:12,color:active===i?p.c:"#4a7090",transition:"all 0.2s",
          }}>{p.icon} {p.name}</button>
        ))}
      </div>
      <div className="qw-up" key={"bg"+active} style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:-0.4,lineHeight:1.3}}>
        {cur.tagline}
      </div>
      <div style={{background:"#060e1c",border:`1.5px solid ${cur.c}30`,borderRadius:14,padding:"16px 14px 10px",overflow:"hidden",minHeight:170}}>
        {charts[active]}
      </div>
      <div className="qw-up" key={"st"+active} style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {cur.stats.map((s,i)=>(
          <div key={i} style={{background:"#070f1c",border:`1px solid ${s.c}28`,borderRadius:12,padding:"12px 18px",textAlign:"center",flex:"1 1 80px",boxShadow:`0 0 20px ${s.c}12`}}>
            <div style={{fontSize:22,fontWeight:900,color:s.c,letterSpacing:-0.5,textShadow:`0 0 24px ${s.c}50`}}>{s.v}</div>
            <div style={{fontSize:11,color:"#4a7090",marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COURSE ROADMAP ───────────────────────────────────────────────────────────

function CourseRoadmap({ currentModule }) {
  const mods=[
    {n:1,name:"What Is Quant?",c:"#0ea5e9"},{n:2,name:"Python",c:"#22c55e"},
    {n:3,name:"Working With Data",c:"#06b6d4"},{n:4,name:"The Maths",c:"#f97316"},
    {n:5,name:"Strategies",c:"#f59e0b"},{n:6,name:"Machine Learning",c:"#a855f7"},
  ];
  const cm = currentModule || 1;
  return (
    <div style={{padding:"12px 0 8px"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:0,overflowX:"auto",paddingBottom:4}}>
        {mods.map((m,i)=>(
          <div key={m.n} style={{display:"flex",alignItems:"flex-start",flex:i<mods.length-1?"1":"none",minWidth:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,flexShrink:0}}>
              <div style={{
                width:48,height:48,borderRadius:"50%",
                background:m.n===cm?m.c+"28":"#0a1628",
                border:`2.5px solid ${m.n<=cm?m.c:"#1e3048"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:17,fontWeight:900,color:m.n<=cm?m.c:"#2d4a5a",
                boxShadow:m.n===cm?`0 0 24px ${m.c}55`:"none",
                animation:m.n===cm?"qw-pulse 2.5s ease-in-out infinite":"none",
                flexShrink:0,
              }}>{m.n}</div>
              <div style={{fontSize:9.5,fontWeight:700,color:m.n<=cm?m.c:"#2d4a5a",textAlign:"center",maxWidth:60,lineHeight:1.3}}>{m.name}</div>
            </div>
            {i<mods.length-1&&(
              <div style={{height:2,background:m.n<cm?m.c+"60":"#1e3048",flex:1,alignSelf:"center",marginTop:-18,marginLeft:2,marginRight:2}}/>
            )}
          </div>
        ))}
      </div>
      <p style={{fontSize:12,color:"#3a6070",textAlign:"center",margin:"14px 0 0",fontStyle:"italic"}}>
        You are at Module 1 · each module builds directly on the last
      </p>
    </div>
  );
}

// ─── QUIZ BLOCK ──────────────────────────────────────────────────────────────

const OPTION_COLORS = ["#3b82f6","#a855f7","#f59e0b","#22c55e"];
const OPTION_LABELS = ["A","B","C","D"];

function QuizBlock({ slide, module, isMobile }) {
  const [sel, setSel] = useState(null);
  const c = module.color;
  const revealed = sel !== null;

  return (
    <div style={{ padding: "28px 0", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Question */}
      <div className="qw-up" style={{ background: `linear-gradient(135deg, ${c}20, ${c}0a)`, border: `1.5px solid ${c}35`, borderRadius: 18, padding: "22px 24px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: c + "30", border: `2px solid ${c}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🤔</div>
        <p style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#fff", lineHeight: 1.45, margin: 0 }}>{slide.question}</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {slide.options.map((opt, i) => {
          const isCorrect = i === slide.correct, isSelected = sel === i;
          const dimmed = revealed && !isCorrect && !isSelected;
          const optColor = OPTION_COLORS[i % OPTION_COLORS.length];

          let bg, border, textColor, badgeBg, badgeColor, icon;
          if (revealed) {
            if (isCorrect)      { bg = "#0d2b1a"; border = "#22c55e"; textColor = "#4ade80"; badgeBg = "#22c55e"; badgeColor = "#fff"; icon = "✓"; }
            else if (isSelected){ bg = "#2b0d0d"; border = "#ef4444"; textColor = "#f87171"; badgeBg = "#ef4444"; badgeColor = "#fff"; icon = "✗"; }
            else                { bg = "#06101a"; border = "#0e1e2e"; textColor = "#2d4057"; badgeBg = "#0e1e2e"; badgeColor = "#334155"; }
          } else {
            bg = "#0b1928"; border = optColor + "50"; textColor = "#c8dce8"; badgeBg = optColor + "22"; badgeColor = optColor;
          }

          return (
            <button key={i} className={revealed ? "" : "qw-up"} style={{ animationDelay: `${i * 55}ms`,
              background: bg, border: `2px solid ${border}`, borderRadius: 16,
              padding: isMobile ? "14px 16px" : "16px 22px", color: textColor, fontSize: isMobile ? 14 : 16,
              fontWeight: 600, cursor: revealed ? "default" : "pointer", textAlign: "left",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16,
              opacity: dimmed ? 0.18 : 1,
              transform: revealed ? "none" : undefined,
            }}
              onMouseEnter={e => { if (!revealed) { e.currentTarget.style.background = optColor + "18"; e.currentTarget.style.borderColor = optColor + "80"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { if (!revealed) { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = border; e.currentTarget.style.transform = "none"; }}}
              onClick={() => sel === null && setSel(i)}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: badgeBg, border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0, color: badgeColor, transition: "all 0.2s" }}>
                {icon || OPTION_LABELS[i]}
              </span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="qw-up" style={{ padding: "20px 22px", background: "linear-gradient(135deg, #0a2218, #061a10)", border: "1.5px solid #22c55e30", borderRadius: 16, display: "flex", gap: 14 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Explanation</div>
            <p style={{ fontSize: 14, color: "#a0d4b4", margin: 0, lineHeight: 1.85 }}>{slide.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SLIDE CONTENT RENDERER ──────────────────────────────────────────────────

function SlideContent({ slide, module, isMobile }) {
  if (!slide) return null;
  const c = module.color;

  if (slide.type === "cinematic") return (
    <CinematicSlide slide={slide} color={c} />
  );

  if (slide.type === "walkthrough") return (
    <div style={{padding:"8px 0"}}>
      <CodeWalkthrough slide={slide} color={c} />
    </div>
  );

  if (slide.type === "quiz") return <QuizBlock slide={slide} module={module} isMobile={isMobile} />;

  if (slide.type === "interactive") {
    const hdr = (title, desc) => (
      <div style={{marginBottom:20}}>
        <h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 8px",letterSpacing:-0.5}}>{title}</h3>
        {desc&&<p style={{fontSize:14,color:"#7090a8",margin:0,lineHeight:1.6}}>{desc}</p>}
      </div>
    );
    if (slide.variant==="coin-flip") return <div style={{padding:"16px 0"}}>{hdr(slide.title||"The Biased Coin",slide.desc)}<CoinFlipBlock color={c}/></div>;
    if (slide.variant==="edge-calc") return <div style={{padding:"16px 0"}}>{hdr(slide.title||"Edge Calculator",slide.desc)}<EdgeCalcBlock color={c}/></div>;
    if (slide.variant==="edge-types") return <div style={{padding:"16px 0"}}>{hdr(slide.title,slide.desc)}<EdgeTypesViz color={c}/></div>;
    return null;
  }

  if (slide.type === "visual" && slide.variant==="build-preview") return (
    <div style={{padding:"24px 0 8px"}}>
      {slide.title&&<h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 6px",letterSpacing:-0.5}}>{slide.title}</h3>}
      {slide.desc&&<p style={{fontSize:14,color:"#7090a8",margin:"0 0 14px"}}>{slide.desc}</p>}
      <BuildPreviewViz color={c}/>
    </div>
  );

  if (slide.type === "visual" && slide.variant==="roadmap") return (
    <div style={{padding:"24px 0 8px"}}>
      {slide.title&&<h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 6px",letterSpacing:-0.5}}>{slide.title}</h3>}
      {slide.desc&&<p style={{fontSize:14,color:"#7090a8",margin:"0 0 14px"}}>{slide.desc}</p>}
      <CourseRoadmap currentModule={1}/>
    </div>
  );

  if (slide.type === "visual" && slide.variant==="trader-vs-quant") return (
    <div style={{padding:"24px 0 8px"}}>
      {slide.title&&<h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 6px",letterSpacing:-0.5}}>{slide.title}</h3>}
      {slide.desc&&<p style={{fontSize:14,color:"#7090a8",margin:"0 0 16px"}}>{slide.desc}</p>}
      <TraderVsQuantViz color={c}/>
    </div>
  );

  if (slide.type === "visual" && slide.variant==="return-counter") return (
    <div style={{padding:"24px 0 8px"}}>
      {slide.title&&<h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 6px",letterSpacing:-0.5}}>{slide.title}</h3>}
      {slide.desc&&<p style={{fontSize:14,color:"#7090a8",margin:"0 0 10px"}}>{slide.desc}</p>}
      <ReturnCounterViz color={c}/>
    </div>
  );

  if (slide.type === "visual" && slide.variant==="equity-curve") return (
    <div style={{padding:"28px 0 16px"}}>
      <div style={{marginBottom:18}}>
        <h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 8px",letterSpacing:-0.5}}>{slide.title||"What the edge looks like over 30 years"}</h3>
        {slide.desc&&<p style={{fontSize:14,color:"#7090a8",margin:0}}>{slide.desc}</p>}
      </div>
      <EquityCurveViz color={c}/>
      {slide.note&&<p style={{fontSize:14,color:"#8fafc4",marginTop:14,lineHeight:1.7}}>{renderLessonText(slide.note)}</p>}
    </div>
  );

  if (slide.type === "hero") return (
    <div style={{ padding: isMobile ? "40px 0" : "56px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {slide.label && (
        <span className="qw-up" style={{ animationDelay: "0ms", fontSize: 11, fontWeight: 900, color: c, textTransform: "uppercase", letterSpacing: "0.22em", background: c + "20", border: `1.5px solid ${c}40`, padding: "6px 16px", borderRadius: 20 }}>
          {slide.label}
        </span>
      )}
      <div className="qw-float" style={{ marginTop: 8, position: "relative" }}>
        <div style={{ position: "absolute", inset: "-30px", borderRadius: "50%", background: `radial-gradient(circle, ${c}30 0%, transparent 70%)`, filter: "blur(20px)", zIndex: 0 }} />
        <div className="qw-in" style={{ animationDelay: "80ms", position: "relative", zIndex: 1, fontSize: isMobile ? 88 : 130, fontWeight: 900, color: c, letterSpacing: -7, lineHeight: 0.88, textShadow: `0 0 60px ${c}70, 0 0 120px ${c}40` }}>
          {slide.value}
        </div>
      </div>
      {slide.sub && <p className="qw-up" style={{ animationDelay: "180ms", fontSize: isMobile ? 19 : 24, color: "#8fb3cc", margin: 0, fontWeight: 600 }}>{slide.sub}</p>}
      {slide.items && (
        <div className="qw-up" style={{ animationDelay: "260ms", display: "flex", gap: 32, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {slide.items.map((item, i) => (
            <div key={i} style={{ textAlign: "center", padding: "14px 20px", background: c + "12", border: `1px solid ${c}25`, borderRadius: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#e2e8f0" }}>{item.value}</div>
              <div style={{ fontSize: 12, color: "#7090a8", marginTop: 3 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}
      {slide.context && <p className="qw-up" style={{ animationDelay: "320ms", fontSize: 14, color: "#6a9ab5", margin: "6px 0 0", maxWidth: 460, lineHeight: 1.75 }}>{slide.context}</p>}
    </div>
  );

  if (slide.type === "intro") return (
    <div style={{ padding: isMobile ? "48px 0 32px" : "64px 0 48px", display: "flex", flexDirection: "column", gap: 32 }}>
      {slide.hook && (
        <div className="qw-up" style={{ animationDelay: "0ms", display: "inline-flex", alignItems: "center", gap: 10, alignSelf: "flex-start" }}>
          <div style={{ width: 44, height: 5, borderRadius: 3, background: `linear-gradient(90deg, ${c}, ${c}60)` }} />
          <span style={{ fontSize: 11, fontWeight: 900, color: c, textTransform: "uppercase", letterSpacing: "0.2em" }}>{slide.hook}</span>
        </div>
      )}
      <p className="qw-up" style={{ animationDelay: "70ms", fontSize: isMobile ? 28 : 38, color: "#fff", lineHeight: 1.35, fontWeight: 800, margin: 0, letterSpacing: -1.2 }}>
        {renderLessonText(slide.text)}
      </p>
      {slide.sub && (
        <p className="qw-up" style={{ animationDelay: "140ms", fontSize: isMobile ? 15 : 17, color: "#8fafc4", lineHeight: 1.9, margin: 0, paddingTop: 24, borderTop: `1px solid ${c}20` }}>
          {renderLessonText(slide.sub)}
        </p>
      )}
    </div>
  );

  if (slide.type === "section") return (
    <div style={{padding:isMobile?"36px 0":"52px 0"}}>
      <div className="qw-left" style={{display:"flex",alignItems:"center",gap:14,marginBottom:26}}>
        <div style={{width:5,height:38,borderRadius:3,background:c,flexShrink:0}}/>
        <h2 style={{fontSize:isMobile?24:32,fontWeight:800,color:"#fff",margin:0,letterSpacing:-0.5,lineHeight:1.2}}>{slide.heading}</h2>
      </div>
      <div style={{paddingLeft:isMobile?0:19,display:"flex",flexDirection:"column",gap:16}}>
        {slide.texts.map((t,i)=>(
          <p key={i} className="qw-up" style={{animationDelay:`${80+i*60}ms`,fontSize:i===0?17:15,color:i===0?"#c8dce8":"#8fafc4",lineHeight:1.9,margin:0}}>
            {renderLessonText(t.text)}
          </p>
        ))}
      </div>
    </div>
  );

  if (slide.type === "stat") return (
    <div style={{ padding: "28px 0", display: "flex", flexDirection: "column", gap: 20 }}>
      {slide.label && <p style={{ fontSize: 11, fontWeight: 800, color: c, textTransform: "uppercase", letterSpacing: "0.16em", margin: 0, opacity: 0.7 }}>{slide.label}</p>}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min(slide.stats.length, 3)}, 1fr)`, gap: 14 }}>
        {slide.stats.map((s, i) => (
          <div key={i} className="qw-in" style={{ animationDelay: `${i * 120}ms`,
            background: `linear-gradient(135deg, ${c}28 0%, ${c}10 60%, #0a1628 100%)`,
            border: `1.5px solid ${c}45`, borderRadius: 20, padding: "30px 20px", textAlign: "center",
            boxShadow: `0 0 30px ${c}18, inset 0 1px 0 ${c}30` }}>
            <div style={{ fontSize: isMobile ? 52 : 64, fontWeight: 900, color: c, letterSpacing: -4, lineHeight: 1, marginBottom: 12, textShadow: `0 0 40px ${c}60` }}>{s.value}</div>
            <div style={{ fontSize: 15, color: "#d4e6f4", fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 12, color: "#3d6070", lineHeight: 1.5 }}>{s.sub}</div>}
          </div>
        ))}
      </div>
      {slide.note && <p style={{ fontSize: 13, color: "#6b8fa8", margin: 0, textAlign: "center", fontStyle: "italic" }}>{slide.note}</p>}
    </div>
  );

  if (slide.type === "compare") return (
    <div style={{padding:"28px 0",display:"flex",flexDirection:"column",gap:16}}>
      {slide.title&&<h3 className="qw-up" style={{fontSize:20,fontWeight:800,color:"#fff",margin:0,letterSpacing:-0.3}}>{slide.title}</h3>}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
        <div className="qw-left" style={{background:"#060e1c",border:"1px solid #1e3048",borderRadius:16,padding:"20px 20px",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",color:"#4a7090",paddingBottom:10,borderBottom:"1px solid #253a52"}}>{slide.left.label}</div>
          {slide.left.items.map((item,i)=>(<div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{color:"#ef444440",fontSize:14,flexShrink:0,marginTop:1}}>✗</span>
            <span style={{fontSize:13,color:"#c8dce8",lineHeight:1.55}}>{item}</span>
          </div>))}
        </div>
        <div className="qw-right" style={{background:`${c}09`,border:`1px solid ${c}28`,borderRadius:16,padding:"20px 20px",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",color:c,paddingBottom:10,borderBottom:`1px solid ${c}20`}}>{slide.right.label}</div>
          {slide.right.items.map((item,i)=>(<div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{color:"#22c55e",fontSize:14,flexShrink:0,marginTop:1}}>✓</span>
            <span style={{fontSize:13,color:"#7090a8",lineHeight:1.55}}>{item}</span>
          </div>))}
        </div>
      </div>
    </div>
  );

  if (slide.type === "list") return (
    <div style={{padding:"28px 0",display:"flex",flexDirection:"column",gap:14}}>
      {slide.title&&<h3 className="qw-up" style={{fontSize:20,fontWeight:800,color:"#fff",margin:0,letterSpacing:-0.3}}>{slide.title}</h3>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {slide.items.map((item,i)=>(
          <div key={i} className="qw-up" style={{animationDelay:`${i*70}ms`,
            background:"#0c1628",border:"1px solid #1e3048",borderRadius:13,
            padding:"14px 16px",display:"flex",gap:13,alignItems:"flex-start"}}>
            <span style={{fontSize:22,lineHeight:1.4,flexShrink:0}}>{item.icon}</span>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginBottom:2}}>{item.title}</div>
              <div style={{fontSize:13,color:"#8fafc4",lineHeight:1.6}}>{renderLessonText(item.text)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (slide.type === "callout") return (
    <div style={{padding:"28px 0"}}>
      <div className="qw-up" style={{background:"#060d1c",border:`2px solid ${c}45`,borderRadius:18,padding:isMobile?"22px 18px":"26px 30px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${c},${c}40)`}}/>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          {slide.icon&&<span style={{fontSize:26,lineHeight:1.3,flexShrink:0}}>{slide.icon}</span>}
          <div style={{flex:1}}>
            {slide.title&&<div style={{fontSize:16,fontWeight:800,color:c,marginBottom:10}}>{slide.title}</div>}
            <p style={{fontSize:15,color:"#b0cfe0",margin:0,lineHeight:1.8}}>{renderLessonText(slide.text)}</p>
          </div>
        </div>
        {slide.items&&(
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8,paddingLeft:slide.icon?40:0}}>
            {slide.items.map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0,marginTop:8}}/>
              <span style={{fontSize:14,color:"#b0cfe0",lineHeight:1.7}}>{renderLessonText(item)}</span>
            </div>))}
          </div>
        )}
      </div>
    </div>
  );

  if (slide.type === "formula") return (
    <div style={{padding:"32px 0"}}>
      <div style={{background:"#060e1c",border:"1px solid #1e3048",borderRadius:16,padding:isMobile?"22px 18px":"34px 40px"}}>
        <div style={{color:"#e2e8f0",textAlign:"center",marginBottom:slide.vars?26:0}}><MathExpr display>{slide.formula}</MathExpr></div>
        {slide.vars&&<div style={{borderTop:"1px solid #111d2c",paddingTop:18,display:"flex",flexDirection:"column",gap:12}}>
          {slide.vars.map(v=>(<div key={v.var} style={{display:"flex",gap:16,alignItems:"baseline"}}>
            <span style={{flexShrink:0,minWidth:120,color:c}}><MathExpr>{v.var}</MathExpr></span>
            <span style={{fontSize:14,color:"#8fafc4",lineHeight:1.6}}>{v.desc}</span>
          </div>))}
        </div>}
      </div>
    </div>
  );

  if (slide.type === "code") return (
    <div style={{padding:"18px 0"}}>
      {slide.label&&<div style={{fontSize:13,fontWeight:600,color:"#3d5468",marginBottom:10}}>{slide.label}</div>}
      <CodeBlock code={slide.code} language={slide.language}/>
    </div>
  );

  if (slide.type === "steps") return (
    <div style={{padding:"18px 0"}}>
      <div style={{background:"#060e1c",border:"1px solid #1e3048",borderRadius:14,overflow:"hidden"}}>
        {slide.label&&<div style={{padding:"10px 18px",borderBottom:"1px solid #111d2c",fontSize:11,fontWeight:700,color:"#6b8fa8",textTransform:"uppercase",letterSpacing:"0.1em"}}>{slide.label}</div>}
        {slide.steps.map((step,si)=>(<div key={si} style={{display:"flex",borderBottom:si<slide.steps.length-1?"1px solid #1e3048":"none"}}>
          <div style={{padding:"12px 16px",width:isMobile?100:188,flexShrink:0,borderRight:"1px solid #1e3048",color:"#7090a8",fontSize:12,fontWeight:600,display:"flex",alignItems:"center"}}>{step.label}</div>
          <div style={{padding:"12px 18px",color:"#e2e8f0",flex:1,fontSize:14,display:"flex",alignItems:"center"}}><MathExpr>{step.expr}</MathExpr></div>
        </div>))}
      </div>
    </div>
  );

  if (slide.type === "insight") return (
    <div style={{padding:"32px 0"}}>
      <div className="qw-up" style={{background:`linear-gradient(135deg,${c}14 0%,${c}07 100%)`,border:`1px solid ${c}28`,borderRadius:16,padding:isMobile?"20px 18px":"26px 30px",display:"flex",gap:16,alignItems:"flex-start"}}>
        <span style={{fontSize:22,flexShrink:0,lineHeight:1.6}}>💡</span>
        <p style={{fontSize:16,color:"#8fafc4",margin:0,lineHeight:1.85}}>{renderLessonText(slide.text)}</p>
      </div>
    </div>
  );

  return null;
}


// ─── COURSE SIDEBAR ───────────────────────────────────────────────────────────

function CourseSidebar({ modules, activeModuleId, activeLessonId, onSelectLesson, isUserPro }) {
  const [expanded, setExpanded] = useState([activeModuleId]);

  const toggle = (id) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingBottom: 40 }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e293b" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em" }}>Course</span>
      </div>
      {modules.map(mod => {
        const isExp = expanded.includes(mod.id);
        return (
          <div key={mod.id}>
            <div onClick={() => toggle(mod.id)}
              style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, userSelect: "none", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#111827"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: mod.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: activeModuleId === mod.id ? "#fff" : "#64748b", flex: 1, lineHeight: 1.4 }}>{mod.title}</span>
              <span style={{ color: "#4a7090", fontSize: 10, display: "inline-block", transition: "transform 0.2s", transform: isExp ? "rotate(90deg)" : "none" }}>▶</span>
            </div>
            {isExp && mod.lessons.map(lesson => {
              const locked = !lesson.free && !isUserPro;
              const isActive = activeLessonId === lesson.id && activeModuleId === mod.id;
              return (
                <div key={lesson.id}
                  onClick={() => !locked && onSelectLesson(mod, lesson)}
                  style={{ padding: "9px 20px 9px 38px", cursor: locked ? "default" : "pointer", background: isActive ? mod.color + "18" : "transparent", borderLeft: `2px solid ${isActive ? mod.color : "transparent"}`, transition: "all 0.15s" }}
                  onMouseEnter={e => { if (!locked && !isActive) e.currentTarget.style.background = "#111827"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ fontSize: 12, color: isActive ? "#e2e8f0" : locked ? "#334155" : "#64748b", lineHeight: 1.5 }}>
                    {locked ? "🔒 " : ""}{lesson.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#4a7090", marginTop: 2 }}>{lesson.duration}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── SLIDE VIEW ───────────────────────────────────────────────────────────────

function SlideView({ lesson, module, onBack, onComplete, modules, activeModuleId, activeLessonId, onSelectLesson, sidebarOpen, setSidebarOpen, isUserPro }) {
  const { isMobile } = useWindowSize();
  const [slideIndex, setSlideIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const contentRef = useRef(null);

  const slides = buildSlides(lesson.content);
  const total = slides.length;
  // Clamp index in case it's stale for one frame after lesson switch
  const safeIndex = Math.min(slideIndex, total - 1);

  // Reset on lesson change
  useEffect(() => {
    setSlideIndex(0);
    setVisible(true);
  }, [lesson.id]);

  // Scroll slide area to top on slide change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [slideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(slideIndex + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(slideIndex - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, total]);

  const goTo = (idx) => {
    if (idx < 0 || idx >= total) return;
    setVisible(false);
    setTimeout(() => { setSlideIndex(idx); setVisible(true); }, 110);
  };

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === total - 1;
  const showDots = total <= 12;

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      {/* Collapsible sidebar */}
      <div style={{ width: sidebarOpen && !isMobile ? 270 : 0, flexShrink: 0, background: "#080d17", borderRight: sidebarOpen && !isMobile ? "1px solid #1e293b" : "none", overflow: "hidden", transition: "width 0.3s ease" }}>
        <CourseSidebar
          modules={modules}
          activeModuleId={activeModuleId}
          activeLessonId={activeLessonId}
          onSelectLesson={onSelectLesson}
          isUserPro={isUserPro}
        />
      </div>

      {/* Main slide area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: "#1e293b", flexShrink: 0 }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${module.color}, ${module.color}88)`, width: `${((safeIndex + 1) / total) * 100}%`, transition: "width 0.3s ease" }} />
        </div>

        {/* Lesson header bar */}
        <div style={{ padding: isMobile ? "12px 20px" : "12px 36px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            style={{ background: "transparent", border: "1px solid #1e293b", borderRadius: 8, padding: "5px 9px", color: "#475569", cursor: "pointer", fontSize: 13, flexShrink: 0, lineHeight: 1 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
          <button onClick={onBack}
            style={{ background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            ← {module.title}
          </button>
          <span style={{ color: "#1e293b", flexShrink: 0 }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lesson.title}
          </span>
          <span style={{ fontSize: 12, color: "#4a7090", flexShrink: 0, whiteSpace: "nowrap" }}>
            {safeIndex + 1} / {total}
          </span>
        </div>

        {/* Slide content (scrollable) */}
        <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: isMobile ? "0 20px" : "0 64px", background: "#07111e", position: "relative" }}>
          {/* Ambient glow blobs */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${module.color}28 0%, transparent 68%)`, pointerEvents: "none", zIndex: 0, filter: "blur(40px)" }} />
          <div style={{ position: "absolute", bottom: 60, left: -100, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${module.color}14 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0, filter: "blur(50px)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 740, margin: "0 auto", opacity: visible ? 1 : 0, transition: "opacity 0.11s ease" }}>
            <SlideContent key={safeIndex} slide={slides[safeIndex]} module={module} isMobile={isMobile} />
          </div>
        </div>

        {/* Bottom navigation */}
        <div style={{ flexShrink: 0, borderTop: "1px solid #0e1e2e", padding: isMobile ? "14px 20px" : "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "#06101a" }}>
          {/* Prev */}
          <button onClick={() => goTo(slideIndex - 1)} disabled={isFirst}
            style={{ padding: isMobile ? "9px 16px" : "10px 24px", background: "transparent", border: "1px solid #1e293b", borderRadius: 10, color: isFirst ? "#1e293b" : "#64748b", cursor: isFirst ? "default" : "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.15s", flexShrink: 0 }}
            onMouseEnter={e => { if (!isFirst) { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = isFirst ? "#1e293b" : "#64748b"; }}>
            ← {!isMobile && "Prev"}
          </button>

          {/* Dot indicators */}
          {showDots ? (
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", justifyContent: "center", flex: 1 }}>
              {slides.map((_, di) => (
                <div key={di} onClick={() => goTo(di)}
                  style={{ width: di === safeIndex ? 22 : 7, height: 7, borderRadius: 4, background: di < safeIndex ? module.color + "70" : di === safeIndex ? module.color : "#1e293b", cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0 }} />
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>{safeIndex + 1} / {total}</span>
          )}

          {/* Next / Complete */}
          {isLast ? (
            <button onClick={onComplete}
              style={{ padding: isMobile ? "9px 16px" : "10px 24px", background: module.color, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
              {isMobile ? "✓" : "Complete ✓"}
            </button>
          ) : (
            <button onClick={() => goTo(slideIndex + 1)}
              style={{ padding: isMobile ? "9px 16px" : "10px 24px", background: "#1e293b", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.15s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#263548"; e.currentTarget.style.borderColor = module.color + "60"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.borderColor = "#334155"; }}>
              {!isMobile && "Next"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleView({ module, onSelectLesson, onBack, isUserPro }) {
  const { isMobile } = useWindowSize();

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "32px 20px" : "48px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "1px solid #334155", borderRadius: 10, padding: "8px 16px", color: "#64748b", fontSize: 14, cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
        ← All Modules
      </button>

      {/* Module header */}
      <div style={{ background: `linear-gradient(135deg, ${module.color}18, ${module.color}06)`, border: `1px solid ${module.color}30`, borderRadius: 20, padding: isMobile ? "28px 24px" : "36px 40px", marginBottom: 32 }}>
        <div style={{ display: "inline-flex", background: module.color + "20", border: `1px solid ${module.color}40`, borderRadius: 6, padding: "3px 12px", marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: module.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Module {module.number}</span>
        </div>
        <h1 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: -0.5 }}>{module.title}</h1>
        <p style={{ fontSize: 16, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{module.description}</p>
      </div>

      {/* Lessons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {module.lessons.map((lesson, i) => {
          const locked = !lesson.free && !isUserPro;
          return (
            <div
              key={lesson.id}
              onClick={() => !locked && onSelectLesson(lesson)}
              style={{ background: "#1e293b", border: `1px solid ${locked ? "#1e293b" : "#334155"}`, borderRadius: 16, padding: "20px 24px", cursor: locked ? "default" : "pointer", display: "flex", alignItems: "center", gap: 20, transition: "all 0.15s", opacity: locked ? 0.6 : 1 }}
              onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = module.color + "60"; e.currentTarget.style.background = "#263548"; }}}
              onMouseLeave={e => { if (!locked) { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.background = "#1e293b"; }}}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: locked ? "#1e293b" : module.color + "20", border: `2px solid ${locked ? "#334155" : module.color + "60"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {locked
                  ? <span style={{ fontSize: 14 }}>🔒</span>
                  : <span style={{ fontSize: 13, fontWeight: 800, color: module.color }}>{i + 1}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: locked ? "#475569" : "#e2e8f0", marginBottom: 4 }}>{lesson.title}</div>
                <div style={{ fontSize: 13, color: "#475569" }}>{lesson.duration}</div>
              </div>
              {!locked && <span style={{ color: module.color, fontSize: 18, flexShrink: 0 }}>→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COURSE PAGE ────────────────────────────────────────────────────────

function Course() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // inject animation CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "qw-course-styles";
    el.textContent = COURSE_CSS;
    if (!document.getElementById("qw-course-styles")) document.head.appendChild(el);
    return () => { const e = document.getElementById("qw-course-styles"); if(e) e.remove(); };
  }, []);
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isUserPro = true; // TODO: hook up to real auth

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  const handleSelectLesson = (mod, lesson) => {
    if (!lesson.free && !isUserPro) return;
    setActiveModule(mod);
    setActiveLesson(lesson);
  };

  const getNextLesson = () => {
    if (!activeModule || !activeLesson) return null;
    const li = activeModule.lessons.findIndex(l => l.id === activeLesson.id);
    if (li < activeModule.lessons.length - 1)
      return { module: activeModule, lesson: activeModule.lessons[li + 1] };
    const mi = modules.findIndex(m => m.id === activeModule.id);
    if (mi < modules.length - 1) {
      const nextMod = modules[mi + 1];
      return { module: nextMod, lesson: nextMod.lessons[0] };
    }
    return null;
  };

  const handleComplete = () => {
    const next = getNextLesson();
    if (next) { setActiveModule(next.module); setActiveLesson(next.lesson); }
    else { setActiveLesson(null); setActiveModule(null); }
  };

  if (activeLesson && activeModule) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
        <Navbar />
        <SlideView
          lesson={activeLesson}
          module={activeModule}
          onBack={() => setActiveLesson(null)}
          onComplete={handleComplete}
          modules={modules}
          activeModuleId={activeModule.id}
          activeLessonId={activeLesson.id}
          onSelectLesson={handleSelectLesson}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isUserPro={isUserPro}
        />
      </div>
    );
  }

  if (activeModule) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
        <Navbar />
        <ModuleView
          module={activeModule}
          onSelectLesson={(lesson) => handleSelectLesson(activeModule, lesson)}
          onBack={() => setActiveModule(null)}
          isUserPro={isUserPro}
        />
      </div>
    );
  }

  // ── Main course index ──
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 20px 32px" : "72px 48px 40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 600 }}>Structured Learning</span>
        </div>
        <h1 style={{ fontSize: isMobile ? 36 : 60, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1.1, marginBottom: 20 }}>
          From concept<br />
          <span style={{ color: "#0ea5e9" }}>to code.</span>
        </h1>
        <p style={{ fontSize: isMobile ? 16 : 20, color: "#64748b", maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}>
          Four modules. {totalLessons} lessons. Real Python code you can run. The math, the implementation, and the infrastructure — all in one place.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: isMobile ? 20 : 40, flexWrap: "wrap", marginBottom: 16 }}>
          {[["5", "Modules"], [String(totalLessons), "Lessons"], ["Python + C++", "Languages"], ["Pro", "Modules 2–5"]].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>{val}</div>
              <div style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 20px 60px" : "0 48px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {modules.map((mod) => {
            const locked = !mod.free && !isUserPro;
            return (
              <div
                key={mod.id}
                onClick={() => { setActiveModule(mod); window.scrollTo(0, 0); }}
                style={{ background: "#1e293b", border: `1px solid ${locked ? "#1e293b" : "#334155"}`, borderRadius: 24, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = mod.color + "50"; e.currentTarget.style.boxShadow = `0 8px 32px ${mod.color}12`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = locked ? "#1e293b" : "#334155"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Coloured top bar */}
                <div style={{ height: 4, background: locked ? "#334155" : `linear-gradient(90deg, ${mod.color}, ${mod.color}60)` }} />

                <div style={{ padding: isMobile ? "24px 20px" : "32px 40px", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  {/* Module number */}
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: mod.color + "20", border: `2px solid ${mod.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: mod.color }}>{mod.number}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                      <div style={{ background: mod.color + "20", border: `1px solid ${mod.color}40`, borderRadius: 6, padding: "2px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: mod.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>Module {mod.number}</span>
                      </div>
                      {locked && (
                        <div style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 6, padding: "2px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 10 }}>🔒</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#a855f7" }}>Pro</span>
                        </div>
                      )}
                      {mod.free && (
                        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, padding: "2px 10px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>Free</span>
                        </div>
                      )}
                      <span style={{ fontSize: 12, color: "#475569" }}>{mod.lessons.length} lessons</span>
                    </div>
                    <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: -0.3 }}>{mod.title}</h2>
                    <p style={{ fontSize: 15, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{mod.description}</p>
                  </div>

                  {/* Lesson list preview */}
                  <div style={{ flexShrink: 0, width: isMobile ? "100%" : 280 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {mod.lessons.map((lesson, i) => {
                        const lessonLocked = !lesson.free && !isUserPro;
                        return (
                          <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: lessonLocked ? "#1e293b" : mod.color + "20",
                              border: `1.5px solid ${lessonLocked ? "#334155" : mod.color + "50"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, lineHeight: 1,
                            }}>
                              {lessonLocked
                                ? <span style={{ fontSize: 9, lineHeight: 1 }}>🔒</span>
                                : <span style={{ fontSize: 11, fontWeight: 800, color: mod.color, lineHeight: 1 }}>{i + 1}</span>
                              }
                            </div>
                            <span style={{ fontSize: 13, color: lessonLocked ? "#334155" : "#94a3b8", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>{lesson.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 40, background: "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(124,58,237,0.06) 100%)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 20, padding: isMobile ? "28px 24px" : "36px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Modules 2–5 are Pro</h3>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0, maxWidth: 440 }}>Python from scratch, coding real strategies, C++ and why it matters, feature engineering, and walk-forward validation — the full technical stack.</p>
          </div>
          <button onClick={() => navigate("/pricing")} style={{ padding: "13px 32px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(168,85,247,0.3)" }}>
            Unlock All Modules →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Course;
