import { useState, useMemo, useEffect } from "react";
import Navbar from "./Navbar";
import { useWindowSize } from "./useWindowSize";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Area,
} from "recharts";

// ── Normal distribution helpers ───────────────────────────────────────────────
function erf(x) {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1/(1+p*x);
  return sign*(1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x));
}
function normCDF(x) { return 0.5*(1+erf(x/Math.sqrt(2))); }
function normPDF(x) { return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); }

// ── Black-Scholes pricer ──────────────────────────────────────────────────────
function bs(S, K, T, r, sigma) {
  if (!S||!K||T<=0||sigma<=0) return null;
  const sqT  = Math.sqrt(T);
  const d1   = (Math.log(S/K)+(r+0.5*sigma*sigma)*T)/(sigma*sqT);
  const d2   = d1 - sigma*sqT;
  const eRT  = Math.exp(-r*T);
  const nd1  = normCDF(d1), nd2=normCDF(d2), npd1=normPDF(d1);
  return {
    call:      S*nd1 - K*eRT*nd2,
    put:       K*eRT*normCDF(-d2) - S*normCDF(-d1),
    d1, d2,
    deltaCall: nd1,
    deltaPut:  nd1-1,
    gamma:     npd1/(S*sigma*sqT),
    thetaCall: (-S*npd1*sigma/(2*sqT) - r*K*eRT*nd2)/365,
    thetaPut:  (-S*npd1*sigma/(2*sqT) + r*K*eRT*normCDF(-d2))/365,
    vega:      S*npd1*sqT/100,
    rhoCall:   K*T*eRT*nd2/100,
    rhoPut:   -K*T*eRT*normCDF(-d2)/100,
  };
}

// ── Strategy definitions ──────────────────────────────────────────────────────
const STRATEGIES = [
  { id:"long_call",    label:"Long Call",        strikes:1, color:"#10b981",
    desc:"Bullish bet. Unlimited upside, premium is max loss." },
  { id:"long_put",     label:"Long Put",         strikes:1, color:"#ef4444",
    desc:"Bearish bet. Profits as stock falls. Limited downside risk." },
  { id:"covered_call", label:"Covered Call",     strikes:1, color:"#3b82f6",
    desc:"Own stock, sell OTM call. Earn premium, cap upside." },
  { id:"straddle",     label:"Straddle",         strikes:1, color:"#8b5cf6",
    desc:"Long call + put at same strike. Profit on big move either way." },
  { id:"strangle",     label:"Strangle",         strikes:2, color:"#a78bfa",
    desc:"OTM call + OTM put. Cheaper than straddle, needs bigger move." },
  { id:"bull_spread",  label:"Bull Call Spread",  strikes:2, color:"#22c55e",
    desc:"Long lower call, short upper call. Capped profit and loss." },
  { id:"bear_spread",  label:"Bear Put Spread",   strikes:2, color:"#f97316",
    desc:"Long higher put, short lower put. Profit as stock drops." },
  { id:"iron_condor",  label:"Iron Condor",       strikes:4, color:"#f59e0b",
    desc:"Short strangle + wings. Profit in a range. Sell volatility." },
];

// ── Strategy payoff at expiry ─────────────────────────────────────────────────
function strategyPayoff(id, ST, S, K1, K2, K3, K4, T, r, sigma) {
  const o = (K) => bs(S, K, T, r, sigma) ?? { call:0, put:0 };
  const o1=o(K1), o2=o(K2), o3=o(K3), o4=o(K4);
  const C = (K) => Math.max(ST-K, 0);
  const P = (K) => Math.max(K-ST, 0);
  switch(id) {
    case "long_call":    return C(K1) - o1.call;
    case "long_put":     return P(K1) - o1.put;
    case "covered_call": return (ST-S) + o1.call - C(K1);
    case "straddle":     return C(K1)+P(K1) - (o1.call+o1.put);
    case "strangle":     return C(K2)+P(K1) - (o2.call+o1.put);
    case "bull_spread":  return C(K1)-C(K2) - (o1.call-o2.call);
    case "bear_spread":  return P(K2)-P(K1) - (o2.put-o1.put);
    case "iron_condor":  // short put K2, long put K1, short call K3, long call K4
      return -P(K2)+P(K1)-C(K3)+C(K4) + (o2.put-o1.put+o3.call-o4.call);
    default: return 0;
  }
}

