import { useState } from "react";
import Navbar from "./Navbar";
import { useWindowSize } from "./useWindowSize";

// ─── Math helpers ─────────────────────────────────────────────────────────────
function Frac({ top, bot, color = "#818cf8", size = 15 }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 4px", gap: 1 }}>
      <span style={{ color, fontWeight: 800, fontSize: size, lineHeight: 1 }}>{top}</span>
      <span style={{ display: "block", width: "100%", minWidth: 14, height: 2, background: color, borderRadius: 1 }} />
      <span style={{ color, fontWeight: 800, fontSize: size, lineHeight: 1 }}>{bot}</span>
    </span>
  );
}
function Sup({ children, color = "#818cf8" }) {
  return <sup style={{ color, fontWeight: 800, fontSize: "0.75em", verticalAlign: "super" }}>{children}</sup>;
}
function MathSpan({ children, color = "#818cf8" }) {
  return <span style={{ color, fontWeight: 800 }}>{children}</span>;
}

const PUZZLES = [
  {
    id: 1, difficulty: "Easy", emoji: "🪙",
    title: "The Coin Flip",
    question: "You flip a fair coin over and over until you get heads. What is the expected number of flips?",
    hint: <span>Expected value of a geometric distribution: <Frac top="1" bot="p" color="#818cf8"/> where p = probability of success each flip.</span>,
    answer: "2 flips",
    explanation: [
      <span>E[flips] = <Frac top="1" bot="p" color="#4ade80"/> = <Frac top="1" bot="0.5" color="#4ade80"/> = <MathSpan color="#4ade80">2</MathSpan></span>,
      "Flip 1 → heads with prob ½. Flip 2 → prob ¼. Flip 3 → ⅛. And so on.",
      "Each term contributes exactly $1 to the weighted average — so the expected number of flips is 2.",
    ],
  },
  {
    id: 2, difficulty: "Easy", emoji: "💵",
    title: "The Missing Dollar",
    question: "Three friends split a $30 hotel bill — $10 each. The clerk realizes it was only $25 and sends $5 back with the bellboy. The bellboy keeps $2 and gives $1 back to each friend. Now each paid $9, totalling $27. Plus the $2 the bellboy kept = $29. Where is the missing dollar?",
    hint: <span>Track where every dollar physically went: <MathSpan color="#818cf8">hotel + bellboy + refunded = $30</MathSpan>. The trick is in how the puzzle adds things together.</span>,
    answer: "There is no missing dollar.",
    explanation: [
      <span>Friends paid <MathSpan color="#4ade80">$27</MathSpan> total: <MathSpan color="#4ade80">$25</MathSpan> to hotel + <MathSpan color="#4ade80">$2</MathSpan> to bellboy.</span>,
      "The puzzle adds the $2 instead of subtracting it — that is the sleight of hand.",
      <span><MathSpan color="#4ade80">$30</MathSpan> = $25 (hotel) + $3 (refunded) + $2 (bellboy). Nothing is missing.</span>,
    ],
  },
  {
    id: 3, difficulty: "Easy", emoji: "🚗",
    title: "Monty Hall",
    question: "You're on a game show. There are 3 doors — behind one is a car, behind the others are goats. You pick door 1. The host opens door 3 to reveal a goat. He asks: do you switch to door 2 or stay with door 1? What should you do?",
    hint: <span>Your door has <Frac top="1" bot="3" color="#818cf8"/> chance. The other two doors together have <Frac top="2" bot="3" color="#818cf8"/> chance.</span>,
    answer: "Always switch. Switching wins 2/3 of the time.",
    explanation: [
      <span>Your pick: <Frac top="1" bot="3" color="#4ade80"/> chance of being right.</span>,
      <span>The other two doors together: <Frac top="2" bot="3" color="#4ade80"/> chance of having the car.</span>,
      <span>Host reveals a goat — that <Frac top="2" bot="3" color="#4ade80"/> collapses onto the one remaining door.</span>,
      <span>Switching = <Frac top="2" bot="3" color="#4ade80"/>. Staying = <Frac top="1" bot="3" color="#4ade80"/>. Switch every time.</span>,
    ],
  },
  {
    id: 4, difficulty: "Easy", emoji: "🎂",
    title: "The Birthday Problem",
    question: "How many people need to be in a room before there's a greater than 50% chance that two of them share the same birthday?",
    hint: <span>Easier backwards: <MathSpan color="#818cf8">P(match) = 1 − P(no match at all)</MathSpan>. Calculate the chance nobody shares, then subtract from 1.</span>,
    answer: "Just 23 people.",
    explanation: [
      "Most people guess ~183. They are thinking about their own birthday, not any pair.",
      "With 23 people there are 253 unique pairs — each pair is an independent shot at a match.",
      <span>P(no match) ≈ <MathSpan color="#4ade80">49.3%</MathSpan> → P(match) = 1 − 0.493 = <MathSpan color="#4ade80">50.7%</MathSpan></span>,
      "Pairs grow quadratically. People grow linearly. That is why 23 works.",
    ],
  },
  {
    id: 5, difficulty: "Easy", emoji: "✉️",
    title: "Two Envelopes",
    question: "Two envelopes sit on a table. One contains twice as much money as the other. You pick one and open it — it has $100. Should you switch to the other envelope?",
    hint: <span>Expected value: <MathSpan color="#818cf8">E = p₁ × value₁ + p₂ × value₂</MathSpan> — but only if you actually know the probabilities p₁ and p₂.</span>,
    answer: "It doesn't matter — but the naive argument for switching is wrong.",
    explanation: [
      "Naive: other envelope is $50 or $200, average = $125 > $100 → switch.",
      "Flaw: that assumes $50 and $200 are equally likely. You have no basis for that.",
      "Without knowing how the amounts were chosen, you cannot assign probabilities.",
      "No edge from switching.",
    ],
  },
  {
    id: 6, difficulty: "Medium", emoji: "🔫",
    title: "Russian Roulette",
    question: "A revolver has 6 chambers. Two bullets are loaded in adjacent chambers. One shot is fired — no bullet. The cylinder is not re-spun. Would you rather spin the cylinder and shoot, or just pull the trigger again?",
    hint: <span>P(bullet) = <Frac top="bullets remaining" bot="chambers remaining" color="#818cf8"/>. Calculate this for both choices and compare.</span>,
    answer: "Pull the trigger again without spinning.",
    explanation: [
      <span>Not spinning: 4 chambers left, only 1 has a bullet → <Frac top="1" bot="4" color="#fb923c"/> = <MathSpan color="#fb923c">25% risk</MathSpan></span>,
      <span>Spinning: resets to 2 bullets in 6 → <Frac top="2" bot="6" color="#fb923c"/> = <MathSpan color="#fb923c">33.3% risk</MathSpan></span>,
      "Don't spin.",
    ],
  },
  {
    id: 7, difficulty: "Medium", emoji: "🌉",
    title: "The Rope Bridge",
    question: "4 people need to cross a bridge at night with one torch. At most 2 can cross at once and they walk at the slower person's pace. Crossing times: A=1 min, B=2 min, C=5 min, D=10 min. What is the minimum time to get everyone across?",
    hint: <span>The bottleneck is the <MathSpan color="#818cf8">slowest person</MathSpan>. Who should walk with them? And who is the best choice to bring the torch back?</span>,
    answer: "17 minutes.",
    explanation: [
      <span>A+B cross <MathSpan color="#fb923c">(2 min)</MathSpan> → A returns <MathSpan color="#fb923c">(1 min)</MathSpan> = 3 min total</span>,
      <span>C+D cross <MathSpan color="#fb923c">(10 min)</MathSpan> → B returns <MathSpan color="#fb923c">(2 min)</MathSpan> = 15 min total</span>,
      <span>A+B cross <MathSpan color="#fb923c">(2 min)</MathSpan> = <MathSpan color="#fb923c">17 min</MathSpan> total</span>,
      "Key: C and D cross together — the worst-case crossing only happens once.",
    ],
  },
  {
    id: 8, difficulty: "Medium", emoji: "☠️",
    title: "The Pirate Vote",
    question: "5 pirates rank 1–5 by seniority and must divide 100 gold coins. The most senior proposes a split — majority vote wins (ties favor the proposer). If rejected, that pirate is thrown overboard. All are perfectly rational: survival > gold > mischief. What does pirate 1 propose?",
    hint: <span>Use <MathSpan color="#818cf8">backward induction</MathSpan>: solve for just 2 pirates first, then 3, then 4, then 5. Each answer feeds into the next.</span>,
    answer: "Pirate 1 keeps 98, gives 1 to pirate 3, gives 1 to pirate 5.",
    explanation: [
      "2 pirates: Pirate 4 takes all 100.",
      "3 pirates: Pirate 3 gives Pirate 5 one coin (beats 0) → passes 2-1.",
      "4 pirates: Pirate 2 gives Pirate 4 one coin (beats 0) → tie = proposer wins.",
      "5 pirates: Pirate 1 gives 1 coin each to #3 and #5 — both get 0 under Pirate 2.",
      <span>Pirate 1 keeps <MathSpan color="#fb923c">98</MathSpan>. Pirates 1, 3, 5 vote yes.</span>,
    ],
  },
  {
    id: 9, difficulty: "Medium", emoji: "🎩",
    title: "The Three Hats",
    question: "Three players each wear a red or blue hat chosen randomly. They can see each other's hats but not their own. Simultaneously, each either guesses their own color or passes. The team wins if at least one guess is correct and nobody guesses wrong. What strategy wins more than 50% of the time?",
    hint: <span>There are 2³ = <MathSpan color="#818cf8">8</MathSpan> equally likely hat combinations. Try to design a strategy that wins at least 6 of them.</span>,
    answer: "The team can win 75% of the time.",
    explanation: [
      "Strategy: if you see two same-colored hats → guess the opposite. If you see mixed → pass.",
      <span>Fails only when all 3 hats are the same (RRR or BBB) → <MathSpan color="#fb923c">2 out of 8</MathSpan> outcomes.</span>,
      <span>Wins in the other 6 cases → <Frac top="6" bot="8" color="#fb923c"/> = <MathSpan color="#fb923c">75%</MathSpan></span>,
    ],
  },
  {
    id: 10, difficulty: "Medium", emoji: "🔥",
    title: "The Rope Burning",
    question: "You have two ropes and a lighter. Each rope burns in exactly 60 minutes, but not uniformly — some sections burn faster or slower. How do you measure exactly 45 minutes?",
    hint: <span>Burning from <MathSpan color="#818cf8">both ends simultaneously</MathSpan> halves the time: 60 ÷ 2 = 30 min, regardless of how unevenly it burns.</span>,
    answer: "Light rope 1 from both ends and rope 2 from one end simultaneously.",
    explanation: [
      "t = 0: light Rope 1 from both ends + Rope 2 from one end.",
      <span>t = 30 min: Rope 1 burns out. Light Rope 2's other end → <MathSpan color="#fb923c">15 min</MathSpan> remaining.</span>,
      <span>t = 45 min: done. <MathSpan color="#fb923c">30 + 15 = 45</MathSpan>.</span>,
    ],
  },
  {
    id: 11, difficulty: "Medium", emoji: "🛗",
    title: "The Elevator Paradox",
    question: "You live on the 10th floor of a 20-story building. Every time you want to go down, the elevator arrives going up. Every time you want to go up, it arrives going down. Is this just bad luck — or is there a mathematical reason?",
    hint: <span>Count floors above vs below you. Floor 10 of 20: <MathSpan color="#818cf8">10 floors above, 9 floors below</MathSpan>. Which direction is the elevator more likely heading?</span>,
    answer: "There is a mathematical reason — it's not bad luck.",
    explanation: [
      "The elevator spends most of its time traversing the large middle section of the building.",
      <span>At floor 10: <MathSpan color="#fb923c">10 floors above</MathSpan>, only <MathSpan color="#fb923c">9 floors below</MathSpan>.</span>,
      "It is more likely to be heading upward when it passes your floor — pure math.",
      "Live on the top floor and you would only ever see it arrive going down.",
    ],
  },
  {
    id: 12, difficulty: "Medium", emoji: "📦",
    title: "100 Prisoners",
    question: "100 prisoners numbered 1–100. The warden puts 100 numbered slips randomly into 100 numbered boxes. Each prisoner can open 50 boxes looking for their own number. If all find their number, everyone goes free. What strategy gives the best odds?",
    hint: <span>Think in <MathSpan color="#818cf8">cycles</MathSpan>: box 7 might contain slip 23, which might lead back to 7. Following this chain guarantees you find your own number if the cycle is ≤ 50.</span>,
    answer: "The loop strategy — each prisoner follows the chain of numbers.",
    explanation: [
      "Each prisoner: open the box numbered like you, then follow slips like a chain.",
      <span>Fails only if a cycle is longer than 50 → <MathSpan color="#fb923c">~31%</MathSpan> chance of failure.</span>,
      <span>Team wins <MathSpan color="#fb923c">~69%</MathSpan> of the time.</span>,
      <span>Any independent strategy: team wins <Frac top="1" bot="2¹⁰⁰" color="#fb923c"/> ≈ 0%. The loop links everyone's fate.</span>,
    ],
  },
  {
    id: 13, difficulty: "Hard", emoji: "👁️",
    title: "The Blue Eyes Problem",
    question: "On an island, 100 people have blue eyes and 100 have brown eyes. No one discusses eye colors. A visitor publicly says: 'I see at least one person with blue eyes.' Everyone is perfectly logical and can see all other eye colors but not their own. What happens?",
    hint: <span>Use <MathSpan color="#818cf8">induction</MathSpan>: what happens with n = 1 blue-eyed person? Then n = 2? Then n = 3? The pattern will reveal itself.</span>,
    answer: "On day 100, all 100 blue-eyed people simultaneously leave the island.",
    explanation: [
      <span>n = 1: sees no others with blue eyes → must be me → leaves <MathSpan color="#f87171">day 1</MathSpan>.</span>,
      <span>n = 2: each sees 1 other. If they don't leave day 1, I must also have blue eyes → both leave <MathSpan color="#f87171">day 2</MathSpan>.</span>,
      <span>n people → all leave <MathSpan color="#f87171">day n</MathSpan>. So 100 people leave day 100.</span>,
      "The announcement created common knowledge — everyone knows that everyone knows, infinitely deep.",
    ],
  },
  {
    id: 14, difficulty: "Hard", emoji: "📋",
    title: "The Secretary Problem",
    question: "You must hire the best of N candidates who arrive in random order. Interview each and immediately accept or reject — no going back. What strategy maximizes your probability of picking the very best candidate?",
    hint: <span>The optimal stopping point is at <Frac top="N" bot="e" color="#818cf8"/> candidates, where e ≈ 2.718. Reject everyone before that threshold, then hire the next best.</span>,
    answer: "Reject the first 37% of candidates, then hire the next one better than all previous.",
    explanation: [
      <span>Phase 1: reject the first <Frac top="N" bot="e" color="#f87171"/> ≈ <MathSpan color="#f87171">37%</MathSpan> — interview all, hire nobody, set benchmark.</span>,
      "Phase 2: hire the first candidate who beats that benchmark.",
      <span>Success probability: <Frac top="1" bot="e" color="#f87171"/> ≈ <MathSpan color="#f87171">36.8%</MathSpan> — the mathematical maximum, for any N.</span>,
      "Used in hiring, housing search, and algorithmic trading.",
    ],
  },
  {
    id: 15, difficulty: "Hard", emoji: "♾️",
    title: "St. Petersburg Paradox",
    question: "A casino offers a game: flip a coin until tails. Tails on flip 1 = win $2, flip 2 = win $4, flip 3 = win $8 — doubling each time. The expected value is mathematically infinite. How much would you actually pay to play?",
    hint: <span>E[X] = <Frac top="1" bot="2" color="#818cf8"/>·$2 + <Frac top="1" bot="4" color="#818cf8"/>·$4 + <Frac top="1" bot="8" color="#818cf8"/>·$8 + … (each term equals $1, and there are infinitely many)</span>,
    answer: "Expected value = ∞. Most people wouldn't pay more than $20.",
    explanation: [
      <span>E[X] = <Frac top="1" bot="2" color="#f87171"/>·$2 + <Frac top="1" bot="4" color="#f87171"/>·$4 + <Frac top="1" bot="8" color="#f87171"/>·$8 + … = $1 + $1 + $1 + … = <MathSpan color="#f87171">∞</MathSpan></span>,
      "The math says pay anything. Real people cap at ~$20.",
      "Resolution: people maximize utility, not raw cash.",
      "Utility of money is concave — doubling your wealth does not double your happiness.",
    ],
  },
  {
    id: 16, difficulty: "Hard", emoji: "🚪",
    title: "1,000 Doors",
    question: "Now there are 1,000 doors — one has a car, 999 have goats. You pick door 1. The host opens 998 doors, all showing goats, and offers to let you switch to the one remaining door. What are the odds for each door?",
    hint: <span>Your pick: <Frac top="1" bot="1,000" color="#818cf8"/> chance. All other doors together: <Frac top="999" bot="1,000" color="#818cf8"/> chance. Same logic as Monty Hall.</span>,
    answer: "Your door: 1/1,000. The other door: 999/1,000.",
    explanation: [
      <span>Your door from the start: <Frac top="1" bot="1,000" color="#f87171"/> chance.</span>,
      <span>All other 999 doors combined: <Frac top="999" bot="1,000" color="#f87171"/> chance.</span>,
      <span>Host eliminates 998 goats → that <Frac top="999" bot="1,000" color="#f87171"/> concentrates onto one door.</span>,
      "Monty Hall scaled up to make the intuition impossible to argue with.",
    ],
  },
  {
    id: 17, difficulty: "Hard", emoji: "📈",
    title: "The Martingale Trap",
    question: "You bet $1 on a fair coin flip. If you lose, you double your bet and play again. You keep doubling until you win. Is this a guaranteed money-making strategy? What goes wrong?",
    hint: <span>After k losses, your next bet = <MathSpan color="#818cf8">2<Sup color="#818cf8">k</Sup> dollars</MathSpan>. Try calculating what 2<Sup>30</Sup> equals.</span>,
    answer: "It works in theory. It fails catastrophically in practice.",
    explanation: [
      "In theory: you must eventually win, netting +$1 each run.",
      <span>After 30 losses: next bet = 2<Sup color="#f87171">30</Sup> = <MathSpan color="#f87171">$1,073,741,824</MathSpan>.</span>,
      "Casinos have table limits. You have a finite bankroll.",
      "Expected value = 0. You trade frequent tiny wins for rare total ruin.",
    ],
  },
  {
    id: 18, difficulty: "Hard", emoji: "😴",
    title: "The Sleeping Beauty Problem",
    question: "Sleeping Beauty is put to sleep Sunday. A coin is flipped: heads = woken once Monday; tails = woken Monday and Tuesday (memory wiped between). She wakes up. What probability should she assign to heads?",
    hint: <span>List every situation she could wake up in: <MathSpan color="#818cf8">Mon+Heads, Mon+Tails, Tue+Tails</MathSpan>. Are these three states equally likely from her perspective?</span>,
    answer: "Genuinely contested. Both 1/2 and 1/3 are defensible.",
    explanation: [
      <span>Halfer: coin is fair, waking up gave no new info → P(heads) = <Frac top="1" bot="2" color="#f87171"/></span>,
      <span>Thirder: 3 equally likely wake-up states → P(heads) = <Frac top="1" bot="3" color="#f87171"/></span>,
      "Both positions are defensible. Philosophers and mathematicians genuinely disagree.",
      "Connects to self-locating uncertainty in AI and decision theory.",
    ],
  },
  {
    id: 19, difficulty: "Hard", emoji: "⚖️",
    title: "Prisoner's Dilemma",
    question: "Two suspects are arrested. Betray = other gets 3 years, you go free. Stay silent = if both silent, 1 year each; if both betray, 2 years each. You can't communicate. What should you rationally do — and what actually happens?",
    hint: <span>Build a <MathSpan color="#818cf8">payoff table</MathSpan>: "If they betray, my best move is ___. If they stay silent, my best move is ___." Do both answers point the same way?</span>,
    answer: "Rationally: betray. Collectively: both end up worse.",
    explanation: [
      "If they betray: stay silent → 3 years. Betray → 2 years. Betraying is better.",
      "If they stay silent: stay silent → 1 year. Betray → 0 years. Betraying is still better.",
      "Betraying wins in every scenario — called a dominant strategy.",
      <span>Both betray → <MathSpan color="#f87171">2 years each</MathSpan>. Mutual silence → <MathSpan color="#f87171">1 year each</MathSpan>. Rational logic → worse outcome.</span>,
      "Fix: repeated games + Tit-for-Tat (cooperate first, then mirror them).",
    ],
  },
  {
    id: 20, difficulty: "Hard", emoji: "🪢",
    title: "The Unexpected Hanging",
    question: "A judge tells a prisoner: 'You'll be hanged on one day next week — Monday through Friday. You won't know which day until that morning.' The prisoner argues logically that the hanging is impossible. He's hanged Wednesday as a complete surprise. Where does his reasoning break down?",
    hint: <span>Work <MathSpan color="#818cf8">backwards</MathSpan>: could it happen on Friday? If not, eliminate it. Then Thursday? Keep going — and watch what goes wrong at the end.</span>,
    answer: "The inductive argument collapses at a self-referential step.",
    explanation: [
      "Prisoner: can't be Friday (he'd know Thursday night). So not Thursday... so not any day.",
      "He concludes the hanging is impossible. Wednesday arrives as a shock.",
      "Flaw: the argument uses the judge's statement as a premise while simultaneously disproving it.",
      "It's a self-referential paradox — like 'this sentence is false'.",
      "Connects to Gödel's incompleteness theorems.",
    ],
  },
];
const DIFF = {
  Easy:   { color: "#4ade80", glow: "rgba(74,222,128,0.2)",   bg: "rgba(74,222,128,0.08)",   border: "rgba(74,222,128,0.3)" },
  Medium: { color: "#fb923c", glow: "rgba(251,146,60,0.2)",   bg: "rgba(251,146,60,0.08)",   border: "rgba(251,146,60,0.3)" },
  Hard:   { color: "#f87171", glow: "rgba(248,113,113,0.2)",  bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.3)" },
};

