import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "./AuthContext";
import { adminApi } from "./api";

// Design Tokens (MUST stay in sync with user-app)
const C = {
  bg: "#0B0F1A",
  bg2: "#111827",
  bg3: "#1A2235",
  border: "#1F2D45",
  input: "#141C2E",
  gold: "#D4A843",
  goldMuted: "#A07728",
  goldSub: "rgba(212,168,67,0.12)",
  teal: "#0BCEAF",
  tealMuted: "#0A9E88",
  tealSub: "rgba(11,206,175,0.10)",
  text: "#E8EDF5",
  textMuted: "#8B97B5",
  textDim: "#4E5E7A",
  link: "#4F9CF8",
  green: "#22C55E",
  greenBg: "rgba(34,197,94,0.10)",
  amber: "#F59E0B",
  amberBg: "rgba(245,158,11,0.10)",
  red: "#EF4444",
  redBg: "rgba(239,68,68,0.10)",
  blue: "#3B82F6",
  blueBg: "rgba(59,130,246,0.10)",
  purple: "#8B5CF6",
  orange: "#F97316",
};

const FF = { sans: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" };

// Utilities
function formatUSD(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n || 0);
}
function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n || 0);
}
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Components
function Badge({ status, children }) {
  const map = {
    active: { bg: C.greenBg, color: C.green },
    approved: { bg: C.greenBg, color: C.green },
    completed: { bg: C.greenBg, color: C.green },
    pending: { bg: C.amberBg, color: C.amber },
    suspended: { bg: C.redBg, color: C.red },
    rejected: { bg: C.redBg, color: C.red },
    banned: { bg: C.redBg, color: C.red },
    not_submitted: { bg: "rgba(78,94,122,0.2)", color: C.textMuted },
  };
  const s = map[status] ||
    map[status?.toLowerCase()] || { bg: C.blueBg, color: C.blue };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 9px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: FF.sans,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        whiteSpace: "nowrap",
      }}
    >
      {children || status?.replace(/_/g, " ")}
    </span>
  );
}

