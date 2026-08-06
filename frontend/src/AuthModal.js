import { useState } from "react";
import { createPortal } from "react-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const friendly = (code) => {
    if (code === "auth/email-already-in-use") return "An account with this email already exists.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/invalid-credential") return "Incorrect email or password.";
    if (code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth) { setError("Auth is not configured yet."); return; }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) await updateProfile(user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(friendly(err.code));
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!auth) return;
    if (!isValidEmail(email)) { setError("Enter your email above first, then click Forgot password."); return; }
    setError("");
    await sendPasswordResetEmail(auth, email);
    setResetSent(true);
  };

  const inputStyle = {
    padding: "13px 16px",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    color: "#0f172a",
    fontSize: 15,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 400, fontFamily: "Inter, sans-serif", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", position: "relative" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#94a3b8", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 4 }}>×</button>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            {mode === "login" ? "👋" : "🚀"}
          </div>
          <h2 style={{ color: "#0f172a", fontWeight: 800, fontSize: 22, margin: "0 0 6px" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            {mode === "login"
              ? "Sign in to access your QuantWorld account."
              : "Join QuantWorld and start learning quant finance."}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                style={inputStyle}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
              {mode === "login" && (
                <span onClick={handleForgotPassword} style={{ fontSize: 12, color: "#0ea5e9", cursor: "pointer", fontWeight: 600 }}>
                  Forgot password?
                </span>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
              required
              style={inputStyle}
            />
          </div>
          {resetSent && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ color: "#16a34a", fontSize: 13, margin: 0 }}>✓ Reset link sent — check your inbox.</p>
            </div>
          )}
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "14px", background: loading ? "#94a3b8" : "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, transition: "background 0.2s" }}
          >
            {loading ? "Just a sec..." : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginTop: 20 }}>
          {mode === "login" ? "New to QuantWorld? " : "Already have an account? "}
          <span
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ color: "#0ea5e9", cursor: "pointer", fontWeight: 600 }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </span>
        </p>
      </div>
    </div>,
    document.body
  );
}