// ─── SVG Illustrations ────────────────────────────────────────────────────────
function Illustration({ id }) {
  const style = { width: "100%", maxWidth: 360, display: "block", margin: "0 auto" };

  const ills = {
    1: ( // Coin Flip
      <svg viewBox="0 0 320 200" style={style}>
        <defs>
          <radialGradient id="coinGrad" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#fde68a"/>
            <stop offset="100%" stopColor="#d97706"/>
          </radialGradient>
        </defs>
        <ellipse cx="160" cy="110" rx="60" ry="8" fill="rgba(0,0,0,0.2)"/>
        <circle cx="160" cy="90" r="58" fill="url(#coinGrad)" stroke="#f59e0b" strokeWidth="3"/>
        <circle cx="160" cy="90" r="50" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3"/>
        <text x="160" y="82" textAnchor="middle" fontSize="22" fontWeight="900" fill="#92400e">H</text>
        <text x="160" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="#b45309">HEADS</text>
        {[0,60,120,180,240,300].map((a,i) => (
          <circle key={i} cx={160+78*Math.cos(a*Math.PI/180)} cy={90+78*Math.sin(a*Math.PI/180)} r="5" fill={i%2===0?"#fbbf24":"#f59e0b"} opacity="0.6"/>
        ))}
        <text x="50" y="170" textAnchor="middle" fontSize="13" fontWeight="800" fill="#94a3b8">½</text>
        <text x="160" y="180" textAnchor="middle" fontSize="12" fill="#64748b">+</text>
        <text x="270" y="170" textAnchor="middle" fontSize="13" fontWeight="800" fill="#94a3b8">¼</text>
        <text x="160" y="192" textAnchor="middle" fontSize="11" fill="#475569">+ ⅛ + ¹⁄₁₆ + … = 2</text>
      </svg>
    ),
    2: ( // Missing Dollar
      <svg viewBox="0 0 320 200" style={style}>
        <rect x="80" y="20" width="160" height="110" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        <rect x="90" y="30" width="140" height="25" rx="4" fill="#0f172a"/>
        <text x="160" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0ea5e9">GRAND HOTEL</text>
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <rect key={i} x={96+(i%3)*46} y={65+(Math.floor(i/3))*28} width="36" height="20" rx="3"
            fill={i===4?"#fbbf24":"#334155"} stroke={i===4?"#f59e0b":"#1e293b"} strokeWidth="1"/>
        ))}
        <text x="114" y="79" textAnchor="middle" fontSize="10" fill="#94a3b8">🛏</text>
        <text x="160" y="79" textAnchor="middle" fontSize="10" fill="#fde68a">🛏</text>
        <text x="206" y="79" textAnchor="middle" fontSize="10" fill="#94a3b8">🛏</text>
        {["$10","$10","$10"].map((v,i) => (
          <text key={i} x={52+i*108} y={155} textAnchor="middle" fontSize="14" fontWeight="800" fill="#22c55e">{v}</text>
        ))}
        <text x="160" y="175" textAnchor="middle" fontSize="11" fill="#64748b">three friends each paid…</text>
        <text x="264" y="140" textAnchor="middle" fontSize="20">🤵</text>
        <text x="264" y="158" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700">kept $2</text>
      </svg>
    ),
    3: ( // Monty Hall
      <svg viewBox="0 0 320 200" style={style}>
        {[0,1,2].map(i => {
          const x = 40 + i * 95;
          const isOpen = i === 2;
          return (
            <g key={i}>
              <rect x={x} y="30" width="72" height="120" rx="6"
                fill={isOpen ? "#0f172a" : i===0 ? "#1d4ed8" : "#7c3aed"}
                stroke={isOpen ? "#334155" : i===0 ? "#3b82f6" : "#8b5cf6"} strokeWidth="2"/>
              {!isOpen && <>
                <rect x={x+28} y="75" width="16" height="20" rx="8" fill="rgba(255,255,255,0.2)"/>
                <text x={x+36} y="50" textAnchor="middle" fontSize="20" fontWeight="900" fill="rgba(255,255,255,0.8)">
                  {i===0?"1":"2"}
                </text>
              </>}
              {isOpen && <>
                <text x={x+36} y="100" textAnchor="middle" fontSize="32">🐐</text>
                <text x={x+36} y="130" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700">GOAT</text>
              </>}
            </g>
          );
        })}
        <text x="76" y="170" textAnchor="middle" fontSize="11" fill="#94a3b8">your pick</text>
        <text x="171" y="170" textAnchor="middle" fontSize="11" fill="#22c55e" fontWeight="700">switch?</text>
        <path d="M 155 155 L 171 148 L 187 155" fill="none" stroke="#22c55e" strokeWidth="2"/>
      </svg>
    ),
    4: ( // Birthday Problem
      <svg viewBox="0 0 320 200" style={style}>
        {Array.from({length:23}).map((_,i) => {
          const angle = (i/23)*2*Math.PI - Math.PI/2;
          const cx = 160 + 80*Math.cos(angle);
          const cy = 100 + 70*Math.sin(angle);
          const colors = ["#f87171","#fb923c","#fbbf24","#4ade80","#38bdf8","#818cf8","#e879f9"];
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="10" fill={colors[i%7]} opacity="0.85"/>
              <text x={cx} y={cy+4} textAnchor="middle" fontSize="9" fill="#0f172a" fontWeight="800">{i+1}</text>
            </g>
          );
        })}
        <circle cx="160" cy="100" r="38" fill="rgba(217,70,239,0.08)" stroke="rgba(217,70,239,0.3)" strokeWidth="1.5" strokeDasharray="5 4"/>
        <text x="160" y="97" textAnchor="middle" fontSize="12" fontWeight="800" fill="#d946ef">23</text>
        <text x="160" y="112" textAnchor="middle" fontSize="9" fill="#a855f7">people</text>
        <text x="160" y="185" textAnchor="middle" fontSize="11" fill="#64748b">50%+ chance two share a birthday</text>
      </svg>
    ),
    5: ( // Two Envelopes
      <svg viewBox="0 0 320 200" style={style}>
        <g transform="translate(55,50)">
          <rect width="90" height="65" rx="6" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2"/>
          <path d="M0,0 L45,35 L90,0" fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <text x="45" y="48" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fbbf24">$100</text>
          <text x="45" y="82" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="700">OPENED</text>
        </g>
        <text x="160" y="100" textAnchor="middle" fontSize="22" fill="#475569">or</text>
        <g transform="translate(175,50)">
          <rect width="90" height="65" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
          <path d="M0,0 L45,32 L90,0" fill="none" stroke="#475569" strokeWidth="2"/>
          <path d="M0,65 L45,32" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 3"/>
          <path d="M90,65 L45,32" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 3"/>
          <text x="45" y="48" textAnchor="middle" fontSize="18" fontWeight="900" fill="#64748b">?</text>
          <text x="45" y="82" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="700">SEALED</text>
        </g>
        <text x="100" y="145" textAnchor="middle" fontSize="11" fill="#94a3b8">$50 or $200?</text>
        <text x="220" y="145" textAnchor="middle" fontSize="22">🤔</text>
        <text x="160" y="178" textAnchor="middle" fontSize="11" fill="#64748b">Does switching help?</text>
      </svg>
    ),
    6: ( // Russian Roulette
      <svg viewBox="0 0 320 200" style={style}>
        <circle cx="160" cy="100" r="65" fill="#1e293b" stroke="#334155" strokeWidth="3"/>
        <circle cx="160" cy="100" r="45" fill="#0f172a" stroke="#1e293b" strokeWidth="2"/>
        {[0,1,2,3,4,5].map(i => {
          const a = (i/6)*2*Math.PI - Math.PI/2;
          const cx2 = 160 + 45*Math.cos(a);
          const cy2 = 100 + 45*Math.sin(a);
          const hasBullet = i===1||i===2;
          return (
            <g key={i}>
              <circle cx={cx2} cy={cy2} r="11" fill={hasBullet?"#dc2626":"#334155"} stroke={hasBullet?"#ef4444":"#475569"} strokeWidth="1.5"/>
              {hasBullet && <circle cx={cx2} cy={cy2} r="5" fill="#fca5a5"/>}
              {!hasBullet && i===0 && <text x={cx2} y={cy2+4} textAnchor="middle" fontSize="8" fill="#22c55e" fontWeight="800">✓</text>}
            </g>
          );
        })}
        <circle cx="160" cy="100" r="8" fill="#475569"/>
        <text x="160" y="185" textAnchor="middle" fontSize="11" fill="#64748b">Spin again, or just pull?</text>
        <text x="52" y="108" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700">💥</text>
        <text x="268" y="108" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700">💥</text>
      </svg>
    ),
    7: ( // Rope Bridge
      <svg viewBox="0 0 320 200" style={style}>
        <rect x="0" y="130" width="80" height="70" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        <rect x="240" y="130" width="80" height="70" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        <path d="M80,150 Q160,120 240,150" fill="none" stroke="#92400e" strokeWidth="3"/>
        <path d="M80,160 Q160,130 240,160" fill="none" stroke="#78350f" strokeWidth="3"/>
        {Array.from({length:9}).map((_,i) => (
          <line key={i} x1={90+i*18} y1={150+i*0.5-4} x2={90+i*18} y2={162+i*0.5-4} stroke="#92400e" strokeWidth="2"/>
        ))}
        <circle cx="40" cy="120" r="8" fill="#fb923c"/>
        <circle cx="55" cy="120" r="8" fill="#4ade80"/>
        <circle cx="270" cy="120" r="8" fill="#f87171"/>
        <circle cx="285" cy="120" r="8" fill="#818cf8"/>
        <text x="40" y="145" textAnchor="middle" fontSize="8" fill="#fb923c" fontWeight="800">1m</text>
        <text x="55" y="145" textAnchor="middle" fontSize="8" fill="#4ade80" fontWeight="800">2m</text>
        <text x="270" y="145" textAnchor="middle" fontSize="8" fill="#f87171" fontWeight="800">5m</text>
        <text x="285" y="145" textAnchor="middle" fontSize="8" fill="#818cf8" fontWeight="800">10m</text>
        <text x="160" y="110" textAnchor="middle" fontSize="18">🔦</text>
        <text x="160" y="185" textAnchor="middle" fontSize="11" fill="#64748b">One torch, one way across</text>
      </svg>
    ),
    8: ( // Pirates
      <svg viewBox="0 0 320 200" style={style}>
        <path d="M40,160 Q160,120 280,160 L280,185 Q160,175 40,185 Z" fill="#1e3a5f" stroke="#1d4ed8" strokeWidth="1.5"/>
        <path d="M120,80 L120,158" stroke="#78350f" strokeWidth="4"/>
        <path d="M120,80 L195,100 L120,120" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.5"/>
        <text x="155" y="115" textAnchor="middle" fontSize="14">☠️</text>
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <circle cx={60+i*48} cy={148} r="11" fill={i===0?"#fbbf24":"#475569"} stroke={i===0?"#f59e0b":"#334155"} strokeWidth="1.5"/>
            <text x={60+i*48} y={152} textAnchor="middle" fontSize="9" fontWeight="800" fill={i===0?"#92400e":"#94a3b8"}>P{i+1}</text>
          </g>
        ))}
        <text x="60" y="175" textAnchor="middle" fontSize="9" fill="#fbbf24" fontWeight="700">98🪙</text>
        <text x="204" y="175" textAnchor="middle" fontSize="9" fill="#94a3b8">1🪙</text>
        <text x="252" y="175" textAnchor="middle" fontSize="9" fill="#94a3b8">1🪙</text>
        <text x="160" y="40" textAnchor="middle" fontSize="11" fill="#64748b">Who gets what?</text>
      </svg>
    ),
    9: ( // Three Hats
      <svg viewBox="0 0 320 200" style={style}>
        {[{x:80,hat:"#ef4444",label:"Red"},{x:160,hat:"#3b82f6",label:"Blue"},{x:240,hat:"#ef4444",label:"Red"}].map((p,i) => (
          <g key={i}>
            <circle cx={p.x} cy={130} r="18" fill="#334155" stroke="#475569" strokeWidth="2"/>
            <text x={p.x} y={135} textAnchor="middle" fontSize="18">😐</text>
            <polygon points={`${p.x-18},108 ${p.x+18},108 ${p.x},72`} fill={p.hat} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5"/>
            <rect x={p.x-20} y="108" width="40" height="6" rx="2" fill={p.hat} opacity="0.7"/>
            <text x={p.x} y={165} textAnchor="middle" fontSize="9" fill="#94a3b8">{p.label}</text>
            <text x={p.x} y={58} textAnchor="middle" fontSize="9" fill="#64748b">?</text>
          </g>
        ))}
        <path d="M 100 130 Q 160 100 220 130" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 3"/>
        <text x="160" y="188" textAnchor="middle" fontSize="11" fill="#64748b">Each can see the others — not their own</text>
      </svg>
    ),
    10: ( // Rope Burning
      <svg viewBox="0 0 320 200" style={style}>
        <path d="M30,90 Q80,70 130,90 Q180,110 230,90 Q270,75 300,90" fill="none" stroke="#78350f" strokeWidth="6" strokeLinecap="round"/>
        <path d="M30,90 Q80,70 130,90 Q180,110 230,90 Q270,75 300,90" fill="none" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
        {[30,70,110,150,190,230,270].map((x,i) => (
          <g key={i}>
            <ellipse cx={x} cy={82+Math.sin(i)*8} rx="6" ry="14" fill="#f97316" opacity={0.6+Math.random()*0.3}/>
            <ellipse cx={x} cy={75+Math.sin(i)*8} rx="4" ry="9" fill="#fbbf24" opacity="0.8"/>
          </g>
        ))}
        <text x="30" y="130" textAnchor="middle" fontSize="20">🔥</text>
        <text x="300" y="130" textAnchor="middle" fontSize="20">🔥</text>
        <text x="165" y="155" textAnchor="middle" fontSize="11" fill="#f97316" fontWeight="700">Rope 1 — lit from both ends</text>
        <path d="M30,175 Q165,165 300,175" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round"/>
        <text x="30" y="195" textAnchor="middle" fontSize="20">🔥</text>
        <text x="165" y="192" textAnchor="middle" fontSize="9" fill="#64748b">Rope 2 — one end only</text>
      </svg>
    ),
    11: ( // Elevator
      <svg viewBox="0 0 320 200" style={style}>
        <rect x="110" y="10" width="100" height="185" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <rect key={i} x="118" y={15+i*17} width="84" height="14" rx="2"
            fill={i===4?"rgba(14,165,233,0.15)":"#0f172a"}
            stroke={i===4?"rgba(14,165,233,0.4)":"#1e293b"} strokeWidth="1"/>
        ))}
        <text x="160" y="26" textAnchor="middle" fontSize="8" fill="#64748b">10</text>
        <text x="160" y="43" textAnchor="middle" fontSize="8" fill="#64748b">9</text>
        <text x="160" y="60" textAnchor="middle" fontSize="8" fill="#64748b">8</text>
        <text x="160" y="77" textAnchor="middle" fontSize="8" fill="#64748b">7</text>
        <text x="160" y="94" textAnchor="middle" fontSize="8" fill="#0ea5e9" fontWeight="800">← YOU (5)</text>
        <text x="160" y="111" textAnchor="middle" fontSize="8" fill="#64748b">4</text>
        <text x="160" y="128" textAnchor="middle" fontSize="8" fill="#64748b">3</text>
        <text x="160" y="145" textAnchor="middle" fontSize="8" fill="#64748b">2</text>
        <text x="160" y="162" textAnchor="middle" fontSize="8" fill="#64748b">1</text>
        <rect x="134" y="60" width="52" height="34" rx="4" fill="#334155" stroke="#0ea5e9" strokeWidth="1.5"/>
        <text x="160" y="82" textAnchor="middle" fontSize="16">🛗</text>
        <text x="220" y="80" fontSize="12" fill="#f59e0b" fontWeight="800">↑</text>
        <text x="220" y="100" fontSize="9" fill="#64748b">going up</text>
        <text x="220" y="115" fontSize="9" fill="#64748b">again…</text>
        <text x="65" y="88" textAnchor="middle" fontSize="20">😤</text>
      </svg>
    ),
    12: ( // 100 Prisoners
      <svg viewBox="0 0 320 200" style={style}>
        {Array.from({length:25}).map((_,i) => {
          const x = 20 + (i%5)*58;
          const y = 20 + Math.floor(i/5)*34;
          const isSpecial = i===7||i===13;
          return (
            <rect key={i} x={x} y={y} width="44" height="26" rx="5"
              fill={isSpecial?"rgba(14,165,233,0.2)":"#1e293b"}
              stroke={isSpecial?"#0ea5e9":"#334155"} strokeWidth={isSpecial?2:1}/>
          );
        })}
        {Array.from({length:25}).map((_,i) => (
          <text key={i} x={42+(i%5)*58} y={38+Math.floor(i/5)*34} textAnchor="middle"
            fontSize="9" fontWeight={i===7||i===13?"800":"500"}
            fill={i===7||i===13?"#0ea5e9":"#475569"}>
            {i+1}
          </text>
        ))}
        <text x="160" y="188" textAnchor="middle" fontSize="11" fill="#64748b">50 boxes each — what's the strategy?</text>
        <text x="290" y="40" textAnchor="middle" fontSize="22">🔗</text>
        <text x="290" y="60" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontWeight="700">follow</text>
        <text x="290" y="73" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontWeight="700">the loop</text>
      </svg>
    ),
    13: ( // Blue Eyes
      <svg viewBox="0 0 320 200" style={style}>
        <ellipse cx="160" cy="160" rx="130" ry="30" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
        {Array.from({length:12}).map((_,i) => {
          const a = (i/12)*2*Math.PI;
          const cx2 = 160+100*Math.cos(a);
          const cy2 = 100+60*Math.sin(a);
          return (
            <g key={i}>
              <circle cx={cx2} cy={cy2} r="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
              <ellipse cx={cx2} cy={cy2} rx="5" ry="4" fill={i<8?"#3b82f6":"#78350f"}/>
              <ellipse cx={cx2} cy={cy2} rx="2" ry="2" fill="#0f172a"/>
            </g>
          );
        })}
        <text x="160" y="108" textAnchor="middle" fontSize="28">👁️</text>
        <text x="160" y="50" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="700">"I see at least one blue-eyed person"</text>
        <text x="160" y="188" textAnchor="middle" fontSize="11" fill="#64748b">What happens next?</text>
      </svg>
    ),
    14: ( // Secretary Problem
      <svg viewBox="0 0 320 200" style={style}>
        {[0,1,2,3,4,5,6].map(i => {
          const isHired = i===4;
          const isSkip = i<4;
          return (
            <g key={i} transform={`translate(${22+i*42}, 60)`}>
              <circle cx="18" cy="20" r="13"
                fill={isHired?"#22c55e":isSkip?"#334155":"#1e293b"}
                stroke={isHired?"#4ade80":isSkip?"#475569":"#334155"} strokeWidth="1.5"/>
              <text x="18" y="25" textAnchor="middle" fontSize="14">
                {["👩","👨","👩","👦","⭐","👩","👨"][i]}
              </text>
              {isSkip && <text x="18" y="50" textAnchor="middle" fontSize="11" fill="#ef4444">✗</text>}
              {isHired && <text x="18" y="50" textAnchor="middle" fontSize="11" fill="#22c55e">✓</text>}
              <text x="18" y="65" textAnchor="middle" fontSize="8" fill="#64748b">{i+1}</text>
            </g>
          );
        })}
        <rect x="20" y="55" width="118" height="80" rx="6" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 3"/>
        <text x="79" y="150" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700">benchmark (37%)</text>
        <text x="200" y="150" textAnchor="middle" fontSize="9" fill="#22c55e" fontWeight="700">hire first better one</text>
        <text x="160" y="185" textAnchor="middle" fontSize="11" fill="#64748b">Optimal stopping strategy</text>
      </svg>
    ),
    15: ( // St. Petersburg
      <svg viewBox="0 0 320 200" style={style}>
        <rect x="20" y="20" width="130" height="160" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        <text x="85" y="45" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fbbf24">🎰 CASINO</text>
        {[{f:"Tails flip 1",p:"$2"},{f:"Tails flip 2",p:"$4"},{f:"Tails flip 3",p:"$8"},{f:"Tails flip 4",p:"$16"},{f:"Tails flip N",p:"$2ᴺ"}].map((r,i) => (
          <g key={i}>
            <text x="32" y={68+i*26} fontSize="9" fill="#94a3b8">{r.f}</text>
            <text x="145" y={68+i*26} textAnchor="end" fontSize="10" fontWeight="800" fill="#22c55e">{r.p}</text>
          </g>
        ))}
        <text x="85" y="178" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="700">Expected value = ∞</text>
        <text x="230" y="80" textAnchor="middle" fontSize="32" fontWeight="900" fill="#d946ef">∞</text>
        <text x="230" y="110" textAnchor="middle" fontSize="11" fill="#64748b">E[winnings]</text>
        <text x="230" y="140" textAnchor="middle" fontSize="24">🤯</text>
        <text x="230" y="170" textAnchor="middle" fontSize="11" fill="#64748b">How much</text>
        <text x="230" y="185" textAnchor="middle" fontSize="11" fill="#64748b">would YOU pay?</text>
      </svg>
    ),
    16: ( // 1000 Doors
      <svg viewBox="0 0 320 200" style={style}>
        {Array.from({length:18}).map((_,i) => {
          const x = 12 + (i%9)*33;
          const y = i < 9 ? 20 : 100;
          const isYours = i===0;
          const isLeft = i===9;
          const isOpen = i > 0 && i < 9;
          return (
            <g key={i}>
              <rect x={x} y={y} width="26" height="70" rx="3"
                fill={isYours?"rgba(59,130,246,0.25)":isLeft?"rgba(34,197,94,0.2)":isOpen?"#0f172a":"#1e293b"}
                stroke={isYours?"#3b82f6":isLeft?"#22c55e":isOpen?"#1e293b":"#334155"}
                strokeWidth={isYours||isLeft?2:1}/>
              {isOpen && <text x={x+13} y={y+42} textAnchor="middle" fontSize="14">🐐</text>}
              {isYours && <text x={x+13} y={y+42} textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="800">YOU</text>}
              {isLeft && <text x={x+13} y={y+42} textAnchor="middle" fontSize="9" fill="#22c55e" fontWeight="800">?</text>}
            </g>
          );
        })}
        <text x="160" y="185" textAnchor="middle" fontSize="11" fill="#64748b">998 opened — switch or stay?</text>
        <text x="25" y="170" textAnchor="middle" fontSize="9" fill="#3b82f6">1/1000</text>
        <text x="295" y="170" textAnchor="middle" fontSize="9" fill="#22c55e">999/1000</text>
      </svg>
    ),
    17: ( // Martingale
      <svg viewBox="0 0 320 200" style={style}>
        <line x1="30" y1="170" x2="295" y2="170" stroke="#334155" strokeWidth="1.5"/>
        <line x1="30" y1="20" x2="30" y2="170" stroke="#334155" strokeWidth="1.5"/>
        {[{x:50,y:160,v:"$1"},{x:90,y:150,v:"$1"},{x:130,y:140,v:"$1"},{x:170,y:130,v:"$1"},{x:210,y:120,v:"$1"},{x:250,y:30,v:"💥"}].map((p,i) => (
          <g key={i}>
            {i < 5 && <circle cx={p.x} cy={p.y} r="5" fill="#22c55e"/>}
            {i === 5 && <text x={p.x} y={p.y} textAnchor="middle" fontSize="22">💥</text>}
            {i > 0 && i < 5 && <line x1={[50,90,130,170,210][i-1]} y1={[160,150,140,130,120][i-1]} x2={p.x} y2={p.y} stroke="#22c55e" strokeWidth="2"/>}
            {i > 0 && <text x={p.x} y={170+15} textAnchor="middle" fontSize="8" fill="#22c55e">{["Win","Win","Win","Win","Win","Lose x30"][i]}</text>}
            <text x={p.x} y={p.y-10} textAnchor="middle" fontSize="7" fill="#64748b">{p.v}</text>
          </g>
        ))}
        <path d="M210,120 L250,30" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3"/>
        <text x="160" y="12" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700">One bad run → total ruin</text>
        <text x="30" y="185" textAnchor="middle" fontSize="9" fill="#64748b">bets</text>
      </svg>
    ),
    18: ( // Sleeping Beauty
      <svg viewBox="0 0 320 200" style={style}>
        <rect x="60" y="90" width="200" height="80" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        <rect x="60" y="90" width="200" height="30" rx="12" fill="#334155"/>
        <ellipse cx="120" cy="105" rx="25" ry="20" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="120" y="112" textAnchor="middle" fontSize="18">😴</text>
        <text x="160" y="150" textAnchor="middle" fontSize="11" fill="#94a3b8">Sleeping Beauty</text>
        <circle cx="260" cy="40" r="25" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 4"/>
        <text x="260" y="48" textAnchor="middle" fontSize="22">🌙</text>
        <path d="M60,30 L80,55 M100,20 L90,50 M140,15 L120,45" stroke="#818cf8" strokeWidth="1.5" opacity="0.6"/>
        {[{x:70,y:75,d:"Mon"},{x:130,y:75,d:"Tue"},{x:190,y:75,d:"Wed"}].map((d,i) => (
          <g key={i}>
            <rect x={d.x-15} y={d.y-12} width="30" height="18" rx="3" fill={i===0?"rgba(217,70,239,0.15)":"#0f172a"} stroke={i===0?"rgba(217,70,239,0.4)":"#1e293b"} strokeWidth="1"/>
            <text x={d.x} y={d.y} textAnchor="middle" fontSize="8" fill={i===0?"#d946ef":"#334155"} fontWeight="700">{d.d}</text>
          </g>
        ))}
        <text x="160" y="185" textAnchor="middle" fontSize="11" fill="#64748b">P(heads) = 1/2 or 1/3?</text>
      </svg>
    ),
    19: ( // Prisoner's Dilemma
      <svg viewBox="0 0 320 200" style={style}>
        <rect x="20" y="20" width="120" height="150" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        <rect x="180" y="20" width="120" height="150" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
        {Array.from({length:6}).map((_,i) => (
          <line key={i} x1={20+(i%3)*44} y1="20" x2={20+(i%3)*44} y2="170" stroke="#0f172a" strokeWidth="2" opacity="0.8"/>
        ))}
        <text x="80" y="90" textAnchor="middle" fontSize="28">👤</text>
        <text x="240" y="90" textAnchor="middle" fontSize="28">👤</text>
        <text x="80" y="125" textAnchor="middle" fontSize="10" fill="#94a3b8">Suspect A</text>
        <text x="240" y="125" textAnchor="middle" fontSize="10" fill="#94a3b8">Suspect B</text>
        <text x="160" y="60" textAnchor="middle" fontSize="11" fill="#64748b">Betray</text>
        <text x="160" y="80" textAnchor="middle" fontSize="11" fill="#64748b">or</text>
        <text x="160" y="100" textAnchor="middle" fontSize="11" fill="#64748b">Stay</text>
        <text x="160" y="120" textAnchor="middle" fontSize="11" fill="#64748b">Silent?</text>
        <path d="M140,90 L120,90" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arr)"/>
        <path d="M180,90 L200,90" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2"/>
        <text x="160" y="165" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700">No communication allowed</text>
        <text x="160" y="185" textAnchor="middle" fontSize="10" fill="#64748b">What's the rational choice?</text>
      </svg>
    ),
    20: ( // Unexpected Hanging
      <svg viewBox="0 0 320 200" style={style}>
        {["MON","TUE","WED","THU","FRI"].map((d,i) => (
          <g key={i}>
            <rect x={20+i*58} y="30" width="50" height="55" rx="6"
              fill={i===2?"rgba(239,68,68,0.15)":"#1e293b"}
              stroke={i===2?"#ef4444":"#334155"} strokeWidth={i===2?2:1}/>
            <text x={45+i*58} y="52" textAnchor="middle" fontSize="9" fontWeight="800"
              fill={i===2?"#f87171":"#475569"}>{d}</text>
            {i===2 && <text x={45+i*58} y="72" textAnchor="middle" fontSize="18">💀</text>}
            {i===3 || i===4 ? <text x={45+i*58} y="72" textAnchor="middle" fontSize="18">❓</text> : null}
            {i < 2 ? <text x={45+i*58} y="70" textAnchor="middle" fontSize="16" fill="#22c55e">✓</text> : null}
          </g>
        ))}
        <text x="160" y="110" textAnchor="middle" fontSize="22">⚖️</text>
        <text x="160" y="135" textAnchor="middle" fontSize="11" fill="#64748b">"You will be hanged, but you</text>
        <text x="160" y="150" textAnchor="middle" fontSize="11" fill="#64748b">won't know the day until morning."</text>
        <text x="100" y="185" textAnchor="middle" fontSize="10" fill="#94a3b8">Prisoner:</text>
        <text x="210" y="185" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700">"It's impossible!"</text>
      </svg>
    ),
  };

  return ills[id] || (
    <svg viewBox="0 0 320 200" style={style}>
      <text x="160" y="110" textAnchor="middle" fontSize="48">{/* fallback */}</text>
    </svg>
  );
}