function Avatar({ name, size = 36 }) {
  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  const colors = [C.gold, C.teal, C.blue, C.purple, C.orange];
  const color = colors[name?.charCodeAt(0) % colors.length] || C.gold;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}33, ${color}22)`,
        border: `1.5px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FF.sans,
        fontSize: size * 0.33,
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function KpiCard({ title, value, change, icon, color = C.gold }) {
  return (
    <div
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "20px 22px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: FF.sans,
            fontSize: 12,
            color: C.textMuted,
            fontWeight: 500,
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div
          style={{
            fontFamily: FF.mono,
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {change && (
          <span
            style={{
              fontSize: 12,
              color: change > 0 ? C.green : C.red,
              fontFamily: FF.sans,
            }}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
    </div>
  );
}

function Card({ children, title, action, style, noPadding }) {
  return (
    <div
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: noPadding ? 0 : "20px 22px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            padding: noPadding ? "20px 22px 0" : 0,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: C.text,
              fontFamily: FF.sans,
            }}
          >
            {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function Table({ columns, data, onRowClick, loading }) {
  if (loading) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: C.textMuted,
          fontFamily: FF.sans,
        }}
      >
        Loading...
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontFamily: FF.sans,
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  borderBottom: `1px solid ${C.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr
              key={ri}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: `1px solid ${C.border}22`,
                cursor: onRowClick ? "pointer" : "default",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg3)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "12px 14px",
                    fontFamily: col.mono ? FF.mono : FF.sans,
                    fontSize: 13,
                    color: C.text,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: C.textDim,
                  fontFamily: FF.sans,
                  fontSize: 14,
                }}
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontFamily: FF.sans,
            fontSize: 12,
            color: C.textMuted,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: C.input,
          border: `1px solid ${error ? C.red : C.border}`,
          borderRadius: 8,
          padding: "9px 12px",
          fontFamily: FF.sans,
          fontSize: 13,
          color: C.text,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = error ? C.red : C.gold)
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = error ? C.red : C.border)
        }
      />
      {error && (
        <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontFamily: FF.sans,
            fontSize: 12,
            color: C.textMuted,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: "100%",
          background: C.input,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "9px 12px",
          fontFamily: FF.sans,
          fontSize: 13,
          color: C.text,
          outline: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  style,
  icon,
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: FF.sans,
    fontWeight: 600,
    transition: "opacity 0.15s, transform 0.15s",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
  };
  const sizes = {
    sm: { fontSize: 11, padding: "5px 12px" },
    md: { fontSize: 13, padding: "9px 18px" },
    lg: { fontSize: 14, padding: "11px 24px" },
  };
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`,
      color: "#000",
    },
    teal: {
      background: `linear-gradient(135deg, ${C.teal}, ${C.tealMuted})`,
      color: "#000",
    },
    ghost: {
      background: "transparent",
      color: C.textMuted,
      border: `1px solid ${C.border}`,
    },
    danger: {
      background: C.redBg,
      color: C.red,
      border: `1px solid ${C.red}33`,
    },
  };
  return (
    <button
      type={type}
      onClick={!disabled ? onClick : undefined}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={(e) =>
        !disabled && (e.currentTarget.style.opacity = "0.82")
      }
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = "1")}
    >
      {icon} {children}
    </button>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          background: C.bg2,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <h3 style={{ margin: 0, fontFamily: FF.sans, color: C.text }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.textMuted,
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// Line Chart Component
function SimpleLineChart({ data, height = 180 }) {
  const svgRef = useRef(null);
  const [dim, setDim] = useState({ w: 0, h: height });

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current)
        setDim({ w: svgRef.current.clientWidth || 400, h: height });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [height]);

  const { path, points, yAxis } = useMemo(() => {
    if (data.length === 0) return { path: "", points: [], yAxis: [] };
    const max = Math.max(...data.map((d) => d.y), 1);
    const min = 0;
    const w = dim.w - 40;
    const h = dim.h - 20;
    const xStep = w / (data.length - 1 || 1);

    const pt = (i, v) => ({
      x: 20 + i * xStep,
      y: 10 + h - ((v - min) / (max - min || 1)) * h,
    });

    const pts = data.map((d, i) => pt(i, d.y));
    let dStr = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      dStr += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return {
      path: dStr,
      points: pts,
      yAxis: [max, max * 0.75, max * 0.5, max * 0.25, min].map((v, i) => ({
        val: v,
        y: 10 + (h / 4) * i,
      })),
    };
  }, [data, dim]);

  return (
    <div style={{ width: "100%", position: "relative", height }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
          </linearGradient>
        </defs>
        {path && (
          <path
            d={`${path} L ${points[points.length - 1]?.x} ${height - 10} L 20 ${height - 10} Z`}
            fill="url(#lineGrad)"
          />
        )}
        {path && <path d={path} fill="none" stroke={C.gold} strokeWidth="2" />}
        {yAxis.map((a, i) => (
          <g key={i}>
            <text
              x="0"
              y={a.y + 4}
              fill={C.textDim}
              fontSize="10"
              fontFamily={FF.mono}
            >
              {Math.round(a.val)}
            </text>
            <line
              x1="20"
              y1={a.y}
              x2="100%"
              y2={a.y}
              stroke={C.border}
              strokeDasharray="2,2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Login Screen
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 24,
                fontFamily: "serif",
              }}
            >
              V
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            VERTEX<span style={{ color: C.gold }}>FX</span>
          </h1>
          <p
            style={{
              color: C.textMuted,
              fontSize: 13,
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            Admin Console
          </p>
        </div>
        {error && (
          <div
            style={{
              background: C.redBg,
              border: `1px solid ${C.red}44`,
              color: C.red,
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="admin@vertexfx.com"
          />
          <Input
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
          />
          <Btn type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Sign In"}
          </Btn>
        </form>
      </Card>
    </div>
  );
}

// Sidebar Component
function Sidebar({ activeTab, setActiveTab, onLogout, role }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "accounts", label: "Trading Accounts", icon: "💰" },
    { id: "kyc", label: "KYC Review", icon: "📋" },
    { id: "deposits", label: "Deposits", icon: "⬇️" },
    { id: "withdrawals", label: "Withdrawals", icon: "⬆️" },
    { id: "transfers", label: "Transfers", icon: "↔️" },
    { id: "positions", label: "Positions", icon: "📈" },
    { id: "instruments", label: "Instruments", icon: "🔧" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const roleTabs = {
    super_admin: tabs,
    compliance: tabs.filter((t) => ["overview", "users", "kyc"].includes(t.id)),
    finance: tabs.filter((t) =>
      ["overview", "deposits", "withdrawals", "transfers"].includes(t.id),
    ),
    support: tabs.filter((t) =>
      ["overview", "users", "accounts", "deposits", "withdrawals"].includes(
        t.id,
      ),
    ),
  };

  const visibleTabs = roleTabs[role] || tabs;

  return (
    <div
      style={{
        width: 260,
        background: C.bg2,
        borderRight: `1px solid ${C.border}`,
        height: "100vh",
        position: "fixed",
        top: 64,
        left: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{ padding: "24px 16px", borderBottom: `1px solid ${C.border}` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                fontFamily: "serif",
              }}
            >
              V
            </span>
          </div>
          <div>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17,
                fontWeight: 700,
                color: C.text,
                letterSpacing: 0.5,
              }}
            >
              VERTEX<span style={{ color: C.gold }}>FX</span>
            </span>
            <span
              style={{
                fontFamily: FF.sans,
                fontSize: 9,
                color: C.textDim,
                display: "block",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginTop: -2,
              }}
            >
              Admin
            </span>
          </div>
        </div>
      </div>
      <nav style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: activeTab === tab.id ? C.goldSub : "transparent",
              color: activeTab === tab.id ? C.gold : C.textMuted,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              marginBottom: 4,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              !activeTab && (e.currentTarget.style.background = C.bg3)
            }
            onMouseLeave={(e) =>
              !activeTab && (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span
              style={{ fontFamily: FF.sans, fontSize: 13, fontWeight: 500 }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
      <div style={{ padding: "16px 12px", borderTop: `1px solid ${C.border}` }}>
        <Btn
          variant="ghost"
          onClick={onLogout}
          style={{ width: "100%" }}
          icon="🚪"
        >
          Logout
        </Btn>
      </div>
    </div>
  );
}

// Top Bar Component
function TopBar({ admin, onLogout, onRefresh }) {
  const [time, setTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const utcTime = time.toUTCString().split(" ").slice(4, 5)[0];
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 1000,
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
      }}
    >
      <div style={{ width: 260, flexShrink: 0 }} /> {/* Spacer for sidebar */}
      <div style={{ flex: 1 }} />
      <Btn
        variant="ghost"
        onClick={onRefresh}
        style={{
          padding: "8px 16px",
          fontSize: 14,
        }}
      >
        🔄 Refresh
      </Btn>
      <div
        style={{
          fontFamily: FF.mono,
          fontSize: 12,
          color: C.textMuted,
          whiteSpace: "nowrap",
        }}
      >
        {utcTime} <span style={{ color: C.textDim }}>UTC</span>
      </div>
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 10px",
            borderRadius: 10,
            background: C.bg2,
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
        >
          <Avatar name={`${admin.firstName} ${admin.lastName}`} size={32} />
          <div>
            <div
              style={{
                fontFamily: FF.sans,
                fontSize: 13,
                fontWeight: 500,
                color: C.text,
                lineHeight: 1,
              }}
            >
              {admin.firstName} {admin.lastName}
            </div>
            <div
              style={{
                fontFamily: FF.sans,
                fontSize: 10,
                color: C.gold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginTop: 1,
              }}
            >
              {admin.role?.replace("_", " ")}
            </div>
          </div>
          <span style={{ color: C.textMuted, fontSize: 12 }}>
            {isDropdownOpen ? "▲" : "▼"}
          </span>
        </button>
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: C.bg2,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              minWidth: 200,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              zIndex: 1001,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => {
                alert("Profile view - coming soon!");
                setIsDropdownOpen(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: C.text,
                fontFamily: FF.sans,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg3)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              👤 Profile
            </button>
            <button
              onClick={() => {
                onLogout();
                setIsDropdownOpen(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: C.red,
                fontFamily: FF.sans,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.redBg)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              🚪 Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ stats, users, deposits, withdrawals }) {
  const chartData = [
    { x: "Mon", y: 45000 },
    { x: "Tue", y: 52000 },
    { x: "Wed", y: 48000 },
    { x: "Thu", y: 61000 },
    { x: "Fri", y: 58000 },
    { x: "Sat", y: 42000 },
    { x: "Sun", y: 55000 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        <KpiCard
          title="Total AUM"
          value={formatUSD(stats?.totalAum || 0)}
          icon="💰"
        />
        <KpiCard
          title="Active Users"
          value={formatNumber(stats?.totalActiveUsers || 0)}
          icon="👥"
        />
        <KpiCard
          title="Open Positions"
          value={formatNumber(stats?.openPositions || 0)}
          icon="📈"
        />
        <KpiCard
          title="Pending KYC"
          value={formatNumber(stats?.pendingKyc || 0)}
          icon="📋"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Card title="Trading Volume (7d)">
          <SimpleLineChart data={chartData} />
        </Card>
        <Card title="Quick Actions">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn variant="primary" style={{ width: "100%" }}>
              View Pending KYC
            </Btn>
            <Btn variant="teal" style={{ width: "100%" }}>
              Approve Withdrawals
            </Btn>
            <Btn variant="ghost" style={{ width: "100%" }}>
              New User Report
            </Btn>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card title="Recent Deposits">
          <Table
            columns={[
              {
                key: "user",
                label: "User",
                render: (_, r) => (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Avatar name={r.userName} size={28} />
                    <div>
                      <div style={{ fontSize: 13 }}>{r.userName}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        {r.email}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "amount",
                label: "Amount",
                render: (v) => (
                  <span style={{ fontFamily: FF.mono }}>{formatUSD(v)}</span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (v) => <Badge status={v} />,
              },
            ]}
            data={deposits?.slice(0, 5) || []}
          />
        </Card>
        <Card title="Recent Users">
          <Table
            columns={[
              {
                key: "user",
                label: "User",
                render: (_, r) => (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Avatar name={`${r.firstName} ${r.lastName}`} size={28} />
                    <div>
                      <div style={{ fontSize: 13 }}>
                        {r.firstName} {r.lastName}
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        {r.email}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (v) => <Badge status={v} />,
              },
              {
                key: "kycStatus",
                label: "KYC",
                render: (v) => <Badge status={v} />,
              },
            ]}
            data={users?.slice(0, 5) || []}
          />
        </Card>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab({ users, onEditUser, onViewUser }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => {
    let arr = users || [];
    if (filter !== "all") arr = arr.filter((u) => u.status === filter);
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(s),
      );
    }
    return arr;
  }, [users, filter, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: C.input,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "9px 14px",
              color: C.text,
              outline: "none",
              minWidth: 240,
            }}
          />
          <Select
            label=""
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
              { value: "banned", label: "Banned" },
            ]}
          />
        </div>
        <Btn variant="primary" onClick={() => onEditUser({})}>
          + Create User
        </Btn>
      </div>
      <Card noPadding>
        <Table
          columns={[
            {
              key: "name",
              label: "User",
              render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={`${r.firstName} ${r.lastName}`} size={32} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {r.firstName} {r.lastName}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {r.email}
                    </div>
                  </div>
                </div>
              ),
            },
            { key: "country", label: "Country" },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "kycStatus",
              label: "KYC",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "createdAt",
              label: "Joined",
              render: (v) => new Date(v).toLocaleDateString(),
            },
            {
              key: "actions",
              label: "Actions",
              render: (_, r) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewUser(r);
                    }}
                  >
                    View
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditUser(r);
                    }}
                  >
                    Edit
                  </Btn>
                </div>
              ),
            },
          ]}
          data={filtered}
          onRowClick={onViewUser}
        />
      </Card>
    </div>
  );
}

// Trading Accounts Tab
function AccountsTab({ accounts, onCreateAccount, onViewAccount }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="primary" onClick={onCreateAccount}>
          + Create Account
        </Btn>
      </div>
      <Card noPadding>
        <Table
          columns={[
            {
              key: "accountNumber",
              label: "Account",
              render: (v) => (
                <span style={{ fontFamily: FF.mono, color: C.gold }}>{v}</span>
              ),
            },
            {
              key: "user",
              label: "User",
              render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.userName} size={32} />
                  <div style={{ fontSize: 13 }}>{r.userName}</div>
                </div>
              ),
            },
            { key: "accountType", label: "Type" },
            { key: "accountTier", label: "Tier" },
            {
              key: "balance",
              label: "Balance",
              render: (v) => (
                <span style={{ fontFamily: FF.mono }}>{formatUSD(v)}</span>
              ),
            },
            {
              key: "equity",
              label: "Equity",
              render: (v) => (
                <span style={{ fontFamily: FF.mono }}>{formatUSD(v)}</span>
              ),
            },
            {
              key: "leverage",
              label: "Leverage",
              render: (v) => <span style={{ fontFamily: FF.mono }}>1:{v}</span>,
            },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "actions",
              label: "Actions",
              render: (_, r) => (
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewAccount(r);
                  }}
                >
                  Manage
                </Btn>
              ),
            },
          ]}
          data={accounts || []}
          onRowClick={onViewAccount}
        />
      </Card>
    </div>
  );
}

