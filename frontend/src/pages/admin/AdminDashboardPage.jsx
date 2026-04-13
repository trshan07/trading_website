import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// ─── re-export everything from part 1 inline (merged single file) ──────────
// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_USERS = [
  { id: 1, name: "James Whitfield", email: "james@example.com", phone: "+1-555-0101", balance: 125000, equity: 131200, credit: 5000, totalTrades: 142, profit: 6200, status: "active", kyc: "verified", kycSubmitted: "2024-01-10", kycReviewedAt: "2024-01-12", joined: "2024-01-12", country: "US", accountType: "Premium", leverage: 100, avatar: "JW",
    kycDocs: [
      { id: 1, type: "passport", label: "Passport / ID", file: "passport_james.jpg", status: "verified", uploadedAt: "2024-01-10", rejectReason: null },
      { id: 2, type: "utility", label: "Proof of Address", file: "utility_james.pdf", status: "verified", uploadedAt: "2024-01-10", rejectReason: null },
      { id: 3, type: "selfie", label: "Selfie with ID", file: "selfie_james.jpg", status: "verified", uploadedAt: "2024-01-10", rejectReason: null },
    ], creditHistory: [{ id: 1, amount: 5000, type: "credit", note: "Welcome bonus", date: "2024-01-15" }], notes: "VIP client. Referred by broker." },
  { id: 2, name: "Priya Nair", email: "priya@example.com", phone: "+44-555-0202", balance: 58700, equity: 61400, credit: 0, totalTrades: 87, profit: 2700, status: "active", kyc: "verified", kycSubmitted: "2024-02-05", kycReviewedAt: "2024-02-08", joined: "2024-02-08", country: "UK", accountType: "Standard", leverage: 50,
    kycDocs: [
      { id: 4, type: "passport", label: "Passport / ID", file: "passport_priya.jpg", status: "verified", uploadedAt: "2024-02-05", rejectReason: null },
      { id: 5, type: "utility", label: "Proof of Address", file: "utility_priya.pdf", status: "verified", uploadedAt: "2024-02-05", rejectReason: null },
      { id: 6, type: "selfie", label: "Selfie with ID", file: "selfie_priya.jpg", status: "verified", uploadedAt: "2024-02-05", rejectReason: null },
    ], creditHistory: [], notes: "" },
  { id: 3, name: "Carlos Mendez", email: "carlos@example.com", phone: "+34-555-0303", balance: 9200, equity: 8800, credit: 200, totalTrades: 23, profit: -400, status: "pending", kyc: "pending", kycSubmitted: "2024-03-13", kycReviewedAt: null, joined: "2024-03-15", country: "ES", accountType: "Basic", leverage: 30,
    kycDocs: [
      { id: 7, type: "passport", label: "Passport / ID", file: "passport_carlos.jpg", status: "pending", uploadedAt: "2024-03-13", rejectReason: null },
      { id: 8, type: "utility", label: "Proof of Address", file: "utility_carlos.pdf", status: "pending", uploadedAt: "2024-03-13", rejectReason: null },
      { id: 9, type: "selfie", label: "Selfie with ID", file: null, status: "missing", uploadedAt: null, rejectReason: null },
    ], creditHistory: [{ id: 2, amount: 200, type: "credit", note: "Demo credit", date: "2024-03-16" }], notes: "Missing selfie doc." },
  { id: 4, name: "Mei Lin", email: "mei@example.com", phone: "+86-555-0404", balance: 247000, equity: 259000, credit: 10000, totalTrades: 310, profit: 12000, status: "active", kyc: "verified", kycSubmitted: "2023-11-20", kycReviewedAt: "2023-11-22", joined: "2023-11-22", country: "CN", accountType: "VIP", leverage: 200,
    kycDocs: [
      { id: 10, type: "passport", label: "Passport / ID", file: "passport_mei.jpg", status: "verified", uploadedAt: "2023-11-20", rejectReason: null },
      { id: 11, type: "utility", label: "Proof of Address", file: "utility_mei.pdf", status: "verified", uploadedAt: "2023-11-20", rejectReason: null },
      { id: 12, type: "selfie", label: "Selfie with ID", file: "selfie_mei.jpg", status: "verified", uploadedAt: "2023-11-20", rejectReason: null },
    ], creditHistory: [{ id: 3, amount: 10000, type: "credit", note: "VIP loyalty bonus", date: "2024-02-01" }], notes: "Top VIP. Priority handling." },
  { id: 5, name: "Ahmed Khalil", email: "ahmed@example.com", phone: "+20-555-0505", balance: 3100, equity: 2900, credit: 0, totalTrades: 11, profit: -200, status: "suspended", kyc: "rejected", kycSubmitted: "2024-03-30", kycReviewedAt: "2024-04-01", joined: "2024-04-01", country: "EG", accountType: "Basic", leverage: 10,
    kycDocs: [
      { id: 13, type: "passport", label: "Passport / ID", file: "passport_ahmed.jpg", status: "rejected", uploadedAt: "2024-03-30", rejectReason: "Document expired" },
      { id: 14, type: "utility", label: "Proof of Address", file: "utility_ahmed.pdf", status: "rejected", uploadedAt: "2024-03-30", rejectReason: "Address does not match" },
      { id: 15, type: "selfie", label: "Selfie with ID", file: "selfie_ahmed.jpg", status: "rejected", uploadedAt: "2024-03-30", rejectReason: "Face not clearly visible" },
    ], creditHistory: [], notes: "Suspended - requires re-KYC." },
  { id: 6, name: "Sofia Bianchi", email: "sofia@example.com", phone: "+39-555-0606", balance: 72400, equity: 78000, credit: 1500, totalTrades: 95, profit: 5600, status: "active", kyc: "under_review", kycSubmitted: "2024-04-05", kycReviewedAt: null, joined: "2024-01-30", country: "IT", accountType: "Standard", leverage: 50,
    kycDocs: [
      { id: 16, type: "passport", label: "Passport / ID", file: "passport_sofia.jpg", status: "verified", uploadedAt: "2024-04-05", rejectReason: null },
      { id: 17, type: "utility", label: "Proof of Address", file: "utility_sofia.pdf", status: "under_review", uploadedAt: "2024-04-05", rejectReason: null },
      { id: 18, type: "selfie", label: "Selfie with ID", file: "selfie_sofia.jpg", status: "under_review", uploadedAt: "2024-04-05", rejectReason: null },
    ], creditHistory: [{ id: 4, amount: 1500, type: "credit", note: "Referral bonus", date: "2024-02-15" }], notes: "Re-submitted after address change." },
];

const MOCK_FUNDING = [
  { id: 1, userId: 1, userName: "James Whitfield", type: "deposit", amount: 10000, method: "Bank Transfer", status: "pending", proof: "receipt_001.pdf", created: "2024-04-06T14:23:00", note: "", bankRef: "TXN-2024-001" },
  { id: 2, userId: 2, userName: "Priya Nair", type: "withdrawal", amount: 5000, method: "Wire Transfer", status: "pending", proof: null, created: "2024-04-06T11:10:00", note: "", bankRef: "" },
  { id: 3, userId: 4, userName: "Mei Lin", type: "deposit", amount: 25000, method: "Crypto USDT", status: "approved", proof: "txhash_mei.pdf", created: "2024-04-05T09:00:00", note: "Verified on-chain", bankRef: "0xabc123" },
  { id: 4, userId: 3, userName: "Carlos Mendez", type: "withdrawal", amount: 1500, method: "Bank Transfer", status: "rejected", proof: null, created: "2024-04-04T16:45:00", note: "KYC not completed", bankRef: "" },
  { id: 5, userId: 6, userName: "Sofia Bianchi", type: "deposit", amount: 8000, method: "Credit Card", status: "approved", proof: "cc_receipt.pdf", created: "2024-04-03T12:20:00", note: "", bankRef: "CC-88821" },
  { id: 6, userId: 1, userName: "James Whitfield", type: "withdrawal", amount: 3000, method: "Bank Transfer", status: "pending", proof: null, created: "2024-04-07T08:00:00", note: "", bankRef: "" },
];

const MOCK_TRADES = [
  { id: 1, userId: 1, userName: "James Whitfield", symbol: "BTC/USD", type: "buy", lots: 0.5, openPrice: 67450, closePrice: 68900, profit: 725, status: "closed", opened: "2024-04-05T08:00:00", closed: "2024-04-06T14:00:00", swap: -12 },
  { id: 2, userId: 2, userName: "Priya Nair", symbol: "EUR/USD", type: "sell", lots: 2.0, openPrice: 1.0845, closePrice: null, profit: -120, status: "open", opened: "2024-04-06T10:30:00", closed: null, swap: -4 },
  { id: 3, userId: 4, userName: "Mei Lin", symbol: "GOLD", type: "buy", lots: 5.0, openPrice: 2310, closePrice: 2345, profit: 1750, status: "closed", opened: "2024-04-04T07:00:00", closed: "2024-04-05T16:00:00", swap: -30 },
  { id: 4, userId: 6, userName: "Sofia Bianchi", symbol: "ETH/USD", type: "buy", lots: 1.0, openPrice: 3180, closePrice: null, profit: 240, status: "open", opened: "2024-04-06T12:00:00", closed: null, swap: -8 },
  { id: 5, userId: 1, userName: "James Whitfield", symbol: "USD/JPY", type: "sell", lots: 3.0, openPrice: 151.24, closePrice: 150.80, profit: 880, status: "closed", opened: "2024-04-03T06:00:00", closed: "2024-04-04T18:00:00", swap: -22 },
  { id: 6, userId: 4, userName: "Mei Lin", symbol: "SPX500", type: "buy", lots: 2.0, openPrice: 5210, closePrice: null, profit: 640, status: "open", opened: "2024-04-07T09:00:00", closed: null, swap: -15 },
];

