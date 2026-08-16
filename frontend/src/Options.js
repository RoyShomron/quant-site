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
    rhoCall:   K*T*eRT*normCDF(d2) / 100,
    rhoPut:   -K*T*eRT*normCDF(-d2) / 100,
  };
}

const EM = "#10b981";

// ── Sub-components ────────────────────────────────────────────────────────────
function InputSlider({ label, value, setValue, min, max, step, fmt }) {
  return (
    <div style={{ marginBottom: 20 }}>
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

  const res = useMemo(() => bs(S, K, T, r, sigma), [S, K, T, r, sigma]);

  const price = res ? (optType === "call" ? res.call : res.put) : null;
  const delta = res ? (optType === "call" ? res.deltaCall : res.deltaPut) : null;
  const theta = res ? (optType === "call" ? res.thetaCall : res.thetaPut) : null;

  const itm = optType === "call" ? S > K : S < K;
  const atm = S === K;
  const moneyness = atm ? "At the Money" : itm ? "In the Money" : "Out of the Money";
  const moneynessColor = atm ? "#f59e0b" : itm ? "#10b981" : "#ef4444";

  // Simple payoff at expiry diagram
  const payoffData = useMemo(() => {
    if (!res) return [];
    const lo = S * 0.5, hi = S * 1.5;
    return Array.from({ length: 100 }, (_, i) => {
      const ST = lo + (hi - lo) * i / 99;
      const callPnl = Math.max(ST - K, 0) - res.call;
      const putPnl  = Math.max(K - ST, 0) - res.put;
      return { spot: +ST.toFixed(1), call: +callPnl.toFixed(3), put: +putPnl.toFixed(3) };
    });
  }, [S, K, res]);

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
          Live Black-Scholes pricing with real-time Greeks and payoff diagrams
        </p>

        {/* Learn article CTA */}
        <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
          <button onClick={() => navigate("/learn")}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 24px", background:"rgba(16,185,129,0.12)", border:"1.5px solid rgba(16,185,129,0.4)", borderRadius:14, cursor:"pointer", transition:"all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(16,185,129,0.2)"; e.currentTarget.style.borderColor="#10b981"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(16,185,129,0.12)"; e.currentTarget.style.borderColor="rgba(16,185,129,0.4)"; }}>
            <span style={{ fontSize:18 }}>📖</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ color:EM, fontWeight:800, fontSize:14 }}>New to options? Read the guide first</div>
              <div style={{ color:"#475569", fontSize:12 }}>"What are Options?" · "The Greeks Explained" — on the Learn page</div>
            </div>
            <span style={{ color:EM, fontSize:18 }}>→</span>
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"24px 16px":"52px 32px" }}>

        {/* ── Pricer ───────────────────────────────────────────────────────── */}
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

          {/* Price output */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:`linear-gradient(135deg, ${optType==="call"?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)"} 0%, rgba(15,23,42,0.6) 100%)`, border:`1px solid ${optType==="call"?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)"}`, borderRadius:22, padding:"28px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
              <div>
                <div style={{ color:optType==="call"?"#6ee7b7":"#fca5a5", fontSize:12, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>
                  {optType.toUpperCase()} OPTION PRICE
                </div>
                <div style={{ color:"#fff", fontSize:isMobile?44:60, fontWeight:900, fontFamily:"monospace", letterSpacing:"-0.03em", lineHeight:1 }}>
                  ${price !== null ? price.toFixed(4) : "—"}
                </div>
                <div style={{ color:"#475569", fontSize:12, marginTop:10, fontFamily:"monospace" }}>
                  d₁ = {res?.d1.toFixed(4)} &nbsp;·&nbsp; d₂ = {res?.d2.toFixed(4)}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:"#475569", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:8 }}>MONEYNESS</div>
                <div style={{ color:moneynessColor, fontSize:20, fontWeight:800 }}>{moneyness}</div>
                <div style={{ color:"#334155", fontSize:12, marginTop:6, fontFamily:"monospace" }}>S/K = {(S/K).toFixed(3)}</div>
                <div style={{ color:"#334155", fontSize:12, marginTop:3, fontFamily:"monospace" }}>
                  Intrinsic value: ${Math.max(optType==="call" ? S-K : K-S, 0).toFixed(2)}
                </div>
                <div style={{ color:"#334155", fontSize:12, marginTop:3, fontFamily:"monospace" }}>
                  Time value: ${price !== null ? Math.max(price - Math.max(optType==="call"?S-K:K-S, 0), 0).toFixed(2) : "—"}
                </div>
              </div>
            </div>

            {/* Put-call parity */}
            <div style={{ background:"#1e293b", border:"1px solid #1e293b", borderRadius:14, padding:"14px 18px", display:"flex", gap:24, flexWrap:"wrap" }}>
              <div>
                <div style={{ color:"#475569", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:4 }}>PUT-CALL PARITY CHECK</div>
                <div style={{ color:"#64748b", fontSize:12, fontFamily:"monospace" }}>
                  C − P = <span style={{ color:"#fff", fontWeight:700 }}>{res ? (res.call-res.put).toFixed(4) : "—"}</span>
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  S − Ke<sup>−rT</sup> = <span style={{ color:EM, fontWeight:700 }}>{res ? (S - K*Math.exp(-r*T)).toFixed(4) : "—"}</span>
                </div>
              </div>
              <div style={{ marginLeft:"auto", textAlign:"right" }}>
                <div style={{ color:"#475569", fontSize:11, fontWeight:700, letterSpacing:"0.06em", marginBottom:4 }}>FORMULA</div>
                <div style={{ color:"#64748b", fontSize:12, fontFamily:"monospace" }}>C − P = S − Ke<sup>−rT</sup></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Greeks ───────────────────────────────────────────────────────── */}
        <div style={{ marginBottom:56 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:4, height:28, background:"linear-gradient(to bottom, #3b82f6, #8b5cf6)", borderRadius:2 }} />
            <div>
              <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:0 }}>The Greeks</h2>
              <p style={{ color:"#475569", fontSize:13, margin:0 }}>How sensitive your option is to each market variable</p>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4, 1fr)", gap:14 }}>
            <GreekCard symbol="Δ" label="DELTA"
              value={delta !== null ? delta.toFixed(4) : "—"}
              color="#3b82f6"
              desc="Price move per $1 in stock"
              interpretation={delta !== null ? `Stock rises $1 → option ${delta>0?"gains":"loses"} $${Math.abs(delta).toFixed(2)}` : undefined} />
            <GreekCard symbol="Θ" label="THETA / day"
              value={theta !== null ? theta.toFixed(4) : "—"}
              color="#ef4444"
              desc="Value lost per calendar day"
              interpretation={theta !== null ? `Option loses ~$${Math.abs(theta).toFixed(2)} of value every day, even if stock is flat` : undefined} />
            <GreekCard symbol="ν" label="VEGA / 1% vol"
              value={res ? res.vega.toFixed(4) : "—"}
              color="#f59e0b"
              desc="Price move per 1% vol change"
              interpretation={res ? `Vol rises 1% → option ${res.vega>0?"gains":"loses"} $${res.vega.toFixed(2)}` : undefined} />
            <GreekCard symbol="Γ" label="GAMMA"
              value={res ? res.gamma.toFixed(6) : "—"}
              color="#8b5cf6"
              desc="Rate delta is changing"
              interpretation={res ? `Delta shifts by ${res.gamma.toFixed(4)} for every $1 spot move — highest near expiry` : undefined} />
          </div>
        </div>

        {/* ── Payoff at Expiry ──────────────────────────────────────────────── */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:4, height:28, background:"linear-gradient(to bottom, #10b981, #34d399)", borderRadius:2 }} />
            <div>
              <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:0 }}>Payoff at Expiry</h2>
              <p style={{ color:"#475569", fontSize:13, margin:0 }}>
                P&amp;L if you hold the option to expiration — for both a call and put at strike ${K}
              </p>
            </div>
          </div>

          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:22, padding:28 }}>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap", marginBottom:20, fontSize:13 }}>
              <span><span style={{ color:"#10b981", fontWeight:700, fontSize:16 }}>——</span> <span style={{ color:"#94a3b8" }}>Long Call (right to buy)</span></span>
              <span><span style={{ color:"#ef4444", fontWeight:700, fontSize:16 }}>——</span> <span style={{ color:"#94a3b8" }}>Long Put (right to sell)</span></span>
              <span style={{ marginLeft:"auto" }}><span style={{ color:"#f59e0b" }}>- - -</span> <span style={{ color:"#64748b" }}>Current spot ${S} · Strike ${K}</span></span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payoffData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="spot" stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>`$${v}`} />
                <YAxis stroke="#334155" tick={{ fill:"#475569", fontSize:11 }} tickFormatter={v=>`$${v.toFixed(1)}`} width={60} />
                <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, fontSize:12 }}
                  labelFormatter={v=>`Stock at expiry: $${v}`}
                  formatter={(v,n) => [`$${v.toFixed(4)}`, n==="call"?"Call P&L":"Put P&L"]} />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
                <ReferenceLine x={S} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
                  label={{ value:"Spot", fill:"#f59e0b", fontSize:11, position:"insideTopRight" }} />
                <ReferenceLine x={K} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1}
                  label={{ value:"Strike", fill:"#94a3b8", fontSize:11, position:"insideTopLeft" }} />
                <Line type="monotone" dataKey="call" stroke="#10b981" strokeWidth={2.5} dot={false} name="call" />
                <Line type="monotone" dataKey="put"  stroke="#ef4444" strokeWidth={2.5} dot={false} name="put" />
              </LineChart>
            </ResponsiveContainer>

            {/* Explanation */}
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14, marginTop:20 }}>
              <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ color:"#10b981", fontWeight:700, fontSize:13, marginBottom:6 }}>📈 Long Call</div>
                <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
                  Breakeven at <span style={{ color:"#fff", fontWeight:700 }}>${res ? (K + res.call).toFixed(2) : "—"}</span> (strike + premium paid).<br/>
                  Profit is <span style={{ color:"#10b981", fontWeight:700 }}>unlimited</span> as stock rises.<br/>
                  Max loss: <span style={{ color:"#ef4444", fontWeight:700 }}>${res ? res.call.toFixed(4) : "—"}</span> (just the premium).
                </div>
              </div>
              <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ color:"#ef4444", fontWeight:700, fontSize:13, marginBottom:6 }}>📉 Long Put</div>
                <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
                  Breakeven at <span style={{ color:"#fff", fontWeight:700 }}>${res ? (K - res.put).toFixed(2) : "—"}</span> (strike − premium paid).<br/>
                  Profit grows as stock <span style={{ color:"#ef4444", fontWeight:700 }}>falls</span> toward zero.<br/>
                  Max loss: <span style={{ color:"#ef4444", fontWeight:700 }}>${res ? res.put.toFixed(4) : "—"}</span> (just the premium).
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
