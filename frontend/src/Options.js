import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useWindowSize } from "./useWindowSize";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
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

// ── Black-Scholes ─────────────────────────────────────────────────────────────
function bs(S, K, T, r, sigma) {
  if (!S || !K || T <= 0 || sigma <= 0) return null;
  const sqT = Math.sqrt(T);
  const d1  = (Math.log(S/K) + (r + 0.5*sigma*sigma)*T) / (sigma*sqT);
  const d2  = d1 - sigma*sqT;
  const eRT = Math.exp(-r*T);
  const npd1 = normPDF(d1);
  return {
    call:      S*normCDF(d1) - K*eRT*normCDF(d2),
    put:       K*eRT*normCDF(-d2) - S*normCDF(-d1),
    d1, d2,
    deltaCall: normCDF(d1),
    deltaPut:  normCDF(d1) - 1,
    gamma:     npd1 / (S*sigma*sqT),
    thetaCall: (-S*npd1*sigma/(2*sqT) - r*K*eRT*normCDF(d2)) / 365,
    thetaPut:  (-S*npd1*sigma/(2*sqT) + r*K*eRT*normCDF(-d2)) / 365,
    vega:      S*npd1*sqT / 100,
  };
}

const EM = "#10b981";

const PAYOFF_TYPES = [
  { id:"long_call",  label:"Long Call",  color:"#10b981", desc:"Bullish · Max loss = premium" },
  { id:"long_put",   label:"Long Put",   color:"#ef4444", desc:"Bearish · Max loss = premium" },
  { id:"short_call", label:"Short Call", color:"#f59e0b", desc:"Neutral/bearish · Max profit = premium" },
  { id:"short_put",  label:"Short Put",  color:"#8b5cf6", desc:"Neutral/bullish · Max profit = premium" },
];

function InputSlider({ label, value, setValue, min, max, step, fmt }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>{label}</span>
        <span style={{ color:EM, fontSize:14, fontWeight:800, fontFamily:"monospace" }}>
          {fmt ? fmt(value) : value}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(+e.target.value)}
        style={{ width:"100%", accentColor:EM, cursor:"pointer" }} />
    </div>
  );
}

