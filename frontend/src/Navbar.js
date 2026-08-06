import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWindowSize } from "./useWindowSize";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";

const NAV_LINKS = [
  { label: "Home",         path: "/" },
  { label: "Learn",        path: "/learn" },
  { label: "Backtest",     path: "/backtest" },
  { label: "Brainteasers", path: "/brainteasers" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useWindowSize();
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav style={{
      background: "rgba(9,14,27,0.97)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #1e293b",
      padding: isMobile ? "0 20px" : "0 44px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <span onClick={() => navigate("/")} style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, cursor: "pointer", flexShrink: 0, userSelect: "none" }}>
        <span style={{ color: "#0ea5e9", fontSize: 38, fontFamily: "Georgia, serif", verticalAlign: "bottom", lineHeight: 1 }}>Q</span>
        <span style={{ color: "#fff" }}>uantWorld</span>
      </span>

      {/* Centre nav links — absolutely positioned so they're always truly centred */}
      {!isMobile && (
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 2,
        }}>
          {NAV_LINKS.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <button key={path} onClick={() => navigate(path)} style={{
                background: active ? "rgba(14,165,233,0.12)" : "transparent",
                border: active ? "1px solid rgba(14,165,233,0.22)" : "1px solid transparent",
                borderRadius: 9,
                padding: "6px 16px",
                color: active ? "#fff" : "#8b9eb5",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = "#e2e8f0";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = "#8b9eb5";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}>
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Right side */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>


        {/* User avatar / sign in */}
        {user ? (
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowUserMenu(v => !v)} style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "5px 10px", borderRadius: 10,
              border: "1px solid #1e293b", transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                    {(user.displayName || user.email)[0].toUpperCase()}
                  </div>
              }
              {!isMobile && (
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                  {user.displayName || user.email.split("@")[0]}
                </span>
              )}
            </div>
            {showUserMenu && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 8, minWidth: 164, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 200 }}>
                <div style={{ padding: "8px 12px", fontSize: 13, color: "#64748b", borderBottom: "1px solid #0f172a", marginBottom: 4 }}>{user.email}</div>
                <button onClick={() => { logout(); setShowUserMenu(false); }} style={{ width: "100%", padding: "8px 12px", background: "transparent", border: "none", color: "#ef4444", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left", borderRadius: 8 }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} style={{
            padding: isMobile ? "7px 16px" : "8px 22px",
            background: "#1e293b", color: "#e2e8f0",
            border: "1.5px solid #475569", borderRadius: 10,
            fontSize: isMobile ? 13 : 14, fontWeight: 700,
            cursor: "pointer", transition: "all 0.15s",
            letterSpacing: "0.01em",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#263548"; e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.borderColor = "#475569"; e.currentTarget.style.color = "#e2e8f0"; }}>
            Sign In
          </button>
        )}

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    </nav>
  );
}