// KYC Tab
function KycTab({ kycRecords, onReviewKyc }) {
  const [filter, setFilter] = useState("pending");
  const filtered = useMemo(
    () => kycRecords?.filter((k) => k.status === filter) || [],
    [kycRecords, filter],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              background: filter === f ? C.goldSub : C.bg3,
              color: filter === f ? C.gold : C.textMuted,
              border: `1px solid ${filter === f ? C.gold : C.border}`,
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: FF.sans,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <Card noPadding>
        <Table
          columns={[
            {
              key: "user",
              label: "User",
              render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.userName} size={32} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {r.userName}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {r.email}
                    </div>
                  </div>
                </div>
              ),
            },
            { key: "documentType", label: "Doc Type" },
            {
              key: "submittedAt",
              label: "Submitted",
              render: (v) => new Date(v).toLocaleString(),
            },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "actions",
              label: "Actions",
              render: (_, r) => (
                <Btn
                  size="sm"
                  variant="teal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewKyc(r);
                  }}
                >
                  Review
                </Btn>
              ),
            },
          ]}
          data={filtered}
          onRowClick={onReviewKyc}
        />
      </Card>
    </div>
  );
}

// Deposits Tab
function DepositsTab({ deposits, onUpdateDeposit }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = useMemo(() => {
    if (statusFilter === "all") return deposits || [];
    return deposits?.filter((d) => d.status === statusFilter) || [];
  }, [deposits, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["all", "pending", "completed", "failed", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "8px 16px",
              background: statusFilter === s ? C.tealSub : C.bg3,
              color: statusFilter === s ? C.teal : C.textMuted,
              border: `1px solid ${statusFilter === s ? C.teal : C.border}`,
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: FF.sans,
              fontSize: 13,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <Card noPadding>
        <Table
          columns={[
            { key: "id", label: "ID", mono: true },
            {
              key: "user",
              label: "User",
              render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.userName} size={28} />
                  <div>
                    <div style={{ fontSize: 13 }}>{r.userName}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {r.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              render: (v) => (
                <span style={{ fontFamily: FF.mono, color: C.green }}>
                  {formatUSD(v)}
                </span>
              ),
            },
            { key: "method", label: "Method" },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "createdAt",
              label: "Date",
              render: (v) => new Date(v).toLocaleString(),
            },
            {
              key: "actions",
              label: "Actions",
              render: (_, r) =>
                r.status === "pending" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      size="sm"
                      variant="teal"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateDeposit(r, "completed");
                      }}
                    >
                      Approve
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateDeposit(r, "rejected");
                      }}
                    >
                      Reject
                    </Btn>
                  </div>
                ) : null,
            },
          ]}
          data={filtered}
        />
      </Card>
    </div>
  );
}

