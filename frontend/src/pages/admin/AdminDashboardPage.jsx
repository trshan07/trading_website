import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockUsers = [
  { id: 1, name: "James Whitfield", email: "james@example.com", phone: "+1-555-0101", balance: 125000, equity: 131200, totalTrades: 142, profit: 6200, status: "active", kyc: "verified", joined: "2024-01-12", country: "US", accountType: "Premium" },
  { id: 2, name: "Priya Nair", email: "priya@example.com", phone: "+44-555-0202", balance: 58700, equity: 61400, totalTrades: 87, profit: 2700, status: "active", kyc: "verified", joined: "2024-02-08", country: "UK", accountType: "Standard" },
  { id: 3, name: "Carlos Mendez", email: "carlos@example.com", phone: "+34-555-0303", balance: 9200, equity: 8800, totalTrades: 23, profit: -400, status: "pending", kyc: "pending", joined: "2024-03-15", country: "ES", accountType: "Basic" },
  { id: 4, name: "Mei Lin", email: "mei@example.com", phone: "+86-555-0404", balance: 247000, equity: 259000, totalTrades: 310, profit: 12000, status: "active", kyc: "verified", joined: "2023-11-22", country: "CN", accountType: "VIP" },
  { id: 5, name: "Ahmed Khalil", email: "ahmed@example.com", phone: "+20-555-0505", balance: 3100, equity: 2900, totalTrades: 11, profit: -200, status: "suspended", kyc: "rejected", joined: "2024-04-01", country: "EG", accountType: "Basic" },
  { id: 6, name: "Sofia Bianchi", email: "sofia@example.com", phone: "+39-555-0606", balance: 72400, equity: 78000, totalTrades: 95, profit: 5600, status: "active", kyc: "verified", joined: "2024-01-30", country: "IT", accountType: "Standard" },
];

const mockFundingRequests = [
  { id: 1, userId: 1, userName: "James Whitfield", type: "deposit", amount: 10000, method: "Bank Transfer", status: "pending", proof: "proof_001.pdf", created: "2024-04-06T14:23:00", note: "" },
  { id: 2, userId: 2, userName: "Priya Nair", type: "withdrawal", amount: 5000, method: "Wire Transfer", status: "pending", proof: null, created: "2024-04-06T11:10:00", note: "" },
  { id: 3, userId: 4, userName: "Mei Lin", type: "deposit", amount: 25000, method: "Crypto", status: "approved", proof: "proof_003.pdf", created: "2024-04-05T09:00:00", note: "Verified USDT" },
  { id: 4, userId: 3, userName: "Carlos Mendez", type: "withdrawal", amount: 1500, method: "Bank Transfer", status: "rejected", proof: null, created: "2024-04-04T16:45:00", note: "Insufficient KYC" },
  { id: 5, userId: 6, userName: "Sofia Bianchi", type: "deposit", amount: 8000, method: "Credit Card", status: "approved", proof: "proof_005.pdf", created: "2024-04-03T12:20:00", note: "" },
];

const mockTrades = [
  { id: 1, userId: 1, userName: "James Whitfield", symbol: "BTC/USD", type: "buy", lots: 0.5, openPrice: 67450, closePrice: 68900, profit: 725, status: "closed", opened: "2024-04-05T08:00:00", closed: "2024-04-06T14:00:00" },
  { id: 2, userId: 2, userName: "Priya Nair", symbol: "EUR/USD", type: "sell", lots: 2.0, openPrice: 1.0845, closePrice: null, profit: -120, status: "open", opened: "2024-04-06T10:30:00", closed: null },
  { id: 3, userId: 4, userName: "Mei Lin", symbol: "GOLD", type: "buy", lots: 5.0, openPrice: 2310, closePrice: 2345, profit: 1750, status: "closed", opened: "2024-04-04T07:00:00", closed: "2024-04-05T16:00:00" },
  { id: 4, userId: 6, userName: "Sofia Bianchi", symbol: "ETH/USD", type: "buy", lots: 1.0, openPrice: 3180, closePrice: null, profit: 240, status: "open", opened: "2024-04-06T12:00:00", closed: null },
];

const volumeData = [
  { m: "Oct", v: 980000 }, { m: "Nov", v: 1250000 }, { m: "Dec", v: 1580000 },
  { m: "Jan", v: 1320000 }, { m: "Feb", v: 1690000 }, { m: "Mar", v: 2100000 }, { m: "Apr", v: 1840000 },
];
const userGrowthData = [
  { m: "Oct", u: 98 }, { m: "Nov", u: 124 }, { m: "Dec", u: 159 },
  { m: "Jan", u: 201 }, { m: "Feb", u: 245 }, { m: "Mar", u: 289 }, { m: "Apr", u: 321 },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n);
