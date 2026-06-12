import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:        "#0B0F1A",
  bg2:       "#111827",
  bg3:       "#1A2235",
  border:    "#1F2D45",
  input:     "#141C2E",
  gold:      "#D4A843",
  goldMuted: "#A07728",
  goldSub:   "rgba(212,168,67,0.12)",
  teal:      "#0BCEAF",
  tealMuted: "#0A9E88",
  tealSub:   "rgba(11,206,175,0.10)",
  text:      "#E8EDF5",
  textMuted: "#8B97B5",
  textDim:   "#4E5E7A",
  link:      "#4F9CF8",
  green:     "#22C55E",
  greenBg:   "rgba(34,197,94,0.10)",
  amber:     "#F59E0B",
  amberBg:   "rgba(245,158,11,0.10)",
  red:       "#EF4444",
  redBg:     "rgba(239,68,68,0.10)",
  blue:      "#3B82F6",
  blueBg:    "rgba(59,130,246,0.10)",
  purple:    "#8B5CF6",
  orange:    "#F97316",
};

const FF = { sans: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" };

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_USERS = Array.from({ length: 48 }, (_, i) => ({
  id: `u${i + 1}`,
  name: ["James Okafor", "Amara Diallo", "Priya Nair", "Chen Wei", "Sofia Alvarez", "Mohammed Al-Rashid", "Emma Wilson", "David Nwosu"][i % 8],
  email: `user${i + 1}@example.com`,
  phone: `+234 80${String(i).padStart(8, "0")}`,
  account: `VFX-${100200 + i}`,
  country: ["Nigeria", "Ghana", "Kenya", "South Africa", "UAE", "UK", "USA", "Brazil"][i % 8],
  flag: ["🇳🇬", "🇬🇭", "🇰🇪", "🇿🇦", "🇦🇪", "🇬🇧", "🇺🇸", "🇧🇷"][i % 8],
  status: ["active", "active", "active", "pending", "suspended", "active", "active", "banned"][i % 8],
  kyc: ["approved", "approved", "pending", "not_submitted", "approved", "rejected", "approved", "pending"][i % 8],
  balance: (Math.random() * 50000 + 500).toFixed(2),
  registered: `${["14 Jan", "22 Feb", "5 Mar", "18 Apr", "1 May", "30 Jun", "11 Jul", "2 Aug"][i % 8]} 2025`,
  lastLogin: ["2 hours ago", "5 min ago", "1 day ago", "3 hours ago", "12 days ago", "30 min ago", "just now", "2 days ago"][i % 8],
  dob: "1990-04-15",
  nationality: ["Nigerian", "Ghanaian", "Kenyan", "South African", "Emirati", "British", "American", "Brazilian"][i % 8],
  address: `${i + 1} Market Street, City`,
  tier: ["standard", "pro", "raw_ecn", "standard", "pro", "standard", "raw_ecn", "standard"][i % 8],
}));

const MOCK_KYC = Array.from({ length: 20 }, (_, i) => ({
  id: `kyc${i + 1}`,
  user: MOCK_USERS[i],
  docType: ["National ID", "Passport", "Driver's License", "Utility Bill"][i % 4],
  submitted: `${i + 1} Jun 2025 ${String(9 + (i % 12)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
  daysWaiting: i % 5,
  status: ["pending", "approved", "rejected", "pending", "resubmission"][i % 5],
  assignedTo: i % 3 === 0 ? "Sarah K." : i % 3 === 1 ? "Tom A." : "Unassigned",
}));

const MOCK_POSITIONS = Array.from({ length: 18 }, (_, i) => {
  const pnl = (Math.random() * 4000 - 1500).toFixed(2);
  const marginLevel = Math.floor(Math.random() * 800 + 30);
  return {
    id: `pos${i + 1}`,
    ticket: `#${180000 + i * 13}`,
    user: MOCK_USERS[i % MOCK_USERS.length].name,
    account: `VFX-${100200 + i}`,
    symbol: ["EURUSD", "BTCUSD", "AAPL", "GOLD", "GBPUSD", "ETHUSD", "NASDAQ"][i % 7],
    direction: i % 2 === 0 ? "BUY" : "SELL",
    volume: (0.1 + (i % 10) * 0.2).toFixed(2),
    openPrice: (1.0800 + Math.random() * 0.05).toFixed(5),
    currentPrice: (1.0800 + Math.random() * 0.05).toFixed(5),
    sl: (1.0600 + Math.random() * 0.02).toFixed(5),
    tp: (1.1000 + Math.random() * 0.02).toFixed(5),
    pnl,
    marginUsed: (Math.random() * 2000 + 100).toFixed(2),
    marginLevel,
    openTime: `${Math.floor(Math.random() * 8 + 1)}h ${Math.floor(Math.random() * 59 + 1)}m`,
  };
});

const MOCK_WITHDRAWALS = Array.from({ length: 15 }, (_, i) => ({
  id: `WD-${20000 + i}`,
  user: MOCK_USERS[i % MOCK_USERS.length],
  amount: (Math.random() * 9000 + 200).toFixed(2),
  currency: "USD",
  method: ["Bank Transfer", "Crypto (USDT)", "Bank Transfer", "Card"][i % 4],
  bankLast4: `${String(1000 + i * 137).slice(-4)}`,
  kycLevel: ["Level 2", "Level 3", "Level 1", "Level 3"][i % 4],
  requestedAt: `${i + 1} Jun 2025`,
  hoursWaiting: Math.floor(Math.random() * 72),
  status: ["pending", "approved", "pending", "rejected", "pending"][i % 5],
  amlFlag: i % 7 === 0,
}));

const MOCK_DEPOSITS = Array.from({ length: 20 }, (_, i) => ({
  id: `DEP-${30000 + i}`,
  user: MOCK_USERS[i % MOCK_USERS.length],
  amount: (Math.random() * 5000 + 100).toFixed(2),
  method: ["Card", "Bank Wire", "Crypto", "Flutterwave"][i % 4],
  gatewayRef: `gw_${Math.random().toString(36).slice(2, 12)}`,
  status: ["completed", "completed", "pending", "failed", "completed"][i % 5],
  date: `${i + 1} Jun 2025`,
}));

const MOCK_TRADES = Array.from({ length: 40 }, (_, i) => ({
  ticket: `#${200000 + i * 7}`,
  user: MOCK_USERS[i % MOCK_USERS.length].name,
  account: `VFX-${100200 + i}`,
  symbol: ["EURUSD", "BTCUSD", "AAPL", "GOLD", "GBPUSD"][i % 5],
  direction: i % 2 === 0 ? "BUY" : "SELL",
  volume: (0.1 + (i % 8) * 0.15).toFixed(2),
  openPrice: (1.0800 + Math.random() * 0.05).toFixed(5),
  closePrice: i % 3 !== 0 ? (1.0900 + Math.random() * 0.04).toFixed(5) : "—",
  pnl: (Math.random() * 800 - 300).toFixed(2),
  commission: (Math.random() * 20).toFixed(2),
  swap: (Math.random() * 5 - 2).toFixed(2),
  openTime: `${i + 1} Jun 2025 ${String(8 + (i % 14)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
  closeTime: i % 3 !== 0 ? `${i + 1} Jun 2025 ${String(10 + (i % 12)).padStart(2, "0")}:${String((i * 19) % 60).padStart(2, "0")}` : "—",
  status: i % 3 === 0 ? "open" : "closed",
  platform: ["MT5", "WebTrader", "MT4", "MT5"][i % 4],
}));

const MOCK_AML = Array.from({ length: 12 }, (_, i) => ({
  id: `AML-${40000 + i}`,
  user: MOCK_USERS[i % MOCK_USERS.length],
  alertType: ["Large Cash Deposit", "Structuring Suspected", "Rapid Deposit-Withdrawal", "Sanctions List Match", "Unusual Geographic Activity", "Velocity Alert"][i % 6],
  txId: `TX-${50000 + i * 3}`,
  amount: (Math.random() * 20000 + 5000).toFixed(2),
  riskScore: Math.floor(Math.random() * 100),
  createdAt: `${i + 1} Jun 2025`,
  status: ["open", "open", "escalated", "cleared", "open"][i % 5],
  assignedTo: ["Sarah K.", "Tom A.", "Unassigned"][i % 3],
}));

const MOCK_INSTRUMENTS = [
  { symbol: "EURUSD", category: "Forex", spread: "0.1", commission: "$3.00", swapL: "-0.52", swapS: "0.23", minLot: "0.01", maxLot: "100", status: "active" },
  { symbol: "BTCUSD", category: "Crypto", spread: "12.0", commission: "$0", swapL: "-15.2", swapS: "-18.4", minLot: "0.01", maxLot: "10", status: "active" },
  { symbol: "AAPL", category: "Stocks", spread: "0.05", commission: "$0.02", swapL: "-1.2", swapS: "-2.1", minLot: "0.1", maxLot: "50", status: "active" },
  { symbol: "GOLD", category: "Commodities", spread: "0.30", commission: "$0", swapL: "-3.4", swapS: "0.9", minLot: "0.01", maxLot: "50", status: "active" },
  { symbol: "NAS100", category: "Indices", spread: "0.80", commission: "$0", swapL: "-4.2", swapS: "1.1", minLot: "0.01", maxLot: "20", status: "active" },
  { symbol: "GBPUSD", category: "Forex", spread: "0.2", commission: "$3.00", swapL: "-0.88", swapS: "0.45", minLot: "0.01", maxLot: "100", status: "active" },
  { symbol: "ETHUSD", category: "Crypto", spread: "1.5", commission: "$0", swapL: "-8.1", swapS: "-10.3", minLot: "0.01", maxLot: "20", status: "disabled" },
  { symbol: "OILUSD", category: "Commodities", spread: "0.04", commission: "$0", swapL: "-2.8", swapS: "0.6", minLot: "0.1", maxLot: "50", status: "active" },
];

const MOCK_STAFF = [
  { id: "s1", name: "Alexandra Hunt", email: "a.hunt@vertexfx.com", role: "super_admin", status: "active", lastLogin: "Today, 08:42 UTC", createdAt: "10 Jan 2024" },
  { id: "s2", name: "Thomas Ashby", email: "t.ashby@vertexfx.com", role: "admin", status: "active", lastLogin: "Today, 07:15 UTC", createdAt: "15 Jan 2024" },
  { id: "s3", name: "Sarah Kimani", email: "s.kimani@vertexfx.com", role: "compliance", status: "active", lastLogin: "Today, 09:01 UTC", createdAt: "20 Feb 2024" },
  { id: "s4", name: "Mike Adewale", email: "m.adewale@vertexfx.com", role: "finance", status: "active", lastLogin: "Yesterday, 17:30 UTC", createdAt: "1 Mar 2024" },
  { id: "s5", name: "Lena Müller", email: "l.muller@vertexfx.com", role: "support", status: "active", lastLogin: "Today, 06:55 UTC", createdAt: "12 Apr 2024" },
  { id: "s6", name: "Raj Patel", email: "r.patel@vertexfx.com", role: "risk_manager", status: "active", lastLogin: "2 days ago", createdAt: "5 May 2024" },
  { id: "s7", name: "Fatima Al-Zahra", email: "f.alzahra@vertexfx.com", role: "compliance", status: "suspended", lastLogin: "5 days ago", createdAt: "3 Jun 2024" },
];

const MOCK_AUDIT = Array.from({ length: 30 }, (_, i) => ({
  id: `audit${i + 1}`,
  timestamp: `Jun ${String(i % 8 + 1).padStart(2, "0")}, 2025 ${String(8 + (i % 14)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")} UTC`,
  actor: MOCK_STAFF[i % MOCK_STAFF.length].name,
  role: MOCK_STAFF[i % MOCK_STAFF.length].role,
  action: ["Approved KYC for user james.o@example.com", "Rejected withdrawal WD-20003", "Suspended user account VFX-100212", "Updated margin call level to 100%", "Approved deposit DEP-30007", "Force-closed position #180023", "Created staff account l.muller@vertexfx.com", "Updated instrument EURUSD spread to 0.1", "Cleared AML alert AML-40005", "Changed system setting: max_withdrawal_per_day"][i % 10],
  code: ["kyc.document.approve", "withdrawal.reject", "account.suspend", "settings.risk.update", "deposit.approve", "trade.force_close", "staff.create", "instrument.update", "aml.alert.clear", "settings.update"][i % 10],
  targetUser: MOCK_USERS[i % MOCK_USERS.length].email,
  ip: `192.168.${i % 5}.${i + 1}`,
  severity: ["info", "info", "warning", "warning", "info", "critical", "info", "info", "warning", "warning"][i % 10],
}));

const MOCK_BONUSES = Array.from({ length: 10 }, (_, i) => ({
  id: `bon${i + 1}`,
  user: MOCK_USERS[i].name,
  type: ["Welcome", "Deposit Match", "Referral", "Loyalty", "Promotional"][i % 5],
  amount: (Math.random() * 500 + 50).toFixed(2),
  progress: Math.floor(Math.random() * 100),
  status: ["active", "active", "withdrawn", "expired", "pending"][i % 5],
  expiry: `${20 + i} Jun 2025`,
}));

const MOCK_REFERRALS = Array.from({ length: 10 }, (_, i) => ({
  id: `ref${i + 1}`,
  referrer: MOCK_USERS[i].name,
  referred: MOCK_USERS[(i + 3) % MOCK_USERS.length].name,
  referredDate: `${i + 1} May 2025`,
  firstDepositDate: i % 3 !== 0 ? `${i + 5} May 2025` : "—",
  firstDepositAmt: i % 3 !== 0 ? (Math.random() * 2000 + 100).toFixed(2) : "—",
  commission: (Math.random() * 200 + 20).toFixed(2),
  status: ["qualified", "pending", "rewarded", "pending", "qualified"][i % 5],
}));

const CHART_REVENUE = Array.from({ length: 30 }, (_, i) => ({
  day: `Jun ${i + 1}`,
  trading: Math.floor(Math.random() * 12000 + 4000),
  fees: Math.floor(Math.random() * 3000 + 500),
}));

const CHART_REGS = Array.from({ length: 30 }, (_, i) => ({
  day: `Jun ${i + 1}`,
  registrations: Math.floor(Math.random() * 200 + 50),
  kyc: Math.floor(Math.random() * 120 + 20),
}));

const MOCK_ACTIVITY = [
  { time: "09:42:15", type: "TRADE", desc: "james.okafor@example.com opened BUY 0.5 EURUSD at 1.08432", color: C.blue },
  { time: "09:41:52", type: "DEPOSIT", desc: "amara.diallo@example.com deposited $2,500.00 via Card", color: C.green },
  { time: "09:41:30", type: "KYC", desc: "priya.nair@example.com submitted Passport for KYC review", color: C.gold },
  { time: "09:40:18", type: "WITHDRAWAL", desc: "chen.wei@example.com requested withdrawal of $1,200.00", color: C.amber },
  { time: "09:39:55", type: "ALERT", desc: "AML flag raised on account VFX-100207 — velocity alert", color: C.red },
  { time: "09:38:42", type: "TRADE", desc: "sofia.alvarez@example.com closed SELL 1.0 GOLD at 2,384.5 — P&L: +$342.00", color: C.blue },
  { time: "09:37:20", type: "DEPOSIT", desc: "mohammed.rashid@example.com deposited $5,000.00 via Bank Wire", color: C.green },
  { time: "09:36:05", type: "KYC", desc: "emma.wilson@example.com KYC approved by Sarah K.", color: C.teal },
  { time: "09:35:44", type: "TRADE", desc: "david.nwosu@example.com opened SELL 0.2 BTCUSD at 67,420", color: C.blue },
  { time: "09:34:11", type: "WITHDRAWAL", desc: "james.okafor@example.com withdrawal $800 approved", color: C.teal },
];

// ─── UTILITY COMPONENTS ────────────────────────────────────────────────────────

function Badge({ status, children }) {
  const map = {
    active: { bg: C.greenBg, color: C.green },
    approved: { bg: C.greenBg, color: C.green },
    completed: { bg: C.greenBg, color: C.green },
    online: { bg: C.greenBg, color: C.green },
    qualified: { bg: C.greenBg, color: C.green },
    rewarded: { bg: C.greenBg, color: C.green },
    pending: { bg: C.amberBg, color: C.amber },
    resubmission: { bg: C.amberBg, color: C.amber },
    processing: { bg: C.amberBg, color: C.amber },
    escalated: { bg: C.amberBg, color: C.amber },
    degraded: { bg: C.amberBg, color: C.amber },
    suspended: { bg: C.redBg, color: C.red },
    rejected: { bg: C.redBg, color: C.red },
    banned: { bg: C.redBg, color: C.red },
    failed: { bg: C.redBg, color: C.red },
    offline: { bg: C.redBg, color: C.red },
    open: { bg: C.blueBg, color: C.blue },
    info: { bg: C.blueBg, color: C.blue },
    not_submitted: { bg: "rgba(78,94,122,0.2)", color: C.textMuted },
    cleared: { bg: "rgba(78,94,122,0.2)", color: C.textMuted },
    disabled: { bg: "rgba(78,94,122,0.2)", color: C.textMuted },
    expired: { bg: "rgba(78,94,122,0.2)", color: C.textMuted },
    warning: { bg: C.amberBg, color: C.amber },
    critical: { bg: C.redBg, color: C.red },
    withdrawn: { bg: C.blueBg, color: C.blue },
    super_admin: { bg: "rgba(212,168,67,0.18)", color: C.gold },
    admin: { bg: "rgba(212,168,67,0.10)", color: C.gold },
    compliance: { bg: C.tealSub, color: C.teal },
    finance: { bg: C.greenBg, color: C.green },
    support: { bg: C.blueBg, color: C.blue },
    risk_manager: { bg: "rgba(139,92,246,0.15)", color: C.purple },
  };
  const s = map[status] || map[status?.toLowerCase()] || { bg: C.blueBg, color: C.blue };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 9px", borderRadius: 4,
      fontSize: 11, fontWeight: 600,
      fontFamily: FF.sans, textTransform: "uppercase", letterSpacing: 0.4,
      whiteSpace: "nowrap",
    }}>
      {children || status?.replace(/_/g, " ")}
    </span>
  );
}