const VOL_DATA = [{ m: "Oct", v: 980000 }, { m: "Nov", v: 1250000 }, { m: "Dec", v: 1580000 }, { m: "Jan", v: 1320000 }, { m: "Feb", v: 1690000 }, { m: "Mar", v: 2100000 }, { m: "Apr", v: 1840000 }];
const UG_DATA = [{ m: "Oct", u: 98 }, { m: "Nov", u: 124 }, { m: "Dec", u: 159 }, { m: "Jan", u: 201 }, { m: "Feb", u: 245 }, { m: "Mar", u: 289 }, { m: "Apr", u: 321 }];

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const C = {
  bg: "#060B11", bgCard: "#0C1520", bgHover: "#101C2A", border: "#162030", borderLight: "#1E2E40",
  gold: "#D4A843", goldLight: "#F0C85A", goldDim: "rgba(212,168,67,0.15)",
  text: "#E2D5BC", textMuted: "#7A92A8", textDim: "#4A6070",
  green: "#3DD68C", greenDim: "rgba(61,214,140,0.12)",
  red: "#E05555", redDim: "rgba(224,85,85,0.12)",
  blue: "#5BA4E6", blueDim: "rgba(91,164,230,0.12)",
  amber: "#F0B429", amberDim: "rgba(240,180,41,0.12)",
  purple: "#9B72CF", purpleDim: "rgba(155,114,207,0.12)",
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n ?? 0);
const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n ?? 0);
const timeAgo = (d) => { if (!d) return "—"; const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return `${~~s}s ago`; if (s < 3600) return `${~~(s / 60)}m ago`; if (s < 86400) return `${~~(s / 3600)}h ago`; return `${~~(s / 86400)}d ago`; };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const generateAccountId = (kind, userId) => {
  const base = String(userId ?? Date.now()).replace(/\D/g, "") || String(Date.now());
  return `${kind === "demo" ? "DM" : "RL"}-${base}`;
};

const normalizeUserAccounts = (user) => {
  const realBalance = user?.realBalance != null ? toNum(user.realBalance) : toNum(user?.balance);
  const demoBalance = user?.demoBalance != null ? toNum(user.demoBalance) : 0;
  const realCredit = user?.realCredit != null ? toNum(user.realCredit) : toNum(user?.credit);
  const demoCredit = user?.demoCredit != null ? toNum(user.demoCredit) : 0;
  const realAccountId = user?.realAccountId || generateAccountId("real", user?.id);
  const demoAccountId = user?.demoAccountId || generateAccountId("demo", user?.id);

  return {
    ...user,
    realBalance,
    demoBalance,
    realCredit,
    demoCredit,
    realAccountId,
    demoAccountId,
    balance: realBalance + demoBalance,
    credit: realCredit + demoCredit,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// BASE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
function StatusBadge({ status }) {
  const map = { active: { bg: C.greenDim, color: C.green, label: "Active" }, pending: { bg: C.amberDim, color: C.amber, label: "Pending" }, suspended: { bg: C.redDim, color: C.red, label: "Suspended" }, verified: { bg: C.greenDim, color: C.green, label: "Verified" }, rejected: { bg: C.redDim, color: C.red, label: "Rejected" }, approved: { bg: C.greenDim, color: C.green, label: "Approved" }, under_review: { bg: C.blueDim, color: C.blue, label: "In Review" }, open: { bg: C.blueDim, color: C.blue, label: "Open" }, closed: { bg: "rgba(74,96,112,0.2)", color: C.textMuted, label: "Closed" }, deposit: { bg: C.greenDim, color: C.green, label: "Deposit" }, withdrawal: { bg: "rgba(224,85,85,0.12)", color: "#F08080", label: "Withdraw" }, missing: { bg: C.purpleDim, color: C.purple, label: "Missing" }, credit: { bg: C.goldDim, color: C.gold, label: "Credit" }, debit: { bg: C.redDim, color: C.red, label: "Debit" } };
  const c = map[status] || map.pending;
  return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}25`, borderRadius: "5px", padding: "2px 9px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{c.label}</span>;
}

function UserAvatar({ name = "", size = 36 }) {
  const colors = ["linear-gradient(135deg,#1E4D8C,#2A6BB5)", "linear-gradient(135deg,#1A5C3A,#25843F)", "linear-gradient(135deg,#5C2A1A,#8A3F25)", "linear-gradient(135deg,#3A1A5C,#5A2A8A)", "linear-gradient(135deg,#1A3A5C,#2A5A8C)"];
  const idx = name.charCodeAt(0) % colors.length;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: size * 0.28, background: colors[idx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, color: "rgba(255,255,255,0.9)", flexShrink: 0 }}>{initials}</div>;
}

function Btn({ children, onClick, variant = "primary", size = "md", danger, disabled, icon, fullWidth }) {
  const pad = size === "sm" ? "5px 11px" : size === "lg" ? "12px 28px" : "8px 16px";
  const fs = size === "sm" ? "11px" : "13px";
  const base = { borderRadius: "7px", padding: pad, fontSize: fs, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: "0.02em", transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: "5px", border: "1px solid transparent", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap", width: fullWidth ? "100%" : "auto", justifyContent: "center" };
  const vs = { primary: { background: `linear-gradient(135deg,${C.gold},#B8861A)`, color: "#060B11" }, secondary: { background: "transparent", color: C.text, borderColor: C.border }, ghost: { background: C.goldDim, color: C.gold, borderColor: `${C.gold}25` }, outline: { background: "transparent", color: C.textMuted, borderColor: C.borderLight } };
  const s = danger ? { background: C.redDim, color: C.red, borderColor: `${C.red}25` } : vs[variant];
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...s }}>{icon && <span>{icon}</span>}{children}</button>;
}