// ─── Puzzle Grid Tile ─────────────────────────────────────────────────────────
function PuzzleTile({ puzzle, index, solved, onClick }) {
  const [hovered, setHovered] = useState(false);
  const d = DIFF[puzzle.difficulty];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: solved ? "linear-gradient(135deg,rgba(74,222,128,0.06),#171f2e)" : hovered ? "#1e2d42" : "#192132",
        border: solved ? "1px solid rgba(74,222,128,0.22)" : hovered ? `1px solid ${d.border}` : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "16px 18px", cursor: "pointer",
        transition: "all 0.18s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 28px ${d.glow}` : "none",
        position: "relative", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: d.color, opacity: hovered ? 1 : 0.4, borderRadius: "16px 0 0 16px", transition: "opacity 0.18s" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{puzzle.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: d.color, background: d.bg, border: `1px solid ${d.border}`, borderRadius: 5, padding: "2px 7px", letterSpacing: "0.06em" }}>
              {puzzle.difficulty.toUpperCase()}
            </span>
            <span style={{ fontSize: 9, color: "#334155", fontWeight: 700 }}>#{String(index + 1).padStart(2, "0")}</span>
            {solved && <span style={{ marginLeft: "auto", fontSize: 9, color: "#4ade80", fontWeight: 800 }}>✓</span>}
          </div>
          <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{puzzle.title}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Focused Puzzle View ──────────────────────────────────────────────────────