// Withdrawals Tab
function WithdrawalsTab({ withdrawals, onUpdateWithdrawal }) {
  const [statusFilter, setStatusFilter] = useState("pending");
  const filtered = useMemo(
    () =>
      withdrawals?.filter(
        (w) => statusFilter === "all" || w.status === statusFilter,
      ) || [],
    [withdrawals, statusFilter],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          "pending",
          "approved",
          "processing",
          "completed",
          "rejected",
          "failed",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "8px 16px",
              background: statusFilter === s ? C.goldSub : C.bg3,
              color: statusFilter === s ? C.gold : C.textMuted,
              border: `1px solid ${statusFilter === s ? C.gold : C.border}`,
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: FF.sans,
              fontSize: 13,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <Card noPadding>
        <Table
          columns={[
            { key: "id", label: "ID", mono: true },
            {
              key: "user",
              label: "User",
              render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.userName} size={28} />
                  <div>
                    <div style={{ fontSize: 13 }}>{r.userName}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {r.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              render: (v) => (
                <span style={{ fontFamily: FF.mono, color: C.red }}>
                  -{formatUSD(v)}
                </span>
              ),
            },
            { key: "method", label: "Method" },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "createdAt",
              label: "Date",
              render: (v) => new Date(v).toLocaleString(),
            },
            {
              key: "actions",
              label: "Actions",
              render: (_, r) =>
                ["pending", "approved"].includes(r.status) ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      size="sm"
                      variant="teal"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateWithdrawal(r, "processing");
                      }}
                    >
                      Process
                    </Btn>
                    <Btn
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateWithdrawal(r, "completed");
                      }}
                    >
                      Mark Paid
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateWithdrawal(r, "rejected");
                      }}
                    >
                      Reject
                    </Btn>
                  </div>
                ) : null,
            },
          ]}
          data={filtered}
        />
      </Card>
    </div>
  );
}