function Avatar({ name, size = 36 }) {
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const colors = [C.gold, C.teal, C.blue, C.purple, C.orange];
  const color = colors[name?.charCodeAt(0) % colors.length] || C.gold;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}33, ${color}22)`,
      border: `1.5px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FF.sans, fontSize: size * 0.33, fontWeight: 700, color, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function KpiCard({ title, value, delta, deltaUp, icon, sub, onClick, flash }) {
  const [highlighted, setHighlighted] = useState(false);
  useEffect(() => {
    if (flash) { setHighlighted(true); setTimeout(() => setHighlighted(false), 600); }
  }, [flash]);
  return (
    <div onClick={onClick} style={{
      background: C.bg2, border: `1px solid ${highlighted ? C.gold + "60" : C.border}`,
      borderRadius: 12, padding: "20px 22px", cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.3s, background 0.3s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = C.bg3)}
      onMouseLeave={e => onClick && (e.currentTarget.style.background = C.bg2)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: FF.mono, fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      {sub && <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, color: deltaUp ? C.green : C.red, fontFamily: FF.sans, fontWeight: 600 }}>
            {deltaUp ? "▲" : "▼"} {delta}
          </span>
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: FF.sans }}>vs yesterday</span>
        </div>
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16,
        width: wide ? "min(900px, 96vw)" : "min(520px, 96vw)",
        maxHeight: "88vh", overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        padding: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: FF.sans, fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: C.textMuted, cursor: "pointer",
            fontSize: 22, lineHeight: 1, padding: "2px 6px", borderRadius: 6,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SideSheet({ open, onClose, title, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 8000, pointerEvents: open ? "all" : "none",
    }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
        opacity: open ? 1 : 0, transition: "opacity 0.25s", pointerEvents: open ? "all" : "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: "min(540px, 96vw)", background: C.bg2,
        borderLeft: `1px solid ${C.border}`,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
        overflow: "auto", padding: 28,
        boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: FF.sans, fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: C.textMuted, cursor: "pointer",
            fontSize: 22, lineHeight: 1, padding: "2px 6px",
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", style: s }) {
  return (
    <div style={{ marginBottom: 16, ...s }}>
      {label && <label style={{ display: "block", fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", background: C.input, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "9px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text,
          outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
        }}
        onFocus={e => (e.target.style.borderColor = C.gold)}
        onBlur={e => (e.target.style.borderColor = C.border)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, style: s }) {
  return (
    <div style={{ marginBottom: 16, ...s }}>
      {label && <label style={{ display: "block", fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</label>}
      <select
        value={value} onChange={e => onChange?.(e.target.value)}
        style={{
          width: "100%", background: C.input, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "9px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text,
          outline: "none", boxSizing: "border-box", cursor: "pointer",
        }}
        onFocus={e => (e.target.style.borderColor = C.gold)}
        onBlur={e => (e.target.style.borderColor = C.border)}>
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: C.bg2 }}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, style: s }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 6, border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: FF.sans, fontWeight: 600, transition: "opacity 0.15s, transform 0.15s",
    opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
  };
  const sizes = { sm: { fontSize: 11, padding: "5px 12px" }, md: { fontSize: 13, padding: "9px 18px" }, lg: { fontSize: 14, padding: "11px 24px" } };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`, color: "#000" },
    teal: { background: `linear-gradient(135deg, ${C.teal}, ${C.tealMuted})`, color: "#000" },
    danger: { background: C.redBg, color: C.red, border: `1px solid ${C.red}44` },
    success: { background: C.greenBg, color: C.green, border: `1px solid ${C.green}44` },
    ghost: { background: "transparent", color: C.textMuted, border: `1px solid ${C.border}` },
    outline: { background: "transparent", color: C.gold, border: `1px solid ${C.gold}66` },
  };
  return (
    <button onClick={!disabled ? onClick : undefined} style={{ ...base, ...sizes[size], ...variants[variant], ...s }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.82")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = "1")}>
      {children}
    </button>
  );
}

function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: "10px 14px", textAlign: "left",
                fontFamily: FF.sans, fontSize: 11, fontWeight: 600,
                color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6,
                borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}
              onClick={() => onRowClick?.(row)}
              style={{ borderBottom: `1px solid ${C.border}22`, cursor: onRowClick ? "pointer" : "default", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.bg3)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: "12px 14px", fontFamily: col.mono ? FF.mono : FF.sans, fontSize: 13, color: C.text, whiteSpace: "nowrap" }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: "48px 24px", textAlign: "center", color: C.textDim, fontFamily: FF.sans, fontSize: 14 }}>No records found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Sparkline({ data, color = C.gold }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 64, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function AreaChart({ data, keys, colors, height = 200 }) {
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)));
  const w = 100, h = height;
  const x = (i) => (i / (data.length - 1)) * w;
  const y = (v) => h - (v / (maxVal || 1)) * h * 0.88;
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        {keys.map((k, ki) => (
          <linearGradient key={k} id={`grad${ki}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[ki]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors[ki]} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      {keys.map((k, ki) => {
        const pts = data.map((d, i) => `${x(i)},${y(d[k] || 0)}`);
        const area = `${x(0)},${h} ` + pts.join(" ") + ` ${x(data.length - 1)},${h}`;
        return (
          <g key={k}>
            <polygon points={area} fill={`url(#grad${ki})`} />
            <polyline points={pts.join(" ")} fill="none" stroke={colors[ki]} strokeWidth={0.5} strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
}

function BarChartSimple({ data, keyA, keyB, colorA = C.gold, colorB = C.teal, height = 180 }) {
  const maxVal = Math.max(...data.map(d => Math.max(d[keyA] || 0, d[keyB] || 0)));
  const barW = 90 / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const hA = ((d[keyA] || 0) / (maxVal || 1)) * height * 0.88;
        const hB = ((d[keyB] || 0) / (maxVal || 1)) * height * 0.88;
        const x = (i / data.length) * 100 + barW * 0.05;
        return (
          <g key={i}>
            <rect x={x} y={height - hA} width={barW * 0.45} height={hA} fill={colorA} opacity={0.8} rx={0.4} />
            {keyB && <rect x={x + barW * 0.5} y={height - hB} width={barW * 0.45} height={hB} fill={colorB} opacity={0.8} rx={0.4} />}
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ data, size = 140 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = -Math.PI / 2;
  const r = size / 2 - 10, cx = size / 2, cy = size / 2;
  const slices = data.map(d => {
    const start = angle;
    const sweep = (d.value / total) * 2 * Math.PI;
    angle += sweep;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(start + sweep), y2 = cy + r * Math.sin(start + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}Z`, color: d.color };
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r + 1} fill={C.bg} />
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.85} />)}
      <circle cx={cx} cy={cy} r={r * 0.52} fill={C.bg2} />
    </svg>
  );
}

function StatCard({ label, value, color = C.gold }) {
  return (
    <div style={{ background: C.bg3, borderRadius: 10, padding: "14px 18px", border: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: FF.mono, fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <h2 style={{ fontFamily: FF.sans, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, style: s }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.4)", ...s }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "18px 0" }} />;
}

function FilterBar({ search, onSearch, filters, onFilterChange, onReset }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
      <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textDim, fontSize: 14 }}>🔍</span>
        <input
          value={search} onChange={e => onSearch(e.target.value)} placeholder="Search..."
          style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FF.sans, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }}
          onFocus={e => (e.target.style.borderColor = C.gold)}
          onBlur={e => (e.target.style.borderColor = C.border)}
        />
      </div>
      {filters?.map((f, i) => (
        <select key={i} value={f.value} onChange={e => onFilterChange?.(i, e.target.value)}
          style={{ background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text, cursor: "pointer", outline: "none" }}>
          {f.options.map(o => <option key={o.value} value={o.value} style={{ background: C.bg2 }}>{o.label}</option>)}
        </select>
      ))}
      <Btn variant="ghost" size="sm" onClick={onReset}>Reset</Btn>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}`, marginBottom: 22 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: "10px 18px", fontFamily: FF.sans, fontSize: 13, fontWeight: active === t.key ? 600 : 400,
          color: active === t.key ? C.gold : C.textMuted, background: "none", border: "none", cursor: "pointer",
          borderBottom: active === t.key ? `2px solid ${C.gold}` : "2px solid transparent",
          marginBottom: -1, transition: "color 0.15s",
        }}>{t.label}{t.badge != null ? <span style={{ marginLeft: 6, background: C.red, color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>{t.badge}</span> : null}</button>
      ))}
    </div>
  );
}

function Toast({ toasts, onRemove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: C.bg2, border: `1px solid ${t.type === "success" ? C.green : t.type === "error" ? C.red : C.blue}66`,
          borderRadius: 10, padding: "14px 18px 14px 14px", display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 280, maxWidth: 360, animation: "slideIn 0.25s ease",
        }}>
          <span style={{ fontSize: 16 }}>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, flex: 1 }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── TOPBAR ────────────────────────────────────────────────────────────────────
function TopBar({ admin, onSearch, showNotifs, setShowNotifs, notifications, onNavigate }) {
  const [time, setTime] = useState(new Date());
  const [searchQ, setSearchQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utcTime = time.toUTCString().split(" ").slice(4, 5)[0];

  const searchResults = searchQ.length > 1
    ? MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase()) || u.account.includes(searchQ)).slice(0, 5)
    : [];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 64, zIndex: 1000,
      background: C.bg, borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, width: 220, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "serif" }}>V</span>
        </div>
        <div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: 0.5 }}>
            VERTEX<span style={{ color: C.gold }}>FX</span>
          </span>
          <span style={{ fontFamily: FF.sans, fontSize: 9, color: C.textDim, display: "block", letterSpacing: 1.5, textTransform: "uppercase", marginTop: -2 }}>Admin</span>
        </div>
      </div>

      {/* Global Search */}
      <div style={{ flex: 1, maxWidth: 420, position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textDim, fontSize: 13 }}>🔍</span>
        <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 180)}
          placeholder="Search users, accounts, transactions..."
          style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FF.sans, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }}
          onFocus={e => (e.target.style.borderColor = C.gold)}
          onBlur={e => (e.target.style.borderColor = C.border)}
        />
        {showSearch && searchResults.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 200, overflow: "hidden" }}>
            {searchResults.map(u => (
              <div key={u.id} onClick={() => { onNavigate("user-detail", u); setSearchQ(""); setShowSearch(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bg3)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Avatar name={u.name} size={28} />
                <div>
                  <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>{u.email} · {u.account}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* UTC Clock */}
      <div style={{ fontFamily: FF.mono, fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>
        {utcTime} <span style={{ color: C.textDim }}>UTC</span>
      </div>

      {/* Active Users */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.bg3, borderRadius: 20, padding: "5px 12px", border: `1px solid ${C.border}` }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
        <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>1,247 online</span>
      </div>

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowNotifs(!showNotifs)}
          style={{ position: "relative", background: showNotifs ? C.bg3 : "none", border: `1px solid ${showNotifs ? C.border : "transparent"}`, borderRadius: 8, padding: "7px 9px", cursor: "pointer", color: C.textMuted, fontSize: 18 }}>
          🔔
          {notifications.filter(n => !n.read).length > 0 && (
            <span style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, background: C.red, borderRadius: "50%", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FF.sans }}>
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
        {showNotifs && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 360, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", zIndex: 300, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Notifications</span>
              <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.link, cursor: "pointer" }}>Mark all read</span>
            </div>
            {notifications.map(n => (
              <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}22`, background: n.read ? "transparent" : C.goldSub, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bg3)}
                onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : C.goldSub)}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>{n.icon}</span>
                  <div>
                    <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textDim, marginTop: 3 }}>{n.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile */}
      <div style={{ position: "relative" }}>
        <div onClick={() => setProfileOpen(!profileOpen)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 10px", borderRadius: 10, background: profileOpen ? C.bg3 : "transparent", border: `1px solid ${profileOpen ? C.border : "transparent"}`, transition: "all 0.15s" }}>
          <Avatar name={admin.name} size={30} />
          <div>
            <div style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1 }}>{admin.name}</div>
            <div style={{ fontFamily: FF.sans, fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 }}>{admin.role.replace("_", " ")}</div>
          </div>
          <span style={{ color: C.textDim, fontSize: 10 }}>▼</span>
        </div>
        {profileOpen && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: 200, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 300, overflow: "hidden" }}>
            {[["👤", "My Profile"], ["🔑", "Change Password"], ["—", null], ["🚪", "Logout"]].map(([ic, label], i) => (
              label === null ? <div key={i} style={{ height: 1, background: C.border, margin: "4px 0" }} /> :
                <button key={label} style={{ width: "100%", padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", fontFamily: FF.sans, fontSize: 13, color: label === "Logout" ? C.red : C.textMuted, textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bg3)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                  <span>{ic}</span>{label}
                </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { group: "OVERVIEW", items: [{ key: "dashboard", label: "Dashboard", icon: "▦" }] },
  { group: "CLIENTS", items: [
    { key: "users", label: "All Users", icon: "👥" },
    { key: "kyc", label: "KYC Verification", icon: "🛡", badge: 8 },
    { key: "user-activity", label: "User Activity", icon: "📊" },
  ]},
  { group: "TRADING", items: [
    { key: "live-positions", label: "Live Positions", icon: "📈", badge: 18, badgeColor: C.teal },
    { key: "trade-history", label: "Trade History", icon: "🗂" },
    { key: "instruments", label: "Instruments", icon: "📉" },
  ]},
  { group: "FINANCE", items: [
    { key: "deposits", label: "Deposits", icon: "⬇" },
    { key: "withdrawals", label: "Withdrawals", icon: "⬆", badge: 7 },
    { key: "transactions", label: "Transactions", icon: "🔄" },
    { key: "ledger", label: "Ledger", icon: "📖" },
  ]},
  { group: "RISK & COMPLIANCE", items: [
    { key: "risk-monitor", label: "Risk Monitor", icon: "⚠️" },
    { key: "aml-alerts", label: "AML Alerts", icon: "🔍", badge: 5 },
    { key: "compliance-reports", label: "Compliance Reports", icon: "📋" },
  ]},
  { group: "ANALYTICS", items: [
    { key: "reports-overview", label: "Overview Reports", icon: "🥧" },
    { key: "reports-financial", label: "Financial Reports", icon: "💵" },
    { key: "reports-trading", label: "Trading Reports", icon: "📊" },
    { key: "reports-client", label: "Client Reports", icon: "✅" },
  ]},
  { group: "MARKETING", items: [
    { key: "bonuses", label: "Bonuses", icon: "🎁" },
    { key: "referrals", label: "Referral Programme", icon: "🔗" },
    { key: "announcements", label: "Announcements", icon: "📢" },
  ]},
  { group: "ADMINISTRATION", items: [
    { key: "staff", label: "Staff Management", icon: "👤", superAdminOnly: true },
    { key: "audit-logs", label: "Audit Logs", icon: "📋" },
    { key: "system-settings", label: "System Settings", icon: "⚙️", superAdminOnly: true },
  ]},
];

function Sidebar({ active, onNavigate, collapsed, role }) {
  return (
    <div style={{
      position: "fixed", left: 0, top: 64, bottom: 0,
      width: collapsed ? 72 : 260, background: C.bg,
      borderRight: `1px solid ${C.border}`,
      overflowY: "auto", overflowX: "hidden",
      transition: "width 0.25s ease", zIndex: 900,
      scrollbarWidth: "none",
    }}>
      {NAV_GROUPS.map(g => (
        <div key={g.group} style={{ paddingTop: 16 }}>
          {!collapsed && (
            <div style={{ padding: "0 16px 6px", fontFamily: FF.sans, fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.2, textTransform: "uppercase" }}>{g.group}</div>
          )}
          {g.items.map(item => {
            if (item.superAdminOnly && role !== "super_admin") return null;
            const isActive = active === item.key;
            return (
              <button key={item.key} onClick={() => onNavigate(item.key)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 10, padding: collapsed ? "11px 0" : "10px 16px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: isActive ? C.goldSub : "none", border: "none",
                  borderLeft: isActive ? `3px solid ${C.gold}` : "3px solid transparent",
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = "none")}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? C.gold : C.textMuted, flex: 1 }}>{item.label}</span>
                    {item.badge != null && (
                      <span style={{ background: item.badgeColor || C.red, color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 7px", fontWeight: 700, fontFamily: FF.sans }}>{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <div style={{ height: 32 }} />
    </div>
  );
}

// ─── MODULE: DASHBOARD ────────────────────────────────────────────────────────
function Dashboard({ onNavigate, addToast }) {
  const [range, setRange] = useState("30D");
  const [flash, setFlash] = useState(false);
  const [activity, setActivity] = useState(MOCK_ACTIVITY);
  const sparkData = [420, 450, 390, 480, 510, 460, 530];

  useEffect(() => {
    const id = setInterval(() => {
      const events = [
        { time: new Date().toTimeString().slice(0, 8), type: "TRADE", desc: "New BUY position opened on EURUSD", color: C.blue },
        { time: new Date().toTimeString().slice(0, 8), type: "DEPOSIT", desc: "New deposit received", color: C.green },
        { time: new Date().toTimeString().slice(0, 8), type: "KYC", desc: "New KYC submission received", color: C.gold },
      ];
      setActivity(prev => [events[Math.floor(Math.random() * events.length)], ...prev].slice(0, 50));
      setFlash(f => !f);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const kpiCards = [
    { title: "Total Active Users", value: "31,204", delta: "+247", deltaUp: true, icon: "👥", sub: "vs 30,957 yesterday" },
    { title: "Total AUM", value: "$4.28B", delta: "+$12.4M", deltaUp: true, icon: "💰", sub: "All live accounts" },
    { title: "Today's Deposits", value: "$842,300", delta: "+18%", deltaUp: true, icon: "⬇", sub: "247 transactions" },
    { title: "Today's Withdrawals", value: "$214,500", delta: "-5%", deltaUp: false, icon: "⬆", sub: "63 transactions" },
    { title: "Open Positions", value: "18,432", delta: "+234", deltaUp: true, icon: "📈", sub: "Live now" },
    { title: "Pending KYC", value: "8", delta: "-3", deltaUp: false, icon: "🛡", sub: "Awaiting review", nav: "kyc" },
    { title: "Pending Withdrawals", value: "7", delta: "+2", deltaUp: true, icon: "⏳", sub: "Awaiting approval", nav: "withdrawals" },
    { title: "AML Alerts", value: "5", delta: "+1", deltaUp: true, icon: "🚨", sub: "Unresolved", nav: "aml-alerts" },
  ];

  const statusItems = [
    { label: "API Server", status: "online" },
    { label: "Database", status: "online" },
    { label: "Redis Cache", status: "online" },
    { label: "MT5 Bridge", status: "online" },
    { label: "Stripe", status: "online" },
    { label: "Flutterwave", status: "degraded" },
  ];

  const chartData = range === "7D" ? CHART_REVENUE.slice(-7) : range === "30D" ? CHART_REVENUE : range === "90D" ? [...CHART_REVENUE, ...CHART_REVENUE, ...CHART_REVENUE] : CHART_REVENUE;

  const topTraders = MOCK_USERS.slice(0, 10).map((u, i) => ({
    rank: i + 1,
    name: u.name,
    account: u.account,
    country: `${u.flag} ${u.country}`,
    volume: `${(Math.random() * 500 + 50).toFixed(0)} lots`,
    pnl: `${Math.random() > 0.5 ? "+" : "-"}$${(Math.random() * 8000 + 500).toFixed(0)}`,
    balance: `$${Number(u.balance).toLocaleString()}`,
    pnlUp: Math.random() > 0.4,
  }));

  const geoData = [
    { country: "Nigeria", users: 12430, aum: "2.1M" },
    { country: "South Africa", users: 8920, aum: "1.8M" },
    { country: "Kenya", users: 6720, aum: "1.2M" },
    { country: "UAE", users: 4210, aum: "3.4M" },
    { country: "UK", users: 3890, aum: "2.9M" },
  ];

  return (
    <div>
      <SectionHeader title="Dashboard" sub="Real-time platform overview" />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpiCards.map((k, i) => (
          <KpiCard key={i} {...k} flash={flash && i === 4} onClick={k.nav ? () => onNavigate(k.nav) : undefined}
            sub={<span>{k.sub}<Sparkline data={sparkData} color={k.deltaUp ? C.gold : C.red} /></span>} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "60fr 40fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Revenue</div>
              <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>Trading Revenue + Deposit Fees</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["7D", "30D", "90D", "1Y"].map(r => (
                <button key={r} onClick={() => setRange(r)} style={{ padding: "4px 10px", borderRadius: 6, fontFamily: FF.sans, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", background: range === r ? C.goldSub : "transparent", color: range === r ? C.gold : C.textDim, transition: "all 0.15s" }}>{r}</button>
              ))}
            </div>
          </div>
          <AreaChart data={chartData} keys={["trading", "fees"]} colors={[C.gold, C.teal]} height={180} />
          <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: C.gold, borderRadius: 2 }} /><span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>Trading Revenue</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: C.teal, borderRadius: 2 }} /><span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>Deposit Fees</span></div>
          </div>
        </Card>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>New Registrations</div>
            <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>Daily signups · KYC completion rate</div>
          </div>
          <BarChartSimple data={CHART_REGS} keyA="registrations" keyB="kyc" height={180} />
          <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: C.gold, borderRadius: 2 }} /><span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>Registrations</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: C.teal, borderRadius: 2 }} /><span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>KYC Completed</span></div>
          </div>
        </Card>
      </div>

      {/* Live Activity + Geo Map + Top Traders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Live Activity Feed</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, animation: "pulse 1.5s infinite" }} />
              <span style={{ fontFamily: FF.sans, fontSize: 11, color: C.teal, fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto", scrollbarWidth: "thin" }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}22`, alignItems: "flex-start" }}>
                <span style={{ fontFamily: FF.mono, fontSize: 10, color: C.textDim, whiteSpace: "nowrap", marginTop: 2 }}>{a.time}</span>
                <span style={{ background: a.color + "22", color: a.color, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: FF.sans, whiteSpace: "nowrap" }}>{a.type}</span>
                <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>{a.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Geographic Distribution</div>
          {/* Simplified geo table instead of map */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 12 }}>
            {["Country", "Users", "AUM"].map(h => (
              <div key={h} style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, fontWeight: 600, padding: "6px 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
            ))}
            {geoData.map((g, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, padding: "9px 8px", borderTop: `1px solid ${C.border}33` }}>{g.country}</div>
                <div style={{ fontFamily: FF.mono, fontSize: 13, color: C.text, padding: "9px 8px", borderTop: `1px solid ${C.border}33` }}>{g.users.toLocaleString()}</div>
                <div style={{ fontFamily: FF.mono, fontSize: 13, color: C.gold, padding: "9px 8px", borderTop: `1px solid ${C.border}33` }}>${g.aum}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            {geoData.map((g, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>{g.country}</span>
                  <span style={{ fontFamily: FF.mono, fontSize: 11, color: C.textMuted }}>{Math.round(g.users / 120430 * 100)}%</span>
                </div>
                <div style={{ height: 4, background: C.bg3, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${g.users / 120430 * 100}%`, background: [C.gold, C.teal, C.blue, C.purple, C.orange][i], borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Traders */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Top Traders This Month</div>
        <Table
          columns={[
            { key: "rank", label: "#", render: v => <span style={{ fontFamily: FF.mono, fontSize: 13, color: C.gold, fontWeight: 700 }}>{v}</span> },
            { key: "name", label: "Name", render: (v, r) => <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={v} size={28} /><span style={{ fontFamily: FF.sans, fontSize: 13, color: C.text }}>{v}</span></div> },
            { key: "account", label: "Account", mono: true },
            { key: "country", label: "Country" },
            { key: "volume", label: "Volume", mono: true },
            { key: "pnl", label: "P&L", render: (v, r) => <span style={{ fontFamily: FF.mono, fontSize: 13, color: r.pnlUp ? C.green : C.red, fontWeight: 600 }}>{v}</span> },
            { key: "balance", label: "Balance", mono: true, render: v => <span style={{ color: C.gold }}>{v}</span> },
          ]}
          data={topTraders}
          onRowClick={t => onNavigate("user-detail", MOCK_USERS[t.rank - 1])}
        />
      </Card>

      {/* Platform Status Bar */}
      <Card>
        <div style={{ fontFamily: FF.sans, fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Platform Status</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          {statusItems.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.status === "online" ? C.green : s.status === "degraded" ? C.amber : C.red, boxShadow: `0 0 5px ${s.status === "online" ? C.green : C.amber}` }} />
              <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>{s.label}</span>
              <Badge status={s.status}>{s.status}</Badge>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: FF.mono, fontSize: 11, color: C.textDim }}>Last tick: EURUSD — 0.3s ago</div>
        </div>
      </Card>
    </div>
  );
}

// ─── MODULE: USERS ────────────────────────────────────────────────────────────
function UsersPage({ onNavigate, addToast }) {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [kycF, setKycF] = useState("all");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 25;

  const filtered = MOCK_USERS.filter(u =>
    (search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.account.includes(search)) &&
    (statusF === "all" || u.status === statusF) &&
    (kycF === "all" || u.kyc === kycF)
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelected(paged.map(u => u.id));
  const clearSelect = () => setSelected([]);

  return (
    <div>
      <SectionHeader title="User Management" sub={`${filtered.length} total users`}
        action={<Btn onClick={() => addToast("CSV export started", "success")}>⬇ Export</Btn>} />

      <FilterBar
        search={search} onSearch={setSearch}
        filters={[
          { value: statusF, options: [{ value: "all", label: "All Status" }, { value: "active", label: "Active" }, { value: "pending", label: "Pending" }, { value: "suspended", label: "Suspended" }, { value: "banned", label: "Banned" }] },
          { value: kycF, options: [{ value: "all", label: "All KYC" }, { value: "approved", label: "Approved" }, { value: "pending", label: "Pending" }, { value: "not_submitted", label: "Not Submitted" }, { value: "rejected", label: "Rejected" }] },
        ]}
        onFilterChange={(i, v) => i === 0 ? setStatusF(v) : setKycF(v)}
        onReset={() => { setSearch(""); setStatusF("all"); setKycF("all"); }}
      />

      {selected.length > 0 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", background: C.goldSub, borderRadius: 8, marginBottom: 14, border: `1px solid ${C.gold}33` }}>
          <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.gold, fontWeight: 600 }}>{selected.length} selected</span>
          <Btn size="sm" variant="danger" onClick={() => { addToast(`${selected.length} users suspended`, "success"); clearSelect(); }}>Suspend Selected</Btn>
          <Btn size="sm" variant="ghost" onClick={() => addToast("Email compose opened", "info")}>Send Email</Btn>
          <Btn size="sm" variant="ghost" onClick={() => { addToast("Exporting selected users…", "info"); clearSelect(); }}>Export</Btn>
          <Btn size="sm" variant="ghost" onClick={clearSelect}>Cancel</Btn>
        </div>
      )}

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "id", label: "", render: (v) => <input type="checkbox" checked={selected.includes(v)} onChange={() => toggleSelect(v)} style={{ accentColor: C.gold, cursor: "pointer" }} /> },
            { key: "name", label: "User", render: (v, r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={v} size={32} />
                <div>
                  <div style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 600, color: C.text }}>{v}</div>
                  <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: "account", label: "Account #", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
            { key: "country", label: "Country", render: (v, r) => `${r.flag} ${v}` },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "kyc", label: "KYC", render: v => <Badge status={v}>{v.replace(/_/g, " ")}</Badge> },
            { key: "balance", label: "Balance", mono: true, render: v => <span style={{ color: C.gold }}>${Number(v).toLocaleString()}</span> },
            { key: "registered", label: "Registered" },
            { key: "lastLogin", label: "Last Login", render: v => <span style={{ color: C.textMuted }}>{v}</span> },
            { key: "id", label: "Actions", render: (v, r) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onNavigate("user-detail", r); }}>View</Btn>
                <Btn size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); addToast(`${r.name} suspended`, "success"); }}>Suspend</Btn>
              </div>
            )},
          ]}
          data={paged}
          onRowClick={r => onNavigate("user-detail", r)}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 6, border: p === page ? `1px solid ${C.gold}` : `1px solid ${C.border}`, background: p === page ? C.goldSub : "transparent", color: p === page ? C.gold : C.textMuted, fontFamily: FF.sans, fontSize: 12, cursor: "pointer" }}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── USER DETAIL ──────────────────────────────────────────────────────────────
function UserDetail({ user, onBack, addToast }) {
  const [tab, setTab] = useState("info");
  const [notes, setNotes] = useState([
    { id: 1, author: "Sarah K.", time: "Jun 3, 2025 10:12", text: "Client called to verify KYC status. Advised to reupload ID." },
  ]);
  const [noteText, setNoteText] = useState("");
  const [showBalAdj, setShowBalAdj] = useState(false);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("bonus");

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [...prev, { id: Date.now(), author: "Alexandra Hunt", time: new Date().toLocaleString(), text: noteText }]);
    setNoteText("");
    addToast("Note added", "success");
  };

  const tradingAccounts = [
    { accNum: user.account, type: "Live", tier: user.tier, currency: "USD", balance: user.balance, equity: (Number(user.balance) * 0.98).toFixed(2), openPos: Math.floor(Math.random() * 6), status: "active", platform: "MT5" },
    { accNum: user.account + "-D", type: "Demo", tier: "standard", currency: "USD", balance: "10000.00", equity: "10450.00", openPos: 0, status: "active", platform: "WebTrader" },
  ];

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontFamily: FF.sans, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to Users
      </button>

      {/* Header */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Avatar name={user.name} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <h2 style={{ fontFamily: FF.sans, fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>{user.name}</h2>
              <Badge status={user.status} />
              <Badge status={user.kyc}>{user.kyc.replace(/_/g, " ")}</Badge>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[["📧", user.email], ["📱", user.phone], ["🌍", `${user.flag} ${user.country}`], ["📅", `Registered ${user.registered}`], ["🔐", `Last login: ${user.lastLogin}`]].map(([ic, v], i) => (
                <span key={i} style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}><span>{ic}</span>{v}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn size="sm" variant="danger" onClick={() => addToast(`${user.name} suspended`, "success")}>Suspend</Btn>
            <Btn size="sm" variant="success" onClick={() => addToast(`${user.name} activated`, "success")}>Activate</Btn>
            <Btn size="sm" variant="ghost" onClick={() => addToast("Message compose opened", "info")}>Message</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setShowBalAdj(true)}>Adjust Balance</Btn>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { key: "info", label: "Personal Info" },
          { key: "kyc", label: "KYC Documents" },
          { key: "accounts", label: "Trading Accounts" },
          { key: "trades", label: "Trade History" },
          { key: "financial", label: "Financial History" },
          { key: "security", label: "Login & Security" },
          { key: "notes", label: "Notes & Flags" },
        ]}
        active={tab} onChange={setTab}
      />

      {tab === "info" && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[["Full Name", user.name], ["Email", user.email], ["Phone", user.phone], ["Date of Birth", user.dob], ["Nationality", user.nationality], ["Country", user.country], ["Address", user.address], ["Account Tier", user.tier], ["Referral Code", `REF-${user.id.toUpperCase()}`]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, fontWeight: 500, marginBottom: 4 }}>{l}</div>
                <div style={{ fontFamily: FF.sans, fontSize: 14, color: C.text }}>{v}</div>
              </div>
            ))}
          </div>
          <Divider />
          <Btn variant="outline" size="sm" onClick={() => addToast("Edit mode opened", "info")}>✏ Edit Information</Btn>
        </Card>
      )}

      {tab === "kyc" && (
        <Card>
          {MOCK_KYC.filter((_, i) => i < 3).map((doc, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
              <div style={{ width: 60, height: 60, background: C.bg3, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `1px solid ${C.border}`, flexShrink: 0 }}>🪪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>{doc.docType}</div>
                <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>Submitted {doc.submitted}</div>
                <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>Reviewer: {doc.assignedTo}</div>
              </div>
              <Badge status={doc.status} />
              <Btn size="sm" variant="outline" onClick={() => addToast("Document viewer opened", "info")}>Review</Btn>
            </div>
          ))}
        </Card>
      )}

      {tab === "accounts" && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Trading Accounts</span>
            <Btn size="sm" onClick={() => addToast("Create account form opened", "info")}>+ Create Account</Btn>
          </div>
          <Table
            columns={[
              { key: "accNum", label: "Account #", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
              { key: "type", label: "Type", render: v => <Badge status={v === "Live" ? "active" : "info"}>{v}</Badge> },
              { key: "tier", label: "Tier", render: v => <Badge status="info">{v}</Badge> },
              { key: "currency", label: "Currency" },
              { key: "balance", label: "Balance", mono: true, render: v => <span style={{ color: C.gold }}>${v}</span> },
              { key: "equity", label: "Equity", mono: true },
              { key: "openPos", label: "Open Pos.", mono: true },
              { key: "status", label: "Status", render: v => <Badge status={v} /> },
              { key: "platform", label: "Platform" },
              { key: "accNum", label: "Actions", render: (v, r) => (
                <div style={{ display: "flex", gap: 5 }}>
                  <Btn size="sm" variant="ghost" onClick={() => addToast("Trades view opened", "info")}>Trades</Btn>
                  <Btn size="sm" variant="outline" onClick={() => addToast("Balance adjust opened", "info")}>Adjust</Btn>
                </div>
              )},
            ]}
            data={tradingAccounts}
          />
        </Card>
      )}

      {tab === "trades" && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px" }}>
            <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Trade History</span>
          </div>
          <Table
            columns={[
              { key: "ticket", label: "Ticket", mono: true },
              { key: "symbol", label: "Symbol" },
              { key: "direction", label: "Dir.", render: v => <Badge status={v === "BUY" ? "active" : "danger"}>{v}</Badge> },
              { key: "volume", label: "Volume", mono: true },
              { key: "openPrice", label: "Open", mono: true },
              { key: "closePrice", label: "Close", mono: true },
              { key: "pnl", label: "P&L", mono: true, render: v => <span style={{ color: Number(v) >= 0 ? C.green : C.red, fontFamily: FF.mono }}>{Number(v) >= 0 ? "+" : ""}${v}</span> },
              { key: "status", label: "Status", render: v => <Badge status={v} /> },
              { key: "openTime", label: "Opened" },
            ]}
            data={MOCK_TRADES.slice(0, 12)}
          />
        </Card>
      )}

      {tab === "financial" && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px" }}>
            <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Financial History</span>
          </div>
          <Table
            columns={[
              { key: "id", label: "Transaction ID", mono: true },
              { key: "user", label: "Type", render: (v, r) => <Badge status={r.method?.toLowerCase() === "bank wire" ? "info" : "active"}>{r.method || "Deposit"}</Badge> },
              { key: "amount", label: "Amount", mono: true, render: v => <span style={{ color: C.gold }}>${Number(v).toLocaleString()}</span> },
              { key: "status", label: "Status", render: v => <Badge status={v} /> },
              { key: "date", label: "Date" },
            ]}
            data={MOCK_DEPOSITS.slice(0, 10)}
          />
        </Card>
      )}

      {tab === "security" && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div style={{ background: C.bg3, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 8 }}>2FA Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
                <span style={{ fontFamily: FF.sans, fontSize: 14, color: C.green, fontWeight: 600 }}>Enabled</span>
              </div>
            </div>
            <div style={{ background: C.bg3, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Active Sessions</div>
              <div style={{ fontFamily: FF.mono, fontSize: 18, fontWeight: 700, color: C.text }}>2</div>
            </div>
          </div>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Login History</div>
          <Table
            columns={[
              { key: "time", label: "Timestamp" },
              { key: "ip", label: "IP Address", mono: true },
              { key: "device", label: "Device" },
              { key: "location", label: "Location" },
              { key: "status", label: "Status", render: v => <Badge status={v === "success" ? "active" : "danger"}>{v}</Badge> },
            ]}
            data={[
              { time: "Jun 8, 2025 09:32 UTC", ip: "196.152.24.87", device: "Chrome / Windows", location: "Lagos, NG", status: "success" },
              { time: "Jun 7, 2025 14:18 UTC", ip: "196.152.24.87", device: "Safari / iPhone", location: "Lagos, NG", status: "success" },
              { time: "Jun 6, 2025 11:05 UTC", ip: "41.76.102.3", device: "Chrome / Windows", location: "Unknown", status: "failed" },
            ]}
          />
        </Card>
      )}

      {tab === "notes" && (
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Internal Notes</div>
          <div style={{ marginBottom: 18 }}>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add an internal note visible only to staff…"
              style={{ width: "100%", minHeight: 80, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = C.gold)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
            <Btn size="sm" onClick={addNote} style={{ marginTop: 8 }}>Add Note</Btn>
          </div>
          {notes.map(n => (
            <div key={n.id} style={{ background: C.bg3, borderRadius: 8, padding: "12px 14px", marginBottom: 10, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: FF.sans, fontSize: 12, fontWeight: 600, color: C.gold }}>{n.author}</span>
                <span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textDim }}>{n.time}</span>
              </div>
              <p style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>{n.text}</p>
            </div>
          ))}
          <Divider />
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Flags</div>
          {["AML Review Needed", "VIP Client"].map(flag => (
            <div key={flag} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber }} />
              <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.amber }}>{flag}</span>
              <Btn size="sm" variant="ghost" onClick={() => addToast("Flag removed", "success")}>Remove</Btn>
            </div>
          ))}
          <Btn size="sm" variant="ghost" onClick={() => addToast("Flag added", "success")}>+ Add Flag</Btn>
        </Card>
      )}

      {/* Balance Adjust Modal */}
      <Modal open={showBalAdj} onClose={() => setShowBalAdj(false)} title="Adjust Account Balance">
        <Input label="Amount (USD)" value={adjAmount} onChange={setAdjAmount} placeholder="0.00" type="number" />
        <Select label="Reason" value={adjReason} onChange={setAdjReason} options={[
          { value: "bonus", label: "Bonus Credit" }, { value: "correction", label: "Error Correction" },
          { value: "compensation", label: "Compensation" }, { value: "refund", label: "Refund" }, { value: "debit", label: "Manual Debit" },
        ]} />
        <Input label="Supporting Note" value="" onChange={() => {}} placeholder="Reason for adjustment…" />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn onClick={() => { setShowBalAdj(false); addToast("Balance adjusted", "success"); }}>Apply Adjustment</Btn>
          <Btn variant="ghost" onClick={() => setShowBalAdj(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── MODULE: KYC ──────────────────────────────────────────────────────────────
function KYCPage({ addToast }) {
  const [filterTab, setFilterTab] = useState("all");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [currentKyc, setCurrentKyc] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [docSide, setDocSide] = useState("front");
  const [checklist, setChecklist] = useState({ name: false, expired: false, photo: false, address: false, country: false });
  const [rejReason, setRejReason] = useState("");

  const filtered = filterTab === "all" ? MOCK_KYC : MOCK_KYC.filter(k => k.status === filterTab);

  return (
    <div>
      <SectionHeader title="KYC Verification Centre" sub="Identity document review queue" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Pending Reviews" value="8" color={C.amber} />
        <StatCard label="Approved Today" value="24" color={C.green} />
        <StatCard label="Rejected Today" value="3" color={C.red} />
        <StatCard label="Avg Review Time" value="1.8 hrs" color={C.teal} />
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "4px 16px 0" }}>
          <Tabs
            tabs={[
              { key: "all", label: "All", badge: MOCK_KYC.length },
              { key: "pending", label: "Pending", badge: MOCK_KYC.filter(k => k.status === "pending").length },
              { key: "approved", label: "Approved" },
              { key: "rejected", label: "Rejected" },
              { key: "resubmission", label: "Resubmission Required" },
            ]}
            active={filterTab} onChange={setFilterTab}
          />
        </div>
        <Table
          columns={[
            { key: "user", label: "User", render: (v) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={v.name} size={30} />
                <div>
                  <div style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 600, color: C.text }}>{v.name}</div>
                  <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>{v.email}</div>
                </div>
              </div>
            )},
            { key: "user", label: "Country", render: v => `${v.flag} ${v.country}` },
            { key: "docType", label: "Document Type" },
            { key: "submitted", label: "Submitted" },
            { key: "daysWaiting", label: "Days Waiting", render: v => <span style={{ fontFamily: FF.mono, fontSize: 13, color: v > 2 ? C.red : C.text, fontWeight: v > 2 ? 700 : 400 }}>{v}</span> },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "assignedTo", label: "Assigned To", render: v => <span style={{ fontFamily: FF.sans, fontSize: 12, color: v === "Unassigned" ? C.textDim : C.text }}>{v}</span> },
            { key: "id", label: "Actions", render: (v, r) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" onClick={() => { setCurrentKyc(r); setReviewOpen(true); }}>Review</Btn>
                <Btn size="sm" variant="ghost" onClick={() => addToast("Assigned to you", "success")}>Assign to Me</Btn>
              </div>
            )},
          ]}
          data={filtered}
        />
      </Card>

      {/* KYC Review Panel - Full Screen Modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={`KYC Review — ${currentKyc?.user?.name}`} wide>
        {currentKyc && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left: Document Viewer */}
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {["front", "back", "selfie"].map(s => (
                  <button key={s} onClick={() => setDocSide(s)} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${docSide === s ? C.gold : C.border}`, background: docSide === s ? C.goldSub : "transparent", color: docSide === s ? C.gold : C.textMuted, fontFamily: FF.sans, fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
                ))}
              </div>
              <div style={{ background: C.bg3, borderRadius: 10, padding: 24, height: 260, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, marginBottom: 12, filter: `brightness(${brightness}%) contrast(${contrast}%)` }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 56 }}>🪪</div>
                  <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginTop: 8 }}>{currentKyc.docType} — {docSide} side</div>
                  <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textDim, marginTop: 4 }}>(Document preview placeholder)</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[["Brightness", brightness, setBrightness], ["Contrast", contrast, setContrast]].map(([l, v, set]) => (
                  <div key={l} style={{ flex: 1 }}>
                    <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{l}: {v}%</div>
                    <input type="range" min={50} max={200} value={v} onChange={e => set(Number(e.target.value))}
                      style={{ width: "100%", accentColor: C.gold }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Btn size="sm" variant="ghost" onClick={() => addToast("Download started", "info")}>⬇ Download</Btn>
                <Btn size="sm" variant="ghost" onClick={() => addToast("Image rotated", "info")}>↻ Rotate</Btn>
              </div>
            </div>

            {/* Right: Review Form */}
            <div>
              <div style={{ background: C.bg3, borderRadius: 8, padding: "12px 14px", marginBottom: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 8, fontWeight: 600 }}>CLIENT SUMMARY</div>
                {[["Name", currentKyc.user.name], ["Country", `${currentKyc.user.flag} ${currentKyc.user.country}`], ["Document", currentKyc.docType], ["Submitted", currentKyc.submitted]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textDim, width: 80 }}>{l}:</span>
                    <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: C.bg3, borderRadius: 8, padding: "12px 14px", marginBottom: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 10, fontWeight: 600 }}>MANUAL CHECKLIST</div>
                {[["name", "Document matches name on profile"], ["expired", "Document is not expired"], ["photo", "Photo clearly visible and matches selfie"], ["address", "Address proof is less than 3 months old"], ["country", "Document is from acceptable country"]].map(([k, l]) => (
                  <label key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={checklist[k]} onChange={() => setChecklist(prev => ({ ...prev, [k]: !prev[k] }))} style={{ accentColor: C.green, width: 15, height: 15 }} />
                    <span style={{ fontFamily: FF.sans, fontSize: 13, color: checklist[k] ? C.text : C.textMuted }}>{l}</span>
                  </label>
                ))}
              </div>

              <div style={{ background: C.amberBg, borderRadius: 8, padding: "10px 12px", marginBottom: 16, border: `1px solid ${C.amber}33` }}>
                <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>AUTOMATED CHECKS</div>
                {[["Biometric Match Score", "94%", true], ["Document Authenticity", "Passed", true], ["Liveness Check", "Passed", true]].map(([l, v, ok]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>{l}</span>
                    <span style={{ fontFamily: FF.sans, fontSize: 12, color: ok ? C.green : C.red, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              <Select label="Rejection Reason (if rejecting)" value={rejReason} onChange={setRejReason} options={[
                { value: "", label: "— Select if rejecting —" },
                { value: "expired", label: "Document expired" },
                { value: "photo", label: "Photo unclear" },
                { value: "mismatch", label: "Name mismatch" },
                { value: "type", label: "Document type not accepted" },
                { value: "forgery", label: "Suspected forgery" },
              ]} />

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn variant="success" onClick={() => { setReviewOpen(false); addToast("KYC Approved ✓", "success"); }}>✓ Approve</Btn>
                <Btn variant="danger" onClick={() => { if (!rejReason) { addToast("Select a rejection reason", "error"); return; } setReviewOpen(false); addToast("KYC Rejected", "error"); }}>✗ Reject</Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── MODULE: LIVE POSITIONS ───────────────────────────────────────────────────
function LivePositionsPage({ addToast }) {
  const [positions, setPositions] = useState(MOCK_POSITIONS);
  const [flashMap, setFlashMap] = useState({});
  const [forceCloseModal, setForceCloseModal] = useState(null);
  const [fcReason, setFcReason] = useState("margin_call");
  const [fcNotes, setFcNotes] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setPositions(prev => prev.map(p => {
        const delta = (Math.random() - 0.48) * 0.0010;
        const newPnl = (Number(p.pnl) + (Math.random() - 0.5) * 30).toFixed(2);
        setFlashMap(fm => ({ ...fm, [p.id]: Number(newPnl) > Number(p.pnl) ? "up" : "down" }));
        return { ...p, pnl: newPnl, currentPrice: (Number(p.currentPrice) + delta).toFixed(5) };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const totalPnl = positions.reduce((s, p) => s + Number(p.pnl), 0);
  const marginCallCount = positions.filter(p => p.marginLevel < 300).length;
  const stopOutCount = positions.filter(p => p.marginLevel < 150).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: FF.sans, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Live Positions</h2>
          <p style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>Real-time open positions monitor</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal }} />
          <span style={{ fontFamily: FF.sans, fontSize: 11, color: C.teal, fontWeight: 600 }}>LIVE — updates every 2s</span>
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Open Positions" value={positions.length} color={C.teal} />
        <StatCard label="Floating P&L" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`} color={totalPnl >= 0 ? C.green : C.red} />
        <StatCard label="Total Exposure" value="$8.4M" color={C.blue} />
        <StatCard label="Margin Call" value={marginCallCount} color={C.amber} />
        <StatCard label="Near Stop-Out" value={stopOutCount} color={C.red} />
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "ticket", label: "Ticket", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
            { key: "user", label: "User", render: (v, r) => <div><div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text }}>{v}</div><div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>{r.account}</div></div> },
            { key: "symbol", label: "Symbol", render: v => <span style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 600, color: C.text }}>{v}</span> },
            { key: "direction", label: "Dir.", render: v => <Badge status={v === "BUY" ? "active" : "danger"}>{v}</Badge> },
            { key: "volume", label: "Vol.", mono: true },
            { key: "openPrice", label: "Open", mono: true },
            { key: "currentPrice", label: "Current", mono: true, render: (v, r) => <span style={{ color: flashMap[r.id] === "up" ? C.green : flashMap[r.id] === "down" ? C.red : C.text, fontFamily: FF.mono, fontSize: 13, transition: "color 0.3s" }}>{v}</span> },
            { key: "pnl", label: "Floating P&L", mono: true, render: (v, r) => <span style={{ fontFamily: FF.mono, fontSize: 14, fontWeight: 700, color: Number(v) >= 0 ? C.green : C.red }}>{Number(v) >= 0 ? "+" : ""}${v}</span> },
            { key: "marginLevel", label: "Margin %", render: v => <span style={{ fontFamily: FF.mono, fontSize: 13, fontWeight: 600, color: v < 150 ? C.red : v < 300 ? C.amber : C.green }}>{v}%</span> },
            { key: "openTime", label: "Duration" },
            { key: "id", label: "Actions", render: (v, r) => (
              <div style={{ display: "flex", gap: 5 }}>
                <Btn size="sm" variant="danger" onClick={() => { setForceCloseModal(r); setFcReason("margin_call"); setFcNotes(""); }}>Force Close</Btn>
              </div>
            )},
          ]}
          data={positions.map(p => ({ ...p, row_bg: p.marginLevel < 50 ? C.redBg : p.marginLevel < 100 ? C.amberBg : "transparent" }))}
        />
      </Card>

      <Modal open={!!forceCloseModal} onClose={() => setForceCloseModal(null)} title="Force Close Position">
        {forceCloseModal && (
          <>
            <div style={{ background: C.redBg, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.red, marginBottom: 4 }}>⚠ Confirm Force Close</div>
              <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>
                Ticket {forceCloseModal.ticket} · {forceCloseModal.symbol} {forceCloseModal.direction} {forceCloseModal.volume} lots · P&L: <span style={{ color: Number(forceCloseModal.pnl) >= 0 ? C.green : C.red }}>${forceCloseModal.pnl}</span>
              </div>
            </div>
            <Select label="Reason for Force Close" value={fcReason} onChange={setFcReason} options={[
              { value: "margin_call", label: "Margin Call" }, { value: "risk", label: "Risk Management" },
              { value: "error", label: "Error Correction" }, { value: "client", label: "Client Request" },
            ]} />
            <Input label="Notes" value={fcNotes} onChange={setFcNotes} placeholder="Additional notes for audit log…" />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Btn variant="danger" onClick={() => { setForceCloseModal(null); addToast(`Position ${forceCloseModal.ticket} force-closed`, "success"); }}>Confirm Force Close</Btn>
              <Btn variant="ghost" onClick={() => setForceCloseModal(null)}>Cancel</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ─── MODULE: TRADE HISTORY ────────────────────────────────────────────────────
function TradeHistoryPage({ addToast }) {
  const [search, setSearch] = useState("");
  const [dirF, setDirF] = useState("all");
  const [statusF, setStatusF] = useState("all");

  const filtered = MOCK_TRADES.filter(t =>
    (search === "" || t.user.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase())) &&
    (dirF === "all" || t.direction === dirF) &&
    (statusF === "all" || t.status === statusF)
  );

  const totalVol = filtered.reduce((s, t) => s + Number(t.volume), 0).toFixed(2);
  const totalComm = filtered.reduce((s, t) => s + Number(t.commission), 0).toFixed(2);
  const totalPnl = filtered.reduce((s, t) => s + Number(t.pnl), 0).toFixed(2);

  return (
    <div>
      <SectionHeader title="Trade History" sub="Complete trade ledger across all accounts"
        action={<Btn onClick={() => addToast("Export started", "info")}>⬇ Export</Btn>} />

      <FilterBar
        search={search} onSearch={setSearch}
        filters={[
          { value: dirF, options: [{ value: "all", label: "All Directions" }, { value: "BUY", label: "Buy" }, { value: "SELL", label: "Sell" }] },
          { value: statusF, options: [{ value: "all", label: "All Status" }, { value: "open", label: "Open" }, { value: "closed", label: "Closed" }] },
        ]}
        onFilterChange={(i, v) => i === 0 ? setDirF(v) : setStatusF(v)}
        onReset={() => { setSearch(""); setDirF("all"); setStatusF("all"); }}
      />

      <Card style={{ padding: 0, marginBottom: 16 }}>
        <Table
          columns={[
            { key: "ticket", label: "Ticket", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
            { key: "user", label: "User" },
            { key: "account", label: "Account", mono: true },
            { key: "symbol", label: "Symbol" },
            { key: "direction", label: "Dir.", render: v => <Badge status={v === "BUY" ? "active" : "danger"}>{v}</Badge> },
            { key: "volume", label: "Volume", mono: true },
            { key: "openPrice", label: "Open Price", mono: true },
            { key: "closePrice", label: "Close Price", mono: true },
            { key: "pnl", label: "P&L", mono: true, render: v => <span style={{ color: Number(v) >= 0 ? C.green : C.red, fontFamily: FF.mono, fontWeight: 600 }}>{Number(v) >= 0 ? "+" : ""}${v}</span> },
            { key: "commission", label: "Comm.", mono: true },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "openTime", label: "Opened" },
            { key: "platform", label: "Platform" },
          ]}
          data={filtered}
        />
      </Card>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Total Volume" value={`${totalVol} lots`} color={C.gold} />
        <StatCard label="Commission Collected" value={`$${totalComm}`} color={C.teal} />
        <StatCard label="Sum of Client P&L" value={`${Number(totalPnl) >= 0 ? "+" : ""}$${totalPnl}`} color={Number(totalPnl) >= 0 ? C.green : C.red} />
        <StatCard label="Net Revenue (Broker)" value={`$${(Number(totalComm) * 0.85).toFixed(2)}`} color={C.blue} />
      </div>
    </div>
  );
}

// ─── MODULE: INSTRUMENTS ──────────────────────────────────────────────────────
function InstrumentsPage({ addToast }) {
  const [catTab, setCatTab] = useState("all");
  const [editSheet, setEditSheet] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const cats = ["all", "Forex", "Crypto", "Stocks", "Commodities", "Indices", "ETFs"];
  const filtered = catTab === "all" ? MOCK_INSTRUMENTS : MOCK_INSTRUMENTS.filter(i => i.category === catTab);

  return (
    <div>
      <SectionHeader title="Instrument Management" sub="Tradeable instruments configuration"
        action={<Btn onClick={() => setAddModal(true)}>+ Add Instrument</Btn>} />

      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatTab(c)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${catTab === c ? C.gold : C.border}`, background: catTab === c ? C.goldSub : "transparent", color: catTab === c ? C.gold : C.textMuted, fontFamily: FF.sans, fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: c === "all" ? "capitalize" : "none" }}>
            {c === "all" ? "All Categories" : c}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "symbol", label: "Symbol", render: v => <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 700, color: C.text }}>{v}</span> },
            { key: "category", label: "Category", render: v => <Badge status="info">{v}</Badge> },
            { key: "spread", label: "Min Spread", mono: true },
            { key: "commission", label: "Commission/Lot", mono: true },
            { key: "swapL", label: "Swap Long", mono: true, render: v => <span style={{ color: Number(v) >= 0 ? C.green : C.red, fontFamily: FF.mono }}>{v}</span> },
            { key: "swapS", label: "Swap Short", mono: true, render: v => <span style={{ color: Number(v) >= 0 ? C.green : C.red, fontFamily: FF.mono }}>{v}</span> },
            { key: "minLot", label: "Min Lot", mono: true },
            { key: "maxLot", label: "Max Lot", mono: true },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "symbol", label: "Actions", render: (v, r) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="outline" onClick={() => setEditSheet(r)}>Edit</Btn>
                <Btn size="sm" variant={r.status === "active" ? "danger" : "success"} onClick={() => addToast(`${v} ${r.status === "active" ? "disabled" : "enabled"}`, "success")}>
                  {r.status === "active" ? "Disable" : "Enable"}
                </Btn>
              </div>
            )},
          ]}
          data={filtered}
        />
      </Card>

      {/* Edit Instrument Side Sheet */}
      <SideSheet open={!!editSheet} onClose={() => setEditSheet(null)} title={`Edit — ${editSheet?.symbol}`}>
        {editSheet && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>Status</span>
              <Btn size="sm" variant={editSheet.status === "active" ? "success" : "ghost"}>{editSheet.status === "active" ? "● Active" : "○ Disabled"}</Btn>
            </div>
            <Input label="Spread (pips)" value={editSheet.spread} onChange={() => {}} />
            <Input label="Commission per Lot ($)" value={editSheet.commission.replace("$", "")} onChange={() => {}} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Swap Long" value={editSheet.swapL} onChange={() => {}} />
              <Input label="Swap Short" value={editSheet.swapS} onChange={() => {}} />
              <Input label="Min Lot" value={editSheet.minLot} onChange={() => {}} />
              <Input label="Max Lot" value={editSheet.maxLot} onChange={() => {}} />
            </div>
            <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 10, marginTop: 4 }}>TRADING HOURS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 16 }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, di) => (
                <div key={d} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: FF.sans, fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{d}</div>
                  {Array.from({ length: 4 }, (_, hi) => (
                    <div key={hi} style={{ height: 10, background: di < 5 ? (hi < 3 ? C.teal + "40" : C.textDim + "20") : C.redBg, borderRadius: 2, marginBottom: 2, cursor: "pointer", border: `1px solid ${di < 5 ? C.teal + "30" : C.border}` }} />
                  ))}
                </div>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: C.gold }} />
              <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>Apply changes to all {editSheet.category} instruments</span>
            </label>
            <Btn onClick={() => { setEditSheet(null); addToast(`${editSheet.symbol} updated`, "success"); }}>Save Changes</Btn>
          </div>
        )}
      </SideSheet>

      {/* Add Instrument Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New Instrument">
        <Input label="Symbol" value="" onChange={() => {}} placeholder="e.g. USDJPY" />
        <Select label="Category" value="Forex" onChange={() => {}} options={cats.slice(1).map(c => ({ value: c, label: c }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Spread" value="" onChange={() => {}} placeholder="0.1" />
          <Input label="Commission/Lot" value="" onChange={() => {}} placeholder="$3.00" />
          <Input label="Min Lot" value="" onChange={() => {}} placeholder="0.01" />
          <Input label="Max Lot" value="" onChange={() => {}} placeholder="100" />
        </div>
        <Btn onClick={() => { setAddModal(false); addToast("Instrument added", "success"); }}>Add Instrument</Btn>
      </Modal>
    </div>
  );
}

// ─── MODULE: WITHDRAWALS ──────────────────────────────────────────────────────
function WithdrawalsPage({ addToast }) {
  const [detailSheet, setDetailSheet] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch] = useState("");

  const filtered = MOCK_WITHDRAWALS.filter(w =>
    search === "" || w.user.name.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search)
  );

  const pending = MOCK_WITHDRAWALS.filter(w => w.status === "pending");
  const pendingTotal = pending.reduce((s, w) => s + Number(w.amount), 0).toFixed(2);
  const approved = MOCK_WITHDRAWALS.filter(w => w.status === "approved");

  return (
    <div>
      <SectionHeader title="Withdrawal Requests" sub="Priority queue — review all requests carefully" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label={`Pending (${pending.length} requests)`} value={`$${Number(pendingTotal).toLocaleString()}`} color={C.amber} />
        <StatCard label={`Approved Today (${approved.length} requests)`} value={`$${approved.reduce((s, w) => s + Number(w.amount), 0).toFixed(2)}`} color={C.green} />
        <StatCard label="Rejected Today" value="2" color={C.red} />
        <StatCard label="Avg Processing Time" value="3.2 hrs" color={C.teal} />
      </div>

      <FilterBar search={search} onSearch={setSearch} filters={[]} onFilterChange={() => {}} onReset={() => setSearch("")} />

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "id", label: "Request ID", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
            { key: "user", label: "User", render: v => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={v.name} size={28} />
                <div>
                  <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, fontWeight: 500 }}>{v.name}</div>
                  <Badge status={v.kyc}>{v.kyc.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            )},
            { key: "amount", label: "Amount", mono: true, render: v => <span style={{ fontFamily: FF.mono, fontSize: 15, fontWeight: 700, color: C.gold }}>${Number(v).toLocaleString()}</span> },
            { key: "currency", label: "Currency" },
            { key: "method", label: "Method", render: v => <Badge status="info">{v}</Badge> },
            { key: "bankLast4", label: "Account", mono: true, render: v => `****${v}` },
            { key: "kycLevel", label: "KYC Level" },
            { key: "requestedAt", label: "Requested" },
            { key: "hoursWaiting", label: "Waiting", render: v => <span style={{ fontFamily: FF.mono, fontSize: 13, color: v > 24 ? C.red : C.text, fontWeight: v > 24 ? 700 : 400 }}>{v}h</span> },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "amlFlag", label: "AML", render: v => v ? <span style={{ color: C.amber, fontSize: 16 }}>⚠️</span> : <span style={{ color: C.textDim }}>—</span> },
            { key: "id", label: "Actions", render: (v, r) => (
              <div style={{ display: "flex", gap: 5 }}>
                <Btn size="sm" variant="success" onClick={() => addToast(`${r.id} approved`, "success")}>✓</Btn>
                <Btn size="sm" variant="danger" onClick={() => { setRejectModal(r); setRejectReason(""); }}>✗</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setDetailSheet(r)}>View</Btn>
              </div>
            )},
          ]}
          data={filtered}
        />
      </Card>

      {/* Detail Side Sheet */}
      <SideSheet open={!!detailSheet} onClose={() => setDetailSheet(null)} title={`Withdrawal — ${detailSheet?.id}`}>
        {detailSheet && (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
              <Avatar name={detailSheet.user.name} size={44} />
              <div>
                <div style={{ fontFamily: FF.sans, fontSize: 16, fontWeight: 700, color: C.text }}>{detailSheet.user.name}</div>
                <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>{detailSheet.user.email}</div>
              </div>
            </div>

            <div style={{ background: C.bg3, borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: FF.mono, fontSize: 28, fontWeight: 700, color: C.gold, marginBottom: 8 }}>${Number(detailSheet.amount).toLocaleString()}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Method", detailSheet.method], ["Bank Account", `****${detailSheet.bankLast4}`], ["KYC Level", detailSheet.kycLevel], ["Requested", detailSheet.requestedAt]].map(([l, v]) => (
                  <div key={l}><div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>{l}</div><div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, fontWeight: 500 }}>{v}</div></div>
                ))}
              </div>
            </div>

            <div style={{ fontFamily: FF.sans, fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 10 }}>ANTI-FRAUD CHECKS</div>
            {[
              ["User KYC fully verified", detailSheet.user.kyc === "approved"],
              ["Withdrawal amount within 30-day limit", true],
              ["Bank account previously used successfully", true],
              ["No AML flags on this account", !detailSheet.amlFlag],
              ["Account balance after withdrawal: $" + (Number(detailSheet.user.balance) - Number(detailSheet.amount)).toFixed(2), Number(detailSheet.user.balance) > Number(detailSheet.amount)],
            ].map(([l, ok], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, background: ok ? C.greenBg : C.redBg, border: `1px solid ${ok ? C.green : C.red}33`, marginBottom: 6 }}>
                <span style={{ color: ok ? C.green : C.red, fontSize: 14 }}>{ok ? "✓" : "⚠"}</span>
                <span style={{ fontFamily: FF.sans, fontSize: 12, color: ok ? C.green : C.red }}>{l}</span>
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Btn variant="success" onClick={() => { setDetailSheet(null); addToast(`${detailSheet.id} approved`, "success"); }}>Approve Withdrawal</Btn>
              <Btn variant="danger" onClick={() => { setRejectModal(detailSheet); setDetailSheet(null); }}>Reject</Btn>
            </div>
          </div>
        )}
      </SideSheet>

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Withdrawal">
        <div style={{ background: C.redBg, borderRadius: 8, padding: "12px 14px", marginBottom: 18, border: `1px solid ${C.red}44` }}>
          <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.red }}>{rejectModal?.id} · ${Number(rejectModal?.amount || 0).toLocaleString()}</span>
        </div>
        <Select label="Rejection Reason" value={rejectReason} onChange={setRejectReason} options={[
          { value: "", label: "— Select reason —" }, { value: "kyc", label: "KYC not complete" },
          { value: "aml", label: "AML review required" }, { value: "limit", label: "Exceeds daily limit" },
          { value: "unverified", label: "Bank account unverified" }, { value: "other", label: "Other" },
        ]} />
        <Input label="Notes to Client" value="" onChange={() => {}} placeholder="Additional explanation…" />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn variant="danger" onClick={() => { setRejectModal(null); addToast("Withdrawal rejected. Client notified.", "error"); }}>Confirm Rejection</Btn>
          <Btn variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── MODULE: DEPOSITS ─────────────────────────────────────────────────────────
