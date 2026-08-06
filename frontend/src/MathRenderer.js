import React from "react";

// ── Symbol map ────────────────────────────────────────────────────────────────
const SYM = {
  // Greek lowercase
  alpha:"α", beta:"β", gamma:"γ", delta:"δ", epsilon:"ε",
  theta:"θ", lambda:"λ", mu:"μ", nu:"ν", xi:"ξ", pi:"π",
  rho:"ρ", sigma:"σ", tau:"τ", phi:"φ", chi:"χ", psi:"ψ", omega:"ω",
  // Greek uppercase
  Gamma:"Γ", Delta:"Δ", Sigma:"Σ", Pi:"Π", Omega:"Ω", Lambda:"Λ",
  // Operators
  times:"×", div:"÷", pm:"±", approx:"≈", neq:"≠",
  leq:"≤", geq:"≥", cdot:"·", ldots:"…", infty:"∞",
  sum:"Σ", prod:"Π", partial:"∂", nabla:"∇",
  // Arrows
  to:"→", rightarrow:"→", leftarrow:"←", Rightarrow:"⇒", Leftarrow:"⇐",
  leftrightarrow:"↔", Leftrightarrow:"⟺", mapsto:"↦",
  // Spacing — render as actual space characters
  quad:"  ", qquad:"    ",
  ",":" ", ";":" ", ":":" ",
  // Functions (render upright, not italic)
  ln:"ln", log:"log", exp:"exp", sin:"sin", cos:"cos", tan:"tan",
  max:"max", min:"min", lim:"lim", det:"det",
  // Brackets — let through as plain text
  left:"", right:"",
};

// ── Group parser ─────────────────────────────────────────────────────────────
// Reads content inside {…}. If no `{`, reads a single character.
function parseGroup(str, i) {
  if (i >= str.length) return { content: "", end: i };
  if (str[i] !== "{") return { content: str[i] || "", end: i + 1 };
  let depth = 0;
  let j = i + 1;
  while (j < str.length) {
    if (str[j] === "{") depth++;
    else if (str[j] === "}") {
      if (depth === 0) return { content: str.slice(i + 1, j), end: j + 1 };
      depth--;
    }
    j++;
  }
  return { content: str.slice(i + 1), end: str.length };
}

// ── Core parser ───────────────────────────────────────────────────────────────
// ctr = { k: 0 } — shared counter ensures unique React keys across recursion
function parseExpr(str, ctr) {
  if (!ctr) ctr = { k: 0 };
  const result = [];
  let i = 0;
  let buf = "";

  const flush = () => { if (buf) { result.push(buf); buf = ""; } };

  while (i < str.length) {
    const ch = str[i];

    // ── LaTeX command ─────────────────────────────────────────────────────────
    if (ch === "\\") {
      flush();
      let j = i + 1;
      while (j < str.length && /[a-zA-Z]/.test(str[j])) j++;
      const cmd = str.slice(i + 1, j);
      i = j;
      const skip = () => { while (i < str.length && str[i] === " ") i++; };

      if (cmd === "text" || cmd === "mathrm" || cmd === "textbf") {
        skip();
        const inner = parseGroup(str, i); i = inner.end;
        const k = ctr.k++;
        result.push(
          <span key={k} style={{ fontFamily: "Inter, sans-serif", fontStyle: "normal", fontWeight: cmd === "textbf" ? 700 : 400 }}>
            {inner.content}
          </span>
        );
      } else if (cmd === "frac") {
        skip();
        const num = parseGroup(str, i); i = num.end; skip();
        const den = parseGroup(str, i); i = den.end;
        const k = ctr.k++;
        result.push(
          <span key={k} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 4px", lineHeight: 1.4 }}>
            <span style={{ borderBottom: "1.5px solid currentColor", padding: "1px 6px 3px", minWidth: 12, textAlign: "center", fontSize: "0.87em" }}>
              {parseExpr(num.content, ctr)}
            </span>
            <span style={{ padding: "3px 6px 1px", minWidth: 12, textAlign: "center", fontSize: "0.87em" }}>
              {parseExpr(den.content, ctr)}
            </span>
          </span>
        );

      } else if (cmd === "sqrt") {
        skip();
        const inner = parseGroup(str, i); i = inner.end;
        const k = ctr.k++;
        result.push(
          <span key={k} style={{ display: "inline-flex", alignItems: "flex-end", verticalAlign: "middle", margin: "0 2px" }}>
            <span style={{ fontSize: "1.15em", lineHeight: 1, marginBottom: -1, marginRight: -1, opacity: 0.9 }}>√</span>
            <span style={{ borderTop: "1.5px solid currentColor", paddingLeft: 3, paddingRight: 4, paddingTop: 2 }}>
              {parseExpr(inner.content, ctr)}
            </span>
          </span>
        );

      } else if (cmd === "bar" || cmd === "overline") {
        skip();
        const inner = parseGroup(str, i); i = inner.end;
        const k = ctr.k++;
        result.push(
          <span key={k} style={{ display: "inline-block", textDecoration: "overline", textDecorationColor: "currentColor" }}>
            {parseExpr(inner.content, ctr)}
          </span>
        );

      } else if (SYM[cmd] !== undefined) {
        const sym = SYM[cmd];
        if (sym) result.push(<span key={ctr.k++}>{sym}</span>);

      } else {
        // Unknown — render italicised
        result.push(<span key={ctr.k++} style={{ fontStyle: "italic" }}>{cmd}</span>);
      }

    // ── Superscript ────────────────────────────────────────────────────────────
    } else if (ch === "^") {
      flush();
      i++;
      while (i < str.length && str[i] === " ") i++;
      const g = parseGroup(str, i); i = g.end;
      result.push(
        <sup key={ctr.k++} style={{ fontSize: "0.68em", verticalAlign: "super", lineHeight: 0, marginLeft: 1 }}>
          {parseExpr(g.content, ctr)}
        </sup>
      );

    // ── Subscript ──────────────────────────────────────────────────────────────
    } else if (ch === "_") {
      flush();
      i++;
      while (i < str.length && str[i] === " ") i++;
      const g = parseGroup(str, i); i = g.end;
      result.push(
        <sub key={ctr.k++} style={{ fontSize: "0.68em", verticalAlign: "sub", lineHeight: 0, marginLeft: 0.5 }}>
          {parseExpr(g.content, ctr)}
        </sub>
      );

    // ── Plain character ────────────────────────────────────────────────────────
    } else {
      buf += ch;
      i++;
    }
  }

  flush();
  return result;
}

// ── Public component ──────────────────────────────────────────────────────────
// <MathExpr display>  → centred block equation
// <MathExpr>          → inline equation
export function MathExpr({ children, display = false }) {
  const lines = String(children).split("\n");
  const rendered = lines.map((line, li) => (
    <span key={li} style={{ display: display ? "block" : "inline", textAlign: display ? "center" : "inherit", lineHeight: display ? 2.2 : "inherit" }}>
      <span style={{ fontFamily: '"STIX Two Math","Latin Modern Math","Cambria Math",Georgia,serif', fontSize: display ? "1.15em" : "1em", letterSpacing: display ? "0.03em" : 0 }}>
        {parseExpr(line, { k: li * 1000 })}
      </span>
    </span>
  ));
  return display
    ? <div style={{ padding: "8px 0" }}>{rendered}</div>
    : <span>{rendered}</span>;
}

export default MathExpr;