// Transfers Tab
function TransfersTab({ transfers }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card noPadding>
        <Table
          columns={[
            { key: "id", label: "ID", mono: true },
            {
              key: "from",
              label: "From",
              render: (_, r) => (
                <span style={{ fontFamily: FF.mono }}>{r.fromAccount}</span>
              ),
            },
            {
              key: "to",
              label: "To",
              render: (_, r) => (
                <span style={{ fontFamily: FF.mono }}>{r.toAccount}</span>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              render: (v) => (
                <span style={{ fontFamily: FF.mono }}>{formatUSD(v)}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "createdAt",
              label: "Date",
              render: (v) => new Date(v).toLocaleString(),
            },
          ]}
          data={transfers || []}
        />
      </Card>
    </div>
  );
}

// Positions Tab
function PositionsTab({ positions }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card noPadding>
        <Table
          columns={[
            { key: "id", label: "ID", mono: true },
            {
              key: "account",
              label: "Account",
              render: (v) => (
                <span style={{ fontFamily: FF.mono, color: C.gold }}>{v}</span>
              ),
            },
            { key: "symbol", label: "Symbol" },
            { key: "type", label: "Type" },
            { key: "volume", label: "Volume", mono: true },
            { key: "openPrice", label: "Open", mono: true },
            { key: "currentPrice", label: "Current", mono: true },
            {
              key: "pnl",
              label: "P&L",
              render: (v) => (
                <span
                  style={{
                    fontFamily: FF.mono,
                    color: v >= 0 ? C.green : C.red,
                  }}
                >
                  {v >= 0 ? "+" : ""}
                  {formatUSD(v)}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
          ]}
          data={positions || []}
        />
      </Card>
    </div>
  );
}

// Instruments Tab
function InstrumentsTab({ instruments, onEditInstrument }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="primary" onClick={() => onEditInstrument({})}>
          + Add Instrument
        </Btn>
      </div>
      <Card noPadding>
        <Table
          columns={[
            {
              key: "symbol",
              label: "Symbol",
              render: (v) => (
                <span
                  style={{
                    fontFamily: FF.mono,
                    color: C.gold,
                    fontWeight: 700,
                  }}
                >
                  {v}
                </span>
              ),
            },
            { key: "displayName", label: "Name" },
            { key: "category", label: "Category" },
            { key: "spread", label: "Spread", mono: true },
            { key: "commissionPerLot", label: "Comm/Lot", mono: true },
            { key: "marginPercent", label: "Margin %", mono: true },
            {
              key: "isActive",
              label: "Status",
              render: (v) => (
                <Badge status={v ? "active" : "suspended"}>
                  {v ? "Active" : "Inactive"}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (_, r) => (
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditInstrument(r);
                  }}
                >
                  Edit
                </Btn>
              ),
            },
          ]}
          data={instruments || []}
        />
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab({ settings, onSaveSettings }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings)
      setForm(Object.fromEntries(settings.map((s) => [s.key, s.value])));
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await onSaveSettings(form);
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <Card title="System Settings">
        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div>
              <div
                style={{ fontFamily: FF.sans, color: C.text, fontWeight: 500 }}
              >
                Maintenance Mode
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                Put platform in maintenance
              </div>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.maintenance_mode === "true"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maintenance_mode: e.target.checked ? "true" : "false",
                  })
                }
              />
              <span style={{ color: C.text }}>Enabled</span>
            </label>
          </div>
          <Input
            label="Max Withdrawal / Day (USD)"
            value={form.max_withdrawal_per_day || ""}
            onChange={(v) => setForm({ ...form, max_withdrawal_per_day: v })}
          />
          <Input
            label="Min Withdrawal (USD)"
            value={form.min_withdrawal || ""}
            onChange={(v) => setForm({ ...form, min_withdrawal: v })}
          />
          <Input
            label="Min Deposit (Card, USD)"
            value={form.min_deposit_card || ""}
            onChange={(v) => setForm({ ...form, min_deposit_card: v })}
          />
          <Input
            label="Default Leverage"
            value={form.default_leverage || ""}
            onChange={(v) => setForm({ ...form, default_leverage: v })}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div>
              <div
                style={{ fontFamily: FF.sans, color: C.text, fontWeight: 500 }}
              >
                KYC for Deposit
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                Require KYC before first deposit
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.kyc_required_for_deposit === "true"}
              onChange={(e) =>
                setForm({
                  ...form,
                  kyc_required_for_deposit: e.target.checked ? "true" : "false",
                })
              }
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
            }}
          >
            <div>
              <div
                style={{ fontFamily: FF.sans, color: C.text, fontWeight: 500 }}
              >
                KYC for Withdrawal
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                Require KYC before withdrawal
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.kyc_required_for_withdrawal === "true"}
              onChange={(e) =>
                setForm({
                  ...form,
                  kyc_required_for_withdrawal: e.target.checked
                    ? "true"
                    : "false",
                })
              }
            />
          </div>
        </div>
        <div
          style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}
        >
          <Btn variant="teal" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// User Detail Modal
function UserDetailModal({
  user,
  accounts,
  deposits,
  withdrawals,
  kycRecords,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateKycStatus,
  onApproveKyc,
  onRejectKyc,
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  if (!isOpen || !user) return null;
  const userKyc =
    user.kycDocuments?.[0] || kycRecords?.find((k) => k.userId === user.id);
  const userDeposits = deposits?.filter((d) => d.userId === user.id) || [];
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`User: ${user.firstName} ${user.lastName}`}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
            Email
          </div>
          <div style={{ fontFamily: FF.mono, color: C.text }}>{user.email}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
            Status
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge status={user.status} />
            <Select
              value={user.status}
              onChange={(v) => onUpdateStatus(user.id, v)}
              options={[
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "suspended", label: "Suspended" },
                { value: "banned", label: "Banned" },
              ]}
            />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
            KYC
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge status={user.kycStatus} />
            <Select
              value={user.kycStatus}
              onChange={(v) => onUpdateKycStatus(user.id, v)}
              options={[
                { value: "not_submitted", label: "Not Submitted" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
            Country
          </div>
          <div style={{ color: C.text }}>{user.country || "-"}</div>
        </div>
      </div>
      {/* KYC Section */}
      {userKyc && (
        <Card title="KYC Documents" style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}
              >
                Document Type
              </div>
              <div style={{ color: C.text }}>{userKyc.documentType}</div>
            </div>
            <div>
              <div
                style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}
              >
                Document Number
              </div>
              <div style={{ fontFamily: FF.mono, color: C.text }}>
                {userKyc.documentNumber}
              </div>
            </div>
            <div>
              <div
                style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}
              >
                Submitted At
              </div>
              <div style={{ color: C.text }}>
                {new Date(userKyc.submittedAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div
                style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}
              >
                Status
              </div>
              <Badge status={userKyc.status} />
            </div>
          </div>
          {/* Document Preview Placeholder */}
          <div
            style={{
              border: `2px dashed ${C.border}`,
              borderRadius: 10,
              padding: 48,
              textAlign: "center",
              color: C.textMuted,
              marginBottom: 16,
            }}
          >
            📄 Document Preview (Click to view)
          </div>
          {/* KYC Actions */}
          {userKyc.status === "pending" && (
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              {showRejectInput && (
                <Input
                  label="Rejection Reason"
                  value={rejectReason}
                  onChange={setRejectReason}
                  placeholder="Enter reason for rejection"
                />
              )}
              <div
                style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
              >
                {!showRejectInput ? (
                  <Btn
                    variant="danger"
                    onClick={() => setShowRejectInput(true)}
                  >
                    Reject KYC
                  </Btn>
                ) : (
                  <>
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        setShowRejectInput(false);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </Btn>
                    <Btn
                      variant="danger"
                      onClick={() => {
                        if (rejectReason.trim()) {
                          onRejectKyc(userKyc.id, rejectReason);
                          setShowRejectInput(false);
                          setRejectReason("");
                        } else {
                          alert("Please enter a rejection reason");
                        }
                      }}
                    >
                      Confirm Reject
                    </Btn>
                  </>
                )}
                <Btn variant="teal" onClick={() => onApproveKyc(userKyc.id)}>
                  Approve KYC
                </Btn>
              </div>
            </div>
          )}
        </Card>
      )}
      {/* Deposits Section */}
      <Card title="Deposits" noPadding style={{ marginBottom: 24 }}>
        <Table
          columns={[
            { key: "id", label: "ID", mono: true },
            {
              key: "amount",
              label: "Amount",
              render: (v) => (
                <span style={{ fontFamily: FF.mono, color: C.green }}>
                  {formatUSD(v)}
                </span>
              ),
            },
            { key: "method", label: "Method" },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
            {
              key: "createdAt",
              label: "Date",
              render: (v) => new Date(v).toLocaleString(),
            },
          ]}
          data={userDeposits}
        />
      </Card>
      {/* Trading Accounts */}
      <Card title="Trading Accounts" noPadding style={{ marginBottom: 24 }}>
        <Table
          columns={[
            {
              key: "accountNumber",
              label: "Account",
              render: (v) => (
                <span style={{ fontFamily: FF.mono, color: C.gold }}>{v}</span>
              ),
            },
            { key: "accountType", label: "Type" },
            {
              key: "balance",
              label: "Balance",
              render: (v) => (
                <span style={{ fontFamily: FF.mono }}>{formatUSD(v)}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (v) => <Badge status={v} />,
            },
          ]}
          data={accounts?.filter((a) => a.userId === user.id) || []}
        />
      </Card>
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        <Btn variant="ghost" onClick={onClose}>
          Close
        </Btn>
      </div>
    </Modal>
  );
}