function DepositsPage({ addToast }) {
  const [manualModal, setManualModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");

  const filtered = MOCK_DEPOSITS.filter(d =>
    (search === "" || d.user.name.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search)) &&
    (statusF === "all" || d.status === statusF)
  );

  return (
    <div>
      <SectionHeader title="Deposits" sub="Deposit transactions and manual credits"
        action={<Btn onClick={() => setManualModal(true)}>+ Manual Credit</Btn>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Today's Deposits" value="$842,300" color={C.green} />
        <StatCard label="This Week" value="$4.2M" color={C.teal} />
        <StatCard label="This Month" value="$18.7M" color={C.gold} />
        <StatCard label="Failed Today" value="4" color={C.red} />
      </div>

      <FilterBar search={search} onSearch={setSearch}
        filters={[{ value: statusF, options: [{ value: "all", label: "All Status" }, { value: "completed", label: "Completed" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }] }]}
        onFilterChange={(i, v) => setStatusF(v)}
        onReset={() => { setSearch(""); setStatusF("all"); }}
      />

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "id", label: "Transaction ID", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
            { key: "user", label: "User", render: v => <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={v.name} size={26} /><span style={{ fontFamily: FF.sans, fontSize: 13, color: C.text }}>{v.name}</span></div> },
            { key: "amount", label: "Amount", mono: true, render: v => <span style={{ color: C.green, fontFamily: FF.mono, fontWeight: 700 }}>${Number(v).toLocaleString()}</span> },
            { key: "method", label: "Method", render: v => <Badge status="info">{v}</Badge> },
            { key: "gatewayRef", label: "Gateway Ref", mono: true, render: v => <span style={{ fontSize: 11, color: C.textMuted }}>{v}</span> },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "date", label: "Date" },
            { key: "id", label: "Actions", render: (v, r) => r.status === "failed" ? <Btn size="sm" variant="outline" onClick={() => addToast("Investigation opened", "info")}>Investigate</Btn> : <span style={{ color: C.textDim, fontFamily: FF.sans, fontSize: 12 }}>—</span> },
          ]}
          data={filtered}
        />
      </Card>

      <Modal open={manualModal} onClose={() => setManualModal(false)} title="Manual Deposit Credit">
        <div style={{ background: C.amberBg, borderRadius: 8, padding: "10px 12px", marginBottom: 18, border: `1px solid ${C.amber}44` }}>
          <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.amber }}>⚠ Use only for bank wire transfers confirmed by the bank. All manual credits are logged in the audit trail.</span>
        </div>
        <Input label="Search User" value="" onChange={() => {}} placeholder="Email, name or account number" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Amount" value="" onChange={() => {}} placeholder="0.00" />
          <Select label="Currency" value="USD" onChange={() => {}} options={[{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "GBP", label: "GBP" }]} />
        </div>
        <Input label="Bank Reference Number" value="" onChange={() => {}} placeholder="Bank confirmation reference" />
        <div style={{ background: C.bg3, borderRadius: 8, padding: "12px 14px", marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Upload Proof of Payment</div>
          <div style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: "24px", textAlign: "center", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
            <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>Click or drag to upload bank statement</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => { setManualModal(false); addToast("Manual credit submitted for approval", "success"); }}>Submit for Approval</Btn>
          <Btn variant="ghost" onClick={() => setManualModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── MODULE: TRANSACTIONS ─────────────────────────────────────────────────────
function TransactionsPage({ addToast }) {
  const [adjModal, setAdjModal] = useState(false);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");

  const allTx = [...MOCK_DEPOSITS, ...MOCK_WITHDRAWALS.map(w => ({ ...w, method: w.method, id: `TX-${w.id}` }))];

  return (
    <div>
      <SectionHeader title="All Transactions" sub="Complete financial ledger"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setAdjModal(true)}>+ Adjustment</Btn>
            <Btn onClick={() => addToast("Export started", "info")}>⬇ Export</Btn>
          </div>
        } />

      <FilterBar search={search} onSearch={setSearch}
        filters={[
          { value: typeF, options: [{ value: "all", label: "All Types" }, { value: "deposit", label: "Deposits" }, { value: "withdrawal", label: "Withdrawals" }, { value: "bonus", label: "Bonuses" }, { value: "adjustment", label: "Adjustments" }] },
        ]}
        onFilterChange={(i, v) => setTypeF(v)}
        onReset={() => { setSearch(""); setTypeF("all"); }}
      />

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "id", label: "Transaction ID", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
            { key: "user", label: "User", render: v => typeof v === "object" ? v.name : v },
            { key: "amount", label: "Amount", mono: true, render: v => <span style={{ color: C.gold, fontFamily: FF.mono, fontWeight: 600 }}>${Number(v).toLocaleString()}</span> },
            { key: "method", label: "Method", render: v => v && <Badge status="info">{v}</Badge> },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "date", label: "Date" },
          ]}
          data={allTx.slice(0, 20)}
        />
      </Card>

      <Modal open={adjModal} onClose={() => setAdjModal(false)} title="Manual Balance Adjustment">
        <div style={{ background: C.amberBg, borderRadius: 8, padding: "10px 12px", marginBottom: 18, border: `1px solid ${C.amber}44` }}>
          <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.amber }}>⚠ Adjustments over $500 require Super Admin approval and are recorded in the audit log.</span>
        </div>
        <Input label="User Account" value="" onChange={() => {}} placeholder="Search by email or account number" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Amount ($)" value="" onChange={() => {}} placeholder="0.00" />
          <Select label="Type" value="credit" onChange={() => {}} options={[{ value: "credit", label: "Credit (+)" }, { value: "debit", label: "Debit (-)" }]} />
        </div>
        <Select label="Reason" value="bonus" onChange={() => {}} options={[
          { value: "bonus", label: "Bonus" }, { value: "correction", label: "Error Correction" },
          { value: "compensation", label: "Compensation" }, { value: "refund", label: "Refund" },
        ]} />
        <Input label="Supporting Note" value="" onChange={() => {}} placeholder="Detailed reason for this adjustment" />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn onClick={() => { setAdjModal(false); addToast("Adjustment submitted", "success"); }}>Apply Adjustment</Btn>
          <Btn variant="ghost" onClick={() => setAdjModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── MODULE: RISK MONITOR ─────────────────────────────────────────────────────
function RiskMonitorPage({ addToast }) {
  const exposureData = [
    { symbol: "EURUSD", long: 420, short: 380 },
    { symbol: "BTCUSD", long: 280, short: 340 },
    { symbol: "GOLD", long: 190, short: 220 },
    { symbol: "GBPUSD", long: 310, short: 160 },
    { symbol: "NAS100", long: 140, short: 200 },
    { symbol: "ETHUSD", long: 90, short: 110 },
  ];

  const riskAccounts = MOCK_POSITIONS.map(p => ({
    user: p.user, account: p.account,
    balance: (Math.random() * 20000 + 1000).toFixed(2),
    equity: (Math.random() * 19000 + 800).toFixed(2),
    marginLevel: p.marginLevel,
    openPos: Math.floor(Math.random() * 5 + 1),
    floatingPnl: p.pnl,
  })).sort((a, b) => a.marginLevel - b.marginLevel);

  const [settings, setSettings] = useState({ marginCall: 100, stopOut: 50 });

  return (
    <div>
      <SectionHeader title="Risk Monitor" sub="Real-time broker risk exposure" />

      {/* Exposure Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Long Exposure" value="$12.4M" color={C.green} />
        <StatCard label="Total Short Exposure" value="$11.8M" color={C.red} />
        <StatCard label="Net Exposure" value="$+620K" color={C.gold} />
        <StatCard label="Largest Single User" value="$248K" color={C.amber} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60fr 40fr", gap: 16, marginBottom: 24 }}>
        {/* Exposure Chart */}
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Exposure by Instrument (Lots)</div>
          {exposureData.map((d, i) => {
            const maxVal = Math.max(...exposureData.map(x => Math.max(x.long, x.short)));
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.text, fontWeight: 500 }}>{d.symbol}</span>
                  <span style={{ fontFamily: FF.mono, fontSize: 11, color: C.textMuted }}>L: {d.long} | S: {d.short}</span>
                </div>
                <div style={{ display: "flex", gap: 2, height: 10 }}>
                  <div style={{ width: `${(d.long / maxVal) * 50}%`, background: C.gold + "cc", borderRadius: "3px 0 0 3px", minWidth: 2 }} />
                  <div style={{ width: `${(d.short / maxVal) * 50}%`, background: C.teal + "cc", borderRadius: "0 3px 3px 0", minWidth: 2 }} />
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: C.gold, borderRadius: 2 }} /><span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>Long</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: C.teal, borderRadius: 2 }} /><span style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>Short</span></div>
          </div>
        </Card>

        {/* Risk Settings */}
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Risk Settings</div>
          {[["Margin Call Level (%)", "marginCall"], ["Stop-Out Level (%)", "stopOut"]].map(([l, k]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{l}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={settings[k]} onChange={e => setSettings(s => ({ ...s, [k]: Number(e.target.value) }))}
                  style={{ flex: 1, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontFamily: FF.mono, fontSize: 16, color: C.text, outline: "none" }} />
                <Btn size="sm" onClick={() => addToast(`${l} saved`, "success")}>Save</Btn>
              </div>
            </div>
          ))}
          <Divider />
          <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 10, fontWeight: 600 }}>MAX LEVERAGE BY CATEGORY</div>
          {[["Forex", "1:500"], ["Crypto", "1:50"], ["Stocks", "1:20"], ["Indices", "1:100"]].map(([cat, lev]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>{cat}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input defaultValue={lev} style={{ width: 70, background: C.input, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", fontFamily: FF.mono, fontSize: 12, color: C.text, outline: "none", textAlign: "center" }} />
                <Btn size="sm" variant="ghost" onClick={() => addToast(`${cat} leverage saved`, "success")}>Save</Btn>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Accounts at Risk */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Accounts at Risk</span>
          <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginLeft: 10 }}>Sorted by margin level (lowest first)</span>
        </div>
        <Table
          columns={[
            { key: "user", label: "User" },
            { key: "account", label: "Account", mono: true },
            { key: "balance", label: "Balance", mono: true, render: v => <span style={{ color: C.gold }}>${Number(v).toLocaleString()}</span> },
            { key: "equity", label: "Equity", mono: true },
            { key: "marginLevel", label: "Margin Level", render: v => (
              <span style={{ fontFamily: FF.mono, fontSize: 14, fontWeight: 700, color: v < 50 ? C.red : v < 100 ? C.amber : v < 200 ? "#F59E0B" : C.green }}>{v}%</span>
            )},
            { key: "openPos", label: "Open Pos." },
            { key: "floatingPnl", label: "Floating P&L", render: v => <span style={{ fontFamily: FF.mono, color: Number(v) >= 0 ? C.green : C.red }}>{Number(v) >= 0 ? "+" : ""}${v}</span> },
          ]}
          data={riskAccounts.slice(0, 15)}
        />
      </Card>
    </div>
  );
}

// ─── MODULE: AML ──────────────────────────────────────────────────────────────
function AMLPage({ addToast }) {
  const [alertDetail, setAlertDetail] = useState(null);
  const [sarModal, setSarModal] = useState(false);
  const [search, setSearch] = useState("");

  const typeColor = (type) => {
    if (type.includes("Sanctions") || type.includes("Structuring") || type.includes("Rapid")) return { bg: C.redBg, color: C.red };
    return { bg: C.amberBg, color: C.amber };
  };

  return (
    <div>
      <SectionHeader title="AML Alerts" sub="Anti-money laundering monitoring queue" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Open Alerts" value={MOCK_AML.filter(a => a.status === "open").length} color={C.red} />
        <StatCard label="Escalated" value={MOCK_AML.filter(a => a.status === "escalated").length} color={C.amber} />
        <StatCard label="Cleared Today" value="8" color={C.green} />
        <StatCard label="SARs Filed" value="2" color={C.purple} />
      </div>

      <FilterBar search={search} onSearch={setSearch} filters={[]} onFilterChange={() => {}} onReset={() => setSearch("")} />

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "id", label: "Alert ID", mono: true, render: v => <span style={{ color: C.link }}>{v}</span> },
            { key: "user", label: "User", render: v => <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={v.name} size={26} /><span>{v.name}</span></div> },
            { key: "alertType", label: "Alert Type", render: v => {
              const s = typeColor(v);
              return <span style={{ background: s.bg, color: s.color, padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: FF.sans }}>{v}</span>;
            }},
            { key: "txId", label: "Transaction", mono: true },
            { key: "amount", label: "Amount", mono: true, render: v => <span style={{ color: C.amber, fontFamily: FF.mono, fontWeight: 700 }}>${Number(v).toLocaleString()}</span> },
            { key: "riskScore", label: "Risk Score", render: v => <span style={{ fontFamily: FF.mono, fontSize: 14, fontWeight: 700, color: v > 80 ? C.red : v > 60 ? C.amber : C.green }}>{v}</span> },
            { key: "createdAt", label: "Created" },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "assignedTo", label: "Assigned" },
            { key: "id", label: "Actions", render: (v, r) => (
              <div style={{ display: "flex", gap: 5 }}>
                <Btn size="sm" variant="outline" onClick={() => setAlertDetail(r)}>Review</Btn>
              </div>
            )},
          ]}
          data={MOCK_AML.filter(a => search === "" || a.user.name.toLowerCase().includes(search.toLowerCase()))}
          onRowClick={r => setAlertDetail(r)}
        />
      </Card>

      {/* Alert Detail Side Sheet */}
      <SideSheet open={!!alertDetail} onClose={() => setAlertDetail(null)} title={`AML Alert — ${alertDetail?.id}`}>
        {alertDetail && (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <Avatar name={alertDetail.user.name} size={44} />
              <div>
                <div style={{ fontFamily: FF.sans, fontSize: 15, fontWeight: 700, color: C.text }}>{alertDetail.user.name}</div>
                <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>{alertDetail.user.email}</div>
              </div>
              <Badge status={alertDetail.user.kyc}>{alertDetail.user.kyc.replace(/_/g, " ")}</Badge>
            </div>

            <div style={{ ...typeColor(alertDetail.alertType), borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: `1px solid ${typeColor(alertDetail.alertType).color}44` }}>
              <div style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 700 }}>{alertDetail.alertType}</div>
              <div style={{ fontFamily: FF.sans, fontSize: 12, marginTop: 4 }}>Risk Score: <strong>{alertDetail.riskScore}/100</strong> · Amount: <strong>${Number(alertDetail.amount).toLocaleString()}</strong></div>
            </div>

            <div style={{ fontFamily: FF.sans, fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>RISK SCORE BREAKDOWN</div>
            {[["Transaction Size", 35], ["Velocity", 28], ["Geographic Risk", 15], ["Account Age", 12], ["Pattern Match", 10]].map(([l, v]) => (
              <div key={l} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>{l}</span>
                  <span style={{ fontFamily: FF.mono, fontSize: 12, color: C.text }}>{v}</span>
                </div>
                <div style={{ height: 4, background: C.bg3, borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${v / 40 * 100}%`, background: C.red, borderRadius: 2 }} />
                </div>
              </div>
            ))}

            <Divider />
            <div style={{ fontFamily: FF.sans, fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 10 }}>ACTIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn variant="success" onClick={() => { setAlertDetail(null); addToast("Alert cleared", "success"); }}>✓ Clear Alert</Btn>
              <Btn variant="outline" onClick={() => { setAlertDetail(null); addToast("Alert escalated", "info"); }}>↑ Escalate</Btn>
              <Btn variant="ghost" onClick={() => { setAlertDetail(null); setSarModal(true); }}>📋 File SAR</Btn>
              <Btn variant="danger" onClick={() => { setAlertDetail(null); addToast("Account frozen pending investigation", "error"); }}>🔒 Freeze Account</Btn>
            </div>
          </div>
        )}
      </SideSheet>

      {/* SAR Modal */}
      <Modal open={sarModal} onClose={() => setSarModal(false)} title="File Suspicious Activity Report (SAR)" wide>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Client Full Name" value="" onChange={() => {}} placeholder="Full legal name" />
          <Input label="Account Number" value="" onChange={() => {}} placeholder="VFX-XXXXXX" />
          <Input label="Date of Birth" value="" onChange={() => {}} type="date" />
          <Input label="Nationality" value="" onChange={() => {}} placeholder="Country" />
          <Input label="Suspicious Transaction ID" value="" onChange={() => {}} placeholder="TX-XXXXXX" />
          <Input label="Transaction Amount ($)" value="" onChange={() => {}} placeholder="0.00" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>Reason for Suspicion</label>
          <textarea placeholder="Describe the suspicious activity in detail…"
            style={{ width: "100%", minHeight: 100, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            onFocus={e => (e.target.style.borderColor = C.gold)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => { setSarModal(false); addToast("SAR filed and PDF generated", "success"); }}>File SAR & Generate PDF</Btn>
          <Btn variant="ghost" onClick={() => setSarModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── MODULE: REPORTS ──────────────────────────────────────────────────────────
function ReportsOverviewPage({ addToast }) {
  const [dateRange, setDateRange] = useState("month");

  const pieData = [
    { label: "Spread Income", value: 42, color: C.gold },
    { label: "Commission", value: 31, color: C.teal },
    { label: "Swap Income", value: 18, color: C.blue },
    { label: "Deposit Fees", value: 9, color: C.purple },
  ];

  const funnelData = [
    { label: "Registered", value: 10000, pct: 100 },
    { label: "Email Verified", value: 6800, pct: 68 },
    { label: "KYC Submitted", value: 4500, pct: 45 },
    { label: "KYC Approved", value: 3800, pct: 38 },
    { label: "First Deposit", value: 2400, pct: 24 },
    { label: "First Trade", value: 1900, pct: 19 },
  ];

  return (
    <div>
      <SectionHeader title="Overview Reports" sub="Platform performance analytics"
        action={<Btn onClick={() => addToast("Report exported", "info")}>⬇ Export</Btn>} />

      {/* Date Range */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[["today", "Today"], ["week", "This Week"], ["month", "This Month"], ["lastmonth", "Last Month"], ["quarter", "This Quarter"]].map(([v, l]) => (
          <button key={v} onClick={() => setDateRange(v)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${dateRange === v ? C.gold : C.border}`, background: dateRange === v ? C.goldSub : "transparent", color: dateRange === v ? C.gold : C.textMuted, fontFamily: FF.sans, fontSize: 12, cursor: "pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Revenue Breakdown */}
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Revenue Breakdown</div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <PieChart data={pieData} size={140} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FF.mono, fontSize: 24, fontWeight: 700, color: C.gold, marginBottom: 12 }}>$284,400</div>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                    <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>{d.label}</span>
                  </div>
                  <span style={{ fontFamily: FF.mono, fontSize: 13, color: C.text, fontWeight: 600 }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Volume & Revenue Trend */}
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Volume & Revenue Trend</div>
          <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 12 }}>Trading volume (lots) vs Revenue ($)</div>
          <AreaChart data={CHART_REVENUE} keys={["trading", "fees"]} colors={[C.gold, C.teal]} height={160} />
        </Card>
      </div>

      {/* Client Lifecycle Funnel */}
      <Card>
        <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 20 }}>Client Lifecycle Funnel</div>
        {funnelData.map((step, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.text }}>{step.label}</span>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: FF.mono, fontSize: 13, color: C.textMuted }}>{step.value.toLocaleString()}</span>
                <span style={{ fontFamily: FF.mono, fontSize: 13, fontWeight: 700, color: i === 0 ? C.teal : C.gold }}>{step.pct}%</span>
              </div>
            </div>
            <div style={{ height: 8, background: C.bg3, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${step.pct}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.teal})`, borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ReportsFinancialPage({ addToast }) {
  return (
    <div>
      <SectionHeader title="Financial Reports" sub="Deposits, withdrawals & P&L statements"
        action={<Btn onClick={() => addToast("Financial report exported", "info")}>⬇ Export PDF</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Deposits (Month)" value="$18.7M" color={C.green} />
        <StatCard label="Total Withdrawals (Month)" value="$6.4M" color={C.red} />
        <StatCard label="Net Cash Flow" value="+$12.3M" color={C.gold} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Deposits by Method</div>
          {[["Card", 42, C.gold], ["Bank Wire", 31, C.teal], ["Crypto", 18, C.blue], ["Flutterwave", 9, C.purple]].map(([l, v, c]) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>{l}</span>
                <span style={{ fontFamily: FF.mono, fontSize: 13, color: c, fontWeight: 600 }}>{v}%</span>
              </div>
              <div style={{ height: 6, background: C.bg3, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${v}%`, background: c, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Net Cash Flow Trend</div>
          <AreaChart data={CHART_REVENUE} keys={["trading"]} colors={[C.green]} height={160} />
        </Card>
      </div>
    </div>
  );
}