function GreekCard({ label, symbol, value, desc, color, interpretation }) {
  return (
    <div style={{ background:"#0f172a", border:`1px solid ${color}25`, borderRadius:18, padding:"20px 22px", borderLeft:`3px solid ${color}` }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
        <span style={{ color, fontSize:22, fontWeight:900, fontFamily:"serif", lineHeight:1 }}>{symbol}</span>
        <span style={{ color:"#64748b", fontSize:12, fontWeight:700, letterSpacing:"0.05em" }}>{label}</span>
      </div>
      <div style={{ color, fontSize:28, fontWeight:900, fontFamily:"monospace", letterSpacing:"-0.02em", marginBottom:8 }}>
        {value}
      </div>
      <div style={{ color:"#94a3b8", fontSize:13, marginBottom:6 }}>{desc}</div>
      {interpretation && (
        <div style={{ color:"#475569", fontSize:12, borderTop:"1px solid #1e293b", paddingTop:8, marginTop:2, lineHeight:1.5 }}>
          {interpretation}
        </div>
      )}
    </div>
  );
}

// ── Price decomposition bar ───────────────────────────────────────────────────
function PriceDecomposition({ price, intrinsic, timeVal, optType }) {
  const total = price || 0;
  const intrPct = total > 0 ? (intrinsic / total) * 100 : 0;
  const timePct = total > 0 ? (timeVal / total) * 100 : 0;
  const callColor = "#10b981"; const putColor = "#ef4444";
  const mainColor = optType === "call" ? callColor : putColor;
  return (
    <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:18, padding:"20px 24px" }}>
      <div style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.08em", marginBottom:16 }}>OPTION PRICE BREAKDOWN</div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
        <span style={{ color:"#fff", fontSize:22, fontWeight:900, fontFamily:"monospace" }}>${total.toFixed(2)}</span>
        <span style={{ color:"#475569", fontSize:13 }}>total premium</span>
      </div>
      {/* Stacked bar */}
      <div style={{ height:28, borderRadius:8, overflow:"hidden", display:"flex", marginBottom:14, background:"#0f172a" }}>
        <div style={{ width:`${intrPct}%`, background:mainColor, transition:"width 0.3s", display:"flex", alignItems:"center", justifyContent:"center", minWidth: intrinsic > 0 ? 32 : 0 }}>
          {intrinsic > 0.01 && <span style={{ color:"#fff", fontSize:10, fontWeight:700, whiteSpace:"nowrap", padding:"0 6px" }}>${intrinsic.toFixed(2)}</span>}
        </div>
        <div style={{ flex:1, background:"#3b82f620", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:"#3b82f6", fontSize:10, fontWeight:700, whiteSpace:"nowrap", padding:"0 6px" }}>${timeVal.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:20, fontSize:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:3, background:mainColor }} />
          <div>
            <div style={{ color:"#94a3b8", fontWeight:600 }}>Intrinsic Value</div>
            <div style={{ color:"#475569", fontSize:11 }}>Profit if exercised now</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:3, background:"#3b82f6", opacity:0.5 }} />
          <div>
            <div style={{ color:"#94a3b8", fontWeight:600 }}>Time Value</div>
            <div style={{ color:"#475569", fontSize:11 }}>Decays to $0 at expiry (Theta)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Options() {
  const { isMobile } = useWindowSize();
  const navigate = useNavigate();

  const [S, setS]         = useState(100);
  const [K, setK]         = useState(100);
  const [T, setT]         = useState(0.5);
  const [r, setR]         = useState(0.05);
  const [sigma, setSigma] = useState(0.20);
  const [optType, setOptType] = useState("call");
  const [payoffType, setPayoffType] = useState("long_call");

  const res = useMemo(() => bs(S, K, T, r, sigma), [S, K, T, r, sigma]);

  const price     = res ? (optType === "call" ? res.call : res.put) : null;
  const delta     = res ? (optType === "call" ? res.deltaCall : res.deltaPut) : null;
  const theta     = res ? (optType === "call" ? res.thetaCall : res.thetaPut) : null;
  const intrinsic = price !== null ? Math.max(optType === "call" ? S-K : K-S, 0) : 0;
  const timeVal   = price !== null ? Math.max(price - intrinsic, 0) : 0;

  const itm = optType === "call" ? S > K : S < K;
  const atm = S === K;
  const moneyness = atm ? "At the Money" : itm ? "In the Money" : "Out of the Money";
  const moneynessColor = atm ? "#f59e0b" : itm ? "#10b981" : "#ef4444";

  const selPayoff = PAYOFF_TYPES.find(p => p.id === payoffType);

  // Payoff for selected strategy
  const payoffData = useMemo(() => {
    if (!res) return [];
    const lo = S * 0.5, hi = S * 1.5;
    return Array.from({ length: 120 }, (_, i) => {
      const ST = lo + (hi - lo) * i / 119;
      let pnl;
      switch(payoffType) {
        case "long_call":  pnl = Math.max(ST-K,0) - res.call; break;
        case "long_put":   pnl = Math.max(K-ST,0) - res.put;  break;
        case "short_call": pnl = res.call - Math.max(ST-K,0); break;
        case "short_put":  pnl = res.put  - Math.max(K-ST,0); break;
        default: pnl = 0;
      }
      return { spot:+ST.toFixed(1), pnl:+pnl.toFixed(3) };
    });
  }, [payoffType, S, K, res]);

  // Breakeven
  const breakevens = [];
  for (let i = 1; i < payoffData.length; i++) {
    if ((payoffData[i-1].pnl < 0 && payoffData[i].pnl >= 0) || (payoffData[i-1].pnl >= 0 && payoffData[i].pnl < 0)) {
      breakevens.push(payoffData[i].spot);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"Inter, sans-serif" }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop:isMobile?76:90, paddingBottom:48, textAlign:"center", background:"radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)", borderBottom:"1px solid rgba(16,185,129,0.12)" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:100, padding:"5px 16px", marginBottom:20 }}>
          <span style={{ color:EM, fontSize:12, fontWeight:700, letterSpacing:"0.1em" }}>OPTIONS DESK</span>
        </div>
        <h1 style={{ color:"#fff", fontSize:isMobile?30:50, fontWeight:900, margin:"0 0 12px", lineHeight:1.05 }}>
          Options &amp;{" "}
          <span style={{ background:"linear-gradient(120deg, #10b981, #34d399, #6ee7b7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Derivatives
          </span>
        </h1>
        <p style={{ color:"#64748b", fontSize:isMobile?14:17, maxWidth:500, margin:"0 auto 28px", lineHeight:1.7 }}>
          Live Black-Scholes pricing · Real-time Greeks · Strategy payoff diagrams
        </p>
        <button onClick={() => navigate("/learn")}
          style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"13px 24px", background:"rgba(16,185,129,0.12)", border:"1.5px solid rgba(16,185,129,0.4)", borderRadius:14, cursor:"pointer", transition:"all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(16,185,129,0.2)"; e.currentTarget.style.borderColor="#10b981"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(16,185,129,0.12)"; e.currentTarget.style.borderColor="rgba(16,185,129,0.4)"; }}>
          <span style={{ fontSize:18 }}>📖</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ color:EM, fontWeight:800, fontSize:14 }}>New to options? Read the guide first</div>
            <div style={{ color:"#475569", fontSize:12 }}>"What are Options?" · "The Greeks Explained" on the Learn page</div>
          </div>
          <span style={{ color:EM, fontSize:18 }}>→</span>
        </button>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"24px 16px":"52px 32px" }}>

        {/* ── Section 1: Pricer ─────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"360px 1fr", gap:24, marginBottom:56 }}>

          {/* Inputs */}
          <div style={{ background:"#1e293b", border:"1px solid rgba(16,185,129,0.2)", borderRadius:22, padding:28 }}>
            <div style={{ color:"#64748b", fontSize:11, fontWeight:700, letterSpacing:"0.08em", marginBottom:22 }}>MODEL INPUTS</div>
            <InputSlider label="Spot Price (S)" value={S} setValue={setS} min={10} max={500} step={1} fmt={v=>`$${v}`} />
            <InputSlider label="Strike Price (K)" value={K} setValue={setK} min={10} max={500} step={1} fmt={v=>`$${v}`} />
            <InputSlider label="Time to Expiry" value={T} setValue={setT} min={0.01} max={3} step={0.01}
              fmt={v => v < 0.1 ? `${Math.round(v*365)}d` : `${v.toFixed(2)}y`} />
            <InputSlider label="Risk-Free Rate (r)" value={r} setValue={setR} min={0} max={0.2} step={0.001} fmt={v=>`${(v*100).toFixed(1)}%`} />
            <InputSlider label="Volatility (σ)" value={sigma} setValue={setSigma} min={0.01} max={1.5} step={0.01} fmt={v=>`${(v*100).toFixed(0)}%`} />
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              {["call","put"].map(t => (
                <button key={t} onClick={() => setOptType(t)} style={{
                  flex:1, padding:"11px 0", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.15s",
                  border:`1.5px solid ${optType===t ? (t==="call"?EM:"#ef4444") : "#334155"}`,
                  background:optType===t ? (t==="call"?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)") : "transparent",
                  color:optType===t ? (t==="call"?EM:"#ef4444") : "#475569",
                }}>
                  {t === "call" ? "📈 Call" : "📉 Put"}
                </button>
              ))}
            </div>
          </div>

          {/* Right column: price card + decomposition */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Price hero */}
            <div style={{ background:`linear-gradient(135deg, ${optType==="call"?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)"} 0%, rgba(15,23,42,0.6) 100%)`, border:`1px solid ${optType==="call"?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)"}`, borderRadius:22, padding:"24px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
              <div>
                <div style={{ color:optType==="call"?"#6ee7b7":"#fca5a5", fontSize:12, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>
                  {optType.toUpperCase()} OPTION PRICE
                </div>
                <div style={{ color:"#fff", fontSize:isMobile?40:56, fontWeight:900, fontFamily:"monospace", letterSpacing:"-0.03em", lineHeight:1 }}>
                  ${price !== null ? price.toFixed(4) : "—"}
                </div>
                <div style={{ color:"#475569", fontSize:12, marginTop:10, fontFamily:"monospace" }}>
                  d₁ = {res?.d1.toFixed(4)} &nbsp;·&nbsp; d₂ = {res?.d2.toFixed(4)}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:"#475569", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:6 }}>MONEYNESS</div>
                <div style={{ color:moneynessColor, fontSize:18, fontWeight:800 }}>{moneyness}</div>
                <div style={{ color:"#334155", fontSize:12, marginTop:5, fontFamily:"monospace" }}>S/K = {(S/K).toFixed(3)}</div>
              </div>
            </div>

            {/* Price decomposition — fills the blank spot */}
            <PriceDecomposition price={price} intrinsic={intrinsic} timeVal={timeVal} optType={optType} />

            {/* Put-call parity */}
            <div style={{ background:"#1e293b", border:"1px solid #1e293b", borderRadius:14, padding:"14px 18px", display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
              <div>
                <div style={{ color:"#475569", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:4 }}>PUT-CALL PARITY</div>
                <div style={{ color:"#64748b", fontSize:12, fontFamily:"monospace" }}>
                  C − P = <span style={{ color:"#fff", fontWeight:700 }}>{res ? (res.call-res.put).toFixed(4) : "—"}</span>
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  S − Ke<sup>−rT</sup> = <span style={{ color:EM, fontWeight:700 }}>{res ? (S - K*Math.exp(-r*T)).toFixed(4) : "—"}</span>
                </div>
              </div>
              <div style={{ marginLeft:"auto", color:"#334155", fontSize:12, fontFamily:"monospace" }}>C − P = S − Ke<sup>−rT</sup></div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Greeks ─────────────────────────────────────────── */}
        <div style={{ marginBottom:56 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:4, height:28, background:"linear-gradient(to bottom, #3b82f6, #8b5cf6)", borderRadius:2 }} />
            <div>
              <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:0 }}>The Greeks</h2>
              <p style={{ color:"#475569", fontSize:13, margin:0 }}>How sensitive your option is to each market variable — updates live</p>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4, 1fr)", gap:14 }}>
            <GreekCard symbol="Δ" label="DELTA"
              value={delta !== null ? delta.toFixed(4) : "—"}
              color="#3b82f6" desc="Price move per $1 in stock"
              interpretation={delta !== null ? `Stock rises $1 → option ${delta>0?"gains":"loses"} $${Math.abs(delta).toFixed(2)}` : undefined} />
            <GreekCard symbol="Θ" label="THETA / day"
              value={theta !== null ? theta.toFixed(4) : "—"}
              color="#ef4444" desc="Value lost per calendar day"
              interpretation={theta !== null ? `Loses ~$${Math.abs(theta).toFixed(2)} every day even if stock is flat` : undefined} />
            <GreekCard symbol="ν" label="VEGA / 1% vol"
              value={res ? res.vega.toFixed(4) : "—"}
              color="#f59e0b" desc="Price move per 1% vol change"
              interpretation={res ? `Vol rises 1% → option gains $${res.vega.toFixed(2)}` : undefined} />
            <GreekCard symbol="Γ" label="GAMMA"
              value={res ? res.gamma.toFixed(6) : "—"}
              color="#8b5cf6" desc="Rate delta is changing"
              interpretation={res ? `Delta shifts ${res.gamma.toFixed(4)} per $1 spot move` : undefined} />
          </div>
        </div>

        {/* ── Section 3: Payoff Diagram ──────────────────────────────────── */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:4, height:28, background:"linear-gradient(to bottom, #10b981, #34d399)", borderRadius:2 }} />
            <div>
              <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:0 }}>Payoff at Expiry</h2>
              <p style={{ color:"#475569", fontSize:13, margin:0 }}>What happens to your P&amp;L if you hold to expiration?</p>
            </div>
          </div>

          {/* Strategy selector */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
            {PAYOFF_TYPES.map(pt => (
              <button key={pt.id} onClick={() => setPayoffType(pt.id)} style={{
                padding:"9px 18px", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s",
                border:`1.5px solid ${payoffType===pt.id ? pt.color : "#334155"}`,
                background:payoffType===pt.id ? `${pt.color}18` : "transparent",
                color:payoffType===pt.id ? pt.color : "#64748b",
              }}>
                {pt.label}
              </button>
            ))}
          </div>

          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:22, padding:28 }}>
            {/* Strategy description */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ color:selPayoff.color, fontWeight:800, fontSize:16 }}>{selPayoff.label}</span>
                <span style={{ color:"#475569", fontSize:13, marginLeft:12 }}>{selPayoff.desc}</span>
              </div>
              <div style={{ display:"flex", gap:16, fontSize:12 }}>
                {breakevens.map((be, i) => (
                  <div key={i} style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, padding:"4px 12px", color:"#f59e0b", fontWeight:700 }}>
                    BE ≈ ${be}
                  </div>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payoffData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="spot" stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>`$${v}`} />
                <YAxis stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>`$${v.toFixed(1)}`} width={60} />
                <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, fontSize:12 }}
                  labelFormatter={v=>`Stock at expiry: $${v}`}
                  formatter={v => [`$${v.toFixed(4)}`, "P&L"]} />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
                <ReferenceLine x={S} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
                  label={{ value:"Spot", fill:"#f59e0b", fontSize:11, position:"insideTopRight" }} />
                <ReferenceLine x={K} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1}
                  label={{ value:"Strike", fill:"#94a3b8", fontSize:11, position:"insideTopLeft" }} />
                <Line type="monotone" dataKey="pnl" stroke={selPayoff.color} strokeWidth={2.5} dot={false} name="P&L" />
              </LineChart>
            </ResponsiveContainer>

            {/* Explanation cards */}
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:12, marginTop:20 }}>
              {[
                { label:"Max Profit", val: payoffType==="long_call"||payoffType==="long_put" ? "Unlimited / large" : `$${(payoffType==="short_call"?res?.call:res?.put??0).toFixed(2)} (premium)`, color:"#10b981" },
                { label:"Max Loss",   val: payoffType==="long_call"||payoffType==="long_put" ? `$${(payoffType==="long_call"?res?.call:res?.put??0).toFixed(2)} (premium)` : "Unlimited / large", color:"#ef4444" },
                { label:"Breakeven",  val: breakevens.length ? breakevens.map(b=>`$${b}`).join(", ") : "—", color:"#f59e0b" },
              ].map(c => (
                <div key={c.label} style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:"12px 16px" }}>
                  <div style={{ color:"#475569", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:4 }}>{c.label}</div>
                  <div style={{ color:c.color, fontWeight:700, fontSize:14, fontFamily:"monospace" }}>{c.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