function netPremium(id, S, K1, K2, K3, K4, T, r, sigma) {
  const o = (K) => bs(S, K, T, r, sigma) ?? { call:0, put:0 };
  const o1=o(K1), o2=o(K2), o3=o(K3), o4=o(K4);
  switch(id) {
    case "long_call":    return -o1.call;
    case "long_put":     return -o1.put;
    case "covered_call": return o1.call;
    case "straddle":     return -(o1.call+o1.put);
    case "strangle":     return -(o2.call+o1.put);
    case "bull_spread":  return -(o1.call-o2.call);
    case "bear_spread":  return -(o2.put-o1.put);
    case "iron_condor":  return (o2.put-o1.put)+(o3.call-o4.call);
    default: return 0;
  }
}

// ── Theme constants ───────────────────────────────────────────────────────────
const EM = "#10b981";

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ emoji, title, subtitle, color }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28 }}>
      <div style={{ width:48, height:48, borderRadius:14, background:`${color}18`, border:`1px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
        {emoji}
      </div>
      <div>
        <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:"0 0 4px", lineHeight:1.2 }}>{title}</h2>
        <p style={{ color:"#64748b", fontSize:14, margin:0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

function GreekCard({ label, value, desc, color, positive }) {
  const isNeg = typeof positive === "boolean" ? !positive : parseFloat(value) < 0;
  const displayColor = label.includes("Theta") && isNeg ? "#ef4444"
    : label.includes("Theta") ? "#22c55e" : color;
  return (
    <div style={{ background:"#0f172a", borderRadius:16, padding:"16px 18px", borderLeft:`3px solid ${displayColor}`, border:`1px solid ${displayColor}25`, borderLeftWidth:3, borderLeftColor:displayColor, borderLeftStyle:"solid" }}>
      <div style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.07em", marginBottom:6 }}>{label}</div>
      <div style={{ color:displayColor, fontSize:22, fontWeight:800, fontFamily:"monospace", letterSpacing:"-0.02em", marginBottom:5 }}>{value}</div>
      <div style={{ color:"#475569", fontSize:11, lineHeight:1.5 }}>{desc}</div>
    </div>
  );
}

function InputSlider({ label, value, setValue, min, max, step, fmt, color="#10b981" }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>{label}</span>
        <span style={{ color, fontSize:14, fontWeight:800, fontFamily:"monospace" }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(+e.target.value)}
        style={{ width:"100%", accentColor:color, cursor:"pointer" }} />
    </div>
  );
}

function GreekInfo({ greekType }) {
  const info = {
    delta: { color:"#3b82f6", title:"Delta (Δ) — Price Sensitivity",
      lines:["$1 move in spot → this much change in option price","Call Δ ranges from 0 (deep OTM) to 1 (deep ITM)","Put Δ ranges from −1 to 0","ATM options sit near Δ = ±0.50","Traders 'delta hedge' to neutralize directional risk"] },
    gamma: { color:"#8b5cf6", title:"Gamma (Γ) — Delta Sensitivity",
      lines:["Rate of change of delta per $1 spot move","Always positive for long options","Peaks at ATM and near expiry — 'gamma risk'","Short gamma explodes near expiry: handle with care","Market makers manage gamma exposure daily"] },
    theta: { color:"#ef4444", title:"Theta (Θ) — Time Decay",
      lines:["How much value the option loses per calendar day","Long options lose money every day (negative theta)","Short options earn theta — 'selling time'","Accelerates dramatically in the final 30 days","ATM options decay fastest as a proportion"] },
    vega:  { color:"#f59e0b", title:"Vega (ν) — Vol Sensitivity",
      lines:["Change in option price per 1% rise in implied vol","Long options benefit from rising volatility","Highest for long-dated, ATM options","Vega collapses to near zero at expiry","Vol traders buy/sell options specifically for vega exposure"] },
    rho:   { color:EM, title:"Rho (ρ) — Rate Sensitivity",
      lines:["Change in option price per 1% rise in interest rates","Calls: positive rho (higher rates → higher call value)","Puts: negative rho","Most significant for long-dated options","Generally the least impactful Greek in practice"] },
  };
  const d = info[greekType];
  return (
    <div style={{ background:`${d.color}0d`, border:`1px solid ${d.color}25`, borderRadius:14, padding:"16px 20px", marginBottom:20 }}>
      <div style={{ color:d.color, fontWeight:800, fontSize:14, marginBottom:10 }}>{d.title}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 32px" }}>
        {d.lines.map((l,i) => (
          <span key={i} style={{ color:"#94a3b8", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:d.color, fontWeight:700 }}>→</span> {l}
          </span>
        ))}
      </div>
    </div>
  );
}

const CUSTOM_TOOLTIP_STYLE = { background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, fontSize:12, padding:"8px 12px" };

// ── Main Component ────────────────────────────────────────────────────────────
export default function Options() {
  const { isMobile } = useWindowSize();

  // Pricer inputs
  const [S, setS]         = useState(100);
  const [K, setK]         = useState(100);
  const [T, setT]         = useState(0.5);
  const [r, setR]         = useState(0.05);
  const [sigma, setSigma] = useState(0.20);
  const [optType, setOptType] = useState("call");

  // Strategy builder
  const [strategy, setStrategy] = useState("long_call");
  const [sK1, setSK1] = useState(100);
  const [sK2, setSK2] = useState(110);
  const [sK3, setSK3] = useState(110);
  const [sK4, setSK4] = useState(120);

  // Greeks visualizer
  const [greekType, setGreekType] = useState("delta");

  // Auto-set sensible defaults when strategy changes
  useEffect(() => {
    const spot = S;
    if (strategy === "iron_condor") {
      setSK1(Math.round(spot*0.85)); setSK2(Math.round(spot*0.93));
      setSK3(Math.round(spot*1.07)); setSK4(Math.round(spot*1.15));
    } else if (strategy === "strangle") {
      setSK1(Math.round(spot*0.92)); setSK2(Math.round(spot*1.08));
    } else if (strategy === "bull_spread" || strategy === "bear_spread") {
      setSK1(Math.round(spot*0.95)); setSK2(Math.round(spot*1.05));
    } else {
      setSK1(spot); setSK2(Math.round(spot*1.10));
    }
  }, [strategy]); // eslint-disable-line

  const bsResult = useMemo(() => bs(S, K, T, r, sigma), [S, K, T, r, sigma]);

  const payoffData = useMemo(() => {
    const lo = S*0.5, hi = S*1.5, pts = [];
    for (let i=0; i<=120; i++) {
      const ST = lo+(hi-lo)*i/120;
      const pnl = strategyPayoff(strategy, ST, S, sK1, sK2, sK3, sK4, T, r, sigma);
      pts.push({ spot:+ST.toFixed(2), pnl:+pnl.toFixed(4), pos:Math.max(pnl,0), neg:Math.min(pnl,0) });
    }
    return pts;
  }, [strategy, S, sK1, sK2, sK3, sK4, T, r, sigma]);

  const greeksData = useMemo(() => {
    const lo=S*0.4, hi=S*1.6, pts=[];
    for (let i=0; i<=100; i++) {
      const spot = lo+(hi-lo)*i/100;
      const res = bs(spot, K, T, r, sigma);
      if (!res) continue;
      let cv, pv;
      switch(greekType) {
        case "delta": cv=res.deltaCall; pv=res.deltaPut; break;
        case "gamma": cv=res.gamma; pv=res.gamma; break;
        case "theta": cv=res.thetaCall; pv=res.thetaPut; break;
        case "vega":  cv=res.vega; pv=res.vega; break;
        case "rho":   cv=res.rhoCall; pv=res.rhoPut; break;
        default: cv=0; pv=0;
      }
      pts.push({ spot:+spot.toFixed(2), call:+cv.toFixed(6), put:+pv.toFixed(6) });
    }
    return pts;
  }, [K, T, r, sigma, greekType, S]);

  const stratDef = STRATEGIES.find(s=>s.id===strategy);
  const np = netPremium(strategy, S, sK1, sK2, sK3, sK4, T, r, sigma);
  const npPositive = np >= 0;

  const moneyness = S === K ? "At the Money" : S > K ? "In the Money" : "Out of the Money";
  const moneynessColor = S === K ? "#f59e0b" : S > K ? "#10b981" : "#ef4444";

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"Inter, sans-serif" }}>
      <Navbar />

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div style={{ paddingTop:isMobile?80:96, paddingBottom:56, textAlign:"center", background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)", borderBottom:"1px solid rgba(16,185,129,0.1)" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:100, padding:"6px 18px", marginBottom:24 }}>
          <span style={{ color:EM, fontSize:12, fontWeight:700, letterSpacing:"0.1em" }}>OPTIONS DESK</span>
        </div>
        <h1 style={{ color:"#fff", fontSize:isMobile?32:52, fontWeight:900, margin:"0 0 14px", lineHeight:1.05 }}>
          Options &amp;{" "}
          <span style={{ background:"linear-gradient(120deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Derivatives
          </span>
        </h1>
        <p style={{ color:"#64748b", fontSize:isMobile?14:18, maxWidth:580, margin:"0 auto 32px", lineHeight:1.7 }}>
          Black-Scholes live pricing · Full Greeks dashboard · Strategy payoff builder · Greeks visualizer
        </p>
        {/* Stat chips */}
        <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
          {[
            { label:"Call Price", val:`$${bsResult?.call.toFixed(3)??"—"}`, color:"#10b981" },
            { label:"Put Price",  val:`$${bsResult?.put.toFixed(3)??"—"}`,  color:"#ef4444" },
            { label:"Delta (C)",  val:bsResult?.deltaCall.toFixed(3)??"—",  color:"#3b82f6" },
            { label:"IV",         val:`${(sigma*100).toFixed(0)}%`,          color:"#f59e0b" },
          ].map(c => (
            <div key={c.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #1e293b", borderRadius:12, padding:"10px 20px", display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ color:"#475569", fontSize:12 }}>{c.label}</span>
              <span style={{ color:c.color, fontWeight:800, fontFamily:"monospace", fontSize:15 }}>{c.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:isMobile?"28px 16px":"56px 32px" }}>

        {/* ── Section 1: Black-Scholes Pricer ─────────────────────────────── */}
        <div style={{ marginBottom:72 }}>
          <SectionHeader emoji="⚡" title="Black-Scholes Pricer" subtitle="Adjust any parameter and watch prices and Greeks update instantly" color={EM} />

          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"360px 1fr", gap:24 }}>

            {/* Input panel */}
            <div style={{ background:"#1e293b", border:"1px solid rgba(16,185,129,0.2)", borderRadius:22, padding:28 }}>
              <div style={{ color:"#94a3b8", fontSize:12, fontWeight:700, letterSpacing:"0.08em", marginBottom:20 }}>MODEL INPUTS</div>

              <InputSlider label="Spot Price (S)" value={S} setValue={setS} min={10} max={500} step={1} fmt={v=>`$${v}`} color={EM} />
              <InputSlider label="Strike Price (K)" value={K} setValue={setK} min={10} max={500} step={1} fmt={v=>`$${v}`} color={EM} />
              <InputSlider label="Time to Expiry" value={T} setValue={setT} min={0.01} max={3} step={0.01}
                fmt={v => v<0.083?`${Math.round(v*365)}d`:`${v.toFixed(2)}y`} color={EM} />
              <InputSlider label="Risk-Free Rate (r)" value={r} setValue={setR} min={0} max={0.20} step={0.001} fmt={v=>`${(v*100).toFixed(1)}%`} color={EM} />
              <InputSlider label="Volatility (σ)" value={sigma} setValue={setSigma} min={0.01} max={1.5} step={0.01} fmt={v=>`${(v*100).toFixed(0)}%`} color={EM} />

              {/* Call / Put toggle */}
              <div style={{ display:"flex", gap:8, marginTop:6 }}>
                {["call","put"].map(t => (
                  <button key={t} onClick={() => setOptType(t)} style={{
                    flex:1, padding:"11px 0", borderRadius:12,
                    border:`1.5px solid ${optType===t ? (t==="call"?EM:"#ef4444") : "#334155"}`,
                    background:optType===t ? (t==="call"?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)") : "transparent",
                    color:optType===t ? (t==="call"?EM:"#ef4444") : "#475569",
                    fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.15s",
                  }}>
                    {t==="call" ? "📈 Call" : "📉 Put"}
                  </button>
                ))}
              </div>
            </div>

            {/* Outputs */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Price hero */}
              <div style={{ background:`linear-gradient(135deg, ${optType==="call"?"rgba(16,185,129,0.14)":"rgba(239,68,68,0.14)"} 0%, rgba(15,23,42,0.8) 100%)`, border:`1px solid ${optType==="call"?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)"}`, borderRadius:22, padding:"28px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
                <div>
                  <div style={{ color:optType==="call"?"#6ee7b7":"#fca5a5", fontSize:12, fontWeight:700, letterSpacing:"0.1em", marginBottom:6 }}>
                    {optType.toUpperCase()} OPTION PRICE
                  </div>
                  <div style={{ color:"#fff", fontSize:56, fontWeight:900, fontFamily:"monospace", letterSpacing:"-0.03em", lineHeight:1 }}>
                    ${bsResult ? (optType==="call"?bsResult.call:bsResult.put).toFixed(4) : "—"}
                  </div>
                  <div style={{ color:"#475569", fontSize:12, marginTop:8, fontFamily:"monospace" }}>
                    d₁ = {bsResult?.d1.toFixed(4)} &nbsp;·&nbsp; d₂ = {bsResult?.d2.toFixed(4)}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"#475569", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:6 }}>MONEYNESS</div>
                  <div style={{ color:moneynessColor, fontSize:18, fontWeight:800 }}>{moneyness}</div>
                  <div style={{ color:"#334155", fontSize:12, marginTop:4, fontFamily:"monospace" }}>S/K = {(S/K).toFixed(3)}</div>
                  <div style={{ color:"#334155", fontSize:12, marginTop:2, fontFamily:"monospace" }}>
                    Intrinsic: ${Math.max(optType==="call"?S-K:K-S, 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Greeks grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12 }}>
                <GreekCard label="Delta (Δ)"
                  value={bsResult ? (optType==="call"?bsResult.deltaCall:bsResult.deltaPut).toFixed(4) : "—"}
                  desc="Price Δ per $1 spot move" color="#3b82f6" />
                <GreekCard label="Gamma (Γ)"
                  value={bsResult?.gamma.toFixed(6)??"—"}
                  desc="Delta Δ per $1 spot move" color="#8b5cf6" />
                <GreekCard label="Theta (Θ) / day"
                  value={bsResult ? (optType==="call"?bsResult.thetaCall:bsResult.thetaPut).toFixed(4) : "—"}
                  desc="Daily time decay in $" color="#ef4444" />
                <GreekCard label="Vega (ν) / 1% vol"
                  value={bsResult?.vega.toFixed(4)??"—"}
                  desc="Price Δ per 1% vol change" color="#f59e0b" />
                <GreekCard label="Rho (ρ) / 1% rate"
                  value={bsResult ? (optType==="call"?bsResult.rhoCall:bsResult.rhoPut).toFixed(4) : "—"}
                  desc="Price Δ per 1% rate change" color={EM} />
                {/* Put-call parity */}
                <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:16, padding:"16px 18px" }}>
                  <div style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.07em", marginBottom:6 }}>PUT-CALL PARITY</div>
                  <div style={{ color:"#94a3b8", fontSize:11, lineHeight:1.6 }}>
                    C − P ={" "}
                    <span style={{ color:"#fff", fontFamily:"monospace", fontWeight:700 }}>
                      {bsResult ? (bsResult.call-bsResult.put).toFixed(4) : "—"}
                    </span>
                    <br/>
                    S − Ke<sup>−rT</sup> ={" "}
                    <span style={{ color:EM, fontFamily:"monospace", fontWeight:700 }}>
                      {bsResult ? (S - K*Math.exp(-r*T)).toFixed(4) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Strategy Builder ──────────────────────────────────── */}
        <div style={{ marginBottom:72 }}>
          <SectionHeader emoji="🎯" title="Strategy Builder" subtitle="Pick a strategy, set your strikes, and visualize the P&L at expiry" color="#f59e0b" />

          {/* Strategy pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:28 }}>
            {STRATEGIES.map(s => (
              <button key={s.id} onClick={() => setStrategy(s.id)} style={{
                padding:"8px 16px", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s",
                border:`1.5px solid ${strategy===s.id ? s.color : "#334155"}`,
                background:strategy===s.id ? `${s.color}18` : "transparent",
                color:strategy===s.id ? s.color : "#64748b",
              }}>
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"300px 1fr", gap:24 }}>

            {/* Config panel */}
            <div style={{ background:"#1e293b", border:`1px solid ${stratDef.color}25`, borderRadius:22, padding:24, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ background:`${stratDef.color}12`, border:`1px solid ${stratDef.color}30`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ color:stratDef.color, fontWeight:800, fontSize:15, marginBottom:6 }}>{stratDef.label}</div>
                <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>{stratDef.desc}</div>
              </div>

              <div>
                <div style={{ color:"#64748b", fontSize:12, marginBottom:4 }}>Spot Price (S)</div>
                <div style={{ color:"#fff", fontSize:18, fontWeight:800, fontFamily:"monospace" }}>${S}</div>
              </div>

              {stratDef.strikes >= 1 && (
                <InputSlider label={stratDef.strikes>=2?"Strike K₁ (lower)":"Strike K"} value={sK1} setValue={setSK1}
                  min={10} max={500} step={1} fmt={v=>`$${v}`} color={stratDef.color} />
              )}
              {stratDef.strikes >= 2 && (
                <InputSlider label={stratDef.id==="strangle"?"Strike K₂ (upper call)":"Strike K₂ (upper)"} value={sK2} setValue={setSK2}
                  min={10} max={500} step={1} fmt={v=>`$${v}`} color={stratDef.color} />
              )}
              {stratDef.strikes >= 4 && (
                <>
                  <InputSlider label="Strike K₃ (short call)" value={sK3} setValue={setSK3}
                    min={10} max={500} step={1} fmt={v=>`$${v}`} color={stratDef.color} />
                  <InputSlider label="Strike K₄ (long call wing)" value={sK4} setValue={setSK4}
                    min={10} max={500} step={1} fmt={v=>`$${v}`} color={stratDef.color} />
                </>
              )}

              <div style={{ borderTop:"1px solid #334155", paddingTop:16 }}>
                <div style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:10 }}>NET PREMIUM</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:"#64748b", fontSize:13 }}>{npPositive ? "You Receive" : "You Pay"}</span>
                  <span style={{ color:npPositive?"#10b981":"#ef4444", fontWeight:800, fontSize:18, fontFamily:"monospace" }}>
                    {npPositive?"+":""}{np.toFixed(4)}
                  </span>
                </div>
                <div style={{ color:"#334155", fontSize:11, marginTop:4 }}>per share · ×100 per contract</div>
              </div>

              {/* Breakeven */}
              <div style={{ borderTop:"1px solid #334155", paddingTop:14 }}>
                <div style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:8 }}>MAX LOSS / MAX PROFIT</div>
                {(() => {
                  const pnls = payoffData.map(d=>d.pnl);
                  const maxP = Math.max(...pnls);
                  const maxL = Math.min(...pnls);
                  return (
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ color:"#10b981", fontWeight:700, fontFamily:"monospace", fontSize:14 }}>
                          {maxP > 999 ? "Unlimited" : `+${maxP.toFixed(2)}`}
                        </div>
                        <div style={{ color:"#475569", fontSize:11 }}>Max profit</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ color:"#ef4444", fontWeight:700, fontFamily:"monospace", fontSize:14 }}>
                          {maxL < -999 ? "Unlimited" : `${maxL.toFixed(2)}`}
                        </div>
                        <div style={{ color:"#475569", fontSize:11 }}>Max loss</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Payoff chart */}
            <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:22, padding:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <div style={{ color:"#fff", fontWeight:700, fontSize:16 }}>P&amp;L at Expiry</div>
                  <div style={{ color:"#475569", fontSize:12, marginTop:2 }}>Dashed line = current spot · T = {T.toFixed(2)}yr · σ = {(sigma*100).toFixed(0)}%</div>
                </div>
                <div style={{ display:"flex", gap:16, fontSize:12 }}>
                  <span style={{ color:"#10b981", fontWeight:600 }}>▲ Profit</span>
                  <span style={{ color:"#ef4444", fontWeight:600 }}>▼ Loss</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={payoffData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.35}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="spot" stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>`$${v}`} />
                  <YAxis stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>`$${v.toFixed(1)}`} width={55} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE}
                    labelFormatter={v=>`Spot at expiry: $${v}`}
                    formatter={(v,n) => n==="pnl"?[`$${v.toFixed(4)}`,"P&L"]:null} />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" strokeWidth={1.5} />
                  <ReferenceLine x={S} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
                    label={{ value:"Spot", fill:"#f59e0b", fontSize:11, position:"insideTopRight" }} />
                  <Area type="monotone" dataKey="pos" fill="url(#posGrad)" stroke="none" dot={false} legendType="none" />
                  <Area type="monotone" dataKey="neg" fill="url(#negGrad)" stroke="none" dot={false} legendType="none" />
                  <Line type="monotone" dataKey="pnl" stroke={stratDef.color} strokeWidth={2.5} dot={false} name="pnl" />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Breakeven labels */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 }}>
                {payoffData.filter((_,i,arr) => {
                  if (i===0) return false;
                  return (arr[i-1].pnl<0&&arr[i].pnl>=0)||(arr[i-1].pnl>=0&&arr[i].pnl<0);
                }).map((d,i) => (
                  <div key={i} style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#f59e0b", fontWeight:700 }}>
                    BE ≈ ${d.spot}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Greeks Visualizer ─────────────────────────────────── */}
        <div>
          <SectionHeader emoji="📐" title="Greeks Visualizer" subtitle="How each Greek evolves across different spot prices — using current K, T, r, σ" color="#8b5cf6" />

          {/* Greek selector */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
            {[
              { id:"delta", label:"Δ Delta",  color:"#3b82f6" },
              { id:"gamma", label:"Γ Gamma",  color:"#8b5cf6" },
              { id:"theta", label:"Θ Theta",  color:"#ef4444" },
              { id:"vega",  label:"ν Vega",   color:"#f59e0b" },
              { id:"rho",   label:"ρ Rho",    color:EM },
            ].map(g => (
              <button key={g.id} onClick={() => setGreekType(g.id)} style={{
                padding:"9px 20px", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s",
                border:`1.5px solid ${greekType===g.id ? g.color : "#334155"}`,
                background:greekType===g.id ? `${g.color}15` : "transparent",
                color:greekType===g.id ? g.color : "#64748b",
              }}>
                {g.label}
              </button>
            ))}
          </div>

          <GreekInfo greekType={greekType} />

          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:22, padding:28 }}>
            <div style={{ display:"flex", gap:24, marginBottom:16, fontSize:13 }}>
              <span><span style={{ color:"#3b82f6", fontWeight:700 }}>——</span> <span style={{ color:"#94a3b8" }}>Call</span></span>
              {greekType !== "gamma" && greekType !== "vega" && (
                <span><span style={{ color:"#f472b6", fontWeight:700 }}>——</span> <span style={{ color:"#94a3b8" }}>Put</span></span>
              )}
              <span style={{ marginLeft:"auto" }}><span style={{ color:"#f59e0b", fontWeight:700 }}>- - -</span> <span style={{ color:"#94a3b8" }}>Current Spot (${S})</span></span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={greeksData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="spot" stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>`$${v}`} />
                <YAxis stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>v.toFixed(4)} width={65} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE}
                  labelFormatter={v=>`Spot: $${v}`}
                  formatter={(v,n)=>[v.toFixed(6), n==="call"?"Call":"Put"]} />
                <ReferenceLine x={S} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5} />
                <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
                <Line type="monotone" dataKey="call" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="call" />
                {greekType !== "gamma" && greekType !== "vega" && (
                  <Line type="monotone" dataKey="put" stroke="#f472b6" strokeWidth={2.5} dot={false} name="put" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Greeks reference cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12, marginTop:20 }}>
            {[
              { greek:"Δ", name:"Delta",  range:"−1 to +1", sign:"+ call / − put", color:"#3b82f6" },
              { greek:"Γ", name:"Gamma",  range:"Always ≥ 0", sign:"+ for long options", color:"#8b5cf6" },
              { greek:"Θ", name:"Theta",  range:"Usually < 0", sign:"− long / + short", color:"#ef4444" },
              { greek:"ν", name:"Vega",   range:"Always ≥ 0", sign:"+ for long options", color:"#f59e0b" },
              { greek:"ρ", name:"Rho",    range:"+ call / − put", sign:"+ long / − short", color:EM },
            ].map(g => (
              <div key={g.name} style={{ background:"#1e293b", border:`1px solid ${g.color}20`, borderRadius:14, padding:"14px 16px", borderTop:`2px solid ${g.color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ color:g.color, fontSize:22, fontWeight:900, fontFamily:"serif" }}>{g.greek}</span>
                  <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>{g.name}</span>
                </div>
                <div style={{ color:"#64748b", fontSize:11, lineHeight:1.7 }}>
                  Range: <span style={{ color:"#94a3b8" }}>{g.range}</span><br/>
                  Sign: <span style={{ color:"#94a3b8" }}>{g.sign}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