function ReportsTradingPage({ addToast }) {
  return (
    <div>
      <SectionHeader title="Trading Reports" sub="Volume, instruments & performance analytics"
        action={<Btn onClick={() => addToast("Report exported", "info")}>⬇ Export</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Volume (Month)" value="284K lots" color={C.gold} />
        <StatCard label="Most Traded" value="EURUSD" color={C.teal} />
        <StatCard label="Avg Trade Duration" value="4.2 hrs" color={C.blue} />
        <StatCard label="Client Win Rate" value="47.3%" color={C.purple} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Volume by Symbol</div>
          {MOCK_INSTRUMENTS.slice(0, 6).map((inst, i) => {
            const vol = Math.floor(Math.random() * 60000 + 5000);
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.text }}>{inst.symbol}</span>
                  <span style={{ fontFamily: FF.mono, fontSize: 12, color: C.textMuted }}>{vol.toLocaleString()} lots</span>
                </div>
                <div style={{ height: 6, background: C.bg3, borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${vol / 65000 * 100}%`, background: [C.gold, C.teal, C.blue, C.purple, C.orange, C.green][i], borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </Card>
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Profit Factor by Tier</div>
          {[["Standard", 1.12], ["Pro", 1.34], ["RAW ECN", 1.58]].map(([t, v]) => (
            <div key={t} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}33` }}>
              <span style={{ fontFamily: FF.sans, fontSize: 14, color: C.text }}>{t}</span>
              <span style={{ fontFamily: FF.mono, fontSize: 18, fontWeight: 700, color: C.gold }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ReportsClientPage({ addToast }) {
  return (
    <div>
      <SectionHeader title="Client Reports" sub="Registrations, KYC & retention analytics"
        action={<Btn onClick={() => addToast("Report exported", "info")}>⬇ Export</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="New Registrations (Month)" value="4,280" color={C.gold} />
        <StatCard label="KYC Completion Rate" value="68%" color={C.teal} />
        <StatCard label="Activation Rate" value="38%" color={C.blue} />
        <StatCard label="Monthly Retention" value="81%" color={C.green} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Registrations Over Time</div>
          <BarChartSimple data={CHART_REGS} keyA="registrations" keyB="kyc" height={160} />
        </Card>
        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Account Tier Distribution</div>
          {[["Standard", 62, C.gold], ["Pro", 28, C.teal], ["RAW ECN", 10, C.blue]].map(([l, v, c]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>{l}</span>
                <span style={{ fontFamily: FF.mono, fontSize: 13, color: c, fontWeight: 600 }}>{v}%</span>
              </div>
              <div style={{ height: 8, background: C.bg3, borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${v}%`, background: c, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── MODULE: BONUSES ──────────────────────────────────────────────────────────
function BonusesPage({ addToast }) {
  const [createModal, setCreateModal] = useState(false);
  const [bonusType, setBonusType] = useState("welcome");
  const [campaignModal, setCampaignModal] = useState(false);

  return (
    <div>
      <SectionHeader title="Bonus & Promotions Manager" sub="Active client bonuses and promotional campaigns"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setCampaignModal(true)}>Campaign Manager</Btn>
            <Btn onClick={() => setCreateModal(true)}>+ Create Bonus</Btn>
          </div>
        } />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Bonuses" value="42" color={C.gold} />
        <StatCard label="Total Bonus Liability" value="$18,400" color={C.amber} />
        <StatCard label="Withdrawn Today" value="$1,200" color={C.green} />
        <StatCard label="Expired Today" value="3" color={C.textDim} />
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "user", label: "User" },
            { key: "type", label: "Bonus Type", render: v => <Badge status="info">{v}</Badge> },
            { key: "amount", label: "Amount", mono: true, render: v => <span style={{ color: C.gold, fontFamily: FF.mono }}>${v}</span> },
            { key: "progress", label: "Wagering Progress", render: v => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: C.bg3, borderRadius: 3, minWidth: 80 }}>
                  <div style={{ height: "100%", width: `${v}%`, background: v > 70 ? C.green : C.gold, borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: FF.mono, fontSize: 11, color: C.textMuted, whiteSpace: "nowrap" }}>{v}%</span>
              </div>
            )},
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "expiry", label: "Expires" },
            { key: "user", label: "Actions", render: (v, r) => (
              <Btn size="sm" variant="danger" onClick={() => addToast("Bonus revoked", "error")}>Revoke</Btn>
            )},
          ]}
          data={MOCK_BONUSES}
        />
      </Card>

      {/* Create Bonus Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Bonus">
        <Select label="Bonus Type" value={bonusType} onChange={setBonusType} options={[
          { value: "welcome", label: "Welcome Bonus" }, { value: "deposit_match", label: "Deposit Match" },
          { value: "manual", label: "Manual Bonus" }, { value: "loyalty", label: "Loyalty Bonus" },
        ]} />
        <Input label="Amount ($)" value="" onChange={() => {}} placeholder="0.00" />
        {bonusType === "deposit_match" && <Input label="Match Percentage (%)" value="" onChange={() => {}} placeholder="100" />}
        <Input label="Wagering Requirement (lots)" value="" onChange={() => {}} placeholder="10" />
        <Input label="Expiry Date" value="" onChange={() => {}} type="date" />
        <Input label="Target User (leave empty for campaign)" value="" onChange={() => {}} placeholder="Email or account number" />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>Terms (shown to client)</label>
          <textarea placeholder="Bonus terms and conditions…" style={{ width: "100%", minHeight: 60, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <Btn onClick={() => { setCreateModal(false); addToast("Bonus created", "success"); }}>Create Bonus</Btn>
      </Modal>

      {/* Campaign Manager Modal */}
      <Modal open={campaignModal} onClose={() => setCampaignModal(false)} title="Promotional Campaign Manager" wide>
        <Input label="Campaign Name" value="" onChange={() => {}} placeholder="e.g. New Year 100% Deposit Match" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Start Date" value="" onChange={() => {}} type="date" />
          <Input label="End Date" value="" onChange={() => {}} type="date" />
        </div>
        <Input label="Minimum Deposit ($)" value="" onChange={() => {}} placeholder="100" />
        <Select label="Eligible Account Tier" value="all" onChange={() => {}} options={[{ value: "all", label: "All Tiers" }, { value: "standard", label: "Standard" }, { value: "pro", label: "Pro" }, { value: "raw_ecn", label: "RAW ECN" }]} />
        <Input label="Match Percentage (%)" value="" onChange={() => {}} placeholder="100" />
        <div style={{ background: C.bg3, borderRadius: 8, padding: "12px 14px", marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>Estimated Campaign Liability</div>
          <div style={{ fontFamily: FF.mono, fontSize: 20, fontWeight: 700, color: C.amber, marginTop: 4 }}>~$24,000</div>
        </div>
        <Btn onClick={() => { setCampaignModal(false); addToast("Campaign created", "success"); }}>Launch Campaign</Btn>
      </Modal>
    </div>
  );
}

// ─── MODULE: REFERRALS ────────────────────────────────────────────────────────
function ReferralsPage({ addToast }) {
  return (
    <div>
      <SectionHeader title="Referral Programme" sub="Referrer tracking and commission management" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Referrers" value="1,240" color={C.gold} />
        <StatCard label="Total Referred Users" value="3,820" color={C.teal} />
        <StatCard label="Commissions Paid" value="$48,200" color={C.green} />
        <StatCard label="Pending Commissions" value="$2,400" color={C.amber} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>Referrals</span>
          </div>
          <Table
            columns={[
              { key: "referrer", label: "Referrer" },
              { key: "referred", label: "Referred User" },
              { key: "referredDate", label: "Referred Date" },
              { key: "firstDepositDate", label: "First Deposit" },
              { key: "firstDepositAmt", label: "Deposit Amount", mono: true, render: v => v !== "—" ? <span style={{ color: C.green }}>${v}</span> : <span style={{ color: C.textDim }}>—</span> },
              { key: "commission", label: "Commission", mono: true, render: v => <span style={{ color: C.gold }}>${v}</span> },
              { key: "status", label: "Status", render: v => <Badge status={v} /> },
            ]}
            data={MOCK_REFERRALS}
          />
        </Card>

        <Card>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Programme Settings</div>
          <Select label="Commission Type" value="flat" onChange={() => {}} options={[{ value: "flat", label: "Flat Fee per Qualified Referral" }, { value: "percent", label: "% of Trading Volume" }]} />
          <Input label="Commission Amount ($)" value="50" onChange={() => {}} />
          <Input label="Min First Deposit Required ($)" value="100" onChange={() => {}} />
          <Input label="Min Payout Threshold ($)" value="100" onChange={() => {}} />
          <Select label="Commission Payout" value="manual" onChange={() => {}} options={[{ value: "manual", label: "Manual Approval" }, { value: "auto", label: "Automatic" }]} />
          <Btn onClick={() => addToast("Referral settings saved", "success")}>Save Settings</Btn>
        </Card>
      </div>
    </div>
  );
}

// ─── MODULE: ANNOUNCEMENTS ────────────────────────────────────────────────────
function AnnouncementsPage({ addToast }) {
  const [createModal, setCreateModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [announcementTab, setAnnouncementTab] = useState("announcements");

  const announcements = [
    { id: 1, title: "Platform Maintenance", message: "Scheduled maintenance on Jun 15, 2025 from 02:00–04:00 UTC.", type: "Banner", target: "All Users", start: "Jun 10", end: "Jun 15", status: "active" },
    { id: 2, title: "New Instrument Added: SOLUSD", message: "Solana/USD is now available for trading on all platforms.", type: "Notification", target: "All Users", start: "Jun 8", end: "Jun 20", status: "active" },
    { id: 3, title: "Summer Trading Promotion", message: "Deposit $500+ and receive a 50% bonus this summer.", type: "Pop-up", target: "Unfunded", start: "Jun 1", end: "Aug 31", status: "active" },
  ];

  return (
    <div>
      <SectionHeader title="Communications Centre" />
      <Tabs tabs={[{ key: "announcements", label: "Announcements" }, { key: "email", label: "Email Campaigns" }]} active={announcementTab} onChange={setAnnouncementTab} />

      {announcementTab === "announcements" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Btn onClick={() => setCreateModal(true)}>+ Create Announcement</Btn>
          </div>
          <Card style={{ padding: 0 }}>
            <Table
              columns={[
                { key: "title", label: "Title", render: v => <span style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 600, color: C.text }}>{v}</span> },
                { key: "message", label: "Message", render: v => <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, maxWidth: 280, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span> },
                { key: "type", label: "Display Type", render: v => <Badge status="info">{v}</Badge> },
                { key: "target", label: "Target" },
                { key: "start", label: "Start" },
                { key: "end", label: "End" },
                { key: "status", label: "Status", render: v => <Badge status={v} /> },
                { key: "id", label: "Actions", render: (v) => (
                  <div style={{ display: "flex", gap: 5 }}>
                    <Btn size="sm" variant="outline" onClick={() => addToast("Announcement edited", "info")}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => addToast("Announcement deactivated", "error")}>Stop</Btn>
                  </div>
                )},
              ]}
              data={announcements}
            />
          </Card>
        </>
      )}

      {announcementTab === "email" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Btn onClick={() => setEmailModal(true)}>+ New Email Campaign</Btn>
          </div>
          <Card>
            <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Recent Campaigns</div>
            {[
              { name: "June Newsletter", sent: 28420, openRate: "34%", clickRate: "12%", date: "Jun 5, 2025" },
              { name: "KYC Reminder", sent: 4210, openRate: "48%", clickRate: "23%", date: "Jun 3, 2025" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}33`, alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text }}>{c.name}</div>
                  <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted }}>{c.date} · {c.sent.toLocaleString()} sent</div>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FF.mono, fontSize: 18, fontWeight: 700, color: C.teal }}>{c.openRate}</div>
                    <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>Open Rate</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FF.mono, fontSize: 18, fontWeight: 700, color: C.gold }}>{c.clickRate}</div>
                    <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>Click Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* Create Announcement Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Announcement" wide>
        <Input label="Title" value="" onChange={() => {}} placeholder="Announcement title" />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>Message</label>
          <textarea placeholder="Full announcement message…" style={{ width: "100%", minHeight: 80, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select label="Display Type" value="banner" onChange={() => {}} options={[{ value: "banner", label: "In-app Banner" }, { value: "modal", label: "Pop-up Modal" }, { value: "notification", label: "Notification" }]} />
          <Select label="Target Audience" value="all" onChange={() => {}} options={[{ value: "all", label: "All Users" }, { value: "country", label: "Specific Country" }, { value: "tier", label: "Account Tier" }, { value: "unfunded", label: "Unfunded Accounts" }]} />
          <Input label="Start Date" value="" onChange={() => {}} type="date" />
          <Input label="End Date" value="" onChange={() => {}} type="date" />
        </div>
        <Btn onClick={() => { setCreateModal(false); addToast("Announcement published", "success"); }}>Publish Announcement</Btn>
      </Modal>

      {/* Email Campaign Modal */}
      <Modal open={emailModal} onClose={() => setEmailModal(false)} title="New Email Campaign" wide>
        <Input label="Campaign Name" value="" onChange={() => {}} placeholder="e.g. Weekly Newsletter" />
        <Select label="Template" value="blank" onChange={() => {}} options={[{ value: "blank", label: "Blank (Compose)" }, { value: "newsletter", label: "Newsletter" }, { value: "promo", label: "Promotional" }, { value: "kyc_reminder", label: "KYC Reminder" }]} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select label="Target Audience" value="all" onChange={() => {}} options={[{ value: "all", label: "All Users" }, { value: "kyc_pending", label: "Pending KYC" }, { value: "unfunded", label: "Unfunded" }]} />
          <Input label="Schedule (optional)" value="" onChange={() => {}} type="datetime-local" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>Message</label>
          <textarea placeholder="Email content…" style={{ width: "100%", minHeight: 100, background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: FF.sans, fontSize: 13, color: C.text, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => { setEmailModal(false); addToast("Campaign scheduled", "success"); }}>Schedule Campaign</Btn>
          <Btn variant="ghost" onClick={() => { setEmailModal(false); addToast("Campaign sent immediately", "success"); }}>Send Now</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── MODULE: SYSTEM SETTINGS ──────────────────────────────────────────────────
function SystemSettingsPage({ addToast, role }) {
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("We're performing scheduled maintenance. Back soon.");

  if (role !== "super_admin") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <span style={{ fontSize: 48, marginBottom: 16 }}>🔒</span>
        <div style={{ fontFamily: FF.sans, fontSize: 18, fontWeight: 600, color: C.text }}>Access Restricted</div>
        <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, marginTop: 8 }}>System Settings are accessible to Super Admins only.</div>
      </div>
    );
  }

  const settingsGroups = [
    { title: "Trading Settings", icon: "📈", fields: [
      { label: "Default Leverage (Standard)", value: "200", type: "number" },
      { label: "Default Leverage (Pro)", value: "400", type: "number" },
      { label: "Default Leverage (RAW ECN)", value: "500", type: "number" },
      { label: "Margin Call Level (%)", value: "100", type: "number" },
      { label: "Stop-Out Level (%)", value: "50", type: "number" },
      { label: "Max Positions per Account", value: "200", type: "number" },
    ]},
    { title: "Financial Settings", icon: "💰", fields: [
      { label: "Min Deposit — Card ($)", value: "10", type: "number" },
      { label: "Min Deposit — Bank Wire ($)", value: "500", type: "number" },
      { label: "Min Withdrawal ($)", value: "50", type: "number" },
      { label: "Max Withdrawal per Day ($)", value: "10000", type: "number" },
      { label: "Auto-Approval Threshold ($)", value: "500", type: "number" },
    ]},
    { title: "KYC Settings", icon: "🛡", fields: [
      { label: "KYC Required Before Deposit", value: "No", type: "toggle" },
      { label: "KYC Required Before Withdrawal", value: "Yes", type: "toggle" },
    ]},
    { title: "Fee Configuration", icon: "⚙️", fields: [
      { label: "Card Deposit Fee (%)", value: "0", type: "number" },
      { label: "Bank Wire Withdrawal Fee ($)", value: "25", type: "number" },
      { label: "Crypto Withdrawal Fee (%)", value: "0.5", type: "number" },
    ]},
  ];

  return (
    <div>
      <SectionHeader title="System Configuration" sub="Platform-wide settings — Super Admin only" />

      {/* Maintenance Mode Banner */}
      <div style={{ background: maintenance ? C.redBg : C.bg2, border: `1px solid ${maintenance ? C.red : C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 700, color: maintenance ? C.red : C.text }}>Maintenance Mode</div>
          <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginTop: 2 }}>
            {maintenance ? "⚠ Platform is in maintenance mode — all client-facing pages show maintenance screen" : "Platform is live and accessible to all clients"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div onClick={() => { setMaintenance(!maintenance); addToast(`Maintenance mode ${!maintenance ? "enabled" : "disabled"}`, !maintenance ? "error" : "success"); }}
            style={{ width: 48, height: 24, background: maintenance ? C.red : C.bg3, borderRadius: 12, cursor: "pointer", position: "relative", border: `1px solid ${maintenance ? C.red : C.border}`, transition: "all 0.25s" }}>
            <div style={{ position: "absolute", top: 2, left: maintenance ? 26 : 2, width: 18, height: 18, borderRadius: "50%", background: maintenance ? "#fff" : C.textDim, transition: "all 0.25s" }} />
          </div>
        </div>
      </div>
      {maintenance && (
        <div style={{ marginBottom: 24 }}>
          <Input label="Maintenance Message" value={maintenanceMsg} onChange={setMaintenanceMsg} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {settingsGroups.map(group => (
          <Card key={group.title}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>{group.icon}</span>
              <span style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 700, color: C.text }}>{group.title}</span>
            </div>
            {group.fields.map((field, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                {field.type === "toggle" ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>{field.label}</span>
                    <Badge status={field.value === "Yes" ? "active" : "info"}>{field.value}</Badge>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontFamily: FF.sans, fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 500 }}>{field.label}</label>
                      <input defaultValue={field.value} style={{ width: "100%", background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontFamily: FF.mono, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <Btn size="sm" onClick={() => addToast(`${field.label} saved`, "success")}>Save</Btn>
                  </div>
                )}
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE: AUDIT LOGS ───────────────────────────────────────────────────────
function AuditLogsPage({ addToast }) {
  const [search, setSearch] = useState("");
  const [severityF, setSeverityF] = useState("all");
  const [detailModal, setDetailModal] = useState(null);

  const filtered = MOCK_AUDIT.filter(a =>
    (search === "" || a.actor.toLowerCase().includes(search.toLowerCase()) || a.action.toLowerCase().includes(search.toLowerCase())) &&
    (severityF === "all" || a.severity === severityF)
  );

  return (
    <div>
      <SectionHeader title="Audit Trail" sub="Immutable record of all admin actions"
        action={<Btn onClick={() => addToast("Audit export started", "info")}>⬇ Export</Btn>} />

      <FilterBar search={search} onSearch={setSearch}
        filters={[
          { value: severityF, options: [{ value: "all", label: "All Severity" }, { value: "info", label: "Info" }, { value: "warning", label: "Warning" }, { value: "critical", label: "Critical" }] },
        ]}
        onFilterChange={(i, v) => setSeverityF(v)}
        onReset={() => { setSearch(""); setSeverityF("all"); }}
      />

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "timestamp", label: "Timestamp", mono: true, render: v => <span style={{ fontSize: 12 }}>{v}</span> },
            { key: "actor", label: "Admin", render: (v, r) => (
              <div>
                <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, fontWeight: 500 }}>{v}</div>
                <Badge status={r.role} />
              </div>
            )},
            { key: "action", label: "Action", render: v => <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, maxWidth: 340, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span> },
            { key: "code", label: "Action Code", mono: true, render: v => <span style={{ fontSize: 11, color: C.textDim }}>{v}</span> },
            { key: "targetUser", label: "Target User", render: v => <span style={{ fontFamily: FF.sans, fontSize: 12, color: C.link }}>{v}</span> },
            { key: "ip", label: "IP Address", mono: true, render: v => <span style={{ fontSize: 11, color: C.textMuted }}>{v}</span> },
            { key: "severity", label: "Severity", render: v => <Badge status={v} /> },
            { key: "id", label: "", render: (v, r) => <Btn size="sm" variant="ghost" onClick={() => setDetailModal(r)}>Details</Btn> },
          ]}
          data={filtered}
          onRowClick={r => setDetailModal(r)}
        />
      </Card>

      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Audit Log Detail" wide>
        {detailModal && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {[["Timestamp", detailModal.timestamp], ["Actor", detailModal.actor], ["Role", detailModal.role], ["Action Code", detailModal.code], ["Target User", detailModal.targetUser], ["IP Address", detailModal.ip], ["Severity", detailModal.severity]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontFamily: l === "Action Code" || l === "IP Address" ? FF.mono : FF.sans, fontSize: 13, color: C.text }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.text, marginBottom: 16, padding: "12px 14px", background: C.bg3, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <strong>Action:</strong> {detailModal.action}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>PREVIOUS STATE</div>
                <pre style={{ background: C.bg3, borderRadius: 8, padding: "12px 14px", fontFamily: FF.mono, fontSize: 12, color: C.textMuted, margin: 0, overflow: "auto", border: `1px solid ${C.border}` }}>{`{ "status": "pending" }`}</pre>
              </div>
              <div>
                <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 6 }}>NEW STATE</div>
                <pre style={{ background: C.greenBg, borderRadius: 8, padding: "12px 14px", fontFamily: FF.mono, fontSize: 12, color: C.green, margin: 0, overflow: "auto", border: `1px solid ${C.green}33` }}>{`{ "status": "approved" }`}</pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── MODULE: STAFF ────────────────────────────────────────────────────────────
function StaffPage({ addToast, role }) {
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);

  if (role !== "super_admin") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <span style={{ fontSize: 48, marginBottom: 16 }}>🔒</span>
        <div style={{ fontFamily: FF.sans, fontSize: 18, fontWeight: 600, color: C.text }}>Access Restricted</div>
        <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, marginTop: 8 }}>Staff Management is accessible to Super Admins only.</div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Staff Access Management" sub="Admin accounts, roles & permissions"
        action={<Btn onClick={() => setCreateModal(true)}>+ Create Staff Account</Btn>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Staff" value={MOCK_STAFF.length} color={C.gold} />
        <StatCard label="Active" value={MOCK_STAFF.filter(s => s.status === "active").length} color={C.green} />
        <StatCard label="Suspended" value={MOCK_STAFF.filter(s => s.status === "suspended").length} color={C.red} />
        <StatCard label="2FA Enforced" value={MOCK_STAFF.length} color={C.teal} />
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "name", label: "Name", render: (v, r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={v} size={32} />
                <div>
                  <div style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 600, color: C.text }}>{v}</div>
                  <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textMuted }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: "role", label: "Role", render: v => <Badge status={v} /> },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "lastLogin", label: "Last Login" },
            { key: "createdAt", label: "Created" },
            { key: "id", label: "Actions", render: (v, r) => (
              <div style={{ display: "flex", gap: 5 }}>
                <Btn size="sm" variant="outline" onClick={() => setEditModal(r)}>Edit</Btn>
                <Btn size="sm" variant="danger" onClick={() => addToast(`${r.name} ${r.status === "active" ? "suspended" : "activated"}`, "success")}>
                  {r.status === "active" ? "Suspend" : "Activate"}
                </Btn>
              </div>
            )},
          ]}
          data={MOCK_STAFF}
        />
      </Card>

      {/* Create Staff Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Staff Account">
        <Input label="Full Name" value="" onChange={() => {}} placeholder="Staff member's full name" />
        <Input label="Work Email" value="" onChange={() => {}} placeholder="name@vertexfx.com" type="email" />
        <Select label="Role" value="support" onChange={() => {}} options={[
          { value: "admin", label: "Admin" }, { value: "compliance", label: "Compliance Officer" },
          { value: "finance", label: "Finance Officer" }, { value: "support", label: "Support Agent" },
          { value: "risk_manager", label: "Risk Manager" },
        ]} />
        <Input label="IP Restriction (optional)" value="" onChange={() => {}} placeholder="e.g. 196.152.0.0/24" />
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
          <input type="checkbox" defaultChecked style={{ accentColor: C.gold }} />
          <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>Require 2FA setup on first login</span>
        </label>
        <div style={{ background: C.bg3, borderRadius: 8, padding: "12px 14px", marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Auto-generated temporary password</div>
          <div style={{ fontFamily: FF.mono, fontSize: 15, color: C.gold }}>TmpVfx@{Math.random().toString(36).slice(2, 10)}</div>
          <div style={{ fontFamily: FF.sans, fontSize: 11, color: C.textDim, marginTop: 4 }}>Staff must change this on first login</div>
        </div>
        <Btn onClick={() => { setCreateModal(false); addToast("Staff account created. Welcome email sent.", "success"); }}>Create Account</Btn>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Staff — ${editModal?.name}`}>
        {editModal && (
          <>
            <Select label="Role" value={editModal.role} onChange={() => {}} options={[
              { value: "admin", label: "Admin" }, { value: "compliance", label: "Compliance Officer" },
              { value: "finance", label: "Finance Officer" }, { value: "support", label: "Support Agent" },
              { value: "risk_manager", label: "Risk Manager" },
            ]} />
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <Btn size="sm" variant="ghost" onClick={() => addToast("Password reset email sent", "info")}>Reset Password</Btn>
              <Btn size="sm" variant="danger" onClick={() => { setEditModal(null); addToast(`${editModal.name} ${editModal.status === "active" ? "suspended" : "activated"}`, "success"); }}>
                {editModal.status === "active" ? "Suspend Account" : "Activate Account"}
              </Btn>
            </div>
            <Btn onClick={() => { setEditModal(null); addToast("Staff account updated", "success"); }}>Save Changes</Btn>
          </>
        )}
      </Modal>
    </div>
  );
}

// ─── MODULE: USER ACTIVITY ────────────────────────────────────────────────────
function UserActivityPage() {
  return (
    <div>
      <SectionHeader title="User Activity" sub="Platform usage and session analytics" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Currently Online" value="1,247" color={C.teal} />
        <StatCard label="Sessions Today" value="8,432" color={C.gold} />
        <StatCard label="Avg Session Duration" value="24 min" color={C.blue} />
        <StatCard label="New Logins (24h)" value="3,140" color={C.green} />
      </div>
      <Card>
        <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Active Sessions by Device</div>
        {[["Desktop / Web", 62, C.gold], ["Mobile App", 31, C.teal], ["MT4/MT5 Terminal", 7, C.blue]].map(([l, v, c]) => (
          <div key={l} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted }}>{l}</span>
              <span style={{ fontFamily: FF.mono, fontSize: 13, color: c, fontWeight: 600 }}>{v}%</span>
            </div>
            <div style={{ height: 8, background: C.bg3, borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${v}%`, background: c, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── MODULE: LEDGER ───────────────────────────────────────────────────────────
function LedgerPage({ addToast }) {
  return (
    <div>
      <SectionHeader title="Ledger" sub="Complete financial ledger view"
        action={<Btn onClick={() => addToast("Ledger exported", "info")}>⬇ Export</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Deposits (All Time)" value="$284M" color={C.green} />
        <StatCard label="Total Withdrawals (All Time)" value="$112M" color={C.red} />
        <StatCard label="Net Inflow" value="$172M" color={C.gold} />
      </div>
      <Card style={{ padding: 0 }}>
        <Table
          columns={[
            { key: "id", label: "Ref #", mono: true },
            { key: "user", label: "User", render: v => typeof v === "object" ? v.name : v },
            { key: "amount", label: "Amount", mono: true, render: v => <span style={{ color: C.gold }}>${Number(v).toLocaleString()}</span> },
            { key: "method", label: "Method" },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "date", label: "Date" },
          ]}
          data={[...MOCK_DEPOSITS, ...MOCK_WITHDRAWALS.map(w => ({ ...w, id: `WD-${w.id}` }))].slice(0, 25)}
        />
      </Card>
    </div>
  );
}

// ─── MODULE: COMPLIANCE REPORTS ───────────────────────────────────────────────
function ComplianceReportsPage({ addToast }) {
  return (
    <div>
      <SectionHeader title="Compliance Reports" sub="Regulatory reporting & documentation"
        action={<Btn onClick={() => addToast("Compliance report exported", "info")}>⬇ Export All</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Monthly AML Summary", desc: "Transaction monitoring report for June 2025", icon: "🔍", color: C.red },
          { title: "KYC Completion Report", desc: "Document verification statistics and trends", icon: "🛡", color: C.gold },
          { title: "SAR Activity Report", desc: "Suspicious activity reports filed this quarter", icon: "📋", color: C.amber },
          { title: "Regulatory Compliance Summary", desc: "FCA/FSCA compliance overview — Q2 2025", icon: "🏛", color: C.teal },
        ].map((r, i) => (
          <Card key={i} style={{ cursor: "pointer", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = r.color + "66")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span style={{ fontSize: 32 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, marginBottom: 12 }}>{r.desc}</div>
                <Btn size="sm" variant="ghost" onClick={() => addToast(`${r.title} downloaded`, "info")}>⬇ Download PDF</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@vertexfx.com");
  const [password, setPassword] = useState("admin123");
  const [role, setRole] = useState("super_admin");
  const [loading, setLoading] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) { setError("Please enter credentials"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTwoFA(true);
    }, 900);
  };

  const handleVerify = () => {
    if (code.length < 4) { setError("Enter your 2FA code"); return; }
    setLoading(true);
    setTimeout(() => {
      const names = { super_admin: "Alexandra Hunt", admin: "Thomas Ashby", compliance: "Sarah Kimani", finance: "Mike Adewale", support: "Lena Müller", risk_manager: "Raj Patel" };
      onLogin({ name: names[role] || "Admin User", email, role });
    }, 700);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}08 0%, transparent 70%)`, top: -100, right: -100 }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}06 0%, transparent 70%)`, bottom: -100, left: -100 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border}40 1px, transparent 1px), linear-gradient(90deg, ${C.border}40 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: "40px 44px", width: "min(440px, 94vw)", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 26, fontFamily: "serif" }}>V</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 0.5 }}>
            VERTEX<span style={{ color: C.gold }}>FX</span>
          </div>
          <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.textMuted, marginTop: 4, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Admin Control Panel
          </div>
        </div>

        {!twoFA ? (
          <>
            <div style={{ background: C.amberBg, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "10px 12px", marginBottom: 20 }}>
              <p style={{ fontFamily: FF.sans, fontSize: 12, color: C.amber, margin: 0 }}>🔒 Restricted access. Authorised personnel only. All access is logged and monitored.</p>
            </div>

            <Input label="Email Address" value={email} onChange={setEmail} placeholder="admin@vertexfx.com" type="email" />
            <Input label="Password" value={password} onChange={setPassword} placeholder="Enter password" type="password" />

            {/* Demo role selector */}
            <Select label="Demo Role (for testing)" value={role} onChange={setRole} options={[
              { value: "super_admin", label: "Super Admin — Full Access" },
              { value: "admin", label: "Admin" },
              { value: "compliance", label: "Compliance Officer" },
              { value: "finance", label: "Finance Officer" },
              { value: "support", label: "Support Agent" },
              { value: "risk_manager", label: "Risk Manager" },
            ]} />

            {error && <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.red, marginBottom: 12 }}>{error}</div>}

            <button onClick={handleLogin} disabled={loading}
              style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`, border: "none", borderRadius: 10, fontFamily: FF.sans, fontSize: 15, fontWeight: 700, color: "#000", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1, transition: "opacity 0.2s" }}>
              {loading ? "Authenticating…" : "Sign In →"}
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📱</div>
              <div style={{ fontFamily: FF.sans, fontSize: 16, fontWeight: 600, color: C.text }}>Two-Factor Verification</div>
              <div style={{ fontFamily: FF.sans, fontSize: 13, color: C.textMuted, marginTop: 4 }}>Enter the 6-digit code from your authenticator app</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <input key={i} maxLength={1} value={code[i] || ""}
                  onChange={e => { const c = code.split(""); c[i] = e.target.value; setCode(c.join("")); }}
                  style={{ width: 44, height: 52, textAlign: "center", background: C.input, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: FF.mono, fontSize: 22, fontWeight: 700, color: C.gold, outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = C.gold)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />
              ))}
            </div>
            {error && <div style={{ fontFamily: FF.sans, fontSize: 12, color: C.red, marginBottom: 12, textAlign: "center" }}>{error}</div>}
            <button onClick={handleVerify} disabled={loading}
              style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`, border: "none", borderRadius: 10, fontFamily: FF.sans, fontSize: 15, fontWeight: 700, color: "#000", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1 }}>
              {loading ? "Verifying…" : "Verify & Access Dashboard"}
            </button>
            <button onClick={() => { setTwoFA(false); setCode(""); }} style={{ width: "100%", marginTop: 10, padding: "10px", background: "transparent", border: "none", fontFamily: FF.sans, fontSize: 13, color: C.textMuted, cursor: "pointer" }}>← Back</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [pageData, setPageData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [toasts, setToasts] = useState([]);

  const notifications = [
    { id: 1, icon: "🛡", message: "New KYC submission from James Okafor", time: "2 min ago", read: false },
    { id: 2, icon: "💰", message: "Withdrawal request $4,200 awaiting approval", time: "8 min ago", read: false },
    { id: 3, icon: "🚨", message: "AML alert triggered on account VFX-100207", time: "15 min ago", read: false },
    { id: 4, icon: "⚠️", message: "Margin call: VFX-100334 margin level at 68%", time: "22 min ago", read: false },
    { id: 5, icon: "✅", message: "KYC approved: Priya Nair", time: "1 hr ago", read: true },
    { id: 6, icon: "💳", message: "Large deposit: $25,000 received from VFX-100189", time: "2 hrs ago", read: true },
  ];

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), type === "error" ? 6000 : 4000);
  }, []);

  const navigate = useCallback((key, data = null) => {
    setPage(key);
    setPageData(data);
    setShowNotifs(false);
  }, []);

  if (!admin) return <LoginPage onLogin={setAdmin} />;

  const sidebarWidth = sidebarCollapsed ? 72 : 260;
  const contentStyle = { marginLeft: sidebarWidth, paddingTop: 64, minHeight: "100vh", background: C.bg, transition: "margin-left 0.25s ease" };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={navigate} addToast={addToast} />;
      case "users": return <UsersPage onNavigate={navigate} addToast={addToast} />;
      case "user-detail": return <UserDetail user={pageData || MOCK_USERS[0]} onBack={() => navigate("users")} addToast={addToast} />;
      case "user-activity": return <UserActivityPage />;
      case "kyc": return <KYCPage addToast={addToast} />;
      case "live-positions": return <LivePositionsPage addToast={addToast} />;
      case "trade-history": return <TradeHistoryPage addToast={addToast} />;
      case "instruments": return <InstrumentsPage addToast={addToast} />;
      case "deposits": return <DepositsPage addToast={addToast} />;
      case "withdrawals": return <WithdrawalsPage addToast={addToast} />;
      case "transactions": return <TransactionsPage addToast={addToast} />;
      case "ledger": return <LedgerPage addToast={addToast} />;
      case "risk-monitor": return <RiskMonitorPage addToast={addToast} />;
      case "aml-alerts": return <AMLPage addToast={addToast} />;
      case "compliance-reports": return <ComplianceReportsPage addToast={addToast} />;
      case "reports-overview": return <ReportsOverviewPage addToast={addToast} />;
      case "reports-financial": return <ReportsFinancialPage addToast={addToast} />;
      case "reports-trading": return <ReportsTradingPage addToast={addToast} />;
      case "reports-client": return <ReportsClientPage addToast={addToast} />;
      case "bonuses": return <BonusesPage addToast={addToast} />;
      case "referrals": return <ReferralsPage addToast={addToast} />;
      case "announcements": return <AnnouncementsPage addToast={addToast} />;
      case "system-settings": return <SystemSettingsPage addToast={addToast} role={admin.role} />;
      case "audit-logs": return <AuditLogsPage addToast={addToast} />;
      case "staff": return <StaffPage addToast={addToast} role={admin.role} />;
      default: return <Dashboard onNavigate={navigate} addToast={addToast} />;
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,600;1,700&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: ${C.bg}; color: ${C.text}; font-family: ${FF.sans}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.textDim}; }
        input, select, textarea { color-scheme: dark; }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 6px ${C.teal}} 50%{opacity:0.6;box-shadow:0 0 12px ${C.teal}} }
      `}</style>

      <div onClick={() => showNotifs && setShowNotifs(false)}>
        <TopBar admin={admin} showNotifs={showNotifs} setShowNotifs={setShowNotifs} notifications={notifications} onNavigate={navigate} />
        <Sidebar active={page} onNavigate={navigate} collapsed={sidebarCollapsed} role={admin.role} />

        {/* Sidebar collapse toggle */}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
          position: "fixed", left: sidebarWidth - 13, top: 84, zIndex: 950,
          width: 26, height: 26, borderRadius: "50%", background: C.bg2, border: `1px solid ${C.border}`,
          cursor: "pointer", color: C.textMuted, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "left 0.25s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>
          {sidebarCollapsed ? "›" : "‹"}
        </button>

        <div style={contentStyle}>
          <div style={{ padding: 24, maxWidth: 1440 }}>
            {renderPage()}
          </div>
        </div>

        <Toast toasts={toasts} onRemove={id => setToasts(prev => prev.filter(t => t.id !== id))} />
      </div>
    </>
  );
}