const timeAgo = (d) => { const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return `${~~s}s ago`; if (s < 3600) return `${~~(s/60)}m ago`; if (s < 86400) return `${~~(s/3600)}h ago`; return `${~~(s/86400)}d ago`; };

// ─── MINI LINE SPARKLINE ──────────────────────────────────────────────────────
function Sparkline({ data, color = "#FFD700", height = 40 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 120, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
function BarChart({ data, color = "#FFD700" }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px", padding: "8px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "100%", height: `${(d.v / max) * 64}px`, background: color, borderRadius: "3px 3px 0 0", opacity: i === data.length - 1 ? 1 : 0.5, transition: "height 0.3s" }} />
          <span style={{ fontSize: "9px", color: "#888", fontFamily: "monospace" }}>{d.m}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MINI USER GROWTH CHART ───────────────────────────────────────────────────
function LineAreaChart({ data }) {
  const max = Math.max(...data.map(d => d.u)), min = Math.min(...data.map(d => d.u));
  const w = 300, h = 80;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.u - min) / (max - min)) * (h - 10) - 5}`);
  const path = `M ${pts.join(" L ")}`;
  const fill = `M ${pts[0]} L ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#ugGrad)" />
      <path d={path} fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const cfg = {
    active: { bg: "rgba(52,211,153,0.12)", color: "#34D399", label: "Active" },
    pending: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24", label: "Pending" },
    suspended: { bg: "rgba(239,68,68,0.12)", color: "#EF4444", label: "Suspended" },
    verified: { bg: "rgba(52,211,153,0.12)", color: "#34D399", label: "Verified" },
    rejected: { bg: "rgba(239,68,68,0.12)", color: "#EF4444", label: "Rejected" },
    approved: { bg: "rgba(52,211,153,0.12)", color: "#34D399", label: "Approved" },
    open: { bg: "rgba(99,179,237,0.12)", color: "#63B3ED", label: "Open" },
    closed: { bg: "rgba(160,174,192,0.12)", color: "#A0AEC0", label: "Closed" },
    deposit: { bg: "rgba(52,211,153,0.12)", color: "#34D399", label: "Deposit" },
    withdrawal: { bg: "rgba(251,113,133,0.12)", color: "#FB7185", label: "Withdrawal" },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30`, borderRadius: "6px", padding: "2px 10px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {c.label}
    </span>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div style={{ background: "#0F1923", border: "1px solid #1E2D3D", borderRadius: "16px", padding: "32px", minWidth: "480px", maxWidth: "680px", width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)", position: "relative" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ color: "#F0E6C8", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: "20px", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = "text", disabled }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", color: "#A0B0C0", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} disabled={disabled}
        style={{ width: "100%", background: disabled ? "#0A1018" : "#0D1620", border: "1px solid #1E2D3D", borderRadius: "8px", padding: "10px 14px", color: disabled ? "#555" : "#E8D9B5", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", color: "#A0B0C0", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ width: "100%", background: "#0D1620", border: "1px solid #1E2D3D", borderRadius: "8px", padding: "10px 14px", color: "#E8D9B5", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── ACTION BUTTON ────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", small, danger }) {
  const styles = {
    primary: { background: "linear-gradient(135deg, #FFD700, #F0A500)", color: "#0A0F14", border: "none" },
    secondary: { background: "transparent", color: "#E8D9B5", border: "1px solid #2A3A4A" },
    ghost: { background: "rgba(255,215,0,0.08)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)" },
  };
  const s = danger ? { background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" } : styles[variant];
  return (
    <button onClick={onClick} style={{ ...s, borderRadius: "8px", padding: small ? "6px 14px" : "9px 20px", fontSize: small ? "12px" : "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 2000, display: "flex", flexDirection: "column", gap: "8px" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === "success" ? "#0D2015" : t.type === "error" ? "#200D0D" : "#0F1923", border: `1px solid ${t.type === "success" ? "#34D39940" : t.type === "error" ? "#EF444440" : "#FFD70040"}`, borderRadius: "10px", padding: "12px 20px", color: t.type === "success" ? "#34D399" : t.type === "error" ? "#EF4444" : "#FFD700", fontSize: "13px", fontWeight: 500, minWidth: "260px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", display: "flex", gap: "10px", alignItems: "center" }}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [page, setPage] = useState("dashboard");
  const [users, setUsers] = useState(mockUsers);
  const [funding, setFunding] = useState(mockFundingRequests);
  const [trades] = useState(mockTrades);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toastId = useRef(0);

  const toast = (msg, type = "success") => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    totalBalance: users.reduce((s, u) => s + u.balance, 0),
    pendingFunding: funding.filter(f => f.status === "pending").length,
    totalTrades: trades.length,
    openTrades: trades.filter(t => t.status === "open").length,
    totalVolume: 1840000,
    successRate: 98.5,
  };

  const navItems = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "users", icon: "◈", label: "Users" },
    { id: "funding", icon: "◎", label: "Funding" },
    { id: "trades", icon: "◇", label: "Trades" },
    { id: "reports", icon: "▦", label: "Reports" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070C12; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A3A4A; border-radius: 2px; }
        table { border-collapse: collapse; width: 100%; }
        th { text-align: left; }
        input:focus, select:focus { border-color: #FFD70060 !important; }
        .nav-item { transition: all 0.15s; }
        .nav-item:hover { background: rgba(255,215,0,0.06) !important; }
        .nav-item.active { background: rgba(255,215,0,0.1) !important; border-left-color: #FFD700 !important; }
        .row-hover:hover { background: rgba(255,255,255,0.02) !important; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .page-enter { animation: fadeIn 0.25s ease; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse { animation: pulse 2s infinite; }
      `}</style>

      <Toast toasts={toasts} removeToast={() => {}} />

      <div style={{ display: "flex", height: "100vh", background: "#070C12", fontFamily: "'DM Sans', sans-serif", color: "#E8D9B5", overflow: "hidden" }}>

        {/* ── SIDEBAR ────────────────────────────────────── */}
        <aside style={{ width: sidebarOpen ? "240px" : "64px", minWidth: sidebarOpen ? "240px" : "64px", background: "#0A1018", borderRight: "1px solid #1A2535", display: "flex", flexDirection: "column", transition: "all 0.25s", overflow: "hidden" }}>
          {/* Logo */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1A2535", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #FFD700, #F0A500)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>◈</div>
            {sidebarOpen && (
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "16px", color: "#F0E6C8", letterSpacing: "-0.02em" }}>Rizal</div>
                <div style={{ fontSize: "10px", color: "#FFD700", letterSpacing: "0.2em", textTransform: "uppercase" }}>Admin CRM</div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "16px 0" }}>
            {navItems.map(item => (
              <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", cursor: "pointer", borderLeft: `3px solid ${page === item.id ? "#FFD700" : "transparent"}`, color: page === item.id ? "#FFD700" : "#7A8FA6", marginBottom: "2px" }}>
                <span style={{ fontSize: "18px", width: "24px", textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</span>}
                {sidebarOpen && item.id === "funding" && stats.pendingFunding > 0 && (
                  <span style={{ marginLeft: "auto", background: "#FFD700", color: "#0A0F14", borderRadius: "10px", padding: "1px 7px", fontSize: "11px", fontWeight: 700 }}>{stats.pendingFunding}</span>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1A2535" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setSidebarOpen(p => !p)}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #1E3A5F, #2A5080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>A</div>
              {sidebarOpen && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#E8D9B5" }}>Admin</div>
                  <div style={{ fontSize: "11px", color: "#7A8FA6" }}>Collapse</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Top Bar */}
          <header style={{ background: "#0A1018", borderBottom: "1px solid #1A2535", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "20px", color: "#F0E6C8" }}>
                {navItems.find(n => n.id === page)?.label}
              </h1>
              <p style={{ fontSize: "12px", color: "#7A8FA6", marginTop: "1px" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399" }} />
              <span style={{ fontSize: "12px", color: "#34D399", fontFamily: "'IBM Plex Mono', monospace" }}>LIVE</span>
              <div style={{ width: "1px", height: "24px", background: "#1A2535" }} />
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#7A8FA6" }}>
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div style={{ flex: 1, padding: "32px", overflow: "auto" }} className="page-enter">
            {page === "dashboard" && <DashboardPage stats={stats} volumeData={volumeData} userGrowthData={userGrowthData} users={users} funding={funding} trades={trades} />}
            {page === "users" && <UsersPage users={users} setUsers={setUsers} toast={toast} />}
            {page === "funding" && <FundingPage funding={funding} setFunding={setFunding} toast={toast} />}
            {page === "trades" && <TradesPage trades={trades} />}
            {page === "reports" && <ReportsPage users={users} trades={trades} />}
            {page === "settings" && <SettingsPage toast={toast} />}
          </div>
        </main>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage({ stats, volumeData, userGrowthData, users, funding, trades }) {
  const kpis = [
    { label: "Total Users", value: fmtNum(stats.totalUsers), sub: `${stats.activeUsers} active`, spark: [98, 112, 124, 140, 159, 201, 245, 289, 321], color: "#FFD700" },
    { label: "Total Balance", value: fmt(stats.totalBalance), sub: "Across all accounts", spark: [820000, 940000, 1100000, 980000, 1240000, 1380000, 1520000, 1690000, stats.totalBalance], color: "#63B3ED" },
    { label: "Monthly Volume", value: fmt(stats.totalVolume), sub: "+12.4% vs last month", spark: [980000, 1250000, 1580000, 1320000, 1690000, 2100000, 1840000], color: "#34D399" },
    { label: "Pending Requests", value: fmtNum(stats.pendingFunding), sub: "Needs attention", spark: [2, 5, 3, 7, 4, 6, stats.pendingFunding], color: "#FBBF24" },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {kpis.map((k, i) => (
          <div key={i} className="stat-card" style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: k.color, opacity: 0.8 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#7A8FA6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{k.label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "26px", fontWeight: 500, color: "#F0E6C8", letterSpacing: "-0.02em" }}>{k.value}</div>
                <div style={{ fontSize: "12px", color: k.color, marginTop: "6px" }}>{k.sub}</div>
              </div>
              <Sparkline data={k.spark} color={k.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
        <div style={{ gridColumn: "span 2", background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8" }}>Trading Volume</div>
              <div style={{ fontSize: "12px", color: "#7A8FA6", marginTop: "2px" }}>Last 7 months</div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "22px", color: "#FFD700" }}>{fmt(1840000)}</div>
          </div>
          <BarChart data={volumeData} color="#FFD700" />
        </div>
        <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "4px" }}>User Growth</div>
          <div style={{ fontSize: "12px", color: "#7A8FA6", marginBottom: "12px" }}>Monthly registrations</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "28px", color: "#34D399", marginBottom: "12px" }}>321</div>
          <LineAreaChart data={userGrowthData} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
            <div style={{ background: "#0A1018", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "#7A8FA6" }}>Active</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "18px", color: "#34D399" }}>{stats.activeUsers}</div>
            </div>
            <div style={{ background: "#0A1018", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "#7A8FA6" }}>Open Trades</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "18px", color: "#63B3ED" }}>{stats.openTrades}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Recent Funding */}
        <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "16px" }}>Pending Funding</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {funding.filter(f => f.status === "pending").slice(0, 4).map(f => (
              <div key={f.id} className="row-hover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#0A1018", borderRadius: "8px", border: "1px solid #1A2535" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#E8D9B5" }}>{f.userName}</div>
                  <div style={{ fontSize: "11px", color: "#7A8FA6", marginTop: "2px" }}>{f.method} · {timeAgo(f.created)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", color: f.type === "deposit" ? "#34D399" : "#FB7185" }}>
                    {f.type === "withdrawal" ? "−" : "+"}{fmt(f.amount)}
                  </div>
                  <Badge status={f.type} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "16px" }}>Top Traders</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[...users].sort((a, b) => b.balance - a.balance).slice(0, 4).map((u, i) => (
              <div key={u.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "#0A1018", borderRadius: "8px", border: "1px solid #1A2535" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: i === 0 ? "linear-gradient(135deg,#FFD700,#F0A500)" : "#1E2D3D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: i === 0 ? "#0A0F14" : "#7A8FA6", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#E8D9B5" }}>{u.name}</div>
                  <div style={{ fontSize: "11px", color: "#7A8FA6" }}>{u.accountType} · {u.totalTrades} trades</div>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", color: "#F0E6C8" }}>{fmt(u.balance)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function UsersPage({ users, setUsers, toast }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(null); // { mode: "view"|"edit"|"add"|"balance", user }
  const [form, setForm] = useState({});
  const [balanceAdjust, setBalanceAdjust] = useState({ amount: "", type: "add", note: "" });

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openModal = (mode, user = null) => {
    setModal({ mode, user });
    if (mode === "edit" || mode === "view") setForm({ ...user });
    if (mode === "add") setForm({ name: "", email: "", phone: "", balance: 0, accountType: "Basic", status: "pending", kyc: "pending", country: "" });
    if (mode === "balance") setBalanceAdjust({ amount: "", type: "add", note: "" });
  };

  const saveUser = () => {
    if (modal.mode === "add") {
      const newUser = { ...form, id: Date.now(), equity: form.balance, totalTrades: 0, profit: 0, joined: new Date().toISOString().split("T")[0] };
      setUsers(p => [...p, newUser]);
      toast("User created successfully");
    } else {
      setUsers(p => p.map(u => u.id === modal.user.id ? { ...u, ...form } : u));
      toast("User updated successfully");
    }
    setModal(null);
  };

  const deleteUser = (id) => {
    if (window.confirm("Are you sure?")) {
      setUsers(p => p.filter(u => u.id !== id));
      toast("User deleted", "error");
    }
  };

  const adjustBalance = () => {
    const amt = parseFloat(balanceAdjust.amount);
    if (!amt) return;
    setUsers(p => p.map(u => {
      if (u.id !== modal.user.id) return u;
      const newBal = balanceAdjust.type === "add" ? u.balance + amt : u.balance - amt;
      return { ...u, balance: Math.max(0, newBal) };
    }));
    toast(`Balance adjusted: ${balanceAdjust.type === "add" ? "+" : "-"}${fmt(amt)}`);
    setModal(null);
  };

  const toggleStatus = (id) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
    toast("User status updated");
  };

  return (
    <div>
      {/* Actions Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "200px", background: "#0D1620", border: "1px solid #1A2535", borderRadius: "8px", padding: "10px 16px", color: "#E8D9B5", fontSize: "14px", outline: "none" }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "8px", padding: "10px 16px", color: "#E8D9B5", fontSize: "14px", outline: "none" }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <Btn onClick={() => openModal("add")}>+ Add User</Btn>
      </div>

      {/* Table */}
      <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", overflow: "hidden" }}>
        <table>
          <thead>
            <tr style={{ borderBottom: "1px solid #1A2535" }}>
              {["User", "Account", "Balance", "Equity", "Trades", "KYC", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "14px 18px", fontSize: "11px", color: "#7A8FA6", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="row-hover" style={{ borderBottom: "1px solid #1A2535" }}>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #1E3A5F, #2A5080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: "#63B3ED", flexShrink: 0 }}>{u.name[0]}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#E8D9B5" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "#7A8FA6" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#7A8FA6" }}>{u.accountType}</td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#F0E6C8" }}>{fmt(u.balance)}</td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: u.equity >= u.balance ? "#34D399" : "#EF4444" }}>{fmt(u.equity)}</td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#7A8FA6" }}>{u.totalTrades}</td>
                <td style={{ padding: "14px 18px" }}><Badge status={u.kyc} /></td>
                <td style={{ padding: "14px 18px" }}><Badge status={u.status} /></td>
                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#7A8FA6", fontFamily: "'IBM Plex Mono', monospace" }}>{u.joined}</td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Btn small onClick={() => openModal("view", u)}>View</Btn>
                    <Btn small variant="ghost" onClick={() => openModal("edit", u)}>Edit</Btn>
                    <Btn small variant="ghost" onClick={() => openModal("balance", u)}>Balance</Btn>
                    <Btn small danger onClick={() => toggleStatus(u.id)}>{u.status === "active" ? "Suspend" : "Activate"}</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#7A8FA6" }}>No users found</div>}
      </div>

      {/* View / Edit Modal */}
      <Modal open={modal?.mode === "view" || modal?.mode === "edit" || modal?.mode === "add"} onClose={() => setModal(null)}
        title={modal?.mode === "add" ? "Add New User" : modal?.mode === "edit" ? "Edit User" : "User Details"}>
        {form && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Input label="Full Name" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} disabled={modal?.mode === "view"} />
              <Input label="Email" value={form.email || ""} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} disabled={modal?.mode === "view"} />
              <Input label="Phone" value={form.phone || ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} disabled={modal?.mode === "view"} />
              <Input label="Country" value={form.country || ""} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} disabled={modal?.mode === "view"} />
              {modal?.mode !== "view" && (
                <>
                  <Select label="Account Type" value={form.accountType || "Basic"} onChange={e => setForm(p => ({ ...p, accountType: e.target.value }))}
                    options={[{ value: "Basic", label: "Basic" }, { value: "Standard", label: "Standard" }, { value: "Premium", label: "Premium" }, { value: "VIP", label: "VIP" }]} />
                  <Select label="Status" value={form.status || "pending"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    options={[{ value: "active", label: "Active" }, { value: "pending", label: "Pending" }, { value: "suspended", label: "Suspended" }]} />
                  <Select label="KYC Status" value={form.kyc || "pending"} onChange={e => setForm(p => ({ ...p, kyc: e.target.value }))}
                    options={[{ value: "verified", label: "Verified" }, { value: "pending", label: "Pending" }, { value: "rejected", label: "Rejected" }]} />
                </>
              )}
              {modal?.mode === "view" && (
                <>
                  <Input label="Balance" value={fmt(form.balance)} disabled />
                  <Input label="Joined" value={form.joined} disabled />
                </>
              )}
            </div>
            {modal?.mode !== "view" && (
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
                <Btn onClick={saveUser}>{modal?.mode === "add" ? "Create User" : "Save Changes"}</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Balance Adjustment Modal */}
      <Modal open={modal?.mode === "balance"} onClose={() => setModal(null)} title={`Adjust Balance — ${modal?.user?.name}`}>
        <div style={{ marginBottom: "16px", padding: "16px", background: "#0A1018", borderRadius: "10px" }}>
          <div style={{ fontSize: "12px", color: "#7A8FA6", marginBottom: "4px" }}>Current Balance</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "28px", color: "#FFD700" }}>{fmt(modal?.user?.balance || 0)}</div>
        </div>
        <Select label="Adjustment Type" value={balanceAdjust.type} onChange={e => setBalanceAdjust(p => ({ ...p, type: e.target.value }))}
          options={[{ value: "add", label: "➕ Credit (Add)" }, { value: "subtract", label: "➖ Debit (Subtract)" }]} />
        <Input label="Amount (USD)" type="number" value={balanceAdjust.amount} onChange={e => setBalanceAdjust(p => ({ ...p, amount: e.target.value }))} />
        <Input label="Internal Note" value={balanceAdjust.note} onChange={e => setBalanceAdjust(p => ({ ...p, note: e.target.value }))} />
        {balanceAdjust.amount && (
          <div style={{ padding: "12px 16px", background: "#0A1018", borderRadius: "8px", marginBottom: "16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px" }}>
            New balance: <span style={{ color: "#34D399" }}>{fmt((modal?.user?.balance || 0) + (balanceAdjust.type === "add" ? 1 : -1) * parseFloat(balanceAdjust.amount || 0))}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={adjustBalance}>Apply Adjustment</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function FundingPage({ funding, setFunding, toast }) {
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState("");

  const filtered = filter === "all" ? funding : funding.filter(f => f.status === filter);

  const handleAction = (id, action) => {
    setFunding(p => p.map(f => f.id === id ? { ...f, status: action, note } : f));
    toast(action === "approved" ? "Request approved ✓" : "Request rejected", action === "approved" ? "success" : "error");
    setModal(null);
    setNote("");
  };

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Pending", count: funding.filter(f => f.status === "pending").length, color: "#FBBF24" },
          { label: "Approved", count: funding.filter(f => f.status === "approved").length, color: "#34D399" },
          { label: "Rejected", count: funding.filter(f => f.status === "rejected").length, color: "#EF4444" },
          { label: "Total Volume", count: fmt(funding.reduce((s, f) => s + f.amount, 0)), color: "#63B3ED" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#7A8FA6", textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "28px", color: c.color, marginTop: "6px" }}>{c.count}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["all", "pending", "approved", "rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", background: filter === s ? "rgba(255,215,0,0.1)" : "transparent", color: filter === s ? "#FFD700" : "#7A8FA6", borderColor: filter === s ? "rgba(255,215,0,0.3)" : "#1A2535" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", overflow: "hidden" }}>
        <table>
          <thead>
            <tr style={{ borderBottom: "1px solid #1A2535" }}>
              {["#", "User", "Type", "Amount", "Method", "Status", "Time", "Actions"].map(h => (
                <th key={h} style={{ padding: "14px 18px", fontSize: "11px", color: "#7A8FA6", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="row-hover" style={{ borderBottom: "1px solid #1A2535" }}>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#7A8FA6" }}>#{f.id.toString().padStart(4, "0")}</td>
                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#E8D9B5", fontWeight: 500 }}>{f.userName}</td>
                <td style={{ padding: "14px 18px" }}><Badge status={f.type} /></td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", color: f.type === "deposit" ? "#34D399" : "#FB7185" }}>{f.type === "withdrawal" ? "−" : "+"}{fmt(f.amount)}</td>
                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#7A8FA6" }}>{f.method}</td>
                <td style={{ padding: "14px 18px" }}><Badge status={f.status} /></td>
                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#7A8FA6", fontFamily: "'IBM Plex Mono', monospace" }}>{timeAgo(f.created)}</td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {f.status === "pending" ? (
                      <>
                        <Btn small onClick={() => { setModal(f); setNote(""); }}>Review</Btn>
                      </>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#7A8FA6", fontStyle: "italic" }}>{f.note || "—"}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#7A8FA6" }}>No requests found</div>}
      </div>

      {/* Review Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={`Review ${modal?.type === "deposit" ? "Deposit" : "Withdrawal"} Request`}>
        {modal && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { l: "User", v: modal.userName },
                { l: "Amount", v: fmt(modal.amount) },
                { l: "Method", v: modal.method },
                { l: "Submitted", v: timeAgo(modal.created) },
              ].map((i, idx) => (
                <div key={idx} style={{ background: "#0A1018", borderRadius: "8px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", color: "#7A8FA6", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{i.l}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", color: "#F0E6C8" }}>{i.v}</div>
                </div>
              ))}
            </div>
            {modal.proof && (
              <div style={{ background: "#0A1018", borderRadius: "8px", padding: "14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#63B3ED" }}>📎</span>
                <span style={{ fontSize: "13px", color: "#63B3ED" }}>{modal.proof}</span>
                <span style={{ fontSize: "11px", color: "#7A8FA6", marginLeft: "auto" }}>View Proof</span>
              </div>
            )}
            <Input label="Admin Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn danger onClick={() => handleAction(modal.id, "rejected")}>Reject</Btn>
              <Btn onClick={() => handleAction(modal.id, "approved")}>Approve</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRADES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function TradesPage({ trades }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? trades : trades.filter(t => t.status === filter);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { l: "Total Trades", v: trades.length, c: "#FFD700" },
          { l: "Open Trades", v: trades.filter(t => t.status === "open").length, c: "#63B3ED" },
          { l: "Closed Trades", v: trades.filter(t => t.status === "closed").length, c: "#A0AEC0" },
          { l: "Total P&L", v: fmt(trades.reduce((s, t) => s + t.profit, 0)), c: "#34D399" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#7A8FA6", textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.l}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "26px", color: c.c, marginTop: "6px" }}>{c.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["all", "open", "closed"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", background: filter === s ? "rgba(255,215,0,0.1)" : "transparent", color: filter === s ? "#FFD700" : "#7A8FA6", borderColor: filter === s ? "rgba(255,215,0,0.3)" : "#1A2535" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", overflow: "hidden" }}>
        <table>
          <thead>
            <tr style={{ borderBottom: "1px solid #1A2535" }}>
              {["#", "User", "Symbol", "Type", "Lots", "Open Price", "Close Price", "P&L", "Status", "Opened"].map(h => (
                <th key={h} style={{ padding: "14px 18px", fontSize: "11px", color: "#7A8FA6", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="row-hover" style={{ borderBottom: "1px solid #1A2535" }}>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#7A8FA6" }}>#{t.id}</td>
                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#E8D9B5" }}>{t.userName}</td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#FFD700", fontWeight: 600 }}>{t.symbol}</td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ color: t.type === "buy" ? "#34D399" : "#FB7185", textTransform: "uppercase", fontSize: "11px", fontWeight: 700 }}>{t.type}</span>
                </td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#7A8FA6" }}>{t.lots}</td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#E8D9B5" }}>{t.openPrice}</td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#E8D9B5" }}>{t.closePrice || "—"}</td>
                <td style={{ padding: "14px 18px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: t.profit >= 0 ? "#34D399" : "#EF4444" }}>
                  {t.profit >= 0 ? "+" : ""}{fmt(t.profit)}
                </td>
                <td style={{ padding: "14px 18px" }}><Badge status={t.status} /></td>
                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#7A8FA6", fontFamily: "'IBM Plex Mono', monospace" }}>{timeAgo(t.opened)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function ReportsPage({ users, trades }) {
  const accountDist = ["Basic", "Standard", "Premium", "VIP"].map(t => ({
    type: t, count: users.filter(u => u.accountType === t).length,
    volume: users.filter(u => u.accountType === t).reduce((s, u) => s + u.balance, 0),
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Account Distribution */}
        <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "20px" }}>Account Distribution</div>
          {accountDist.map((a, i) => {
            const pct = users.length ? (a.count / users.length) * 100 : 0;
            const colors = ["#63B3ED", "#34D399", "#FFD700", "#FB7185"];
            return (
              <div key={a.type} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#E8D9B5" }}>{a.type}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#7A8FA6" }}>{a.count} users · {fmt(a.volume)}</span>
                </div>
                <div style={{ height: "6px", background: "#0A1018", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: colors[i], borderRadius: "3px", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* P&L Summary */}
        <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "20px" }}>P&L Summary</div>
          {[
            { l: "Total Realized P&L", v: fmt(trades.filter(t => t.status === "closed").reduce((s, t) => s + t.profit, 0)), c: "#34D399" },
            { l: "Unrealized P&L", v: fmt(trades.filter(t => t.status === "open").reduce((s, t) => s + t.profit, 0)), c: "#FBBF24" },
            { l: "Best Trade", v: fmt(Math.max(...trades.map(t => t.profit))), c: "#34D399" },
            { l: "Worst Trade", v: fmt(Math.min(...trades.map(t => t.profit))), c: "#EF4444" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 3 ? "1px solid #1A2535" : "none" }}>
              <span style={{ fontSize: "13px", color: "#7A8FA6" }}>{item.l}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "16px", color: item.c, fontWeight: 600 }}>{item.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Table Summary */}
      <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "16px" }}>User Portfolio Summary</div>
        <table>
          <thead>
            <tr style={{ borderBottom: "1px solid #1A2535" }}>
              {["User", "Account Type", "Balance", "Equity", "P&L", "Total Trades", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 14px", fontSize: "11px", color: "#7A8FA6", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="row-hover" style={{ borderBottom: "1px solid #1A2535" }}>
                <td style={{ padding: "12px 14px", fontSize: "13px", color: "#E8D9B5" }}>{u.name}</td>
                <td style={{ padding: "12px 14px", fontSize: "12px", color: "#7A8FA6" }}>{u.accountType}</td>
                <td style={{ padding: "12px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#F0E6C8" }}>{fmt(u.balance)}</td>
                <td style={{ padding: "12px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: u.equity >= u.balance ? "#34D399" : "#EF4444" }}>{fmt(u.equity)}</td>
                <td style={{ padding: "12px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: u.profit >= 0 ? "#34D399" : "#EF4444" }}>
                  {u.profit >= 0 ? "+" : ""}{fmt(u.profit)}
                </td>
                <td style={{ padding: "12px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#7A8FA6" }}>{u.totalTrades}</td>
                <td style={{ padding: "12px 14px" }}><Badge status={u.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPage({ toast }) {
  const [settings, setSettings] = useState({
    platformName: "Rizal Trade Platform",
    supportEmail: "support@rizaltrade.com",
    defaultLeverage: "100",
    maxLeverage: "500",
    minDeposit: "100",
    maintenanceMode: false,
    emailNotifications: true,
    autoKyc: false,
    tradingEnabled: true,
    withdrawalsEnabled: true,
  });

  const toggle = (k) => setSettings(p => ({ ...p, [k]: !p[k] }));
  const update = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const Toggle = ({ label, desc, k }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #1A2535" }}>
      <div>
        <div style={{ fontSize: "14px", color: "#E8D9B5", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: "12px", color: "#7A8FA6", marginTop: "2px" }}>{desc}</div>
      </div>
      <div onClick={() => toggle(k)}
        style={{ width: "44px", height: "24px", borderRadius: "12px", background: settings[k] ? "#FFD700" : "#1A2535", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: "3px", left: settings[k] ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: settings[k] ? "#0A0F14" : "#7A8FA6", transition: "left 0.2s" }} />
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Platform Settings */}
        <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "20px" }}>Platform Settings</div>
          {[
            { l: "Platform Name", k: "platformName" },
            { l: "Support Email", k: "supportEmail" },
            { l: "Default Leverage", k: "defaultLeverage" },
            { l: "Max Leverage", k: "maxLeverage" },
            { l: "Minimum Deposit (USD)", k: "minDeposit" },
          ].map(f => (
            <Input key={f.k} label={f.l} value={settings[f.k]} onChange={e => update(f.k, e.target.value)} />
          ))}
          <Btn onClick={() => toast("Settings saved")}>Save Settings</Btn>
        </div>

        {/* Feature Toggles */}
        <div style={{ background: "#0D1620", border: "1px solid #1A2535", borderRadius: "14px", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#F0E6C8", marginBottom: "4px" }}>Feature Controls</div>
          <div style={{ fontSize: "12px", color: "#7A8FA6", marginBottom: "16px" }}>Toggle platform features in real-time</div>
          <Toggle label="Trading Enabled" desc="Allow users to open and close trades" k="tradingEnabled" />
          <Toggle label="Withdrawals Enabled" desc="Allow users to submit withdrawal requests" k="withdrawalsEnabled" />
          <Toggle label="Email Notifications" desc="Send automated email alerts to users" k="emailNotifications" />
          <Toggle label="Auto KYC Verification" desc="Automatically verify uploaded KYC docs" k="autoKyc" />
          <Toggle label="Maintenance Mode" desc="Show maintenance page to all users" k="maintenanceMode" />
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ background: "#0D1620", border: "1px solid #EF444430", borderRadius: "14px", padding: "24px", marginTop: "24px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#EF4444", marginBottom: "16px" }}>⚠ Danger Zone</div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Btn danger onClick={() => toast("All caches cleared", "success")}>Clear All Caches</Btn>
          <Btn danger onClick={() => toast("Sessions invalidated", "error")}>Force Logout All Users</Btn>
          <Btn danger onClick={() => toast("Database backup initiated", "success")}>Backup Database</Btn>
        </div>
      </div>
    </div>
  );
}