function Input({ label, value, onChange, type = "text", disabled, placeholder, hint, error }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      {label && <label style={{ display: "block", color: C.textMuted, fontSize: "11px", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</label>}
      <input type={type} value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder}
        style={{ width: "100%", background: disabled ? C.bg : C.bgCard, border: `1px solid ${error ? C.red : C.border}`, borderRadius: "7px", padding: "9px 13px", color: disabled ? C.textDim : C.text, fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      {hint && !error && <div style={{ fontSize: "11px", color: C.textDim, marginTop: "4px" }}>{hint}</div>}
      {error && <div style={{ fontSize: "11px", color: C.red, marginTop: "4px" }}>{error}</div>}
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      {label && <label style={{ display: "block", color: C.textMuted, fontSize: "11px", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</label>}
      <textarea value={value ?? ""} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "9px 13px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
    </div>
  );
}

function Sel({ label, value, onChange, options, disabled }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      {label && <label style={{ display: "block", color: C.textMuted, fontSize: "11px", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</label>}
      <select value={value ?? ""} onChange={onChange} disabled={disabled}
        style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "9px 13px", color: disabled ? C.textDim : C.text, fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, width = "560px" }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,11,17,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", padding: "16px" }} onClick={onClose}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.borderLight}`, borderRadius: "16px", width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 26px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <h3 style={{ color: C.text, fontSize: "16px", fontWeight: 700, margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ color: C.textMuted, fontSize: "12px", marginTop: "3px" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, color: C.textMuted, fontSize: "13px", cursor: "pointer", padding: "4px 10px", borderRadius: "6px" }}>✕</button>
        </div>
        <div style={{ padding: "22px 26px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 2000, display: "flex", flexDirection: "column", gap: "8px", maxWidth: "340px", width: "calc(100vw - 40px)" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === "success" ? "#061A0F" : t.type === "error" ? "#1A0606" : "#0C1520", border: `1px solid ${t.type === "success" ? "#3DD68C30" : t.type === "error" ? "#E0555530" : "#D4A84330"}`, borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <span style={{ fontSize: "15px", flexShrink: 0 }}>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: t.type === "success" ? C.green : t.type === "error" ? C.red : C.gold }}>{t.title}</div>
            {t.msg && <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{t.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, color = C.gold, h = 40, w = 110 }) {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", flexShrink: 0 }}>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`${color}20`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BarMini({ data, color = C.gold }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "64px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", minWidth: 0 }}>
          <div style={{ width: "100%", height: `${(d.v / max) * 48}px`, background: i === data.length - 1 ? color : `${color}45`, borderRadius: "2px 2px 0 0", transition: "height 0.4s" }} />
          <span style={{ fontSize: "7px", color: C.textDim, fontFamily: "monospace" }}>{d.m}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = C.gold, spark, icon }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "8px" }}>{label}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "21px", fontWeight: 600, color: C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: "11px", color, marginTop: "6px" }}>{sub}</div>}
        </div>
        {spark ? <Sparkline data={spark} color={color} /> : icon ? <div style={{ fontSize: "22px", opacity: 0.35 }}>{icon}</div> : null}
      </div>
    </div>
  );
}

function Card({ children, title, subtitle, extra, noPad, style: s = {} }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", ...s }}>
      {(title || extra) && (
        <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{subtitle}</div>}
          </div>
          {extra}
        </div>
      )}
      <div style={noPad ? {} : { padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function AdminCRM() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [page, setPage] = useState("dashboard");
  const [users, setUsers] = useState(() => MOCK_USERS.map(normalizeUserAccounts));
  const [funding, setFunding] = useState(MOCK_FUNDING);
  const [trades] = useState(MOCK_TRADES);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toastId = useRef(0);

  const toast = (title, msg = "", type = "success") => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, title, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const handleAdminLogout = () => {
    try {
      if (typeof auth?.logout === "function") {
        auth.logout();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("trading_mode");
      }
    } finally {
      navigate("/login");
    }
  };

  const stats = {
    totalUsers: users.length, activeUsers: users.filter(u => u.status === "active").length,
    pendingKyc: users.filter(u => ["pending", "under_review"].includes(u.kyc)).length,
    totalBalance: users.reduce((s, u) => s + u.balance, 0),
    totalCredit: users.reduce((s, u) => s + (u.credit || 0), 0),
    pendingFunding: funding.filter(f => f.status === "pending").length,
    totalTrades: trades.length, openTrades: trades.filter(t => t.status === "open").length,
    totalVolume: 1840000,
  };

  const NAV = [
    { id: "dashboard", icon: "⬡", label: "Overview" },
    { id: "users", icon: "◈", label: "Users" },
    { id: "kyc", icon: "⊕", label: "KYC", badge: stats.pendingKyc },
    { id: "credits", icon: "◎", label: "Credits" },
    { id: "funding", icon: "⊞", label: "Funding", badge: stats.pendingFunding },
    { id: "trades", icon: "◇", label: "Trades" },
    { id: "reports", icon: "▦", label: "Reports" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  const NavContent = () => (
    <>
      {NAV.map(item => (
        <div key={item.id}
          onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: sidebarOpen ? "10px 16px" : "10px", cursor: "pointer", borderLeft: `3px solid ${page === item.id ? C.gold : "transparent"}`, background: page === item.id ? C.goldDim : "transparent", color: page === item.id ? C.gold : C.textMuted, marginBottom: "1px", transition: "all 0.15s", borderRadius: "0 7px 7px 0", marginRight: "8px" }}
          onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = C.text; } }}
          onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}>
          <span style={{ fontSize: "16px", width: "20px", textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
          {sidebarOpen && <span style={{ fontSize: "13px", fontWeight: 500, flex: 1 }}>{item.label}</span>}
          {sidebarOpen && item.badge > 0 && <span style={{ background: C.gold, color: "#060B11", borderRadius: "10px", padding: "1px 7px", fontSize: "10px", fontWeight: 700 }}>{item.badge}</span>}
          {!sidebarOpen && item.badge > 0 && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.gold, position: "absolute", right: "6px", top: "6px" }} />}
        </div>
      ))}
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#060B11;font-family:'DM Sans',sans-serif;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1E2E40;border-radius:2px;}
        input:focus,select:focus,textarea:focus{border-color:#D4A84350!important;box-shadow:0 0 0 3px rgba(212,168,67,0.07)!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .page-anim{animation:fadeUp 0.22s ease;}
        .mono{font-family:'IBM Plex Mono',monospace!important;}
        .syne{font-family:'Syne',sans-serif!important;}
        @media(max-width:768px){.hide-mobile{display:none!important;}.mobile-full{width:100%!important;}}
        @media(max-width:480px){.responsive-grid-2{grid-template-columns:1fr!important;}}
      `}</style>

      <Toast toasts={toasts} />

      {/* Mobile Overlay */}
      {mobileMenuOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(6,11,17,0.85)", zIndex: 150, backdropFilter: "blur(4px)" }} onClick={() => setMobileMenuOpen(false)} />}

      <div style={{ display: "flex", height: "100dvh", background: C.bg, overflow: "hidden" }}>

        {/* ── SIDEBAR (Desktop) ─────────────────────────────── */}
        <aside className="hide-mobile" style={{ width: sidebarOpen ? "220px" : "56px", minWidth: sidebarOpen ? "220px" : "56px", background: C.bgCard, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", position: "relative", zIndex: 10 }}>
          {/* Logo */}
          <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div style={{ width: "32px", height: "32px", background: `linear-gradient(135deg,${C.gold},#8A5C00)`, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>◈</div>
            {sidebarOpen && <div><div className="syne" style={{ fontWeight: 800, fontSize: "15px", color: C.text, letterSpacing: "-0.02em" }}>Rizal CRM</div><div style={{ fontSize: "9px", color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase" }}>Admin Console</div></div>}
          </div>
          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto", overflowX: "hidden" }}>
            <NavContent />
          </nav>
          {/* Collapse */}
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div onClick={() => setSidebarOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: C.textMuted, fontSize: "12px", padding: "6px 4px" }}>
              <span style={{ fontSize: "14px" }}>{sidebarOpen ? "◁" : "▷"}</span>
              {sidebarOpen && <span>Collapse</span>}
            </div>
          </div>
        </aside>

        {/* ── MOBILE SIDEBAR ────────────────────────────────── */}
        <aside style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "240px", background: C.bgCard, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", zIndex: 200, transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", background: `linear-gradient(135deg,${C.gold},#8A5C00)`, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>◈</div>
              <div className="syne" style={{ fontWeight: 800, fontSize: "15px", color: C.text }}>Rizal CRM</div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: "18px", cursor: "pointer" }}>✕</button>
          </div>
          <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}><NavContent /></nav>
        </aside>

        {/* ── MAIN ─────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Top Bar */}
          <header style={{ background: C.bgCard, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer", padding: "6px 9px", borderRadius: "7px", fontSize: "14px", display: "none" }} className="mobile-menu-btn">☰</button>
              <div>
                <div className="syne" style={{ fontWeight: 700, fontSize: "16px", color: C.text }}>{NAV.find(n => n.id === page)?.label || "Dashboard"}</div>
                <div style={{ fontSize: "11px", color: C.textMuted }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {stats.pendingKyc > 0 && <div style={{ background: C.amberDim, border: `1px solid ${C.amber}25`, borderRadius: "7px", padding: "5px 11px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={() => setPage("kyc")}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.amber, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: C.amber, fontWeight: 600 }}>{stats.pendingKyc} KYC pending</span>
              </div>}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
                <span className="mono" style={{ fontSize: "11px", color: C.green }}>LIVE</span>
              </div>
              <Btn variant="secondary" size="sm" onClick={handleAdminLogout}>Logout</Btn>
            </div>
          </header>
          <style>{`.mobile-menu-btn{display:none!important;} @media(max-width:768px){.mobile-menu-btn{display:flex!important;}}`}</style>

          {/* Page */}
          <main style={{ flex: 1, overflow: "auto", padding: "20px" }} className="page-anim">
            {page === "dashboard" && <DashboardPage stats={stats} users={users} funding={funding} trades={trades} setPage={setPage} />}
            {page === "users" && <UsersPage users={users} setUsers={setUsers} toast={toast} />}
            {page === "kyc" && <KYCPage users={users} setUsers={setUsers} toast={toast} />}
            {page === "credits" && <CreditsPage users={users} setUsers={setUsers} toast={toast} />}
            {page === "funding" && <FundingPage funding={funding} setFunding={setFunding} users={users} setUsers={setUsers} toast={toast} />}
            {page === "trades" && <TradesPage trades={trades} />}
            {page === "reports" && <ReportsPage users={users} trades={trades} funding={funding} />}
            {page === "settings" && <SettingsPage toast={toast} />}
          </main>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function DashboardPage({ stats, users, funding, trades, setPage }) {
  const kpis = [
    { label: "Total Users", value: fmtNum(stats.totalUsers), sub: `${stats.activeUsers} active`, spark: [98, 124, 159, 201, 245, 289, 321], color: C.gold },
    { label: "Platform Balance", value: fmt(stats.totalBalance), sub: "All accounts", spark: [820000, 940000, 1100000, 980000, 1240000, 1690000, stats.totalBalance], color: C.blue },
    { label: "Total Credits", value: fmt(stats.totalCredit), sub: "Active credit lines", spark: [3000, 5200, 4800, 7100, 9200, 12000, stats.totalCredit], color: C.purple },
    { label: "Pending KYC", value: fmtNum(stats.pendingKyc), sub: "Needs review", spark: [4, 6, 3, 8, 5, 7, stats.pendingKyc], color: C.amber },
    { label: "Monthly Volume", value: fmt(stats.totalVolume), sub: "+12.4% vs last month", spark: [980000, 1250000, 1580000, 1320000, 1690000, 2100000, 1840000], color: C.green },
    { label: "Pending Funding", value: fmtNum(stats.pendingFunding), sub: "Awaiting approval", spark: [2, 4, 3, 6, 4, 5, stats.pendingFunding], color: C.red },
    { label: "Open Trades", value: fmtNum(stats.openTrades), sub: "Live positions", spark: [12, 18, 14, 22, 17, 20, stats.openTrades], color: C.blue },
    { label: "Success Rate", value: "98.5%", sub: "Trade execution", spark: [97.1, 97.8, 98.0, 97.5, 98.2, 98.4, 98.5], color: C.green },
  ];

  return (
    <div>
      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {/* Charts + Activity Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: "16px", marginBottom: "20px" }} className="responsive-grid-2">
        <Card title="Trading Volume" subtitle="Last 7 months" extra={<span className="mono" style={{ fontSize: "16px", color: C.gold, fontWeight: 600 }}>{fmt(1840000)}</span>}>
          <BarMini data={VOL_DATA} color={C.gold} />
        </Card>
        <Card title="User Growth" subtitle="Monthly registrations" extra={<span className="mono" style={{ fontSize: "16px", color: C.green, fontWeight: 600 }}>321</span>}>
          <BarMini data={UG_DATA.map(d => ({ m: d.m, v: d.u }))} color={C.green} />
        </Card>
        <Card title="User Status" subtitle="Distribution">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            {[
              { label: "Active", count: users.filter(u => u.status === "active").length, color: C.green },
              { label: "Pending", count: users.filter(u => u.status === "pending").length, color: C.amber },
              { label: "Suspended", count: users.filter(u => u.status === "suspended").length, color: C.red },
            ].map(s => {
              const pct = users.length ? (s.count / users.length) * 100 : 0;
              return (
                <div key={s.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: C.textMuted }}>{s.label}</span>
                    <span className="mono" style={{ fontSize: "12px", color: s.color }}>{s.count}</span>
                  </div>
                  <div style={{ height: "4px", background: C.border, borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: "2px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="responsive-grid-2">
        {/* Pending Actions */}
        <Card title="Pending Actions" subtitle="Requires attention" extra={<Btn size="sm" variant="ghost" onClick={() => setPage("funding")}>View All</Btn>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {funding.filter(f => f.status === "pending").slice(0, 4).map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: C.bg, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <UserAvatar name={f.userName} size={30} />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{f.userName}</div>
                    <div style={{ fontSize: "10px", color: C.textMuted }}>{f.method} · {timeAgo(f.created)}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: "12px", color: f.type === "deposit" ? C.green : C.red }}>{f.type === "withdrawal" ? "−" : "+"}{fmt(f.amount)}</div>
                  <StatusBadge status={f.type} />
                </div>
              </div>
            ))}
            {funding.filter(f => f.status === "pending").length === 0 && <div style={{ padding: "24px", textAlign: "center", color: C.textDim, fontSize: "13px" }}>No pending requests</div>}
          </div>
        </Card>

        {/* KYC Alerts */}
        <Card title="KYC Alerts" subtitle="Recent submissions" extra={<Btn size="sm" variant="ghost" onClick={() => setPage("kyc")}>Review All</Btn>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {users.filter(u => ["pending", "under_review"].includes(u.kyc)).map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: C.bg, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <UserAvatar name={u.name} size={30} />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{u.name}</div>
                    <div style={{ fontSize: "10px", color: C.textMuted }}>Submitted {fmtDate(u.kycSubmitted)}</div>
                  </div>
                </div>
                <StatusBadge status={u.kyc} />
              </div>
            ))}
            {users.filter(u => ["pending", "under_review"].includes(u.kyc)).length === 0 && <div style={{ padding: "24px", textAlign: "center", color: C.textDim, fontSize: "13px" }}>All KYC up to date</div>}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Card title="Open Trades Snapshot" subtitle="Live positions by instrument" extra={<Btn size="sm" variant="ghost" onClick={() => setPage("trades")}>Open Trades</Btn>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {trades.filter(t => t.status === "open").map(t => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) auto auto", gap: "10px", alignItems: "center", padding: "10px 12px", background: C.bg, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.gold }} className="mono">{t.symbol}</div>
                  <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "2px" }}>{t.userName}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "10px", color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Opened</div>
                  <div className="mono" style={{ fontSize: "11px", color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtDateTime(t.opened)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Volume</div>
                  <div className="mono" style={{ fontSize: "12px", color: C.text, fontWeight: 600 }}>{t.lots} lots</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusBadge status={t.type} />
                </div>
              </div>
            ))}
            {trades.filter(t => t.status === "open").length === 0 && <div style={{ padding: "24px", textAlign: "center", color: C.textDim, fontSize: "13px" }}>No open trades</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// USERS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function UsersPage({ users, setUsers, toast }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [resetModal, setResetModal] = useState(null);
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const match = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.country?.toLowerCase().includes(s);
    return match && (statusFilter === "all" || u.status === statusFilter) && (kycFilter === "all" || u.kyc === kycFilter);
  });

  const openEdit = (u) => { setForm({ ...u }); setModal("edit"); };
  const openAdd = () => { setForm({ name: "", email: "", phone: "", country: "", accountType: "Basic", status: "pending", kyc: "pending", balance: 0, credit: 0, realBalance: 0, demoBalance: 0, realCredit: 0, demoCredit: 0, leverage: 50, notes: "" }); setModal("add"); };
  const openView = (u) => { setForm({ ...u }); setModal("view"); };

  const saveUser = () => {
    if (!form.name || !form.email) return toast("Validation Error", "Name and email required", "error");
    if (modal === "add") {
      setUsers(p => [...p, normalizeUserAccounts({
        ...form,
        id: Date.now(),
        realBalance: parseFloat(form.balance) || 0,
        demoBalance: 0,
        realCredit: parseFloat(form.credit) || 0,
        demoCredit: 0,
        equity: parseFloat(form.balance) || 0,
        totalTrades: 0,
        profit: 0,
        joined: new Date().toISOString().split("T")[0],
        kycDocs: [],
        creditHistory: [],
      })]);
      toast("User Created", form.name);
    } else {
      setUsers(p => p.map(u => (u.id === form.id ? normalizeUserAccounts({ ...u, ...form }) : u)));
      toast("User Updated", form.name);
    }
    setModal(null);
  };

  const deleteUser = (u) => setConfirm({ msg: `Permanently delete ${u.name}? This cannot be undone.`, onConfirm: () => { setUsers(p => p.filter(x => x.id !== u.id)); setConfirm(null); toast("User Deleted", u.name, "error"); } });
  const toggleStatus = (u) => { setUsers(p => p.map(x => x.id === u.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x)); toast("Status Updated", u.name); };
  const openResetPassword = (u) => {
    setResetModal(u);
    setResetForm({ password: "", confirmPassword: "" });
  };

  const submitResetPassword = () => {
    const nextPassword = resetForm.password?.trim() || "";
    if (nextPassword.length < 8) {
      return toast("Validation Error", "Password must be at least 8 characters", "error");
    }
    if (nextPassword !== resetForm.confirmPassword) {
      return toast("Validation Error", "Passwords do not match", "error");
    }

    setUsers(p => p.map(u => (u.id === resetModal.id
      ? {
          ...u,
          passwordResetAt: new Date().toISOString(),
          forcePasswordChange: true,
        }
      : u)));

    toast("Password Reset", `${resetModal.name} must set a new password on next login`);
    setResetModal(null);
    setResetForm({ password: "", confirmPassword: "" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div><h2 className="syne" style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>User Management</h2><p style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{filtered.length} of {users.length} users</p></div>
        <Btn onClick={openAdd} icon="＋">Add User</Btn>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
          <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: C.textDim }}>⌕</span>
          <input placeholder="Search name, email, country..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "8px 12px 8px 32px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
        {[
          { value: statusFilter, onChange: setStatusFilter, opts: [["all","All Status"],["active","Active"],["pending","Pending"],["suspended","Suspended"]] },
          { value: kycFilter, onChange: setKycFilter, opts: [["all","All KYC"],["verified","Verified"],["pending","Pending"],["under_review","In Review"],["rejected","Rejected"]] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "8px 12px", color: C.text, fontSize: "12px", outline: "none", fontFamily: "inherit" }}>
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "900px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["User", "Account", "Balance", "Credit", "Trades", "KYC", "Status", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: C.bg, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: "48px", textAlign: "center", color: C.textDim, fontSize: "13px" }}>No users found</td></tr>}
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <UserAvatar name={u.name} size={32} />
                      <div><div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{u.name}</div><div style={{ fontSize: "11px", color: C.textMuted }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "11px", color: C.textMuted }}>
                    {u.accountType}<br />
                    <span style={{ fontSize: "10px" }}>1:{u.leverage}</span><br />
                    <span className="mono" style={{ fontSize: "9px", color: C.blue }}>R: {u.realAccountId}</span><br />
                    <span className="mono" style={{ fontSize: "9px", color: C.purple }}>D: {u.demoAccountId}</span>
                  </td>
                  <td style={{ padding: "11px 14px" }}><div className="mono" style={{ fontSize: "12px", color: C.text }}>{fmt(u.balance)}</div><div className="mono" style={{ fontSize: "10px", color: u.equity >= u.balance ? C.green : C.red }}>EQ: {fmt(u.equity)}</div></td>
                  <td style={{ padding: "11px 14px" }}><div className="mono" style={{ fontSize: "12px", color: u.credit > 0 ? C.gold : C.textDim }}>{fmt(u.credit)}</div></td>
                  <td style={{ padding: "11px 14px" }}><div className="mono" style={{ fontSize: "12px", color: C.textMuted }}>{u.totalTrades}</div></td>
                  <td style={{ padding: "11px 14px" }}><StatusBadge status={u.kyc} /></td>
                  <td style={{ padding: "11px 14px" }}><StatusBadge status={u.status} /></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.textMuted }}>{fmtDate(u.joined)}</span></td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      <Btn size="sm" variant="outline" onClick={() => openView(u)}>View</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(u)}>Edit</Btn>
                      <Btn size="sm" variant="secondary" onClick={() => openResetPassword(u)}>Reset PW</Btn>
                      <Btn size="sm" danger onClick={() => toggleStatus(u)}>{u.status === "active" ? "Suspend" : "Activate"}</Btn>
                      <Btn size="sm" danger onClick={() => deleteUser(u)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "add" ? "Add New User" : "Edit User"} subtitle={modal === "edit" ? form.email : "Fill in user details"} width="600px">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Country" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
          <Sel label="Account Type" value={form.accountType} onChange={e => setForm(p => ({ ...p, accountType: e.target.value }))} options={["Basic","Standard","Premium","VIP"].map(v => ({ value: v, label: v }))} />
          <Sel label="Leverage" value={String(form.leverage)} onChange={e => setForm(p => ({ ...p, leverage: parseInt(e.target.value) }))} options={[10,20,30,50,100,200,500].map(v => ({ value: String(v), label: `1:${v}` }))} />
          <Sel label="Account Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={[["active","Active"],["pending","Pending"],["suspended","Suspended"]].map(([v,l]) => ({ value: v, label: l }))} />
          <Sel label="KYC Status" value={form.kyc} onChange={e => setForm(p => ({ ...p, kyc: e.target.value }))} options={[["verified","Verified"],["pending","Pending"],["under_review","Under Review"],["rejected","Rejected"]].map(([v,l]) => ({ value: v, label: l }))} />
          {modal === "add" && <>
            <Input label="Initial Balance (USD)" type="number" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: parseFloat(e.target.value) || 0 }))} />
            <Input label="Initial Credit (USD)" type="number" value={form.credit} onChange={e => setForm(p => ({ ...p, credit: parseFloat(e.target.value) || 0 }))} />
          </>}
        </div>
        <Textarea label="Admin Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Internal notes (not visible to user)" rows={2} />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={saveUser}>{modal === "add" ? "Create User" : "Save Changes"}</Btn>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === "view"} onClose={() => setModal(null)} title={form.name} subtitle={form.email} width="580px">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          {[["Balance", fmt(form.balance), C.text], ["Equity", fmt(form.equity), form.equity >= form.balance ? C.green : C.red], ["Credit", fmt(form.credit), C.gold], ["Total Trades", fmtNum(form.totalTrades), C.text], ["P&L", fmt(form.profit), form.profit >= 0 ? C.green : C.red], ["Leverage", `1:${form.leverage}`, C.text]].map(([l, v, c], i) => (
            <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{l}</div>
              <div className="mono" style={{ fontSize: "16px", color: c, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "12px 14px" }}><div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Status</div><StatusBadge status={form.status} /></div>
          <div style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "12px 14px" }}><div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>KYC</div><StatusBadge status={form.kyc} /></div>
          <div style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "12px 14px" }}><div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Joined</div><span style={{ fontSize: "12px", color: C.text }}>{fmtDate(form.joined)}</span></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Real Account ID</div>
            <span className="mono" style={{ fontSize: "12px", color: C.blue }}>{form.realAccountId}</span>
          </div>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Demo Account ID</div>
            <span className="mono" style={{ fontSize: "12px", color: C.purple }}>{form.demoAccountId}</span>
          </div>
        </div>
        {form.notes && <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 14px", marginBottom: "16px" }}><div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Admin Notes</div><div style={{ fontSize: "12px", color: C.textMuted }}>{form.notes}</div></div>}
        {form.creditHistory?.length > 0 && (
          <div><div style={{ fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", fontWeight: 600 }}>Credit History</div>
            {form.creditHistory.map(h => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.bg, borderRadius: "6px", marginBottom: "6px" }}>
                <div><div style={{ fontSize: "12px", color: C.text }}>{h.note}</div><div style={{ fontSize: "10px", color: C.textMuted }}>{fmtDate(h.date)}</div></div>
                <span className="mono" style={{ fontSize: "13px", color: C.gold, fontWeight: 600 }}>{fmt(h.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!resetModal} onClose={() => setResetModal(null)} title={`Reset Password — ${resetModal?.name || ""}`} subtitle={resetModal?.email || ""} width="460px">
        <div style={{ marginBottom: "14px", fontSize: "12px", color: C.textMuted, lineHeight: 1.6 }}>
          Set a temporary password for this user. They will be asked to change it at the next sign-in.
        </div>
        <Input
          label="New Temporary Password"
          type="password"
          value={resetForm.password}
          onChange={e => setResetForm(p => ({ ...p, password: e.target.value }))}
          placeholder="Minimum 8 characters"
        />
        <Input
          label="Confirm Password"
          type="password"
          value={resetForm.confirmPassword}
          onChange={e => setResetForm(p => ({ ...p, confirmPassword: e.target.value }))}
          placeholder="Re-enter password"
        />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
          <Btn variant="secondary" onClick={() => setResetModal(null)}>Cancel</Btn>
          <Btn onClick={submitResetPassword}>Confirm Reset</Btn>
        </div>
      </Modal>

      <ConfirmBox confirm={confirm} setConfirm={setConfirm} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KYC MANAGEMENT PAGE
// ═══════════════════════════════════════════════════════════════════════════
function KYCPage({ users, setUsers, toast }) {
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = users.filter(u => filter === "all" || u.kyc === filter);

  const openReview = (u) => { setSelectedUser(u); setModal(true); };

  const verifyDoc = (userId, docId) => {
    setUsers(p => p.map(u => {
      if (u.id !== userId) return u;
      return { ...u, kycDocs: u.kycDocs.map(d => d.id === docId ? { ...d, status: "verified", rejectReason: null } : d) };
    }));
    if (selectedUser) setSelectedUser(prev => ({ ...prev, kycDocs: prev.kycDocs.map(d => d.id === docId ? { ...d, status: "verified", rejectReason: null } : d) }));
    toast("Document Verified", "Status updated to verified");
  };

  const openReject = (doc) => { setRejectModal(doc); setRejectReason(""); };

  const rejectDoc = () => {
    if (!rejectReason.trim()) return toast("Reason required", "Please enter a rejection reason", "error");
    const userId = selectedUser.id;
    const docId = rejectModal.id;
    setUsers(p => p.map(u => {
      if (u.id !== userId) return u;
      return { ...u, kycDocs: u.kycDocs.map(d => d.id === docId ? { ...d, status: "rejected", rejectReason } : d) };
    }));
    setSelectedUser(prev => ({ ...prev, kycDocs: prev.kycDocs.map(d => d.id === docId ? { ...d, status: "rejected", rejectReason } : d) }));
    setRejectModal(null);
    toast("Document Rejected", rejectReason, "error");
  };

  const approveAllKyc = (userId) => {
    setUsers(p => p.map(u => {
      if (u.id !== userId) return u;
      return { ...u, kyc: "verified", kycReviewedAt: new Date().toISOString(), kycDocs: u.kycDocs.map(d => d.status !== "missing" ? { ...d, status: "verified" } : d) };
    }));
    setModal(false);
    toast("KYC Approved", "User fully verified ✓");
  };

  const rejectAllKyc = (userId) => {
    setUsers(p => p.map(u => {
      if (u.id !== userId) return u;
      return { ...u, kyc: "rejected", kycReviewedAt: new Date().toISOString() };
    }));
    setModal(false);
    toast("KYC Rejected", "User notified", "error");
  };

  const requestResubmission = (userId) => {
    setUsers(p => p.map(u => u.id !== userId ? u : { ...u, kyc: "pending", kycReviewedAt: null }));
    setModal(false);
    toast("Resubmission Requested", "User will be notified");
  };

  const kycCounts = { all: users.length, pending: users.filter(u => u.kyc === "pending").length, under_review: users.filter(u => u.kyc === "under_review").length, verified: users.filter(u => u.kyc === "verified").length, rejected: users.filter(u => u.kyc === "rejected").length };

  const DOC_ICONS = { passport: "🪪", utility: "🏠", selfie: "🤳" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div><h2 className="syne" style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>KYC Management</h2><p style={{ fontSize: "12px", color: C.textMuted }}>Review and verify customer identity documents</p></div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total", count: kycCounts.all, color: C.textMuted },
          { label: "Pending", count: kycCounts.pending, color: C.amber },
          { label: "In Review", count: kycCounts.under_review, color: C.blue },
          { label: "Verified", count: kycCounts.verified, color: C.green },
          { label: "Rejected", count: kycCounts.rejected, color: C.red },
        ].map(s => (
          <div key={s.label} onClick={() => setFilter(s.label.toLowerCase().replace(" ", "_") === "total" ? "all" : s.label.toLowerCase().replace(" ", "_"))}
            style={{ background: C.bgCard, border: `1px solid ${filter === (s.label === "Total" ? "all" : s.label.toLowerCase().replace(" ", "_")) ? s.color : C.border}`, borderRadius: "10px", padding: "14px", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            <div className="mono" style={{ fontSize: "24px", color: s.color, fontWeight: 600, marginTop: "4px" }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* KYC Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "700px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["User", "Documents Status", "KYC Status", "Submitted", "Reviewed", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: C.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: C.textDim, fontSize: "13px" }}>No users match this filter</td></tr>}
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <UserAvatar name={u.name} size={32} />
                      <div><div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{u.name}</div><div style={{ fontSize: "10px", color: C.textMuted }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {u.kycDocs.map(d => (
                        <div key={d.id} title={d.label} style={{ display: "flex", alignItems: "center", gap: "3px", background: d.status === "verified" ? C.greenDim : d.status === "rejected" ? C.redDim : d.status === "missing" ? C.purpleDim : C.amberDim, borderRadius: "5px", padding: "2px 7px", fontSize: "10px", color: d.status === "verified" ? C.green : d.status === "rejected" ? C.red : d.status === "missing" ? C.purple : C.amber }}>
                          <span>{DOC_ICONS[d.type]}</span>
                          <span style={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{d.status === "verified" ? "✓" : d.status === "rejected" ? "✕" : d.status === "missing" ? "!" : "…"}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={u.kyc} /></td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.textMuted }}>{fmtDate(u.kycSubmitted)}</span></td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "11px", color: u.kycReviewedAt ? C.textMuted : C.amber }}>{u.kycReviewedAt ? fmtDate(u.kycReviewedAt) : "Not yet"}</span></td>
                  <td style={{ padding: "12px 14px" }}>
                    <Btn size="sm" variant={["pending", "under_review"].includes(u.kyc) ? "ghost" : "outline"} onClick={() => openReview(u)}>
                      {["pending", "under_review"].includes(u.kyc) ? "Review ▸" : "View Docs"}
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* KYC Review Modal */}
      <Modal open={modal && !!selectedUser} onClose={() => setModal(false)} title={`KYC Review — ${selectedUser?.name}`} subtitle={selectedUser?.email} width="680px">
        {selectedUser && (
          <>
            {/* Doc status bar */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", padding: "12px 14px", background: C.bg, borderRadius: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: C.textMuted, marginRight: "4px" }}>KYC Status:</span>
              <StatusBadge status={selectedUser.kyc} />
              <span style={{ marginLeft: "auto", fontSize: "11px", color: C.textMuted }}>Submitted: {fmtDate(selectedUser.kycSubmitted)}</span>
            </div>

            {/* Documents */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {selectedUser.kycDocs.map(doc => (
                <div key={doc.id} style={{ background: C.bg, border: `1px solid ${doc.status === "verified" ? `${C.green}30` : doc.status === "rejected" ? `${C.red}30` : C.border}`, borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: C.bgCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                        {doc.status === "missing" ? "📭" : DOC_ICONS[doc.type] || "📄"}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{doc.label}</div>
                        <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
                          {doc.status === "missing" ? "Not uploaded by user" : `${doc.file} · ${fmtDate(doc.uploadedAt)}`}
                        </div>
                        {doc.status === "rejected" && doc.rejectReason && (
                          <div style={{ fontSize: "11px", color: C.red, marginTop: "3px" }}>✕ {doc.rejectReason}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <StatusBadge status={doc.status} />
                      {doc.status !== "missing" && doc.file && (
                        <div style={{ background: C.bgCard, borderRadius: "6px", padding: "5px 10px", fontSize: "11px", color: C.blue, cursor: "pointer", border: `1px solid ${C.border}` }}>👁 Preview</div>
                      )}
                      {doc.status !== "verified" && doc.status !== "missing" && (
                        <Btn size="sm" onClick={() => verifyDoc(selectedUser.id, doc.id)}>✓ Verify</Btn>
                      )}
                      {doc.status !== "rejected" && doc.status !== "missing" && (
                        <Btn size="sm" danger onClick={() => openReject(doc)}>✕ Reject</Btn>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {selectedUser.notes && (
              <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 14px", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px", fontWeight: 600 }}>Admin Notes</div>
                <div style={{ fontSize: "12px", color: C.textMuted }}>{selectedUser.notes}</div>
              </div>
            )}

            {/* Actions */}
            {["pending", "under_review"].includes(selectedUser.kyc) && (
              <div style={{ display: "flex", gap: "8px", padding: "16px", background: C.bg, borderRadius: "10px", flexWrap: "wrap" }}>
                <Btn fullWidth={false} onClick={() => approveAllKyc(selectedUser.id)} icon="✓">Approve KYC</Btn>
                <Btn danger onClick={() => rejectAllKyc(selectedUser.id)} icon="✕">Reject KYC</Btn>
                <Btn variant="secondary" onClick={() => requestResubmission(selectedUser.id)}>↩ Request Resubmission</Btn>
              </div>
            )}
            {selectedUser.kyc === "verified" && (
              <div style={{ padding: "14px 16px", background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: "10px", color: C.green, fontSize: "13px", fontWeight: 500 }}>
                ✓ KYC fully verified — Reviewed {fmtDate(selectedUser.kycReviewedAt)}
              </div>
            )}
            {selectedUser.kyc === "rejected" && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: C.redDim, border: `1px solid ${C.red}30`, borderRadius: "10px", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ color: C.red, fontSize: "13px" }}>✕ KYC rejected</span>
                <Btn size="sm" onClick={() => requestResubmission(selectedUser.id)}>↩ Request Resubmission</Btn>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Reject Doc Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Document" subtitle={rejectModal?.label} width="420px">
        <Sel label="Rejection Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          options={["","Document expired","Document not legible","Name does not match","Address does not match","Face not clearly visible","Tampered document","Wrong document type"].map(v => ({ value: v, label: v || "Select reason..." }))} />
        <Textarea label="Additional Notes (optional)" value={rejectReason.startsWith("Select") ? "" : ""} onChange={() => {}} placeholder="Add any specific notes..." rows={2} />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Btn>
          <Btn danger onClick={rejectDoc}>Reject Document</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDITS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function CreditsPage({ users, setUsers, toast }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ amount: "", type: "credit", target: "real", note: "", expiry: "" });
  const [errors, setErrors] = useState({});

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const openCredit = (u) => { setModal(u); setForm({ amount: "", type: "credit", target: "real", note: "", expiry: "" }); setErrors({}); };

  const applyCredit = () => {
    const errs = {};
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) errs.amount = "Enter a valid amount";
    if (!form.note.trim()) errs.note = "Reason is required";
    if (!form.target) errs.target = "Select target account";
    if (Object.keys(errs).length) return setErrors(errs);

    const amt = parseFloat(form.amount);
    const accountTarget = form.target === "demo" ? "demo" : "real";
    const creditKey = accountTarget === "demo" ? "demoCredit" : "realCredit";
    const balanceKey = accountTarget === "demo" ? "demoBalance" : "realBalance";

    const selectedUser = users.find(u => u.id === modal.id);
    const availableCredit = toNum(selectedUser?.[creditKey]);
    if (form.type === "debit" && amt > availableCredit) {
      return setErrors({ ...errs, amount: `Amount exceeds ${accountTarget} credit (${fmt(availableCredit)})` });
    }

    setUsers(p => p.map(u => {
      if (u.id !== modal.id) return u;
      const nextAccountCredit = form.type === "credit" ? toNum(u[creditKey]) + amt : Math.max(0, toNum(u[creditKey]) - amt);
      const nextAccountBalance = form.type === "credit" ? toNum(u[balanceKey]) + amt : Math.max(0, toNum(u[balanceKey]) - amt);
      const newEntry = { id: Date.now(), amount: amt, type: form.type, account: accountTarget, note: form.note, date: new Date().toISOString() };
      return normalizeUserAccounts({ ...u, [creditKey]: nextAccountCredit, [balanceKey]: nextAccountBalance, creditHistory: [newEntry, ...u.creditHistory] });
    }));
    toast(form.type === "credit" ? "Credit Applied" : "Debit Applied", `${form.type === "credit" ? "+" : "-"}${fmt(amt)} to ${accountTarget} account for ${modal.name}`);
    setModal(null);
  };

  const totalCredit = users.reduce((s, u) => s + u.credit, 0);
  const creditedUsers = users.filter(u => u.credit > 0).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div><h2 className="syne" style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Credit Management</h2><p style={{ fontSize: "12px", color: C.textMuted }}>Add or remove trading credits for users</p></div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        <StatCard label="Total Credits Issued" value={fmt(totalCredit)} color={C.gold} spark={[3000, 5200, 4800, 7100, 9200, 12000, totalCredit]} />
        <StatCard label="Users with Credit" value={fmtNum(creditedUsers)} sub={`of ${users.length} total`} color={C.purple} icon="◎" />
        <StatCard label="Avg Credit / User" value={creditedUsers ? fmt(totalCredit / creditedUsers) : "$0"} color={C.blue} icon="◈" />
        <StatCard label="Transactions" value={fmtNum(users.reduce((s, u) => s + u.creditHistory.length, 0))} color={C.green} icon="▦" />
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px", maxWidth: "400px" }}>
        <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: C.textDim }}>⌕</span>
        <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "8px 12px 8px 32px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>

      {/* Users Credits Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "700px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["User", "Account Type", "Balance", "Current Credit", "Transactions", "Last Credit", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: C.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <UserAvatar name={u.name} size={32} />
                      <div><div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{u.name}</div><div style={{ fontSize: "10px", color: C.textMuted }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "11px", color: C.textMuted }}>{u.accountType}</td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "12px", color: C.text }}>{fmt(u.balance)}</span></td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="mono" style={{ fontSize: "14px", fontWeight: 600, color: u.credit > 0 ? C.gold : C.textDim }}>{fmt(u.credit)}</span>
                      {u.credit > 0 && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.gold }} />}
                    </div>
                    <div className="mono" style={{ fontSize: "10px", color: C.textDim, marginTop: "3px" }}>R {fmt(u.realCredit)} · D {fmt(u.demoCredit)}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "12px", color: C.textMuted }}>{u.creditHistory.length}</span></td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.textMuted }}>{u.creditHistory.length ? fmtDate(u.creditHistory[0].date) : "None"}</span></td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Btn size="sm" variant="ghost" onClick={() => openCredit(u)} icon="◎">Manage</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Credit/Debit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={`Manage Credits — ${modal?.name}`} subtitle={`Current credit: ${fmt(modal?.credit || 0)}`} width="500px">
        {modal && (
          <>
            {(() => {
              const targetLabel = form.target === "demo" ? "Demo" : "Real";
              const targetCredit = form.target === "demo" ? toNum(modal.demoCredit) : toNum(modal.realCredit);
              const targetBalance = form.target === "demo" ? toNum(modal.demoBalance) : toNum(modal.realBalance);

              return (
                <>
            {/* Current Balance Display */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[["Real Balance", fmt(modal.realBalance), C.text], ["Demo Balance", fmt(modal.demoBalance), C.blue], ["Real Credit", fmt(modal.realCredit), C.gold], ["Demo Credit", fmt(modal.demoCredit), C.purple]].map(([l, v, c]) => (
                <div key={l} style={{ background: C.bg, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{l}</div>
                  <div className="mono" style={{ fontSize: "16px", color: c, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Type Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              {[["credit", "➕ Add Credit", C.green], ["debit", "➖ Remove Credit", C.red]].map(([val, label, color]) => (
                <div key={val} onClick={() => setForm(p => ({ ...p, type: val }))}
                  style={{ padding: "12px", border: `2px solid ${form.type === val ? color : C.border}`, borderRadius: "8px", cursor: "pointer", background: form.type === val ? `${color}10` : "transparent", textAlign: "center", transition: "all 0.15s" }}>
                  <div style={{ fontSize: "14px", marginBottom: "2px" }}>{label.split(" ")[0]}</div>
                  <div style={{ fontSize: "12px", color: form.type === val ? color : C.textMuted, fontWeight: 600 }}>{label.split(" ").slice(1).join(" ")}</div>
                </div>
              ))}
            </div>

            <Sel
              label="Target Account"
              value={form.target}
              onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
              options={[{ value: "real", label: "Real Account" }, { value: "demo", label: "Demo Account" }]}
            />

            <Input label="Amount (USD)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" error={errors.amount}
              hint={form.amount && !errors.amount ? `New ${targetLabel.toLowerCase()} credit: ${fmt(targetCredit + (form.type === "credit" ? 1 : -1) * parseFloat(form.amount || 0))}` : ""} />
            <Input label="Reason / Note" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="e.g. Welcome bonus, Promotional credit" error={errors.note} />
            <Input label="Expiry Date (optional)" type="date" value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))} />

            {/* Preview */}
            {form.amount && parseFloat(form.amount) > 0 && (
              <div style={{ padding: "12px 14px", background: form.type === "credit" ? C.greenDim : C.redDim, borderRadius: "8px", marginBottom: "16px", border: `1px solid ${form.type === "credit" ? `${C.green}30` : `${C.red}30`}` }}>
                <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "4px" }}>Preview</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: C.textMuted }}>{targetLabel} Balance → <span className="mono" style={{ color: C.text }}>{fmt(targetBalance + (form.type === "credit" ? 1 : -1) * parseFloat(form.amount || 0))}</span></span>
                  <span className="mono" style={{ fontSize: "18px", fontWeight: 700, color: form.type === "credit" ? C.green : C.red }}>{form.type === "credit" ? "+" : "-"}{fmt(parseFloat(form.amount || 0))}</span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={applyCredit}>{form.type === "credit" ? "Apply Credit" : "Apply Debit"}</Btn>
            </div>

            {/* History */}
            {modal.creditHistory?.length > 0 && (
              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", fontWeight: 600 }}>Transaction History</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                  {modal.creditHistory.map(h => (
                    <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: C.bg, borderRadius: "6px" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: C.text }}>{h.note}</div>
                        <div style={{ fontSize: "10px", color: C.textMuted }}>{fmtDate(h.date)}{h.account ? ` · ${h.account.toUpperCase()}` : ""}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <StatusBadge status={h.type} />
                        <span className="mono" style={{ fontSize: "12px", color: h.type === "credit" ? C.gold : C.red, fontWeight: 600 }}>{h.type === "credit" ? "+" : "-"}{fmt(h.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
                </>
              );
            })()}
          </>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNDING PAGE
// ═══════════════════════════════════════════════════════════════════════════
function FundingPage({ funding, setFunding, users, setUsers, toast }) {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState("");
  const [targetAccount, setTargetAccount] = useState("real");

  const filtered = funding.filter(f => (filter === "all" || f.status === filter) && (typeFilter === "all" || f.type === typeFilter));

  const handleAction = (id, action) => {
    const request = funding.find(f => f.id === id);
    if (!request) return;

    const balanceKey = targetAccount === "demo" ? "demoBalance" : "realBalance";
    const selectedUser = users.find(u => u.id === request.userId);
    const availableBalance = toNum(selectedUser?.[balanceKey]);

    if (action === "approved") {
      if (!selectedUser) {
        return toast("Approval Failed", "User account not found", "error");
      }

      if (request.type === "withdrawal" && request.amount > availableBalance) {
        return toast("Approval Failed", `Insufficient ${targetAccount} balance. Available ${fmt(availableBalance)}`, "error");
      }

      setUsers(p => p.map(u => {
        if (u.id !== request.userId) return u;
        const balanceChange = request.type === "deposit" ? request.amount : -request.amount;
        return normalizeUserAccounts({ ...u, [balanceKey]: Math.max(0, toNum(u[balanceKey]) + balanceChange) });
      }));
    }

    const finalNote = [note.trim(), action === "approved" ? `Processed to ${targetAccount} account` : ""].filter(Boolean).join(" · ");
    setFunding(p => p.map(f => f.id === id ? { ...f, status: action, note: finalNote, processedAccount: action === "approved" ? targetAccount : f.processedAccount } : f));
    if (action === "approved") toast("Request Approved", `${fmt(request.amount || 0)} processed to ${targetAccount} account`);
    else toast("Request Rejected", note || "No reason given", "error");
    setModal(null); setNote("");
    setTargetAccount("real");
  };

  const totals = { pendingAmt: funding.filter(f => f.status === "pending").reduce((s, f) => s + f.amount, 0), approvedAmt: funding.filter(f => f.status === "approved").reduce((s, f) => s + f.amount, 0) };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div><h2 className="syne" style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Funding Requests</h2><p style={{ fontSize: "12px", color: C.textMuted }}>Process deposits and withdrawal requests</p></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { l: "Pending", v: funding.filter(f => f.status === "pending").length, sub: fmt(totals.pendingAmt), c: C.amber },
          { l: "Approved", v: funding.filter(f => f.status === "approved").length, sub: fmt(totals.approvedAmt), c: C.green },
          { l: "Rejected", v: funding.filter(f => f.status === "rejected").length, sub: "declined", c: C.red },
          { l: "Total Volume", v: fmt(funding.reduce((s, f) => s + f.amount, 0)), sub: `${funding.length} requests`, c: C.blue },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.l}</div>
            <div className="mono" style={{ fontSize: "22px", color: s.c, fontWeight: 600, marginTop: "4px" }}>{s.v}</div>
            <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "3px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[["all","All"], ["pending","Pending"], ["approved","Approved"], ["rejected","Rejected"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: "7px 14px", borderRadius: "7px", border: `1px solid ${filter === v ? C.gold : C.border}`, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", background: filter === v ? C.goldDim : "transparent", color: filter === v ? C.gold : C.textMuted, fontWeight: filter === v ? 600 : 400 }}>{l}</button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "7px 12px", color: C.text, fontSize: "12px", outline: "none", fontFamily: "inherit" }}>
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
        </div>
      </div>

      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "750px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["#", "User", "Type", "Amount", "Method", "Ref", "Status", "Time", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: C.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: "48px", textAlign: "center", color: C.textDim, fontSize: "13px" }}>No requests found</td></tr>}
              {filtered.map(f => (
                <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.textDim }}>#{String(f.id).padStart(4,"0")}</span></td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <UserAvatar name={f.userName} size={28} />
                      <span style={{ fontSize: "12px", color: C.text, fontWeight: 500 }}>{f.userName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={f.type} /></td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "13px", color: f.type === "deposit" ? C.green : C.red, fontWeight: 600 }}>{f.type === "withdrawal" ? "−" : "+"}{fmt(f.amount)}</span></td>
                  <td style={{ padding: "12px 14px", fontSize: "11px", color: C.textMuted }}>{f.method}</td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "10px", color: C.textDim }}>{f.bankRef || "—"}</span></td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={f.status} /></td>
                  <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: "10px", color: C.textMuted }}>{timeAgo(f.created)}</span></td>
                  <td style={{ padding: "12px 14px" }}>
                    {f.status === "pending" ? <Btn size="sm" variant="ghost" onClick={() => { setModal(f); setNote(""); setTargetAccount(f.processedAccount || "real"); }}>Review ▸</Btn>
                      : <span style={{ fontSize: "11px", color: C.textDim, fontStyle: "italic" }}>{f.note || (f.processedAccount ? `Processed to ${f.processedAccount}` : "—")}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title="Review Funding Request" subtitle={modal ? `${modal.userName} · ${fmt(modal.amount)}` : ""} width="520px">
        {modal && (
          <>
            {(() => {
              const selectedUser = users.find(u => u.id === modal.userId);
              const currentBalance = toNum(selectedUser?.[targetAccount === "demo" ? "demoBalance" : "realBalance"]);
              const projectedBalance = modal.type === "deposit" ? currentBalance + modal.amount : currentBalance - modal.amount;

              return (
                <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[["User", modal.userName], ["Amount", fmt(modal.amount)], ["Method", modal.method], ["Reference", modal.bankRef || "—"], ["Type", modal.type.charAt(0).toUpperCase() + modal.type.slice(1)], ["Submitted", timeAgo(modal.created)]].map(([l, v]) => (
                <div key={l} style={{ background: C.bg, borderRadius: "8px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{l}</div>
                  <div className="mono" style={{ fontSize: "13px", color: C.text }}>{v}</div>
                </div>
              ))}
            </div>
            {modal.proof && (
              <div style={{ background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>📎</span>
                <span style={{ fontSize: "13px", color: C.blue }}>{modal.proof}</span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: C.textMuted, textDecoration: "underline" }}>Preview</span>
              </div>
            )}
            <Sel
              label="Target Account"
              value={targetAccount}
              onChange={e => setTargetAccount(e.target.value)}
              options={[{ value: "real", label: "Real Account" }, { value: "demo", label: "Demo Account" }]}
            />
            {selectedUser && (
              <div style={{ padding: "12px 14px", background: C.bg, borderRadius: "8px", marginBottom: "16px", border: `1px solid ${projectedBalance < 0 ? `${C.red}30` : C.border}` }}>
                <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "4px" }}>{targetAccount === "demo" ? "Demo" : "Real"} Account Preview</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span className="mono" style={{ fontSize: "12px", color: C.textMuted }}>Current: {fmt(currentBalance)}</span>
                  <span className="mono" style={{ fontSize: "12px", color: projectedBalance < 0 ? C.red : C.text }}>After approval: {fmt(projectedBalance)}</span>
                </div>
              </div>
            )}
            <Input label="Admin Note (reason / reference)" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note for records..." />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn danger onClick={() => handleAction(modal.id, "rejected")}>✕ Reject</Btn>
              <Btn onClick={() => handleAction(modal.id, "approved")}>✓ Approve</Btn>
            </div>
                </>
              );
            })()}
          </>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADES PAGE
// ═══════════════════════════════════════════════════════════════════════════
function TradesPage({ trades }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = trades.filter(t => (filter === "all" || t.status === filter) && (t.userName.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase())));
  const totalPnl = filtered.reduce((s, t) => s + t.profit, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div><h2 className="syne" style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Trade Oversight</h2><p style={{ fontSize: "12px", color: C.textMuted }}>Monitor all open and closed positions</p></div>
        <div className="mono" style={{ fontSize: "18px", color: totalPnl >= 0 ? C.green : C.red, fontWeight: 600 }}>
          {totalPnl >= 0 ? "+" : ""}{fmt(totalPnl)} P&L
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { l: "Total", v: trades.length, c: C.textMuted },
          { l: "Open", v: trades.filter(t => t.status === "open").length, c: C.blue },
          { l: "Closed", v: trades.filter(t => t.status === "closed").length, c: C.textMuted },
          { l: "Total P&L", v: fmt(trades.reduce((s, t) => s + t.profit, 0)), c: C.green },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
            <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.l}</div>
            <div className="mono" style={{ fontSize: "20px", color: s.c, fontWeight: 600, marginTop: "4px" }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
          <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: C.textDim }}>⌕</span>
          <input placeholder="Search user, symbol..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "8px 12px 8px 32px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
        {[["all","All"], ["open","Open"], ["closed","Closed"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: "7px 14px", borderRadius: "7px", border: `1px solid ${filter === v ? C.gold : C.border}`, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", background: filter === v ? C.goldDim : "transparent", color: filter === v ? C.gold : C.textMuted, fontWeight: filter === v ? 600 : 400 }}>{l}</button>
        ))}
      </div>

      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["#", "User", "Symbol", "Dir", "Lots", "Open", "Close", "Swap", "P&L", "Status", "Opened"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: C.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={11} style={{ padding: "48px", textAlign: "center", color: C.textDim }}>No trades found</td></tr>}
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.textDim }}>#{t.id}</span></td>
                  <td style={{ padding: "11px 14px", fontSize: "12px", color: C.text }}>{t.userName}</td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "12px", color: C.gold, fontWeight: 700 }}>{t.symbol}</span></td>
                  <td style={{ padding: "11px 14px" }}><span style={{ background: t.type === "buy" ? C.greenDim : C.redDim, color: t.type === "buy" ? C.green : C.red, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em" }}>{t.type.toUpperCase()}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "12px", color: C.textMuted }}>{t.lots}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.textMuted }}>{t.openPrice}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.textMuted }}>{t.closePrice || "—"}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "11px", color: C.red }}>{fmt(t.swap)}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "13px", color: t.profit >= 0 ? C.green : C.red, fontWeight: 700 }}>{t.profit >= 0 ? "+" : ""}{fmt(t.profit)}</span></td>
                  <td style={{ padding: "11px 14px" }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "10px", color: C.textDim }}>{timeAgo(t.opened)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function ReportsPage({ users, trades, funding }) {
  const accountDist = ["Basic", "Standard", "Premium", "VIP"].map((t, i) => ({
    type: t, count: users.filter(u => u.accountType === t).length,
    volume: users.filter(u => u.accountType === t).reduce((s, u) => s + u.balance, 0),
    colors: [C.blue, C.green, C.gold, C.purple][i],
  }));

  const closedTrades = trades.filter(t => t.status === "closed");
  const kycStats = [
    { l: "Verified", v: users.filter(u => u.kyc === "verified").length, c: C.green },
    { l: "Pending", v: users.filter(u => u.kyc === "pending").length, c: C.amber },
    { l: "In Review", v: users.filter(u => u.kyc === "under_review").length, c: C.blue },
    { l: "Rejected", v: users.filter(u => u.kyc === "rejected").length, c: C.red },
  ];

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 className="syne" style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Analytics & Reports</h2>
        <p style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>Platform-wide performance overview</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }} className="responsive-grid-2">
        {/* Account Distribution */}
        <Card title="Account Distribution">
          {accountDist.map((a) => {
            const pct = users.length ? (a.count / users.length) * 100 : 0;
            return (
              <div key={a.type} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: C.text }}>{a.type}</span>
                  <span style={{ fontSize: "11px", color: C.textMuted }}><span className="mono">{a.count}</span> users · <span className="mono">{fmt(a.volume)}</span></span>
                </div>
                <div style={{ height: "5px", background: C.border, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: a.colors, borderRadius: "3px" }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* KYC Distribution */}
        <Card title="KYC Status">
          {kycStats.map(s => {
            const pct = users.length ? (s.v / users.length) * 100 : 0;
            return (
              <div key={s.l} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: C.text }}>{s.l}</span>
                  <span className="mono" style={{ fontSize: "12px", color: s.c }}>{s.v}</span>
                </div>
                <div style={{ height: "5px", background: C.border, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: s.c, borderRadius: "3px" }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }} className="responsive-grid-2">
        {/* P&L */}
        <Card title="P&L Summary">
          {[
            ["Realized P&L", fmt(closedTrades.reduce((s, t) => s + t.profit, 0)), C.green],
            ["Unrealized P&L", fmt(trades.filter(t => t.status === "open").reduce((s, t) => s + t.profit, 0)), C.amber],
            ["Best Trade", fmt(Math.max(...trades.map(t => t.profit))), C.green],
            ["Worst Trade", fmt(Math.min(...trades.map(t => t.profit))), C.red],
            ["Avg Trade P&L", fmt(trades.reduce((s, t) => s + t.profit, 0) / trades.length), C.text],
          ].map(([l, v, c], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: "12px", color: C.textMuted }}>{l}</span>
              <span className="mono" style={{ fontSize: "13px", color: c, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>

        {/* Funding Summary */}
        <Card title="Funding Summary">
          {[
            ["Total Deposited", fmt(funding.filter(f => f.type === "deposit" && f.status === "approved").reduce((s, f) => s + f.amount, 0)), C.green],
            ["Total Withdrawn", fmt(funding.filter(f => f.type === "withdrawal" && f.status === "approved").reduce((s, f) => s + f.amount, 0)), C.red],
            ["Pending Deposits", fmt(funding.filter(f => f.type === "deposit" && f.status === "pending").reduce((s, f) => s + f.amount, 0)), C.amber],
            ["Pending Withdraw", fmt(funding.filter(f => f.type === "withdrawal" && f.status === "pending").reduce((s, f) => s + f.amount, 0)), C.amber],
            ["Rejected Total", fmt(funding.filter(f => f.status === "rejected").reduce((s, f) => s + f.amount, 0)), C.red],
          ].map(([l, v, c], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: "12px", color: C.textMuted }}>{l}</span>
              <span className="mono" style={{ fontSize: "13px", color: c, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>

        {/* Credit Summary */}
        <Card title="Credit Summary">
          {[
            ["Total Issued", fmt(users.reduce((s, u) => s + u.credit, 0)), C.gold],
            ["Active Credits", fmtNum(users.filter(u => u.credit > 0).length) + " users", C.text],
            ["Total Transactions", fmtNum(users.reduce((s, u) => s + u.creditHistory.length, 0)), C.text],
            ["Largest Credit", fmt(Math.max(...users.map(u => u.credit))), C.gold],
            ["Avg per User", fmt(users.reduce((s, u) => s + u.credit, 0) / users.length), C.text],
          ].map(([l, v, c], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: "12px", color: C.textMuted }}>{l}</span>
              <span className="mono" style={{ fontSize: "13px", color: c, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Full User Report Table */}
      <Card title="Full User Report" subtitle="Complete portfolio snapshot" noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["User", "Type", "Balance", "Equity", "Credit", "P&L", "Trades", "KYC", "Status"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: C.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <UserAvatar name={u.name} size={28} />
                      <div><div style={{ fontSize: "12px", color: C.text, fontWeight: 500 }}>{u.name}</div><div style={{ fontSize: "10px", color: C.textMuted }}>{u.country}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "11px", color: C.textMuted }}>{u.accountType}</td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "12px", color: C.text }}>{fmt(u.balance)}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "12px", color: u.equity >= u.balance ? C.green : C.red }}>{fmt(u.equity)}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "12px", color: u.credit > 0 ? C.gold : C.textDim }}>{fmt(u.credit)}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "12px", color: u.profit >= 0 ? C.green : C.red }}>{u.profit >= 0 ? "+" : ""}{fmt(u.profit)}</span></td>
                  <td style={{ padding: "11px 14px" }}><span className="mono" style={{ fontSize: "12px", color: C.textMuted }}>{u.totalTrades}</span></td>
                  <td style={{ padding: "11px 14px" }}><StatusBadge status={u.kyc} /></td>
                  <td style={{ padding: "11px 14px" }}><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function SettingsPage({ toast }) {
  const [tab, setTab] = useState("platform");
  const [alertToggles, setAlertToggles] = useState([true, true, true, false, true]);
  const [settings, setSettings] = useState({ platformName: "Rizal Trade Platform", supportEmail: "support@rizaltrade.com", defaultLeverage: "100", maxLeverage: "500", minDeposit: "100", maxWithdrawal: "50000", maintenanceMode: false, emailNotifications: true, smsAlerts: false, autoKyc: false, tradingEnabled: true, withdrawalsEnabled: true, depositsEnabled: true, twoFaRequired: true, maxCreditPerUser: "50000" });
  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  const toggle = (k) => setSettings(p => ({ ...p, [k]: !p[k] }));

  const Toggle = ({ label, desc, k, danger }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
      <div><div style={{ fontSize: "13px", color: C.text, fontWeight: 500 }}>{label}</div>{desc && <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{desc}</div>}</div>
      <div onClick={() => toggle(k)} style={{ width: "42px", height: "23px", borderRadius: "12px", background: settings[k] ? (danger ? C.red : C.gold) : C.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: "3px", left: settings[k] ? "22px" : "3px", width: "17px", height: "17px", borderRadius: "50%", background: settings[k] ? "#060B11" : C.textDim, transition: "left 0.2s" }} />
      </div>
    </div>
  );

  const TABS = [["platform", "Platform"], ["trading", "Trading"], ["security", "Security"], ["notifications", "Notifications"]];

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 className="syne" style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Settings</h2>
        <p style={{ fontSize: "12px", color: C.textMuted }}>Configure platform behaviour and rules</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "9px", padding: "4px", width: "fit-content", flexWrap: "wrap" }}>
        {TABS.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ padding: "7px 16px", borderRadius: "6px", border: "none", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, background: tab === v ? C.goldDim : "transparent", color: tab === v ? C.gold : C.textMuted, transition: "all 0.15s" }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="responsive-grid-2">
        {tab === "platform" && (
          <>
            <Card title="General Settings">
              <Input label="Platform Name" value={settings.platformName} onChange={e => set("platformName", e.target.value)} />
              <Input label="Support Email" value={settings.supportEmail} onChange={e => set("supportEmail", e.target.value)} />
              <Input label="Minimum Deposit (USD)" type="number" value={settings.minDeposit} onChange={e => set("minDeposit", e.target.value)} />
              <Input label="Maximum Withdrawal (USD)" type="number" value={settings.maxWithdrawal} onChange={e => set("maxWithdrawal", e.target.value)} />
              <Input label="Max Credit Per User (USD)" type="number" value={settings.maxCreditPerUser} onChange={e => set("maxCreditPerUser", e.target.value)} />
              <Btn onClick={() => toast("Settings Saved", "Platform settings updated")} fullWidth>Save Settings</Btn>
            </Card>
            <Card title="Platform Controls">
              <Toggle label="Maintenance Mode" desc="Redirect all users to maintenance page" k="maintenanceMode" danger />
              <Toggle label="Trading Enabled" desc="Allow users to open and close trades" k="tradingEnabled" />
              <Toggle label="Deposits Enabled" desc="Accept new deposit requests" k="depositsEnabled" />
              <Toggle label="Withdrawals Enabled" desc="Process withdrawal requests" k="withdrawalsEnabled" />
            </Card>
          </>
        )}
        {tab === "trading" && (
          <>
            <Card title="Leverage Settings">
              <Input label="Default Leverage" value={settings.defaultLeverage} onChange={e => set("defaultLeverage", e.target.value)} hint="Applied to new accounts" />
              <Input label="Maximum Leverage" value={settings.maxLeverage} onChange={e => set("maxLeverage", e.target.value)} hint="Maximum allowed" />
              <Sel label="Default Account Type" value="Standard" onChange={() => {}} options={["Basic","Standard","Premium","VIP"].map(v => ({ value: v, label: v }))} />
              <Btn onClick={() => toast("Saved", "Trading config updated")} fullWidth>Save</Btn>
            </Card>
            <Card title="Trading Rules">
              {[["Auto KYC Verification", "Automatically approve matching KYC", "autoKyc"], ["Trading Enabled", "Allow live trading", "tradingEnabled"]].map(([l, d, k]) => (
                <Toggle key={k} label={l} desc={d} k={k} />
              ))}
            </Card>
          </>
        )}
        {tab === "security" && (
          <>
            <Card title="Security Settings">
              <Toggle label="2FA Required" desc="Force 2-factor auth for all admins" k="twoFaRequired" />
              <div style={{ marginTop: "16px" }}>
                <Input label="Session Timeout (minutes)" value="30" onChange={() => {}} />
                <Input label="Max Login Attempts" value="5" onChange={() => {}} />
                <Btn onClick={() => toast("Saved", "Security settings updated")} fullWidth>Save</Btn>
              </div>
            </Card>
            <Card title="Danger Zone" style={{ border: `1px solid ${C.red}30` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[["Clear All Sessions", "Force logout all users"], ["Purge Audit Logs", "Delete logs older than 90 days"], ["Database Backup", "Create full backup now"]].map(([l, d], i) => (
                  <div key={i} style={{ display: "flex", justify: "space-between", alignItems: "center", justifyContent: "space-between" }}>
                    <div><div style={{ fontSize: "12px", color: C.text }}>{l}</div><div style={{ fontSize: "11px", color: C.textMuted }}>{d}</div></div>
                    <Btn size="sm" danger onClick={() => toast(l, d)}>{i === 2 ? "Run" : "Execute"}</Btn>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
        {tab === "notifications" && (
          <>
            <Card title="Notification Channels">
              <Toggle label="Email Notifications" desc="Send alerts via email" k="emailNotifications" />
              <Toggle label="SMS Alerts" desc="Send critical alerts via SMS" k="smsAlerts" />
            </Card>
            <Card title="Alert Triggers">
              <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "12px" }}>Configure which events trigger admin alerts</div>
              {["Large Deposit (>$10k)", "Withdrawal Pending", "KYC Submitted", "Account Suspended", "Failed Login Attempt"].map((l, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: "12px", color: C.textMuted }}>{l}</span>
                    <div onClick={() => setAlertToggles(p => p.map((v, j) => j === i ? !v : v))} style={{ width: "38px", height: "20px", borderRadius: "10px", background: alertToggles[i] ? C.gold : C.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: "2px", left: alertToggles[i] ? "19px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: alertToggles[i] ? "#060B11" : C.textDim, transition: "left 0.2s" }} />
                    </div>
                  </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED: CONFIRM BOX
// ═══════════════════════════════════════════════════════════════════════════
function ConfirmBox({ confirm, setConfirm }) {
  return (
    <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm Action" width="380px">
      {confirm && (
        <>
          <p style={{ color: C.textMuted, fontSize: "13px", lineHeight: 1.6, marginBottom: "20px" }}>{confirm.msg}</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setConfirm(null)}>Cancel</Btn>
            <Btn danger onClick={confirm.onConfirm}>Confirm</Btn>
          </div>
        </>
      )}
    </Modal>
  );
}