function PuzzleFocus({ puzzle, index, total, solved, onSolve, onUnsolve, onBack, onPrev, onNext }) {
  const [revealed, setRevealed] = useState(false);
  const d = DIFF[puzzle.difficulty];
  const { isMobile } = useWindowSize();

  return (
    <div style={{ animation: "fadeSlideIn 0.28s ease" }}>
      {/* Nav bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
          ← All Puzzles
        </button>
        <span style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}>{index + 1} / {total}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={onPrev} disabled={index === 0} style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: index === 0 ? "#1e293b" : "#64748b", fontSize: 14, cursor: index === 0 ? "default" : "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { if (index > 0) { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}}
            onMouseLeave={e => { e.currentTarget.style.color = index === 0 ? "#1e293b" : "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            ‹
          </button>
          <button onClick={onNext} disabled={index === total - 1} style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: index === total - 1 ? "#1e293b" : "#64748b", fontSize: 14, cursor: index === total - 1 ? "default" : "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { if (index < total - 1) { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}}
            onMouseLeave={e => { e.currentTarget.style.color = index === total - 1 ? "#1e293b" : "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            ›
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32, alignItems: "start" }}>

        {/* Left: illustration + meta */}
        <div>
          {/* Illustration card */}
          <div style={{
            background: "linear-gradient(135deg, #192132 0%, #111827 100%)",
            border: `1px solid ${d.border}`,
            borderRadius: 24,
            padding: "28px 20px 20px",
            marginBottom: 20,
            boxShadow: `0 0 40px ${d.glow}`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle, ${d.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />
            <Illustration id={puzzle.id} />
          </div>

          {/* Difficulty + number + solved/unmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: d.bg, border: `1px solid ${d.border}`, color: d.color, borderRadius: 8, padding: "5px 12px", letterSpacing: "0.06em" }}>
              {puzzle.difficulty.toUpperCase()}
            </span>
            <span style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}>Puzzle #{String(index + 1).padStart(2, "0")}</span>
            {solved && (
              <button onClick={onUnsolve} style={{ marginLeft: "auto", padding: "5px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, color: "#f87171", fontSize: 11, fontWeight: 800, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.04em" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.16)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}>
                ✕ Unmark
              </button>
            )}
          </div>
        </div>

        {/* Right: question + answer */}
        <div>
          <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 900, color: "#f1f5f9", letterSpacing: -0.8, marginBottom: 20, lineHeight: 1.2 }}>
            {puzzle.title}
          </h2>

          {/* Question box */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${d.border}`,
            borderRadius: 18,
            padding: "22px 24px",
            marginBottom: puzzle.hint ? 14 : 24,
            position: "relative",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: d.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              The Puzzle
            </div>
            <p style={{ color: "#e2e8f0", fontSize: 16, lineHeight: 1.85, margin: 0, fontWeight: 500 }}>
              {puzzle.question}
            </p>
          </div>

          {/* Hint / formula */}
          {puzzle.hint && (
            <div style={{
              background: "rgba(129,140,248,0.07)",
              border: "1px solid rgba(129,140,248,0.22)",
              borderRadius: 14,
              padding: "12px 18px",
              marginBottom: 24,
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>Hint</span>
              <span style={{ color: "#c7d2fe", fontSize: 14, lineHeight: 1.7 }}>{puzzle.hint}</span>
            </div>
          )}

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              style={{
                width: "100%", padding: "14px 24px",
                background: `linear-gradient(135deg, ${d.bg}, rgba(255,255,255,0.02))`,
                border: `1.5px solid ${d.border}`,
                borderRadius: 14, color: d.color,
                fontSize: 14, fontWeight: 800,
                cursor: "pointer", letterSpacing: "0.03em",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${d.glow}`; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Reveal Answer →
            </button>
          ) : (
            <div style={{ animation: "fadeSlideIn 0.3s ease" }}>
              {/* Answer */}
              <div style={{
                background: `linear-gradient(135deg, ${d.bg}, rgba(0,0,0,0.2))`,
                border: `1px solid ${d.border}`,
                borderRadius: 14, padding: "16px 20px", marginBottom: 16,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: d.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Answer</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.5 }}>{puzzle.answer}</div>
              </div>

              {/* Explanation */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: d.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, opacity: 0.7 }}>Explanation</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {puzzle.explanation.map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ color: d.color, flexShrink: 0, fontSize: 14, fontWeight: 800, lineHeight: 1 }}>→</span>
                      <span style={{ color: "#dde4f0", fontSize: 15, lineHeight: 1.65, fontWeight: 500 }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!solved && (
                  <button onClick={onSolve} style={{ padding: "10px 20px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, color: "#4ade80", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(74,222,128,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(74,222,128,0.1)"}>
                    ✓ Mark as solved
                  </button>
                )}
                <button onClick={() => setRevealed(false)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; e.currentTarget.style.color = "#64748b"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#475569"; }}>
                  Hide answer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Brainteasers() {
  const { isMobile } = useWindowSize();
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [solvedIds, setSolvedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("qw_brainteasers") || "[]")); }
    catch { return new Set(); }
  });

  const save = (next) => {
    setSolvedIds(next);
    localStorage.setItem("qw_brainteasers", JSON.stringify([...next]));
  };

  const markSolved = (id) => {
    const next = new Set([...solvedIds, id]);
    save(next);
  };

  const unmarkSolved = (id) => {
    const next = new Set([...solvedIds].filter(x => x !== id));
    save(next);
  };

  const filtered = filter === "All" ? PUZZLES : PUZZLES.filter(p => p.difficulty === filter);
  const selectedPuzzle = selectedId !== null ? PUZZLES.find(p => p.id === selectedId) : null;
  const selectedIndex = selectedPuzzle ? PUZZLES.indexOf(selectedPuzzle) : -1;
  const solvedCount = solvedIds.size;
  const pct = Math.round((solvedCount / PUZZLES.length) * 100);

  const goNext = () => {
    if (selectedIndex < PUZZLES.length - 1) setSelectedId(PUZZLES[selectedIndex + 1].id);
  };
  const goPrev = () => {
    if (selectedIndex > 0) setSelectedId(PUZZLES[selectedIndex - 1].id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1626", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,70,239,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -200, left: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        <div style={{ maxWidth: 1060, margin: "0 auto", padding: isMobile ? "32px 20px 80px" : "48px 48px 100px" }}>

          {/* ── Header (always visible) ── */}
          <div style={{ marginBottom: selectedPuzzle ? 36 : 44 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(217,70,239,0.1)", border: "1px solid rgba(217,70,239,0.3)", borderRadius: 100, padding: "5px 16px", marginBottom: 18 }}>
              <span style={{ fontSize: 12, color: "#d946ef", fontWeight: 800, letterSpacing: "0.08em" }}>🧠 QUANT BRAINTEASERS</span>
            </div>
            {!selectedPuzzle && (
              <>
                <h1 style={{ fontSize: isMobile ? 34 : 54, fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 14, background: "linear-gradient(135deg, #f1f5f9 0%, #d946ef 45%, #818cf8 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Puzzles That<br />Break Your Brain
                </h1>
                <p style={{ color: "#64748b", fontSize: isMobile ? 15 : 17, lineHeight: 1.7, maxWidth: 560, marginBottom: 28 }}>
                  Classic problems from quant interviews and probability theory. Click any puzzle to focus on it — work through it before revealing the answer.
                </p>
              </>
            )}

            {/* Stats + progress */}
            <div style={{ display: "flex", gap: isMobile ? 16 : 28, flexWrap: "wrap", alignItems: "center" }}>
              {[
                { val: PUZZLES.length, label: "Total", color: "#818cf8" },
                { val: solvedCount, label: "Solved", color: "#4ade80" },
                { val: PUZZLES.filter(p => p.difficulty === "Hard").length, label: "Hard", color: "#f87171" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}>PROGRESS</span>
                  <span style={{ fontSize: 10, color: "#d946ef", fontWeight: 800 }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#d946ef,#818cf8)", borderRadius: 3, transition: "width 0.6s ease", boxShadow: "0 0 8px rgba(217,70,239,0.5)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Focused puzzle view ── */}
          {selectedPuzzle ? (
            <PuzzleFocus
              key={selectedPuzzle.id}
              puzzle={selectedPuzzle}
              index={selectedIndex}
              total={PUZZLES.length}
              solved={solvedIds.has(selectedPuzzle.id)}
              onSolve={() => markSolved(selectedPuzzle.id)}
              onUnsolve={() => unmarkSolved(selectedPuzzle.id)}
              onBack={() => setSelectedId(null)}
              onPrev={goPrev}
              onNext={goNext}
            />
          ) : (
            <>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#334155", fontWeight: 700, marginRight: 4 }}>FILTER:</span>
                {["All","Easy","Medium","Hard"].map(f => {
                  const active = filter === f;
                  const dc = f === "All" ? { color: "#818cf8", border: "rgba(129,140,248,0.35)", bg: "rgba(129,140,248,0.1)" } : DIFF[f];
                  const count = f === "All" ? PUZZLES.length : PUZZLES.filter(p => p.difficulty === f).length;
                  return (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "all 0.15s",
                      background: active ? dc.bg : "transparent",
                      border: active ? `1px solid ${dc.border || dc.color+"44"}` : "1px solid transparent",
                      color: active ? dc.color : "#334155", letterSpacing: "0.04em",
                    }}>
                      {f} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Puzzle grid */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
                {filtered.map((puzzle) => (
                  <PuzzleTile
                    key={puzzle.id}
                    puzzle={puzzle}
                    index={PUZZLES.indexOf(puzzle)}
                    solved={solvedIds.has(puzzle.id)}
                    onClick={() => setSelectedId(puzzle.id)}
                  />
                ))}
              </div>

              {solvedCount === PUZZLES.length && (
                <div style={{ marginTop: 40, textAlign: "center", background: "linear-gradient(135deg,rgba(217,70,239,0.1),rgba(129,140,248,0.1))", border: "1px solid rgba(217,70,239,0.3)", borderRadius: 24, padding: "40px 32px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>All puzzles solved!</h3>
                  <p style={{ color: "#64748b", fontSize: 15 }}>You've worked through every puzzle on this page. Not bad at all.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