// Edit User Modal
function EditUserModal({ user, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const isNew = !user?.id;

  useEffect(() => {
    if (user) setForm({ ...user });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? "Create User" : "Edit User"}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="First Name"
          value={form.firstName || ""}
          onChange={(v) => setForm({ ...form, firstName: v })}
        />
        <Input
          label="Last Name"
          value={form.lastName || ""}
          onChange={(v) => setForm({ ...form, lastName: v })}
        />
        <Input
          label="Email"
          value={form.email || ""}
          onChange={(v) => setForm({ ...form, email: v })}
          type="email"
        />
        {isNew && (
          <Input
            label="Password"
            value={form.password || ""}
            onChange={(v) => setForm({ ...form, password: v })}
            type="password"
          />
        )}
        <Select
          label="Role"
          value={form.role || "trader"}
          onChange={(v) => setForm({ ...form, role: v })}
          options={[
            { value: "trader", label: "Trader" },
            { value: "super_admin", label: "Super Admin" },
            { value: "compliance", label: "Compliance" },
            { value: "finance", label: "Finance" },
            { value: "support", label: "Support" },
          ]}
        />
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <Btn variant="ghost" onClick={onClose} type="button">
            Cancel
          </Btn>
          <Btn variant="primary" disabled={loading} type="submit">
            {isNew ? "Create" : "Save"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// KYC Review Modal
function KycReviewModal({ kyc, isOpen, onClose, onApprove, onReject }) {
  const [note, setNote] = useState("");
  if (!isOpen || !kyc) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="KYC Review">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Avatar name={kyc.userName} size={48} />
        <div>
          <div style={{ color: C.text, fontWeight: 600 }}>{kyc.userName}</div>
          <div style={{ color: C.textMuted, fontSize: 12 }}>{kyc.email}</div>
        </div>
      </div>
      <div
        style={{
          background: C.bg3,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
              Document Type
            </div>
            <div style={{ color: C.text }}>{kyc.documentType}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
              Document Number
            </div>
            <div style={{ color: C.text, fontFamily: FF.mono }}>
              {kyc.documentNumber}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
              Submitted
            </div>
            <div style={{ color: C.text }}>
              {new Date(kyc.submittedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>
            Document Preview
          </div>
          <div
            style={{
              border: `2px dashed ${C.border}`,
              borderRadius: 8,
              padding: 48,
              textAlign: "center",
              color: C.textMuted,
            }}
          >
            📄 Document Image (Click to view)
          </div>
        </div>
      </div>
      <Input
        label="Internal Note (Optional)"
        value={note}
        onChange={setNote}
        placeholder="Reason for decision..."
      />
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn variant="danger" onClick={() => onReject(kyc.id, note)}>
          Reject
        </Btn>
        <Btn variant="teal" onClick={() => onApprove(kyc.id, note)}>
          Approve
        </Btn>
      </div>
    </Modal>
  );
}

// Edit Instrument Modal
function EditInstrumentModal({ instrument, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const isNew = !instrument?.id;

  useEffect(() => {
    if (instrument) setForm({ ...instrument });
  }, [instrument]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? "Add Instrument" : "Edit Instrument"}
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Input
            label="Symbol"
            value={form.symbol || ""}
            onChange={(v) => setForm({ ...form, symbol: v })}
            placeholder="EURUSD"
          />
          <Input
            label="Display Name"
            value={form.displayName || ""}
            onChange={(v) => setForm({ ...form, displayName: v })}
            placeholder="Euro/US Dollar"
          />
          <Select
            label="Category"
            value={form.category || "forex"}
            onChange={(v) => setForm({ ...form, category: v })}
            options={[
              { value: "forex", label: "Forex" },
              { value: "crypto", label: "Crypto" },
              { value: "commodities", label: "Commodities" },
              { value: "indices", label: "Indices" },
              { value: "stocks", label: "Stocks" },
            ]}
          />
          <Input
            label="Base Currency"
            value={form.baseCurrency || ""}
            onChange={(v) => setForm({ ...form, baseCurrency: v })}
            placeholder="EUR"
          />
          <Input
            label="Quote Currency"
            value={form.quoteCurrency || ""}
            onChange={(v) => setForm({ ...form, quoteCurrency: v })}
            placeholder="USD"
          />
          <Input
            label="Spread"
            value={form.spread || ""}
            onChange={(v) => setForm({ ...form, spread: parseFloat(v) })}
            type="number"
          />
          <Input
            label="Commission / Lot"
            value={form.commissionPerLot || ""}
            onChange={(v) =>
              setForm({ ...form, commissionPerLot: parseFloat(v) })
            }
            type="number"
          />
          <Input
            label="Margin %"
            value={form.marginPercent || ""}
            onChange={(v) => setForm({ ...form, marginPercent: parseFloat(v) })}
            type="number"
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
          }}
        >
          <input
            type="checkbox"
            id="active"
            checked={form.isActive !== false}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <label htmlFor="active" style={{ color: C.text, cursor: "pointer" }}>
            Instrument Active
          </label>
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <Btn variant="ghost" onClick={onClose} type="button">
            Cancel
          </Btn>
          <Btn variant="primary" disabled={loading} type="submit">
            {isNew ? "Create" : "Save"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// Main App Container
export default function AdminDashboard() {
  const { admin, isLoading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [kycRecords, setKycRecords] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [settings, setSettings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [userDetail, setUserDetail] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [kycReview, setKycReview] = useState(null);
  const [editInstrument, setEditInstrument] = useState(null);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      const [
        statsData,
        usersData,
        instrumentsData,
        kycData,
        transactionsData,
        tradingAccountsData,
        openPositionsData,
        settingsData,
      ] = await Promise.allSettled([
        adminApi.getDashboardStats(),
        adminApi.getUsers(),
        adminApi.getInstruments(),
        adminApi.getKycQueue(),
        adminApi.getTransactions(),
        adminApi.getTradingAccounts(),
        adminApi.getOpenPositions(),
        adminApi.getSettings(),
      ]);

      // Process each result with defaults if fulfilled
      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (usersData.status === "fulfilled")
        setUsers(usersData.value.users || []);
      if (instrumentsData.status === "fulfilled")
        setInstruments(instrumentsData.value.instruments || []);

      // Map KYC data
      if (kycData.status === "fulfilled") {
        const mappedKyc = (kycData.value.docs || []).map((doc) => ({
          ...doc,
          userName: `${doc.user.firstName} ${doc.user.lastName}`,
          email: doc.user.email,
        }));
        setKycRecords(mappedKyc);
      }

      // Map transactions to deposits/withdrawals
      if (transactionsData.status === "fulfilled") {
        const allTransactions = transactionsData.value.transactions || [];
        setDeposits(
          allTransactions
            .filter((t) => t.type === "deposit")
            .map((t) => ({
              ...t,
              userName: `${t.user.firstName} ${t.user.lastName}`,
              email: t.user.email,
            })),
        );
        setWithdrawals(
          allTransactions
            .filter((t) => t.type === "withdrawal")
            .map((t) => ({
              ...t,
              userName: `${t.user.firstName} ${t.user.lastName}`,
              email: t.user.email,
            })),
        );
      }

      // Map trading accounts
      if (tradingAccountsData.status === "fulfilled") {
        const mappedAccounts = (tradingAccountsData.value.accounts || []).map(
          (acc) => ({
            ...acc,
            userName: `${acc.user.firstName} ${acc.user.lastName}`,
          }),
        );
        setAccounts(mappedAccounts);
      }

      // Map open positions
      if (openPositionsData.status === "fulfilled") {
        const mappedPositions = (openPositionsData.value.positions || []).map(
          (pos) => ({
            ...pos,
            userName: `${pos.user.firstName} ${pos.user.lastName}`,
            account: pos.account.accountNumber,
          }),
        );
        setPositions(mappedPositions);
      }

      // Settings
      if (settingsData.status === "fulfilled") {
        const settingsArr = Object.entries(settingsData.value || {}).map(
          ([key, value]) => ({
            key,
            value: String(value),
          }),
        );
        setSettings(settingsArr);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin) loadData();
  }, [admin, loadData]);

  // Handlers
  const handleUpdateUserStatus = (userId, status) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status } : u)));
  };

  const handleUpdateKycStatus = (userId, kycStatus) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, kycStatus } : u)));
  };

  const handleSaveUser = async (user) => {
    if (user.id) {
      setUsers(users.map((u) => (u.id === user.id ? { ...u, ...user } : u)));
    } else {
      const newUser = {
        ...user,
        id: `u-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "active",
        kycStatus: "not_submitted",
      };
      setUsers([newUser, ...users]);
    }
  };

  const handleUpdateDeposit = (deposit, status) => {
    setDeposits(
      deposits.map((d) => (d.id === deposit.id ? { ...d, status } : d)),
    );
  };

  const handleUpdateWithdrawal = (withdrawal, status) => {
    setWithdrawals(
      withdrawals.map((w) => (w.id === withdrawal.id ? { ...w, status } : w)),
    );
  };

  const handleApproveKyc = (kycId, note) => {
    setKycRecords(
      kycRecords.map((k) =>
        k.id === kycId ? { ...k, status: "approved" } : k,
      ),
    );
    const kyc = kycRecords.find((k) => k.id === kycId);
    if (kyc)
      setUsers(
        users.map((u) =>
          u.id === kyc.userId ? { ...u, kycStatus: "approved" } : u,
        ),
      );
    setKycReview(null);
  };

  const handleRejectKyc = (kycId, note) => {
    setKycRecords(
      kycRecords.map((k) =>
        k.id === kycId ? { ...k, status: "rejected" } : k,
      ),
    );
    const kyc = kycRecords.find((k) => k.id === kycId);
    if (kyc)
      setUsers(
        users.map((u) =>
          u.id === kyc.userId ? { ...u, kycStatus: "rejected" } : u,
        ),
      );
    setKycReview(null);
  };

  const handleSaveInstrument = async (instrument) => {
    if (instrument.id) {
      setInstruments(
        instruments.map((i) =>
          i.id === instrument.id ? { ...i, ...instrument } : i,
        ),
      );
    } else {
      const newInst = { ...instrument, id: `i-${Date.now()}`, isActive: true };
      setInstruments([newInst, ...instruments]);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    const updated = Object.entries(newSettings).map(([key, value]) => ({
      key,
      value,
    }));
    setSettings(updated);
  };

  const handleApproveUserKyc = async (kycId) => {
    try {
      await adminApi.approveKyc(kycId);
      // Update local state
      setKycRecords(
        kycRecords.map((k) =>
          k.id === kycId ? { ...k, status: "approved" } : k,
        ),
      );
      const kyc = kycRecords.find((k) => k.id === kycId);
      if (kyc) {
        setUsers(
          users.map((u) =>
            u.id === kyc.userId ? { ...u, kycStatus: "approved" } : u,
          ),
        );
        // Also update userDetail if it's the same user
        setUserDetail((prev) =>
          prev?.id === kyc.userId
            ? {
                ...prev,
                kycStatus: "approved",
                kycDocuments: prev.kycDocuments?.map((d) =>
                  d.id === kycId ? { ...d, status: "approved" } : d,
                ),
              }
            : prev,
        );
      }
      alert("KYC approved successfully!");
    } catch (err) {
      console.error("Failed to approve KYC:", err);
      alert("Failed to approve KYC: " + (err.message || "Unknown error"));
    }
  };

  const handleRejectUserKyc = async (kycId, reason) => {
    try {
      await adminApi.rejectKyc(kycId, reason);
      // Update local state
      setKycRecords(
        kycRecords.map((k) =>
          k.id === kycId ? { ...k, status: "rejected" } : k,
        ),
      );
      const kyc = kycRecords.find((k) => k.id === kycId);
      if (kyc) {
        setUsers(
          users.map((u) =>
            u.id === kyc.userId ? { ...u, kycStatus: "rejected" } : u,
          ),
        );
        // Also update userDetail if it's the same user
        setUserDetail((prev) =>
          prev?.id === kyc.userId
            ? {
                ...prev,
                kycStatus: "rejected",
                kycDocuments: prev.kycDocuments?.map((d) =>
                  d.id === kycId
                    ? { ...d, status: "rejected", rejectionReason: reason }
                    : d,
                ),
              }
            : prev,
        );
      }
      alert("KYC rejected successfully!");
    } catch (err) {
      console.error("Failed to reject KYC:", err);
      alert("Failed to reject KYC: " + (err.message || "Unknown error"));
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.textMuted,
          fontFamily: FF.sans,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar admin={admin} onLogout={logout} onRefresh={loadData} />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
        role={admin.role}
      />
      <div style={{ marginLeft: 260, paddingTop: 64, minHeight: "100vh" }}>
        <div style={{ padding: 24 }}>
          {dataLoading ? (
            <div style={{ color: C.textMuted, fontFamily: FF.sans }}>
              Loading...
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab
                  stats={stats}
                  users={users}
                  deposits={deposits}
                  withdrawals={withdrawals}
                />
              )}
              {activeTab === "users" && (
                <UsersTab
                  users={users}
                  onEditUser={setEditUser}
                  onViewUser={async (user) => {
                    try {
                      const fullUser = await adminApi.getUserById(user.id);
                      setUserDetail(fullUser);
                    } catch (err) {
                      console.error("Failed to fetch user details:", err);
                      setUserDetail(user);
                    }
                  }}
                />
              )}
              {activeTab === "accounts" && (
                <AccountsTab
                  accounts={accounts}
                  onCreateAccount={() => alert("Create account modal")}
                  onViewAccount={() => alert("View account modal")}
                />
              )}
              {activeTab === "kyc" && (
                <KycTab kycRecords={kycRecords} onReviewKyc={setKycReview} />
              )}
              {activeTab === "deposits" && (
                <DepositsTab
                  deposits={deposits}
                  onUpdateDeposit={handleUpdateDeposit}
                />
              )}
              {activeTab === "withdrawals" && (
                <WithdrawalsTab
                  withdrawals={withdrawals}
                  onUpdateWithdrawal={handleUpdateWithdrawal}
                />
              )}
              {activeTab === "transfers" && (
                <TransfersTab transfers={transfers} />
              )}
              {activeTab === "positions" && (
                <PositionsTab positions={positions} />
              )}
              {activeTab === "instruments" && (
                <InstrumentsTab
                  instruments={instruments}
                  onEditInstrument={setEditInstrument}
                />
              )}
              {activeTab === "settings" && (
                <SettingsTab
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserDetailModal
        user={userDetail}
        accounts={accounts}
        deposits={deposits}
        withdrawals={withdrawals}
        kycRecords={kycRecords}
        isOpen={!!userDetail}
        onClose={() => setUserDetail(null)}
        onUpdateStatus={handleUpdateUserStatus}
        onUpdateKycStatus={handleUpdateKycStatus}
        onApproveKyc={handleApproveUserKyc}
        onRejectKyc={handleRejectUserKyc}
      />
      <EditUserModal
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSaveUser}
      />
      <KycReviewModal
        kyc={kycReview}
        isOpen={!!kycReview}
        onClose={() => setKycReview(null)}
        onApprove={handleApproveKyc}
        onReject={handleRejectKyc}
      />
      <EditInstrumentModal
        instrument={editInstrument}
        isOpen={!!editInstrument}
        onClose={() => setEditInstrument(null)}
        onSave={handleSaveInstrument}
      />
    </div>
  );
}
